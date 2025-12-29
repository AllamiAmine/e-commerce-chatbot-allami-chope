"""
Hybrid Recommendation Model for ShopAI
Uses Matrix Factorization with SVD (no compilation required - Windows compatible)

This is a production-ready recommendation engine trained on Amazon data
"""
import numpy as np
import pandas as pd
from scipy.sparse import csr_matrix
from typing import List, Dict, Tuple, Optional, Any
from loguru import logger
import joblib
from pathlib import Path

# ML Libraries (scikit-learn only - no compilation needed)
from sklearn.decomposition import TruncatedSVD
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.metrics.pairwise import cosine_similarity
from sklearn.preprocessing import MinMaxScaler, normalize


class HybridRecommender:
    """
    Hybrid Recommendation System combining:
    1. Collaborative Filtering (SVD) - "Users who bought X also bought Y"
    2. Content-Based (TF-IDF) - "Similar products based on description"
    3. Popularity-Based - Fallback for cold-start users
    
    This version uses only scikit-learn (no compilation required on Windows)
    """
    
    def __init__(
        self,
        n_factors: int = 64,
        n_iterations: int = 30,
        regularization: float = 0.1,
    ):
        self.n_factors = n_factors
        self.n_iterations = n_iterations
        self.regularization = regularization
        
        # Models
        self.svd_model = None
        self.tfidf_vectorizer = None
        self.content_matrix = None
        
        # Learned factors
        self.user_factors = None
        self.item_factors = None
        
        # Mappings
        self.user_id_map = {}  # user_id -> matrix_index
        self.product_id_map = {}  # product_id -> matrix_index
        self.idx_to_user = {}  # matrix_index -> user_id
        self.idx_to_product = {}  # matrix_index -> product_id
        
        # Data
        self.interaction_matrix = None
        self.product_features = None
        self.popularity_scores = None
        
        # State
        self.is_trained = False
    
    def fit(
        self,
        interactions_df: pd.DataFrame,
        products_df: Optional[pd.DataFrame] = None
    ) -> 'HybridRecommender':
        """
        Train the hybrid recommendation model
        
        Args:
            interactions_df: DataFrame with columns [user_id, product_id, rating, timestamp]
            products_df: Optional DataFrame with product features [product_id, name, description, category]
        """
        logger.info("Starting model training...")
        
        # 1. Build mappings
        self._build_mappings(interactions_df)
        
        # 2. Create interaction matrix
        self.interaction_matrix = self._create_interaction_matrix(interactions_df)
        logger.info(f"Interaction matrix shape: {self.interaction_matrix.shape}")
        
        # 3. Train SVD model (Collaborative Filtering)
        self._train_svd()
        
        # 4. Build content-based features (if products provided)
        if products_df is not None and len(products_df) > 0:
            self._build_content_features(products_df)
        
        # 5. Calculate popularity scores
        self._calculate_popularity(interactions_df)
        
        self.is_trained = True
        logger.info("Model training completed!")
        
        return self
    
    def _build_mappings(self, df: pd.DataFrame):
        """Create bidirectional mappings between IDs and matrix indices"""
        unique_users = df['user_id'].unique()
        unique_products = df['product_id'].unique()
        
        self.user_id_map = {uid: idx for idx, uid in enumerate(unique_users)}
        self.product_id_map = {pid: idx for idx, pid in enumerate(unique_products)}
        self.idx_to_user = {idx: uid for uid, idx in self.user_id_map.items()}
        self.idx_to_product = {idx: pid for pid, idx in self.product_id_map.items()}
        
        logger.info(f"Mappings created: {len(self.user_id_map)} users, {len(self.product_id_map)} products")
    
    def _create_interaction_matrix(self, df: pd.DataFrame) -> csr_matrix:
        """Create sparse user-item interaction matrix"""
        rows = df['user_id'].map(self.user_id_map).values
        cols = df['product_id'].map(self.product_id_map).values
        
        # Use ratings as values
        if 'rating' in df.columns:
            values = df['rating'].values.astype(np.float32)
        else:
            values = np.ones(len(df), dtype=np.float32)
        
        matrix = csr_matrix(
            (values, (rows, cols)),
            shape=(len(self.user_id_map), len(self.product_id_map)),
            dtype=np.float32
        )
        
        return matrix
    
    def _train_svd(self):
        """Train SVD model for collaborative filtering"""
        logger.info(f"Training SVD model (n_components={self.n_factors})...")
        
        # Use TruncatedSVD for sparse matrix
        n_components = min(self.n_factors, min(self.interaction_matrix.shape) - 1)
        
        self.svd_model = TruncatedSVD(
            n_components=n_components,
            n_iter=self.n_iterations,
            random_state=42
        )
        
        # Fit and transform to get user factors
        self.user_factors = self.svd_model.fit_transform(self.interaction_matrix)
        
        # Item factors are the components (transposed)
        self.item_factors = self.svd_model.components_.T
        
        # Normalize factors for better similarity computation
        self.user_factors = normalize(self.user_factors)
        self.item_factors = normalize(self.item_factors)
        
        logger.info(f"SVD model trained. User factors: {self.user_factors.shape}, Item factors: {self.item_factors.shape}")
    
    def _build_content_features(self, products_df: pd.DataFrame):
        """Build TF-IDF features for content-based recommendations"""
        logger.info("Building content-based features...")
        
        # Only use products that are in our interaction matrix
        valid_products = set(self.product_id_map.keys())
        products_df = products_df[products_df['product_id'].isin(valid_products)].copy()
        
        if len(products_df) == 0:
            logger.warning("No matching products found for content features")
            return
        
        # Combine text features
        combined_text = products_df.apply(
            lambda row: ' '.join([
                str(row.get('name', '')),
                str(row.get('description', ''))
            ]),
            axis=1
        )
        
        # TF-IDF vectorization
        self.tfidf_vectorizer = TfidfVectorizer(
            max_features=500,
            stop_words='english',
            ngram_range=(1, 2)
        )
        
        self.content_matrix = self.tfidf_vectorizer.fit_transform(combined_text)
        self.product_features = products_df
        
        logger.info(f"Content features built: {self.content_matrix.shape}")
    
    def _calculate_popularity(self, df: pd.DataFrame):
        """Calculate popularity scores for fallback recommendations"""
        # Count interactions per product
        product_counts = df.groupby('product_id').agg({
            'user_id': 'count',
            'rating': 'mean'
        }).rename(columns={'user_id': 'interaction_count', 'rating': 'avg_rating'})
        
        # Normalize scores
        scaler = MinMaxScaler()
        if len(product_counts) > 0:
            product_counts['popularity_score'] = scaler.fit_transform(
                product_counts[['interaction_count']]
            ).flatten()
            
            # Combine with rating
            product_counts['combined_score'] = (
                0.7 * product_counts['popularity_score'] + 
                0.3 * (product_counts['avg_rating'] / 5.0)
            )
            
            self.popularity_scores = product_counts.sort_values('combined_score', ascending=False)
        else:
            self.popularity_scores = pd.DataFrame()
        
        logger.info(f"Popularity scores calculated for {len(self.popularity_scores)} products")
    
    def recommend_for_user(
        self,
        user_id: Any,
        n_recommendations: int = 10,
        filter_already_bought: bool = True
    ) -> List[Dict]:
        """
        Get personalized recommendations for a user
        
        Args:
            user_id: The user ID to get recommendations for
            n_recommendations: Number of recommendations to return
            filter_already_bought: Whether to exclude products the user already bought
            
        Returns:
            List of dicts with product_id and score
        """
        if not self.is_trained:
            raise ValueError("Model is not trained yet. Call fit() first.")
        
        # Check if user exists in training data
        if user_id not in self.user_id_map:
            logger.info(f"User {user_id} not in training data, using popularity-based recommendations")
            return self._get_popular_recommendations(n_recommendations)
        
        user_idx = self.user_id_map[user_id]
        
        try:
            # Get user vector
            user_vector = self.user_factors[user_idx]
            
            # Compute scores for all items
            scores = user_vector @ self.item_factors.T
            
            # Get items the user has already interacted with
            if filter_already_bought:
                user_items = set(self.interaction_matrix[user_idx].nonzero()[1])
            else:
                user_items = set()
            
            # Get top scoring items
            item_scores = []
            for item_idx in range(len(scores)):
                if item_idx not in user_items:
                    item_scores.append((item_idx, scores[item_idx]))
            
            # Sort by score descending
            item_scores.sort(key=lambda x: x[1], reverse=True)
            
            recommendations = []
            for item_idx, score in item_scores[:n_recommendations]:
                if item_idx in self.idx_to_product:
                    recommendations.append({
                        'product_id': self.idx_to_product[item_idx],
                        'score': float(score),
                        'strategy': 'collaborative_filtering'
                    })
            
            if not recommendations:
                return self._get_popular_recommendations(n_recommendations)
            
            return recommendations
            
        except Exception as e:
            logger.error(f"SVD recommendation failed: {e}")
            return self._get_popular_recommendations(n_recommendations)
    
    def recommend_similar_products(
        self,
        product_id: Any,
        n_recommendations: int = 5
    ) -> List[Dict]:
        """
        Get products similar to a given product
        
        Args:
            product_id: The product to find similar products for
            n_recommendations: Number of similar products to return
        """
        if not self.is_trained:
            raise ValueError("Model is not trained yet. Call fit() first.")
        
        if product_id not in self.product_id_map:
            logger.warning(f"Product {product_id} not in training data")
            return self._get_popular_recommendations(n_recommendations)
        
        product_idx = self.product_id_map[product_id]
        
        try:
            # Get item vector
            item_vector = self.item_factors[product_idx]
            
            # Compute similarity with all items
            similarities = item_vector @ self.item_factors.T
            
            # Get top similar items (excluding itself)
            item_scores = []
            for idx in range(len(similarities)):
                if idx != product_idx:
                    item_scores.append((idx, similarities[idx]))
            
            item_scores.sort(key=lambda x: x[1], reverse=True)
            
            recommendations = []
            for item_idx, score in item_scores[:n_recommendations]:
                if item_idx in self.idx_to_product:
                    recommendations.append({
                        'product_id': self.idx_to_product[item_idx],
                        'similarity': float(score),
                        'strategy': 'item_similarity'
                    })
            
            return recommendations
            
        except Exception as e:
            logger.error(f"Item similarity failed: {e}")
            return self._get_popular_recommendations(n_recommendations)
    
    def _get_popular_recommendations(self, n: int) -> List[Dict]:
        """Fallback to popularity-based recommendations"""
        if self.popularity_scores is None or len(self.popularity_scores) == 0:
            return []
        
        top_products = self.popularity_scores.head(n)
        
        return [
            {
                'product_id': pid,
                'score': float(row['combined_score']),
                'strategy': 'popularity'
            }
            for pid, row in top_products.iterrows()
        ]
    
    def get_user_embedding(self, user_id: Any) -> Optional[np.ndarray]:
        """Get the learned embedding vector for a user"""
        if user_id not in self.user_id_map:
            return None
        
        user_idx = self.user_id_map[user_id]
        return self.user_factors[user_idx]
    
    def get_product_embedding(self, product_id: Any) -> Optional[np.ndarray]:
        """Get the learned embedding vector for a product"""
        if product_id not in self.product_id_map:
            return None
        
        product_idx = self.product_id_map[product_id]
        return self.item_factors[product_idx]
    
    def save(self, path: str):
        """Save the trained model to disk"""
        path = Path(path)
        path.parent.mkdir(parents=True, exist_ok=True)
        
        model_data = {
            'svd_model': self.svd_model,
            'user_factors': self.user_factors,
            'item_factors': self.item_factors,
            'tfidf_vectorizer': self.tfidf_vectorizer,
            'content_matrix': self.content_matrix,
            'user_id_map': self.user_id_map,
            'product_id_map': self.product_id_map,
            'idx_to_user': self.idx_to_user,
            'idx_to_product': self.idx_to_product,
            'interaction_matrix': self.interaction_matrix,
            'popularity_scores': self.popularity_scores,
            'n_factors': self.n_factors,
            'is_trained': self.is_trained
        }
        
        joblib.dump(model_data, path)
        logger.info(f"Model saved to {path}")
    
    @classmethod
    def load(cls, path: str) -> 'HybridRecommender':
        """Load a trained model from disk"""
        path = Path(path)
        
        if not path.exists():
            raise FileNotFoundError(f"Model file not found: {path}")
        
        model_data = joblib.load(path)
        
        recommender = cls(n_factors=model_data.get('n_factors', 64))
        recommender.svd_model = model_data.get('svd_model')
        recommender.user_factors = model_data.get('user_factors')
        recommender.item_factors = model_data.get('item_factors')
        recommender.tfidf_vectorizer = model_data.get('tfidf_vectorizer')
        recommender.content_matrix = model_data.get('content_matrix')
        recommender.user_id_map = model_data['user_id_map']
        recommender.product_id_map = model_data['product_id_map']
        recommender.idx_to_user = model_data['idx_to_user']
        recommender.idx_to_product = model_data['idx_to_product']
        recommender.interaction_matrix = model_data['interaction_matrix']
        recommender.popularity_scores = model_data.get('popularity_scores')
        recommender.is_trained = model_data.get('is_trained', True)
        
        logger.info(f"Model loaded from {path}")
        return recommender
    
    def get_stats(self) -> Dict:
        """Get model statistics"""
        return {
            'is_trained': self.is_trained,
            'n_users': len(self.user_id_map),
            'n_products': len(self.product_id_map),
            'n_factors': self.n_factors,
            'has_content_features': self.content_matrix is not None,
            'has_popularity_scores': self.popularity_scores is not None and len(self.popularity_scores) > 0
        }


# Quick test
if __name__ == "__main__":
    import sys
    sys.path.append('..')
    from app.data.amazon_dataset import AmazonDatasetLoader
    
    # Load data
    loader = AmazonDatasetLoader()
    interactions_df, mappings = loader.load_or_generate_data(use_amazon=False)
    
    # Train model
    model = HybridRecommender(n_factors=32, n_iterations=10)
    model.fit(interactions_df)
    
    # Test recommendations
    test_user = list(model.user_id_map.keys())[0]
    recs = model.recommend_for_user(test_user, n_recommendations=5)
    
    print(f"\nRecommendations for user {test_user}:")
    for rec in recs:
        print(f"  {rec}")
    
    # Test similar products
    test_product = list(model.product_id_map.keys())[0]
    similar = model.recommend_similar_products(test_product, n_recommendations=3)
    
    print(f"\nProducts similar to {test_product}:")
    for sim in similar:
        print(f"  {sim}")
    
    # Save model
    model.save("models/test_model.joblib")
    
    # Load and verify
    loaded_model = HybridRecommender.load("models/test_model.joblib")
    print(f"\nModel stats: {loaded_model.get_stats()}")

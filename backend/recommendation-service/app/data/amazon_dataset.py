"""
Amazon Product Dataset Loader
Downloads and processes Amazon review data for training recommendations

Dataset Source: Amazon Product Reviews (publicly available)
We use the "Electronics" and "Sports and Outdoors" categories to match your e-commerce store
"""
import os
import gzip
import json
import requests
import pandas as pd
import numpy as np
from pathlib import Path
from typing import Optional, Tuple
from loguru import logger
from tqdm import tqdm

# Amazon Review Dataset URLs (Small versions for faster training)
# These are publicly available datasets
AMAZON_DATASETS = {
    "electronics": {
        "reviews": "https://jmcauley.ucsd.edu/data/amazon_v2/categoryFilesSmall/Electronics_5.json.gz",
        "metadata": "https://jmcauley.ucsd.edu/data/amazon_v2/metaFiles2/meta_Electronics.json.gz"
    },
    "sports": {
        "reviews": "https://jmcauley.ucsd.edu/data/amazon_v2/categoryFilesSmall/Sports_and_Outdoors_5.json.gz",
        "metadata": "https://jmcauley.ucsd.edu/data/amazon_v2/metaFiles2/meta_Sports_and_Outdoors.json.gz"
    }
}

# Alternative: Use sample data if download fails
SAMPLE_DATASET_SIZE = 10000


class AmazonDatasetLoader:
    """
    Loads and processes Amazon product review data for recommendation model training.
    """
    
    def __init__(self, data_dir: str = "data/amazon"):
        self.data_dir = Path(data_dir)
        self.data_dir.mkdir(parents=True, exist_ok=True)
        
    def download_file(self, url: str, filename: str) -> Path:
        """Download a file with progress bar"""
        filepath = self.data_dir / filename
        
        if filepath.exists():
            logger.info(f"File already exists: {filepath}")
            return filepath
        
        logger.info(f"Downloading {url}...")
        
        try:
            response = requests.get(url, stream=True, timeout=60)
            response.raise_for_status()
            
            total_size = int(response.headers.get('content-length', 0))
            
            with open(filepath, 'wb') as f:
                with tqdm(total=total_size, unit='B', unit_scale=True, desc=filename) as pbar:
                    for chunk in response.iter_content(chunk_size=8192):
                        f.write(chunk)
                        pbar.update(len(chunk))
            
            logger.info(f"Downloaded: {filepath}")
            return filepath
            
        except Exception as e:
            logger.error(f"Failed to download {url}: {e}")
            raise
    
    def load_json_gz(self, filepath: Path, max_lines: Optional[int] = None) -> pd.DataFrame:
        """Load gzipped JSON lines file"""
        logger.info(f"Loading {filepath}...")
        
        data = []
        with gzip.open(filepath, 'rt', encoding='utf-8') as f:
            for i, line in enumerate(tqdm(f, desc="Loading")):
                if max_lines and i >= max_lines:
                    break
                try:
                    data.append(json.loads(line.strip()))
                except json.JSONDecodeError:
                    continue
        
        df = pd.DataFrame(data)
        logger.info(f"Loaded {len(df)} records from {filepath.name}")
        return df
    
    def download_amazon_data(self, category: str = "electronics", max_reviews: int = 50000) -> Tuple[pd.DataFrame, pd.DataFrame]:
        """
        Download Amazon reviews and metadata for a category
        
        Args:
            category: 'electronics' or 'sports'
            max_reviews: Maximum number of reviews to load
            
        Returns:
            Tuple of (reviews_df, products_df)
        """
        if category not in AMAZON_DATASETS:
            raise ValueError(f"Unknown category: {category}. Choose from {list(AMAZON_DATASETS.keys())}")
        
        dataset = AMAZON_DATASETS[category]
        
        # Download reviews
        reviews_file = self.download_file(
            dataset["reviews"], 
            f"{category}_reviews.json.gz"
        )
        reviews_df = self.load_json_gz(reviews_file, max_lines=max_reviews)
        
        # Try to download metadata (optional, might be large)
        try:
            meta_file = self.download_file(
                dataset["metadata"],
                f"{category}_meta.json.gz"
            )
            products_df = self.load_json_gz(meta_file, max_lines=max_reviews)
        except Exception as e:
            logger.warning(f"Could not load metadata: {e}. Using reviews only.")
            products_df = pd.DataFrame()
        
        return reviews_df, products_df
    
    def process_reviews(self, reviews_df: pd.DataFrame) -> pd.DataFrame:
        """
        Process raw reviews into interaction format
        
        Columns needed: user_id, product_id, rating, timestamp
        """
        logger.info("Processing reviews...")
        
        # Rename columns to standard format
        column_mapping = {
            'reviewerID': 'user_id',
            'asin': 'product_id',
            'overall': 'rating',
            'unixReviewTime': 'timestamp',
            'reviewText': 'review_text',
            'summary': 'review_summary'
        }
        
        df = reviews_df.rename(columns=column_mapping)
        
        # Keep only necessary columns
        keep_cols = ['user_id', 'product_id', 'rating', 'timestamp']
        keep_cols = [c for c in keep_cols if c in df.columns]
        df = df[keep_cols].copy()
        
        # Convert timestamp
        if 'timestamp' in df.columns:
            df['timestamp'] = pd.to_datetime(df['timestamp'], unit='s', errors='coerce')
        
        # Filter users with minimum interactions
        user_counts = df['user_id'].value_counts()
        valid_users = user_counts[user_counts >= 3].index
        df = df[df['user_id'].isin(valid_users)]
        
        # Filter products with minimum interactions
        product_counts = df['product_id'].value_counts()
        valid_products = product_counts[product_counts >= 3].index
        df = df[df['product_id'].isin(valid_products)]
        
        logger.info(f"Processed {len(df)} interactions from {df['user_id'].nunique()} users and {df['product_id'].nunique()} products")
        
        return df
    
    def process_products(self, products_df: pd.DataFrame) -> pd.DataFrame:
        """
        Process product metadata
        """
        if products_df.empty:
            return pd.DataFrame()
        
        logger.info("Processing product metadata...")
        
        column_mapping = {
            'asin': 'product_id',
            'title': 'name',
            'description': 'description',
            'price': 'price',
            'category': 'categories',
            'brand': 'brand'
        }
        
        df = products_df.rename(columns=column_mapping)
        
        # Keep relevant columns
        keep_cols = ['product_id', 'name', 'description', 'price', 'categories', 'brand']
        keep_cols = [c for c in keep_cols if c in df.columns]
        df = df[keep_cols].copy()
        
        # Clean price
        if 'price' in df.columns:
            df['price'] = df['price'].replace('[\$,]', '', regex=True)
            df['price'] = pd.to_numeric(df['price'], errors='coerce')
        
        # Extract main category
        if 'categories' in df.columns:
            df['main_category'] = df['categories'].apply(
                lambda x: x[0][0] if isinstance(x, list) and len(x) > 0 and len(x[0]) > 0 else 'Unknown'
            )
        
        return df
    
    def create_interaction_matrix(self, interactions_df: pd.DataFrame) -> Tuple[np.ndarray, dict, dict]:
        """
        Create user-item interaction matrix for training
        
        Returns:
            - interaction_matrix: Sparse matrix of user-item interactions
            - user_id_map: Dict mapping original user_id to matrix index
            - product_id_map: Dict mapping original product_id to matrix index
        """
        from scipy.sparse import csr_matrix
        
        # Create mappings
        unique_users = interactions_df['user_id'].unique()
        unique_products = interactions_df['product_id'].unique()
        
        user_id_map = {uid: idx for idx, uid in enumerate(unique_users)}
        product_id_map = {pid: idx for idx, pid in enumerate(unique_products)}
        
        # Reverse mappings for inference
        idx_to_user = {idx: uid for uid, idx in user_id_map.items()}
        idx_to_product = {idx: pid for pid, idx in product_id_map.items()}
        
        # Create matrix indices
        rows = interactions_df['user_id'].map(user_id_map).values
        cols = interactions_df['product_id'].map(product_id_map).values
        
        # Use ratings as values (or 1 for implicit feedback)
        if 'rating' in interactions_df.columns:
            values = interactions_df['rating'].values.astype(np.float32)
        else:
            values = np.ones(len(interactions_df), dtype=np.float32)
        
        # Create sparse matrix
        matrix = csr_matrix(
            (values, (rows, cols)),
            shape=(len(unique_users), len(unique_products))
        )
        
        mappings = {
            'user_id_map': user_id_map,
            'product_id_map': product_id_map,
            'idx_to_user': idx_to_user,
            'idx_to_product': idx_to_product
        }
        
        logger.info(f"Created interaction matrix: {matrix.shape[0]} users x {matrix.shape[1]} products")
        
        return matrix, mappings
    
    def generate_synthetic_data(self, n_users: int = 1000, n_products: int = 200, n_interactions: int = 10000) -> pd.DataFrame:
        """
        Generate synthetic data if Amazon download fails
        Useful for testing and development
        """
        logger.info(f"Generating synthetic dataset: {n_users} users, {n_products} products, {n_interactions} interactions")
        
        np.random.seed(42)
        
        # Generate user preferences (latent factors)
        user_factors = np.random.randn(n_users, 10)
        product_factors = np.random.randn(n_products, 10)
        
        # Generate interactions based on latent factor similarity
        interactions = []
        for _ in range(n_interactions):
            user_id = np.random.randint(0, n_users)
            
            # Sample product with probability based on similarity
            similarities = user_factors[user_id] @ product_factors.T
            probs = np.exp(similarities) / np.exp(similarities).sum()
            product_id = np.random.choice(n_products, p=probs)
            
            # Generate rating based on similarity
            base_rating = 3 + similarities[product_id]
            rating = np.clip(base_rating + np.random.randn() * 0.5, 1, 5)
            
            interactions.append({
                'user_id': f'user_{user_id}',
                'product_id': f'product_{product_id}',
                'rating': round(rating, 1),
                'timestamp': pd.Timestamp.now() - pd.Timedelta(days=np.random.randint(0, 365))
            })
        
        df = pd.DataFrame(interactions)
        logger.info(f"Generated {len(df)} synthetic interactions")
        
        return df
    
    def load_or_generate_data(self, use_amazon: bool = True, category: str = "electronics") -> Tuple[pd.DataFrame, dict]:
        """
        Main method to load data for training
        
        Args:
            use_amazon: If True, try to download Amazon data. If False or download fails, use synthetic data.
            category: Amazon category to use
            
        Returns:
            Tuple of (interactions_df, mappings_dict)
        """
        cache_file = self.data_dir / "processed_interactions.parquet"
        mappings_file = self.data_dir / "mappings.json"
        
        # Check for cached data
        if cache_file.exists():
            logger.info("Loading cached processed data...")
            interactions_df = pd.read_parquet(cache_file)
            
            if mappings_file.exists():
                import json
                with open(mappings_file, 'r') as f:
                    mappings = json.load(f)
            else:
                _, mappings = self.create_interaction_matrix(interactions_df)
            
            return interactions_df, mappings
        
        # Try Amazon data
        if use_amazon:
            try:
                reviews_df, products_df = self.download_amazon_data(category, max_reviews=50000)
                interactions_df = self.process_reviews(reviews_df)
                
                if len(interactions_df) < 100:
                    raise ValueError("Not enough data after processing")
                    
            except Exception as e:
                logger.warning(f"Amazon data loading failed: {e}. Using synthetic data.")
                interactions_df = self.generate_synthetic_data()
        else:
            interactions_df = self.generate_synthetic_data()
        
        # Create mappings
        _, mappings = self.create_interaction_matrix(interactions_df)
        
        # Cache processed data
        interactions_df.to_parquet(cache_file)
        
        import json
        # Convert mappings to JSON-serializable format
        json_mappings = {
            'user_id_map': mappings['user_id_map'],
            'product_id_map': mappings['product_id_map'],
        }
        with open(mappings_file, 'w') as f:
            json.dump(json_mappings, f)
        
        logger.info(f"Data cached to {cache_file}")
        
        return interactions_df, mappings


# Test the loader
if __name__ == "__main__":
    loader = AmazonDatasetLoader()
    
    # Try to load data
    interactions_df, mappings = loader.load_or_generate_data(use_amazon=True)
    
    print(f"\nDataset Summary:")
    print(f"  Total interactions: {len(interactions_df)}")
    print(f"  Unique users: {interactions_df['user_id'].nunique()}")
    print(f"  Unique products: {interactions_df['product_id'].nunique()}")
    print(f"\nSample data:")
    print(interactions_df.head(10))



#!/usr/bin/env python3
"""
ShopAI Recommendation Model Training Pipeline

This script:
1. Downloads and processes Amazon dataset (or uses synthetic data)
2. Optionally merges with real ShopAI database orders
3. Trains the hybrid recommendation model
4. Evaluates model performance
5. Saves the trained model

Usage:
    python train.py                     # Use Amazon data
    python train.py --synthetic         # Use synthetic data only
    python train.py --include-db        # Include real database orders
    python train.py --evaluate          # Run evaluation metrics
"""
import os
import sys
import argparse
from pathlib import Path
from datetime import datetime

import numpy as np
import pandas as pd
from loguru import logger

# Add app to path
sys.path.insert(0, str(Path(__file__).parent))

from config import settings
from app.data.amazon_dataset import AmazonDatasetLoader
from app.data.database import DatabaseLoader
from app.models.recommender import HybridRecommender


def setup_logging():
    """Configure logging"""
    log_dir = Path("logs")
    log_dir.mkdir(exist_ok=True)
    
    logger.add(
        log_dir / f"training_{datetime.now().strftime('%Y%m%d_%H%M%S')}.log",
        rotation="10 MB",
        level="INFO"
    )


def load_amazon_data(category: str = "electronics", max_reviews: int = 50000) -> pd.DataFrame:
    """Load and process Amazon dataset"""
    loader = AmazonDatasetLoader(data_dir=settings.DATASET_DIR)
    
    try:
        interactions_df, _ = loader.load_or_generate_data(
            use_amazon=True, 
            category=category
        )
        return interactions_df
    except Exception as e:
        logger.error(f"Failed to load Amazon data: {e}")
        logger.info("Falling back to synthetic data")
        return loader.generate_synthetic_data(
            n_users=2000,
            n_products=500,
            n_interactions=30000
        )


def load_synthetic_data() -> pd.DataFrame:
    """Generate synthetic training data"""
    loader = AmazonDatasetLoader(data_dir=settings.DATASET_DIR)
    return loader.generate_synthetic_data(
        n_users=2000,
        n_products=500,
        n_interactions=30000
    )


def load_database_data() -> pd.DataFrame:
    """Load real orders from ShopAI database"""
    loader = DatabaseLoader()
    return loader.load_orders_interactions()


def merge_datasets(amazon_df: pd.DataFrame, db_df: pd.DataFrame) -> pd.DataFrame:
    """
    Merge Amazon data with real database orders
    Database orders get higher weight as they're from real users
    """
    if db_df.empty:
        logger.warning("No database data available, using Amazon data only")
        return amazon_df
    
    # Adjust database ratings to weight more heavily
    db_df = db_df.copy()
    db_df['rating'] = db_df['rating'] * 1.5  # 50% boost for real data
    db_df['rating'] = db_df['rating'].clip(upper=5.0)
    
    # Add source column
    amazon_df['source'] = 'amazon'
    db_df['source'] = 'database'
    
    # Merge
    merged = pd.concat([amazon_df, db_df], ignore_index=True)
    
    logger.info(f"Merged dataset: {len(amazon_df)} Amazon + {len(db_df)} DB = {len(merged)} total")
    
    return merged


def evaluate_model(model: HybridRecommender, test_df: pd.DataFrame, k: int = 10) -> dict:
    """
    Evaluate model using precision@k and recall@k
    """
    logger.info(f"Evaluating model with k={k}...")
    
    # Get unique users in test set
    test_users = test_df['user_id'].unique()
    
    precisions = []
    recalls = []
    
    for user_id in test_users[:100]:  # Sample 100 users for speed
        # Get actual products the user interacted with
        actual_products = set(test_df[test_df['user_id'] == user_id]['product_id'])
        
        # Get recommendations
        try:
            recs = model.recommend_for_user(user_id, n_recommendations=k, filter_already_bought=False)
            recommended_products = set(r['product_id'] for r in recs)
            
            # Calculate metrics
            hits = len(actual_products & recommended_products)
            precision = hits / k if k > 0 else 0
            recall = hits / len(actual_products) if len(actual_products) > 0 else 0
            
            precisions.append(precision)
            recalls.append(recall)
        except:
            continue
    
    metrics = {
        'precision@k': np.mean(precisions) if precisions else 0,
        'recall@k': np.mean(recalls) if recalls else 0,
        'n_users_evaluated': len(precisions)
    }
    
    logger.info(f"Evaluation results: Precision@{k}={metrics['precision@k']:.4f}, Recall@{k}={metrics['recall@k']:.4f}")
    
    return metrics


def train_model(
    interactions_df: pd.DataFrame,
    products_df: pd.DataFrame = None,
    n_factors: int = 64,
    n_iterations: int = 30
) -> HybridRecommender:
    """Train the recommendation model"""
    logger.info(f"Training model with {len(interactions_df)} interactions...")
    
    model = HybridRecommender(
        n_factors=n_factors,
        n_iterations=n_iterations,
        regularization=settings.MODEL_REGULARIZATION
    )
    
    model.fit(interactions_df, products_df)
    
    return model


def load_mysql_data() -> pd.DataFrame:
    """Load training data directly from MySQL database"""
    loader = DatabaseLoader()
    
    # First try to load from user_interactions table
    interactions_df = loader.load_all_interactions()
    
    if interactions_df.empty:
        logger.warning("No data in MySQL, generating synthetic data...")
        amazon_loader = AmazonDatasetLoader(data_dir=settings.DATASET_DIR)
        interactions_df = amazon_loader.generate_synthetic_data(
            n_users=150,
            n_products=54,
            n_interactions=3000
        )
    
    return interactions_df


def main():
    parser = argparse.ArgumentParser(description="Train ShopAI Recommendation Model")
    parser.add_argument('--synthetic', action='store_true', help='Use synthetic data only')
    parser.add_argument('--mysql', action='store_true', help='Use MySQL database data')
    parser.add_argument('--include-db', action='store_true', help='Include real database orders')
    parser.add_argument('--evaluate', action='store_true', help='Run evaluation after training')
    parser.add_argument('--category', type=str, default='electronics', help='Amazon category to use')
    parser.add_argument('--factors', type=int, default=64, help='Number of latent factors')
    parser.add_argument('--iterations', type=int, default=30, help='Number of ALS iterations')
    parser.add_argument('--output', type=str, default=None, help='Output model path')
    
    args = parser.parse_args()
    
    setup_logging()
    logger.info("=" * 60)
    logger.info("ShopAI Recommendation Model Training Pipeline")
    logger.info("=" * 60)
    
    # 1. Load data
    logger.info("\n📊 Step 1: Loading data...")
    
    if args.mysql:
        logger.info("Loading data from MySQL database...")
        interactions_df = load_mysql_data()
    elif args.synthetic:
        interactions_df = load_synthetic_data()
    else:
        interactions_df = load_amazon_data(category=args.category)
    
    # Optionally merge with database data
    if args.include_db and not args.mysql:
        db_df = load_database_data()
        interactions_df = merge_datasets(interactions_df, db_df)
    
    logger.info(f"Dataset statistics:")
    logger.info(f"  - Total interactions: {len(interactions_df)}")
    logger.info(f"  - Unique users: {interactions_df['user_id'].nunique()}")
    logger.info(f"  - Unique products: {interactions_df['product_id'].nunique()}")
    logger.info(f"  - Rating distribution: min={interactions_df['rating'].min():.1f}, max={interactions_df['rating'].max():.1f}, mean={interactions_df['rating'].mean():.2f}")
    
    # 2. Split data for evaluation
    if args.evaluate:
        # Time-based split (last 20% for testing)
        if 'timestamp' in interactions_df.columns:
            interactions_df = interactions_df.sort_values('timestamp')
        
        split_idx = int(len(interactions_df) * 0.8)
        train_df = interactions_df.iloc[:split_idx]
        test_df = interactions_df.iloc[split_idx:]
        logger.info(f"Train/Test split: {len(train_df)} / {len(test_df)}")
    else:
        train_df = interactions_df
        test_df = None
    
    # 3. Train model
    logger.info("\n🧠 Step 2: Training model...")
    
    model = train_model(
        train_df,
        n_factors=args.factors,
        n_iterations=args.iterations
    )
    
    logger.info(f"Model stats: {model.get_stats()}")
    
    # 4. Evaluate
    if args.evaluate and test_df is not None:
        logger.info("\n📈 Step 3: Evaluating model...")
        metrics = evaluate_model(model, test_df, k=10)
        logger.info(f"Final metrics: {metrics}")
    
    # 5. Save model
    output_path = args.output or settings.MODEL_PATH
    logger.info(f"\n💾 Step 4: Saving model to {output_path}...")
    
    model.save(output_path)
    
    # 6. Quick test
    logger.info("\n🧪 Step 5: Quick recommendation test...")
    
    test_user = list(model.user_id_map.keys())[0]
    recs = model.recommend_for_user(test_user, n_recommendations=5)
    
    logger.info(f"Sample recommendations for user '{test_user}':")
    for i, rec in enumerate(recs, 1):
        logger.info(f"  {i}. Product: {rec['product_id']}, Score: {rec['score']:.4f}, Strategy: {rec['strategy']}")
    
    logger.info("\n✅ Training completed successfully!")
    logger.info(f"Model saved to: {output_path}")
    logger.info("You can now start the recommendation service with: python -m uvicorn app.main:app --reload --port 8085")


if __name__ == "__main__":
    main()


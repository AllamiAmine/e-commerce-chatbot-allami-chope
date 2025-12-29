import os
import sys
from pathlib import Path

sys.path.insert(0, str(Path(__file__).parent))

import pandas as pd
import mysql.connector
from loguru import logger

Path("models").mkdir(exist_ok=True)
Path("logs").mkdir(exist_ok=True)

from app.models.recommender import HybridRecommender

def load_interactions_from_db():
    print("Loading interactions from database...")
    
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='shopai_recommendations'
    )
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            user_id,
            product_id,
            CASE 
                WHEN interaction_type = 'purchase' THEN COALESCE(rating, 5.0)
                WHEN interaction_type = 'rating' THEN rating
                WHEN interaction_type = 'add_to_cart' THEN 4.0
                WHEN interaction_type = 'view' THEN 2.5
                ELSE 3.0
            END AS rating,
            created_at
        FROM user_interactions
    """)
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    df = pd.DataFrame(rows, columns=['user_id', 'product_id', 'rating', 'timestamp'])
    
    print(f"Loaded {len(df)} interactions")
    print(f"  - Users: {df['user_id'].nunique()} (IDs: {df['user_id'].min()}-{df['user_id'].max()})")
    print(f"  - Products: {df['product_id'].nunique()} (IDs: {df['product_id'].min()}-{df['product_id'].max()})")
    
    return df

def load_products_from_db():
    print("Loading products from database...")
    
    conn = mysql.connector.connect(
        host='localhost',
        user='root',
        password='',
        database='shopai_products'
    )
    
    cursor = conn.cursor()
    cursor.execute("""
        SELECT 
            id,
            name,
            COALESCE(description, '') as description,
            COALESCE(category_id, 1) as category_id
        FROM products
    """)
    
    rows = cursor.fetchall()
    cursor.close()
    conn.close()
    
    df = pd.DataFrame(rows, columns=['product_id', 'name', 'description', 'category_id'])
    
    print(f"Loaded {len(df)} products")
    print(f"Product IDs: {df['product_id'].min()} to {df['product_id'].max()}")
    return df

def main():
    print("=" * 60)
    print("  ShopAI AI Recommendation Model Training")
    print("=" * 60)
    print()
    
    interactions_df = load_interactions_from_db()
    products_df = load_products_from_db()
    
    if len(interactions_df) == 0:
        print("ERROR: No interactions found in database!")
        return
    
    print("\nTraining AI model...")
    model = HybridRecommender(n_factors=32, n_iterations=20)
    model.fit(interactions_df, products_df)
    
    model_path = "models/recommender_model.joblib"
    model.save(model_path)
    print(f"\nModel saved to: {model_path}")
    
    print("\n" + "=" * 60)
    print("  Testing Recommendations")
    print("=" * 60)
    
    test_user = list(model.user_id_map.keys())[0]
    user_recs = model.recommend_for_user(test_user, n_recommendations=5)
    
    print(f"\nTop 5 recommendations for user {test_user}:")
    for i, rec in enumerate(user_recs, 1):
        print(f"  {i}. Product ID: {rec['product_id']}, Score: {rec['score']:.4f}")
    
    # Test popular products
    popular = model._get_popular_recommendations(5)
    print(f"\nTop 5 popular products:")
    for i, rec in enumerate(popular, 1):
        print(f"  {i}. Product ID: {rec['product_id']}, Score: {rec['score']:.4f}")
    
    # Test similar products
    test_product = list(model.product_id_map.keys())[0]
    similar = model.recommend_similar_products(test_product, n_recommendations=3)
    
    print(f"\nProducts similar to product {test_product}:")
    for i, rec in enumerate(similar, 1):
        print(f"  {i}. Product ID: {rec['product_id']}, Similarity: {rec['similarity']:.4f}")
    
    print("\n" + "=" * 60)
    print("  Model Statistics")
    print("=" * 60)
    stats = model.get_stats()
    for key, value in stats.items():
        print(f"  {key}: {value}")
    
    print("\n✅ Training complete! The model is ready for use.")
    print("   Start the API with: python -m uvicorn app.main:app --port 8085")

if __name__ == "__main__":
    main()


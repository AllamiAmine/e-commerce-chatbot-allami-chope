"""
Initialize the recommendation database with sample user interactions
This creates synthetic data for training the AI recommendation model
"""

import mysql.connector
import random
from datetime import datetime, timedelta
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

# Configuration
MYSQL_CONFIG = {
    'host': os.getenv('MYSQL_HOST', 'localhost'),
    'port': int(os.getenv('MYSQL_PORT', 3306)),
    'user': os.getenv('MYSQL_USER', 'root'),
    'password': os.getenv('MYSQL_PASSWORD', ''),
}

# Product IDs that exist in the products table (from data.sql)
PRODUCT_IDS = list(range(1, 55))  # Products 1-54

# Category preferences for different user types
USER_PREFERENCES = {
    'tech_lover': {
        'categories': [1, 8, 6],  # Electronics, Audio, Gaming
        'products': [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 12, 13, 14, 43, 44, 45],
        'weight': 0.8
    },
    'home_decorator': {
        'categories': [3, 2],  # Smart Home, Accessories
        'products': [25, 26, 27, 28, 29, 30, 18, 23, 24],
        'weight': 0.7
    },
    'fashionista': {
        'categories': [4],  # Fashion
        'products': [31, 32, 33, 34, 35, 36],
        'weight': 0.75
    },
    'fitness_enthusiast': {
        'categories': [5],  # Sports
        'products': [37, 38, 39, 40, 41, 42],
        'weight': 0.7
    },
    'photographer': {
        'categories': [7],  # Photo & Video
        'products': [49, 50, 51, 52, 53, 54],
        'weight': 0.75
    },
    'gamer': {
        'categories': [6, 1],  # Gaming, Electronics
        'products': [43, 44, 45, 46, 47, 48, 9],
        'weight': 0.8
    },
    'general': {
        'categories': list(range(1, 9)),
        'products': PRODUCT_IDS,
        'weight': 0.5
    }
}


def create_interactions_table(cursor):
    """Create the user_interactions table if it doesn't exist"""
    cursor.execute("""
        CREATE TABLE IF NOT EXISTS user_interactions (
            id INT AUTO_INCREMENT PRIMARY KEY,
            user_id INT NOT NULL,
            product_id INT NOT NULL,
            interaction_type VARCHAR(20) NOT NULL,
            rating FLOAT DEFAULT NULL,
            quantity INT DEFAULT 1,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            INDEX idx_user_id (user_id),
            INDEX idx_product_id (product_id),
            INDEX idx_interaction_type (interaction_type)
        )
    """)
    print("✅ Created user_interactions table")


def generate_user_interactions(num_users=100, interactions_per_user=20):
    """Generate synthetic user interactions"""
    interactions = []
    user_types = list(USER_PREFERENCES.keys())
    
    for user_id in range(1, num_users + 1):
        # Assign user type with some randomness
        user_type = random.choices(
            user_types,
            weights=[1, 1, 1, 1, 1, 1, 2]  # More 'general' users
        )[0]
        
        prefs = USER_PREFERENCES[user_type]
        
        # Number of interactions varies per user
        num_interactions = random.randint(5, interactions_per_user)
        
        for _ in range(num_interactions):
            # Choose product based on preferences
            if random.random() < prefs['weight']:
                product_id = random.choice(prefs['products'])
            else:
                product_id = random.choice(PRODUCT_IDS)
            
            # Interaction type
            interaction_type = random.choices(
                ['view', 'add_to_cart', 'purchase', 'rating'],
                weights=[50, 25, 15, 10]
            )[0]
            
            # Rating (only for rating interactions)
            rating = None
            if interaction_type == 'rating':
                # Users tend to rate products they like
                base_rating = 3.5 if product_id in prefs['products'] else 3.0
                rating = min(5.0, max(1.0, base_rating + random.gauss(0.5, 0.8)))
            
            # Quantity (for purchases)
            quantity = 1
            if interaction_type == 'purchase':
                quantity = random.choices([1, 2, 3], weights=[70, 20, 10])[0]
            
            # Random timestamp in the last 90 days
            days_ago = random.randint(0, 90)
            created_at = datetime.now() - timedelta(days=days_ago, hours=random.randint(0, 23))
            
            interactions.append({
                'user_id': user_id,
                'product_id': product_id,
                'interaction_type': interaction_type,
                'rating': rating,
                'quantity': quantity,
                'created_at': created_at
            })
    
    return interactions


def insert_interactions(cursor, interactions):
    """Insert interactions into the database"""
    insert_query = """
        INSERT INTO user_interactions 
        (user_id, product_id, interaction_type, rating, quantity, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    """
    
    for interaction in interactions:
        cursor.execute(insert_query, (
            interaction['user_id'],
            interaction['product_id'],
            interaction['interaction_type'],
            interaction['rating'],
            interaction['quantity'],
            interaction['created_at']
        ))
    
    print(f"✅ Inserted {len(interactions)} user interactions")


def main():
    print("🚀 Initializing Recommendation Database...")
    print(f"   Host: {MYSQL_CONFIG['host']}")
    print(f"   Port: {MYSQL_CONFIG['port']}")
    
    try:
        # Connect to MySQL
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        
        # Create database if not exists
        cursor.execute("CREATE DATABASE IF NOT EXISTS shopai_recommendations")
        cursor.execute("USE shopai_recommendations")
        print("✅ Connected to shopai_recommendations database")
        
        # Create tables
        create_interactions_table(cursor)
        
        # Check if data already exists
        cursor.execute("SELECT COUNT(*) FROM user_interactions")
        count = cursor.fetchone()[0]
        
        if count > 0:
            print(f"ℹ️  Database already has {count} interactions")
            response = input("Do you want to clear and regenerate? (y/n): ").strip().lower()
            if response == 'y':
                cursor.execute("TRUNCATE TABLE user_interactions")
                print("🗑️  Cleared existing interactions")
            else:
                print("Keeping existing data. Exiting...")
                return
        
        # Generate and insert interactions
        print("\n📊 Generating synthetic user interactions...")
        interactions = generate_user_interactions(
            num_users=150,
            interactions_per_user=25
        )
        
        insert_interactions(cursor, interactions)
        conn.commit()
        
        # Show statistics
        cursor.execute("SELECT COUNT(DISTINCT user_id) FROM user_interactions")
        users = cursor.fetchone()[0]
        
        cursor.execute("SELECT COUNT(DISTINCT product_id) FROM user_interactions")
        products = cursor.fetchone()[0]
        
        cursor.execute("""
            SELECT interaction_type, COUNT(*) 
            FROM user_interactions 
            GROUP BY interaction_type
        """)
        type_counts = cursor.fetchall()
        
        print("\n📈 Database Statistics:")
        print(f"   - Total Users: {users}")
        print(f"   - Products with interactions: {products}")
        print(f"   - Interaction breakdown:")
        for itype, icount in type_counts:
            print(f"     • {itype}: {icount}")
        
        print("\n✅ Database initialization complete!")
        print("   You can now train the recommendation model.")
        
    except mysql.connector.Error as e:
        print(f"❌ MySQL Error: {e}")
        sys.exit(1)
    finally:
        if 'cursor' in locals():
            cursor.close()
        if 'conn' in locals():
            conn.close()


if __name__ == "__main__":
    main()



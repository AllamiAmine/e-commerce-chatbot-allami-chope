"""
Database Loader for ShopAI
Loads real user interactions from MySQL database
"""
import pandas as pd
import mysql.connector
from mysql.connector import Error
from typing import Optional, Tuple
from loguru import logger
import sys
sys.path.append('..')
from config import settings


class DatabaseLoader:
    """
    Loads interaction data from ShopAI MySQL databases
    """
    
    def __init__(self):
        self.db_config = {
            'host': settings.DB_HOST,
            'port': settings.DB_PORT,
            'user': settings.DB_USER,
            'password': settings.DB_PASSWORD,
        }
    
    def get_connection(self, database: str):
        """Get MySQL connection"""
        try:
            config = {**self.db_config, 'database': database}
            conn = mysql.connector.connect(**config)
            return conn
        except Error as e:
            logger.error(f"Database connection failed: {e}")
            return None
    
    def load_orders_interactions(self) -> pd.DataFrame:
        """
        Load purchase interactions from orders database
        
        Returns DataFrame with columns: user_id, product_id, rating (implicit=5), timestamp
        """
        conn = self.get_connection(settings.DB_NAME_ORDERS)
        
        if conn is None:
            logger.warning("Could not connect to orders database")
            return pd.DataFrame()
        
        try:
            query = """
            SELECT 
                o.userId AS user_id,
                oi.productId AS product_id,
                5.0 AS rating,
                oi.quantity AS quantity,
                o.created_at AS timestamp
            FROM orders o
            JOIN order_items oi ON o.id = oi.order_id
            WHERE o.status != 'CANCELLED'
            ORDER BY o.created_at DESC
            """
            
            df = pd.read_sql(query, conn)
            conn.close()
            
            # Weight by quantity
            df['rating'] = df['rating'] * (1 + 0.1 * (df['quantity'] - 1))
            df['rating'] = df['rating'].clip(upper=5.0)
            
            logger.info(f"Loaded {len(df)} purchase interactions from database")
            return df[['user_id', 'product_id', 'rating', 'timestamp']]
            
        except Exception as e:
            logger.error(f"Failed to load orders: {e}")
            if conn:
                conn.close()
            return pd.DataFrame()

    def load_user_interactions(self) -> pd.DataFrame:
        """
        Load all user interactions from shopai_recommendations database
        This includes views, add_to_cart, purchases, and ratings
        """
        try:
            config = {**self.db_config, 'database': 'shopai_recommendations'}
            conn = mysql.connector.connect(**config)
        except Error as e:
            logger.warning(f"Could not connect to recommendations database: {e}")
            return pd.DataFrame()
        
        try:
            query = """
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
                quantity,
                created_at AS timestamp,
                interaction_type
            FROM user_interactions
            ORDER BY created_at DESC
            """
            
            df = pd.read_sql(query, conn)
            conn.close()
            
            # Adjust rating by quantity for purchases
            df.loc[df['interaction_type'] == 'purchase', 'rating'] = \
                df.loc[df['interaction_type'] == 'purchase', 'rating'] * (1 + 0.1 * (df['quantity'] - 1))
            df['rating'] = df['rating'].clip(upper=5.0)
            
            logger.info(f"Loaded {len(df)} user interactions from database")
            return df[['user_id', 'product_id', 'rating', 'timestamp']]
            
        except Exception as e:
            logger.error(f"Failed to load user interactions: {e}")
            if conn:
                conn.close()
            return pd.DataFrame()

    def load_all_interactions(self) -> pd.DataFrame:
        """
        Load and combine all interactions from both orders and user_interactions tables
        """
        # Load from orders
        orders_df = self.load_orders_interactions()
        
        # Load from user_interactions
        interactions_df = self.load_user_interactions()
        
        # Combine
        if not orders_df.empty and not interactions_df.empty:
            combined = pd.concat([orders_df, interactions_df], ignore_index=True)
            # Remove duplicates (prefer orders data)
            combined = combined.drop_duplicates(subset=['user_id', 'product_id'], keep='first')
            logger.info(f"Combined interactions: {len(combined)}")
            return combined
        elif not orders_df.empty:
            return orders_df
        elif not interactions_df.empty:
            return interactions_df
        else:
            logger.warning("No interaction data found in any database")
            return pd.DataFrame()
    
    def load_products(self) -> pd.DataFrame:
        """
        Load product data from products database
        """
        conn = self.get_connection(settings.DB_NAME_PRODUCTS)
        
        if conn is None:
            logger.warning("Could not connect to products database")
            return pd.DataFrame()
        
        try:
            query = """
            SELECT 
                p.id AS product_id,
                p.name,
                p.description,
                p.price,
                p.rating,
                p.reviews,
                p.stock,
                p.sellerId AS seller_id,
                p.sellerName AS seller_name,
                c.id AS category_id,
                c.name AS category_name
            FROM products p
            LEFT JOIN categories c ON p.category_id = c.id
            """
            
            df = pd.read_sql(query, conn)
            conn.close()
            
            logger.info(f"Loaded {len(df)} products from database")
            return df
            
        except Exception as e:
            logger.error(f"Failed to load products: {e}")
            conn.close()
            return pd.DataFrame()
    
    def load_users(self) -> pd.DataFrame:
        """
        Load user data from users database
        """
        conn = self.get_connection(settings.DB_NAME_USERS)
        
        if conn is None:
            logger.warning("Could not connect to users database")
            return pd.DataFrame()
        
        try:
            query = """
            SELECT 
                id AS user_id,
                name,
                email,
                role,
                status,
                created_at
            FROM users
            WHERE status = 'ACTIVE'
            """
            
            df = pd.read_sql(query, conn)
            conn.close()
            
            logger.info(f"Loaded {len(df)} users from database")
            return df
            
        except Exception as e:
            logger.error(f"Failed to load users: {e}")
            conn.close()
            return pd.DataFrame()
    
    def get_popular_products(self, limit: int = 20) -> pd.DataFrame:
        """
        Get popular products based on order count
        Used for cold-start recommendations
        """
        conn = self.get_connection(settings.DB_NAME_ORDERS)
        
        if conn is None:
            return pd.DataFrame()
        
        try:
            query = f"""
            SELECT 
                oi.productId AS product_id,
                oi.productName AS name,
                COUNT(*) AS order_count,
                SUM(oi.quantity) AS total_quantity
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.status != 'CANCELLED'
            GROUP BY oi.productId, oi.productName
            ORDER BY order_count DESC, total_quantity DESC
            LIMIT {limit}
            """
            
            df = pd.read_sql(query, conn)
            conn.close()
            
            return df
            
        except Exception as e:
            logger.error(f"Failed to get popular products: {e}")
            return pd.DataFrame()
    
    def get_user_history(self, user_id: int) -> pd.DataFrame:
        """
        Get a specific user's purchase history
        """
        conn = self.get_connection(settings.DB_NAME_ORDERS)
        
        if conn is None:
            return pd.DataFrame()
        
        try:
            query = f"""
            SELECT 
                oi.productId AS product_id,
                oi.productName AS name,
                oi.quantity,
                oi.price,
                o.created_at AS purchase_date
            FROM order_items oi
            JOIN orders o ON oi.order_id = o.id
            WHERE o.userId = {user_id}
            AND o.status != 'CANCELLED'
            ORDER BY o.created_at DESC
            """
            
            df = pd.read_sql(query, conn)
            conn.close()
            
            return df
            
        except Exception as e:
            logger.error(f"Failed to get user history: {e}")
            return pd.DataFrame()
    
    def save_recommendations_cache(self, user_id: int, product_ids: list, scores: list):
        """
        Save recommendations to cache table (optional optimization)
        """
        # Could implement caching in Redis or MySQL for production
        pass


if __name__ == "__main__":
    loader = DatabaseLoader()
    
    # Test connections
    orders = loader.load_orders_interactions()
    products = loader.load_products()
    users = loader.load_users()
    popular = loader.get_popular_products()
    
    print(f"\nDatabase Summary:")
    print(f"  Orders interactions: {len(orders)}")
    print(f"  Products: {len(products)}")
    print(f"  Users: {len(users)}")
    print(f"  Popular products: {len(popular)}")


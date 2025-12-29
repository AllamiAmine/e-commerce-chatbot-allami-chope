"""
Complete setup and training script for the ShopAI Recommendation System
Run this to initialize the database and train the AI model
"""

import os
import sys
import subprocess

def print_header(text):
    print("\n" + "=" * 60)
    print(f"  {text}")
    print("=" * 60)

def run_command(cmd, cwd=None):
    """Run a command and return success status"""
    try:
        result = subprocess.run(cmd, shell=True, cwd=cwd, capture_output=True, text=True)
        if result.returncode != 0:
            print(f"Error: {result.stderr}")
            return False
        print(result.stdout)
        return True
    except Exception as e:
        print(f"Exception: {e}")
        return False

def main():
    print_header("ShopAI Recommendation System Setup")
    
    # Get the directory of this script
    script_dir = os.path.dirname(os.path.abspath(__file__))
    os.chdir(script_dir)
    
    print("\n📁 Working directory:", script_dir)
    
    # Step 1: Create necessary directories
    print_header("Step 1: Creating directories")
    os.makedirs("models", exist_ok=True)
    os.makedirs("logs", exist_ok=True)
    os.makedirs("data", exist_ok=True)
    os.makedirs("scripts", exist_ok=True)
    print("✅ Directories created")
    
    # Step 2: Check if virtual environment exists
    print_header("Step 2: Checking Python environment")
    venv_path = os.path.join(script_dir, "venv")
    if os.path.exists(venv_path):
        print("✅ Virtual environment found")
    else:
        print("⚠️  Virtual environment not found. Creating...")
        run_command("python -m venv venv")
    
    # Step 3: Install dependencies
    print_header("Step 3: Installing dependencies")
    if sys.platform == "win32":
        pip_cmd = os.path.join(venv_path, "Scripts", "pip")
    else:
        pip_cmd = os.path.join(venv_path, "bin", "pip")
    
    if os.path.exists(pip_cmd):
        run_command(f'"{pip_cmd}" install -r requirements.txt')
    else:
        print("Using system pip...")
        run_command("pip install -r requirements.txt")
    
    # Step 4: Initialize database with interactions
    print_header("Step 4: Initializing database")
    print("This will create user interactions for training...")
    
    # Import and run the database initialization
    try:
        sys.path.insert(0, script_dir)
        from scripts.init_database import main as init_db
        # Run non-interactively - auto-generate if empty
        init_db_auto()
    except ImportError:
        print("⚠️  Could not import init_database. Skipping...")
    except Exception as e:
        print(f"⚠️  Database initialization error: {e}")
        print("   Make sure MySQL is running and accessible.")
    
    # Step 5: Train the model
    print_header("Step 5: Training the AI model")
    print("This may take a few minutes...")
    
    if sys.platform == "win32":
        python_cmd = os.path.join(venv_path, "Scripts", "python")
    else:
        python_cmd = os.path.join(venv_path, "bin", "python")
    
    if os.path.exists(python_cmd):
        run_command(f'"{python_cmd}" train.py')
    else:
        run_command("python train.py")
    
    # Step 6: Verify model exists
    print_header("Step 6: Verification")
    model_path = os.path.join(script_dir, "models", "recommender_model.joblib")
    if os.path.exists(model_path):
        print(f"✅ Model saved at: {model_path}")
        print(f"   File size: {os.path.getsize(model_path) / 1024:.2f} KB")
    else:
        print("❌ Model file not found!")
    
    print_header("Setup Complete!")
    print("""
Next steps:
1. Start the recommendation service:
   python -m uvicorn app.main:app --host 0.0.0.0 --port 8085

2. Test the API:
   curl http://localhost:8085/health
   curl http://localhost:8085/api/recommendations/popular?limit=5

3. The chatbot will automatically use AI recommendations!
""")


def init_db_auto():
    """Auto-initialize database without prompts"""
    import mysql.connector
    import random
    from datetime import datetime, timedelta
    
    MYSQL_CONFIG = {
        'host': os.getenv('MYSQL_HOST', 'localhost'),
        'port': int(os.getenv('MYSQL_PORT', 3306)),
        'user': os.getenv('MYSQL_USER', 'root'),
        'password': os.getenv('MYSQL_PASSWORD', ''),
    }
    
    PRODUCT_IDS = list(range(1, 55))
    
    try:
        conn = mysql.connector.connect(**MYSQL_CONFIG)
        cursor = conn.cursor()
        
        cursor.execute("CREATE DATABASE IF NOT EXISTS shopai_recommendations")
        cursor.execute("USE shopai_recommendations")
        
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
                INDEX idx_product_id (product_id)
            )
        """)
        
        cursor.execute("SELECT COUNT(*) FROM user_interactions")
        count = cursor.fetchone()[0]
        
        if count == 0:
            print("📊 Generating training data...")
            interactions = []
            
            for user_id in range(1, 151):
                num_interactions = random.randint(5, 25)
                for _ in range(num_interactions):
                    product_id = random.choice(PRODUCT_IDS)
                    itype = random.choices(['view', 'add_to_cart', 'purchase', 'rating'], 
                                          weights=[50, 25, 15, 10])[0]
                    rating = round(random.uniform(3.0, 5.0), 1) if itype == 'rating' else None
                    quantity = random.randint(1, 3) if itype == 'purchase' else 1
                    days_ago = random.randint(0, 90)
                    created_at = datetime.now() - timedelta(days=days_ago)
                    
                    interactions.append((user_id, product_id, itype, rating, quantity, created_at))
            
            cursor.executemany("""
                INSERT INTO user_interactions 
                (user_id, product_id, interaction_type, rating, quantity, created_at)
                VALUES (%s, %s, %s, %s, %s, %s)
            """, interactions)
            
            conn.commit()
            print(f"✅ Created {len(interactions)} user interactions")
        else:
            print(f"✅ Database already has {count} interactions")
        
        cursor.close()
        conn.close()
        
    except Exception as e:
        print(f"⚠️  Database error: {e}")


if __name__ == "__main__":
    main()



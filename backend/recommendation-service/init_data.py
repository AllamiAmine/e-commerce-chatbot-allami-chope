"""Initialize recommendation training data"""
import mysql.connector
import random
from datetime import datetime, timedelta

print('Initializing recommendation training data...')

conn = mysql.connector.connect(host='localhost', user='root', password='')
cursor = conn.cursor()

cursor.execute('USE shopai_recommendations')

# Create user_interactions table
cursor.execute('''
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
''')

# Check if data exists
cursor.execute('SELECT COUNT(*) FROM user_interactions')
count = cursor.fetchone()[0]

if count == 0:
    print('Generating synthetic user interactions...')
    PRODUCT_IDS = list(range(1, 55))
    interactions = []
    
    for user_id in range(1, 151):  # 150 users
        num_interactions = random.randint(5, 25)
        for _ in range(num_interactions):
            product_id = random.choice(PRODUCT_IDS)
            itype = random.choices(['view', 'add_to_cart', 'purchase', 'rating'], weights=[50, 25, 15, 10])[0]
            rating = round(random.uniform(3.0, 5.0), 1) if itype == 'rating' else None
            quantity = random.randint(1, 3) if itype == 'purchase' else 1
            days_ago = random.randint(0, 90)
            created_at = datetime.now() - timedelta(days=days_ago)
            interactions.append((user_id, product_id, itype, rating, quantity, created_at))
    
    cursor.executemany('''
        INSERT INTO user_interactions (user_id, product_id, interaction_type, rating, quantity, created_at)
        VALUES (%s, %s, %s, %s, %s, %s)
    ''', interactions)
    
    conn.commit()
    print(f'Created {len(interactions)} user interactions for AI training')
else:
    print(f'Database already has {count} interactions')

cursor.close()
conn.close()
print('Done!')



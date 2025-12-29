"""Test the recommendation API"""
import requests

print('Testing AI Recommendations API...')
print()

# Test popular products
print('Popular Products:')
r = requests.get('http://localhost:8085/api/recommendations/popular?limit=5')
data = r.json()
for p in data['products']:
    print(f"  Product {p['product_id']}: Score {p['score']:.2f}")
print()

# Test user recommendations
print('Recommendations for User 1:')
r = requests.get('http://localhost:8085/api/recommendations/user/1?limit=5')
data = r.json()
for p in data['recommendations']:
    print(f"  Product {p['product_id']}: Score {p['score']:.4f} ({p['strategy']})")
print()

# Test similar products
print('Products similar to Product 1:')
r = requests.get('http://localhost:8085/api/recommendations/product/1/similar?limit=3')
data = r.json()
for p in data['similar_products']:
    print(f"  Product {p['product_id']}: Similarity {p['score']:.4f}")
print()

print('API is working!')



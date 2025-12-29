# 🤖 ShopAI Recommendation Service

Service de recommandation IA professionnel pour la plateforme e-commerce ShopAI.

## 📋 Fonctionnalités

- **Filtrage Collaboratif (ALS)** - "Les utilisateurs qui ont acheté X ont aussi acheté Y"
- **Recommandations de produits similaires** - Basées sur les patterns d'achat
- **Recommandations populaires** - Pour les nouveaux utilisateurs (cold start)
- **Entraînement sur données Amazon** - Dataset réel pour un modèle performant

## 🚀 Démarrage Rapide

### Prérequis

- Python 3.10+
- MySQL 8.0+ (avec les bases shopai_orders, shopai_products, shopai_users)
- pip

### Installation

```bash
# 1. Aller dans le dossier du service
cd backend/recommendation-service

# 2. Créer un environnement virtuel
python -m venv venv

# Windows
venv\Scripts\activate
# Linux/Mac
source venv/bin/activate

# 3. Installer les dépendances
pip install -r requirements.txt

# 4. Copier et configurer l'environnement
cp .env.example .env
# Éditer .env avec vos paramètres MySQL
```

### Entraînement du Modèle

```bash
# Option 1: Avec données Amazon (recommandé)
python train.py

# Option 2: Avec données synthétiques (rapide, pour tests)
python train.py --synthetic

# Option 3: Avec données Amazon + vos vraies commandes
python train.py --include-db

# Option 4: Avec évaluation du modèle
python train.py --evaluate
```

### Lancer le Service

```bash
# Mode développement
python -m uvicorn app.main:app --reload --port 8085

# Mode production
uvicorn app.main:app --host 0.0.0.0 --port 8085 --workers 4
```

### Avec Docker

```bash
# Build
docker build -t shopai-recommendation .

# Run
docker run -p 8085:8085 -e DB_HOST=host.docker.internal shopai-recommendation

# Ou via docker-compose (depuis backend/)
docker-compose up recommendation-service
```

## 📡 API Endpoints

### Recommandations personnalisées

```http
GET /api/recommendations/user/{user_id}?limit=10
```

Réponse:
```json
{
  "user_id": "123",
  "recommendations": [
    {"product_id": "45", "score": 0.95, "strategy": "collaborative_filtering"},
    {"product_id": "78", "score": 0.87, "strategy": "collaborative_filtering"}
  ],
  "total": 10,
  "strategy_used": "collaborative_filtering"
}
```

### Produits similaires

```http
GET /api/recommendations/product/{product_id}/similar?limit=5
```

### Produits populaires (cold start)

```http
GET /api/recommendations/popular?limit=20
```

### Health Check

```http
GET /health
```

### Statistiques du modèle

```http
GET /stats
```

### Recharger le modèle (après ré-entraînement)

```http
POST /api/recommendations/refresh
```

## 📊 Dataset Amazon

Le service utilise le dataset public Amazon Product Reviews:
- **Source**: [Amazon Review Data (2018)](https://jmcauley.ucsd.edu/data/amazon/)
- **Catégories utilisées**: Electronics, Sports and Outdoors
- **Taille**: ~50,000 interactions après filtrage

Le dataset est téléchargé automatiquement lors du premier entraînement.

## 🧠 Architecture du Modèle

```
┌─────────────────────────────────────────────────────────┐
│                  Hybrid Recommender                      │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐    ┌──────────────────┐           │
│  │  Collaborative   │    │  Content-Based   │           │
│  │  Filtering (ALS) │    │  (TF-IDF)        │           │
│  │                  │    │                  │           │
│  │  User factors    │    │  Product text    │           │
│  │  Item factors    │    │  similarities    │           │
│  └────────┬─────────┘    └────────┬─────────┘           │
│           │                       │                      │
│           └───────────┬───────────┘                      │
│                       ▼                                  │
│              ┌────────────────┐                          │
│              │  Score Fusion  │                          │
│              └────────┬───────┘                          │
│                       │                                  │
│           ┌───────────┴───────────┐                      │
│           ▼                       ▼                      │
│  ┌────────────────┐      ┌────────────────┐             │
│  │ Personalized   │      │   Popularity   │             │
│  │ Recommendations│      │   (Fallback)   │             │
│  └────────────────┘      └────────────────┘             │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## 🔄 Pipeline de Ré-entraînement

Pour un système de production, configurez un ré-entraînement régulier:

```bash
# Cron job (Linux) - Tous les jours à 3h du matin
0 3 * * * cd /path/to/recommendation-service && python train.py --include-db

# Windows Task Scheduler
schtasks /create /tn "ShopAI Model Training" /tr "python train.py --include-db" /sc daily /st 03:00
```

Après le ré-entraînement, appelez `/api/recommendations/refresh` pour recharger le modèle sans redémarrer le service.

## 📁 Structure du Projet

```
recommendation-service/
├── app/
│   ├── __init__.py
│   ├── main.py              # API FastAPI
│   ├── data/
│   │   ├── amazon_dataset.py  # Chargement données Amazon
│   │   └── database.py        # Connexion MySQL
│   └── models/
│       └── recommender.py     # Modèle IA hybride
├── data/
│   └── amazon/              # Données téléchargées
├── models/
│   └── recommender_model.joblib  # Modèle entraîné
├── logs/                    # Logs d'entraînement
├── config.py               # Configuration
├── train.py                # Script d'entraînement
├── requirements.txt
├── Dockerfile
└── README.md
```

## 🐛 Troubleshooting

### "Model not loaded"
```bash
# Entraîner le modèle d'abord
python train.py
```

### "Database connection failed"
```bash
# Vérifier que MySQL est démarré et accessible
# Vérifier les paramètres dans .env
```

### "Not enough data"
```bash
# Utiliser des données synthétiques pour commencer
python train.py --synthetic
```

## 📈 Métriques

Après entraînement avec `--evaluate`:

| Métrique | Valeur typique |
|----------|---------------|
| Precision@10 | 0.15 - 0.25 |
| Recall@10 | 0.10 - 0.20 |
| Coverage | 60% - 80% |

## 📝 License

MIT - ShopAI Project



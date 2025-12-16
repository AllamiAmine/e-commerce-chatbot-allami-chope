# 🚀 ShopAI Backend - Microservices

Architecture microservices Spring Boot pour la plateforme e-commerce ShopAI avec ChatBot IA.

## 📋 Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Angular)                          │
└───────────────────────────────┬─────────────────────────────────┘
                                │
                        ┌───────▼───────┐
                        │  API Gateway  │ :8080
                        └───────┬───────┘
                                │
        ┌───────────────────────┼───────────────────────┐
        │           │           │           │           │
┌───────▼───────┐ ┌─▼──────┐ ┌──▼─────┐ ┌──▼──────┐ ┌──▼────────┐
│    User       │ │Product │ │ Order  │ │ChatBot  │ │  MySQL    │
│   Service     │ │Service │ │Service │ │Service  │ │ Database  │
│    :8081      │ │ :8082  │ │ :8083  │ │ :8084   │ │  :3306    │
└───────────────┘ └────────┘ └────────┘ └─────────┘ └───────────┘
```

## 🛠️ Microservices

| Service | Port | Database | Description |
|---------|------|----------|-------------|
| **API Gateway** | 8080 | - | Point d'entrée unique, routing |
| **User Service** | 8081 | shopai_users | Authentification, JWT, gestion utilisateurs |
| **Product Service** | 8082 | shopai_products | Gestion produits et catégories |
| **Order Service** | 8083 | shopai_orders | Gestion des commandes |
| **ChatBot Service** | 8084 | - | NLP, IA, recommandations |

## 🗄️ Configuration MySQL

### Prérequis
- MySQL 8.0+ installé et en cours d'exécution
- Port 3306 disponible

### 1. Créer les bases de données

```sql
-- Exécuter dans MySQL
CREATE DATABASE IF NOT EXISTS shopai_users;
CREATE DATABASE IF NOT EXISTS shopai_products;
CREATE DATABASE IF NOT EXISTS shopai_orders;
```

Ou utiliser le script fourni :
```bash
mysql -u root -p < init-db.sql
```

### 2. Configuration de connexion

Chaque service est configuré avec :
- **URL** : `jdbc:mysql://localhost:3306/shopai_xxx`
- **Username** : `root`
- **Password** : `` (vide par défaut)

Pour modifier le mot de passe, éditer les fichiers `application.yml` :
```yaml
spring:
  datasource:
    password: votre_mot_de_passe
```

## 🚀 Démarrage

### Prérequis
- Java 17+
- Maven 3.8+
- MySQL 8.0+

### Démarrer tous les services

**Windows :**
```bash
cd backend
.\start-all.bat
```

**Linux/Mac :**
```bash
cd backend
chmod +x start-all.sh
./start-all.sh
```

### Démarrage manuel (un par un)

```bash
# Terminal 1 - User Service
cd backend/user-service
mvn spring-boot:run

# Terminal 2 - Product Service
cd backend/product-service
mvn spring-boot:run

# Terminal 3 - Order Service
cd backend/order-service
mvn spring-boot:run

# Terminal 4 - ChatBot Service
cd backend/chatbot-service
mvn spring-boot:run

# Terminal 5 - API Gateway
cd backend/api-gateway
mvn spring-boot:run
```

### Avec Docker

```bash
docker-compose up -d
```

## 📡 API Endpoints

### 🔐 Authentication
```
POST /api/auth/register    - Inscription
POST /api/auth/login       - Connexion
GET  /api/auth/validate    - Valider token
```

### 👥 Users
```
GET  /api/users/me              - Profil utilisateur
PUT  /api/users/me              - Modifier profil
GET  /api/users/admin/all       - Liste (Admin)
PUT  /api/users/admin/{id}/status - Changer statut (Admin)
```

### 📦 Products
```
GET  /api/products              - Liste produits
GET  /api/products/{id}         - Détail produit
GET  /api/products/categories   - Catégories
GET  /api/products/search?q=    - Recherche
GET  /api/products/top-rated    - Mieux notés
GET  /api/products/promotions   - Promotions
POST /api/products              - Créer (Seller/Admin)
```

### 🛒 Orders
```
GET  /api/orders              - Toutes les commandes
GET  /api/orders/user/{id}    - Commandes utilisateur
POST /api/orders              - Créer commande
PUT  /api/orders/{id}/status  - Changer statut
PUT  /api/orders/{id}/cancel  - Annuler
```

### 🤖 ChatBot
```
POST /api/chatbot/message     - Envoyer message au chatbot
GET  /api/chatbot/health      - État du service
```

## 🔒 Authentification JWT

Header requis pour les endpoints protégés :
```
Authorization: Bearer <token>
```

### Utilisateurs de Test (créés automatiquement)

| Rôle | Email | Mot de passe |
|------|-------|--------------|
| 🔴 Admin | admin@shopai.com | admin123 |
| 🟡 Seller | seller@shopai.com | seller123 |
| 🟢 Client | client@shopai.com | client123 |

## 📁 Structure du Projet

```
backend/
├── pom.xml                    # Parent POM
├── docker-compose.yml         # Docker configuration
├── init-db.sql                # Script MySQL
├── start-all.bat              # Windows starter
├── start-all.sh               # Linux/Mac starter
├── common/                    # DTOs partagés
├── api-gateway/               # Gateway Spring Cloud
├── user-service/              # Authentification & Users
├── product-service/           # Produits & Catégories
├── order-service/             # Commandes
└── chatbot-service/           # ChatBot NLP
```

## 🔧 Troubleshooting

### Erreur de connexion MySQL
```
Communications link failure
```
**Solution** : Vérifier que MySQL est en cours d'exécution :
```bash
# Windows
net start MySQL80

# Linux
sudo systemctl start mysql
```

### Access denied for user 'root'
**Solution** : Mettre à jour le mot de passe dans `application.yml`

### Port already in use
**Solution** : Arrêter le processus sur le port ou changer le port dans `application.yml`

## 📝 License

MIT License - ShopAI © 2024

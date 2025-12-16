# 🛒 ShopAI - Plateforme E-commerce avec ChatBot Intelligent

## 📋 Projet de Fin d'Année (PFA) 2025

### 🎯 Contexte du Projet

Dans un contexte où le commerce en ligne connaît une croissance rapide, ce projet vise à développer une **plateforme e-commerce innovante** intégrant un **ChatBot intelligent** capable d'interagir avec les utilisateurs grâce au **traitement du langage naturel (NLP)**.

### 🏆 Objectifs

- ✅ Améliorer l'expérience utilisateur avec un support instantané et personnalisé
- ✅ Proposer des recommandations pertinentes basées sur l'IA
- ✅ Accompagner les clients tout au long du processus d'achat
- ✅ Démontrer l'apport de l'IA dans le e-commerce moderne

---

## 🏗️ Architecture Technique

### Architecture Microservices

```
┌─────────────────────────────────────────────────────────────────┐
│                        CLIENT (Angular)                          │
│  ┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────────────┐    │
│  │  Home   │  │  Cart   │  │Products │  │  ChatBot (NLP)  │    │
│  └────┬────┘  └────┬────┘  └────┬────┘  └────────┬────────┘    │
└───────┼────────────┼────────────┼────────────────┼──────────────┘
        │            │            │                │
        └────────────┴────────────┴────────────────┘
                            │
                    ┌───────▼───────┐
                    │  API Gateway  │
                    └───────┬───────┘
                            │
        ┌───────────────────┼───────────────────┐
        │                   │                   │
┌───────▼───────┐  ┌───────▼───────┐  ┌───────▼───────┐
│    Product    │  │     Order     │  │   ChatBot     │
│   Service     │  │    Service    │  │   Service     │
│ (Spring Boot) │  │ (Spring Boot) │  │  (NLP/IA)     │
└───────┬───────┘  └───────┬───────┘  └───────┬───────┘
        │                  │                  │
        └──────────────────┴──────────────────┘
                           │
                   ┌───────▼───────┐
                   │    MySQL      │
                   │   Database    │
                   └───────────────┘
```

### Technologies Utilisées

| Composant | Technologie | Description |
|-----------|-------------|-------------|
| **Frontend** | Angular 18 | Interface utilisateur moderne et réactive |
| **Backend** | Spring Boot | Microservices RESTful |
| **Base de données** | MySQL | Stockage des données |
| **ChatBot** | NLP / IA | Traitement du langage naturel |
| **Styling** | Tailwind CSS | Design responsive |
| **State Management** | Angular Signals | Gestion d'état réactive |

---

## 🚀 Installation & Démarrage

### Prérequis

- Node.js 18+
- npm ou pnpm
- Angular CLI

### Installation

```bash
# Cloner le repository
git clone <repository-url>

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm start
```

### Accès

- **Application** : http://localhost:4200
- **ChatBot IA** : Cliquez sur l'icône en bas à droite 💬

---

## 📁 Structure du Projet

```
src/
├── app/
│   ├── components/           # Composants réutilisables
│   │   ├── chatbot/         # 🤖 ChatBot avec NLP
│   │   ├── header/          # Navigation
│   │   ├── footer/          # Pied de page
│   │   ├── hero/            # Section héro
│   │   ├── products/        # Grille produits
│   │   └── ui/              # Composants UI
│   ├── pages/               # Pages de l'application
│   │   ├── home/            # Page d'accueil
│   │   ├── cart/            # Panier
│   │   ├── categories/      # Catégories
│   │   └── product-detail/  # Détail produit
│   ├── services/            # Services Angular
│   │   ├── cart.service.ts  # Gestion du panier
│   │   └── product.service.ts
│   ├── models/              # Interfaces TypeScript
│   ├── app.component.ts     # Composant racine
│   └── app.routes.ts        # Configuration routing
├── assets/                  # Images et ressources
├── index.html              # Point d'entrée HTML
├── main.ts                 # Bootstrap Angular
└── styles.css              # Styles globaux (Tailwind)
```

---

## ✨ Fonctionnalités

### 🛍️ E-commerce
- Catalogue de produits avec filtres
- Système de catégories
- Panier d'achat réactif
- Wishlist (favoris)
- Recherche intelligente

### 🤖 ChatBot Intelligent
- **Compréhension NLP** : Analyse du langage naturel
- **Réponses contextuelles** : Adaptation aux questions
- **Suggestions rapides** : Actions prédéfinies
- **Suivi commandes** : Informations en temps réel
- **Recommandations** : Suggestions personnalisées
- **Support 24/7** : Assistance instantanée

### 🎨 Interface Utilisateur
- Design moderne et épuré
- Thème personnalisé (brown/gold)
- Responsive (mobile-first)
- Animations fluides
- Accessibilité

---

## 🔧 Scripts Disponibles

```bash
npm start      # Démarrer le serveur de développement
npm run build  # Build de production
npm run watch  # Build avec watch mode
npm test       # Exécuter les tests
```

---

## 📊 Perspectives d'Évolution

- [ ] Intégration d'un vrai modèle NLP (GPT, BERT)
- [ ] Authentification utilisateur (JWT)
- [ ] Paiement en ligne (Stripe, PayPal)
- [ ] Notifications push
- [ ] PWA (Progressive Web App)
- [ ] Analytics et tableaux de bord
- [ ] Multi-langue

---

## 👥 Équipe Projet

**Projet de Fin d'Année (PFA) - 2025**

Ce projet démontre comment l'Intelligence Artificielle, intégrée dans une plateforme e-commerce moderne, constitue un levier puissant d'amélioration de l'interaction client et d'optimisation des processus commerciaux.

---

## 📄 Licence

MIT License - Projet académique

---

<div align="center">
  <strong>🎓 Projet de Fin d'Année 2025</strong><br>
  <em>E-commerce avec ChatBot Intelligent - Architecture Microservices</em>
</div>

# 🎮 Game API - Projet Pédagogique RNCP39608BC02

API REST complète et sécurisée pour gérer une collection de jeux vidéo avec authentification JWT, MongoDB, Express et TypeScript.

> ⭐ **Projet conforme au référentiel RNCP39608BC02** - Couvre les compétences C7 à C17

---

## 🚀 Démarrage Rapide

```bash
# 1. Démarrer MongoDB et l'API
docker-compose up -d

# 2. Vérifier que tout fonctionne
curl http://localhost:3000/health

# 3. Accéder aux interfaces
# Documentation Swagger: http://localhost:3000 (page d'accueil)
# API Games: http://localhost:3000/api/games
# Mongo Express: http://localhost:8082 (admin/admin123)
```

---

## 📋 Prérequis

- Node.js >= 16
- Docker et Docker Compose
- npm

---

## 📦 Installation

```bash
# Installer les dépendances
npm install

# Démarrer avec Docker (recommandé)
docker-compose up -d

# OU en développement avec hot-reload
docker-compose -f docker-compose.dev.yml up -d
```

---

## 🔧 Configuration

Créez un fichier `.env` (optionnel) :

```env
PORT=3000
MONGODB_URI=mongodb://mongodb:27017/gamedb
NODE_ENV=production
```

---

## 🌐 Routes API

### 🔐 Authentification

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| POST | `/api/auth/register` | Inscription | Public |
| POST | `/api/auth/login` | Connexion | Public |
| GET | `/api/auth/profile` | Mon profil | 🔒 User |
| GET | `/api/auth/users` | Liste utilisateurs | 🔒 Admin |
| PATCH | `/api/auth/users/:id/role` | Changer rôle | 🔒 Admin |

### 🎮 Jeux Vidéo

| Méthode | Route | Description | Auth |
|---------|-------|-------------|------|
| GET | `/health` | Health check | Public |
| POST | `/api/games` | Créer un jeu | 🔒 Admin/Mod |
| GET | `/api/games` | Lister les jeux | Public |
| GET | `/api/games/:id` | Récupérer un jeu | Public |
| PUT | `/api/games/:id` | Mettre à jour | 🔒 Admin/Mod |
| DELETE | `/api/games/:id` | Supprimer | 🔒 Admin |
| GET | `/api/games/search` | Rechercher | Public |
| GET | `/api/games/stats/count` | Statistiques | Public |

### Exemples

**1. S'inscrire :**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "johndoe",
    "email": "john@example.com",
    "password": "password123"
  }'
```

**2. Se connecter :**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'
# Récupérez le token dans la réponse
```

**3. Créer un jeu (nécessite authentification) :**
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer VOTRE_TOKEN_ICI" \
  -d '{
    "title": "The Legend of Zelda",
    "description": "Jeu d'\''aventure épique",
    "genre": "Adventure",
    "platform": ["Nintendo Switch"],
    "releaseYear": 2017,
    "publisher": "Nintendo",
    "rating": 9.8,
    "price": 59.99,
    "inStock": true
  }'
```

**Lister les jeux :**
```bash
curl http://localhost:3000/api/games?page=1&limit=10
```

**Rechercher :**
```bash
curl "http://localhost:3000/api/games/search?keyword=zelda&genre=Adventure&minRating=9"
```

---

## 📊 Modèle de Données

```typescript
interface Game {
  title: string;           // Min 2 caractères
  description: string;     // Min 10 caractères
  genre: string;          // Action, Adventure, RPG, etc.
  platform: string[];     // PS5, Xbox, PC, Nintendo Switch
  releaseYear: number;    // 1970 - aujourd'hui+2
  publisher: string;
  rating: number;         // 0-10
  price: number;          // >= 0
  inStock: boolean;
}
```

**Genres disponibles :**
`Action`, `Adventure`, `RPG`, `Strategy`, `Sports`, `Racing`, `Simulation`, `Puzzle`, `Horror`, `Fighting`, `Platform`, `Shooter`

---

## 🧪 Tests

```bash
# Lancer tous les tests
npm test

# Tests avec coverage
npm run test:coverage

# Tests en mode watch
npm run test:watch
```

---

## 🔒 Sauvegardes MongoDB

### Démarrer le service de sauvegarde

```bash
docker-compose up -d backup
```

### Commandes de sauvegarde

```bash
# Créer une sauvegarde
docker exec gamedb-backup /scripts/backup.sh

# Lister les sauvegardes
docker exec gamedb-backup ls -lh /backups

# Restaurer une sauvegarde
docker exec -it gamedb-backup /scripts/restore.sh <nom_fichier>

# Copier les sauvegardes localement
docker cp gamedb-backup:/backups ./local-backups
```

### Commandes helper

```bash
# Charger les fonctions
source scripts/backup-commands.sh

# Utiliser
backup_now          # Sauvegarder
backup_list         # Lister
backup_restore      # Restaurer
backup_status       # Status
backup_help         # Aide
```

### Configuration

Les sauvegardes sont automatiques **tous les jours à 2h** avec une rétention de **7 jours**.

Pour modifier, éditez `docker-compose.yml` :
```yaml
backup:
  environment:
    RETENTION_DAYS: 14  # Nombre de jours
```

**Documentation complète :** Voir [`BACKUP.md`](BACKUP.md)

---

## 🛠️ Développement

```bash
# Mode développement avec hot-reload
npm run dev

# Build
npm run build

# Production
npm start
```

---

## 🐳 Docker

```bash
# Production
docker-compose up -d

# Développement (hot-reload)
docker-compose -f docker-compose.dev.yml up -d

# Arrêter
docker-compose down

# Voir les logs
docker-compose logs -f api
```

---

## 📁 Structure du Projet

```
game-api/
├── src/
│   ├── config/         # Configuration (database)
│   ├── controllers/    # Contrôleurs (logique HTTP)
│   ├── models/         # Modèles Mongoose
│   ├── routes/         # Routes Express
│   ├── services/       # Logique métier
│   ├── middlewares/    # Middlewares (erreurs)
│   ├── types/          # Types TypeScript
│   └── server.ts       # Point d'entrée
├── tests/
│   ├── unit/           # Tests unitaires
│   ├── integration/    # Tests d'intégration
│   └── fixtures/       # Données de test
├── scripts/            # Scripts de sauvegarde
├── docker-compose.yml  # Configuration Docker
└── package.json        # Dépendances
```

---

## 🔧 Scripts npm

| Commande | Description |
|----------|-------------|
| `npm run dev` | Développement avec hot-reload |
| `npm run build` | Compiler TypeScript |
| `npm start` | Démarrer en production |
| `npm test` | Lancer les tests |
| `npm run test:coverage` | Tests avec coverage |
| `npm run lint` | Vérifier le code |

---

## 🌟 Fonctionnalités

### 🔐 Sécurité
- ✅ **Authentification JWT** avec tokens sécurisés
- ✅ **Autorisation par rôles** (User, Moderator, Admin)
- ✅ **Rate limiting** contre les attaques DDoS
- ✅ **Helmet** pour sécuriser les headers HTTP
- ✅ **CORS** configuré correctement
- ✅ **Validation des données** avec Joi
- ✅ **Hachage des mots de passe** avec bcrypt

### 🎮 API
- ✅ **CRUD complet** pour les jeux
- ✅ **Recherche avancée** avec filtres multiples
- ✅ **Pagination** sur tous les endpoints
- ✅ **Documentation Swagger** interactive

### 🗄️ Base de données
- ✅ **MongoDB** avec Mongoose
- ✅ **Index** pour la performance
- ✅ **Sauvegardes automatiques** quotidiennes
- ✅ **Restauration** facile des données

### 🧪 Qualité
- ✅ **Tests unitaires et d'intégration** avec Jest
- ✅ **Coverage** de code
- ✅ **Tests de charge** (documentation incluse)
- ✅ **TypeScript** avec types stricts

### 🐳 DevOps
- ✅ **Docker** avec hot-reload en dev
- ✅ **Docker Compose** pour orchestration
- ✅ **Mongo Express** pour visualiser la DB
- ✅ **Architecture MVC** orientée objet

---

## 📚 Documentation Complète

### 📖 Pour les étudiants
- **[README_PEDAGOGIQUE.md](documentation/README_PEDAGOGIQUE.md)** - Guide complet pour apprendre (architecture, concepts, exercices)
- **[ARBITRAGE_SQL_NOSQL.md](documentation/ARBITRAGE_SQL_NOSQL.md)** - Quand utiliser SQL vs NoSQL avec exemples
- **[DEMARRAGE_RAPIDE.md](documentation/DEMARRAGE_RAPIDE.md)** - Guide de démarrage en 5 minutes

### 🔧 Documentation technique
- **[BACKUP.md](documentation/BACKUP.md)** - Sauvegardes et restauration MongoDB
- **[TESTING.md](documentation/TESTING.md)** - Tests unitaires, intégration et charge
- **[env.example.txt](env.example.txt)** - Variables d'environnement

### 🧪 Collections de tests
- **[Game-API.postman_collection.json](Game-API.postman_collection.json)** - Collection Postman

### 📊 Compétences RNCP39608BC02 couvertes

| Compétence | Description | Fichiers concernés |
|------------|-------------|-------------------|
| **C7** | Configuration environnement | `docker-compose.yml`, `package.json` |
| **C8** | POO et MVC | `src/models/`, `src/controllers/`, `src/services/` |
| **C9** | Sécurisation serveurs | `src/middlewares/auth.middleware.ts`, `helmet`, `rate limiting` |
| **C10/C11** | Bases de données SQL/NoSQL | `src/config/database.ts`, `src/models/*.model.ts` |
| **C12** | Arbitrage SQL/NoSQL | `ARBITRAGE_SQL_NOSQL.md` |
| **C13** | Sauvegarde et récupération | `scripts/backup.sh`, `BACKUP.md` |
| **C14** | Conception API REST | `src/routes/*.routes.ts` |
| **C15** | Sécurisation API | `JWT`, `Joi`, `bcrypt`, `middlewares` |
| **C16** | Tests API | `tests/`, `TESTING.md` |
| **C17** | Documentation Swagger | `src/config/swagger.ts`, http://localhost:3000 |

---

## 🔗 Liens Utiles

- **Documentation Swagger** : http://localhost:3000 (page d'accueil)
- **Health Check** : http://localhost:3000/health
- **API Games** : http://localhost:3000/api/games
- **Mongo Express** : http://localhost:8082 (admin/admin123)

---

## 🎓 Utilisation pédagogique

Ce projet est conçu pour l'apprentissage du développement back-end conformément au référentiel **RNCP39608BC02**.

### 📋 Évaluations

**E3 - Back-end et base de données (4h)** - Compétences C7 à C11  
**E4 - API sécurisée documentée (4h)** - Compétences C12 à C17

Voir **[README_PEDAGOGIQUE.md](documentation/README_PEDAGOGIQUE.md)** pour les détails et la grille d'évaluation.

### 🎯 Exercices pratiques

Le guide pédagogique inclut des exercices de difficulté progressive :
- ✏️ **Débutant** : Ajouter un champ au modèle
- 📊 **Intermédiaire** : Créer un endpoint de statistiques
- ⭐ **Avancé** : Système de favoris utilisateur
- 🚀 **Expert** : Implémenter un cache Redis

### 📚 Ressources d'apprentissage

- Architecture MVC expliquée
- POO en TypeScript avec exemples
- JWT et authentification détaillés
- Tests unitaires et d'intégration
- Bonnes pratiques de sécurité

---

## 🔧 Technologies utilisées

| Catégorie | Technologies |
|-----------|--------------|
| **Backend** | Node.js, Express, TypeScript |
| **Base de données** | MongoDB, Mongoose |
| **Authentification** | JWT, bcryptjs |
| **Sécurité** | Helmet, CORS, Rate limiting, Joi |
| **Tests** | Jest, Supertest, MongoDB Memory Server |
| **DevOps** | Docker, Docker Compose |
| **Documentation** | Swagger/OpenAPI |

---

## 📊 Structure du projet

```
game-api/
├── src/
│   ├── config/           # Configuration (database, swagger)
│   ├── controllers/      # Contrôleurs (logique HTTP)
│   ├── models/           # Modèles (schémas de données)
│   ├── services/         # Services (logique métier)
│   ├── routes/           # Routes (endpoints)
│   ├── middlewares/      # Middlewares (auth, validation, errors)
│   ├── types/            # Types TypeScript
│   ├── utils/            # Utilitaires (JWT, etc.)
│   └── server.ts         # Point d'entrée
├── tests/
│   ├── unit/             # Tests unitaires
│   ├── integration/      # Tests d'intégration
│   └── fixtures/         # Données de test
├── scripts/              # Scripts de sauvegarde
├── docker-compose.yml    # Configuration Docker
└── [Documentation]       # README, guides, etc.
```

---

## 📄 License

MIT

---

## 👤 Auteur

**Projet pédagogique RNCP39608BC02** - Formation Développeur Back-end

---

## 🙏 Contribution

Ce projet est destiné à l'apprentissage. Les contributions sont les bienvenues pour :
- Améliorer la documentation
- Ajouter des exemples
- Corriger des bugs
- Proposer de nouveaux exercices

---

**✅ Prêt à apprendre !** 

1. Consultez **[DEMARRAGE_RAPIDE.md](documentation/DEMARRAGE_RAPIDE.md)** pour un démarrage en 5 minutes
2. Lisez **[README_PEDAGOGIQUE.md](documentation/README_PEDAGOGIQUE.md)** pour le guide complet
3. Lancez `docker-compose up -d` 
4. Ouvrez http://localhost:3000 pour Swagger
5. Suivez les exercices pratiques

**🚀 Bon apprentissage !**

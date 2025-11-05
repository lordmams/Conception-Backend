# 📚 Guide Pédagogique - Game API

## 🎯 Objectif de ce projet

Ce projet est conçu pour vous enseigner les compétences essentielles du développement back-end conformément au référentiel RNCP39608, en particulier le bloc de compétences BC02.

---

## 📋 Table des matières

1. [Compétences couvertes](#compétences-couvertes)
2. [Architecture du projet](#architecture-du-projet)
3. [Technologies utilisées](#technologies-utilisées)
4. [Concepts clés expliqués](#concepts-clés-expliqués)
5. [Guide pas à pas](#guide-pas-à-pas)
6. [Exercices pratiques](#exercices-pratiques)
7. [Points d'évaluation E3 & E4](#points-dévaluation-e3--e4)
8. [Ressources complémentaires](#ressources-complémentaires)

---

## ✅ Compétences couvertes

Ce projet couvre les compétences suivantes du référentiel RNCP39608BC02 :

### C7 - Configuration de l'environnement de développement
✅ **Vous apprendrez** :
- Installer et configurer Docker et Docker Compose
- Configurer un IDE (VS Code recommandé)
- Utiliser les variables d'environnement (.env)
- Gérer les dépendances avec npm

📁 **Fichiers concernés** : `docker-compose.yml`, `package.json`, `env.example.txt`

### C8 - Solutions back-end avec POO et MVC
✅ **Vous apprendrez** :
- Concevoir une architecture MVC (Model-View-Controller)
- Utiliser la Programmation Orientée Objet (POO)
- Créer des classes et des interfaces TypeScript
- Séparer les responsabilités (services, contrôleurs, modèles)

📁 **Fichiers concernés** : `src/models/`, `src/controllers/`, `src/services/`, `src/routes/`

### C9 - Optimisation et sécurisation des serveurs web
✅ **Vous apprendrez** :
- Sécuriser une API avec JWT (JSON Web Tokens)
- Implémenter l'authentification et l'autorisation
- Utiliser Helmet pour sécuriser les headers HTTP
- Configurer CORS correctement
- Implémenter le rate limiting

📁 **Fichiers concernés** : `src/middlewares/auth.middleware.ts`, `src/middlewares/rateLimit.middleware.ts`, `src/utils/jwt.utils.ts`

### C10 - Bases de données relationnelles (SQL)
✅ **Vous apprendrez** :
- Concevoir des schémas SQL
- Créer des relations entre tables
- Gérer les transactions ACID
- Utiliser PostgreSQL

📄 **Documentation** : `ARBITRAGE_SQL_NOSQL.md`

### C11 - Bases de données NoSQL
✅ **Vous apprendrez** :
- Utiliser MongoDB avec Mongoose
- Créer des schémas NoSQL flexibles
- Indexer les données pour la performance
- Gérer des documents complexes

📁 **Fichiers concernés** : `src/models/Game.model.ts`, `src/models/User.model.ts`, `src/config/database.ts`

### C12 - Arbitrage SQL/NoSQL
✅ **Vous apprendrez** :
- Comprendre les différences entre SQL et NoSQL
- Choisir la bonne base de données selon le contexte
- Utiliser une architecture hybride

📄 **Documentation** : `ARBITRAGE_SQL_NOSQL.md`

### C13 - Sauvegarde et récupération
✅ **Vous apprendrez** :
- Automatiser les sauvegardes MongoDB
- Restaurer des données
- Gérer la rétention des sauvegardes

📁 **Fichiers concernés** : `scripts/backup.sh`, `scripts/restore.sh`
📄 **Documentation** : `BACKUP.md`

### C14 - Conception d'API REST
✅ **Vous apprendrez** :
- Concevoir des endpoints REST
- Utiliser les bonnes méthodes HTTP (GET, POST, PUT, DELETE)
- Implémenter la pagination
- Gérer les filtres et la recherche

📁 **Fichiers concernés** : `src/routes/*.ts`, `src/controllers/*.ts`

### C15 - Sécurisation des API
✅ **Vous apprendrez** :
- Authentification JWT
- Autorisation basée sur les rôles
- Validation des données avec Joi
- Protection contre les attaques courantes

📁 **Fichiers concernés** : `src/middlewares/auth.middleware.ts`, `src/middlewares/validation.middleware.ts`

### C16 - Tests d'API
✅ **Vous apprendrez** :
- Tests unitaires avec Jest
- Tests d'intégration
- Tests de charge (principes)
- Coverage de code

📁 **Fichiers concernés** : `tests/`, `jest.config.js`

### C17 - Documentation d'API avec Swagger
✅ **Vous apprendrez** :
- Documenter une API avec Swagger/OpenAPI
- Générer une documentation interactive
- Annoter les routes avec JSDoc

📁 **Fichiers concernés** : `src/config/swagger.ts`

---

## 🏗️ Architecture du projet

### Vue d'ensemble

```
game-api/
│
├── src/                          # Code source
│   ├── config/                   # Configuration
│   │   ├── database.ts          # Connexion MongoDB
│   │   └── swagger.ts           # Configuration Swagger
│   │
│   ├── controllers/              # Contrôleurs (logique HTTP)
│   │   ├── Game.controller.ts
│   │   └── Auth.controller.ts
│   │
│   ├── models/                   # Modèles (schémas de données)
│   │   ├── Game.model.ts
│   │   └── User.model.ts
│   │
│   ├── services/                 # Services (logique métier)
│   │   ├── Game.service.ts
│   │   └── Auth.service.ts
│   │
│   ├── routes/                   # Routes (endpoints)
│   │   ├── game.routes.ts
│   │   └── auth.routes.ts
│   │
│   ├── middlewares/              # Middlewares
│   │   ├── auth.middleware.ts   # Authentification/Autorisation
│   │   ├── errorHandler.ts      # Gestion erreurs
│   │   ├── validation.middleware.ts  # Validation données
│   │   └── rateLimit.middleware.ts   # Limitation taux
│   │
│   ├── types/                    # Types TypeScript
│   │   ├── game.types.ts
│   │   └── auth.types.ts
│   │
│   ├── utils/                    # Utilitaires
│   │   └── jwt.utils.ts
│   │
│   └── server.ts                 # Point d'entrée
│
├── tests/                        # Tests
│   ├── unit/                     # Tests unitaires
│   ├── integration/              # Tests d'intégration
│   └── fixtures/                 # Données de test
│
├── scripts/                      # Scripts de sauvegarde
├── docker-compose.yml            # Configuration Docker
├── package.json                  # Dépendances
└── tsconfig.json                 # Configuration TypeScript
```

### Pattern MVC expliqué

```
┌─────────────────────────────────────────────────────┐
│                   Architecture MVC                  │
└─────────────────────────────────────────────────────┘

┌─────────┐
│ CLIENT  │  Requête HTTP
│         │  GET /api/games
└────┬────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│ ROUTES (game.routes.ts)                             │
│ - Définit les endpoints                             │
│ - Applique les middlewares                          │
│ - Redirige vers le contrôleur                       │
└────┬────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│ MIDDLEWARES                                         │
│ - Authentification (auth.middleware.ts)             │
│ - Validation (validation.middleware.ts)             │
│ - Rate limiting (rateLimit.middleware.ts)           │
└────┬────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│ CONTROLLER (Game.controller.ts)                     │
│ - Orchestration requête/réponse                     │
│ - Validation des paramètres                         │
│ - Appel au service                                  │
│ - Formatage de la réponse                           │
└────┬────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│ SERVICE (Game.service.ts)                           │
│ - Logique métier                                    │
│ - Traitement des données                            │
│ - Appel au modèle                                   │
└────┬────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│ MODEL (Game.model.ts)                               │
│ - Schéma de données                                 │
│ - Validation                                        │
│ - Méthodes du modèle                                │
└────┬────────────────────────────────────────────────┘
     │
     ▼
┌─────────────────────────────────────────────────────┐
│ DATABASE (MongoDB)                                  │
│ - Stockage persistant                               │
└─────────────────────────────────────────────────────┘
```

---

## 🛠️ Technologies utilisées

### Backend

| Technologie | Rôle | Documentation |
|-------------|------|---------------|
| **Node.js** | Runtime JavaScript | [nodejs.org](https://nodejs.org/) |
| **TypeScript** | Langage typé | [typescriptlang.org](https://www.typescriptlang.org/) |
| **Express** | Framework web | [expressjs.com](https://expressjs.com/) |
| **MongoDB** | Base NoSQL | [mongodb.com](https://www.mongodb.com/) |
| **Mongoose** | ODM MongoDB | [mongoosejs.com](https://mongoosejs.com/) |
| **JWT** | Authentification | [jwt.io](https://jwt.io/) |
| **Bcrypt** | Hachage mots de passe | [npmjs.com/package/bcryptjs](https://www.npmjs.com/package/bcryptjs) |
| **Joi** | Validation données | [joi.dev](https://joi.dev/) |
| **Helmet** | Sécurité HTTP | [helmetjs.github.io](https://helmetjs.github.io/) |

### Tests

| Technologie | Rôle |
|-------------|------|
| **Jest** | Framework de tests |
| **Supertest** | Tests HTTP |
| **MongoDB Memory Server** | Base de test en mémoire |

### DevOps

| Technologie | Rôle |
|-------------|------|
| **Docker** | Containerisation |
| **Docker Compose** | Orchestration containers |

### Documentation

| Technologie | Rôle |
|-------------|------|
| **Swagger/OpenAPI** | Documentation API |
| **Markdown** | Documentation projet |

---

## 💡 Concepts clés expliqués

### 1. Programmation Orientée Objet (POO)

#### Classes et Instances

```typescript
// Définition d'une classe
class GameService {
  private gameModel: Model<IGameDocument>;

  constructor() {
    this.gameModel = GameModel;
  }

  public async create(data: IGame): Promise<IGameDocument> {
    const game = new this.gameModel(data);
    return await game.save();
  }
}

// Utilisation
const service = new GameService();  // Instance de la classe
const game = await service.create({ title: "Zelda" });
```

#### Encapsulation

```typescript
class User {
  private password: string;  // Privé : accessible uniquement dans la classe
  public email: string;      // Public : accessible partout

  constructor(email: string, password: string) {
    this.email = email;
    this.password = this.hashPassword(password);
  }

  private hashPassword(password: string): string {
    // Méthode privée
    return bcrypt.hashSync(password, 10);
  }

  public comparePassword(candidatePassword: string): boolean {
    // Méthode publique
    return bcrypt.compareSync(candidatePassword, this.password);
  }
}
```

### 2. Pattern MVC

**Model** : Représente les données
```typescript
// Game.model.ts
const GameSchema = new Schema({
  title: String,
  genre: String,
  price: Number
});
```

**Controller** : Gère les requêtes HTTP
```typescript
// Game.controller.ts
public create = async (req: Request, res: Response) => {
  const game = await this.gameService.create(req.body);
  res.status(201).json({ success: true, data: game });
};
```

**Service** : Contient la logique métier
```typescript
// Game.service.ts
public async create(gameData: IGame): Promise<IGameDocument> {
  // Logique de validation, transformation, etc.
  return await GameModel.create(gameData);
}
```

### 3. Middleware

Un middleware est une fonction qui s'exécute entre la requête et la réponse.

```typescript
// Exemple : middleware d'authentification
export const authenticate = (req, res, next) => {
  const token = req.headers.authorization;
  
  if (!token) {
    return res.status(401).json({ message: 'Non authentifié' });
  }
  
  try {
    const decoded = verifyToken(token);
    req.user = decoded;
    next();  // Passe au middleware suivant ou au contrôleur
  } catch (error) {
    return res.status(401).json({ message: 'Token invalide' });
  }
};

// Utilisation
router.get('/protected', authenticate, controller.getProtectedData);
```

### 4. JWT (JSON Web Token)

```typescript
// Génération d'un token
const token = jwt.sign(
  { userId: user._id, email: user.email },  // Payload
  'SECRET_KEY',                              // Clé secrète
  { expiresIn: '24h' }                       // Expiration
);

// Vérification d'un token
const decoded = jwt.verify(token, 'SECRET_KEY');
console.log(decoded.userId);  // Accès au payload
```

**Flux d'authentification** :
```
1. Login : POST /api/auth/login { email, password }
   ↓
2. Serveur vérifie les credentials
   ↓
3. Serveur génère un JWT et le renvoie
   ↓
4. Client stocke le token (localStorage, cookie)
   ↓
5. Requêtes suivantes : Header Authorization: Bearer <token>
   ↓
6. Serveur vérifie le token avant de traiter la requête
```

### 5. CRUD avec MongoDB

```typescript
// CREATE
const game = await GameModel.create({ title: "Zelda", genre: "Adventure" });

// READ (un seul)
const game = await GameModel.findById(gameId);

// READ (plusieurs avec filtre)
const games = await GameModel.find({ genre: "RPG" });

// UPDATE
const updatedGame = await GameModel.findByIdAndUpdate(
  gameId,
  { price: 49.99 },
  { new: true }  // Retourne le document mis à jour
);

// DELETE
const deletedGame = await GameModel.findByIdAndDelete(gameId);
```

### 6. Validation avec Joi

```typescript
const schema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(6).required()
});

const { error, value } = schema.validate(req.body);

if (error) {
  return res.status(400).json({ 
    message: error.details[0].message 
  });
}
```

### 7. Gestion des erreurs

```typescript
// Middleware de gestion des erreurs
export const errorHandler = (
  error: Error,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  console.error('Error:', error);

  res.status(500).json({
    success: false,
    message: error.message || 'Erreur serveur'
  });
};

// Utilisation dans le contrôleur
try {
  const game = await this.gameService.create(req.body);
  res.status(201).json({ success: true, data: game });
} catch (error) {
  next(error);  // Passe l'erreur au middleware errorHandler
}
```

---

## 🚀 Guide pas à pas

### Étape 1 : Installation et configuration

```bash
# 1. Cloner le projet
git clone <repository-url>
cd game-api

# 2. Installer les dépendances
npm install

# 3. Configurer les variables d'environnement
cp env.example.txt .env
# Éditer .env avec vos valeurs

# 4. Démarrer avec Docker
docker-compose up -d

# 5. Vérifier que tout fonctionne
curl http://localhost:3000/health
```

### Étape 2 : Comprendre l'architecture

1. **Lisez** `src/server.ts` : point d'entrée de l'application
2. **Étudiez** `src/routes/game.routes.ts` : définition des endpoints
3. **Analysez** `src/controllers/Game.controller.ts` : gestion des requêtes
4. **Examinez** `src/services/Game.service.ts` : logique métier
5. **Comprenez** `src/models/Game.model.ts` : schéma de données

### Étape 3 : Tester l'API

```bash
# S'inscrire
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"username":"john","email":"john@example.com","password":"password123"}'

# Récupérer le token dans la réponse, puis :

# Créer un jeu (nécessite admin/moderator)
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <votre_token>" \
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

# Lister les jeux (public)
curl http://localhost:3000/api/games

# Rechercher
curl "http://localhost:3000/api/games/search?genre=Adventure&minRating=9"
```

### Étape 4 : Utiliser Swagger

1. Ouvrez http://localhost:3000 dans votre navigateur
2. Explorez la documentation interactive
3. Testez les endpoints directement depuis Swagger
4. Cliquez sur "Authorize" pour ajouter votre token JWT

### Étape 5 : Lancer les tests

```bash
# Tous les tests
npm test

# Tests unitaires uniquement
npm run test:unit

# Tests d'intégration uniquement
npm run test:integration

# Avec coverage
npm run test -- --coverage
```

---

## 🎓 Exercices pratiques

### Exercice 1 : Ajouter un nouveau champ (Débutant)

**Objectif** : Ajouter un champ `developer` au modèle Game.

**Étapes** :
1. Modifier `src/models/Game.model.ts`
2. Ajouter le champ dans le schéma
3. Mettre à jour `src/types/game.types.ts`
4. Mettre à jour la validation dans `src/middlewares/validation.middleware.ts`
5. Tester avec Postman/Swagger

**Solution** :
```typescript
// Game.model.ts
developer: {
  type: String,
  required: [true, 'Le développeur est obligatoire'],
  trim: true
}

// game.types.ts
export interface IGame {
  // ... autres champs
  developer: string;
}

// validation.middleware.ts
developer: Joi.string().required()
```

### Exercice 2 : Créer un endpoint de statistiques (Intermédiaire)

**Objectif** : Créer un endpoint `/api/games/stats/average-price` qui retourne le prix moyen des jeux.

**Étapes** :
1. Ajouter la méthode dans `Game.service.ts`
2. Ajouter la méthode dans `Game.controller.ts`
3. Ajouter la route dans `game.routes.ts`
4. Documenter avec Swagger

**Indice** :
```typescript
// Service
public async getAveragePrice(): Promise<number> {
  const result = await GameModel.aggregate([
    { $group: { _id: null, avgPrice: { $avg: '$price' } } }
  ]);
  return result[0]?.avgPrice || 0;
}
```

### Exercice 3 : Ajouter des favoris utilisateur (Avancé)

**Objectif** : Permettre aux utilisateurs d'ajouter des jeux à leurs favoris.

**Étapes** :
1. Modifier le modèle User pour ajouter un tableau de favoris
2. Créer un nouveau service `Favorite.service.ts`
3. Créer un nouveau contrôleur `Favorite.controller.ts`
4. Créer des routes `/api/favorites`
5. Protéger les routes avec authentification
6. Écrire des tests

**Routes à implémenter** :
- `POST /api/favorites/:gameId` - Ajouter un favori
- `GET /api/favorites` - Lister mes favoris
- `DELETE /api/favorites/:gameId` - Retirer un favori

### Exercice 4 : Implémenter un système de cache (Expert)

**Objectif** : Utiliser Redis pour mettre en cache les requêtes fréquentes.

**Étapes** :
1. Ajouter Redis au `docker-compose.yml`
2. Installer `redis` et `@types/redis`
3. Créer un middleware de cache
4. Appliquer le cache sur les endpoints GET
5. Invalider le cache lors des modifications

---

## 📊 Points d'évaluation E3 & E4

### E3 - Conception et développement d'API back-end (4h)

**Compétences évaluées** : C7 à C11

✅ **Checklist E3** :

1. **C7 - Environnement**
   - [ ] Docker et Docker Compose configurés
   - [ ] Variables d'environnement correctement utilisées
   - [ ] Dépendances npm installées

2. **C8 - Architecture POO/MVC**
   - [ ] Séparation Models/Controllers/Services
   - [ ] Utilisation de classes TypeScript
   - [ ] Respect des principes SOLID

3. **C9 - Sécurisation**
   - [ ] Helmet configuré
   - [ ] CORS configuré
   - [ ] Rate limiting implémenté

4. **C10/C11 - Bases de données**
   - [ ] MongoDB connecté et fonctionnel
   - [ ] Modèles Mongoose créés avec validation
   - [ ] Index créés pour la performance

5. **C13 - Sauvegarde**
   - [ ] Script de sauvegarde automatique
   - [ ] Script de restauration testé

### E4 - API sécurisée documentée (4h)

**Compétences évaluées** : C12 à C17

✅ **Checklist E4** :

1. **C12 - Arbitrage SQL/NoSQL**
   - [ ] Documentation sur les choix techniques
   - [ ] Justification de l'utilisation de MongoDB

2. **C14 - Conception API REST**
   - [ ] Endpoints RESTful cohérents
   - [ ] Codes HTTP appropriés
   - [ ] Pagination implémentée
   - [ ] Filtres et recherche fonctionnels

3. **C15 - Sécurisation API**
   - [ ] Authentification JWT implémentée
   - [ ] Autorisation par rôles fonctionnelle
   - [ ] Validation des données avec Joi
   - [ ] Protection des routes sensibles

4. **C16 - Tests**
   - [ ] Tests unitaires écrits et passants
   - [ ] Tests d'intégration écrits et passants
   - [ ] Coverage > 70%

5. **C17 - Documentation Swagger**
   - [ ] Documentation Swagger complète
   - [ ] Tous les endpoints documentés
   - [ ] Exemples de requêtes/réponses
   - [ ] Documentation accessible via /

### Grille d'évaluation

| Critère | Points | Description |
|---------|--------|-------------|
| **Architecture** | /20 | MVC, POO, séparation des responsabilités |
| **Fonctionnalité** | /25 | CRUD complet, recherche, pagination |
| **Sécurité** | /20 | JWT, autorisation, validation, rate limiting |
| **Base de données** | /15 | Modèles, index, sauvegarde |
| **Tests** | /10 | Unitaires, intégration, coverage |
| **Documentation** | /10 | Swagger, README, commentaires |
| **Total** | /100 | |

---

## 📖 Ressources complémentaires

### Documentation officielle

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Mongoose Documentation](https://mongoosejs.com/docs/guide.html)
- [MongoDB Manual](https://www.mongodb.com/docs/manual/)
- [JWT Introduction](https://jwt.io/introduction)
- [Swagger/OpenAPI](https://swagger.io/docs/)

### Tutoriels recommandés

- [The Net Ninja - Node.js Crash Course](https://www.youtube.com/playlist?list=PL4cUxeGkcC9jsz4LDYc6kv3ymONOKxwBU)
- [Academind - TypeScript Course](https://www.youtube.com/watch?v=BwuLxPH8IDs)
- [Web Dev Simplified - REST API](https://www.youtube.com/watch?v=pKd0Rpw7O48)

### Livres

- "Node.js Design Patterns" par Mario Casciaro
- "Clean Code" par Robert C. Martin
- "TypeScript Quickly" par Yakov Fain

### Communautés

- [Stack Overflow](https://stackoverflow.com/questions/tagged/node.js)
- [Dev.to](https://dev.to/t/node)
- [Reddit r/node](https://www.reddit.com/r/node/)

---

## 🎯 Objectifs d'apprentissage

À la fin de ce projet, vous devriez être capable de :

✅ Concevoir une API REST complète et sécurisée  
✅ Utiliser TypeScript pour du code robuste et maintenable  
✅ Implémenter l'authentification JWT et l'autorisation  
✅ Travailler avec MongoDB et Mongoose  
✅ Écrire des tests unitaires et d'intégration  
✅ Documenter une API avec Swagger  
✅ Dockeriser une application  
✅ Appliquer les bonnes pratiques de sécurité  
✅ Utiliser le pattern MVC et la POO  
✅ Gérer les sauvegardes de bases de données  

---

## 💬 Besoin d'aide ?

1. **Consultez la documentation** : README.md, BACKUP.md, ARBITRAGE_SQL_NOSQL.md
2. **Utilisez Swagger** : http://localhost:3000 pour tester l'API
3. **Lisez les commentaires** : Le code est abondamment commenté
4. **Exécutez les tests** : Ils servent aussi de documentation

---

**Version** : 1.0  
**Date** : 2025  
**Licence** : MIT

Bon apprentissage ! 🚀


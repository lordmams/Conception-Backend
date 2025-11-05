# 🧪 Guide de Tests - Game API

## Table des matières

- [Introduction](#introduction)
- [Types de tests](#types-de-tests)
- [Tests unitaires](#tests-unitaires)
- [Tests d'intégration](#tests-dintégration)
- [Tests de charge](#tests-de-charge)
- [Coverage](#coverage)
- [Bonnes pratiques](#bonnes-pratiques)

---

## Introduction

Ce projet utilise une stratégie de tests complète couvrant :
- ✅ Tests unitaires (services, modèles)
- ✅ Tests d'intégration (routes, API)
- ✅ Tests de charge (performance)

**Framework utilisé** : Jest avec Supertest et MongoDB Memory Server

---

## Types de tests

### 1. Tests Unitaires

**Objectif** : Tester des unités isolées de code (fonctions, méthodes).

**Exemple** : Tester une méthode de service sans toucher à la base de données.

```typescript
// tests/unit/services/Game.service.test.ts
describe('GameService', () => {
  it('should create a game', async () => {
    const mockGame = { title: 'Zelda', genre: 'Adventure' };
    const service = new GameService();
    
    const game = await service.create(mockGame);
    
    expect(game.title).toBe('Zelda');
    expect(game.genre).toBe('Adventure');
  });
});
```

### 2. Tests d'Intégration

**Objectif** : Tester l'interaction entre plusieurs composants.

**Exemple** : Tester un endpoint complet de l'API.

```typescript
// tests/integration/game.routes.test.ts
describe('Game Routes', () => {
  it('POST /api/games should create a game', async () => {
    const response = await request(app)
      .post('/api/games')
      .send(mockGame)
      .expect(201);
      
    expect(response.body.success).toBe(true);
  });
});
```

### 3. Tests de Charge

**Objectif** : Tester la performance sous charge.

**Outils** : Apache JMeter, Artillery, k6, Autocannon

---

## Tests unitaires

### Lancer les tests unitaires

```bash
npm run test:unit
```

### Structure

```
tests/unit/
├── models/
│   └── Game.model.test.ts     # Tests du modèle Game
└── services/
    └── Game.service.test.ts    # Tests du service Game
```

### Exemple : Tester un modèle

```typescript
import { GameModel } from '../../src/models/Game.model';

describe('Game Model', () => {
  it('should validate required fields', async () => {
    const game = new GameModel({});
    
    let error;
    try {
      await game.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.title).toBeDefined();
    expect(error.errors.description).toBeDefined();
  });

  it('should reject invalid genre', async () => {
    const game = new GameModel({
      title: 'Test',
      description: 'Test description',
      genre: 'InvalidGenre',  // Genre invalide
      platform: ['PC'],
      releaseYear: 2024,
      publisher: 'Test'
    });
    
    let error;
    try {
      await game.validate();
    } catch (e) {
      error = e;
    }
    
    expect(error).toBeDefined();
    expect(error.errors.genre).toBeDefined();
  });
});
```

### Exemple : Tester un service

```typescript
import { GameService } from '../../src/services/Game.service';

describe('GameService', () => {
  let service: GameService;

  beforeEach(() => {
    service = new GameService();
  });

  describe('create', () => {
    it('should create a game successfully', async () => {
      const gameData = {
        title: 'Test Game',
        description: 'Test description',
        genre: 'Action',
        platform: ['PC'],
        releaseYear: 2024,
        publisher: 'Test Publisher',
        rating: 8.5,
        price: 49.99,
        inStock: true
      };

      const game = await service.create(gameData);

      expect(game).toBeDefined();
      expect(game._id).toBeDefined();
      expect(game.title).toBe('Test Game');
    });
  });

  describe('list', () => {
    it('should return paginated results', async () => {
      // Créer des jeux de test
      await service.create(mockGame1);
      await service.create(mockGame2);
      await service.create(mockGame3);

      const result = await service.list({ page: 1, limit: 2 });

      expect(result.data).toHaveLength(2);
      expect(result.pagination.totalItems).toBe(3);
      expect(result.pagination.totalPages).toBe(2);
    });
  });
});
```

---

## Tests d'intégration

### Lancer les tests d'intégration

```bash
npm run test:integration
```

### Structure

```
tests/integration/
└── game.routes.test.ts    # Tests des routes API
```

### Exemple : Tester les routes

```typescript
import request from 'supertest';
import express from 'express';
import { GameRoutes } from '../../src/routes/game.routes';

describe('Game Routes Integration Tests', () => {
  let app: Application;

  beforeEach(() => {
    app = express();
    app.use(express.json());
    
    const gameRoutes = new GameRoutes();
    app.use('/api/games', gameRoutes.getRouter());
  });

  describe('POST /api/games', () => {
    it('should create a game', async () => {
      const response = await request(app)
        .post('/api/games')
        .send(mockGame)
        .expect(201);

      expect(response.body.success).toBe(true);
      expect(response.body.data.title).toBe(mockGame.title);
    });
  });

  describe('GET /api/games', () => {
    it('should list games with pagination', async () => {
      const response = await request(app)
        .get('/api/games?page=1&limit=10')
        .expect(200);

      expect(response.body.success).toBe(true);
      expect(response.body.data).toBeInstanceOf(Array);
      expect(response.body.pagination).toBeDefined();
    });
  });

  describe('GET /api/games/search', () => {
    it('should search games by genre', async () => {
      const response = await request(app)
        .get('/api/games/search?genre=RPG')
        .expect(200);

      expect(response.body.data.every(g => g.genre === 'RPG')).toBe(true);
    });
  });
});
```

### Tester l'authentification

```typescript
describe('Authentication', () => {
  let token: string;

  beforeEach(async () => {
    // S'inscrire et récupérer le token
    const response = await request(app)
      .post('/api/auth/register')
      .send({
        username: 'testuser',
        email: 'test@example.com',
        password: 'password123'
      });
    
    token = response.body.token;
  });

  it('should access protected route with valid token', async () => {
    const response = await request(app)
      .get('/api/auth/profile')
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(response.body.success).toBe(true);
  });

  it('should reject access without token', async () => {
    await request(app)
      .get('/api/auth/profile')
      .expect(401);
  });
});
```

---

## Tests de charge

Les tests de charge permettent de vérifier la performance de l'API sous charge importante.

### Outil 1 : Apache JMeter (GUI)

**Installation** :
```bash
# Mac
brew install jmeter

# Linux
sudo apt install jmeter

# Windows : Télécharger depuis https://jmeter.apache.org/
```

**Utilisation** :
1. Lancer JMeter : `jmeter`
2. Créer un plan de test :
   - Add > Threads (Users) > Thread Group
   - Configurer : 100 utilisateurs, 10 secondes de montée en charge
3. Ajouter une requête HTTP :
   - Add > Sampler > HTTP Request
   - Server : localhost, Port : 3000, Path : /api/games
4. Ajouter des listeners pour les résultats
5. Exécuter le test

### Outil 2 : Artillery (CLI, JavaScript)

**Installation** :
```bash
npm install -g artillery
```

**Créer un fichier de test** `load-test.yml` :
```yaml
config:
  target: 'http://localhost:3000'
  phases:
    - duration: 60
      arrivalRate: 10    # 10 nouveaux utilisateurs par seconde
    - duration: 120
      arrivalRate: 50    # 50 nouveaux utilisateurs par seconde
  
scenarios:
  - name: "Lister les jeux"
    flow:
      - get:
          url: "/api/games"
  
  - name: "Rechercher des jeux"
    flow:
      - get:
          url: "/api/games/search?genre=RPG&minRating=8"
  
  - name: "Créer un jeu"
    flow:
      - post:
          url: "/api/auth/login"
          json:
            email: "admin@example.com"
            password: "admin123"
          capture:
            - json: "$.token"
              as: "token"
      - post:
          url: "/api/games"
          headers:
            Authorization: "Bearer {{ token }}"
          json:
            title: "Load Test Game"
            description: "Game created during load test"
            genre: "Action"
            platform: ["PC"]
            releaseYear: 2024
            publisher: "Load Test"
            rating: 8.5
            price: 59.99
            inStock: true
```

**Lancer le test** :
```bash
artillery run load-test.yml
```

**Résultats** :
```
Summary report @ 14:23:45 (+0200)
  Scenarios launched:  600
  Scenarios completed: 600
  Requests completed:  1200
  Response time (msec):
    min: 12
    max: 456
    median: 45
    p95: 123
    p99: 234
```

### Outil 3 : k6 (CLI, JavaScript)

**Installation** :
```bash
# Mac
brew install k6

# Linux
sudo apt-key adv --keyserver hkp://keyserver.ubuntu.com:80 --recv-keys C5AD17C747E3415A3642D57D77C6C491D6AC1D69
echo "deb https://dl.k6.io/deb stable main" | sudo tee /etc/apt/sources.list.d/k6.list
sudo apt-get update
sudo apt-get install k6
```

**Créer un fichier de test** `load-test.js` :
```javascript
import http from 'k6/http';
import { check, sleep } from 'k6';

export let options = {
  stages: [
    { duration: '30s', target: 10 },   // Montée à 10 utilisateurs
    { duration: '1m', target: 50 },    // Maintien à 50 utilisateurs
    { duration: '30s', target: 100 },  // Pic à 100 utilisateurs
    { duration: '1m', target: 0 },     // Redescente
  ],
  thresholds: {
    http_req_duration: ['p(95)<500'],  // 95% des requêtes < 500ms
    http_req_failed: ['rate<0.01'],    // Taux d'échec < 1%
  },
};

export default function () {
  // Test 1 : Lister les jeux
  let res1 = http.get('http://localhost:3000/api/games');
  check(res1, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });

  sleep(1);

  // Test 2 : Rechercher des jeux
  let res2 = http.get('http://localhost:3000/api/games/search?genre=RPG');
  check(res2, {
    'status is 200': (r) => r.status === 200,
  });

  sleep(1);
}
```

**Lancer le test** :
```bash
k6 run load-test.js
```

### Outil 4 : Autocannon (Node.js natif, très rapide)

**Installation** :
```bash
npm install -g autocannon
```

**Test simple** :
```bash
autocannon -c 100 -d 60 http://localhost:3000/api/games
```

Paramètres :
- `-c 100` : 100 connexions concurrentes
- `-d 60` : Durée de 60 secondes

**Test avancé** avec script :
```javascript
// load-test-autocannon.js
const autocannon = require('autocannon');

const instance = autocannon({
  url: 'http://localhost:3000',
  connections: 100,
  duration: 60,
  requests: [
    {
      method: 'GET',
      path: '/api/games'
    },
    {
      method: 'GET',
      path: '/api/games/search?genre=RPG'
    }
  ]
}, (err, result) => {
  console.log('Results:', result);
});

autocannon.track(instance, { renderProgressBar: true });
```

**Lancer** :
```bash
node load-test-autocannon.js
```

### Analyser les résultats

**Métriques importantes** :

1. **Throughput (Débit)** : Requêtes par seconde
   - Bon : > 1000 req/s pour une API simple
   - À améliorer : < 100 req/s

2. **Response Time (Temps de réponse)**
   - Excellent : p95 < 100ms
   - Bon : p95 < 500ms
   - À améliorer : p95 > 1000ms

3. **Error Rate (Taux d'erreur)**
   - Excellent : < 0.1%
   - Acceptable : < 1%
   - À corriger : > 5%

4. **Concurrency (Concurrence)**
   - Testez avec 10, 50, 100, 500, 1000 utilisateurs simultanés

### Optimisations si les performances sont mauvaises

1. **Ajouter des index MongoDB**
```typescript
GameSchema.index({ genre: 1, rating: -1 });
```

2. **Implémenter un cache Redis**
```typescript
const cachedGames = await redis.get('games:all');
if (cachedGames) return JSON.parse(cachedGames);
```

3. **Pagination stricte**
```typescript
// Limiter le nombre max de résultats
const limit = Math.min(req.query.limit || 10, 100);
```

4. **Connection pooling**
```typescript
mongoose.connect(uri, {
  maxPoolSize: 50,
  minPoolSize: 10
});
```

5. **Compression des réponses**
```typescript
import compression from 'compression';
app.use(compression());
```

---

## Coverage

### Lancer les tests avec coverage

```bash
npm test -- --coverage
```

### Interpréter les résultats

```
----------------------|---------|----------|---------|---------|
File                  | % Stmts | % Branch | % Funcs | % Lines |
----------------------|---------|----------|---------|---------|
All files             |   85.23 |    78.45 |   90.12 |   84.67 |
 controllers/         |   88.12 |    82.34 |   95.00 |   87.89 |
  Game.controller.ts  |   90.45 |    85.23 |   100   |   89.12 |
 models/              |   95.67 |    89.12 |   100   |   94.23 |
  Game.model.ts       |   95.67 |    89.12 |   100   |   94.23 |
 services/            |   78.34 |    65.78 |   80.00 |   77.89 |
  Game.service.ts     |   78.34 |    65.78 |   80.00 |   77.89 |
----------------------|---------|----------|---------|---------|
```

**Objectifs** :
- ✅ Statements : > 80%
- ✅ Branches : > 75%
- ✅ Functions : > 85%
- ✅ Lines : > 80%

### Visualiser le coverage

```bash
# Générer le rapport HTML
npm test -- --coverage

# Ouvrir le rapport
open coverage/lcov-report/index.html
```

---

## Bonnes pratiques

### 1. Isolation des tests

```typescript
beforeEach(async () => {
  // Nettoyer la base de données avant chaque test
  await GameModel.deleteMany({});
});
```

### 2. Données de test réutilisables

```typescript
// tests/fixtures/games.ts
export const mockGame = {
  title: 'Test Game',
  description: 'Test description for game',
  genre: 'Action',
  platform: ['PC'],
  releaseYear: 2024,
  publisher: 'Test Publisher',
  rating: 8.5,
  price: 49.99,
  inStock: true
};

export const mockGames = [mockGame, mockGame2, mockGame3];
```

### 3. Tests descriptifs

```typescript
// ❌ Mauvais
it('test 1', () => { ... });

// ✅ Bon
it('should return 404 when game does not exist', () => { ... });
```

### 4. Tests indépendants

```typescript
// ❌ Mauvais : dépend de l'ordre d'exécution
let gameId;
it('create game', () => { gameId = ... });
it('get game', () => { getGame(gameId) });

// ✅ Bon : chaque test est indépendant
it('should get game by id', async () => {
  const game = await createGame();
  const result = await getGame(game._id);
  expect(result).toBeDefined();
});
```

### 5. Utiliser des mocks quand nécessaire

```typescript
import { jest } from '@jest/globals';

// Mocker un service externe
jest.mock('../../src/services/EmailService', () => ({
  sendEmail: jest.fn().mockResolvedValue(true)
}));
```

### 6. Tests de cas limites

```typescript
describe('Edge cases', () => {
  it('should handle empty database', async () => {
    const games = await service.list();
    expect(games.data).toHaveLength(0);
  });

  it('should handle very long title', async () => {
    const longTitle = 'A'.repeat(300);
    const game = { ...mockGame, title: longTitle };
    
    await expect(service.create(game)).rejects.toThrow();
  });
});
```

---

## Scripts npm

```json
{
  "scripts": {
    "test": "jest --coverage",
    "test:watch": "jest --watch",
    "test:unit": "jest --testPathPattern=unit",
    "test:integration": "jest --testPathPattern=integration",
    "test:ci": "jest --coverage --ci --maxWorkers=2"
  }
}
```

---

## Résumé

✅ **Tests unitaires** : Testent des fonctions isolées  
✅ **Tests d'intégration** : Testent l'API complète  
✅ **Tests de charge** : Testent la performance  
✅ **Coverage** : Mesure la couverture du code  

**Objectif** : Une application bien testée est une application robuste et maintenable.

---

**Version** : 1.0  
**Date** : 2025


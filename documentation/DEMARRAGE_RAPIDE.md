# 🚀 Démarrage Rapide - Game API

## Installation en 5 minutes

### Étape 1 : Prérequis

Vérifiez que vous avez :
```bash
node --version   # >= 16
docker --version
docker-compose --version
```

### Étape 2 : Installation

```bash
# Cloner et installer
cd game-api
npm install
```

### Étape 3 : Démarrer

```bash
docker-compose up -d
```

Attendez 30 secondes que MongoDB démarre.

### Étape 4 : Vérifier

```bash
curl http://localhost:3000/health
```

Vous devriez voir :
```json
{
  "success": true,
  "message": "API is running",
  "database": "connected"
}
```

---

## 🎮 Tester l'API

### 1. Ouvrir Swagger

Ouvrez votre navigateur : **http://localhost:3000**

### 2. S'inscrire

Cliquez sur **POST /api/auth/register** dans Swagger, puis "Try it out" :

```json
{
  "username": "john",
  "email": "john@example.com",
  "password": "password123"
}
```

Cliquez sur "Execute".

### 3. Récupérer le token

Copiez le token depuis la réponse :
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

### 4. Autoriser dans Swagger

1. Cliquez sur le bouton **"Authorize"** en haut
2. Entrez : `Bearer VOTRE_TOKEN` (remplacez VOTRE_TOKEN)
3. Cliquez sur "Authorize"

### 5. Créer un jeu

Cliquez sur **POST /api/games**, puis "Try it out" :

```json
{
  "title": "The Legend of Zelda",
  "description": "Un jeu d'aventure épique en monde ouvert",
  "genre": "Adventure",
  "platform": ["Nintendo Switch"],
  "releaseYear": 2017,
  "publisher": "Nintendo",
  "rating": 9.8,
  "price": 59.99,
  "inStock": true
}
```

**Note** : Si vous obtenez une erreur 403, c'est normal ! Seuls les admins/moderators peuvent créer des jeux. Voir ci-dessous pour promouvoir votre utilisateur.

### 6. Lister les jeux

Cliquez sur **GET /api/games** (pas besoin d'authentification).

---

## 🛡️ Promouvoir un utilisateur en Admin

Par défaut, les nouveaux utilisateurs ont le rôle "user". Pour créer des jeux, vous devez être "admin" ou "moderator".

### Option 1 : Avec Mongo Express (Recommandé)

1. Ouvrez http://localhost:8082 (admin/admin123)
2. Cliquez sur "gamedb" > "users"
3. Trouvez votre utilisateur
4. Cliquez sur l'icône "Edit"
5. Changez `"role": "user"` en `"role": "admin"`
6. Cliquez sur "Save"

### Option 2 : Avec mongosh

```bash
docker exec -it gamedb-mongo mongosh gamedb

db.users.updateOne(
  { email: "john@example.com" },
  { $set: { role: "admin" } }
)
```

### Option 3 : Créer un admin via l'API (si vous êtes déjà admin)

```bash
curl -X PATCH http://localhost:3000/api/auth/users/USER_ID/role \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -d '{"role":"admin"}'
```

---

## 📊 Interfaces disponibles

| Interface | URL | Identifiants | Base |
|-----------|-----|--------------|------|
| **Swagger (API)** | http://localhost:3000 | Token JWT | - |
| **Mongo Express** | http://localhost:8082 | admin / admin123 | MongoDB (NoSQL) |
| **phpMyAdmin** | http://localhost:8083 | root / root123 | MySQL (SQL) |
| **API Health** | http://localhost:3000/health | - | - |

---

## 🧪 Tester avec cURL

### S'inscrire
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "john",
    "email": "john@example.com",
    "password": "password123"
  }'
```

### Se connecter
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "john@example.com",
    "password": "password123"
  }'

# Copier le token de la réponse
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Voir mon profil
```bash
curl http://localhost:3000/api/auth/profile \
  -H "Authorization: Bearer $TOKEN"
```

### Lister les jeux (public)
```bash
curl http://localhost:3000/api/games
```

### Rechercher des jeux (public)
```bash
curl "http://localhost:3000/api/games/search?genre=Adventure&minRating=9"
```

### Créer un jeu (admin/moderator)
```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TOKEN" \
  -d '{
    "title": "Elden Ring",
    "description": "RPG d'\''action en monde ouvert",
    "genre": "RPG",
    "platform": ["PS5", "Xbox Series X", "PC"],
    "releaseYear": 2022,
    "publisher": "Bandai Namco",
    "rating": 9.5,
    "price": 69.99,
    "inStock": true
  }'
```

---

## 🧹 Nettoyer et redémarrer

### Tout supprimer et recommencer
```bash
docker-compose down -v
docker-compose up -d
```

### Voir les logs
```bash
docker-compose logs -f api
docker-compose logs -f mongodb
```

### Arrêter temporairement
```bash
docker-compose stop
```

### Redémarrer
```bash
docker-compose start
```

---

## 📚 Prochaines étapes

1. **Apprendre** : Lisez [README_PEDAGOGIQUE.md](README_PEDAGOGIQUE.md)
2. **Explorer** : Testez tous les endpoints dans Swagger
3. **Modifier** : Essayez les exercices pratiques
4. **Tester** : Lancez les tests avec `npm test`

---

## ❓ Problèmes courants

### "Connection refused" à MongoDB ou MySQL

**Solution** : Attendez 30-60 secondes que les bases de données démarrent.

```bash
# Vérifier MongoDB
docker-compose logs mongodb

# Vérifier MySQL
docker-compose logs mysql
```

### "Token invalide"

**Solution** : Le token a expiré (24h par défaut). Reconnectez-vous.

### "403 Forbidden" lors de la création

**Solution** : Vous n'êtes pas admin/moderator. Suivez la section "Promouvoir un utilisateur".

### Port 3000 déjà utilisé

**Solution** : Changez le port dans `docker-compose.yml` ou arrêtez l'autre service.

---

## 🎯 Raccourcis utiles

```bash
# Démarrer
docker-compose up -d

# Arrêter
docker-compose down

# Logs en direct
docker-compose logs -f api

# Tests
npm test

# Mode développement (sans Docker)
npm run dev

# Sauvegarder la base
docker exec gamedb-backup /scripts/backup.sh

# Lister les sauvegardes
docker exec gamedb-backup ls -lh /backups
```

---

**✅ Vous êtes prêt !** Amusez-vous bien avec l'API ! 🎮

Pour aller plus loin, consultez les autres documentations :
- **README.md** - Documentation complète
- **README_PEDAGOGIQUE.md** - Guide d'apprentissage
- **TESTING.md** - Guide des tests
- **BACKUP.md** - Gestion des sauvegardes


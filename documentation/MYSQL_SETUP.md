# 🐬 MySQL dans Game API - Guide de configuration

## Introduction

Le projet Game API dispose maintenant d'une **architecture hybride** avec :
- 🍃 **MongoDB** (NoSQL) - Pour les jeux vidéo
- 🐬 **MySQL** (SQL) - Pour les données relationnelles (utilisateurs, rôles, logs, etc.)

---

## 🚀 Démarrage rapide

MySQL est déjà configuré dans le `docker-compose.yml`. Il démarre automatiquement avec :

```bash
docker-compose up -d
```

---

## 📊 Accès à MySQL

### Via phpMyAdmin (Interface Web)

**URL** : http://localhost:8083  
**Utilisateur** : `root`  
**Mot de passe** : `root123`

### Via ligne de commande

```bash
# Accéder au conteneur MySQL
docker exec -it gamedb-mysql mysql -u root -proot123

# Utiliser la base de données
mysql> USE gamedb_sql;
mysql> SHOW TABLES;
```

### Via client MySQL

```bash
mysql -h localhost -P 3306 -u gameapi -pgameapi123 gamedb_sql
```

---

## 🔧 Configuration

### Variables d'environnement

Dans `docker-compose.yml`, MySQL est configuré avec :

```yaml
environment:
  MYSQL_ROOT_PASSWORD: root123
  MYSQL_DATABASE: gamedb_sql
  MYSQL_USER: gameapi
  MYSQL_PASSWORD: gameapi123
```

### Connexion depuis l'API

Les variables d'environnement sont déjà configurées :

```env
MYSQL_HOST=mysql
MYSQL_PORT=3306
MYSQL_DATABASE=gamedb_sql
MYSQL_USER=gameapi
MYSQL_PASSWORD=gameapi123
```

---

## 💾 Schéma de base de données SQL

Voici un exemple de schéma pour gérer les utilisateurs avec MySQL :

### Table `users`

```sql
CREATE TABLE users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  email VARCHAR(100) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role_id INT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX idx_email (email),
  INDEX idx_username (username)
);
```

### Table `roles`

```sql
CREATE TABLE roles (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(20) NOT NULL UNIQUE,
  description VARCHAR(255),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO roles (name, description) VALUES 
  ('user', 'Utilisateur standard'),
  ('moderator', 'Modérateur avec droits étendus'),
  ('admin', 'Administrateur complet');
```

### Table `user_sessions`

```sql
CREATE TABLE user_sessions (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT NOT NULL,
  token_hash VARCHAR(255) NOT NULL,
  ip_address VARCHAR(45),
  user_agent TEXT,
  expires_at TIMESTAMP NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  INDEX idx_token (token_hash),
  INDEX idx_expires (expires_at)
);
```

### Table `audit_logs`

```sql
CREATE TABLE audit_logs (
  id INT AUTO_INCREMENT PRIMARY KEY,
  user_id INT,
  action VARCHAR(50) NOT NULL,
  resource VARCHAR(50) NOT NULL,
  resource_id VARCHAR(100),
  details JSON,
  ip_address VARCHAR(45),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE SET NULL,
  INDEX idx_user (user_id),
  INDEX idx_action (action),
  INDEX idx_created (created_at)
);
```

---

## 🔌 Connexion depuis Node.js

### Installation de mysql2

```bash
npm install mysql2
```

### Configuration de la connexion

Créez `src/config/mysql.ts` :

```typescript
import mysql from 'mysql2/promise';

export class MySQLConfig {
  private static instance: MySQLConfig;
  private pool: mysql.Pool;

  private constructor() {
    this.pool = mysql.createPool({
      host: process.env.MYSQL_HOST || 'localhost',
      port: parseInt(process.env.MYSQL_PORT || '3306'),
      user: process.env.MYSQL_USER || 'gameapi',
      password: process.env.MYSQL_PASSWORD || 'gameapi123',
      database: process.env.MYSQL_DATABASE || 'gamedb_sql',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0
    });
  }

  public static getInstance(): MySQLConfig {
    if (!MySQLConfig.instance) {
      MySQLConfig.instance = new MySQLConfig();
    }
    return MySQLConfig.instance;
  }

  public getPool(): mysql.Pool {
    return this.pool;
  }

  public async query(sql: string, params?: any[]): Promise<any> {
    const [rows] = await this.pool.execute(sql, params);
    return rows;
  }

  public async close(): Promise<void> {
    await this.pool.end();
  }
}
```

### Exemple d'utilisation

```typescript
import { MySQLConfig } from './config/mysql';

// Créer un utilisateur
const mysql = MySQLConfig.getInstance();
const result = await mysql.query(
  'INSERT INTO users (username, email, password_hash, role_id) VALUES (?, ?, ?, ?)',
  ['john', 'john@example.com', hashedPassword, 1]
);

// Récupérer un utilisateur
const users = await mysql.query(
  'SELECT u.*, r.name as role_name FROM users u JOIN roles r ON u.role_id = r.id WHERE u.email = ?',
  ['john@example.com']
);
```

---

## 🔄 Migration MongoDB → MySQL

### Pourquoi migrer certaines données ?

| Données | Base recommandée | Raison |
|---------|------------------|--------|
| **Jeux** | MongoDB | Schéma flexible, recherche complexe |
| **Utilisateurs** | MySQL | Relations strictes, sécurité |
| **Sessions** | MySQL | Transactions ACID |
| **Audit logs** | MySQL | Requêtes complexes, intégrité |
| **Commentaires** | MongoDB | Volume important, hiérarchie |

### Script de migration

```typescript
// Migrer les utilisateurs de MongoDB vers MySQL
import { UserModel } from './models/User.model';
import { MySQLConfig } from './config/mysql';

async function migrateUsers() {
  const mysql = MySQLConfig.getInstance();
  const users = await UserModel.find();

  for (const user of users) {
    await mysql.query(
      'INSERT INTO users (username, email, password_hash, role_id, created_at) VALUES (?, ?, ?, ?, ?)',
      [
        user.username,
        user.email,
        user.password,
        getRoleId(user.role),
        user.createdAt
      ]
    );
  }

  console.log(`✅ ${users.length} utilisateurs migrés`);
}

function getRoleId(role: string): number {
  const roles: Record<string, number> = {
    user: 1,
    moderator: 2,
    admin: 3
  };
  return roles[role] || 1;
}
```

---

## 🔐 Avantages MySQL pour l'authentification

### 1. Transactions ACID

```sql
START TRANSACTION;

INSERT INTO users (username, email, password_hash, role_id) 
VALUES ('john', 'john@example.com', 'hash', 1);

INSERT INTO user_sessions (user_id, token_hash, expires_at) 
VALUES (LAST_INSERT_ID(), 'token_hash', DATE_ADD(NOW(), INTERVAL 24 HOUR));

COMMIT;
```

### 2. Relations strictes

```sql
-- Impossible de créer une session pour un utilisateur inexistant
INSERT INTO user_sessions (user_id, token_hash, expires_at) 
VALUES (999, 'token', NOW()); -- ERREUR : Foreign key constraint fails
```

### 3. Requêtes complexes

```sql
-- Statistiques d'authentification
SELECT 
  u.username,
  COUNT(s.id) as session_count,
  MAX(s.created_at) as last_login
FROM users u
LEFT JOIN user_sessions s ON u.id = s.user_id
WHERE s.created_at > DATE_SUB(NOW(), INTERVAL 30 DAY)
GROUP BY u.id
ORDER BY session_count DESC;
```

---

## 📊 Monitoring MySQL

### Via phpMyAdmin

1. Ouvrez http://localhost:8083
2. Onglet "Status" → Vue d'ensemble
3. Onglet "Databases" → Taille des tables
4. Onglet "SQL" → Exécuter des requêtes

### Via ligne de commande

```sql
-- Taille de la base
SELECT 
  table_schema AS 'Database',
  ROUND(SUM(data_length + index_length) / 1024 / 1024, 2) AS 'Size (MB)'
FROM information_schema.tables
WHERE table_schema = 'gamedb_sql';

-- Tables et nombre de lignes
SELECT 
  table_name AS 'Table',
  table_rows AS 'Rows'
FROM information_schema.tables
WHERE table_schema = 'gamedb_sql';

-- Performance des requêtes
SHOW PROCESSLIST;
```

---

## 🛠️ Commandes utiles

```bash
# Démarrer MySQL seul
docker-compose up -d mysql

# Voir les logs MySQL
docker-compose logs -f mysql

# Redémarrer MySQL
docker-compose restart mysql

# Arrêter MySQL
docker-compose stop mysql

# Backup MySQL
docker exec gamedb-mysql mysqldump -u root -proot123 gamedb_sql > backup.sql

# Restaurer MySQL
docker exec -i gamedb-mysql mysql -u root -proot123 gamedb_sql < backup.sql

# Accéder au shell MySQL
docker exec -it gamedb-mysql bash
mysql -u root -proot123
```

---

## 🎓 Exercice pratique

### Objectif : Créer un système de logs d'audit

1. **Créer la table** (voir schéma ci-dessus)
2. **Créer un service** `src/services/AuditLog.service.ts`
3. **Logger les actions** : Chaque création/modification/suppression de jeu
4. **Créer un endpoint** `/api/audit-logs` (admin seulement)
5. **Tester** avec phpMyAdmin et Swagger

### Indice

```typescript
// AuditLog.service.ts
export class AuditLogService {
  private mysql: MySQLConfig;

  constructor() {
    this.mysql = MySQLConfig.getInstance();
  }

  async log(
    userId: number,
    action: string,
    resource: string,
    resourceId: string,
    details: any
  ) {
    await this.mysql.query(
      'INSERT INTO audit_logs (user_id, action, resource, resource_id, details) VALUES (?, ?, ?, ?, ?)',
      [userId, action, resource, resourceId, JSON.stringify(details)]
    );
  }

  async getLogs(limit: number = 100) {
    return await this.mysql.query(
      'SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT ?',
      [limit]
    );
  }
}
```

---

## 📚 Ressources

- [MySQL Documentation](https://dev.mysql.com/doc/)
- [mysql2 pour Node.js](https://github.com/sidorares/node-mysql2)
- [phpMyAdmin Documentation](https://docs.phpmyadmin.net/)
- [SQL Tutorial](https://www.w3schools.com/sql/)

---

## ✅ Checklist

- [ ] MySQL démarre correctement (`docker-compose up -d`)
- [ ] phpMyAdmin accessible sur http://localhost:8083
- [ ] Connexion possible avec `gameapi` user
- [ ] Tables créées selon le schéma
- [ ] Connexion depuis Node.js fonctionnelle
- [ ] Premiers enregistrements insérés

---

**🐬 Votre base MySQL est prête !** Explorez phpMyAdmin et commencez à créer vos tables.

Pour en savoir plus sur quand utiliser MySQL vs MongoDB, consultez [ARBITRAGE_SQL_NOSQL.md](ARBITRAGE_SQL_NOSQL.md).


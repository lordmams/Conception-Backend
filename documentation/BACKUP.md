# 🔒 Sauvegarde Automatisée MongoDB

Documentation complète du système de sauvegarde automatisée pour la base de données MongoDB.

---

## 📋 Table des matières

- [Démarrage Rapide](#-démarrage-rapide)
- [Vue d'ensemble](#-vue-densemble)
- [Installation](#-installation)
- [Utilisation](#-utilisation)
- [Restauration](#-restauration)
- [Commandes Helper](#-commandes-helper)
- [Configuration](#-configuration)
- [Gestion des Sauvegardes](#-gestion-des-sauvegardes)
- [Tutoriel Pratique](#-tutoriel-pratique)
- [Surveillance et Logs](#-surveillance-et-logs)
- [Dépannage](#-dépannage)
- [Bonnes Pratiques](#-bonnes-pratiques)
- [Sécurité](#-sécurité)
- [Changelog](#-changelog)

---

## ⚡ Démarrage Rapide

### Installation en 3 étapes

```bash
# 1. Démarrer le service de sauvegarde
docker-compose up -d backup

# 2. Créer votre première sauvegarde
docker exec gamedb-backup /scripts/backup.sh

# 3. Vérifier que ça fonctionne
docker exec gamedb-backup ls -lh /backups
```

### Commandes essentielles

```bash
# Sauvegarder maintenant
docker exec gamedb-backup /scripts/backup.sh

# Lister les sauvegardes
docker exec gamedb-backup ls -lh /backups

# Restaurer une sauvegarde
docker exec -it gamedb-backup /scripts/restore.sh <nom_fichier>

# Voir les logs
docker logs -f gamedb-backup

# Copier les sauvegardes sur votre machine
docker cp gamedb-backup:/backups ./local-backups
```

### Commandes simplifiées

```bash
# Charger les fonctions helper
source scripts/backup-commands.sh

# Utiliser les commandes
backup_now          # Sauvegarder maintenant
backup_list         # Lister les sauvegardes
backup_restore      # Restaurer
backup_status       # Voir le statut
backup_export       # Exporter localement
backup_help         # Aide complète
```

---

## 🎯 Vue d'ensemble

### Fonctionnalités

- ✅ **Sauvegardes automatiques** planifiées (tous les jours à 2h)
- ✅ **Compression automatique** des archives (.tar.gz)
- ✅ **Rétention configurable** (7 jours par défaut)
- ✅ **Scripts de restauration** interactifs et sécurisés
- ✅ **Conteneur Docker dédié** isolé du reste de l'infrastructure
- ✅ **Logs détaillés** pour le suivi et le monitoring
- ✅ **Multi-environnement** (production et développement)
- ✅ **Commandes helper** pour faciliter l'utilisation

### Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Docker Network                          │
│  ┌──────────────┐      ┌──────────────┐      ┌──────────┐ │
│  │   MongoDB    │◄─────│    Backup    │─────►│  Volume  │ │
│  │  Container   │      │   Container  │      │ /backups │ │
│  └──────────────┘      └──────────────┘      └──────────┘ │
│         │                      │                            │
│         │                      │ cron (2h00)               │
│         │                      ▼                            │
│         │              mongodump + tar.gz                   │
│         │                      │                            │
│         │                      ▼                            │
│         │              Rétention (7 jours)                  │
└─────────────────────────────────────────────────────────────┘
```

### Fichiers du système

```
game-api/
├── Dockerfile.backup                   # Image Docker personnalisée
├── docker-compose.yml                  # Service backup (production)
├── docker-compose.dev.yml              # Service backup (dev)
└── scripts/
    ├── backup.sh                       # Script principal
    ├── restore.sh                      # Script de restauration
    ├── backup-cron.sh                  # Wrapper cron
    ├── backup-entrypoint.sh            # Point d'entrée Docker
    └── backup-commands.sh              # Commandes utilitaires
```

---

## 📦 Installation

### Prérequis

- Docker et Docker Compose installés
- MongoDB en cours d'exécution
- Services définis dans `docker-compose.yml`

### Démarrage du service

**En production :**

```bash
docker-compose up -d backup
```

**En développement :**

```bash
docker-compose -f docker-compose.dev.yml up -d backup-dev
```

### Vérification

```bash
# Vérifier que le conteneur est en cours d'exécution
docker ps | grep backup

# Voir les logs de démarrage
docker logs gamedb-backup

# Tester la connexion MongoDB
docker exec gamedb-backup mongosh --host mongodb --eval "db.version()"
```

---

## 🚀 Utilisation

### Créer une sauvegarde manuelle

```bash
# Méthode 1 : Depuis l'hôte
docker exec gamedb-backup /scripts/backup.sh

# Méthode 2 : Depuis le conteneur
docker exec -it gamedb-backup bash
/scripts/backup.sh
```

**Sortie attendue :**
```
===================================
🔄 Début de la sauvegarde MongoDB
===================================
📅 Date: Sat Jan  4 15:30:00 CET 2025
🗄️  Base de données: gamedb
📁 Répertoire: /backups/backup_gamedb_20250104_153000

⏳ Sauvegarde en cours...
✅ Sauvegarde réussie!
📦 Compression de la sauvegarde...
💾 Taille de la sauvegarde: 2.3M
🧹 Nettoyage des sauvegardes anciennes (>7 jours)...

===================================
✅ Sauvegarde terminée avec succès
===================================
```

### Lister les sauvegardes

```bash
# Liste simple
docker exec gamedb-backup ls -lh /backups

# Liste détaillée triée par date
docker exec gamedb-backup ls -lht /backups | grep "backup_"

# Voir le nombre de sauvegardes
docker exec gamedb-backup bash -c "ls -1 /backups/backup_*.tar.gz | wc -l"
```

### Voir le contenu d'une sauvegarde

```bash
docker exec gamedb-backup tar -tzf /backups/backup_gamedb_20250104_153000.tar.gz
```

---

## 🔄 Restauration

### Lister les sauvegardes disponibles

```bash
docker exec gamedb-backup /scripts/restore.sh
```

### Restaurer une sauvegarde

```bash
# Restauration interactive (recommandé)
docker exec -it gamedb-backup /scripts/restore.sh backup_gamedb_20250104_153000.tar.gz
```

⚠️ **ATTENTION** : La restauration va **écraser** la base de données actuelle !

Le script demandera confirmation :
```
⚠️  Cette opération va écraser la base de données actuelle. Continuer? (yes/no)
```

### Restauration sans confirmation (automatique)

```bash
echo "yes" | docker exec -i gamedb-backup /scripts/restore.sh backup_gamedb_20250104_153000.tar.gz
```

### Vérifier la restauration

```bash
# Compter les documents restaurés
docker exec gamedb-mongo mongosh gamedb --eval "db.games.countDocuments()"

# Voir quelques documents
docker exec gamedb-mongo mongosh gamedb --eval "db.games.find().limit(2)"
```

---

## 🎯 Commandes Helper

### Charger les fonctions

```bash
source scripts/backup-commands.sh
```

### Fonctions disponibles

| Commande | Description |
|----------|-------------|
| `backup_now` | Créer une sauvegarde maintenant |
| `backup_list` | Lister les sauvegardes disponibles |
| `backup_restore <fichier>` | Restaurer une sauvegarde |
| `backup_logs` | Voir les logs en temps réel |
| `backup_export [répertoire]` | Exporter les sauvegardes localement |
| `backup_import <fichier>` | Importer une sauvegarde externe |
| `backup_status` | Voir le statut du service |
| `backup_test <fichier>` | Tester l'intégrité d'une sauvegarde |
| `backup_help` | Afficher l'aide |

### Exemples

```bash
# Créer une sauvegarde
backup_now

# Lister les sauvegardes
backup_list

# Voir le statut
backup_status

# Exporter toutes les sauvegardes
backup_export ./mes-backups

# Tester une sauvegarde
backup_test backup_gamedb_20250104_153000.tar.gz

# Restaurer
backup_restore backup_gamedb_20250104_153000.tar.gz
```

---

## ⚙️ Configuration

### Variables d'environnement

Configurables dans `docker-compose.yml` :

| Variable | Valeur par défaut | Description |
|----------|-------------------|-------------|
| `MONGO_HOST` | `mongodb` | Hôte MongoDB |
| `MONGO_PORT` | `27017` | Port MongoDB |
| `MONGO_DB` | `gamedb` | Nom de la base de données |
| `BACKUP_DIR` | `/backups` | Répertoire des sauvegardes |
| `RETENTION_DAYS` | `7` | Jours de rétention |
| `TZ` | `Europe/Paris` | Fuseau horaire |
| `BACKUP_ON_START` | `false` | Sauvegarder au démarrage |

### Modifier la configuration

Éditez `docker-compose.yml` :

```yaml
backup:
  environment:
    RETENTION_DAYS: 14        # Garder 14 jours
    TZ: America/New_York      # Changer le fuseau horaire
    BACKUP_ON_START: "true"   # Sauvegarder au démarrage
```

Puis redémarrez :

```bash
docker-compose up -d backup
```

### Modifier la planification

Par défaut : **tous les jours à 2h du matin**

Pour changer, éditez `Dockerfile.backup` ligne 22 :

```dockerfile
# Exemples de planifications :
# 0 2 * * *     # Tous les jours à 2h00
# 0 */6 * * *   # Toutes les 6 heures
# 0 0 * * 0     # Tous les dimanches à minuit
# 0 3 * * 1-5   # Du lundi au vendredi à 3h00

RUN echo "0 2 * * * /scripts/backup-cron.sh" > /etc/cron.d/backup-cron
```

Puis reconstruisez l'image :

```bash
docker-compose build backup
docker-compose up -d backup
```

---

## 📦 Gestion des Sauvegardes

### Où sont stockées les sauvegardes ?

Dans un volume Docker persistant :

```bash
# Inspecter le volume
docker volume inspect game-api_mongodb_backups
```

### Copier les sauvegardes vers l'hôte

```bash
# Copier toutes les sauvegardes
docker cp gamedb-backup:/backups ./local-backups

# Copier une sauvegarde spécifique
docker cp gamedb-backup:/backups/backup_gamedb_20250104_153000.tar.gz ./
```

### Importer une sauvegarde externe

```bash
# Copier vers le conteneur
docker cp ./backup_externe.tar.gz gamedb-backup:/backups/

# Restaurer
docker exec -it gamedb-backup /scripts/restore.sh backup_externe.tar.gz
```

### Nettoyer manuellement

```bash
# Supprimer les sauvegardes de plus de 30 jours
docker exec gamedb-backup find /backups -name "backup_*.tar.gz" -mtime +30 -delete

# Supprimer une sauvegarde spécifique
docker exec gamedb-backup rm /backups/backup_gamedb_20250104_153000.tar.gz
```

### Exporter vers un stockage externe

**Exemple avec rsync :**

```bash
docker cp gamedb-backup:/backups ./temp-backups
rsync -avz ./temp-backups/ user@backup-server:/path/to/backups/
rm -rf ./temp-backups
```

**Exemple avec AWS S3 :**

```bash
docker cp gamedb-backup:/backups ./temp-backups
aws s3 sync ./temp-backups s3://my-bucket/game-api-backups/
rm -rf ./temp-backups
```

---

## 🎓 Tutoriel Pratique

### Scénario complet : Backup et Restauration

#### Étape 1 : Ajouter des données de test

```bash
curl -X POST http://localhost:3000/api/games \
  -H "Content-Type: application/json" \
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

# Vérifier
curl http://localhost:3000/api/games
```

#### Étape 2 : Créer une sauvegarde

```bash
docker exec gamedb-backup /scripts/backup.sh
```

#### Étape 3 : Simuler une perte de données

```bash
# Supprimer tous les jeux
GAMES=$(curl -s http://localhost:3000/api/games | jq -r '.data[].id')
for id in $GAMES; do
  curl -X DELETE http://localhost:3000/api/games/$id
done

# Vérifier que la base est vide
curl http://localhost:3000/api/games
# Résultat : "totalItems": 0
```

#### Étape 4 : Restaurer

```bash
# Lister les sauvegardes
docker exec gamedb-backup /scripts/restore.sh

# Restaurer la dernière
echo "yes" | docker exec -i gamedb-backup /scripts/restore.sh backup_gamedb_20250104_153000.tar.gz
```

#### Étape 5 : Vérifier

```bash
# Les données sont de retour !
curl http://localhost:3000/api/games
```

🎉 **Restauration réussie !**

---

## 📊 Surveillance et Logs

### Voir les logs du service

```bash
# Logs complets
docker logs gamedb-backup

# Logs en temps réel
docker logs -f gamedb-backup

# Dernières 50 lignes
docker logs --tail 50 gamedb-backup
```

### Logs de sauvegarde détaillés

```bash
# Voir le fichier de log
docker exec gamedb-backup cat /backups/backup.log

# Suivre en temps réel
docker exec gamedb-backup tail -f /backups/backup.log
```

### Vérifier la dernière sauvegarde

```bash
# Date et taille
docker exec gamedb-backup ls -lht /backups | head -2

# Détails
docker exec gamedb-backup stat /backups/$(docker exec gamedb-backup ls -t /backups | grep backup_ | head -1)
```

### Tester l'intégrité

```bash
# Vérifier qu'une archive n'est pas corrompue
docker exec gamedb-backup tar -tzf /backups/backup_gamedb_20250104_153000.tar.gz > /dev/null && echo "✅ OK" || echo "❌ Corrupted"
```

### Espace disque

```bash
# Voir l'espace utilisé
docker exec gamedb-backup df -h /backups

# Taille totale des sauvegardes
docker exec gamedb-backup du -sh /backups

# Taille de chaque sauvegarde
docker exec gamedb-backup du -h /backups/backup_*.tar.gz
```

---

## 🛠️ Dépannage

### Le service ne démarre pas

```bash
# Voir les erreurs
docker logs gamedb-backup

# Vérifier que MongoDB est accessible
docker exec gamedb-backup mongosh --host mongodb --eval "db.version()"

# Redémarrer le service
docker-compose restart backup
```

### Les sauvegardes ne se créent pas automatiquement

```bash
# Vérifier que cron est actif
docker exec gamedb-backup ps aux | grep cron

# Vérifier la configuration cron
docker exec gamedb-backup crontab -l

# Vérifier les permissions des scripts
docker exec gamedb-backup ls -la /scripts
```

### Erreur "Cannot connect to MongoDB"

```bash
# Vérifier que MongoDB est en cours d'exécution
docker ps | grep mongodb

# Tester la connexion
docker exec gamedb-backup mongosh --host mongodb --eval "db.runCommand('ping')"

# Vérifier le réseau Docker
docker network inspect game-api_game-api-network
```

### Espace disque insuffisant

```bash
# Voir l'espace utilisé
docker exec gamedb-backup df -h /backups

# Réduire la rétention (éditer docker-compose.yml)
# RETENTION_DAYS: 3

# Ou nettoyer manuellement
docker exec gamedb-backup find /backups -name "backup_*.tar.gz" -mtime +3 -delete
```

### La restauration échoue

```bash
# Vérifier que le fichier existe
docker exec gamedb-backup ls -l /backups/backup_gamedb_20250104_153000.tar.gz

# Vérifier l'intégrité de l'archive
docker exec gamedb-backup tar -tzf /backups/backup_gamedb_20250104_153000.tar.gz

# Voir les erreurs détaillées
docker exec -it gamedb-backup bash
/scripts/restore.sh backup_gamedb_20250104_153000.tar.gz
```

---

## ✅ Bonnes Pratiques

### 1. Testez régulièrement la restauration

```bash
# Au moins une fois par mois
docker exec -it gamedb-backup /scripts/restore.sh <backup>
```

Une sauvegarde non testée n'a pas de valeur !

### 2. Gardez des copies hors site

```bash
# Automatiser l'export hebdomadaire
# Ajouter à crontab sur l'hôte :
# 0 3 * * 0 docker cp gamedb-backup:/backups /external/storage/

# Ou utiliser un cloud
aws s3 sync /backups s3://my-bucket/backups/
```

### 3. Surveillez l'espace disque

```bash
# Vérifier régulièrement
docker exec gamedb-backup df -h /backups

# Ajuster la rétention si nécessaire
# RETENTION_DAYS: 7  # dans docker-compose.yml
```

### 4. Documentez vos procédures

- Notez les restaurations réussies
- Maintenez un runbook à jour
- Formez votre équipe

### 5. Gardez des sauvegardes multiples

- **Local** : 7 jours (rotation automatique)
- **Externe** : 30 jours (stockage distant)
- **Archive** : 1 an (sauvegardes importantes)

### 6. Planification recommandée

| Environnement | Fréquence | Rétention |
|---------------|-----------|-----------|
| Production | Quotidienne (2h) | 7 jours local + 30 jours externe |
| Staging | Quotidienne | 3 jours |
| Développement | Hebdomadaire ou manuelle | 3 jours |

---

## 🔐 Sécurité

### Chiffrer les sauvegardes

```bash
# Chiffrer une sauvegarde
docker exec gamedb-backup bash -c "cd /backups && \
  openssl enc -aes-256-cbc -salt \
  -in backup_gamedb_20250104_153000.tar.gz \
  -out backup_gamedb_20250104_153000.tar.gz.enc"

# Déchiffrer
openssl enc -d -aes-256-cbc \
  -in backup_gamedb_20250104_153000.tar.gz.enc \
  -out backup_gamedb_20250104_153000.tar.gz
```

### Limiter l'accès

```bash
# Restreindre les permissions du volume
docker run --rm -v game-api_mongodb_backups:/backups alpine chmod 700 /backups
```

### Sauvegardes hors site sécurisées

- Utilisez SFTP/SCP pour les transferts
- Chiffrez avant le transfert
- Utilisez des credentials séparés pour les backups

---

## 📝 Changelog

### Version 1.0.0 - 2025-01-04

#### ✨ Fonctionnalités

- Service Docker dédié pour les sauvegardes MongoDB
- Scripts bash complets (backup, restore, cron, helper)
- Sauvegarde automatique planifiée (tous les jours à 2h)
- Compression automatique (.tar.gz)
- Rétention configurable (7 jours par défaut)
- Restauration interactive avec confirmation
- Commandes helper pour faciliter l'utilisation
- Support multi-environnement (production + développement)
- Logs détaillés et monitoring
- Documentation complète

#### 📦 Fichiers créés

- `Dockerfile.backup` - Image Docker personnalisée
- `docker-compose.yml` - Service backup (production)
- `docker-compose.dev.yml` - Service backup (développement)
- `scripts/backup.sh` - Script principal de sauvegarde
- `scripts/restore.sh` - Script de restauration
- `scripts/backup-cron.sh` - Wrapper pour cron
- `scripts/backup-entrypoint.sh` - Point d'entrée Docker
- `scripts/backup-commands.sh` - Commandes utilitaires
- `BACKUP.md` - Documentation complète (ce fichier)

#### 🎯 Statistiques

- 9 fichiers créés
- ~1000 lignes de code bash
- ~800 lignes de documentation
- Production ready ✅

---

## 🎯 Résumé des Commandes

```bash
# DÉMARRAGE
docker-compose up -d backup

# SAUVEGARDE
docker exec gamedb-backup /scripts/backup.sh

# LISTE
docker exec gamedb-backup ls -lh /backups

# RESTAURATION
docker exec -it gamedb-backup /scripts/restore.sh <fichier>

# LOGS
docker logs -f gamedb-backup

# EXPORT
docker cp gamedb-backup:/backups ./local-backups

# HELPER
source scripts/backup-commands.sh
backup_now          # Sauvegarder
backup_list         # Lister
backup_restore      # Restaurer
backup_status       # Status
backup_export       # Exporter
backup_help         # Aide
```

---

## 📞 Support

Pour toute question ou problème :

1. **Consultez cette documentation**
2. **Vérifiez les logs** : `docker logs gamedb-backup`
3. **Testez la connexion** : `docker exec gamedb-backup mongosh --host mongodb --eval "db.version()"`
4. **Consultez la documentation principale** : `README.md`

---

**✅ Votre système de sauvegarde est opérationnel !**

**Version** : 1.0.0 | **Date** : 2025-01-04 | **Status** : Production Ready

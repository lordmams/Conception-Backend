#!/bin/bash

#############################################
# Script de sauvegarde MongoDB
# Crée une sauvegarde complète de la base de données
#############################################

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
MONGO_HOST="${MONGO_HOST:-mongodb}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-gamedb}"
RETENTION_DAYS="${RETENTION_DAYS:-7}"

# Date et heure actuelles
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_NAME="backup_${MONGO_DB}_${TIMESTAMP}"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_NAME}"

echo "==================================="
echo "🔄 Début de la sauvegarde MongoDB"
echo "==================================="
echo "📅 Date: $(date)"
echo "🗄️  Base de données: ${MONGO_DB}"
echo "📁 Répertoire: ${BACKUP_PATH}"
echo ""

# Créer le répertoire de backup si nécessaire
mkdir -p "${BACKUP_DIR}"

# Effectuer le backup avec mongodump
echo "⏳ Sauvegarde en cours..."
if mongodump \
    --host="${MONGO_HOST}" \
    --port="${MONGO_PORT}" \
    --db="${MONGO_DB}" \
    --out="${BACKUP_PATH}" \
    --gzip; then
    
    echo "✅ Sauvegarde réussie!"
    
    # Créer une archive tar.gz du backup
    echo "📦 Compression de la sauvegarde..."
    cd "${BACKUP_DIR}"
    tar -czf "${BACKUP_NAME}.tar.gz" "${BACKUP_NAME}"
    
    # Supprimer le répertoire non compressé
    rm -rf "${BACKUP_NAME}"
    
    # Taille du backup
    BACKUP_SIZE=$(du -h "${BACKUP_NAME}.tar.gz" | cut -f1)
    echo "💾 Taille de la sauvegarde: ${BACKUP_SIZE}"
    
    # Nettoyer les anciennes sauvegardes
    echo "🧹 Nettoyage des sauvegardes anciennes (>${RETENTION_DAYS} jours)..."
    find "${BACKUP_DIR}" -name "backup_${MONGO_DB}_*.tar.gz" -type f -mtime +${RETENTION_DAYS} -delete
    
    # Lister les sauvegardes restantes
    echo ""
    echo "📋 Sauvegardes disponibles:"
    ls -lh "${BACKUP_DIR}"/backup_${MONGO_DB}_*.tar.gz 2>/dev/null || echo "Aucune autre sauvegarde trouvée"
    
    echo ""
    echo "==================================="
    echo "✅ Sauvegarde terminée avec succès"
    echo "==================================="
    echo "📁 Fichier: ${BACKUP_NAME}.tar.gz"
    echo "📅 $(date)"
    
    exit 0
else
    echo "❌ Erreur lors de la sauvegarde!"
    exit 1
fi


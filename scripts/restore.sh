#!/bin/bash

#############################################
# Script de restauration MongoDB
# Restaure une sauvegarde spécifique
#############################################

set -e

# Configuration
BACKUP_DIR="${BACKUP_DIR:-/backups}"
MONGO_HOST="${MONGO_HOST:-mongodb}"
MONGO_PORT="${MONGO_PORT:-27017}"
MONGO_DB="${MONGO_DB:-gamedb}"

echo "==================================="
echo "🔄 Restauration MongoDB"
echo "==================================="
echo ""

# Vérifier si un fichier de backup est spécifié
if [ -z "$1" ]; then
    echo "📋 Sauvegardes disponibles:"
    echo ""
    ls -lht "${BACKUP_DIR}"/backup_${MONGO_DB}_*.tar.gz 2>/dev/null || {
        echo "❌ Aucune sauvegarde trouvée dans ${BACKUP_DIR}"
        exit 1
    }
    echo ""
    echo "Usage: $0 <nom_du_fichier_backup>"
    echo "Exemple: $0 backup_gamedb_20250104_120000.tar.gz"
    exit 1
fi

BACKUP_FILE="$1"
BACKUP_PATH="${BACKUP_DIR}/${BACKUP_FILE}"

# Vérifier que le fichier existe
if [ ! -f "${BACKUP_PATH}" ]; then
    echo "❌ Erreur: Le fichier de sauvegarde n'existe pas: ${BACKUP_PATH}"
    exit 1
fi

echo "📁 Fichier de sauvegarde: ${BACKUP_FILE}"
echo "💾 Taille: $(du -h "${BACKUP_PATH}" | cut -f1)"
echo "🗄️  Base de données cible: ${MONGO_DB}"
echo ""

# Demander confirmation
read -p "⚠️  Cette opération va écraser la base de données actuelle. Continuer? (yes/no) " -n 3 -r
echo ""

if [[ ! $REPLY =~ ^[Yy][Ee][Ss]$ ]]; then
    echo "❌ Restauration annulée"
    exit 0
fi

# Extraire l'archive
echo "📦 Extraction de l'archive..."
TEMP_DIR=$(mktemp -d)
tar -xzf "${BACKUP_PATH}" -C "${TEMP_DIR}"

# Trouver le répertoire de backup
BACKUP_DIR_NAME=$(ls "${TEMP_DIR}")
RESTORE_PATH="${TEMP_DIR}/${BACKUP_DIR_NAME}/${MONGO_DB}"

if [ ! -d "${RESTORE_PATH}" ]; then
    echo "❌ Erreur: Structure de backup invalide"
    rm -rf "${TEMP_DIR}"
    exit 1
fi

# Restaurer avec mongorestore
echo "⏳ Restauration en cours..."
if mongorestore \
    --host="${MONGO_HOST}" \
    --port="${MONGO_PORT}" \
    --db="${MONGO_DB}" \
    --gzip \
    --drop \
    "${RESTORE_PATH}"; then
    
    echo ""
    echo "==================================="
    echo "✅ Restauration réussie!"
    echo "==================================="
    echo "📅 $(date)"
    
    # Nettoyer
    rm -rf "${TEMP_DIR}"
    exit 0
else
    echo "❌ Erreur lors de la restauration!"
    rm -rf "${TEMP_DIR}"
    exit 1
fi


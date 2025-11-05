#!/bin/bash

#############################################
# Script de sauvegarde automatique avec cron
# Utilisé par le service Docker backup
#############################################

set -e

# Charger les variables d'environnement
export BACKUP_DIR=/backups
export MONGO_HOST=mongodb
export MONGO_PORT=27017
export MONGO_DB=gamedb
export RETENTION_DAYS=7

# Log file
LOG_FILE="${BACKUP_DIR}/backup.log"

# Exécuter le backup et logger
{
    echo "======================================="
    echo "Sauvegarde automatique démarrée"
    echo "$(date)"
    echo "======================================="
    
    /scripts/backup.sh
    
    echo ""
    echo "Prochaine sauvegarde: selon la configuration cron"
    echo ""
} >> "${LOG_FILE}" 2>&1

# Garder seulement les 100 dernières lignes du log
tail -n 100 "${LOG_FILE}" > "${LOG_FILE}.tmp" && mv "${LOG_FILE}.tmp" "${LOG_FILE}"


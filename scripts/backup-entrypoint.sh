#!/bin/bash

#############################################
# Point d'entrée pour le conteneur de backup
#############################################

set -e

echo "=================================="
echo "🚀 Service de sauvegarde MongoDB"
echo "=================================="
echo "📅 Démarrage: $(date)"
echo "⏰ Fuseau horaire: ${TZ:-Europe/Paris}"
echo "🗄️  Base de données: ${MONGO_DB:-gamedb}"
echo "💾 Répertoire de sauvegarde: ${BACKUP_DIR:-/backups}"
echo "🔄 Rétention: ${RETENTION_DAYS:-7} jours"
echo ""

# Vérifier la configuration cron
echo "📋 Configuration planifiée:"
crontab -l

echo ""
echo "✅ Service prêt!"
echo ""

# Si BACKUP_ON_START est défini, faire un backup immédiat
if [ "${BACKUP_ON_START}" = "true" ]; then
    echo "🔄 Sauvegarde initiale au démarrage..."
    /scripts/backup-cron.sh
fi

# Démarrer cron en arrière-plan
cron

# Afficher les logs en temps réel
echo "📊 Surveillance des logs..."
echo "=================================="
echo ""

# Suivre les logs
tail -f /backups/backup.log 2>/dev/null || tail -f /var/log/cron.log


#!/bin/bash

#############################################
# Commandes utiles pour la gestion des sauvegardes
# Source ce fichier ou exécute les commandes individuellement
#############################################

# Couleurs pour l'affichage
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}=========================================${NC}"
echo -e "${BLUE}🔒 Commandes de Sauvegarde MongoDB${NC}"
echo -e "${BLUE}=========================================${NC}"
echo ""

# Fonction: Sauvegarder maintenant
backup_now() {
    echo -e "${GREEN}📦 Lancement d'une sauvegarde manuelle...${NC}"
    docker exec gamedb-backup /scripts/backup.sh
}

# Fonction: Lister les sauvegardes
backup_list() {
    echo -e "${GREEN}📋 Liste des sauvegardes disponibles:${NC}"
    echo ""
    docker exec gamedb-backup ls -lht /backups | grep "backup_"
}

# Fonction: Restaurer
backup_restore() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}⚠️  Usage: backup_restore <nom_fichier>${NC}"
        echo ""
        backup_list
        return 1
    fi
    
    echo -e "${GREEN}🔄 Restauration de: $1${NC}"
    docker exec -it gamedb-backup /scripts/restore.sh "$1"
}

# Fonction: Voir les logs
backup_logs() {
    echo -e "${GREEN}📊 Logs de sauvegarde:${NC}"
    docker logs -f gamedb-backup
}

# Fonction: Copier les sauvegardes localement
backup_export() {
    EXPORT_DIR="${1:-./backups-export}"
    echo -e "${GREEN}💾 Export des sauvegardes vers: ${EXPORT_DIR}${NC}"
    mkdir -p "$EXPORT_DIR"
    docker cp gamedb-backup:/backups/. "$EXPORT_DIR/"
    echo -e "${GREEN}✅ Export terminé!${NC}"
    ls -lh "$EXPORT_DIR"
}

# Fonction: Importer une sauvegarde
backup_import() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}⚠️  Usage: backup_import <chemin_fichier>${NC}"
        return 1
    fi
    
    if [ ! -f "$1" ]; then
        echo -e "${YELLOW}❌ Fichier non trouvé: $1${NC}"
        return 1
    fi
    
    FILENAME=$(basename "$1")
    echo -e "${GREEN}📥 Import de: ${FILENAME}${NC}"
    docker cp "$1" gamedb-backup:/backups/
    echo -e "${GREEN}✅ Import terminé! Vous pouvez maintenant restaurer avec:${NC}"
    echo -e "${BLUE}   backup_restore ${FILENAME}${NC}"
}

# Fonction: Statut du service
backup_status() {
    echo -e "${GREEN}📊 Statut du service de sauvegarde:${NC}"
    echo ""
    docker ps --filter name=gamedb-backup --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"
    echo ""
    echo -e "${GREEN}📁 Espace disque:${NC}"
    docker exec gamedb-backup df -h /backups
    echo ""
    echo -e "${GREEN}📦 Nombre de sauvegardes:${NC}"
    docker exec gamedb-backup bash -c "ls -1 /backups/backup_*.tar.gz 2>/dev/null | wc -l"
}

# Fonction: Tester une sauvegarde
backup_test() {
    if [ -z "$1" ]; then
        echo -e "${YELLOW}⚠️  Usage: backup_test <nom_fichier>${NC}"
        backup_list
        return 1
    fi
    
    echo -e "${GREEN}🔍 Test de l'intégrité de: $1${NC}"
    docker exec gamedb-backup tar -tzf "/backups/$1" > /dev/null 2>&1
    
    if [ $? -eq 0 ]; then
        echo -e "${GREEN}✅ La sauvegarde est valide${NC}"
        return 0
    else
        echo -e "${YELLOW}❌ La sauvegarde est corrompue!${NC}"
        return 1
    fi
}

# Afficher l'aide
backup_help() {
    echo -e "${BLUE}Commandes disponibles:${NC}"
    echo ""
    echo -e "  ${GREEN}backup_now${NC}                    - Créer une sauvegarde maintenant"
    echo -e "  ${GREEN}backup_list${NC}                   - Lister les sauvegardes disponibles"
    echo -e "  ${GREEN}backup_restore <fichier>${NC}     - Restaurer une sauvegarde"
    echo -e "  ${GREEN}backup_logs${NC}                   - Voir les logs en temps réel"
    echo -e "  ${GREEN}backup_export [répertoire]${NC}   - Exporter les sauvegardes localement"
    echo -e "  ${GREEN}backup_import <fichier>${NC}      - Importer une sauvegarde externe"
    echo -e "  ${GREEN}backup_status${NC}                 - Voir le statut du service"
    echo -e "  ${GREEN}backup_test <fichier>${NC}        - Tester l'intégrité d'une sauvegarde"
    echo -e "  ${GREEN}backup_help${NC}                   - Afficher cette aide"
    echo ""
    echo -e "${BLUE}Exemples:${NC}"
    echo -e "  backup_now"
    echo -e "  backup_list"
    echo -e "  backup_restore backup_gamedb_20250104_143000.tar.gz"
    echo -e "  backup_export ./mes-backups"
    echo ""
}

# Si le script est exécuté directement, afficher l'aide
if [ "${BASH_SOURCE[0]}" == "${0}" ]; then
    backup_help
    echo -e "${YELLOW}💡 Astuce: Source ce fichier pour utiliser les fonctions:${NC}"
    echo -e "   ${BLUE}source scripts/backup-commands.sh${NC}"
    echo ""
fi


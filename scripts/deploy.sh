#!/bin/bash
# ============================================
# SCRIPT DE DÉPLOIEMENT AUTOMATIQUE
# Hetzner VPS - live.angeline-nj.xyz
# ============================================

set -e

echo "🚀 Starting deployment..."

# Variables
APP_DIR="/var/www/angeline-live"
BRANCH="master"

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

# Fonction de log
log_info() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

# Vérifier que nous sommes dans le bon répertoire
if [ ! -d "$APP_DIR" ]; then
    log_error "Directory $APP_DIR does not exist!"
    exit 1
fi

cd $APP_DIR

# Backup de la configuration actuelle
log_info "Creating backup..."
cp apps/live-core/.env.production /tmp/live-core.env.backup 2>/dev/null || true
cp apps/web-admin/.env.production /tmp/web-admin.env.backup 2>/dev/null || true

# Pull du code
log_info "Pulling latest code from $BRANCH..."
git fetch origin
git reset --hard origin/$BRANCH

# Restaurer les fichiers .env
log_info "Restoring environment files..."
cp /tmp/live-core.env.backup apps/live-core/.env.production 2>/dev/null || log_warn ".env.production not restored for live-core"
cp /tmp/web-admin.env.backup apps/web-admin/.env.production 2>/dev/null || log_warn ".env.production not restored for web-admin"

# Installation des dépendances
log_info "Installing dependencies..."
npm install --production=false

# Build des packages dans l'ordre de dépendances
log_info "Building packages in dependency order..."
npm run build --workspace=packages/shared
npm run build --workspace=packages/intents
npm run build --workspace=packages/llm
npm run build --workspace=packages/obs-render
npm run build --workspace=packages/oracle-system
npm run build --workspace=packages/tikfinity-bridge
npm run build --workspace=packages/elevenlabs-tts

# Build web-admin
log_info "Building web-admin..."
cd apps/web-admin
npm run build
cd ../..

# Build live-core
log_info "Building live-core..."
cd apps/live-core
npm run build
cd ../..

# Vérifier que les builds existent
if [ ! -d "apps/web-admin/.next" ]; then
    log_error "web-admin build failed!"
    exit 1
fi

if [ ! -d "apps/live-core/dist" ]; then
    log_error "live-core build failed!"
    exit 1
fi

# Permissions
log_info "Setting permissions..."
chown -R www-data:www-data $APP_DIR
chmod 600 apps/live-core/.env.production 2>/dev/null || true
chmod 600 apps/web-admin/.env.production 2>/dev/null || true

# Redémarrer PM2
log_info "Restarting PM2 applications..."
pm2 restart ecosystem.config.js

# Attendre que les apps démarrent
sleep 3

# Vérifier le statut
log_info "Checking PM2 status..."
pm2 status

# Vérifier que les apps sont online
WEB_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="angeline-web-admin") | .pm2_env.status')
CORE_STATUS=$(pm2 jlist | jq -r '.[] | select(.name=="angeline-live-core") | .pm2_env.status')

if [ "$WEB_STATUS" != "online" ]; then
    log_error "web-admin is not online! Status: $WEB_STATUS"
    pm2 logs angeline-web-admin --lines 50
    exit 1
fi

if [ "$CORE_STATUS" != "online" ]; then
    log_error "live-core is not online! Status: $CORE_STATUS"
    pm2 logs angeline-live-core --lines 50
    exit 1
fi

# Test de santé
log_info "Testing health endpoint..."
HEALTH_CHECK=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3001/api/health)

if [ "$HEALTH_CHECK" != "200" ]; then
    log_error "Health check failed! HTTP $HEALTH_CHECK"
    exit 1
fi

# Recharger Nginx
log_info "Reloading Nginx..."
systemctl reload nginx

# Vérifier Nginx
if ! systemctl is-active --quiet nginx; then
    log_error "Nginx is not running!"
    exit 1
fi

# Nettoyage
log_info "Cleaning up..."
rm -f /tmp/*.env.backup

# Résumé
log_info "============================================"
log_info "✅ Deployment completed successfully!"
log_info "============================================"
log_info "Web Admin: https://live.angeline-nj.xyz/"
log_info "API Health: https://live.angeline-nj.xyz/api/health"
log_info ""
log_info "PM2 Status:"
pm2 jlist | jq -r '.[] | "\(.name): \(.pm2_env.status) (uptime: \(.pm2_env.pm_uptime))"'

log_info ""
log_info "Logs: pm2 logs"
log_info "============================================"

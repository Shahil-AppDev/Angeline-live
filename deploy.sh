#!/bin/bash

###############################################################################
# ANGELINE NJ LIVE - DEPLOY SCRIPT
# Déploiement sur VPS: live.angeline-nj.xyz (77.42.34.90)
###############################################################################

set -e

# Configuration
SERVER_USER="root"
SERVER_HOST="77.42.34.90"
SERVER_DOMAIN="live.angeline-nj.xyz"
DEPLOY_PATH="/var/www/angeline-live"
REPO_URL="https://github.com/Shahil-AppDev/Angeline-live.git"
BRANCH="main"

# Couleurs pour les logs
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${BLUE}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║   🔮 ANGELINE NJ LIVE - DEPLOYMENT SCRIPT 🔮        ║${NC}"
echo -e "${BLUE}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""

# Fonction de log
log_info() {
    echo -e "${GREEN}✓${NC} $1"
}

log_warn() {
    echo -e "${YELLOW}⚠${NC} $1"
}

log_error() {
    echo -e "${RED}✗${NC} $1"
}

# Vérifier la connexion SSH
echo -e "${BLUE}[1/7]${NC} Vérification de la connexion SSH..."
if ssh -o ConnectTimeout=5 -o BatchMode=yes ${SERVER_USER}@${SERVER_HOST} exit 2>/dev/null; then
    log_info "Connexion SSH OK"
else
    log_error "Impossible de se connecter au serveur"
    echo "Vérifiez que votre clé SSH est configurée correctement"
    exit 1
fi

# Déploiement sur le serveur
echo -e "${BLUE}[2/7]${NC} Déploiement sur le serveur..."

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

# Variables (redéfinies dans le contexte SSH)
DEPLOY_PATH="/var/www/angeline-live"
REPO_URL="https://github.com/Shahil-AppDev/Angeline-live.git"
BRANCH="main"

echo "📦 Installation des dépendances système..."

# Installer Node.js 20.x si pas déjà installé
if ! command -v node &> /dev/null; then
    echo "Installation de Node.js 20.x..."
    curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
    apt-get install -y nodejs
    echo "✅ Node.js installé"
else
    echo "✅ Node.js $(node --version) déjà installé"
fi

# Installer PM2 globalement si pas déjà installé
if ! command -v pm2 &> /dev/null; then
    echo "Installation de PM2..."
    npm install -g pm2
    echo "✅ PM2 installé"
else
    echo "✅ PM2 déjà installé"
fi

echo "🔄 Clonage/mise à jour du repository..."
if [ -d "$DEPLOY_PATH" ]; then
    cd $DEPLOY_PATH
    git fetch origin
    git reset --hard origin/$BRANCH
    git pull origin $BRANCH
else
    mkdir -p /var/www
    git clone $REPO_URL $DEPLOY_PATH
    cd $DEPLOY_PATH
    git checkout $BRANCH
fi

echo "📦 Installation des dépendances npm..."
npm install

echo "🔧 Configuration de l'environnement..."
# Créer le fichier .env s'il n'existe pas
if [ ! -f .env ]; then
    cp .env.example .env
    echo "⚠️  ATTENTION: Fichier .env créé depuis .env.example"
    echo "⚠️  Vous devez le configurer avec vos vraies clés API"
fi

echo "🏗️  Build des applications..."
# Build web-admin
cd apps/web-admin
npm run build
cd ../..

echo "🔄 Redémarrage des services avec PM2..."
# Arrêter les anciens processus s'ils existent
pm2 delete angeline-live-core 2>/dev/null || true
pm2 delete angeline-web-admin 2>/dev/null || true

# Démarrer live-core
cd apps/live-core
pm2 start src/index.ts --name angeline-live-core --interpreter ts-node
cd ../..

# Démarrer web-admin
cd apps/web-admin
pm2 start npm --name angeline-web-admin -- start
cd ../..

# Sauvegarder la configuration PM2
pm2 save

# Configurer PM2 pour démarrer au boot
pm2 startup

echo "✅ PM2 configuré pour démarrage automatique"

echo "✅ Déploiement terminé!"
pm2 status

ENDSSH

log_info "Déploiement sur le serveur terminé"

# Configuration Nginx
echo -e "${BLUE}[3/7]${NC} Configuration Nginx..."

ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
set -e

# Créer la configuration Nginx si elle n'existe pas
NGINX_CONF="/etc/nginx/sites-available/angeline-live"

if [ ! -f "$NGINX_CONF" ]; then
    cat > $NGINX_CONF << 'EOF'
# Angeline NJ Live - Nginx Configuration

# Redirect HTTP to HTTPS
server {
    listen 80;
    server_name live.angeline-nj.xyz;
    return 301 https://$server_name$request_uri;
}

# HTTPS Server
server {
    listen 443 ssl http2;
    server_name live.angeline-nj.xyz;

    # SSL Configuration (à configurer avec Certbot)
    # ssl_certificate /etc/letsencrypt/live/live.angeline-nj.xyz/fullchain.pem;
    # ssl_certificate_key /etc/letsencrypt/live/live.angeline-nj.xyz/privkey.pem;

    # Web Admin (Next.js)
    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Live Core API
    location /api/ {
        proxy_pass http://localhost:3001/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # WebSocket support
    location /socket.io/ {
        proxy_pass http://localhost:3001/socket.io/;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;

    # Logs
    access_log /var/log/nginx/angeline-live-access.log;
    error_log /var/log/nginx/angeline-live-error.log;
}
EOF

    # Activer le site
    ln -sf $NGINX_CONF /etc/nginx/sites-enabled/angeline-live
    
    echo "✅ Configuration Nginx créée"
    echo "⚠️  N'oubliez pas de configurer SSL avec: certbot --nginx -d live.angeline-nj.xyz"
else
    echo "ℹ️  Configuration Nginx existe déjà"
fi

# Tester la configuration Nginx
nginx -t

# Recharger Nginx
systemctl reload nginx

echo "✅ Nginx configuré"

ENDSSH

log_info "Configuration Nginx terminée"

# Configuration SSL (optionnel)
echo -e "${BLUE}[4/7]${NC} Configuration SSL..."
read -p "Voulez-vous configurer SSL avec Let's Encrypt maintenant? (y/n) " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
    # Installer Certbot si pas déjà installé
    if ! command -v certbot &> /dev/null; then
        echo "Installation de Certbot..."
        apt-get update
        apt-get install -y certbot python3-certbot-nginx
    fi
    
    # Obtenir le certificat SSL
    certbot --nginx -d live.angeline-nj.xyz --non-interactive --agree-tos --email admin@angeline-nj.xyz
    
    echo "✅ SSL configuré"
ENDSSH
    log_info "SSL configuré avec succès"
else
    log_warn "SSL non configuré. Exécutez manuellement: certbot --nginx -d live.angeline-nj.xyz"
fi

# Configuration du firewall
echo -e "${BLUE}[5/7]${NC} Configuration du firewall..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
# Vérifier si UFW est actif
if command -v ufw &> /dev/null; then
    echo "Configuration du firewall UFW..."
    # Autoriser les ports nécessaires
    ufw allow 22/tcp    # SSH
    ufw allow 80/tcp    # HTTP
    ufw allow 443/tcp   # HTTPS
    ufw --force enable
    echo "✅ Firewall configuré"
else
    echo "⚠️  UFW non installé, firewall non configuré"
fi
ENDSSH

log_info "Firewall configuré"

# Vérification finale
echo -e "${BLUE}[6/7]${NC} Vérification du déploiement..."
ssh ${SERVER_USER}@${SERVER_HOST} << 'ENDSSH'
echo "📊 Status des services:"
pm2 status
echo ""
echo "🌐 Status Nginx:"
systemctl status nginx --no-pager | head -n 5
ENDSSH

# Résumé
echo ""
echo -e "${BLUE}[7/7]${NC} Résumé du déploiement"
echo -e "${GREEN}╔═══════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║              ✅ DÉPLOIEMENT RÉUSSI ✅                ║${NC}"
echo -e "${GREEN}╚═══════════════════════════════════════════════════════╝${NC}"
echo ""
echo -e "🌐 URL: ${BLUE}https://${SERVER_DOMAIN}${NC}"
echo -e "📡 API: ${BLUE}https://${SERVER_DOMAIN}/api${NC}"
echo -e "🔌 WebSocket: ${BLUE}wss://${SERVER_DOMAIN}/socket.io${NC}"
echo ""
echo -e "${YELLOW}⚠️  ACTIONS REQUISES:${NC}"
echo -e "1. Configurer le fichier .env sur le serveur avec vos vraies clés API"
echo -e "   ${BLUE}ssh ${SERVER_USER}@${SERVER_HOST}${NC}"
echo -e "   ${BLUE}nano ${DEPLOY_PATH}/.env${NC}"
echo ""
echo -e "2. Redémarrer les services après configuration:"
echo -e "   ${BLUE}pm2 restart all${NC}"
echo ""
echo -e "3. Vérifier les logs:"
echo -e "   ${BLUE}pm2 logs${NC}"
echo ""
echo -e "${GREEN}🎉 Votre système Angeline NJ Live est déployé!${NC}"

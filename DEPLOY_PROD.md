# 🚀 DÉPLOIEMENT PRODUCTION - live.angeline-nj.xyz

## ⚠️ SÉCURITÉ CRITIQUE - ACTIONS IMMÉDIATES

### Clés API Compromises (Exposées dans le Chat)

**RÉGÉNÉRER IMMÉDIATEMENT:**

1. **ElevenLabs API Key**
   - URL: https://elevenlabs.io/app/settings/api-keys
   - Ancienne clé: `sk_a9c76298ac108179fc31bab71764397ab3cedf828d7af292`
   - Action: Révoquer + Générer nouvelle clé
   - Où la mettre: `/var/www/angeline-live/apps/live-core/.env.production`

2. **JWT Secrets**
   - Générer avec: `openssl rand -base64 32`
   - Où les mettre: `/var/www/angeline-live/apps/web-admin/.env.production`

---

## 📋 PRÉREQUIS VPS

### Système
- Ubuntu 20.04+ ou Debian 11+
- Node.js 20.x
- PM2 (process manager)
- Nginx
- Certbot (Let's Encrypt)
- Git

### Domaine
- DNS configuré: `live.angeline-nj.xyz` → IP du VPS
- Propagation DNS complète (vérifier avec `nslookup live.angeline-nj.xyz`)

---

## 🔧 ÉTAPE 1: INSTALLATION DES DÉPENDANCES

```bash
# Connexion SSH au VPS
ssh root@YOUR_VPS_IP

# Mise à jour système
apt update && apt upgrade -y

# Installation Node.js 20.x
curl -fsSL https://deb.nodesource.com/setup_20.x | bash -
apt install -y nodejs

# Vérification
node --version  # doit afficher v20.x.x
npm --version

# Installation PM2 globalement
npm install -g pm2

# Installation Nginx
apt install -y nginx

# Installation Certbot
apt install -y certbot python3-certbot-nginx

# Installation Git
apt install -y git
```

---

## 📦 ÉTAPE 2: DÉPLOIEMENT DU CODE

```bash
# Créer répertoire de déploiement
mkdir -p /var/www
cd /var/www

# Cloner le repository
git clone https://github.com/VOTRE_USERNAME/Angeline-live.git angeline-live
cd angeline-live

# Installer les dépendances (monorepo)
npm install

# Build tous les packages
npm run build --workspaces

# Build web-admin (Next.js)
cd apps/web-admin
npm run build
cd ../..

# Build live-core (TypeScript)
cd apps/live-core
npm run build
cd ../..
```

---

## 🔐 ÉTAPE 3: CONFIGURATION ENVIRONNEMENT

### 3.1 - Générer les secrets

```bash
# Générer JWT_SECRET
openssl rand -base64 32

# Générer SESSION_SECRET
openssl rand -base64 32

# Noter ces valeurs pour les étapes suivantes
```

### 3.2 - Configurer live-core

```bash
cd /var/www/angeline-live/apps/live-core

# Copier le template
cp .env.production .env.production.local

# Éditer avec nano ou vim
nano .env.production

# Remplir OBLIGATOIREMENT:
# - ELEVENLABS_API_KEY=VOTRE_NOUVELLE_CLE_REGENEREE
# - OPENROUTER_API_KEY=votre_cle_openrouter
# - CORS_ORIGIN=https://live.angeline-nj.xyz
```

**Contenu `.env.production`:**
```env
NODE_ENV=production
LIVE_CORE_PORT=3001

# TikFinity - DÉSACTIVÉ sur VPS (géré par PC Windows)
TIKFINITY_ENABLED=false

# OBS - DÉSACTIVÉ sur VPS (géré par PC Windows)
OBS_ENABLED=false

# OpenRouter API
OPENROUTER_API_KEY=VOTRE_CLE_ICI

# ElevenLabs API - RÉGÉNÉRER CETTE CLÉ
ELEVENLABS_API_KEY=NOUVELLE_CLE_REGENEREE
ELEVENLABS_VOICE_ID=fNmw8sukfGuvWVOp33Ge
ELEVENLABS_VOLUME=80

# CORS
CORS_ORIGIN=https://live.angeline-nj.xyz

LOG_LEVEL=INFO
MAX_CONTEXT_AGE=300000
MAX_MESSAGES_PER_USER=5
```

### 3.3 - Configurer web-admin

```bash
cd /var/www/angeline-live/apps/web-admin

# Créer .env.production
nano .env.production
```

**Contenu `.env.production`:**
```env
NODE_ENV=production

# API - Même domaine (pas de CORS)
NEXT_PUBLIC_API_BASE_URL=https://live.angeline-nj.xyz/api

# JWT Secret (généré avec openssl)
JWT_SECRET=VOTRE_JWT_SECRET_32_CHARS

# Session Secret
SESSION_SECRET=VOTRE_SESSION_SECRET_32_CHARS
```

### 3.4 - Permissions

```bash
cd /var/www/angeline-live

# Créer répertoires logs et cache
mkdir -p logs
mkdir -p cache/tts

# Permissions
chown -R www-data:www-data /var/www/angeline-live
chmod -R 755 /var/www/angeline-live
chmod 600 apps/live-core/.env.production
chmod 600 apps/web-admin/.env.production
```

---

## 🌐 ÉTAPE 4: CONFIGURATION NGINX

```bash
# Copier la config Nginx
cp /var/www/angeline-live/nginx-live.angeline-nj.xyz.conf /etc/nginx/sites-available/live.angeline-nj.xyz

# Créer symlink
ln -s /etc/nginx/sites-available/live.angeline-nj.xyz /etc/nginx/sites-enabled/

# Supprimer default si présent
rm -f /etc/nginx/sites-enabled/default

# Créer répertoire pour certbot
mkdir -p /var/www/certbot

# Tester la config
nginx -t

# Si OK, recharger Nginx
systemctl reload nginx
```

---

## 🔒 ÉTAPE 5: CERTIFICAT SSL (Let's Encrypt)

```bash
# Obtenir certificat SSL
certbot certonly --nginx -d live.angeline-nj.xyz --email votre@email.com --agree-tos --no-eff-email

# Vérifier que les certificats sont créés
ls -la /etc/letsencrypt/live/live.angeline-nj.xyz/

# Recharger Nginx avec SSL
systemctl reload nginx

# Auto-renouvellement (déjà configuré par défaut)
certbot renew --dry-run
```

---

## 🚀 ÉTAPE 6: DÉMARRAGE PM2

```bash
cd /var/www/angeline-live

# Démarrer les applications avec PM2
pm2 start ecosystem.config.js

# Vérifier le statut
pm2 status

# Voir les logs
pm2 logs

# Sauvegarder la config PM2
pm2 save

# Démarrage automatique au boot
pm2 startup systemd
# Exécuter la commande affichée (commence par 'sudo env PATH=...')

# Vérifier
systemctl status pm2-root
```

---

## ✅ ÉTAPE 7: VALIDATION

### 7.1 - Tests Endpoints

```bash
# Test Health
curl https://live.angeline-nj.xyz/api/health

# Réponse attendue:
# {"healthy":true,"services":{...},"live":{...}}

# Test Oracles
curl https://live.angeline-nj.xyz/api/oracles

# Test Assets
curl -I https://live.angeline-nj.xyz/assets/oracles_assets/ORACLE_MYSTICA/CORE/cards/mystica_sentimental_001.png

# Test Dashboard (depuis navigateur)
# https://live.angeline-nj.xyz/
```

### 7.2 - Vérifications

```bash
# Vérifier que les 2 apps tournent
pm2 status
# Doit afficher: angeline-web-admin (online) + angeline-live-core (online)

# Vérifier les ports
netstat -tlnp | grep -E '3000|3001'
# Doit afficher: 3000 (Next.js) + 3001 (live-core)

# Vérifier Nginx
systemctl status nginx
# Doit être: active (running)

# Vérifier SSL
curl -I https://live.angeline-nj.xyz
# Doit retourner: HTTP/2 200

# Logs en temps réel
pm2 logs --lines 50
```

---

## 📱 ÉTAPE 8: TEST DEPUIS TÉLÉPHONE

1. Ouvrir navigateur mobile
2. Aller sur: `https://live.angeline-nj.xyz`
3. Se connecter au dashboard
4. Vérifier que l'interface charge correctement
5. Tester les appels API (état du live, oracles, etc.)

---

## 🔄 ÉTAPE 9: DÉPLOIEMENT CONTINU

### Mise à jour du code

```bash
cd /var/www/angeline-live

# Pull dernières modifications
git pull origin main

# Rebuild
npm run build --workspaces

# Rebuild web-admin
cd apps/web-admin
npm run build
cd ../..

# Rebuild live-core
cd apps/live-core
npm run build
cd ../..

# Redémarrer PM2
pm2 restart all

# Vérifier
pm2 status
pm2 logs --lines 20
```

### Script de déploiement automatique

```bash
# Créer script deploy.sh
nano /var/www/angeline-live/deploy.sh
```

**Contenu `deploy.sh`:**
```bash
#!/bin/bash
set -e

echo "🚀 Déploiement Angeline Live..."

cd /var/www/angeline-live

echo "📥 Pull code..."
git pull origin main

echo "📦 Install dependencies..."
npm install

echo "🔨 Build packages..."
npm run build --workspaces

echo "🔨 Build web-admin..."
cd apps/web-admin
npm run build
cd ../..

echo "🔨 Build live-core..."
cd apps/live-core
npm run build
cd ../..

echo "♻️  Restart PM2..."
pm2 restart all

echo "✅ Déploiement terminé!"
pm2 status
```

```bash
# Rendre exécutable
chmod +x /var/www/angeline-live/deploy.sh

# Utilisation
/var/www/angeline-live/deploy.sh
```

---

## 🛡️ ÉTAPE 10: SÉCURITÉ ADDITIONNELLE

### Firewall (UFW)

```bash
# Activer UFW
ufw allow 22/tcp    # SSH
ufw allow 80/tcp    # HTTP
ufw allow 443/tcp   # HTTPS
ufw enable

# Vérifier
ufw status
```

### Fail2Ban (Protection SSH)

```bash
apt install -y fail2ban

# Créer config
nano /etc/fail2ban/jail.local
```

**Contenu `jail.local`:**
```ini
[DEFAULT]
bantime = 3600
findtime = 600
maxretry = 5

[sshd]
enabled = true
port = 22
```

```bash
systemctl restart fail2ban
systemctl status fail2ban
```

---

## 📊 MONITORING

### Logs PM2

```bash
# Logs temps réel
pm2 logs

# Logs spécifiques
pm2 logs angeline-web-admin
pm2 logs angeline-live-core

# Métriques
pm2 monit
```

### Logs Nginx

```bash
# Access logs
tail -f /var/log/nginx/live.angeline-nj.xyz-access.log

# Error logs
tail -f /var/log/nginx/live.angeline-nj.xyz-error.log
```

### Espace disque

```bash
df -h
du -sh /var/www/angeline-live/*
```

---

## 🔧 DÉPANNAGE

### PM2 ne démarre pas

```bash
pm2 delete all
pm2 start ecosystem.config.js
pm2 save
```

### Nginx erreur 502

```bash
# Vérifier que les apps tournent
pm2 status

# Vérifier les ports
netstat -tlnp | grep -E '3000|3001'

# Redémarrer
pm2 restart all
systemctl restart nginx
```

### Certificat SSL expiré

```bash
certbot renew --force-renewal
systemctl reload nginx
```

### Erreur CORS

```bash
# Vérifier .env.production
cat /var/www/angeline-live/apps/live-core/.env.production | grep CORS_ORIGIN

# Doit être: CORS_ORIGIN=https://live.angeline-nj.xyz
```

---

## 📝 CHECKLIST FINALE

- [ ] DNS configuré et propagé
- [ ] Node.js 20+ installé
- [ ] Code cloné et build
- [ ] `.env.production` configurés (live-core + web-admin)
- [ ] **ElevenLabs API Key régénérée**
- [ ] JWT_SECRET et SESSION_SECRET générés
- [ ] Nginx configuré
- [ ] Certificat SSL obtenu
- [ ] PM2 démarré (2 apps online)
- [ ] PM2 startup configuré
- [ ] Firewall activé
- [ ] Test `https://live.angeline-nj.xyz/api/health` → OK
- [ ] Test `https://live.angeline-nj.xyz/` → Dashboard charge
- [ ] Test depuis téléphone → OK
- [ ] Logs PM2 sans erreur
- [ ] Assets accessibles `/assets/oracles_assets/...`

---

## 🎯 ARCHITECTURE FINALE

```
Internet
   ↓
[Nginx :443 SSL]
   ├─→ / → Next.js (web-admin) :3000
   ├─→ /api/* → Express (live-core) :3001
   ├─→ /assets/* → Express static (live-core) :3001
   └─→ /socket.io/* → Socket.IO (live-core) :3001

PC Windows (local)
   ├─→ TikFinity Desktop (WebSocket)
   ├─→ OBS Studio
   └─→ TikTok Live Studio
```

---

## 📞 SUPPORT

En cas de problème:

1. Vérifier logs: `pm2 logs`
2. Vérifier Nginx: `tail -f /var/log/nginx/live.angeline-nj.xyz-error.log`
3. Vérifier processus: `pm2 status`
4. Redémarrer: `pm2 restart all && systemctl restart nginx`

---

**Déploiement réalisé avec succès! 🎉**

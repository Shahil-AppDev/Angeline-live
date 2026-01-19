# 🚀 ANGELINE NJ LIVE - GUIDE DE DÉPLOIEMENT

## 📋 Prérequis

- Serveur VPS: `77.42.34.90` (live.angeline-nj.xyz)
- Accès SSH avec clé configurée
- DNS configuré: `live.angeline-nj.xyz → 77.42.34.90`
- Node.js 20.x
- Nginx
- PM2

## 🎯 Architecture de Déploiement

```
┌─────────────────────────────────────────────────────┐
│  VPS: live.angeline-nj.xyz (77.42.34.90)           │
│                                                      │
│  ┌──────────────┐         ┌──────────────┐         │
│  │   Nginx      │         │     PM2      │         │
│  │   (Proxy)    │────────▶│              │         │
│  │   Port 80/443│         │ • live-core  │         │
│  └──────────────┘         │ • web-admin  │         │
│                           └──────────────┘         │
└─────────────────────────────────────────────────────┘
                    ▲
                    │ WebSocket
                    │
        ┌───────────┴──────────┐
        │   PC Local (OBS)     │
        │   • OBS Studio       │
        │   • WebSocket Client │
        └──────────────────────┘
```

## 🔧 Déploiement Automatique

### 1. Exécuter le script de déploiement

```bash
chmod +x deploy.sh
./deploy.sh
```

Le script va automatiquement:
- ✅ Vérifier la connexion SSH
- ✅ Cloner/mettre à jour le repo GitHub
- ✅ Installer les dépendances
- ✅ Builder les applications
- ✅ Configurer PM2
- ✅ Configurer Nginx
- ✅ Configurer SSL (optionnel)
- ✅ Configurer le firewall

### 2. Configurer les variables d'environnement

Après le déploiement, connectez-vous au serveur:

```bash
ssh root@77.42.34.90
cd /var/www/angeline-live
nano .env
```

Configurez les clés API:

```env
# ADMIN AUTH
ADMIN_USERNAME=admin
ADMIN_PASSWORD_HASH=$2a$10$ZmFoIUwOGiFN6l9VOJCoqeSLd7gHb5yZMkCC69W4nPduatQaA/kVy
JWT_SECRET=VOTRE_SECRET_JWT_PRODUCTION

# OPENROUTER (DeepSeek)
OPENROUTER_API_KEY=sk-b2138b6c64f44836aba762e215fce938
OPENROUTER_MODEL=deepseek/deepseek-chat

# OBS WEBSOCKET (connexion depuis votre PC local)
OBS_WS_HOST=localhost
OBS_WS_PORT=4455
OBS_WS_PASSWORD=votre_password_obs

# TIKFINITY
TIKFINITY_API_KEY=votre_cle_tikfinity
TIKFINITY_WEBHOOK_SECRET=votre_secret_tikfinity

# SERVER
WEB_ADMIN_PORT=3000
LIVE_CORE_PORT=3001
NODE_ENV=production

# DOMAIN
DOMAIN=live.angeline-nj.xyz

# NEXT.JS
NEXT_PUBLIC_LIVE_CORE_API_URL=https://live.angeline-nj.xyz/api
```

### 3. Redémarrer les services

```bash
pm2 restart all
pm2 save
```

## 🔐 Configuration SSL (Let's Encrypt)

Si vous n'avez pas configuré SSL pendant le déploiement:

```bash
ssh root@77.42.34.90
certbot --nginx -d live.angeline-nj.xyz
```

## 📊 Gestion des Services

### Vérifier le statut

```bash
ssh root@77.42.34.90
pm2 status
```

### Voir les logs

```bash
# Tous les logs
pm2 logs

# Logs live-core uniquement
pm2 logs angeline-live-core

# Logs web-admin uniquement
pm2 logs angeline-web-admin
```

### Redémarrer un service

```bash
pm2 restart angeline-live-core
pm2 restart angeline-web-admin
```

### Arrêter/Démarrer

```bash
pm2 stop angeline-live-core
pm2 start angeline-live-core
```

## 🔄 Mise à Jour du Code

Pour déployer une nouvelle version:

```bash
# Sur votre PC local
git add .
git commit -m "Description des changements"
git push origin master

# Puis redéployer
./deploy.sh
```

## 🖥️ Configuration OBS (PC Local)

### 1. Installer OBS WebSocket Plugin

OBS Studio 28+ inclut WebSocket v5 par défaut.

### 2. Configurer WebSocket

Dans OBS:
- **Tools** → **WebSocket Server Settings**
- **Enable WebSocket server**: ✅
- **Server Port**: `4455`
- **Server Password**: Définir un mot de passe

### 3. Tunnel SSH (pour connexion sécurisée)

Si OBS est sur votre PC local et live-core sur le VPS:

```bash
# Créer un tunnel SSH
ssh -L 4455:localhost:4455 root@77.42.34.90 -N
```

Ou utiliser un VPN/Tailscale pour connexion directe.

## 🌐 URLs de Production

- **Dashboard**: https://live.angeline-nj.xyz
- **API**: https://live.angeline-nj.xyz/api
- **WebSocket**: wss://live.angeline-nj.xyz/socket.io

## 🔍 Vérifications Post-Déploiement

### 1. Vérifier Nginx

```bash
ssh root@77.42.34.90
nginx -t
systemctl status nginx
```

### 2. Vérifier les ports

```bash
netstat -tulpn | grep -E ':(80|443|3000|3001|3002)'
```

### 3. Tester l'API

```bash
curl https://live.angeline-nj.xyz/api/health
```

### 4. Tester le Dashboard

Ouvrir https://live.angeline-nj.xyz dans un navigateur

## 🐛 Dépannage

### Les services ne démarrent pas

```bash
pm2 logs
# Vérifier les erreurs dans les logs
```

### Nginx ne démarre pas

```bash
nginx -t
# Vérifier la syntaxe de la configuration
```

### WebSocket ne se connecte pas

1. Vérifier que live-core est démarré: `pm2 status`
2. Vérifier les logs: `pm2 logs angeline-live-core`
3. Vérifier la configuration Nginx pour `/socket.io/`

### SSL ne fonctionne pas

```bash
certbot renew --dry-run
# Tester le renouvellement
```

## 📦 Structure des Fichiers sur le Serveur

```
/var/www/angeline-live/
├── apps/
│   ├── live-core/          # Backend API + WebSocket
│   └── web-admin/          # Dashboard Next.js
├── packages/               # Packages partagés
├── assets/                 # Assets des oracles
├── config/                 # Configuration
├── .env                    # Variables d'environnement
└── deploy.sh              # Script de déploiement
```

## 🔒 Sécurité

### Firewall (UFW)

```bash
ufw status
# Ports ouverts: 22 (SSH), 80 (HTTP), 443 (HTTPS)
```

### Logs Nginx

```bash
tail -f /var/log/nginx/angeline-live-access.log
tail -f /var/log/nginx/angeline-live-error.log
```

### Mise à jour du système

```bash
apt update && apt upgrade -y
```

## 📝 Checklist de Déploiement

- [ ] DNS configuré (live.angeline-nj.xyz → 77.42.34.90)
- [ ] Clé SSH configurée
- [ ] Repo GitHub créé et poussé
- [ ] Script deploy.sh exécuté
- [ ] Variables .env configurées
- [ ] SSL configuré avec Let's Encrypt
- [ ] Services PM2 démarrés
- [ ] Nginx configuré et actif
- [ ] Firewall configuré
- [ ] OBS WebSocket configuré (PC local)
- [ ] Tests de connexion effectués
- [ ] Dashboard accessible
- [ ] API fonctionnelle
- [ ] WebSocket connecté

## 🎉 Prochaines Étapes

1. **Déposer les assets** dans `/var/www/angeline-live/assets/`
2. **Configurer TikFinity** avec les vraies clés
3. **Tester un tirage complet** avec OBS
4. **Monitorer les performances** avec PM2
5. **Configurer les backups** automatiques

## 📞 Support

En cas de problème:
1. Vérifier les logs: `pm2 logs`
2. Vérifier Nginx: `nginx -t`
3. Vérifier le firewall: `ufw status`
4. Redémarrer les services: `pm2 restart all`

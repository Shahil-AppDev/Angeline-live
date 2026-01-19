# 🖥️ VPS INFRASTRUCTURE - HETZNER 77.42.34.90

## 📊 PROJETS HÉBERGÉS

### 1. **angeline-nj.xyz** (Projet principal Angeline)
- **Domaine:** https://angeline-nj.xyz
- **Port:** 4000
- **PM2 App:** `angeline-nj`
- **Path:** `/var/www/angeline-nj.xyz`
- **Status:** ✅ ONLINE
- **Nginx:** `/etc/nginx/sites-available/angeline-nj.xyz`

### 2. **live.angeline-nj.xyz** (Angeline Live - Nouveau)
- **Domaine:** https://live.angeline-nj.xyz
- **Ports:**
  - Web Admin (Next.js): **7000**
  - Live Core API: **7001**
- **PM2 Apps:**
  - `angeline-web-admin` (port 7000)
  - `angeline-live-core` (port 7001)
- **Path:** `/var/www/angeline-live`
- **Status:** 🔧 EN CONFIGURATION
- **Nginx:** `/etc/nginx/sites-available/angeline-live`
- **SSL:** ✅ Configuré (Certbot)

### 3. **mjn-renov.xyz** (MJN Rénovation)
- **Domaine:** https://mjn-renov.xyz
- **Port:** 6001
- **PM2 App:** `mjn-renov`
- **Path:** `/var/www/mjn-renov`
- **Status:** ✅ ONLINE
- **Nginx:** `/etc/nginx/sites-available/mjn-renov`

### 4. **pay-check.xyz** (PayCheck IA)
- **Domaine:** https://pay-check.xyz
- **API:** https://api.pay-check.xyz
- **Path:** `/var/www/paycheck-ia`
- **Status:** 💤 INACTIF (pas dans PM2)
- **Nginx:** `/etc/nginx/sites-available/pay-check.xyz`

---

## 🔌 ALLOCATION DES PORTS

| Port | Projet | Service | Status |
|------|--------|---------|--------|
| 4000 | angeline-nj.xyz | Next.js App | ✅ UTILISÉ |
| 6001 | mjn-renov.xyz | Next.js App | ✅ UTILISÉ |
| 7000 | live.angeline-nj.xyz | Web Admin (Next.js) | ✅ UTILISÉ |
| 7001 | live.angeline-nj.xyz | Live Core API | ✅ UTILISÉ |

**Ports disponibles:** 3000-3999, 5000-5999, 8000+

---

## 📁 STRUCTURE /var/www

```
/var/www/
├── angeline-live/          # Nouveau projet Live
│   ├── apps/
│   │   ├── web-admin/      # Port 7000
│   │   └── live-core/      # Port 7001
│   ├── packages/
│   ├── assets/
│   └── ecosystem.config.js
│
├── angeline-nj.xyz/        # Projet principal
│   └── ecosystem.config.js # Port 4000
│
├── mjn-renov/              # MJN Rénovation
│   └── ecosystem.config.js # Port 6001
│
├── mjn-renov-backup/       # Backup
│
└── paycheck-ia/            # PayCheck (inactif)
```

---

## 🔧 CONFIGURATIONS PM2

### angeline-nj.xyz
```javascript
{
  name: 'angeline-nj',
  script: 'npm',
  args: 'start',
  env: { PORT: 4000 }
}
```

### mjn-renov.xyz
```javascript
{
  name: 'mjn-renov',
  script: 'node_modules/next/dist/bin/next',
  args: 'start',
  env: { PORT: 3001 }  // Note: Nginx redirige vers 6001
}
```

### live.angeline-nj.xyz
```javascript
{
  apps: [
    {
      name: 'angeline-web-admin',
      args: 'start -p 7000',
      env: { PORT: 7000 }
    },
    {
      name: 'angeline-live-core',
      script: 'dist/index.js',
      env: { LIVE_CORE_PORT: 7001 }
    }
  ]
}
```

---

## 🌐 CONFIGURATIONS NGINX

### angeline-nj.xyz
```nginx
server {
    server_name angeline-nj.xyz www.angeline-nj.xyz;
    location / {
        proxy_pass http://localhost:4000;
    }
    # SSL géré par Certbot
}
```

### mjn-renov.xyz
```nginx
server {
    server_name mjn-renov.xyz www.mjn-renov.xyz;
    location / {
        proxy_pass http://localhost:6001;
    }
}
```

### live.angeline-nj.xyz
```nginx
server {
    server_name live.angeline-nj.xyz;
    
    # Web Admin
    location / {
        proxy_pass http://localhost:7000;
    }
    
    # API
    location /api/ {
        proxy_pass http://localhost:7001/;
    }
    
    # WebSocket
    location /socket.io/ {
        proxy_pass http://localhost:7001/socket.io/;
    }
    
    # SSL géré par Certbot
}
```

---

## 🔐 CERTIFICATS SSL

Tous les domaines ont des certificats SSL via Let's Encrypt (Certbot):

- ✅ angeline-nj.xyz
- ✅ live.angeline-nj.xyz
- ✅ mjn-renov.xyz
- ✅ pay-check.xyz
- ✅ api.pay-check.xyz

**Renouvellement automatique:** Configuré via cron

---

## 📝 COMMANDES UTILES

### Vérifier l'état des projets
```bash
pm2 status
pm2 logs [app-name]
```

### Redémarrer un projet
```bash
pm2 restart [app-name]
pm2 reload [app-name]
```

### Vérifier les ports utilisés
```bash
netstat -tulpn | grep LISTEN
lsof -i :[port]
```

### Nginx
```bash
nginx -t                    # Tester la config
systemctl restart nginx     # Redémarrer
tail -f /var/log/nginx/[domain]-error.log
```

### SSL
```bash
certbot certificates        # Lister les certificats
certbot renew --dry-run    # Tester le renouvellement
```

---

## ⚠️ RÈGLES IMPORTANTES

1. **NE JAMAIS** utiliser `git reset --hard` dans `/var/www/angeline-nj.xyz` ou `/var/www/mjn-renov`
2. **TOUJOURS** vérifier les ports disponibles avant d'ajouter un nouveau projet
3. **BACKUP** les fichiers `.env.production` avant tout déploiement
4. **TESTER** la configuration Nginx avant de redémarrer: `nginx -t`
5. **DOCUMENTER** tout nouveau projet dans ce fichier

---

## 🚀 DÉPLOIEMENT ANGELINE-LIVE

Le déploiement automatique GitHub Actions est configuré **UNIQUEMENT** pour `/var/www/angeline-live`.

**Workflow:**
1. Push vers `master` sur GitHub
2. GitHub Actions build le projet
3. SSH au VPS
4. `git fetch && git reset --hard origin/master` dans `/var/www/angeline-live`
5. `npm install`
6. Build des packages
7. `pm2 restart ecosystem.config.js`

**Les autres projets ne sont PAS affectés par ce workflow.**

---

## 📞 CONTACTS & ACCÈS

- **VPS IP:** 77.42.34.90
- **SSH User:** root
- **SSH Port:** 22
- **Provider:** Hetzner

---

**Dernière mise à jour:** 18 janvier 2026

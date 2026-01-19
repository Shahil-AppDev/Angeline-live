# ✅ CHECKLIST DE VALIDATION PRODUCTION

## 🔐 SÉCURITÉ (CRITIQUE)

- [ ] **ElevenLabs API Key régénérée** (ancienne clé exposée: `sk_a9c76298...`)
  - URL: https://elevenlabs.io/app/settings/api-keys
  - Nouvelle clé mise dans: `/var/www/angeline-live/apps/live-core/.env.production`

- [ ] **JWT_SECRET généré** (32+ caractères)
  ```bash
  openssl rand -base64 32
  ```
  - Mis dans: `/var/www/angeline-live/apps/web-admin/.env.production`

- [ ] **SESSION_SECRET généré** (32+ caractères)
  ```bash
  openssl rand -base64 32
  ```
  - Mis dans: `/var/www/angeline-live/apps/web-admin/.env.production`

- [ ] **Fichiers .env.production NON commités**
  ```bash
  git status | grep .env.production
  # Ne doit rien retourner
  ```

---

## 🌐 DNS & DOMAINE

- [ ] **DNS configuré**
  ```bash
  nslookup live.angeline-nj.xyz
  # Doit retourner l'IP du VPS
  ```

- [ ] **Propagation DNS complète**
  ```bash
  dig live.angeline-nj.xyz +short
  # Doit afficher l'IP correcte
  ```

---

## 📦 INSTALLATION VPS

- [ ] **Node.js 20+ installé**
  ```bash
  node --version
  # v20.x.x ou supérieur
  ```

- [ ] **PM2 installé globalement**
  ```bash
  pm2 --version
  ```

- [ ] **Nginx installé**
  ```bash
  nginx -v
  ```

- [ ] **Certbot installé**
  ```bash
  certbot --version
  ```

---

## 🔨 BUILD & DÉPLOIEMENT

- [ ] **Code cloné**
  ```bash
  ls -la /var/www/angeline-live
  ```

- [ ] **Dépendances installées**
  ```bash
  cd /var/www/angeline-live
  npm install
  ```

- [ ] **Packages compilés**
  ```bash
  npm run build --workspaces
  ```

- [ ] **web-admin build**
  ```bash
  ls -la /var/www/angeline-live/apps/web-admin/.next
  # Doit contenir le build Next.js
  ```

- [ ] **live-core build**
  ```bash
  ls -la /var/www/angeline-live/apps/live-core/dist
  # Doit contenir index.js et autres fichiers compilés
  ```

---

## 🔧 CONFIGURATION

- [ ] **live-core .env.production configuré**
  ```bash
  cat /var/www/angeline-live/apps/live-core/.env.production
  # Vérifier: ELEVENLABS_API_KEY, OPENROUTER_API_KEY, CORS_ORIGIN
  ```

- [ ] **web-admin .env.production configuré**
  ```bash
  cat /var/www/angeline-live/apps/web-admin/.env.production
  # Vérifier: NEXT_PUBLIC_API_BASE_URL, JWT_SECRET, SESSION_SECRET
  ```

- [ ] **Permissions correctes**
  ```bash
  ls -la /var/www/angeline-live/apps/*/\.env.production
  # Doit afficher: -rw------- (600)
  ```

---

## 🌐 NGINX

- [ ] **Config Nginx copiée**
  ```bash
  ls -la /etc/nginx/sites-available/live.angeline-nj.xyz
  ```

- [ ] **Symlink créé**
  ```bash
  ls -la /etc/nginx/sites-enabled/live.angeline-nj.xyz
  ```

- [ ] **Config Nginx valide**
  ```bash
  nginx -t
  # Doit retourner: syntax is ok, test is successful
  ```

- [ ] **Nginx actif**
  ```bash
  systemctl status nginx
  # Doit être: active (running)
  ```

---

## 🔒 SSL

- [ ] **Certificat SSL obtenu**
  ```bash
  ls -la /etc/letsencrypt/live/live.angeline-nj.xyz/
  # Doit contenir: fullchain.pem, privkey.pem, chain.pem
  ```

- [ ] **HTTPS fonctionne**
  ```bash
  curl -I https://live.angeline-nj.xyz
  # Doit retourner: HTTP/2 200
  ```

- [ ] **Redirection HTTP → HTTPS**
  ```bash
  curl -I http://live.angeline-nj.xyz
  # Doit retourner: 301 Moved Permanently
  ```

---

## 🚀 PM2

- [ ] **PM2 démarré**
  ```bash
  pm2 start /var/www/angeline-live/ecosystem.config.js
  ```

- [ ] **2 apps online**
  ```bash
  pm2 status
  # angeline-web-admin: online
  # angeline-live-core: online
  ```

- [ ] **Logs sans erreur**
  ```bash
  pm2 logs --lines 50
  # Vérifier absence d'erreurs critiques
  ```

- [ ] **PM2 startup configuré**
  ```bash
  systemctl status pm2-root
  # Doit être: active (running)
  ```

- [ ] **PM2 save exécuté**
  ```bash
  pm2 save
  ```

---

## 🧪 TESTS ENDPOINTS

### API Health
```bash
curl https://live.angeline-nj.xyz/api/health
```
**Attendu:**
```json
{
  "healthy": true,
  "services": {...},
  "live": {...}
}
```

- [ ] **Health check OK**

### API Oracles
```bash
curl https://live.angeline-nj.xyz/api/oracles
```
**Attendu:** Array d'oracles
- [ ] **Oracles retournés**

### Static Assets
```bash
curl -I https://live.angeline-nj.xyz/assets/oracles_assets/ORACLE_MYSTICA/CORE/cards/mystica_sentimental_001.png
```
**Attendu:** HTTP/2 200
- [ ] **Assets accessibles**

### Dashboard
```bash
curl -I https://live.angeline-nj.xyz/
```
**Attendu:** HTTP/2 200
- [ ] **Dashboard accessible**

---

## 📱 TESTS NAVIGATEUR

### Desktop
- [ ] Ouvrir: `https://live.angeline-nj.xyz`
- [ ] Dashboard charge sans erreur
- [ ] Login fonctionne
- [ ] Pas d'erreur CORS dans console
- [ ] WebSocket connecté (vérifier console)

### Mobile
- [ ] Ouvrir depuis téléphone: `https://live.angeline-nj.xyz`
- [ ] Interface responsive
- [ ] API calls fonctionnent
- [ ] Pas d'erreur SSL

---

## 🔍 VÉRIFICATIONS SYSTÈME

### Ports
```bash
netstat -tlnp | grep -E '3000|3001'
```
- [ ] **Port 3000 écoute** (Next.js)
- [ ] **Port 3001 écoute** (live-core)

### Processus
```bash
ps aux | grep -E 'node|pm2'
```
- [ ] **PM2 daemon actif**
- [ ] **2 processus Node.js actifs**

### Espace disque
```bash
df -h
```
- [ ] **Espace disponible > 2GB**

### Mémoire
```bash
free -h
```
- [ ] **RAM disponible > 500MB**

---

## 🛡️ SÉCURITÉ

### Firewall
```bash
ufw status
```
- [ ] **UFW actif**
- [ ] **Ports 22, 80, 443 autorisés**

### Fail2Ban (optionnel)
```bash
systemctl status fail2ban
```
- [ ] **Fail2Ban actif** (si installé)

---

## 📊 MONITORING

### Logs PM2
```bash
pm2 logs --lines 20
```
- [ ] **Pas d'erreurs critiques**
- [ ] **Apps démarrées correctement**

### Logs Nginx
```bash
tail -20 /var/log/nginx/live.angeline-nj.xyz-error.log
```
- [ ] **Pas d'erreurs 502/504**

---

## 🎯 TESTS FONCTIONNELS

### Démarrer le Live
```bash
curl -X POST https://live.angeline-nj.xyz/api/live/start \
  -H "Content-Type: application/json"
```
- [ ] **Live démarre sans erreur**

### Vérifier l'état
```bash
curl https://live.angeline-nj.xyz/api/live/state
```
- [ ] **État retourné avec isActive: true**

### Arrêter le Live
```bash
curl -X POST https://live.angeline-nj.xyz/api/live/stop \
  -H "Content-Type: application/json"
```
- [ ] **Live s'arrête sans erreur**

---

## 🔄 REDÉMARRAGE

### Test redémarrage serveur
```bash
reboot
# Attendre 2 minutes puis SSH
```

Après redémarrage:
- [ ] **PM2 redémarre automatiquement**
- [ ] **Nginx redémarre automatiquement**
- [ ] **Dashboard accessible**
- [ ] **API fonctionne**

---

## 📝 DOCUMENTATION

- [ ] **DEPLOY_PROD.md lu et compris**
- [ ] **Secrets notés dans gestionnaire de mots de passe**
- [ ] **Procédure de mise à jour documentée**

---

## ✅ VALIDATION FINALE

**Tous les points ci-dessus doivent être cochés avant de considérer le déploiement comme réussi.**

### Commande de validation rapide

```bash
#!/bin/bash
echo "=== VALIDATION PRODUCTION ==="

echo -n "DNS: "
dig live.angeline-nj.xyz +short

echo -n "HTTPS: "
curl -s -o /dev/null -w "%{http_code}" https://live.angeline-nj.xyz

echo -n "API Health: "
curl -s https://live.angeline-nj.xyz/api/health | jq -r '.healthy'

echo -n "PM2 Status: "
pm2 jlist | jq -r '.[].pm2_env.status' | sort -u

echo -n "Nginx: "
systemctl is-active nginx

echo "=== FIN VALIDATION ==="
```

**Si tous les tests passent: 🎉 PRODUCTION READY!**

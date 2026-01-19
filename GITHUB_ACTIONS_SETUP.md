# 🚀 DÉPLOIEMENT AUTOMATIQUE - GITHUB ACTIONS → HETZNER VPS

## 📋 CONFIGURATION COMPLÈTE

Ce guide configure le déploiement automatique depuis GitHub vers votre VPS Hetzner à chaque push sur la branche `master`.

---

## 🔐 ÉTAPE 1: GÉNÉRER UNE CLÉ SSH POUR LE DÉPLOIEMENT

### Sur votre machine locale (Windows):

```powershell
# Générer une nouvelle paire de clés SSH dédiée au déploiement
ssh-keygen -t ed25519 -C "github-actions-deploy" -f "$env:USERPROFILE\.ssh\github_deploy_key"

# Afficher la clé publique
Get-Content "$env:USERPROFILE\.ssh\github_deploy_key.pub"
```

**⚠️ IMPORTANT:** 
- La clé **privée** (`github_deploy_key`) sera ajoutée dans GitHub Secrets
- La clé **publique** (`github_deploy_key.pub`) sera ajoutée sur le VPS

---

## 🖥️ ÉTAPE 2: CONFIGURER LE VPS HETZNER

### 2.1 - Connexion SSH au VPS

```bash
ssh root@YOUR_VPS_IP
```

### 2.2 - Ajouter la clé publique

```bash
# Créer le fichier authorized_keys si nécessaire
mkdir -p ~/.ssh
chmod 700 ~/.ssh

# Ajouter la clé publique (copier la sortie de l'étape 1)
echo "ssh-ed25519 AAAA... github-actions-deploy" >> ~/.ssh/authorized_keys

# Permissions correctes
chmod 600 ~/.ssh/authorized_keys
```

### 2.3 - Tester la connexion depuis votre PC

```powershell
# Depuis Windows
ssh -i "$env:USERPROFILE\.ssh\github_deploy_key" root@YOUR_VPS_IP
```

Si la connexion fonctionne sans demander de mot de passe, c'est bon! ✅

### 2.4 - Installer les dépendances sur le VPS

```bash
# Installer jq (pour parser JSON)
apt install -y jq

# Vérifier que PM2 est installé
pm2 --version

# Vérifier que Node.js 20+ est installé
node --version
```

### 2.5 - Rendre le script de déploiement exécutable

```bash
cd /var/www/angeline-live

# Créer le dossier scripts si nécessaire
mkdir -p scripts

# Le script sera créé par le prochain git pull
# Après le premier déploiement:
chmod +x scripts/deploy.sh
```

---

## 🔑 ÉTAPE 3: CONFIGURER LES SECRETS GITHUB

### 3.1 - Aller sur GitHub

1. Ouvrir: https://github.com/Shahil-AppDev/Angeline-live
2. Cliquer sur **Settings** (Paramètres)
3. Dans le menu de gauche: **Secrets and variables** → **Actions**
4. Cliquer sur **New repository secret**

### 3.2 - Ajouter les secrets suivants

**Secret 1: `VPS_HOST`**
- Name: `VPS_HOST`
- Value: `YOUR_VPS_IP` (exemple: `95.217.123.45`)

**Secret 2: `VPS_USERNAME`**
- Name: `VPS_USERNAME`
- Value: `root`

**Secret 3: `VPS_PORT`**
- Name: `VPS_PORT`
- Value: `22`

**Secret 4: `VPS_SSH_KEY`**
- Name: `VPS_SSH_KEY`
- Value: Contenu complet de la clé **privée**

Pour obtenir la clé privée:
```powershell
# Windows PowerShell
Get-Content "$env:USERPROFILE\.ssh\github_deploy_key"
```

Copier **TOUT** le contenu, y compris:
```
-----BEGIN OPENSSH PRIVATE KEY-----
...
-----END OPENSSH PRIVATE KEY-----
```

---

## ✅ ÉTAPE 4: VÉRIFIER LA CONFIGURATION

### 4.1 - Vérifier les secrets GitHub

Dans **Settings** → **Secrets and variables** → **Actions**, vous devez voir:
- ✅ `VPS_HOST`
- ✅ `VPS_USERNAME`
- ✅ `VPS_PORT`
- ✅ `VPS_SSH_KEY`

### 4.2 - Vérifier le workflow

Le fichier `.github/workflows/deploy.yml` doit exister dans votre repository.

---

## 🚀 ÉTAPE 5: PREMIER DÉPLOIEMENT

### 5.1 - Déploiement initial manuel

**Sur le VPS, faire le premier déploiement manuellement:**

```bash
cd /var/www/angeline-live

# Pull du code (qui contient maintenant le script deploy.sh)
git pull origin master

# Rendre le script exécutable
chmod +x scripts/deploy.sh

# Exécuter le premier déploiement
./scripts/deploy.sh
```

### 5.2 - Tester le déploiement automatique

**Depuis votre PC local:**

```bash
cd "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live"

# Faire un petit changement (exemple: ajouter un commentaire)
echo "# Test deploy" >> README.md

# Commit et push
git add .
git commit -m "test: trigger automatic deployment"
git push origin master
```

### 5.3 - Surveiller le déploiement

1. Aller sur: https://github.com/Shahil-AppDev/Angeline-live/actions
2. Vous devriez voir un workflow "Deploy to Hetzner VPS" en cours
3. Cliquer dessus pour voir les logs en temps réel

**Étapes du workflow:**
1. ✅ Checkout code
2. ✅ Setup Node.js
3. ✅ Install dependencies
4. ✅ Build packages
5. ✅ Build web-admin
6. ✅ Build live-core
7. ✅ Deploy to VPS (SSH + script)
8. ✅ Verify deployment
9. ✅ Notify deployment status

---

## 📊 ÉTAPE 6: VÉRIFICATION POST-DÉPLOIEMENT

### 6.1 - Vérifier que les apps tournent

```bash
# SSH au VPS
ssh root@YOUR_VPS_IP

# Vérifier PM2
pm2 status

# Doit afficher:
# angeline-web-admin: online
# angeline-live-core: online
```

### 6.2 - Tester les endpoints

```bash
# Health check
curl https://live.angeline-nj.xyz/api/health

# Dashboard
curl -I https://live.angeline-nj.xyz/

# Les deux doivent retourner HTTP/2 200
```

### 6.3 - Vérifier les logs

```bash
# Logs PM2
pm2 logs --lines 50

# Logs Nginx
tail -f /var/log/nginx/live.angeline-nj.xyz-error.log
```

---

## 🔄 WORKFLOW DE DÉPLOIEMENT

### Déclenchement automatique

Le déploiement se déclenche automatiquement à chaque:
- ✅ Push sur la branche `master`
- ✅ Déclenchement manuel depuis GitHub Actions

### Déclenchement manuel

1. Aller sur: https://github.com/Shahil-AppDev/Angeline-live/actions
2. Sélectionner "Deploy to Hetzner VPS"
3. Cliquer sur **Run workflow**
4. Sélectionner la branche `master`
5. Cliquer sur **Run workflow**

---

## 🛡️ SÉCURITÉ

### Bonnes pratiques

✅ **Clé SSH dédiée** - Utilisée uniquement pour le déploiement  
✅ **Secrets GitHub** - Clés privées jamais exposées dans le code  
✅ **Backup .env** - Le script sauvegarde et restaure les fichiers .env  
✅ **Vérification santé** - Le workflow vérifie que l'app démarre correctement  
✅ **Rollback possible** - En cas d'échec, PM2 garde l'ancienne version  

### Rotation des clés

Pour changer la clé SSH:
1. Générer une nouvelle paire de clés
2. Ajouter la nouvelle clé publique sur le VPS
3. Mettre à jour le secret `VPS_SSH_KEY` sur GitHub
4. Supprimer l'ancienne clé du VPS

---

## 🐛 DÉPANNAGE

### Problème: Workflow échoue à l'étape "Deploy to VPS"

**Cause:** Clé SSH incorrecte ou permissions

**Solution:**
```bash
# Sur le VPS, vérifier les permissions
chmod 700 ~/.ssh
chmod 600 ~/.ssh/authorized_keys

# Vérifier que la clé est bien ajoutée
cat ~/.ssh/authorized_keys
```

### Problème: PM2 ne redémarre pas

**Cause:** Erreur de build ou configuration

**Solution:**
```bash
# SSH au VPS
ssh root@YOUR_VPS_IP

# Voir les logs PM2
pm2 logs --lines 100

# Redémarrer manuellement
pm2 restart all

# Si échec, vérifier les builds
ls -la /var/www/angeline-live/apps/web-admin/.next
ls -la /var/www/angeline-live/apps/live-core/dist
```

### Problème: Health check échoue

**Cause:** API ne répond pas

**Solution:**
```bash
# Vérifier que live-core tourne
pm2 status

# Vérifier les logs
pm2 logs angeline-live-core

# Tester en local
curl http://localhost:3001/api/health
```

### Problème: Nginx 502 Bad Gateway

**Cause:** Apps PM2 ne tournent pas

**Solution:**
```bash
# Redémarrer PM2
pm2 restart all

# Vérifier les ports
netstat -tlnp | grep -E '3000|3001'

# Redémarrer Nginx
systemctl restart nginx
```

---

## 📝 LOGS ET MONITORING

### Voir les logs de déploiement

**Sur GitHub:**
- https://github.com/Shahil-AppDev/Angeline-live/actions

**Sur le VPS:**
```bash
# Logs PM2
pm2 logs

# Logs Nginx
tail -f /var/log/nginx/live.angeline-nj.xyz-access.log
tail -f /var/log/nginx/live.angeline-nj.xyz-error.log

# Logs système
journalctl -u nginx -f
```

---

## 🎯 COMMANDES UTILES

### Sur le VPS

```bash
# Déploiement manuel
cd /var/www/angeline-live && ./scripts/deploy.sh

# Voir le statut
pm2 status

# Redémarrer une app
pm2 restart angeline-web-admin
pm2 restart angeline-live-core

# Voir les logs en temps réel
pm2 logs

# Vérifier Nginx
systemctl status nginx
nginx -t

# Test de santé
curl http://localhost:3001/api/health
curl https://live.angeline-nj.xyz/api/health
```

---

## ✅ CHECKLIST FINALE

- [ ] Clé SSH générée et ajoutée sur le VPS
- [ ] 4 secrets configurés sur GitHub
- [ ] Workflow `.github/workflows/deploy.yml` présent
- [ ] Script `scripts/deploy.sh` exécutable sur le VPS
- [ ] Premier déploiement manuel réussi
- [ ] Test de déploiement automatique réussi
- [ ] PM2 apps online après déploiement
- [ ] Health check retourne 200
- [ ] Dashboard accessible sur https://live.angeline-nj.xyz
- [ ] Logs GitHub Actions sans erreur

---

**🎉 Votre pipeline de déploiement automatique est maintenant configuré!**

**Workflow:**
1. Vous faites un `git push origin master`
2. GitHub Actions se déclenche automatiquement
3. Le code est build et déployé sur le VPS
4. PM2 redémarre les applications
5. Le système vérifie que tout fonctionne
6. Vous recevez une notification de succès/échec

**Temps de déploiement:** ~3-5 minutes

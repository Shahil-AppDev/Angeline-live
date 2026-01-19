# 🛡️ DÉPLOIEMENT SÉCURISÉ - SERVEUR PARTAGÉ

## ⚠️ IMPORTANT : SERVEUR PARTAGÉ

Ce serveur héberge **plusieurs projets**. Le script de déploiement a été conçu pour :

### ✅ Ce qui est fait automatiquement
- Clone/mise à jour du repo dans `/var/www/angeline-live` uniquement
- Installation des dépendances npm dans le dossier du projet
- Build des applications Angeline
- Création/mise à jour des processus PM2 `angeline-live-core` et `angeline-web-admin`
- Création de la config Nginx `/etc/nginx/sites-available/angeline-live`

### ❌ Ce qui N'EST PAS modifié
- ❌ Pas d'installation/mise à jour de Node.js
- ❌ Pas d'installation/mise à jour de PM2
- ❌ Pas de modification du `pm2 startup`
- ❌ Pas de modification des autres sites Nginx
- ❌ Pas de modification du firewall (UFW)
- ❌ Pas d'installation automatique de Certbot/SSL
- ❌ Pas de modification des autres applications PM2

## 🔍 Vérifications Pré-Déploiement

Avant de lancer `./deploy.sh`, vérifiez sur le serveur :

```bash
ssh root@77.42.34.90

# 1. Vérifier Node.js (doit être installé)
node --version  # Attendu: v20.x ou supérieur

# 2. Vérifier PM2 (doit être installé)
pm2 --version

# 3. Lister les applications PM2 existantes
pm2 list
# ⚠️ NOTEZ les noms pour ne pas les confondre avec angeline-*

# 4. Lister les sites Nginx existants
ls -la /etc/nginx/sites-enabled/
# ⚠️ Vérifiez qu'il n'y a pas de conflit de port ou domaine

# 5. Vérifier les ports utilisés
netstat -tulpn | grep -E ':(80|443|3000|3001|3002)'
# ⚠️ Assurez-vous que 3000, 3001, 3002 sont libres
```

## 🎯 Ports Utilisés par Angeline

- **3000** : web-admin (Next.js)
- **3001** : live-core (API + WebSocket)
- **3002** : TikFinity webhook

**Vérifiez qu'aucun autre projet n'utilise ces ports !**

## 📋 Checklist de Sécurité

Avant le déploiement :

- [ ] J'ai vérifié que Node.js est installé
- [ ] J'ai vérifié que PM2 est installé
- [ ] J'ai listé les apps PM2 existantes
- [ ] J'ai vérifié que les ports 3000, 3001, 3002 sont libres
- [ ] J'ai vérifié les sites Nginx existants
- [ ] J'ai noté les configurations à ne pas toucher

## 🚀 Déploiement Étape par Étape

### 1. Déploiement Initial

```bash
# Sur votre PC local
chmod +x deploy.sh
./deploy.sh
```

Le script va :
1. ✅ Vérifier la connexion SSH
2. ✅ Cloner le repo dans `/var/www/angeline-live`
3. ✅ Installer les dépendances npm
4. ✅ Builder les applications
5. ✅ Créer les processus PM2 (angeline-live-core, angeline-web-admin)
6. ✅ Créer la config Nginx
7. ⚠️ Recharger Nginx (tous les sites)

### 2. Configuration Post-Déploiement

```bash
ssh root@77.42.34.90
cd /var/www/angeline-live

# Configurer .env
nano .env
# Ajoutez vos vraies clés API

# Redémarrer les services Angeline
pm2 restart angeline-live-core
pm2 restart angeline-web-admin

# Vérifier
pm2 logs angeline-live-core
```

### 3. Configuration SSL (Manuel)

```bash
ssh root@77.42.34.90

# Si Certbot n'est pas installé
apt-get install certbot python3-certbot-nginx

# Obtenir le certificat SSL pour Angeline uniquement
certbot --nginx -d live.angeline-nj.xyz

# Vérifier que les autres sites ne sont pas affectés
nginx -t
systemctl reload nginx
```

## 🔄 Mises à Jour Futures

Pour mettre à jour le code :

```bash
# Sur votre PC local
git add .
git commit -m "Description"
git push origin master

# Redéployer
./deploy.sh
```

Le script va :
- Mettre à jour le code dans `/var/www/angeline-live`
- Redémarrer UNIQUEMENT les processus `angeline-*`
- Ne pas toucher aux autres projets

## 🛑 Arrêter Angeline (sans toucher aux autres projets)

```bash
ssh root@77.42.34.90

# Arrêter uniquement Angeline
pm2 stop angeline-live-core
pm2 stop angeline-web-admin

# Ou supprimer complètement
pm2 delete angeline-live-core
pm2 delete angeline-web-admin
pm2 save

# Les autres applications PM2 continuent de tourner
pm2 list
```

## 🔍 Monitoring (Angeline uniquement)

```bash
ssh root@77.42.34.90

# Status des apps Angeline
pm2 list | grep angeline

# Logs Angeline
pm2 logs angeline-live-core --lines 100
pm2 logs angeline-web-admin --lines 100

# Logs Nginx Angeline
tail -f /var/log/nginx/angeline-live-access.log
tail -f /var/log/nginx/angeline-live-error.log
```

## ⚠️ En Cas de Problème

### Si Nginx ne démarre plus

```bash
# Désactiver temporairement Angeline
rm /etc/nginx/sites-enabled/angeline-live
nginx -t
systemctl reload nginx

# Vérifier la config
nano /etc/nginx/sites-available/angeline-live

# Réactiver
ln -s /etc/nginx/sites-available/angeline-live /etc/nginx/sites-enabled/
nginx -t
systemctl reload nginx
```

### Si PM2 a des problèmes

```bash
# Supprimer uniquement les apps Angeline
pm2 delete angeline-live-core angeline-web-admin

# Redémarrer manuellement
cd /var/www/angeline-live/apps/live-core
pm2 start src/index.ts --name angeline-live-core --interpreter ts-node

cd ../web-admin
pm2 start npm --name angeline-web-admin -- start

pm2 save
```

## 📊 Structure Isolée

```
/var/www/
├── angeline-live/          ← NOTRE PROJET (isolé)
│   ├── apps/
│   ├── packages/
│   ├── assets/
│   └── .env
├── autre-projet-1/         ← NON TOUCHÉ
├── autre-projet-2/         ← NON TOUCHÉ
└── ...

/etc/nginx/sites-available/
├── angeline-live           ← NOTRE CONFIG (isolée)
├── autre-site-1            ← NON TOUCHÉ
├── autre-site-2            ← NON TOUCHÉ
└── ...

PM2:
├── angeline-live-core      ← NOTRE APP
├── angeline-web-admin      ← NOTRE APP
├── autre-app-1             ← NON TOUCHÉ
├── autre-app-2             ← NON TOUCHÉ
└── ...
```

## ✅ Résumé

Le déploiement est **100% isolé** :
- Dossier dédié : `/var/www/angeline-live`
- Processus PM2 dédiés : `angeline-*`
- Config Nginx dédiée : `angeline-live`
- Ports dédiés : 3000, 3001, 3002
- Aucune modification système globale

**Les autres projets ne seront jamais touchés !** 🛡️

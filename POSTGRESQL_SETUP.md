# 🗄️ POSTGRESQL SETUP - ANGELINE LIVE

## 📋 CONFIGURATION BASE DE DONNÉES

Ce guide explique comment configurer PostgreSQL pour l'authentification admin du dashboard Angeline Live.

---

## 🚀 INSTALLATION SUR LE VPS HETZNER

### Étape 1: Installer PostgreSQL

```bash
# SSH au VPS
ssh root@77.42.34.90

# Mettre à jour les paquets
apt update

# Installer PostgreSQL
apt install -y postgresql postgresql-contrib

# Vérifier l'installation
systemctl status postgresql
```

### Étape 2: Créer la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql

# Créer la base de données
CREATE DATABASE angeline_live;

# Créer un utilisateur dédié
CREATE USER angeline_admin WITH PASSWORD 'VOTRE_MOT_DE_PASSE_SECURISE';

# Donner les permissions
GRANT ALL PRIVILEGES ON DATABASE angeline_live TO angeline_admin;

# Quitter PostgreSQL
\q
```

### Étape 3: Configurer PostgreSQL pour les connexions locales

```bash
# Éditer pg_hba.conf
nano /etc/postgresql/*/main/pg_hba.conf

# Ajouter cette ligne (après les lignes existantes):
# local   angeline_live   angeline_admin                  md5

# Redémarrer PostgreSQL
systemctl restart postgresql
```

---

## 🔐 CONFIGURATION ENVIRONNEMENT

### Sur le VPS

Éditer le fichier `.env.production` de web-admin:

```bash
cd /var/www/angeline-live/apps/web-admin
nano .env.production
```

Ajouter:
```env
# PostgreSQL Database
DATABASE_URL="postgresql://angeline_admin:VOTRE_MOT_DE_PASSE@localhost:5432/angeline_live?schema=public"

# JWT Secret (générer une clé aléatoire sécurisée)
JWT_SECRET="VOTRE_CLE_SECRETE_ALEATOIRE_LONGUE"

# Admin par défaut (pour le seed)
ADMIN_PASSWORD="VOTRE_MOT_DE_PASSE_ADMIN"
```

**⚠️ IMPORTANT:** Remplacer les valeurs par des mots de passe sécurisés!

---

## 📊 MIGRATION DE LA BASE DE DONNÉES

### Sur le VPS (après déploiement)

```bash
cd /var/www/angeline-live/apps/web-admin

# Générer le Prisma Client
npx prisma generate

# Créer les tables
npx prisma migrate deploy

# Créer l'utilisateur admin par défaut
npm run prisma:seed
```

**Résultat attendu:**
```
✅ Admin user created: admin
📧 Username: admin
🔑 Password: [votre mot de passe]
⚠️  Change this password in production!
```

---

## 🔍 VÉRIFICATION

### Tester la connexion à la base de données

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql angeline_live

# Vérifier les tables
\dt

# Devrait afficher:
#  public | sessions | table | angeline_admin
#  public | users    | table | angeline_admin

# Vérifier l'utilisateur admin
SELECT username, role FROM users;

# Quitter
\q
```

### Tester l'authentification

```bash
# Tester l'API de login
curl -X POST https://live.angeline-nj.xyz/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"VOTRE_MOT_DE_PASSE"}'

# Devrait retourner:
# {"token":"eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."}
```

---

## 🛠️ GESTION DES UTILISATEURS

### Prisma Studio (interface graphique)

```bash
# Sur le VPS
cd /var/www/angeline-live/apps/web-admin
npx prisma studio

# Ouvre une interface web sur http://localhost:5555
# Utilisez un tunnel SSH pour y accéder depuis votre PC:
# ssh -L 5555:localhost:5555 root@77.42.34.90
```

### Ajouter un utilisateur manuellement

```bash
# Se connecter à PostgreSQL
sudo -u postgres psql angeline_live

# Générer un hash bcrypt du mot de passe (utiliser Node.js)
node -e "console.log(require('bcryptjs').hashSync('nouveau_mot_de_passe', 10))"

# Insérer l'utilisateur
INSERT INTO users (id, username, password_hash, role, created_at, updated_at)
VALUES (
  gen_random_uuid()::text,
  'nouveau_user',
  '$2a$10$...',  -- Hash bcrypt du mot de passe
  'admin',
  NOW(),
  NOW()
);
```

### Changer un mot de passe

```bash
# Générer le nouveau hash
node -e "console.log(require('bcryptjs').hashSync('nouveau_mot_de_passe', 10))"

# Mettre à jour dans PostgreSQL
sudo -u postgres psql angeline_live

UPDATE users 
SET password_hash = '$2a$10$...', updated_at = NOW()
WHERE username = 'admin';
```

---

## 🔄 BACKUP ET RESTORE

### Backup de la base de données

```bash
# Créer un backup
sudo -u postgres pg_dump angeline_live > /root/backups/angeline_live_$(date +%Y%m%d).sql

# Automatiser avec cron (tous les jours à 3h du matin)
crontab -e
# Ajouter:
# 0 3 * * * sudo -u postgres pg_dump angeline_live > /root/backups/angeline_live_$(date +\%Y\%m\%d).sql
```

### Restore d'un backup

```bash
# Restaurer depuis un backup
sudo -u postgres psql angeline_live < /root/backups/angeline_live_20260118.sql
```

---

## 📊 SCHÉMA DE BASE DE DONNÉES

### Table `users`

| Colonne       | Type      | Description                    |
|---------------|-----------|--------------------------------|
| id            | String    | ID unique (CUID)               |
| username      | String    | Nom d'utilisateur (unique)     |
| password_hash | String    | Hash bcrypt du mot de passe    |
| role          | String    | Rôle (admin par défaut)        |
| created_at    | DateTime  | Date de création               |
| updated_at    | DateTime  | Date de dernière modification  |

### Table `sessions`

| Colonne    | Type      | Description                |
|------------|-----------|----------------------------|
| id         | String    | ID unique (CUID)           |
| user_id    | String    | ID de l'utilisateur        |
| token      | String    | Token JWT (unique)         |
| expires_at | DateTime  | Date d'expiration          |
| created_at | DateTime  | Date de création           |

---

## 🔐 SÉCURITÉ

### Bonnes pratiques

✅ **Mots de passe forts** - Minimum 16 caractères aléatoires  
✅ **JWT Secret unique** - Générer avec `openssl rand -base64 32`  
✅ **Connexions locales uniquement** - PostgreSQL n'écoute que sur localhost  
✅ **Backups réguliers** - Automatisés avec cron  
✅ **Sessions expirables** - Nettoyage automatique des sessions expirées  

### Nettoyer les sessions expirées

```bash
# Ajouter un cron job pour nettoyer les sessions expirées
crontab -e

# Ajouter (tous les jours à 4h du matin):
# 0 4 * * * sudo -u postgres psql angeline_live -c "DELETE FROM sessions WHERE expires_at < NOW();"
```

---

## 🆘 DÉPANNAGE

### Problème: Cannot connect to database

**Solution:**
```bash
# Vérifier que PostgreSQL tourne
systemctl status postgresql

# Redémarrer si nécessaire
systemctl restart postgresql

# Vérifier les logs
tail -f /var/log/postgresql/postgresql-*-main.log
```

### Problème: Authentication failed

**Solution:**
```bash
# Vérifier les permissions
sudo -u postgres psql angeline_live

# Vérifier l'utilisateur
\du angeline_admin

# Réinitialiser le mot de passe si nécessaire
ALTER USER angeline_admin WITH PASSWORD 'nouveau_mot_de_passe';
```

### Problème: Prisma migration fails

**Solution:**
```bash
# Réinitialiser la base de données (⚠️ PERTE DE DONNÉES)
cd /var/www/angeline-live/apps/web-admin
npx prisma migrate reset

# Ou forcer la migration
npx prisma migrate deploy --force
```

---

## ✅ CHECKLIST POST-INSTALLATION

- [ ] PostgreSQL installé et démarré
- [ ] Base de données `angeline_live` créée
- [ ] Utilisateur `angeline_admin` créé avec mot de passe sécurisé
- [ ] `DATABASE_URL` configurée dans `.env.production`
- [ ] `JWT_SECRET` généré et configuré
- [ ] Prisma Client généré (`npx prisma generate`)
- [ ] Migrations appliquées (`npx prisma migrate deploy`)
- [ ] Seed exécuté (utilisateur admin créé)
- [ ] Test de login réussi
- [ ] Backups automatiques configurés
- [ ] Nettoyage des sessions configuré

---

**🎉 Votre base de données PostgreSQL est maintenant configurée et prête pour la production!**

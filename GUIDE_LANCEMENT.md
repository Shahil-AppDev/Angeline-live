# 🚀 GUIDE DE LANCEMENT - LIVE TIKTOK AUTOMATISÉ

## 📋 PRÉ-REQUIS

### Logiciels requis
- ✅ **Node.js v20+** installé
- ✅ **OBS Studio** avec **obs-websocket v5** activé
- ✅ **TikFinity Desktop** installé et configuré
- ✅ **Windows 10/11** (PC physique pour le live)

### Comptes et API Keys
- ✅ **OpenRouter API Key** (pour DeepSeek/Claude)
- ✅ **TikFinity API Key** + Webhook Secret
- ✅ **TikTok Creator Account** avec live activé
- ✅ **Domaine configuré** : live.angeline-nj.xyz

---

## 🔧 INSTALLATION INITIALE (PREMIÈRE FOIS)

### 1. Cloner et installer les dépendances

```powershell
cd "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live"
npm install
```

### 2. Configurer les variables d'environnement

Créer/éditer le fichier `.env` à la racine :

```env
# === OBS WebSocket v5 ===
OBS_WS_HOST=localhost
OBS_WS_PORT=4455
OBS_WS_PASSWORD=votre_mot_de_passe_obs

# === OpenRouter (IA) ===
OPENROUTER_API_KEY=sk-or-v1-xxxxxxxxxxxxx
OPENROUTER_MODEL=deepseek/deepseek-chat

# === TikFinity ===
TIKFINITY_API_KEY=votre_api_key
TIKFINITY_WEBHOOK_SECRET=votre_webhook_secret
TIKFINITY_WEBHOOK_PORT=3002

# === Ports ===
LIVE_CORE_PORT=3001
WEB_ADMIN_PORT=3000

# === CORS (pour web-admin) ===
CORS_ORIGIN=http://localhost:3000

# === Database (PostgreSQL) ===
DATABASE_URL=postgresql://user:password@localhost:5432/angeline_live

# === Auth (web-admin) ===
NEXTAUTH_SECRET=votre_secret_aleatoire_long
NEXTAUTH_URL=http://localhost:3000

# === ElevenLabs TTS (optionnel) ===
ELEVENLABS_API_KEY=votre_api_key_elevenlabs
ELEVENLABS_VOICE_ID=votre_voice_id
```

### 3. Préparer les assets

```powershell
# Créer la structure des dossiers assets
mkdir -p assets/oracles_assets/ORACLE_MYSTICA/CORE
mkdir -p assets/visuals/backgrounds
mkdir -p assets/visuals/effects
mkdir -p assets/audio/shuffle
mkdir -p assets/audio/flip
```

**Placer vos fichiers :**
- Cartes oracle dans `assets/oracles_assets/ORACLE_MYSTICA/CORE/`
- Vidéos CapCut dans `assets/visuals/`
- Sons dans `assets/audio/`

### 4. Compiler le projet

```powershell
npm run build
```

---

## 🎥 CONFIGURATION OBS

### 1. Activer OBS WebSocket v5

1. Ouvrir **OBS Studio**
2. **Outils** → **WebSocket Server Settings**
3. ✅ Cocher **Enable WebSocket server**
4. Port : **4455**
5. Définir un **mot de passe** (le mettre dans `.env`)
6. **Appliquer** et **OK**

### 2. Importer la scène

```powershell
# Utiliser le fichier de configuration OBS fourni
# OBS → Collection de scènes → Importer → OBS_SCENE_COLLECTION.json
```

**Ou créer manuellement la scène `LIVE_BASE` avec :**

| Source | Type | Chemin/Config |
|--------|------|---------------|
| BG_LOOP | Média | `assets/visuals/backgrounds/BG_LOOP.mp4` (loop) |
| CAM | Caméra | Votre webcam/caméra |
| CARD1 | Image | (vide au départ) |
| CARD2 | Image | (vide au départ) |
| CARD3 | Image | (vide au départ) |
| USERNAME_TEXT | Texte | Arial Bold 48pt, blanc, contour noir |
| QUESTION_TEXT | Texte | Arial 36pt, blanc, contour noir |
| ANSWER_TEXT | Texte | Arial 32pt, doré, contour noir |
| SFX_SHUFFLE | Média Audio | `assets/audio/shuffle/shuffle.wav` |
| SFX_FLIP | Média Audio | `assets/audio/flip/flip.wav` |

### 3. Positionner les sources (9:16 - 1080x1920)

- **BG_LOOP** : 0,0 → 1080x1920 (plein écran)
- **CAM** : 0,400 → 1080x1080 (centre)
- **CARD1** : 100,800 → 250x400 (gauche)
- **CARD2** : 415,750 → 250x400 (centre)
- **CARD3** : 730,800 → 250x400 (droite)
- **USERNAME_TEXT** : 540,100 → 900x80 (haut, centré)
- **QUESTION_TEXT** : 540,200 → 1000x150 (sous username)
- **ANSWER_TEXT** : 540,1300 → 1000x500 (bas)

### 4. Tester la connexion

```powershell
# Lancer le live-core en mode dev
npm run dev:core
```

Vérifier dans les logs : `✅ Connected to OBS WebSocket`

---

## 🔗 CONFIGURATION TIKFINITY

### 1. Installer TikFinity Desktop

Télécharger depuis [tikfinity.com](https://tikfinity.com) et installer.

### 2. Configurer le webhook

Dans TikFinity Desktop :
1. **Settings** → **Webhooks**
2. Webhook URL : `http://localhost:3002/webhook/tiktok`
3. Secret : (celui de votre `.env`)
4. Events : ✅ Chat, ✅ Gift, ✅ Follow, ✅ Share, ✅ Like

### 3. Connecter votre compte TikTok

1. **Connect Account** dans TikFinity
2. Scanner le QR code avec TikTok mobile
3. Autoriser l'accès

---

## 🌐 CONFIGURATION WEB-ADMIN

### 1. Créer la base de données

```powershell
# Si PostgreSQL installé localement
psql -U postgres
CREATE DATABASE angeline_live;
\q

# Migrer le schéma
cd apps/web-admin
npx prisma migrate dev
```

### 2. Créer l'utilisateur admin

```powershell
npm run create-user
# Suivre les instructions pour créer admin@angeline-nj.xyz
```

### 3. Lancer le web-admin

```powershell
npm run dev:web
```

Accès : http://localhost:3000

---

## ▶️ LANCER LE LIVE (PROCÉDURE COMPLÈTE)

### Étape 1 : Préparer l'environnement (5 min avant)

```powershell
# Terminal 1 : Lancer live-core
cd "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live"
npm run dev:core
```

**Vérifier les logs :**
```
✅ Oracle Manager initialized
✅ OBS connected
✅ LLM client initialized
✅ Health monitor started
✅ Live Core API listening on port 3001
```

```powershell
# Terminal 2 : Lancer web-admin
npm run dev:web
```

**Vérifier :**
- Web-admin accessible sur http://localhost:3000
- Login avec admin@angeline-nj.xyz

### Étape 2 : Ouvrir OBS Studio

1. Lancer **OBS Studio**
2. Sélectionner la scène **LIVE_BASE**
3. Vérifier que toutes les sources sont présentes
4. **Ne pas encore démarrer le streaming TikTok**

### Étape 3 : Ouvrir TikFinity Desktop

1. Lancer **TikFinity Desktop**
2. Vérifier que le compte TikTok est connecté
3. Vérifier que le webhook est actif (voyant vert)

### Étape 4 : Activer le système via Web-Admin

1. Ouvrir http://localhost:3000 dans votre navigateur
2. Se connecter
3. Cliquer sur **"START LIVE"**
4. Vérifier que le statut passe à **"🟢 LIVE ACTIVE"**

**Dashboard doit afficher :**
- 🟢 OBS : Connected
- 🟢 TikFinity : Connected
- 🟢 OpenRouter : Ready
- Mode : AUTO
- Oracle : ORACLE_MYSTICA

### Étape 5 : Démarrer le live TikTok

1. Dans **OBS Studio** : **Démarrer le streaming** (vers TikTok)
2. Sur votre **téléphone TikTok** : Lancer le live
3. Ou via **TikFinity Desktop** : Start Live

### Étape 6 : Tester le système

Dans le web-admin, section **Test** :
1. Username : `TestUser`
2. Message : `Quelle est ma destinée amoureuse ?`
3. Cliquer **"Send Test Message"**

**Vérifier dans OBS :**
- Les 3 cartes apparaissent
- Le texte s'affiche
- Les sons jouent
- La réponse IA s'affiche

### Étape 7 : C'est parti ! 🎉

Le système est maintenant **100% autonome** :
- Les questions TikTok sont détectées automatiquement
- Les cartes sont tirées par l'IA
- Les réponses s'affichent dans OBS
- Tout est automatique !

---

## 🛑 ARRÊTER LE LIVE

### Procédure d'arrêt propre

1. **Web-admin** : Cliquer sur **"STOP LIVE"**
2. **TikTok** : Terminer le live sur mobile/TikFinity
3. **OBS** : Arrêter le streaming
4. **Terminaux** : Ctrl+C dans les 2 terminaux (live-core + web-admin)

---

## 🔍 MONITORING EN TEMPS RÉEL

### Via Web-Admin Dashboard

- **Stats live** : Nombre de lectures, messages, cadeaux, follows
- **État système** : OBS, TikFinity, OpenRouter
- **Dernière lecture** : Username, question, cartes tirées
- **File d'attente** : Questions en attente (si cadeaux)

### Via Logs

```powershell
# Logs live-core
tail -f logs/live-core.log

# Logs web-admin
cd apps/web-admin
npm run logs
```

---

## ⚙️ MODES DE FONCTIONNEMENT

### Mode AUTO (par défaut)

L'IA sélectionne automatiquement l'oracle selon la question :
- Question amour → ORACLE_GOSSIP_LOVE
- Question travail → ORACLE_MYSTICA/TRAVAIL
- Question famille → ORACLE_NJ_FAMILY
- Etc.

### Mode FORCÉ

Forcer un oracle spécifique pour toutes les questions :

**Via Web-Admin :**
1. Section **Mode**
2. Sélectionner **FORCED**
3. Choisir l'oracle (ex: ORACLE_MYSTICA)
4. Appliquer

**Via API :**
```bash
curl -X POST http://localhost:3001/api/live/mode \
  -H "Content-Type: application/json" \
  -d '{"mode":"FORCED","oracleId":"ORACLE_MYSTICA"}'
```

---

## 🎁 SYSTÈME DE CADEAUX TIKTOK

### Cadeaux configurés

| Cadeau | Effet |
|--------|-------|
| **Shell Energy** | Priorité immédiate (répondu en premier) |
| **Heart Me** | Autorise les questions après follow |
| **Doughnut** | Ajouté à la file d'attente |

### Modifier les cadeaux

Éditer `apps/live-core/agents/tiktok/GiftDetector.ts` :

```typescript
private readonly PRIORITY_GIFTS = ['Shell Energy', 'Rose'];
private readonly AUTH_GIFTS = ['Heart Me', 'TikTok'];
private readonly QUEUE_GIFTS = ['Doughnut', 'Ice Cream'];
```

---

## 🐛 TROUBLESHOOTING

### ❌ OBS ne se connecte pas

**Vérifier :**
- OBS WebSocket v5 activé (Outils → WebSocket Server Settings)
- Port 4455 correct dans `.env`
- Mot de passe correct dans `.env`
- OBS est bien lancé avant live-core

**Solution :**
```powershell
# Redémarrer OBS
# Vérifier les logs live-core
npm run dev:core
```

### ❌ TikFinity ne reçoit pas les messages

**Vérifier :**
- TikFinity Desktop est lancé
- Compte TikTok connecté dans TikFinity
- Webhook configuré sur `http://localhost:3002/webhook/tiktok`
- Port 3002 disponible

**Solution :**
```powershell
# Vérifier que le port 3002 est libre
netstat -ano | findstr :3002

# Redémarrer TikFinity Desktop
```

### ❌ L'IA ne répond pas

**Vérifier :**
- OpenRouter API Key valide dans `.env`
- Crédit disponible sur compte OpenRouter
- Modèle `deepseek/deepseek-chat` accessible

**Solution :**
```powershell
# Tester l'API OpenRouter
curl https://openrouter.ai/api/v1/models \
  -H "Authorization: Bearer $OPENROUTER_API_KEY"
```

### ❌ Les cartes ne s'affichent pas dans OBS

**Vérifier :**
- Les fichiers de cartes existent dans `assets/oracles_assets/ORACLE_MYSTICA/CORE/`
- Les noms de fichiers respectent le format : `mystica_sentimental_001.png`
- Les sources CARD1, CARD2, CARD3 existent dans OBS scène LIVE_BASE

**Solution :**
```powershell
# Lister les cartes disponibles
ls assets/oracles_assets/ORACLE_MYSTICA/CORE/

# Vérifier les logs OBS dans live-core
```

### ❌ Web-admin ne se connecte pas

**Vérifier :**
- PostgreSQL est lancé
- Database `angeline_live` existe
- Migrations Prisma appliquées
- Port 3000 disponible

**Solution :**
```powershell
cd apps/web-admin
npx prisma migrate reset
npx prisma migrate dev
npm run create-user
```

---

## 📊 COMMANDES UTILES

### Développement

```powershell
# Lancer tout en dev
npm run dev

# Lancer uniquement live-core
npm run dev:core

# Lancer uniquement web-admin
npm run dev:web

# Compiler tout
npm run build

# Linter
npm run lint
```

### Production

```powershell
# Build production
npm run build

# Lancer en production
npm start

# Avec PM2 (recommandé)
pm2 start ecosystem.config.js
pm2 logs
pm2 stop all
```

### Base de données

```powershell
cd apps/web-admin

# Créer une migration
npx prisma migrate dev --name nom_migration

# Appliquer les migrations
npx prisma migrate deploy

# Ouvrir Prisma Studio
npx prisma studio

# Reset complet
npx prisma migrate reset
```

### Assets

```powershell
# Créer les assets OBS (PowerShell)
.\create_obs_assets.ps1

# Vérifier les assets oracle
node scripts/validate-oracle-assets.js
```

---

## 🚀 DÉPLOIEMENT VPS (PRODUCTION)

### Prérequis VPS
- Ubuntu 22.04 LTS
- 4 GB RAM minimum
- Node.js v20+
- PostgreSQL 15+
- Nginx
- SSL (Let's Encrypt)

### Installation VPS

```bash
# Cloner le repo
git clone https://github.com/votre-repo/angeline-live.git
cd angeline-live

# Installer dépendances
npm install

# Configurer .env production
cp .env.example .env
nano .env

# Build
npm run build

# Setup database
cd apps/web-admin
npx prisma migrate deploy

# Lancer avec PM2
pm2 start ecosystem.config.js
pm2 save
pm2 startup
```

### Nginx Configuration

Voir `nginx-live.angeline-nj.xyz.conf` pour la config complète.

### SSL

```bash
sudo certbot --nginx -d live.angeline-nj.xyz
```

---

## 📝 CHECKLIST AVANT LIVE

### Technique
- [ ] OBS Studio lancé et connecté
- [ ] TikFinity Desktop lancé et connecté
- [ ] Live-core lancé (port 3001)
- [ ] Web-admin lancé (port 3000)
- [ ] Tous les services "🟢 Connected" dans dashboard
- [ ] Test message fonctionne
- [ ] Cartes s'affichent correctement
- [ ] Sons jouent correctement

### Assets
- [ ] Cartes oracle présentes dans assets/
- [ ] Vidéos CapCut (BG_LOOP, FX_SMOKE) présentes
- [ ] Sons (shuffle, flip) présents
- [ ] OBS scène LIVE_BASE configurée

### Configuration
- [ ] `.env` rempli avec toutes les API keys
- [ ] Mode AUTO ou FORCÉ sélectionné
- [ ] Oracle par défaut configuré
- [ ] Cadeaux TikTok configurés

### Live TikTok
- [ ] Compte TikTok avec live activé
- [ ] TikFinity connecté au compte
- [ ] Titre du live préparé
- [ ] Hashtags préparés

---

## 🎉 VOUS ÊTES PRÊT !

Une fois tous les éléments en place :

1. **Lancer les services** (live-core + web-admin)
2. **Vérifier le dashboard** (tout en vert)
3. **Tester** avec un message de test
4. **Démarrer le live TikTok**
5. **Profiter** du live 100% automatisé ! 🔮✨

---

## 📞 SUPPORT

En cas de problème :
1. Vérifier les logs : `logs/live-core.log`
2. Consulter `TROUBLESHOOTING.md`
3. Vérifier `VALIDATION_CHECKLIST.md`

**Le système est maintenant prêt à tourner 24/7 en autonomie complète !** 🚀

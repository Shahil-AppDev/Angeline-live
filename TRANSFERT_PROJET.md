# 📦 GUIDE DE TRANSFERT - ANGELINE LIVE

## 🎯 CONTENU DU PROJET COMPLET

Ce projet contient **TOUT** le système de live TikTok automatisé avec oracle MYSTICA, y compris :
- ✅ Code source complet (apps, packages, agents)
- ✅ 189 cartes oracle recadrées et optimisées
- ✅ Vidéos (background + effets)
- ✅ Formation PDF "Maîtriser l'art des Oracles"
- ✅ Fichiers de configuration (`.env` inclus)
- ✅ Documentation complète
- ✅ Scripts de recadrage automatique
- ✅ node_modules (si inclus dans l'archive)

---

## 📂 STRUCTURE DU PROJET

```
Angeline-live/
├── apps/
│   ├── live-core/              # Moteur multi-agents Node.js
│   │   ├── agents/             # 12 agents (TikTok, IA, Oracle, Response, OBS, System)
│   │   ├── src/                # Code principal
│   │   └── .env                # ⚠️ Configuration (API keys)
│   └── web-admin/              # Dashboard Next.js
│       ├── src/
│       └── .env.local          # ⚠️ Configuration web-admin
├── packages/
│   ├── shared/                 # Types TypeScript
│   ├── tikfinity-bridge/       # Client TikFinity
│   ├── oracle-system/          # Gestionnaire oracles
│   ├── obs-render/             # OBS WebSocket v5
│   ├── llm/                    # OpenRouter client
│   ├── intents/                # Taxonomie intentions
│   └── elevenlabs-tts/         # TTS (optionnel)
├── assets/
│   ├── oracles_assets/
│   │   └── ORACLE_MYSTICA/
│   │       ├── CORE/           # 145 cartes base
│   │       ├── backs/          # Dos carte base
│   │       └── EXTENSIONS/
│   │           ├── SENTIMENTAL/  # 27 cartes + dos
│   │           └── TRAVAIL/      # 17 cartes + dos
│   ├── visuals/
│   │   ├── backgrounds/        # BG_LOOP.mp4
│   │   └── effects/            # FX_SMOKE.mp4
│   ├── audio/                  # (shuffle.wav, flip.wav à ajouter)
│   └── training/               # Formation PDF
├── config/
│   ├── taxonomy.json           # Intentions H0-H3
│   ├── oracles.json            # Configuration oracles
│   └── sources_map.json        # Mapping OBS
├── scripts/
│   ├── crop_oracle_cards.py    # Script recadrage Python
│   └── crop_cards.ps1          # Script recadrage PowerShell
└── Documentation/
    ├── README.md
    ├── CAPCUT_PROMPTS.md
    ├── GUIDE_LANCEMENT.md
    ├── SYSTEM_COMPLETE.md
    ├── TRAINING_INTEGRATION.md
    ├── GUIDE_RECADRAGE_CARTES.md
    └── TRANSFERT_PROJET.md (ce fichier)
```

---

## 🚀 INSTALLATION SUR NOUVEL ORDINATEUR

### 1. Prérequis à installer

```powershell
# Node.js v20+
winget install OpenJS.NodeJS.LTS

# Python 3.12+ (pour scripts de recadrage)
winget install Python.Python.3.12

# OBS Studio
winget install OBSProject.OBSStudio

# PostgreSQL (pour web-admin)
winget install PostgreSQL.PostgreSQL

# Git (optionnel)
winget install Git.Git
```

### 2. Extraire le projet

```powershell
# Décompresser l'archive
Expand-Archive -Path "Angeline-live-COMPLET.zip" -DestinationPath "C:\Projets\Angeline-live"

# Aller dans le dossier
cd "C:\Projets\Angeline-live"
```

### 3. Installer les dépendances

```powershell
# Installer toutes les dépendances npm
npm install

# Installer les dépendances Python (pour scripts)
pip install Pillow numpy
```

### 4. Configurer PostgreSQL

```powershell
# Créer la base de données
psql -U postgres
CREATE DATABASE angeline_live;
\q

# Mettre à jour DATABASE_URL dans apps/live-core/.env
# DATABASE_URL=postgresql://postgres:votre_mot_de_passe@localhost:5432/angeline_live
```

### 5. Configurer OBS Studio

1. **Installer OBS Studio**
2. **Activer WebSocket v5 :**
   - Outils → Paramètres WebSocket
   - Activer le serveur WebSocket
   - Port : 4455
   - Mot de passe : (noter le mot de passe)
3. **Créer la scène LIVE_BASE** avec les sources :
   - BG_LOOP (Média) → `assets/visuals/backgrounds/BG_LOOP.mp4`
   - FX_SMOKE (Média) → `assets/visuals/effects/FX_SMOKE.mp4`
   - CARD1, CARD2, CARD3 (Images)
   - USERNAME_TEXT, QUESTION_TEXT, ANSWER_TEXT (Textes)
   - SFX_SHUFFLE, SFX_FLIP (Audio)

4. **Mettre à jour le `.env` :**
   ```env
   OBS_WS_URL=ws://localhost:4455
   OBS_WS_PASSWORD=votre_mot_de_passe_obs
   ```

### 6. Configurer TikFinity Desktop

1. **Télécharger TikFinity Desktop** depuis https://tikfinity.zerody.one/
2. **Installer et lancer**
3. **Connecter votre compte TikTok**
4. **Le WebSocket sera disponible sur** `ws://localhost:21213`

### 7. Obtenir les API Keys

#### OpenRouter (OBLIGATOIRE)
1. Aller sur https://openrouter.ai/
2. Créer un compte
3. Keys → Create Key
4. Copier la clé (commence par `sk-or-v1-...`)
5. Mettre à jour dans `.env` :
   ```env
   OPENROUTER_API_KEY=sk-or-v1-votre_cle_ici
   ```

#### NextAuth Secret (OBLIGATOIRE)
```powershell
# Générer un secret aléatoire
-join ((65..90) + (97..122) + (48..57) | Get-Random -Count 32 | % {[char]$_})

# Copier le résultat dans .env
# NEXTAUTH_SECRET=le_secret_genere
```

### 8. Lancer le système

```powershell
# Terminal 1 : Live Core
npm run dev:core

# Terminal 2 : Web Admin
npm run dev:web

# Terminal 3 : OBS Studio (déjà lancé)

# Terminal 4 : TikFinity Desktop (déjà lancé)
```

### 9. Accéder au dashboard

Ouvrir le navigateur : **http://localhost:3000**

---

## 📋 CHECKLIST POST-TRANSFERT

### Prérequis
- [ ] Node.js v20+ installé
- [ ] Python 3.12+ installé
- [ ] OBS Studio installé
- [ ] PostgreSQL installé
- [ ] Projet extrait

### Configuration
- [ ] `npm install` exécuté
- [ ] PostgreSQL base créée
- [ ] OBS WebSocket configuré
- [ ] TikFinity Desktop installé et connecté
- [ ] OpenRouter API key obtenue et configurée
- [ ] NextAuth secret généré et configuré
- [ ] DATABASE_URL mise à jour dans `.env`
- [ ] OBS_WS_PASSWORD mise à jour dans `.env`

### Test
- [ ] `npm run dev:core` lance sans erreur
- [ ] `npm run dev:web` lance sans erreur
- [ ] Dashboard accessible sur http://localhost:3000
- [ ] OBS se connecte (vérifier les logs)
- [ ] TikFinity se connecte (vérifier les logs)

---

## 🔧 FICHIERS DE CONFIGURATION IMPORTANTS

### apps/live-core/.env
```env
# TikFinity
TIKFINITY_ENABLED=true
TIKFINITY_WS_URL=ws://localhost:21213

# OBS
OBS_ENABLED=true
OBS_WS_URL=ws://localhost:4455
OBS_WS_PASSWORD=votre_mot_de_passe

# OpenRouter
OPENROUTER_API_KEY=sk-or-v1-votre_cle
OPENROUTER_MODEL=deepseek/deepseek-chat

# Database
DATABASE_URL=postgresql://postgres:password@localhost:5432/angeline_live

# NextAuth
NEXTAUTH_SECRET=votre_secret_32_caracteres
NEXTAUTH_URL=http://localhost:3000

# ElevenLabs (optionnel)
ELEVENLABS_API_KEY=sk_votre_cle
ELEVENLABS_VOICE_ID=votre_voice_id
```

### apps/web-admin/.env.local
```env
DATABASE_URL=postgresql://postgres:password@localhost:5432/angeline_live
NEXTAUTH_SECRET=votre_secret_32_caracteres
NEXTAUTH_URL=http://localhost:3000
NEXT_PUBLIC_API_URL=http://localhost:3002
```

---

## 📊 CONTENU ASSETS

### Cartes Oracle (189 cartes)
- **CORE** : 145 cartes (500x888px)
- **SENTIMENTAL** : 27 cartes + dos lune violette
- **TRAVAIL** : 17 cartes + dos
- **Dos base** : pentagramme rose/violet

### Vidéos
- **BG_LOOP.mp4** : Background mystique loop (9:16)
- **FX_SMOKE.mp4** : Effet fumée magique (3s)

### Formation
- **Maitriser-l-art-des-Oracles.PDF** : Formation professionnelle intégrée dans l'IA

### Audio (à ajouter)
- ⏳ **shuffle.wav** : Son mélange cartes
- ⏳ **flip.wav** : Son retournement

---

## 🆘 TROUBLESHOOTING

### Erreur : Cannot find module
```powershell
# Réinstaller les dépendances
rm -r node_modules
npm install
```

### Erreur : OBS connection failed
1. Vérifier qu'OBS est lancé
2. Vérifier WebSocket activé (Outils → Paramètres WebSocket)
3. Vérifier le mot de passe dans `.env`
4. Vérifier le port (défaut: 4455)

### Erreur : TikFinity connection failed
1. Vérifier que TikFinity Desktop est lancé
2. Vérifier que le compte TikTok est connecté
3. Vérifier le port (défaut: 21213)

### Erreur : Database connection failed
1. Vérifier que PostgreSQL est lancé
2. Vérifier que la base `angeline_live` existe
3. Vérifier DATABASE_URL dans `.env`
4. Tester la connexion : `psql -U postgres -d angeline_live`

### Erreur : OpenRouter API error
1. Vérifier que la clé API est valide
2. Vérifier le crédit sur le compte OpenRouter
3. Vérifier le modèle : `deepseek/deepseek-chat`

---

## 📞 COMMANDES UTILES

```powershell
# Lancer live-core
npm run dev:core

# Lancer web-admin
npm run dev:web

# Build production
npm run build

# Lancer production
npm run start

# Logs en temps réel
npm run logs

# Tester la connexion OBS
npm run test:obs

# Tester la connexion TikFinity
npm run test:tikfinity

# Recadrer des cartes
python scripts/crop_oracle_cards.py "input/" -o "output/" -w 500 -m 15
```

---

## 🎯 RÉSUMÉ

**Ce projet contient TOUT ce dont vous avez besoin pour lancer le système de live TikTok automatisé.**

**Temps d'installation estimé :** 30-60 minutes

**Prérequis :**
1. Node.js, Python, OBS, PostgreSQL
2. OpenRouter API key (~$5/mois)
3. TikFinity Desktop (gratuit ou payant selon plan)

**Une fois configuré, le système est 100% autonome et peut gérer ~12 lectures/minute.**

---

## 📚 DOCUMENTATION COMPLÈTE

Consultez les fichiers suivants pour plus de détails :
- **README.md** : Vue d'ensemble du projet
- **GUIDE_LANCEMENT.md** : Guide de lancement détaillé
- **SYSTEM_COMPLETE.md** : Documentation technique complète
- **TRAINING_INTEGRATION.md** : Intégration de la formation oracle
- **CAPCUT_PROMPTS.md** : Prompts pour générer les vidéos
- **GUIDE_RECADRAGE_CARTES.md** : Guide de recadrage des cartes

---

**Bon transfert ! 🚀✨**

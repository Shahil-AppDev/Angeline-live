# 📦 Installation - Angeline NJ Live Automation

## Prérequis

- **Node.js** v18+ et npm
- **OBS Studio** avec WebSocket v5 activé
- **TikFinity** compte (mode gratuit OK)
- **OpenRouter** API key
- **Windows** (testé sur Windows 11)

## Installation

### 1. Cloner et installer les dépendances

```bash
cd C:/Users/DarkNode/Desktop/Projet Web/Angeline-live
npm install
```

### 2. Configuration environnement

Copier `.env.example` vers `.env` et remplir:

```env
ADMIN_USERNAME=admin
ADMIN_PASSWORD=votre_mot_de_passe_securise
JWT_SECRET=votre_secret_jwt_aleatoire

OPENROUTER_API_KEY=sk-or-v1-xxxxx
OPENROUTER_MODEL=anthropic/claude-3.5-sonnet

OBS_WS_HOST=localhost
OBS_WS_PORT=4455
OBS_WS_PASSWORD=votre_password_obs

TIKFINITY_API_KEY=votre_cle_tikfinity
TIKFINITY_WEBHOOK_SECRET=votre_secret_webhook

WEB_ADMIN_PORT=3000
LIVE_CORE_PORT=3001
```

### 3. Préparer les assets

Déposer vos fichiers dans `assets/` selon la structure:
- `assets/oracles_assets/ORACLE_ALENA/cards/images/` → card_01.png, card_02.png, etc.
- `assets/audio/shuffle/` → sons de mélange
- `assets/audio/flip/` → sons de retournement
- etc.

### 4. Configurer OBS

1. Activer WebSocket v5 dans OBS (Outils → WebSocket Server Settings)
2. Créer une scène `LIVE_BASE`
3. Ajouter les sources selon `config/sources_map.json`

### 5. Lancer le système

```bash
# Terminal 1 - Live Core
npm run dev:core

# Terminal 2 - Web Admin
npm run dev:web
```

### 6. Accès

- **Web Admin**: http://localhost:3000
- **Live Core API**: http://localhost:3001
- **Login**: admin / (votre mot de passe)

## Structure Projet

Voir `README.md` pour l'architecture complète.

## Support

Pour toute question: contact@angeline-nj.xyz

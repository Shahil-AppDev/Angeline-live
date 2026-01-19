# TikFinity Setup Guide

Ce guide explique comment configurer et lancer Angeline-live avec TikFinity pour streamer sur TikTok LIVE.

## ⚠️ IMPORTANT: Architecture Requise

**TikFinity Desktop DOIT tourner sur le même PC Windows que le client WebSocket.**

```
┌─────────────────────────────────────────┐
│     PC Windows (Stream Machine)         │
│                                          │
│  ┌────────────────────────────────────┐ │
│  │   TikFinity Desktop App            │ │
│  │   (TikTok LIVE API)                │ │
│  │   Port: 21213                      │ │
│  └────────────┬───────────────────────┘ │
│               │ WebSocket               │
│  ┌────────────▼───────────────────────┐ │
│  │   Angeline Live-Core               │ │
│  │   (Node.js Agent)                  │ │
│  └────────────┬───────────────────────┘ │
│               │ WebSocket v5            │
│  ┌────────────▼───────────────────────┐ │
│  │   OBS Studio                       │ │
│  │   (Streaming Software)             │ │
│  └────────────────────────────────────┘ │
└─────────────────────────────────────────┘
```

## Prérequis

### 1. Logiciels Requis

- **Windows 10/11** (TikFinity ne fonctionne que sur Windows)
- **TikFinity Desktop App** (télécharger depuis le site officiel)
- **OBS Studio** (version 28+)
- **Node.js** (version 18+)
- **obs-websocket v5** (inclus dans OBS 28+)

### 2. Compte TikTok

- Compte TikTok avec accès au LIVE
- Minimum 1000 followers (requis par TikTok)

## Installation

### Étape 1: Installer TikFinity Desktop

1. Télécharger TikFinity Desktop depuis le site officiel
2. Installer sur votre PC Windows de streaming
3. Lancer TikFinity et se connecter avec votre compte TikTok
4. Vérifier que le WebSocket est actif sur `ws://localhost:21213`

### Étape 2: Configurer OBS

1. Installer OBS Studio (version 28 ou supérieure)
2. Activer obs-websocket:
   - Outils → obs-websocket Settings
   - Cocher "Enable WebSocket server"
   - Port: `4455` (par défaut)
   - Définir un mot de passe sécurisé
3. Importer les scènes depuis `config/sources_map.json`

### Étape 3: Configurer Angeline Live-Core

1. Cloner le repo sur votre PC Windows:
```bash
git clone <repo-url>
cd Angeline-live
```

2. Installer les dépendances:
```bash
npm install
```

3. Créer le fichier `.env` dans `apps/live-core/`:
```bash
cp apps/live-core/.env.example apps/live-core/.env
```

4. Éditer `.env` avec vos paramètres:
```env
# TikFinity
TIKFINITY_ENABLED=true
TIKFINITY_WS_URL=ws://localhost:21213

# OBS
OBS_ENABLED=true
OBS_WS_URL=ws://127.0.0.1:4455
OBS_WS_PASSWORD=votre_mot_de_passe_obs

# OpenRouter
OPENROUTER_API_KEY=votre_clé_api
```

5. Compiler les packages:
```bash
npm run build
```

## Lancement

### Mode LIVE (Production)

1. **Démarrer TikFinity Desktop** (doit être lancé en premier)
2. **Démarrer OBS Studio**
3. **Lancer Live-Core**:
```bash
cd apps/live-core
npm start
```

4. **Démarrer votre LIVE sur TikTok** via TikFinity
5. **Vérifier les logs**:
```
[TikFinity Bootstrap] Starting bridge...
[TikFinity] Connecting to ws://localhost:21213...
[TikFinity] ✅ Connected successfully
[OBS] ✅ Connected to OBS WebSocket
```

### Mode SIMULATE (Tests Offline)

Pour tester sans TikFinity/TikTok:

1. Créer un fichier d'événements de test:
```bash
cd apps/live-core
node -e "require('@angeline-live/tikfinity-bridge').createSampleSimulationFile('./data/events.jsonl')"
```

2. Modifier `.env`:
```env
TIKFINITY_SIMULATE=true
TIKFINITY_SIMULATE_FILE=./data/events.jsonl
```

3. Lancer:
```bash
npm start
```

Les événements seront rejoués depuis le fichier JSONL.

## Flux de Données

```
TikTok LIVE
    ↓
TikFinity Desktop (WebSocket Server)
    ↓
TikFinityBridge (WebSocket Client)
    ↓ EventBus
    ↓ Normalizer
LiveCoreOrchestrator
    ↓
SafetyGuard → IntentAnalyzer → OracleSelector
    ↓
CardDrawEngine → LLM (OpenRouter) → StyleAgent
    ↓
OBSRenderEngine (showReadingOverlay)
    ↓
OBS Studio (Affichage Stream)
    ↓
TikTok LIVE (Viewers)
```

## Types d'Événements

### CHAT_MESSAGE
```json
{
  "type": "CHAT_MESSAGE",
  "userId": "user123",
  "username": "JohnDoe",
  "message": "Can you do a reading for me?",
  "timestamp": 1234567890
}
```

### GIFT
```json
{
  "type": "GIFT",
  "userId": "user123",
  "username": "JohnDoe",
  "giftId": 5655,
  "giftName": "Rose",
  "coins": 1,
  "count": 5,
  "timestamp": 1234567890
}
```

### FOLLOW
```json
{
  "type": "FOLLOW",
  "userId": "user123",
  "username": "JohnDoe",
  "timestamp": 1234567890
}
```

## Dépannage

### TikFinity ne se connecte pas

- Vérifier que TikFinity Desktop est lancé
- Vérifier l'URL WebSocket: `ws://localhost:21213`
- Vérifier les logs TikFinity Desktop
- Redémarrer TikFinity Desktop

### OBS ne se connecte pas

- Vérifier qu'OBS est lancé
- Vérifier le mot de passe obs-websocket
- Vérifier le port (4455 par défaut)
- Vérifier que obs-websocket est activé dans OBS

### Pas d'événements reçus

- Vérifier que vous êtes en LIVE sur TikTok
- Vérifier que TikFinity est connecté à votre compte
- Tester avec le mode SIMULATE pour isoler le problème

### Erreurs de reconnexion

Le système tente automatiquement de se reconnecter avec exponential backoff:
- Tentative 1: ~1s
- Tentative 2: ~2s
- Tentative 3: ~4s
- ...
- Max: 30s

Après 10 tentatives, le système abandonne. Redémarrer manuellement.

## Limitations

### Chat Outbound (Envoi de messages)

⚠️ **NOT SUPPORTED** - TikFinity DAPI ne permet pas d'envoyer des messages dans le chat TikTok.

Le flag `TIKFINITY_CHAT_OUTBOUND=false` est désactivé par défaut. Si activé, le système loggera:
```
[TikFinity] Chat outbound NOT SUPPORTED by DAPI
```

### Rate Limits

TikTok impose des rate limits:
- Max 1 lecture toutes les 30 secondes (recommandé)
- Éviter de spammer les viewers

## Support

Pour toute question ou problème:
1. Vérifier les logs dans la console
2. Vérifier le statut via l'API: `GET /api/status`
3. Consulter la documentation TikFinity officielle
4. Contacter le support

## Sécurité

- Ne jamais commit le fichier `.env`
- Protéger votre clé API OpenRouter
- Utiliser un mot de passe fort pour obs-websocket
- Ne pas exposer les ports WebSocket sur Internet

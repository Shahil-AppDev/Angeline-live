# 🔮 Angeline NJ - Live IA Automation System

Système complet d'automatisation de live TikTok avec tirage de cartes oracle et IA temps réel.

## 🎯 Architecture

### Monorepo Structure
```
ANGELINE_LIVE_AUTOMATION/
├── apps/
│   ├── web-admin/        # Next.js - Interface admin mobile
│   └── live-core/        # Node.js - Moteur multi-agents
├── packages/
│   ├── oracle-system/    # Système de gestion des oracles
│   ├── intents/          # Taxonomie et analyse d'intentions
│   ├── obs-render/       # Contrôle OBS WebSocket
│   ├── tikfinity-bridge/ # Intégration TikFinity
│   ├── llm/              # Wrapper OpenRouter
│   ├── shared/           # Types et utils partagés
│   └── training-knowledge/ # Base de connaissances
└── assets/               # Assets visuels et audio
```

## 🔧 Installation

1. **Cloner et installer**
```bash
npm install
```

2. **Configurer l'environnement**
```bash
cp .env.example .env
# Éditer .env avec vos clés API
```

3. **Préparer les assets**
Déposer vos fichiers dans `assets/` selon la structure définie.

4. **Lancer le système**
```bash
# Dev mode (web-admin + live-core)
npm run dev

# Production
npm run build
npm start
```

## 📁 Assets Structure

Chaque oracle possède ses propres assets dans `assets/oracles_assets/[ORACLE_NAME]/`:
- `cards/images/` - Images des cartes
- `cards/videos/` - Vidéos des cartes (optionnel)
- `backs/` - Dos de cartes
- `overlays/` - Overlays visuels
- `sfx/` - Effets sonores spécifiques

Assets communs dans `assets/`:
- `audio/shuffle/` - Sons de mélange
- `audio/flip/` - Sons de retournement
- `audio/ambience/` - Ambiances
- `visuals/table/` - Tables
- `visuals/hands/` - Mains
- `visuals/candles/` - Bougies
- `visuals/backgrounds/` - Fonds

## 🎮 Oracles Disponibles

1. **L'Oracle à Léna** - `ORACLE_ALENA`
2. **L'Oracle** - `ORACLE_STANDARD`
3. **Nj Family** - `ORACLE_NJ_FAMILY`
4. **L'Oracle NJ** - `ORACLE_NJ`
5. **Gossip Love** - `ORACLE_GOSSIP_LOVE`
6. **Mystica** - `ORACLE_MYSTICA`
   - CORE
   - EXTENSIONS/SENTIMENTAL
   - EXTENSIONS/TRAVAIL
7. **Wood Fairy** - `ORACLE_WOOD_FAIRY`

## 🤖 Agents System

### TikTok Agents
- `CHAT_LISTENER` - Écoute messages chat
- `GIFT_DETECTOR` - Détecte cadeaux
- `FOLLOW_AGENT` - Détecte follows

### IA Agents
- `INTENT_ANALYZER` - Analyse intentions (H0/H1/H2/H3)
- `SAFETY_GUARD` - Filtre contenus inappropriés
- `CONTEXT_AGENT` - Gère contexte conversation

### Oracle Agents
- `ORACLE_SELECTOR` - Sélectionne oracle approprié
- `CARD_DRAW_ENGINE` - Tire 3 cartes
- `MEANING_EXTRACTOR` - Extrait significations

### Response Agents
- `PROMPT_BUILDER` - Construit prompts IA
- `RESPONSE_COMPOSER` - Compose réponses
- `STYLE_AGENT` - Applique ton Angeline NJ

### OBS Agents
- `OBS_RENDER_ENGINE` - Render visuel
- `SCENE_MANAGER` - Gestion scènes
- `RATE_LIMITER` - Limite taux updates

### System Agents
- `LIVE_CORE_ORCHESTRATOR` - Orchestration générale
- `LOGGER_AGENT` - Logging centralisé
- `HEALTH_MONITOR` - Monitoring santé système

## 🌐 Web Admin

Accès: `http://localhost:3000` (dev) ou `https://live.angeline-nj.xyz` (prod)

**Fonctionnalités:**
- ✅ Auth sécurisée (1 admin)
- ✅ Dashboard mobile-friendly
- ✅ Start/Stop live
- ✅ Mode AUTO / FORCÉ
- ✅ Sélection oracle forcé
- ✅ Test messages
- ✅ Status temps réel (OBS, TikFinity, OpenRouter)

## 🎥 OBS Setup

**Scène unique:** `LIVE_BASE`

**Sources fixes:**
- `BG_LOOP` - Background animé
- `CAM` - Caméra (table + mains)
- `CARD1`, `CARD2`, `CARD3` - Les 3 cartes
- `USERNAME_TEXT` - Nom utilisateur
- `QUESTION_TEXT` - Question posée
- `ANSWER_TEXT` - Réponse IA
- `SFX_SHUFFLE` - Son mélange
- `SFX_FLIP` - Son retournement

**Configuration OBS WebSocket v5 requise.**

## 📊 Intent Taxonomy

- **H0** - Meta / Commandes live
- **H1** - Oracle général
- **H2** - Axes thématiques:
  - SENTIMENTAL
  - TRAVAIL
  - FAMILLE
  - SPIRITUEL
- **H3** - Sous-intents précis

## 🚀 Happy Path

```
1. Message TikTok reçu
   ↓
2. INTENT_ANALYZER → H2/H3
   ↓
3. ORACLE_SELECTOR → Choix oracle + extension
   ↓
4. CARD_DRAW_ENGINE → Tirage 3 cartes
   ↓
5. MEANING_EXTRACTOR → Extraction significations
   ↓
6. PROMPT_BUILDER → Construction prompt
   ↓
7. LLM → Génération réponse
   ↓
8. STYLE_AGENT → Application ton Angeline
   ↓
9. OBS_RENDER_ENGINE → Update visuel
   ↓
10. Réponse envoyée au chat TikTok
```

## 📝 License

Propriétaire - Angeline NJ © 2026

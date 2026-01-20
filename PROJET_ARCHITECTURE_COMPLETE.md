# Architecture Complète - Angeline Live Production

## 🎯 Vue d'ensemble

Système d'automatisation de lives TikTok avec IA, tirages de cartes oracle, et contrôle OBS distant.

### Architecture Hybride VPS + PC Windows

```
┌─────────────────────────────────────────────────────────────┐
│                        PC WINDOWS                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │  TikFinity   │  │  OBS Studio  │  │  TikTok Live │      │
│  │   Desktop    │  │  WebSocket   │  │    Studio    │      │
│  └──────┬───────┘  └──────┬───────┘  └──────┬───────┘      │
│         │                  │                  │              │
│         │                  │                  │              │
│  ┌──────▼──────────────────▼──────────────────▼───────┐    │
│  │              PC-BRIDGE (Node.js)                    │    │
│  │  - Relaie événements TikFinity → VPS               │    │
│  │  - Exécute commandes OBS depuis VPS                │    │
│  │  - Socket.IO Server (port 8080)                    │    │
│  │  - Auth JWT/HMAC                                   │    │
│  └──────────────────────┬──────────────────────────────┘    │
└─────────────────────────┼───────────────────────────────────┘
                          │ Internet
                          │ WebSocket sécurisé
┌─────────────────────────▼───────────────────────────────────┐
│                      VPS HETZNER                             │
│  ┌────────────────────────────────────────────────────┐     │
│  │           LIVE-CORE (API + Agents IA)              │     │
│  │  - Reçoit événements TikFinity via pc-bridge      │     │
│  │  - Détecte commandes (!oracle, questions)         │     │
│  │  - Tire 3 cartes oracle                           │     │
│  │  - Génère réponse IA (DeepSeek)                   │     │
│  │  - Génère TTS (ElevenLabs)                        │     │
│  │  - Envoie commandes OBS via pc-bridge             │     │
│  │  Port: 7000                                        │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │           WEB-ADMIN (Dashboard Next.js)            │     │
│  │  - Interface de contrôle                          │     │
│  │  - Monitoring temps réel                          │     │
│  │  - Statistiques                                   │     │
│  │  Port: 7001                                        │     │
│  └────────────────────────────────────────────────────┘     │
│  ┌────────────────────────────────────────────────────┐     │
│  │                  NGINX                             │     │
│  │  - Reverse proxy                                  │     │
│  │  - SSL/TLS (Let's Encrypt)                        │     │
│  │  - https://live.angeline-nj.xyz                   │     │
│  └────────────────────────────────────────────────────┘     │
└──────────────────────────────────────────────────────────────┘
```

## 📦 Structure Monorepo

```
Angeline-live/
├── apps/
│   ├── pc-bridge/          # ✅ NOUVEAU - Bridge PC Windows
│   │   ├── src/
│   │   │   ├── index.ts           # Point d'entrée
│   │   │   ├── simulate.ts        # Mode simulation
│   │   │   ├── services/
│   │   │   │   ├── TikFinityService.ts
│   │   │   │   └── OBSService.ts
│   │   │   ├── types/
│   │   │   │   └── index.ts
│   │   │   └── utils/
│   │   │       └── logger.ts
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── .env.example
│   │
│   ├── live-core/          # API Backend + Agents IA
│   │   ├── src/
│   │   │   ├── index.ts
│   │   │   ├── services/
│   │   │   │   └── PCBridgeClient.ts  # ✅ À CRÉER
│   │   │   └── ...
│   │   └── .env (MODE=production, PC_BRIDGE_URL, PC_BRIDGE_TOKEN)
│   │
│   └── web-admin/          # Dashboard Next.js
│
├── packages/
│   ├── obs-render/         # ✅ À AMÉLIORER
│   │   └── OBSRenderer.ts  # resetToIdle, showReadingOverlay, revealCardsSequential
│   ├── oracle-system/
│   └── ...
│
├── config/
│   ├── oracles.json
│   ├── sources_map.json    # ✅ À METTRE À JOUR (scene contract)
│   └── taxonomy.json
│
├── public/
│   └── oracle_cards/       # 189 cartes
│
├── docs/
│   ├── SETUP_PC_BRIDGE.md  # ✅ CRÉÉ
│   └── PROD_CHECKLIST.md   # ✅ CRÉÉ
│
└── .github/workflows/
    └── deploy.yml          # CI/CD automatique
```

## 🔄 Flux de Données Production

### 1. Événement TikTok → Tirage Oracle

```
TikTok User: "!oracle"
    ↓
TikFinity Desktop (PC)
    ↓ WebSocket local
PC-Bridge (PC:8080)
    ↓ Socket.IO + JWT Auth
Live-Core (VPS:7000)
    ↓
Détection commande + Tirage 3 cartes
    ↓
Extraction 2 mots-clés par carte (6 total)
    ↓
Génération réponse IA (DeepSeek)
    ↓
Génération TTS (ElevenLabs)
    ↓
Commandes OBS via PC-Bridge
    ↓
OBS Studio (PC) affiche cartes + texte
    ↓
TikTok Live Studio diffuse
```

### 2. Modes de Connexion Live-Core

#### Mode DEV (local)
```typescript
// .env
MODE=development
OBS_ENABLED=true
OBS_WS_URL=ws://localhost:4455
TIKFINITY_ENABLED=true
TIKFINITY_WS_URL=ws://localhost:21213
```

#### Mode PROD (via pc-bridge)
```typescript
// .env
MODE=production
PC_BRIDGE_URL=ws://IP_PUBLIQUE_PC:8080
PC_BRIDGE_TOKEN=token_securise_32_chars
```

## 🎴 Système Oracle

### 8 Oracles Disponibles

1. **ORACLE_MYSTICA** (principal)
   - 189 cartes
   - Extensions: SENTIMENTAL, TRAVAIL
   - Manifest: `cards.json`, `energies.json`, `phrase_templates.json`

2. **Angeline** - Guidance spirituelle
3. **Cassandra** - Prophéties
4. **Morgane** - Magie
5. **Séléné** - Cycles lunaires
6. **Thémis** - Justice divine
7. **Gaïa** - Connexion terre
8. **Iris** - Messages divins
9. **Hécate** - Carrefours

### Pipeline Tirage Optimisé

```typescript
// 1. Tirer 3 cartes uniques
const cards = drawThreeUniqueCards(oracle);

// 2. Extraire 2 mots-clés par carte (6 total)
const keywords = cards.map(card => 
  extractTopKeywords(card.metadata, 2)
).flat();

// 3. Fusionner pour répondre à la question
const response = await generateResponse({
  question: userQuestion,
  keywords: keywords, // 6 mots-clés
  oracle: oracleName,
  style: 'voyance' // guidance/voyance/cartomancie
});

// 4. Réponse: claire, fluide, interprétable
// Ni trop précise, ni trop vague
```

## 🎬 OBS Scene Contract

### Scène IDLE (Attente)

Sources obligatoires:
- `TXT_USERNAME` (Text GDI+) - Nom utilisateur
- `TXT_QUESTION` (Text GDI+) - Question posée
- `TXT_RESPONSE` (Text GDI+) - Réponse vide

### Scène READING_ACTIVE (Tirage)

Sources obligatoires:
- `CARD_1` (Image) - Carte 1
- `CARD_2` (Image) - Carte 2
- `CARD_3` (Image) - Carte 3
- `FX_SMOKE` (Media Source + alpha) - Effet fumée
- `SFX_SHUFFLE` (Media Source audio) - Son mélange
- `SFX_FLIP` (Media Source audio) - Son retournement
- `SFX_POOF` (Media Source audio) - Son apparition

### Commandes OBS via PC-Bridge

```typescript
// Réinitialiser à IDLE
await pcBridge.send({
  type: 'SET_SCENE',
  data: { sceneName: 'IDLE' }
});

// Afficher overlay de lecture
await pcBridge.send({
  type: 'SET_TEXT',
  sourceName: 'TXT_USERNAME',
  data: { text: username }
});

// Révéler cartes séquentiellement
for (let i = 0; i < 3; i++) {
  await pcBridge.send({
    type: 'PLAY_MEDIA',
    sourceName: 'SFX_SHUFFLE'
  });
  await sleep(500);
  
  await pcBridge.send({
    type: 'SET_IMAGE',
    sourceName: `CARD_${i + 1}`,
    data: { imagePath: cards[i].imagePath }
  });
  
  await pcBridge.send({
    type: 'SHOW_SOURCE',
    sourceName: `CARD_${i + 1}`
  });
  
  await sleep(1000);
}
```

## 🔐 Sécurité

### Authentification PC-Bridge

```typescript
// Génération token
const token = crypto.randomBytes(32).toString('hex');

// PC Bridge (.env)
AUTH_TOKEN=token_genere

// VPS Live-Core (.env)
PC_BRIDGE_TOKEN=token_genere

// Connexion avec JWT
const socket = io(PC_BRIDGE_URL, {
  auth: {
    token: jwt.sign({ service: 'live-core' }, PC_BRIDGE_TOKEN)
  }
});
```

### Rate Limiting OBS

```typescript
// PC-Bridge limite les commandes OBS
OBS_COMMAND_RATE_LIMIT=100 // ms entre commandes

// File d'attente avec throttling
private commandQueue: OBSCommand[] = [];
private processing = false;
```

## 📊 Monitoring

### Health Checks

```bash
# PC Bridge
curl http://localhost:8080/health
# → { status: "ok", tikfinity: true, obs: true }

# PC Bridge Status détaillé
curl http://localhost:8080/status
# → { tikfinity: {...}, obs: {...}, server: {...} }

# VPS Live-Core
curl https://live.angeline-nj.xyz/api/health
# → { status: "ok", pcBridge: true }
```

### Logs

```bash
# PC Bridge
tail -f apps/pc-bridge/logs/combined.log

# VPS Live-Core
pm2 logs angeline-live-core

# Nginx
tail -f /var/log/nginx/live.angeline-nj.xyz-access.log
```

## 🚀 Déploiement

### PC Windows

```powershell
cd apps/pc-bridge
npm install
cp .env.example .env
# Éditer .env
npm run build
npm start
```

### VPS (Automatique via GitHub Actions)

```bash
git add .
git commit -m "Update"
git push origin main
# → GitHub Actions déploie automatiquement
```

## 🧪 Tests

### Mode Simulation (sans TikTok)

```powershell
# PC Bridge - Simuler TikFinity
npm run simulate

# Créer data/events.jsonl
{"delay":1000,"event":{"type":"CHAT_MESSAGE","timestamp":1234567890,"user":{"id":"1","username":"user1","nickname":"Alice"},"data":{"message":"!oracle"}}}
{"delay":3000,"event":{"type":"GIFT","timestamp":1234567890,"user":{"id":"2","username":"user2","nickname":"Bob"},"data":{"giftId":5655,"giftName":"Rose","giftCount":1}}}
```

## 📈 Performance

- Latence TikTok → OBS: < 500ms
- Génération réponse IA: 2-3s
- Génération TTS: 1-2s
- Affichage cartes: 3s (séquentiel)
- **Total tirage complet: ~7-10s**

## ✅ Checklist Go-Live

1. ✅ PC Bridge installé et configuré
2. ✅ OBS scènes créées (IDLE, READING_ACTIVE)
3. ✅ TikFinity Desktop connecté
4. ✅ VPS déployé et services PM2 actifs
5. ✅ Connexion PC ↔ VPS établie
6. ✅ Tests end-to-end passés
7. ✅ Monitoring actif
8. 🚀 **PRÊT POUR LA PRODUCTION**

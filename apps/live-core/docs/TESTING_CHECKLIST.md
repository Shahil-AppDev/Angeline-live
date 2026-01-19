# Checklist de Test - TikFinity Bridge & Live Core

## Phase 1: Tests en Mode SIMULATE (Offline)

### 1.1 Préparation

```bash
cd apps/live-core

# Créer le fichier de simulation
node -e "const { createSampleSimulationFile } = require('@angeline-live/tikfinity-bridge'); createSampleSimulationFile('./data/events.jsonl')"

# Configurer .env pour SIMULATE
cp .env.example .env
```

Éditer `.env`:
```env
TIKFINITY_ENABLED=true
TIKFINITY_SIMULATE=true
TIKFINITY_SIMULATE_FILE=./data/events.jsonl
OBS_ENABLED=false
```

### 1.2 Lancer en Mode Simulate

```bash
npm start
```

**✅ Vérifications:**
- [ ] `[Bridge] Starting in SIMULATE mode` apparaît dans les logs
- [ ] `[Simulator] Starting playback from ./data/events.jsonl` 
- [ ] Événements rejoués: CHAT_MESSAGE, FOLLOW, GIFT
- [ ] Aucune erreur de parsing
- [ ] Événements normalisés correctement

**Logs attendus:**
```
[Simulator] 📨 Replaying CHAT_MESSAGE from TestUser1
[TikFinity Bootstrap] Bridge started successfully
[ORCHESTRATOR] Processing message from TestUser1
```

### 1.3 Tester le Flux Complet

```bash
# Créer un fichier de test personnalisé
cat > ./data/test-flow.jsonl << 'EOF'
{"type":"CHAT_MESSAGE","userId":"user1","username":"Alice","message":"Can you do a tarot reading?","timestamp":1234567890000}
{"type":"FOLLOW","userId":"user1","username":"Alice","timestamp":1234567891000}
{"type":"GIFT","userId":"user1","username":"Alice","giftId":5269,"giftName":"Heart Me","coins":15,"count":1,"timestamp":1234567892000}
{"type":"CHAT_MESSAGE","userId":"user1","username":"Alice","message":"What does my future hold?","timestamp":1234567895000}
EOF
```

Modifier `.env`:
```env
TIKFINITY_SIMULATE_FILE=./data/test-flow.jsonl
```

**✅ Vérifications:**
- [ ] SafetyGuard valide les messages
- [ ] IntentAnalyzer détecte l'intent
- [ ] OracleSelector choisit un oracle
- [ ] CardDrawEngine tire 3 cartes
- [ ] LLM génère une réponse
- [ ] StyleAgent applique le style

---

## Phase 2: Tests avec OBS (Sans TikTok)

### 2.1 Configuration OBS

1. Lancer OBS Studio
2. Activer obs-websocket (Outils → obs-websocket Settings)
3. Noter le mot de passe

Éditer `.env`:
```env
OBS_ENABLED=true
OBS_WS_URL=ws://127.0.0.1:4455
OBS_WS_PASSWORD=votre_mot_de_passe
```

### 2.2 Tester la Connexion OBS

```bash
npm start
```

**✅ Vérifications:**
- [ ] `[OBS] ✅ Connected to OBS WebSocket` dans les logs
- [ ] Pas d'erreur de connexion
- [ ] Status API retourne `obs: { connected: true }`

```bash
curl http://localhost:3001/health
```

### 2.3 Tester showReadingOverlay

Avec SIMULATE actif + OBS connecté:

**✅ Vérifications:**
- [ ] Preset `reading_active` activé
- [ ] Textes affichés: username, question, response
- [ ] 3 cartes révélées avec animations
- [ ] Sons de shuffle/flip (si configurés)

### 2.4 Tester resetToIdle

Arrêter le live:

```bash
curl -X POST http://localhost:3001/live/stop
```

**✅ Vérifications:**
- [ ] `[OBS] Resetting to idle state` dans les logs
- [ ] Preset `idle` activé
- [ ] Textes effacés
- [ ] Cartes masquées

---

## Phase 3: Tests LIVE avec TikFinity (Production)

### 3.1 Préparation Windows PC

**Prérequis:**
- [ ] TikFinity Desktop installé
- [ ] OBS Studio lancé
- [ ] Compte TikTok avec accès LIVE (1000+ followers)

### 3.2 Configuration LIVE

Éditer `.env`:
```env
TIKFINITY_ENABLED=true
TIKFINITY_SIMULATE=false
TIKFINITY_WS_URL=ws://localhost:21213
TIKFINITY_RECONNECT_ENABLED=true
OBS_ENABLED=true
```

### 3.3 Séquence de Démarrage

1. **Démarrer TikFinity Desktop**
   - Se connecter avec compte TikTok
   - Vérifier WebSocket actif sur port 21213

2. **Démarrer OBS Studio**
   - Charger la scène configurée
   - Vérifier obs-websocket actif

3. **Lancer Live Core**
```bash
npm start
```

**✅ Vérifications:**
- [ ] `[TikFinity] Connecting to ws://localhost:21213...`
- [ ] `[TikFinity] ✅ Connected successfully`
- [ ] `[OBS] ✅ Connected to OBS WebSocket`
- [ ] Pas d'erreur de connexion

4. **Démarrer le LIVE**
```bash
curl -X POST http://localhost:3001/live/start
```

5. **Lancer le LIVE TikTok** via TikFinity

### 3.4 Tests en Conditions Réelles

#### Test 1: Message Chat Simple

**Action:** Envoyer un message dans le chat TikTok

**✅ Vérifications:**
- [ ] `[TikFinity] 📨 CHAT_MESSAGE from [username]` dans les logs
- [ ] Événement normalisé correctement
- [ ] Message passe par SafetyGuard
- [ ] Traitement complet jusqu'à OBS

#### Test 2: Follow

**Action:** Suivre le compte pendant le LIVE

**✅ Vérifications:**
- [ ] `[TikFinity] 📨 FOLLOW from [username]`
- [ ] Compteur `totalFollows` incrémenté
- [ ] Événement loggé

#### Test 3: Gift (Heart Me)

**Action:** Envoyer un gift "Heart Me"

**✅ Vérifications:**
- [ ] `[TikFinity] 📨 GIFT from [username]`
- [ ] Gift normalisé avec `giftName`, `coins`, `count`
- [ ] Compteur `totalGifts` incrémenté
- [ ] Logique métier déclenchée (autorisation questions)

#### Test 4: Lecture Complète

**Action:** Poser une question après avoir suivi + envoyé Heart Me

**✅ Vérifications:**
- [ ] Question autorisée (user dans `authorizedUsers`)
- [ ] Flux complet: SafetyGuard → Intent → Oracle → Cards → LLM → Style
- [ ] OBS affiche le reading overlay
- [ ] Cartes révélées avec animations
- [ ] Réponse affichée

---

## Phase 4: Tests de Robustesse

### 4.1 Test Reconnexion TikFinity

**Action:** Fermer TikFinity Desktop pendant que Live Core tourne

**✅ Vérifications:**
- [ ] `[TikFinity] Connection closed`
- [ ] `[TikFinity] Reconnecting in Xms (attempt 1/10)`
- [ ] Exponential backoff appliqué
- [ ] Reconnexion automatique après redémarrage TikFinity

### 4.2 Test Heartbeat

**Action:** Laisser tourner 5+ minutes sans activité

**✅ Vérifications:**
- [ ] `[TikFinity] Ping sent` toutes les 30s
- [ ] `[TikFinity] Pong received`
- [ ] Pas de déconnexion intempestive

### 4.3 Test Événements Malformés

Créer un fichier de test avec événements invalides:

```jsonl
{"invalid":"data"}
{"type":"UNKNOWN_TYPE","data":{}}
{"type":"CHAT_MESSAGE"}
{"type":"CHAT_MESSAGE","userId":"test","username":"Test"}
```

**✅ Vérifications:**
- [ ] `[Normalizer] Invalid raw event` pour événements malformés
- [ ] `[Normalizer] Unknown event type` pour types inconnus
- [ ] `[Normalizer] Empty chat message, skipping` pour messages vides
- [ ] Système continue de fonctionner (pas de crash)

### 4.4 Test Charge

**Action:** Envoyer 50+ messages rapidement (simulate avec loop)

**✅ Vérifications:**
- [ ] Tous les messages traités
- [ ] Pas de perte d'événements
- [ ] RateLimiter fonctionne
- [ ] Mémoire stable

---

## Phase 5: Tests API & Dashboard

### 5.1 Health Check

```bash
curl http://localhost:3001/health
```

**✅ Réponse attendue:**
```json
{
  "healthy": true,
  "services": {...},
  "live": {
    "isActive": true,
    "mode": "AUTO",
    "stats": {...}
  }
}
```

### 5.2 Start/Stop Live

```bash
# Start
curl -X POST http://localhost:3001/live/start

# Stop
curl -X POST http://localhost:3001/live/stop
```

**✅ Vérifications:**
- [ ] TikFinity bridge démarre/arrête correctement
- [ ] OBS reset to idle au stop
- [ ] Stats réinitialisées au start

### 5.3 Test Draw Manuel

```bash
curl -X POST http://localhost:3001/live/test-draw \
  -H "Content-Type: application/json" \
  -d '{
    "username": "TestUser",
    "message": "What is my destiny?"
  }'
```

**✅ Vérifications:**
- [ ] Reading déclenché
- [ ] OBS affiche le résultat
- [ ] Réponse API avec succès

---

## Résolution de Problèmes

### TikFinity ne se connecte pas

```bash
# Vérifier que TikFinity Desktop tourne
netstat -an | findstr 21213

# Tester manuellement
wscat -c ws://localhost:21213
```

### OBS ne se connecte pas

```bash
# Vérifier obs-websocket
# Dans OBS: Outils → obs-websocket Settings → Show Connect Info
```

### Événements non reçus

1. Vérifier les logs TikFinity Desktop
2. Vérifier que vous êtes en LIVE sur TikTok
3. Tester avec mode SIMULATE pour isoler

### Erreurs de compilation

```bash
# Rebuild tous les packages
cd packages/tikfinity-bridge && npm run build
cd packages/shared && npm run build
cd packages/obs-render && npm run build
cd apps/live-core && npm run build
```

---

## Checklist Finale de Production

Avant de lancer en production:

- [ ] `.env` configuré avec vraies valeurs
- [ ] `TIKFINITY_SIMULATE=false`
- [ ] OBS scènes configurées selon `sources_map.json`
- [ ] OpenRouter API key valide
- [ ] TikFinity Desktop connecté au bon compte
- [ ] Tests de bout en bout réussis
- [ ] Logs propres sans erreurs
- [ ] Dashboard web accessible
- [ ] Backup de configuration fait

**GO LIVE! 🎉**

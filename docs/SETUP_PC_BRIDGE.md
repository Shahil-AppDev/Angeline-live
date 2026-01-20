# Configuration PC Bridge - Windows

## Prérequis

- Node.js 20+
- OBS Studio avec plugin WebSocket v5
- TikFinity Desktop
- TikTok Live Studio

## Installation

### 1. Installer les dépendances

```powershell
cd apps/pc-bridge
npm install
```

### 2. Configurer OBS Studio

1. **Installer OBS Studio** : https://obsproject.com/
2. **Activer WebSocket** :
   - Outils → WebSocket Server Settings
   - Activer "Enable WebSocket server"
   - Port : `4455`
   - Définir un mot de passe sécurisé
   - Cliquer sur "Show Connect Info" pour vérifier

### 3. Configurer TikFinity Desktop

1. **Télécharger TikFinity** : https://github.com/Zerody/TikFinity
2. **Lancer TikFinity Desktop**
3. **Vérifier le port WebSocket** : Par défaut `21213`

### 4. Configuration du PC Bridge

Copier `.env.example` vers `.env` :

```powershell
cp .env.example .env
```

Éditer `.env` :

```env
# OBS Configuration
OBS_URL=ws://127.0.0.1:4455
OBS_PASSWORD=votre_mot_de_passe_obs

# Server Configuration (port exposé au VPS)
SERVER_PORT=8080
AUTH_TOKEN=generer_un_token_securise_32_chars_minimum

# TikFinity
TIKFINITY_URL=ws://localhost:21213
```

### 5. Générer un token d'authentification

```powershell
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Copier le résultat dans `AUTH_TOKEN`.

## Démarrage

### Mode Production

```powershell
npm run build
npm start
```

### Mode Développement

```powershell
npm run dev
```

### Mode Simulation (tests sans TikTok)

```powershell
npm run simulate
```

## Configuration OBS - Scènes requises

### Scène IDLE

Sources obligatoires :
- `TXT_USERNAME` (Text GDI+)
- `TXT_QUESTION` (Text GDI+)
- `TXT_RESPONSE` (Text GDI+)

### Scène READING_ACTIVE

Sources obligatoires :
- `CARD_1` (Image)
- `CARD_2` (Image)
- `CARD_3` (Image)
- `FX_SMOKE` (Media Source avec alpha)
- `SFX_SHUFFLE` (Media Source audio)
- `SFX_FLIP` (Media Source audio)
- `SFX_POOF` (Media Source audio)

## Vérification

### 1. Tester la connexion OBS

```powershell
curl http://localhost:8080/status
```

Vérifier que `obs.connected: true`

### 2. Tester la connexion TikFinity

Lancer TikFinity Desktop, puis vérifier :

```powershell
curl http://localhost:8080/status
```

Vérifier que `tikfinity.connected: true`

### 3. Health Check

```powershell
curl http://localhost:8080/health
```

Doit retourner `status: "ok"`

## Configuration Firewall Windows

Autoriser le port `8080` en entrée pour que le VPS puisse se connecter :

```powershell
New-NetFirewallRule -DisplayName "PC Bridge" -Direction Inbound -LocalPort 8080 -Protocol TCP -Action Allow
```

## Configuration VPS

Sur le VPS, configurer dans `.env` de `live-core` :

```env
PC_BRIDGE_URL=ws://VOTRE_IP_PUBLIQUE:8080
PC_BRIDGE_TOKEN=le_meme_token_que_AUTH_TOKEN
```

## Dépannage

### OBS ne se connecte pas

- Vérifier que OBS est lancé
- Vérifier le mot de passe WebSocket
- Vérifier le port (4455 par défaut)
- Vérifier dans OBS : Outils → WebSocket Server Settings

### TikFinity ne se connecte pas

- Vérifier que TikFinity Desktop est lancé
- Vérifier le port (21213 par défaut)
- Redémarrer TikFinity Desktop

### Le VPS ne peut pas se connecter

- Vérifier le firewall Windows
- Vérifier votre IP publique : `curl ifconfig.me`
- Vérifier que le port 8080 est ouvert sur votre routeur (port forwarding)
- Tester depuis le VPS : `curl http://VOTRE_IP:8080/health`

## Logs

Les logs sont stockés dans :
- `logs/error.log` - Erreurs uniquement
- `logs/combined.log` - Tous les logs

Pour voir les logs en temps réel :

```powershell
Get-Content logs/combined.log -Wait -Tail 50
```

## Auto-démarrage Windows

Créer un fichier `start-bridge.bat` :

```batch
@echo off
cd C:\chemin\vers\Angeline-live\apps\pc-bridge
npm start
```

Ajouter au démarrage Windows :
1. Win+R → `shell:startup`
2. Créer un raccourci vers `start-bridge.bat`

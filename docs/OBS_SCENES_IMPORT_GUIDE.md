# Guide d'Import des Scènes OBS

## 📋 Fichier JSON de Configuration

Le fichier `config/obs_scenes_import.json` contient la configuration complète des 2 scènes OBS pour Angeline Live.

---

## 🎬 Scènes Incluses

### 1. **IDLE** (Attente)
- Background animé en boucle
- Caméra visible
- Toutes les cartes et textes masqués
- État par défaut entre les tirages

### 2. **READING_ACTIVE** (Tirage actif)
- Background animé en boucle
- Caméra visible
- 3 cartes visibles (CARD_1, CARD_2, CARD_3)
- Textes visibles (username, question, réponse)
- Effets sonores et visuels prêts

---

## 📁 Structure des Assets Requise

Avant d'importer, créez cette structure de dossiers sur votre PC Windows:

```
C:/OBS_Assets/
├── backgrounds/
│   └── mystic_loop.mp4          (Vidéo de fond mystique en boucle)
├── oracle/
│   └── cards/
│       └── back.png             (Dos de carte par défaut)
├── effects/
│   └── smoke_alpha.webm         (Effet fumée avec canal alpha)
└── audio/
    ├── shuffle.mp3              (Son de mélange)
    ├── card_flip.mp3            (Son de retournement)
    └── magic_poof.mp3           (Son d'apparition magique)
```

---

## 🚀 Méthode d'Import

### Option 1: Import Manuel (Recommandé)

**OBS Studio ne supporte pas l'import direct de JSON personnalisé.** Vous devez créer les scènes manuellement en suivant le fichier JSON comme référence.

#### Étapes:

1. **Ouvrir OBS Studio**

2. **Créer la Collection de Scènes**
   - Cliquez sur **Scene Collection** → **New**
   - Nom: `Angeline Live - Oracle`

3. **Configurer le Canvas**
   - **Settings** → **Video**
   - Base Canvas Resolution: `1080x1920` (format vertical 9:16)
   - Output Resolution: `1080x1920`
   - FPS: `30`

4. **Créer la Scène IDLE**
   - Cliquez sur **+** dans le panneau Scenes
   - Nom: `IDLE`
   - Ajoutez les sources dans cet ordre (du bas vers le haut):

   **a. BG_LOOP** (Background)
   - Type: **Media Source**
   - Local File: `C:/OBS_Assets/backgrounds/mystic_loop.mp4`
   - ✅ Loop
   - ✅ Restart playback when source becomes active: OFF
   - Position: 0, 0
   - Taille: 1080x1920

   **b. CAM** (Caméra)
   - Type: **Video Capture Device**
   - Device: Sélectionnez votre webcam
   - Resolution: 1920x1080
   - Position: 0, 400
   - Scale: 0.5625 (pour obtenir 1080x1080)

   **c. CARD_1, CARD_2, CARD_3** (Cartes)
   - Type: **Image**
   - File: `C:/OBS_Assets/oracle/cards/back.png`
   - Positions:
     - CARD_1: x=100, y=800, taille=250x400
     - CARD_2: x=415, y=750, taille=250x400
     - CARD_3: x=730, y=800, taille=250x400
   - **Masquer ces 3 sources** (cliquer sur l'œil)

   **d. TXT_USERNAME** (Nom utilisateur)
   - Type: **Text (GDI+)**
   - Font: Arial Bold, 48pt
   - Color: Blanc (#FFFFFF)
   - Outline: Oui, 4px, Noir (#000000)
   - Alignment: Center
   - Position: x=90, y=100, taille=900x80
   - **Masquer cette source**

   **e. TXT_QUESTION** (Question)
   - Type: **Text (GDI+)**
   - Font: Arial Regular, 36pt
   - Color: Blanc (#FFFFFF)
   - Outline: Oui, 3px, Noir (#000000)
   - Alignment: Center
   - ✅ Use text extents: 1000x150
   - ✅ Word wrap
   - Position: x=40, y=200
   - **Masquer cette source**

   **f. TXT_RESPONSE** (Réponse)
   - Type: **Text (GDI+)**
   - Font: Arial Regular, 32pt
   - Color: Or (#FFD700)
   - Outline: Oui, 3px, Noir (#000000)
   - Alignment: Center
   - ✅ Use text extents: 1000x500
   - ✅ Word wrap
   - Position: x=40, y=1300
   - **Masquer cette source**

   **g. FX_SMOKE** (Effet fumée)
   - Type: **Media Source**
   - Local File: `C:/OBS_Assets/effects/smoke_alpha.webm`
   - ❌ Loop: OFF
   - ✅ Restart playback when source becomes active
   - Position: 0, 0
   - Taille: 1080x1920
   - **Masquer cette source**

   **h. SFX_SHUFFLE, SFX_FLIP, SFX_POOF** (Sons)
   - Type: **Media Source**
   - Local Files:
     - SFX_SHUFFLE: `C:/OBS_Assets/audio/shuffle.mp3`
     - SFX_FLIP: `C:/OBS_Assets/audio/card_flip.mp3`
     - SFX_POOF: `C:/OBS_Assets/audio/magic_poof.mp3`
   - ❌ Loop: OFF
   - ✅ Restart playback when source becomes active
   - **Masquer ces sources**

5. **Créer la Scène READING_ACTIVE**
   - Cliquez sur **+** dans le panneau Scenes
   - Nom: `READING_ACTIVE`
   - **Dupliquer toutes les sources de IDLE**
   - **Afficher** (activer l'œil) pour:
     - CARD_1, CARD_2, CARD_3
     - TXT_USERNAME, TXT_QUESTION, TXT_RESPONSE
   - Laisser masqué: FX_SMOKE, SFX_*

6. **Activer WebSocket**
   - **Tools** → **WebSocket Server Settings**
   - ✅ Enable WebSocket server
   - Server Port: `4455`
   - ✅ Enable Authentication
   - Server Password: Créez un mot de passe fort
   - Cliquez sur **Show Connect Info** et notez les informations

---

## ⚙️ Configuration PC Bridge

Une fois les scènes créées, configurez le PC Bridge:

```env
# apps/pc-bridge/.env
OBS_WS_URL=ws://127.0.0.1:4455
OBS_WS_PASSWORD=votre_mot_de_passe_obs
```

---

## 🎨 Personnalisation

### Modifier les Positions

Référez-vous au fichier `config/obs_scenes_import.json` pour les positions exactes de chaque élément.

### Modifier les Polices

Les polices peuvent être changées dans les paramètres de chaque source texte:
- **TXT_USERNAME**: Arial Bold 48pt (blanc)
- **TXT_QUESTION**: Arial Regular 36pt (blanc)
- **TXT_RESPONSE**: Arial Regular 32pt (or #FFD700)

### Ajouter des Filtres

Vous pouvez ajouter des filtres à la caméra:
- Chroma Key (fond vert)
- Color Correction
- Sharpness

---

## ✅ Vérification

Une fois l'import terminé, vérifiez:

- [ ] Canvas en 1080x1920 (9:16)
- [ ] 2 scènes créées (IDLE, READING_ACTIVE)
- [ ] Tous les assets chargés correctement
- [ ] WebSocket activé sur port 4455
- [ ] Mot de passe WebSocket configuré
- [ ] PC Bridge peut se connecter à OBS

---

## 🔧 Dépannage

### Les vidéos ne se chargent pas
- Vérifiez que les chemins dans `C:/OBS_Assets/` sont corrects
- Utilisez des formats compatibles: MP4 (H.264), WebM

### La caméra n'apparaît pas
- Vérifiez que votre webcam est détectée
- Fermez les autres applications utilisant la caméra

### WebSocket ne se connecte pas
- Vérifiez que le port 4455 n'est pas bloqué par le firewall
- Vérifiez le mot de passe dans `.env`

### Les textes ne s'affichent pas
- Vérifiez que la police Arial est installée
- Activez "Use text extents" pour le word wrap

---

## 📝 Notes Importantes

- **Format vertical 9:16** optimisé pour TikTok Live
- **Résolution 1080x1920** pour une qualité HD
- **30 FPS** pour un streaming fluide
- Les sources audio (SFX_*) sont masquées mais jouent quand activées
- L'effet FX_SMOKE se joue une seule fois quand activé

---

## 🎯 Prochaines Étapes

Après avoir configuré OBS:

1. Testez la connexion PC Bridge → OBS
2. Vérifiez que les commandes WebSocket fonctionnent
3. Testez le workflow complet avec le mode simulation
4. Ajustez les positions si nécessaire

Consultez `docs/SETUP_PC_BRIDGE.md` pour la suite de la configuration.

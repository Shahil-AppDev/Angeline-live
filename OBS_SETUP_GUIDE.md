# 🎬 GUIDE SETUP OBS - STYLE LIVE TIKTOK VOYANCE

## 🎯 OBJECTIF

Créer un live TikTok professionnel de voyance/oracle avec :
- Background mystique animé
- 3 cartes affichées en grand
- Textes lisibles (username, question, réponse)
- Effets visuels (fumée, particules)
- Ambiance sombre et mystique

---

## 📐 FORMAT TIKTOK LIVE

**Résolution :** 1080x1920 (9:16 vertical)
**FPS :** 30 ou 60
**Bitrate :** 3000-6000 kbps

---

## 🎨 LAYOUT RECOMMANDÉ

```
┌─────────────────────┐
│   LOGO/TITRE        │  ← Haut (100px)
│   "Angeline NJ"     │
├─────────────────────┤
│                     │
│   [BACKGROUND]      │  ← Background animé
│   Mystique Loop     │
│                     │
│  ┌───┐ ┌───┐ ┌───┐ │  ← 3 Cartes (centre)
│  │ 1 │ │ 2 │ │ 3 │ │     400x700px chaque
│  └───┘ └───┘ └───┘ │
│                     │
│   @username         │  ← Username (petit)
│   "Question..."     │  ← Question (moyen)
│                     │
│   Réponse oracle    │  ← Réponse (grand)
│   texte ici...      │
│                     │
└─────────────────────┘
```

---

## 🔧 CONFIGURATION OBS DÉTAILLÉE

### 1. Créer la scène LIVE_BASE

**Résolution canvas :** 1080x1920 (9:16)

### 2. Sources à ajouter (dans l'ordre)

#### A. BACKGROUND (Fond)
```
Type: Média
Fichier: assets/visuals/backgrounds/BG_LOOP.mp4
Position: 0, 0
Taille: 1080x1920 (plein écran)
Options:
  ✅ Boucle
  ✅ Redémarrer la lecture quand la source devient active
  ❌ Son (muet)
Filtres:
  - Luminosité: -20 (assombrir légèrement)
  - Saturation: +10 (couleurs plus vives)
```

#### B. OVERLAY_GRADIENT (Assombrissement haut/bas)
```
Type: Image
Fichier: Créer un gradient noir transparent
Position: 0, 0
Taille: 1080x1920
Opacité: 30%
```

#### C. LOGO_TITRE (En haut)
```
Type: Texte (GDI+)
Texte: "✨ ANGELINE NJ ✨"
Police: Cinzel Decorative / Playfair Display
Taille: 72px
Couleur: #FFD700 (or)
Position: Centré, Y: 50
Effets:
  - Ombre portée: Noir, 5px
  - Contour: Noir, 2px
```

#### D. CARD1 (Carte gauche)
```
Type: Image
Fichier: [Dynamique via WebSocket]
Position: X: 100, Y: 500
Taille: 280x497px (ratio 500x888 réduit)
Transformation:
  - Rotation: -5° (légère inclinaison)
Filtres:
  - Ombre portée: Noir, 10px, flou 15px
  - Lueur: Violet/Rose, 5px
Animation: Apparition avec scale + fade
```

#### E. CARD2 (Carte centre)
```
Type: Image
Fichier: [Dynamique via WebSocket]
Position: X: 400, Y: 450
Taille: 280x497px
Transformation:
  - Rotation: 0° (droite)
  - Scale: 1.1 (légèrement plus grande)
Filtres:
  - Ombre portée: Noir, 15px, flou 20px
  - Lueur: Or, 8px
Animation: Apparition avec scale + fade
```

#### F. CARD3 (Carte droite)
```
Type: Image
Fichier: [Dynamique via WebSocket]
Position: X: 700, Y: 500
Taille: 280x497px
Transformation:
  - Rotation: +5° (légère inclinaison)
Filtres:
  - Ombre portée: Noir, 10px, flou 15px
  - Lueur: Violet/Rose, 5px
Animation: Apparition avec scale + fade
```

#### G. FX_SMOKE (Effet fumée)
```
Type: Média
Fichier: assets/visuals/effects/FX_SMOKE.mp4
Position: X: 400, Y: 400 (centré sur cartes)
Taille: 800x800
Blend Mode: Screen (écran)
Opacité: 70%
Options:
  ❌ Boucle (joue une fois)
  ✅ Masquer quand terminé
```

#### H. USERNAME_TEXT (Nom utilisateur)
```
Type: Texte (GDI+)
Texte: "@username"
Police: Poppins / Inter
Taille: 36px
Couleur: #FFFFFF
Position: X: 540 (centré), Y: 1100
Alignement: Centré
Effets:
  - Ombre portée: Noir, 3px
```

#### I. QUESTION_TEXT (Question)
```
Type: Texte (GDI+)
Texte: "Question de l'utilisateur..."
Police: Poppins / Inter
Taille: 42px
Couleur: #FFD700 (or)
Position: X: 540 (centré), Y: 1150
Largeur max: 1000px
Alignement: Centré
Word Wrap: Activé
Effets:
  - Ombre portée: Noir, 4px
  - Contour: Noir, 1px
```

#### J. ANSWER_TEXT (Réponse oracle)
```
Type: Texte (GDI+)
Texte: "Réponse de l'oracle..."
Police: Playfair Display / Crimson Text
Taille: 48px
Couleur: #FFFFFF
Position: X: 540 (centré), Y: 1300
Largeur max: 1000px
Alignement: Centré
Word Wrap: Activé
Line Spacing: 1.3
Effets:
  - Ombre portée: Noir, 5px
  - Lueur: Violet/Rose, 3px
Animation: Fade in + typewriter (optionnel)
```

#### K. SFX_SHUFFLE (Son mélange)
```
Type: Audio
Fichier: assets/audio/shuffle/shuffle.wav
Volume: 80%
Monitoring: Monitor Off
```

#### L. SFX_FLIP (Son retournement)
```
Type: Audio
Fichier: assets/audio/flip/flip.wav
Volume: 80%
Monitoring: Monitor Off
```

---

## 🎨 PALETTE DE COULEURS

### Couleurs principales
- **Or mystique** : #FFD700
- **Violet profond** : #8B00FF
- **Rose mystique** : #FF1493
- **Blanc pur** : #FFFFFF
- **Noir profond** : #0A0A0A

### Dégradés
- **Titre** : Or (#FFD700) → Or clair (#FFED4E)
- **Réponse** : Blanc (#FFFFFF) avec lueur violette
- **Background** : Violet/Rose/Or (déjà dans BG_LOOP.mp4)

---

## ✨ ANIMATIONS RECOMMANDÉES

### Apparition des cartes (3 secondes)
```
0.0s: Cartes face cachée (dos visible)
0.5s: Effet fumée commence
1.0s: Carte 1 se retourne (rotation Y 180°)
1.5s: Carte 2 se retourne
2.0s: Carte 3 se retourne
2.5s: Fumée disparaît
3.0s: Cartes visibles, textes apparaissent
```

### Affichage textes (fade in)
```
3.0s: Username fade in (0.3s)
3.3s: Question fade in (0.5s)
3.8s: Réponse fade in ligne par ligne (0.8s)
```

### Disparition (reset)
```
13.0s: Tout fade out (1s)
14.0s: Reset complet, prêt pour suivant
```

---

## 🎬 FILTRES OBS AVANCÉS

### Pour les cartes
1. **Ombre portée**
   - Offset X: 0, Y: 10
   - Blur: 15
   - Opacity: 80%
   - Color: Noir

2. **Lueur (Glow)**
   - Blur: 5-8
   - Color: Violet/Rose/Or (selon carte)
   - Opacity: 50%

3. **Color Correction**
   - Saturation: +10%
   - Contrast: +5%

### Pour le background
1. **Luminosité/Contraste**
   - Brightness: -20
   - Contrast: +10

2. **Color Correction**
   - Saturation: +15%
   - Hue Shift: Légèrement vers violet

---

## 📱 OPTIMISATION TIKTOK

### Paramètres de streaming
```
Résolution: 1080x1920 (9:16)
FPS: 30 (ou 60 si PC puissant)
Bitrate: 4000-6000 kbps
Encoder: x264 ou NVENC (GPU)
Preset: veryfast ou fast
Keyframe: 2 secondes
```

### Paramètres audio
```
Bitrate: 160 kbps
Sample Rate: 48 kHz
Channels: Stereo
```

---

## 🎯 ZONES IMPORTANTES

### Zone de sécurité (Safe Area)
```
Haut: 100px (éviter le logo TikTok)
Bas: 200px (éviter les boutons)
Gauche/Droite: 50px (marges)
```

### Zone de focus
```
Centre: 540x960 (cartes + textes principaux)
```

---

## 🔊 AUDIO

### Musique de fond (optionnel)
- Volume: 20-30% (ne pas couvrir la voix)
- Style: Ambient mystique, lo-fi mystique
- Pas de paroles

### Effets sonores
- **Shuffle** : Mélange de cartes (1-2s)
- **Flip** : Retournement carte (0.5s)
- **Ambiance** : Sons mystiques subtils

---

## 💡 CONSEILS VISUELS

### Lisibilité
- ✅ Textes avec ombre portée (toujours)
- ✅ Contrastes élevés (blanc sur sombre, or sur sombre)
- ✅ Taille de police >= 36px
- ✅ Largeur max texte: 1000px (marges)

### Esthétique
- ✅ Cartes légèrement inclinées (dynamisme)
- ✅ Carte centrale plus grande (focus)
- ✅ Effets de lueur subtils (mystique)
- ✅ Animations fluides (pas saccadées)

### Performance
- ✅ Vidéos en 1080p max (pas 4K)
- ✅ Effets avec modération (pas trop de filtres)
- ✅ Monitoring CPU/GPU dans OBS

---

## 🎨 POLICES RECOMMANDÉES

### Titres/Logo
- **Cinzel Decorative** (élégant, mystique)
- **Playfair Display** (classique, élégant)
- **Cormorant Garamond** (raffiné)

### Textes principaux
- **Poppins** (moderne, lisible)
- **Inter** (clean, professionnel)
- **Montserrat** (équilibré)

### Réponses oracle
- **Crimson Text** (littéraire, mystique)
- **Playfair Display** (élégant)
- **Lora** (lisible, raffiné)

**Télécharger sur :** https://fonts.google.com/

---

## 🚀 CHECKLIST SETUP

- [ ] Résolution canvas 1080x1920 (9:16)
- [ ] Background BG_LOOP.mp4 ajouté
- [ ] 3 sources cartes (CARD1, CARD2, CARD3)
- [ ] Effet fumée FX_SMOKE.mp4
- [ ] Textes (USERNAME, QUESTION, ANSWER)
- [ ] Sons (shuffle, flip)
- [ ] Filtres ombre portée sur cartes
- [ ] Filtres lueur sur cartes
- [ ] Polices installées
- [ ] Couleurs configurées (or, violet, blanc)
- [ ] Animations testées
- [ ] WebSocket OBS activé (port 4455)
- [ ] Test avec live-core

---

## 🎬 EXEMPLE DE SCÈNE COMPLÈTE

```
LIVE_BASE (Scène)
├── BG_LOOP (Média, plein écran)
├── OVERLAY_GRADIENT (Image, opacité 30%)
├── LOGO_TITRE (Texte, haut centré)
├── CARD1 (Image, gauche, rotation -5°)
├── CARD2 (Image, centre, scale 1.1)
├── CARD3 (Image, droite, rotation +5°)
├── FX_SMOKE (Média, blend screen)
├── USERNAME_TEXT (Texte, petit, centré)
├── QUESTION_TEXT (Texte, moyen, or, centré)
├── ANSWER_TEXT (Texte, grand, blanc, centré)
├── SFX_SHUFFLE (Audio)
└── SFX_FLIP (Audio)
```

---

## 📊 POSITIONS EXACTES (1080x1920)

```
LOGO_TITRE:     X: 540, Y: 50    (centré haut)
CARD1:          X: 150, Y: 500   (gauche)
CARD2:          X: 400, Y: 450   (centre, légèrement plus haut)
CARD3:          X: 650, Y: 500   (droite)
USERNAME_TEXT:  X: 540, Y: 1100  (centré)
QUESTION_TEXT:  X: 540, Y: 1150  (centré)
ANSWER_TEXT:    X: 540, Y: 1300  (centré)
```

---

**Avec cette configuration, votre live ressemblera à un live de voyance TikTok professionnel !** 🔮✨

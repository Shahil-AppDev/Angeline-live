# 📥 GUIDE D'IMPORTATION SCÈNE OBS

## 🎯 FICHIER CRÉÉ

**Fichier :** `OBS_SCENE_LIVE_BASE.json`
**Scène :** LIVE_BASE (préconfigurée pour TikTok 9:16)

---

## 📋 PRÉREQUIS

### 1. Installer les polices
Télécharger et installer depuis Google Fonts :
- **Cinzel Decorative** : https://fonts.google.com/specimen/Cinzel+Decorative
- **Poppins** : https://fonts.google.com/specimen/Poppins
- **Playfair Display** : https://fonts.google.com/specimen/Playfair+Display

### 2. Extraire le projet
Extraire l'archive `Angeline-live-COMPLET.zip` dans :
```
C:\Users\Utilisateur\Documents\Angeline-live\
```

### 3. Vérifier la structure
```
C:\Users\Utilisateur\Documents\Angeline-live\
├── assets\
│   ├── visuals\
│   │   ├── backgrounds\
│   │   │   └── BG_LOOP.mp4
│   │   ├── effects\
│   │   │   └── FX_SMOKE.mp4
│   │   └── overlays\
│   │       └── gradient.png (à créer)
│   ├── oracles_assets\
│   │   └── ORACLE_MYSTICA\
│   │       ├── backs\
│   │       │   └── back.jpeg
│   │       └── CORE\
│   └── audio\
│       ├── shuffle\
│       │   └── shuffle.wav
│       └── flip\
│           └── flip.wav
└── OBS_SCENE_LIVE_BASE.json
```

---

## 🖼️ CRÉER L'OVERLAY GRADIENT (OPTIONNEL)

### Option 1 : Avec un éditeur d'image (GIMP, Photoshop)
1. Créer une image **1080x1920px**
2. Créer un dégradé vertical :
   - Haut : Noir (#000000) → Transparent (200px)
   - Milieu : Transparent
   - Bas : Noir (#000000) → Transparent (300px)
3. Sauvegarder en PNG : `assets/visuals/overlays/gradient.png`

### Option 2 : Sans overlay
Supprimer la source `OVERLAY_GRADIENT` du JSON avant import

---

## 📥 MÉTHODE 1 : IMPORTATION MANUELLE (RECOMMANDÉE)

### Étape 1 : Configurer OBS
1. **Ouvrir OBS Studio**
2. **Paramètres → Vidéo**
   - Résolution de base : **1080x1920**
   - Résolution de sortie : **1080x1920**
   - FPS : **30** ou **60**
3. **Cliquer OK**

### Étape 2 : Créer la scène
1. **Scènes** → Clic droit → **Ajouter**
2. Nom : **LIVE_BASE**
3. **Cliquer OK**

### Étape 3 : Ajouter les sources (dans l'ordre)

#### A. Background (BG_LOOP)
1. **Sources** → **+** → **Source Média**
2. Nom : **BG_LOOP**
3. Fichier : `C:\Users\Utilisateur\Documents\Angeline-live\assets\visuals\backgrounds\BG_LOOP.mp4`
4. ✅ **Boucle**
5. ✅ **Redémarrer la lecture quand la source devient active**
6. ❌ **Contrôler la lecture avec le temps**
7. Redimensionner : **1080x1920** (plein écran)
8. **Filtres** → **+** → **Correction des couleurs**
   - Luminosité : **-0.20**
   - Contraste : **0.10**
   - Saturation : **0.10**

#### B. Overlay Gradient (optionnel)
1. **Sources** → **+** → **Image**
2. Nom : **OVERLAY_GRADIENT**
3. Fichier : `C:\Users\Utilisateur\Documents\Angeline-live\assets\visuals\overlays\gradient.png`
4. Redimensionner : **1080x1920**
5. Opacité : **30%** (mixer audio/vidéo)

#### C. Logo/Titre
1. **Sources** → **+** → **Texte (GDI+)**
2. Nom : **LOGO_TITRE**
3. Texte : **✨ ANGELINE NJ ✨**
4. Police : **Cinzel Decorative**, **72**, **Gras**
5. Couleur : **#FFD700** (or)
6. ✅ **Contour** : Noir, **2px**
7. ✅ **Ombre portée** : Noir, **5px**
8. Position : **X: 540, Y: 50** (centré)

#### D. Carte 1 (Gauche)
1. **Sources** → **+** → **Image**
2. Nom : **CARD1**
3. Fichier : `C:\Users\Utilisateur\Documents\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\backs\back.jpeg`
4. Position : **X: 150, Y: 500**
5. Échelle : **56%** (280x497px)
6. Rotation : **-5°**
7. **Filtres** → **+** → **Ombre portée**
   - Offset Y : **10**
   - Rayon de flou : **15**
   - Opacité : **80%**

#### E. Carte 2 (Centre)
1. **Sources** → **+** → **Image**
2. Nom : **CARD2**
3. Fichier : `C:\Users\Utilisateur\Documents\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\backs\back.jpeg`
4. Position : **X: 400, Y: 450**
5. Échelle : **61.6%** (308x547px)
6. Rotation : **0°**
7. **Filtres** → **+** → **Ombre portée**
   - Offset Y : **15**
   - Rayon de flou : **20**
   - Opacité : **90%**

#### F. Carte 3 (Droite)
1. **Sources** → **+** → **Image**
2. Nom : **CARD3**
3. Fichier : `C:\Users\Utilisateur\Documents\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\backs\back.jpeg`
4. Position : **X: 650, Y: 500**
5. Échelle : **56%** (280x497px)
6. Rotation : **+5°**
7. **Filtres** → **+** → **Ombre portée**
   - Offset Y : **10**
   - Rayon de flou : **15**
   - Opacité : **80%**

#### G. Effet Fumée
1. **Sources** → **+** → **Source Média**
2. Nom : **FX_SMOKE**
3. Fichier : `C:\Users\Utilisateur\Documents\Angeline-live\assets\visuals\effects\FX_SMOKE.mp4`
4. ❌ **Boucle**
5. ✅ **Masquer la source quand la lecture est terminée**
6. Position : **X: 140, Y: 200**
7. Taille : **800x800**
8. Mode de fusion : **Écran** (Screen)
9. Opacité : **70%**
10. **Masquer** par défaut (œil fermé)

#### H. Username
1. **Sources** → **+** → **Texte (GDI+)**
2. Nom : **USERNAME_TEXT**
3. Texte : **@username**
4. Police : **Poppins**, **36**, **Regular**
5. Couleur : **#FFFFFF** (blanc)
6. ✅ **Ombre portée** : Noir, **3px**
7. Position : **X: 540, Y: 1100** (centré)

#### I. Question
1. **Sources** → **+** → **Texte (GDI+)**
2. Nom : **QUESTION_TEXT**
3. Texte : **Question de l'utilisateur...**
4. Police : **Poppins**, **42**, **SemiBold**
5. Couleur : **#FFD700** (or)
6. ✅ **Contour** : Noir, **1px**
7. ✅ **Ombre portée** : Noir, **4px**
8. ✅ **Utiliser les limites personnalisées**
   - Largeur : **1000px**
   - ✅ **Retour à la ligne**
9. Position : **X: 540, Y: 1150** (centré)

#### J. Réponse
1. **Sources** → **+** → **Texte (GDI+)**
2. Nom : **ANSWER_TEXT**
3. Texte : **Réponse de l'oracle...**
4. Police : **Playfair Display**, **48**, **Regular**
5. Couleur : **#FFFFFF** (blanc)
6. ✅ **Ombre portée** : Noir, **5px**
7. ✅ **Utiliser les limites personnalisées**
   - Largeur : **1000px**
   - ✅ **Retour à la ligne**
8. Position : **X: 540, Y: 1300** (centré)

#### K. Son Shuffle
1. **Sources** → **+** → **Source Média**
2. Nom : **SFX_SHUFFLE**
3. Fichier : `C:\Users\Utilisateur\Documents\Angeline-live\assets\audio\shuffle\shuffle.wav`
4. ❌ **Boucle**
5. Volume : **80%**
6. Surveillance audio : **Désactivée**

#### L. Son Flip
1. **Sources** → **+** → **Source Média**
2. Nom : **SFX_FLIP**
3. Fichier : `C:\Users\Utilisateur\Documents\Angeline-live\assets\audio\flip\flip.wav`
4. ❌ **Boucle**
5. Volume : **80%**
6. Surveillance audio : **Désactivée**

---

## 📥 MÉTHODE 2 : IMPORTATION VIA SCENE COLLECTION (EXPÉRIMENTAL)

**Note :** OBS ne supporte pas nativement l'import JSON de scènes. Cette méthode nécessite un plugin.

### Option A : Plugin Scene Collection Manager
1. Installer le plugin **Scene Collection Manager**
2. Importer le fichier JSON
3. Ajuster les chemins si nécessaire

### Option B : Importation manuelle (recommandée)
Suivre la **Méthode 1** ci-dessus (plus fiable)

---

## ⚙️ CONFIGURATION WEBSOCKET

Après avoir créé la scène :

1. **Outils** → **Paramètres WebSocket**
2. ✅ **Activer le serveur WebSocket**
3. Port : **4455**
4. Mot de passe : **(noter le mot de passe)**
5. **Cliquer OK**

6. **Mettre à jour le `.env` :**
```env
OBS_WS_URL=ws://localhost:4455
OBS_WS_PASSWORD=votre_mot_de_passe
```

---

## 🎨 AJUSTEMENTS VISUELS

### Alignement des cartes
Si les cartes ne sont pas bien alignées :
1. Sélectionner les 3 cartes (Ctrl+clic)
2. Clic droit → **Transformer** → **Centrer horizontalement**
3. Ajuster manuellement si nécessaire

### Taille des textes
Si les textes sont trop grands/petits :
1. Double-clic sur la source texte
2. Ajuster la taille de police
3. **OK**

### Couleurs
Pour changer les couleurs :
- **Or** : #FFD700
- **Violet** : #8B00FF
- **Rose** : #FF1493
- **Blanc** : #FFFFFF

---

## ✅ CHECKLIST POST-IMPORTATION

- [ ] Scène LIVE_BASE créée
- [ ] Background BG_LOOP visible et en boucle
- [ ] 3 cartes visibles (dos de carte)
- [ ] Logo/Titre visible en haut
- [ ] Textes (username, question, réponse) visibles
- [ ] Effet fumée masqué par défaut
- [ ] Sons configurés (shuffle, flip)
- [ ] WebSocket OBS activé (port 4455)
- [ ] Résolution 1080x1920 (9:16)
- [ ] Polices installées (Cinzel, Poppins, Playfair)

---

## 🧪 TEST DE LA SCÈNE

### Test manuel
1. **Lancer OBS**
2. **Sélectionner la scène LIVE_BASE**
3. **Vérifier que le background s'affiche**
4. **Vérifier que les cartes sont visibles**
5. **Vérifier que les textes sont lisibles**

### Test avec live-core
1. **Lancer live-core** : `npm run dev:core`
2. **Vérifier la connexion OBS** dans les logs
3. **Envoyer un message test** via web-admin
4. **Vérifier que les cartes changent**
5. **Vérifier que les textes s'affichent**

---

## 🐛 TROUBLESHOOTING

### Les fichiers ne se chargent pas
- Vérifier que les chemins sont corrects
- Vérifier que les fichiers existent dans `C:\Users\Utilisateur\Documents\Angeline-live\`
- Vérifier les permissions de lecture

### Les polices ne s'affichent pas
- Installer les polices depuis Google Fonts
- Redémarrer OBS après installation
- Choisir une police alternative (Arial, Times New Roman)

### Les cartes sont trop grandes/petites
- Ajuster l'échelle manuellement
- Maintenir Shift pour garder le ratio

### Le WebSocket ne se connecte pas
- Vérifier que le serveur WebSocket est activé
- Vérifier le port (4455)
- Vérifier le mot de passe dans `.env`
- Redémarrer OBS

---

## 📊 POSITIONS FINALES (RÉFÉRENCE)

```
Canvas: 1080x1920 (9:16)

LOGO_TITRE:     X: 540, Y: 50    (centré)
CARD1:          X: 150, Y: 500   (gauche, -5°, 280x497px)
CARD2:          X: 400, Y: 450   (centre, 0°, 308x547px)
CARD3:          X: 650, Y: 500   (droite, +5°, 280x497px)
FX_SMOKE:       X: 140, Y: 200   (800x800px, masqué)
USERNAME_TEXT:  X: 540, Y: 1100  (centré)
QUESTION_TEXT:  X: 540, Y: 1150  (centré, 1000px max)
ANSWER_TEXT:    X: 540, Y: 1300  (centré, 1000px max)
```

---

## 🎬 RÉSULTAT ATTENDU

Une scène OBS 9:16 (TikTok) avec :
- ✅ Background mystique animé
- ✅ 3 cartes oracle au centre
- ✅ Logo/Titre en haut
- ✅ Textes lisibles (username, question, réponse)
- ✅ Effets visuels (fumée)
- ✅ Sons (shuffle, flip)
- ✅ Prêt pour connexion WebSocket

**La scène est maintenant prête pour le live TikTok automatisé !** 🎬✨

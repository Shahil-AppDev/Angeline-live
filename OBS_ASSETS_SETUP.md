# 🎬 CONFIGURATION ASSETS OBS - ANGELINE LIVE

## ⚠️ FICHIERS MANQUANTS DÉTECTÉS

Votre configuration OBS référence des fichiers qui n'existent pas encore. Voici comment les créer.

---

## 📁 STRUCTURE ATTENDUE

```
assets/oracles_assets/ORACLE_MYSTICA/CORE/
├── backs/
│   └── (dos de cartes - optionnel)
├── cards/
│   ├── mystica_sentimental_001.png ✅ (déjà présent)
│   ├── mystica_sentimental_002.png ✅
│   └── ... (102 cartes au total) ✅
├── overlays/
│   ├── oracle_loop_01.mp4 ❌ MANQUANT
│   ├── oracle_loop_02.mp4 ❌ MANQUANT
│   ├── oracle_loop_03.mp4 ❌ MANQUANT
│   ├── oracle_loop_04.mp4 ❌ MANQUANT
│   ├── oracle_loop_05.mp4 ❌ MANQUANT
│   ├── oracle_loop_06.mp4 ❌ MANQUANT
│   └── card_1.png ❌ MANQUANT
└── sfx/
    ├── shuffle.mp3 ❌ MANQUANT
    └── flip.mp3 ❌ MANQUANT
```

---

## 🎥 VIDÉOS DE BOUCLES D'ORACLE (oracle_loop_XX.mp4)

### Option 1: Créer des Vidéos Simples (Recommandé pour démarrer)

**Utiliser un fond noir avec texte/animation simple:**

```bash
# Avec FFmpeg (à installer: https://ffmpeg.org/download.html)

# Vidéo noire 10 secondes (placeholder)
ffmpeg -f lavfi -i color=c=black:s=1920x1080:d=10 -c:v libx264 -pix_fmt yuv420p oracle_loop_01.mp4

# Avec texte "Oracle Mystica"
ffmpeg -f lavfi -i color=c=#1a0033:s=1920x1080:d=10 -vf "drawtext=text='Oracle Mystica':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p oracle_loop_01.mp4
```

**Créer les 6 boucles:**
```powershell
# PowerShell - Créer 6 vidéos identiques
cd "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\CORE\overlays"

for ($i=1; $i -le 6; $i++) {
    $num = $i.ToString("00")
    ffmpeg -f lavfi -i color=c=#1a0033:s=1920x1080:d=10 -vf "drawtext=text='Oracle Mystica - Loop $i':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" -c:v libx264 -pix_fmt yuv420p "oracle_loop_$num.mp4"
}
```

### Option 2: Vidéos Professionnelles

**Sources recommandées:**
1. **Pexels Videos** (gratuit): https://www.pexels.com/videos/
   - Rechercher: "mystical", "tarot", "cosmic", "purple background"
   
2. **Pixabay Videos** (gratuit): https://pixabay.com/videos/
   - Rechercher: "spiritual", "meditation", "stars"

3. **Canva** (freemium): https://www.canva.com/
   - Templates "Mystical Background Loop"
   - Export en MP4 1920x1080

**Spécifications techniques:**
- Format: MP4 (H.264)
- Résolution: 1920x1080 (Full HD)
- Durée: 10-30 secondes (boucle parfaite)
- FPS: 30 ou 60
- Pas de son (ou son très bas)

---

## 🖼️ IMAGE CARD_1.PNG

**Utilité:** Image de placeholder pour la première carte avant révélation.

### Créer avec un éditeur d'image:

**Option 1: Dos de carte mystique**
1. Ouvrir Photoshop/GIMP/Canva
2. Créer image 1024x1536 px
3. Fond violet/noir mystique
4. Ajouter symboles: étoiles, lune, motifs
5. Sauvegarder: `card_1.png`

**Option 2: Utiliser une carte existante**
```powershell
# Copier une carte existante comme placeholder
cd "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\CORE"
Copy-Item "mystica_sentimental_001.png" "overlays\card_1.png"
```

**Option 3: Créer avec Python (PIL)**
```python
from PIL import Image, ImageDraw, ImageFont

# Créer image 1024x1536
img = Image.new('RGB', (1024, 1536), color=(26, 0, 51))  # Violet foncé
draw = ImageDraw.Draw(img)

# Ajouter texte centré
font = ImageFont.truetype("arial.ttf", 80)
text = "?"
bbox = draw.textbbox((0, 0), text, font=font)
text_width = bbox[2] - bbox[0]
text_height = bbox[3] - bbox[1]
x = (1024 - text_width) / 2
y = (1536 - text_height) / 2
draw.text((x, y), text, fill=(255, 255, 255), font=font)

img.save('overlays/card_1.png')
```

---

## 🔊 EFFETS SONORES (SFX)

### shuffle.mp3 - Son de mélange de cartes

**Sources gratuites:**
1. **Freesound.org**: https://freesound.org/search/?q=card+shuffle
2. **Zapsplat**: https://www.zapsplat.com/sound-effect-category/cards/
3. **Mixkit**: https://mixkit.co/free-sound-effects/card/

**Ou créer avec synthèse:**
```python
# Générer un son simple avec pydub
from pydub import AudioSegment
from pydub.generators import WhiteNoise

# Bruit blanc court (shuffle)
noise = WhiteNoise().to_audio_segment(duration=500)  # 0.5s
noise = noise - 20  # Réduire volume
noise.export("sfx/shuffle.mp3", format="mp3")
```

### flip.mp3 - Son de retournement de carte

**Caractéristiques:**
- Durée: 0.2-0.5 secondes
- Son sec, claquant
- Rechercher: "card flip", "paper flip", "whoosh"

---

## 🚀 SOLUTION RAPIDE (PLACEHOLDERS)

**Créer tous les fichiers manquants en 2 minutes:**

```powershell
# PowerShell - Exécuter dans le dossier du projet
cd "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\CORE"

# Créer dossiers si nécessaire
New-Item -ItemType Directory -Force -Path "overlays"
New-Item -ItemType Directory -Force -Path "sfx"

# Copier une carte comme placeholder
Copy-Item "mystica_sentimental_001.png" "overlays\card_1.png"

# Créer vidéos noires (nécessite FFmpeg installé)
cd overlays
for ($i=1; $i -le 6; $i++) {
    $num = $i.ToString("00")
    ffmpeg -f lavfi -i color=c=black:s=1920x1080:d=10 -c:v libx264 -pix_fmt yuv420p "oracle_loop_$num.mp4"
}

# Créer sons silencieux (nécessite FFmpeg)
cd ..\sfx
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 0.5 -q:a 9 -acodec libmp3lame shuffle.mp3
ffmpeg -f lavfi -i anullsrc=r=44100:cl=stereo -t 0.3 -q:a 9 -acodec libmp3lame flip.mp3
```

---

## 📦 INSTALLATION FFMPEG (SI NÉCESSAIRE)

### Windows:

1. **Télécharger:** https://www.gyan.dev/ffmpeg/builds/
   - Choisir: `ffmpeg-release-essentials.zip`

2. **Installer:**
   ```powershell
   # Extraire dans C:\ffmpeg
   # Ajouter au PATH:
   $env:Path += ";C:\ffmpeg\bin"
   
   # Vérifier
   ffmpeg -version
   ```

3. **OU via Chocolatey:**
   ```powershell
   choco install ffmpeg
   ```

---

## ✅ VÉRIFICATION FINALE

**Après création des fichiers:**

```powershell
cd "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\CORE"

# Vérifier overlays
Get-ChildItem overlays\*.mp4
Get-ChildItem overlays\*.png

# Vérifier sfx
Get-ChildItem sfx\*.mp3
```

**Attendu:**
```
overlays/
  oracle_loop_01.mp4 ✅
  oracle_loop_02.mp4 ✅
  oracle_loop_03.mp4 ✅
  oracle_loop_04.mp4 ✅
  oracle_loop_05.mp4 ✅
  oracle_loop_06.mp4 ✅
  card_1.png ✅

sfx/
  shuffle.mp3 ✅
  flip.mp3 ✅
```

---

## 🎨 RECOMMANDATIONS VISUELLES

### Thème Mystica Sentimental:
- **Couleurs:** Violet (#1a0033), Rose (#ff69b4), Or (#ffd700)
- **Ambiance:** Mystique, romantique, cosmique
- **Éléments:** Étoiles, lune, cœurs, constellations
- **Style:** Doux, éthéré, lumineux

### Animations de boucle:
- Particules flottantes
- Lueurs pulsantes
- Rotation lente d'éléments
- Effet bokeh
- Transitions douces

---

## 🔧 INTÉGRATION OBS

**Une fois les fichiers créés:**

1. Ouvrir OBS Studio
2. Aller dans: **Fichiers** → **Afficher les fichiers manquants**
3. Cliquer sur **Rechercher dans le dossier**
4. Les fichiers devraient être détectés automatiquement
5. Si non: cliquer sur **Remplacer** et sélectionner manuellement

**OU:**

1. Supprimer les sources avec fichiers manquants
2. Recréer les sources en pointant vers les nouveaux fichiers

---

## 📞 SUPPORT

**Problèmes courants:**

1. **FFmpeg non trouvé:**
   - Installer FFmpeg (voir section ci-dessus)
   - Vérifier PATH

2. **Vidéos ne bouclent pas:**
   - Dans OBS: Clic droit sur source → Propriétés → Cocher "Boucler"

3. **Sons trop forts:**
   - Réduire volume dans OBS: Mixeur audio

4. **Qualité vidéo basse:**
   - Augmenter bitrate: `-b:v 5M` dans commande FFmpeg

---

**🎉 Une fois tous les fichiers créés, OBS ne devrait plus afficher d'erreurs!**

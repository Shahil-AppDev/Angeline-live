# 🎬 GUIDE D'IMPORTATION OBS - ANGELINE LIVE

## 📋 FICHIERS CRÉÉS

- **`OBS_SCENE_COLLECTION.json`** - Collection de scènes complète à importer dans OBS

---

## 🚀 MÉTHODE D'IMPORTATION

### ⚠️ IMPORTANT: OBS ne supporte PAS l'import direct de JSON

OBS Studio n'a pas de fonction "Importer JSON" pour les scènes. Le fichier JSON sert de **référence** pour créer manuellement les sources.

### 2 OPTIONS DISPONIBLES:

---

## 📌 OPTION 1: CRÉATION MANUELLE (RECOMMANDÉ)

### Étape 1: Créer la scène principale

1. Ouvrir OBS Studio
2. Dans **Scènes**, cliquer sur **+**
3. Nom: `LIVE_BASE`
4. Cliquer sur **OK**

### Étape 2: Ajouter le fond vidéo

1. Dans **Sources**, cliquer sur **+**
2. Sélectionner **Source média**
3. Nom: `BG_MAIN`
4. Cliquer sur **OK**
5. **Fichier local:**
   ```
   C:\Users\DarkNode\Desktop\Projet Web\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\CORE\overlays\bg_mystica_main.mp4
   ```
6. ✅ Cocher **Boucler**
7. ❌ Décocher **Redémarrer la lecture lorsque la source devient active**
8. Cliquer sur **OK**
9. Redimensionner pour remplir l'écran (1080x1920)

### Étape 3: Ajouter la caméra

1. Dans **Sources**, cliquer sur **+**
2. Sélectionner **Périphérique de capture vidéo**
3. Nom: `CAM`
4. Cliquer sur **OK**
5. **Périphérique:** Sélectionner votre webcam
6. **Résolution/FPS:** 1920x1080 ou auto
7. Cliquer sur **OK**
8. Positionner: X=0, Y=400, Taille=1080x1080

### Étape 4: Ajouter les 3 cartes

**CARTE 1 (Gauche):**
1. **+** → **Image**
2. Nom: `CARD_1`
3. Fichier:
   ```
   C:\Users\DarkNode\Desktop\Projet Web\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\CORE\overlays\card_1.png
   ```
4. Position: X=100, Y=800
5. Taille: 250x400
6. **Masquer** (clic droit → Masquer)

**CARTE 2 (Centre):**
1. **+** → **Image**
2. Nom: `CARD_2`
3. Même fichier que CARD_1
4. Position: X=415, Y=750
5. Taille: 250x400
6. **Masquer**

**CARTE 3 (Droite):**
1. **+** → **Image**
2. Nom: `CARD_3`
3. Même fichier que CARD_1
4. Position: X=730, Y=800
5. Taille: 250x400
6. **Masquer**

### Étape 5: Ajouter les textes

**USERNAME_TEXT:**
1. **+** → **Texte (GDI+)**
2. Nom: `USERNAME_TEXT`
3. Texte: `@username`
4. Police: Arial, 48pt, Gras
5. Couleur: Blanc (#FFFFFF)
6. ✅ Cocher **Contour**
7. Taille contour: 4
8. Couleur contour: Noir (#000000)
9. Alignement: Centre
10. Position: X=90, Y=100
11. Taille: 900x80
12. **Masquer**

**QUESTION_TEXT:**
1. **+** → **Texte (GDI+)**
2. Nom: `QUESTION_TEXT`
3. Texte: `Question...`
4. Police: Arial, 36pt, Normal
5. Couleur: Blanc (#FFFFFF)
6. ✅ Cocher **Contour** (taille 3, noir)
7. ✅ Cocher **Retour à la ligne automatique**
8. Alignement: Centre
9. Position: X=40, Y=200
10. Taille: 1000x150
11. **Masquer**

**ANSWER_TEXT:**
1. **+** → **Texte (GDI+)**
2. Nom: `ANSWER_TEXT`
3. Texte: `Réponse...`
4. Police: Arial, 32pt, Normal
5. Couleur: Or (#FFD700)
6. ✅ Cocher **Contour** (taille 3, noir)
7. ✅ Cocher **Retour à la ligne automatique**
8. Alignement: Centre
9. Position: X=40, Y=1300
10. Taille: 1000x500
11. **Masquer**

### Étape 6: Ajouter les sons

**SFX_SHUFFLE:**
1. **+** → **Source média**
2. Nom: `SFX_SHUFFLE`
3. Fichier:
   ```
   C:\Users\DarkNode\Desktop\Projet Web\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\CORE\sfx\shuffle.mp3
   ```
4. ✅ Cocher **Redémarrer la lecture lorsque la source devient active**
5. ❌ Décocher **Boucler**
6. Cliquer sur **OK**

**SFX_FLIP:**
1. **+** → **Source média**
2. Nom: `SFX_FLIP`
3. Fichier:
   ```
   C:\Users\DarkNode\Desktop\Projet Web\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\CORE\sfx\flip.mp3
   ```
4. ✅ Cocher **Redémarrer la lecture lorsque la source devient active**
5. ❌ Décocher **Boucler**
6. Cliquer sur **OK**

### Étape 7: Ordre des sources (Z-Index)

**Ordre du bas vers le haut (glisser-déposer):**
1. SFX_FLIP (tout en bas)
2. SFX_SHUFFLE
3. BG_MAIN
4. CAM
5. CARD_1
6. CARD_2
7. CARD_3
8. USERNAME_TEXT
9. QUESTION_TEXT
10. ANSWER_TEXT (tout en haut)

---

## 📌 OPTION 2: SCRIPT AUTOMATIQUE (AVANCÉ)

### Utiliser obs-websocket pour créer les sources automatiquement

**Prérequis:**
- obs-websocket v5 installé et configuré
- Node.js installé

**Script de création automatique:**

```javascript
// create_obs_sources.js
const OBSWebSocket = require('obs-websocket-js');
const obs = new OBSWebSocket();

async function createSources() {
  await obs.connect('ws://192.168.1.37:4455', 'J1GZVy2u2hj2Yv6V');
  
  const basePath = 'C:\\Users\\DarkNode\\Desktop\\Projet Web\\Angeline-live\\assets\\oracles_assets\\ORACLE_MYSTICA\\CORE';
  
  // Créer scène
  await obs.call('CreateScene', { sceneName: 'LIVE_BASE' });
  
  // Ajouter BG_MAIN
  await obs.call('CreateInput', {
    sceneName: 'LIVE_BASE',
    inputName: 'BG_MAIN',
    inputKind: 'ffmpeg_source',
    inputSettings: {
      local_file: `${basePath}\\overlays\\bg_mystica_main.mp4`,
      looping: true
    }
  });
  
  // Ajouter CAM
  await obs.call('CreateInput', {
    sceneName: 'LIVE_BASE',
    inputName: 'CAM',
    inputKind: 'dshow_input',
    inputSettings: {}
  });
  
  // Ajouter CARD_1
  await obs.call('CreateInput', {
    sceneName: 'LIVE_BASE',
    inputName: 'CARD_1',
    inputKind: 'image_source',
    inputSettings: {
      file: `${basePath}\\overlays\\card_1.png`
    }
  });
  
  // ... répéter pour les autres sources
  
  console.log('✅ Sources créées avec succès!');
  await obs.disconnect();
}

createSources().catch(console.error);
```

**Exécution:**
```bash
npm install obs-websocket-js
node create_obs_sources.js
```

---

## ✅ VÉRIFICATION FINALE

### Checklist après création:

- [ ] Scène `LIVE_BASE` créée
- [ ] Source `BG_MAIN` visible et en boucle
- [ ] Source `CAM` visible et fonctionnelle
- [ ] 3 sources `CARD_1`, `CARD_2`, `CARD_3` masquées
- [ ] 3 textes `USERNAME_TEXT`, `QUESTION_TEXT`, `ANSWER_TEXT` masqués
- [ ] 2 sons `SFX_SHUFFLE`, `SFX_FLIP` configurés
- [ ] Ordre des sources correct (BG en bas, textes en haut)
- [ ] Résolution de la scène: 1080x1920 (9:16 vertical)

### Test de visibilité:

1. Afficher `CARD_1` → Doit apparaître en bas à gauche
2. Afficher `USERNAME_TEXT` → Doit apparaître en haut
3. Afficher `ANSWER_TEXT` → Doit apparaître en bas
4. Masquer toutes les sources sauf `BG_MAIN` et `CAM`

---

## 🎯 CONFIGURATION CANVAS OBS

**Pour format vertical TikTok (9:16):**

1. **Fichier** → **Paramètres** → **Vidéo**
2. **Résolution de base (Canvas):** 1080x1920
3. **Résolution de sortie (Scaled):** 1080x1920
4. **FPS:** 30 ou 60
5. Cliquer sur **Appliquer** puis **OK**

---

## 🔧 PARAMÈTRES RECOMMANDÉS

### Encodage (pour TikTok Live):
- **Encodeur:** x264 ou NVENC (si GPU NVIDIA)
- **Débit:** 3000-6000 Kbps
- **Preset:** veryfast ou fast
- **Profil:** main
- **Tune:** zerolatency

### Audio:
- **Débit audio:** 128 Kbps
- **Fréquence:** 44.1 kHz ou 48 kHz

---

## 📱 INTÉGRATION AVEC LIVE-CORE

Une fois les sources créées dans OBS, le système `live-core` pourra les contrôler via WebSocket:

```javascript
// Le système contrôlera automatiquement:
- Affichage/masquage des cartes
- Mise à jour des textes (username, question, réponse)
- Lecture des sons (shuffle, flip)
- Changement d'images des cartes
```

**Configuration déjà faite:**
- ✅ OBS WebSocket: `ws://192.168.1.37:4455`
- ✅ Mot de passe: `J1GZVy2u2hj2Yv6V`
- ✅ Mapping des sources: `config/sources_map.json`

---

## 🆘 DÉPANNAGE

### Problème: Vidéo ne boucle pas
**Solution:** Vérifier que "Boucler" est coché dans les propriétés de la source

### Problème: Texte trop grand/petit
**Solution:** Ajuster la taille de police dans les propriétés

### Problème: Cartes mal positionnées
**Solution:** Utiliser les coordonnées exactes indiquées ci-dessus

### Problème: Sons ne jouent pas
**Solution:** Vérifier que "Redémarrer la lecture..." est coché

---

**🎉 Votre scène OBS est maintenant prête pour le live TikTok!**

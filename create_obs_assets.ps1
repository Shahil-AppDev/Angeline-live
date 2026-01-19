# ============================================
# SCRIPT DE CRÉATION DES ASSETS OBS MANQUANTS
# ============================================
# Exécution: .\create_obs_assets.ps1

$ErrorActionPreference = "Stop"

Write-Host "🎬 Création des assets OBS pour Angeline Live..." -ForegroundColor Cyan
Write-Host ""

# Chemins
$projectRoot = "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live"
$assetsPath = "$projectRoot\assets\oracles_assets\ORACLE_MYSTICA\CORE"
$overlaysPath = "$assetsPath\overlays"
$sfxPath = "$assetsPath\sfx"

# Créer dossiers si nécessaire
Write-Host "📁 Création des dossiers..." -ForegroundColor Yellow
New-Item -ItemType Directory -Force -Path $overlaysPath | Out-Null
New-Item -ItemType Directory -Force -Path $sfxPath | Out-Null
Write-Host "   ✅ Dossiers créés" -ForegroundColor Green

# ============================================
# CARD_1.PNG - Placeholder carte
# ============================================
Write-Host ""
Write-Host "🖼️  Création de card_1.png..." -ForegroundColor Yellow

$cardSource = "$assetsPath\mystica_sentimental_001.png"
$cardDest = "$overlaysPath\card_1.png"

if (Test-Path $cardSource) {
    Copy-Item $cardSource $cardDest -Force
    Write-Host "   ✅ card_1.png créé (copie de mystica_sentimental_001.png)" -ForegroundColor Green
}
else {
    Write-Host "   ⚠️  Source non trouvée, création d'un placeholder noir..." -ForegroundColor Yellow
    
    # Créer image noire avec Python si disponible
    $pythonScript = @"
from PIL import Image, ImageDraw, ImageFont
img = Image.new('RGB', (1024, 1536), color=(26, 0, 51))
draw = ImageDraw.Draw(img)
try:
    font = ImageFont.truetype('arial.ttf', 120)
except:
    font = ImageFont.load_default()
text = '?'
bbox = draw.textbbox((0, 0), text, font=font)
w = bbox[2] - bbox[0]
h = bbox[3] - bbox[1]
draw.text(((1024-w)/2, (1536-h)/2), text, fill=(255,255,255), font=font)
img.save('$cardDest')
"@
    
    try {
        $pythonScript | python -
        Write-Host "   ✅ card_1.png créé avec Python" -ForegroundColor Green
    }
    catch {
        Write-Host "   ❌ Python non disponible - créer manuellement" -ForegroundColor Red
    }
}

# ============================================
# VIDÉOS DE BOUCLES (oracle_loop_XX.mp4)
# ============================================
Write-Host ""
Write-Host "🎥 Vérification de FFmpeg..." -ForegroundColor Yellow

$ffmpegAvailable = $false
try {
    $null = ffmpeg -version 2>&1
    $ffmpegAvailable = $true
    Write-Host "   ✅ FFmpeg détecté" -ForegroundColor Green
}
catch {
    Write-Host "   ❌ FFmpeg non installé" -ForegroundColor Red
    Write-Host "   📥 Installation recommandée: choco install ffmpeg" -ForegroundColor Yellow
    Write-Host "   OU télécharger: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor Yellow
}

if ($ffmpegAvailable) {
    Write-Host ""
    Write-Host "🎬 Création des 6 vidéos de boucle..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le 6; $i++) {
        $num = $i.ToString("00")
        $videoFile = "$overlaysPath\oracle_loop_$num.mp4"
        
        if (Test-Path $videoFile) {
            Write-Host "   ⏭️  oracle_loop_$num.mp4 existe déjà" -ForegroundColor Gray
        }
        else {
            Write-Host "   🎬 Création oracle_loop_$num.mp4..." -ForegroundColor Cyan
            
            # Créer vidéo avec fond violet mystique et texte
            $color = "#1a0033"  # Violet foncé
            $text = "Oracle Mystica - Loop $i"
            
            ffmpeg -f lavfi -i "color=c=$color:s=1920x1080:d=10" `
                -vf "drawtext=text='$text':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" `
                -c:v libx264 -pix_fmt yuv420p -preset fast -crf 23 `
                "$videoFile" -y 2>&1 | Out-Null
            
            if (Test-Path $videoFile) {
                $size = (Get-Item $videoFile).Length / 1MB
                Write-Host "   ✅ oracle_loop_$num.mp4 créé ($([math]::Round($size, 2)) MB)" -ForegroundColor Green
            }
            else {
                Write-Host "   ❌ Échec création oracle_loop_$num.mp4" -ForegroundColor Red
            }
        }
    }
}
else {
    Write-Host ""
    Write-Host "⚠️  Impossible de créer les vidéos sans FFmpeg" -ForegroundColor Yellow
    Write-Host "   Solutions:" -ForegroundColor Yellow
    Write-Host "   1. Installer FFmpeg: choco install ffmpeg" -ForegroundColor White
    Write-Host "   2. Télécharger vidéos depuis Pexels/Pixabay" -ForegroundColor White
    Write-Host "   3. Créer avec Canva et exporter en MP4" -ForegroundColor White
}

# ============================================
# EFFETS SONORES (SFX)
# ============================================
Write-Host ""
Write-Host "🔊 Création des effets sonores..." -ForegroundColor Yellow

if ($ffmpegAvailable) {
    # shuffle.mp3
    $shuffleFile = "$sfxPath\shuffle.mp3"
    if (Test-Path $shuffleFile) {
        Write-Host "   ⏭️  shuffle.mp3 existe déjà" -ForegroundColor Gray
    }
    else {
        Write-Host "   🔊 Création shuffle.mp3..." -ForegroundColor Cyan
        ffmpeg -f lavfi -i "anullsrc=r=44100:cl=stereo" -t 0.5 -q:a 9 -acodec libmp3lame "$shuffleFile" -y 2>&1 | Out-Null
        
        if (Test-Path $shuffleFile) {
            Write-Host "   ✅ shuffle.mp3 créé (silence 0.5s)" -ForegroundColor Green
        }
    }
    
    # flip.mp3
    $flipFile = "$sfxPath\flip.mp3"
    if (Test-Path $flipFile) {
        Write-Host "   ⏭️  flip.mp3 existe déjà" -ForegroundColor Gray
    }
    else {
        Write-Host "   🔊 Création flip.mp3..." -ForegroundColor Cyan
        ffmpeg -f lavfi -i "anullsrc=r=44100:cl=stereo" -t 0.3 -q:a 9 -acodec libmp3lame "$flipFile" -y 2>&1 | Out-Null
        
        if (Test-Path $flipFile) {
            Write-Host "   ✅ flip.mp3 créé (silence 0.3s)" -ForegroundColor Green
        }
    }
}
else {
    Write-Host "   ⚠️  FFmpeg requis pour créer les sons" -ForegroundColor Yellow
    Write-Host "   Alternative: Télécharger depuis Freesound.org" -ForegroundColor White
}

# ============================================
# VÉRIFICATION FINALE
# ============================================
Write-Host ""
Write-Host "🔍 Vérification des fichiers créés..." -ForegroundColor Cyan
Write-Host ""

$allGood = $true

# Vérifier card_1.png
if (Test-Path "$overlaysPath\card_1.png") {
    Write-Host "   ✅ card_1.png" -ForegroundColor Green
}
else {
    Write-Host "   ❌ card_1.png MANQUANT" -ForegroundColor Red
    $allGood = $false
}

# Vérifier vidéos
for ($i = 1; $i -le 6; $i++) {
    $num = $i.ToString("00")
    if (Test-Path "$overlaysPath\oracle_loop_$num.mp4") {
        Write-Host "   ✅ oracle_loop_$num.mp4" -ForegroundColor Green
    }
    else {
        Write-Host "   ❌ oracle_loop_$num.mp4 MANQUANT" -ForegroundColor Red
        $allGood = $false
    }
}

# Vérifier sons
if (Test-Path "$sfxPath\shuffle.mp3") {
    Write-Host "   ✅ shuffle.mp3" -ForegroundColor Green
}
else {
    Write-Host "   ❌ shuffle.mp3 MANQUANT" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "$sfxPath\flip.mp3") {
    Write-Host "   ✅ flip.mp3" -ForegroundColor Green
}
else {
    Write-Host "   ❌ flip.mp3 MANQUANT" -ForegroundColor Red
    $allGood = $false
}

# ============================================
# RÉSUMÉ
# ============================================
Write-Host ""
Write-Host '============================================' -ForegroundColor Cyan

if ($allGood) {
    Write-Host "🎉 TOUS LES FICHIERS SONT CRÉÉS!" -ForegroundColor Green
    Write-Host ""
    Write-Host "Prochaines étapes:" -ForegroundColor Yellow
    Write-Host "1. Ouvrir OBS Studio" -ForegroundColor White
    Write-Host "2. Aller dans: Fichiers → Afficher les fichiers manquants" -ForegroundColor White
    Write-Host "3. Cliquer sur 'Rechercher dans le dossier'" -ForegroundColor White
    Write-Host "4. Les fichiers devraient être détectés automatiquement" -ForegroundColor White
    Write-Host ""
    Write-Host "⚠️  NOTE: Les vidéos et sons sont des PLACEHOLDERS" -ForegroundColor Yellow
    Write-Host "   Pour une meilleure qualité:" -ForegroundColor Yellow
    Write-Host "   - Remplacer les vidéos par des animations mystiques" -ForegroundColor White
    Write-Host "   - Télécharger de vrais sons de cartes depuis Freesound.org" -ForegroundColor White
}
else {
    Write-Host "⚠️  CERTAINS FICHIERS MANQUENT ENCORE" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Actions requises:" -ForegroundColor Yellow
    
    if (-not $ffmpegAvailable) {
        Write-Host "1. Installer FFmpeg:" -ForegroundColor White
        Write-Host "   choco install ffmpeg" -ForegroundColor Cyan
        Write-Host "   OU télécharger: https://www.gyan.dev/ffmpeg/builds/" -ForegroundColor Cyan
        Write-Host "2. Relancer ce script" -ForegroundColor White
    }
    
    Write-Host ""
    Write-Host "Alternative:" -ForegroundColor Yellow
    Write-Host "- Consulter OBS_ASSETS_SETUP.md pour créer manuellement" -ForegroundColor White
}

Write-Host '============================================' -ForegroundColor Cyan
Write-Host ""

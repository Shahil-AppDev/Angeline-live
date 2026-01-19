# Script de creation des assets OBS manquants
# Execution: .\create_obs_assets_simple.ps1

$ErrorActionPreference = "Stop"

Write-Host "Creation des assets OBS pour Angeline Live..." -ForegroundColor Cyan

# Chemins
$assetsPath = "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live\assets\oracles_assets\ORACLE_MYSTICA\CORE"
$overlaysPath = "$assetsPath\overlays"
$sfxPath = "$assetsPath\sfx"

# Creer dossiers
New-Item -ItemType Directory -Force -Path $overlaysPath | Out-Null
New-Item -ItemType Directory -Force -Path $sfxPath | Out-Null
Write-Host "Dossiers crees" -ForegroundColor Green

# Copier card_1.png
$cardSource = "$assetsPath\mystica_sentimental_001.png"
$cardDest = "$overlaysPath\card_1.png"

if (Test-Path $cardSource) {
    Copy-Item $cardSource $cardDest -Force
    Write-Host "card_1.png cree" -ForegroundColor Green
}

# Verifier FFmpeg
$ffmpegAvailable = $false
try {
    $null = ffmpeg -version 2>&1
    $ffmpegAvailable = $true
    Write-Host "FFmpeg detecte" -ForegroundColor Green
}
catch {
    Write-Host "FFmpeg non installe" -ForegroundColor Red
    Write-Host "Installer avec: choco install ffmpeg" -ForegroundColor Yellow
}

# Creer videos si FFmpeg disponible
if ($ffmpegAvailable) {
    Write-Host "Creation des 6 videos de boucle..." -ForegroundColor Yellow
    
    for ($i = 1; $i -le 6; $i++) {
        $num = $i.ToString("00")
        $videoFile = "$overlaysPath\oracle_loop_$num.mp4"
        
        if (-not (Test-Path $videoFile)) {
            Write-Host "Creation oracle_loop_$num.mp4..." -ForegroundColor Cyan
            
            ffmpeg -f lavfi -i "color=c=#1a0033:s=1920x1080:d=10" `
                -vf "drawtext=text='Oracle Mystica':fontsize=72:fontcolor=white:x=(w-text_w)/2:y=(h-text_h)/2" `
                -c:v libx264 -pix_fmt yuv420p -preset fast -crf 23 `
                "$videoFile" -y 2>&1 | Out-Null
            
            Write-Host "oracle_loop_$num.mp4 cree" -ForegroundColor Green
        }
    }
    
    # Creer sons
    $shuffleFile = "$sfxPath\shuffle.mp3"
    if (-not (Test-Path $shuffleFile)) {
        ffmpeg -f lavfi -i "anullsrc=r=44100:cl=stereo" -t 0.5 -q:a 9 -acodec libmp3lame "$shuffleFile" -y 2>&1 | Out-Null
        Write-Host "shuffle.mp3 cree" -ForegroundColor Green
    }
    
    $flipFile = "$sfxPath\flip.mp3"
    if (-not (Test-Path $flipFile)) {
        ffmpeg -f lavfi -i "anullsrc=r=44100:cl=stereo" -t 0.3 -q:a 9 -acodec libmp3lame "$flipFile" -y 2>&1 | Out-Null
        Write-Host "flip.mp3 cree" -ForegroundColor Green
    }
}

# Verification
Write-Host ""
Write-Host "Verification des fichiers..." -ForegroundColor Cyan

$allGood = $true

if (Test-Path "$overlaysPath\card_1.png") {
    Write-Host "OK: card_1.png" -ForegroundColor Green
}
else {
    Write-Host "MANQUANT: card_1.png" -ForegroundColor Red
    $allGood = $false
}

for ($i = 1; $i -le 6; $i++) {
    $num = $i.ToString("00")
    if (Test-Path "$overlaysPath\oracle_loop_$num.mp4") {
        Write-Host "OK: oracle_loop_$num.mp4" -ForegroundColor Green
    }
    else {
        Write-Host "MANQUANT: oracle_loop_$num.mp4" -ForegroundColor Red
        $allGood = $false
    }
}

if (Test-Path "$sfxPath\shuffle.mp3") {
    Write-Host "OK: shuffle.mp3" -ForegroundColor Green
}
else {
    Write-Host "MANQUANT: shuffle.mp3" -ForegroundColor Red
    $allGood = $false
}

if (Test-Path "$sfxPath\flip.mp3") {
    Write-Host "OK: flip.mp3" -ForegroundColor Green
}
else {
    Write-Host "MANQUANT: flip.mp3" -ForegroundColor Red
    $allGood = $false
}

Write-Host ""
if ($allGood) {
    Write-Host "TOUS LES FICHIERS SONT CREES!" -ForegroundColor Green
    Write-Host "Ouvrir OBS et rechercher les fichiers manquants" -ForegroundColor Yellow
}
else {
    Write-Host "CERTAINS FICHIERS MANQUENT" -ForegroundColor Yellow
    if (-not $ffmpegAvailable) {
        Write-Host "Installer FFmpeg: choco install ffmpeg" -ForegroundColor Cyan
    }
}

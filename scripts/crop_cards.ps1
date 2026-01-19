# Script PowerShell pour recadrer les cartes oracle facilement
# Usage: .\crop_cards.ps1

param(
    [string]$InputFolder = "",
    [string]$OutputFolder = "",
    [int]$Threshold = 30,
    [int]$Margin = 10,
    [int]$Width = 0
)

Write-Host "🔮 RECADRAGE AUTOMATIQUE DES CARTES ORACLE" -ForegroundColor Cyan
Write-Host "==========================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier si Python est installé
try {
    $pythonVersion = python --version 2>&1
    Write-Host "✅ Python détecté: $pythonVersion" -ForegroundColor Green
} catch {
    Write-Host "❌ Python n'est pas installé ou pas dans le PATH" -ForegroundColor Red
    Write-Host "   Installez Python depuis https://www.python.org/downloads/" -ForegroundColor Yellow
    exit 1
}

# Vérifier si Pillow est installé
Write-Host "🔍 Vérification des dépendances..." -ForegroundColor Yellow
$pillowCheck = python -c "import PIL; print('OK')" 2>&1

if ($pillowCheck -ne "OK") {
    Write-Host "❌ Pillow (PIL) n'est pas installé" -ForegroundColor Red
    Write-Host "📦 Installation de Pillow..." -ForegroundColor Yellow
    pip install Pillow numpy
    Write-Host "✅ Pillow installé" -ForegroundColor Green
} else {
    Write-Host "✅ Pillow déjà installé" -ForegroundColor Green
}

Write-Host ""

# Si pas de dossier spécifié, demander
if ($InputFolder -eq "") {
    Write-Host "📁 Dossier source des cartes:" -ForegroundColor Cyan
    Write-Host "   (Glissez-déposez le dossier ici ou tapez le chemin)" -ForegroundColor Gray
    $InputFolder = Read-Host "Chemin"
    $InputFolder = $InputFolder.Trim('"')
}

# Vérifier que le dossier existe
if (-not (Test-Path $InputFolder)) {
    Write-Host "❌ Le dossier '$InputFolder' n'existe pas" -ForegroundColor Red
    exit 1
}

# Si pas de dossier de sortie, créer un dossier "_cropped"
if ($OutputFolder -eq "") {
    $OutputFolder = Join-Path $InputFolder "_cropped"
    Write-Host "📂 Dossier de sortie: $OutputFolder" -ForegroundColor Yellow
}

# Construire la commande Python
$scriptPath = Join-Path $PSScriptRoot "crop_oracle_cards.py"
$command = "python `"$scriptPath`" `"$InputFolder`" -o `"$OutputFolder`" -t $Threshold -m $Margin"

if ($Width -gt 0) {
    $command += " -w $Width"
}

Write-Host ""
Write-Host "🚀 Lancement du recadrage..." -ForegroundColor Green
Write-Host ""

# Exécuter le script Python
Invoke-Expression $command

Write-Host ""
Write-Host "✅ Terminé !" -ForegroundColor Green
Write-Host "📂 Les cartes recadrées sont dans: $OutputFolder" -ForegroundColor Cyan
Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

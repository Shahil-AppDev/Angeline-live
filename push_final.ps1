# Push complet vers GitHub
$repoUrl = "https://github.com/Shahil-AppDev/Angeline-live.git"

Write-Host ""
Write-Host "PUSH PROJET COMPLET VERS GITHUB" -ForegroundColor Cyan
Write-Host "Repo: $repoUrl" -ForegroundColor Cyan
Write-Host ""

# Aller dans le projet
$projectPath = $PSScriptRoot
Set-Location $projectPath

# Supprimer ancien .git
if (Test-Path ".git") {
    Write-Host "Suppression ancien .git..." -ForegroundColor Yellow
    Remove-Item ".git" -Recurse -Force
}

# Configurer .gitignore
Write-Host "Configuration .gitignore..." -ForegroundColor Yellow
Set-Content -Path ".gitignore" -Value "node_modules" -Encoding UTF8

# Initialiser Git
Write-Host "Initialisation Git..." -ForegroundColor Yellow
git init
git branch -M main
git config user.name "Shahil-AppDev"
git config user.email "shahil.appdev@gmail.com"

# Ajouter tous les fichiers
Write-Host "Ajout de tous les fichiers..." -ForegroundColor Yellow
git add -A

$filesCount = (git status --short | Measure-Object).Count
Write-Host "$filesCount fichiers ajoutes" -ForegroundColor Green

# Verification Oracle Mystica
$oracleFiles = (Get-ChildItem "assets\oracles_assets\ORACLE_MYSTICA" -Recurse -File -ErrorAction SilentlyContinue | Measure-Object).Count
Write-Host "Oracle Mystica: $oracleFiles fichiers" -ForegroundColor Green

# Commit
Write-Host "Creation commit..." -ForegroundColor Yellow
git commit -m "Initial commit - Angeline Live - Systeme complet (189 cartes Oracle Mystica, DeepSeek API, ElevenLabs TTS)"

# Ajouter remote
Write-Host "Ajout remote..." -ForegroundColor Yellow
git remote add origin $repoUrl

# Push
Write-Host ""
Write-Host "PUSH EN COURS (2-5 minutes)..." -ForegroundColor Green
Write-Host ""
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "PUSH REUSSI !" -ForegroundColor Green
    Write-Host ""
    Write-Host "Repo: $repoUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "IMPORTANT: Mettez le repo en PRIVE !" -ForegroundColor Red
    Write-Host "https://github.com/Shahil-AppDev/Angeline-live/settings" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "Sur l'autre PC:" -ForegroundColor Cyan
    Write-Host "  git clone $repoUrl" -ForegroundColor White
    Write-Host "  cd Angeline-live" -ForegroundColor White
    Write-Host "  npm install" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "ERREUR lors du push" -ForegroundColor Red
}

Write-Host "Appuyez sur une touche..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

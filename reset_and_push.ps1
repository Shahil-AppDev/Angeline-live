# Reset and Push to GitHub
$repoUrl = "https://github.com/Shahil-AppDev/Angeline-live.git"

Write-Host ""
Write-Host "Reset complet et push vers GitHub" -ForegroundColor Cyan
Write-Host "Repo: $repoUrl" -ForegroundColor Cyan
Write-Host ""

# Verification Git
try {
    $gitVersion = git --version
    Write-Host "Git: $gitVersion" -ForegroundColor Green
}
catch {
    Write-Host "Git non installe" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "ATTENTION: Ce script va supprimer tout du repo et recommencer" -ForegroundColor Yellow
Write-Host "Continuer ? (O/N)" -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "Annule" -ForegroundColor Red
    exit 0
}

Write-Host ""

# Aller dans le projet
$projectPath = $PSScriptRoot
Set-Location $projectPath

# Desactiver .gitignore
if (Test-Path ".gitignore") {
    Write-Host "Desactivation .gitignore..." -ForegroundColor Yellow
    if (Test-Path ".gitignore.backup") {
        Remove-Item ".gitignore.backup" -Force
    }
    Rename-Item ".gitignore" ".gitignore.backup" -Force
}

# Supprimer .git
if (Test-Path ".git") {
    Write-Host "Suppression ancien .git..." -ForegroundColor Yellow
    Remove-Item ".git" -Recurse -Force
}

# Initialiser Git
Write-Host "Initialisation Git..." -ForegroundColor Yellow
git init
git branch -M main

# Configurer identite
git config user.name "Shahil-AppDev"
git config user.email "shahil.appdev@gmail.com"

# Ajouter tous les fichiers
Write-Host "Ajout de tous les fichiers..." -ForegroundColor Yellow
git add -A

$filesCount = (git status --short | Measure-Object).Count
Write-Host "$filesCount fichiers ajoutes" -ForegroundColor Green

# Verification Oracle Mystica
$oracleFiles = (Get-ChildItem "assets\oracles_assets\ORACLE_MYSTICA" -Recurse -File | Measure-Object).Count
Write-Host "$oracleFiles fichiers Oracle Mystica detectes" -ForegroundColor Green

# Commit
Write-Host "Creation commit..." -ForegroundColor Yellow
$commitMessage = "Initial commit - Angeline Live v2 - Systeme complet (189 cartes Oracle Mystica)"
git commit -m $commitMessage

# Ajouter remote
Write-Host "Ajout remote GitHub..." -ForegroundColor Yellow
git remote add origin $repoUrl

# Push
Write-Host "Push vers GitHub (5-15 minutes)..." -ForegroundColor Green
git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "PUSH REUSSI !" -ForegroundColor Green
    Write-Host "Repo: $repoUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "IMPORTANT: Mettez le repo en PRIVE maintenant !" -ForegroundColor Red
    Write-Host "https://github.com/Shahil-AppDev/angelin-nj-live-v2/settings" -ForegroundColor Yellow
}
else {
    Write-Host "ERREUR lors du push" -ForegroundColor Red
}

Write-Host ""
Write-Host "Appuyez sur une touche..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

# ========================================
# SCRIPT PUSH GITHUB - PROJET COMPLET
# ========================================
# Push tout le projet (y compris .env, node_modules, assets)
# ATTENTION : Utiliser un dépôt PRIVÉ uniquement !

param(
    [string]$RepoUrl = "",
    [string]$CommitMessage = "Update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')",
    [switch]$Force
)

Write-Host ""
Write-Host "🚀 PUSH PROJET COMPLET VERS GITHUB" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git détecté: $gitVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Git n'est pas installé" -ForegroundColor Red
    Write-Host "   Installez Git: winget install Git.Git" -ForegroundColor Yellow
    exit 1
}

# Demander l'URL du dépôt si non fournie
if ($RepoUrl -eq "") {
    Write-Host "📝 URL du dépôt GitHub (PRIVÉ) :" -ForegroundColor Yellow
    Write-Host "   Exemple: https://github.com/username/angeline-live.git" -ForegroundColor Gray
    $RepoUrl = Read-Host "URL"
}

if ($RepoUrl -eq "") {
    Write-Host "❌ URL du dépôt requise" -ForegroundColor Red
    exit 1
}

Write-Host ""
Write-Host "⚠️  ATTENTION : Ce script va pousser TOUT le projet" -ForegroundColor Yellow
Write-Host "   Y compris : .env, node_modules, assets, API keys" -ForegroundColor Yellow
Write-Host "   Assurez-vous que le dépôt est PRIVÉ !" -ForegroundColor Red
Write-Host ""
Write-Host "Continuer ? (O/N)" -ForegroundColor Yellow
$confirm = Read-Host
if ($confirm -ne "O" -and $confirm -ne "o") {
    Write-Host "❌ Annulé" -ForegroundColor Red
    exit 0
}

Write-Host ""

# Aller dans le dossier du projet
$projectPath = $PSScriptRoot
cd $projectPath

Write-Host "📂 Dossier projet: $projectPath" -ForegroundColor Cyan
Write-Host ""

# Désactiver .gitignore
if (Test-Path ".gitignore") {
    Write-Host "📝 Désactivation de .gitignore..." -ForegroundColor Yellow
    if (Test-Path ".gitignore.backup") {
        Remove-Item ".gitignore.backup" -Force
    }
    Rename-Item ".gitignore" ".gitignore.backup" -Force
    Write-Host "   ✅ .gitignore renommé en .gitignore.backup" -ForegroundColor Green
}

# Initialiser Git si nécessaire
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initialisation Git..." -ForegroundColor Yellow
    git init
    Write-Host "   ✅ Git initialisé" -ForegroundColor Green
}
else {
    Write-Host "✅ Git déjà initialisé" -ForegroundColor Green
}

Write-Host ""

# Configurer l'identité Git si nécessaire
$userName = git config user.name
$userEmail = git config user.email

if (-not $userName -or -not $userEmail) {
    Write-Host "⚙️  Configuration Git..." -ForegroundColor Yellow
    
    if (-not $userName) {
        Write-Host "Nom d'utilisateur Git:" -ForegroundColor Cyan
        $userName = Read-Host
        git config user.name $userName
    }
    
    if (-not $userEmail) {
        Write-Host "Email Git:" -ForegroundColor Cyan
        $userEmail = Read-Host
        git config user.email $userEmail
    }
    
    Write-Host "   ✅ Identité configurée" -ForegroundColor Green
}

Write-Host ""

# Ajouter tous les fichiers
Write-Host "📦 Ajout de tous les fichiers..." -ForegroundColor Yellow
git add -A

# Compter les fichiers
$filesCount = (git status --short | Measure-Object).Count
Write-Host "   ✅ $filesCount fichiers ajoutés" -ForegroundColor Green

Write-Host ""

# Créer le commit
Write-Host "💾 Création du commit..." -ForegroundColor Yellow
Write-Host "   Message: $CommitMessage" -ForegroundColor Gray
git commit -m $CommitMessage

Write-Host "   ✅ Commit créé" -ForegroundColor Green

Write-Host ""

# Ajouter le remote si nécessaire
$remoteExists = git remote | Select-String "origin"
if (-not $remoteExists) {
    Write-Host "🔗 Ajout du remote GitHub..." -ForegroundColor Yellow
    git remote add origin $RepoUrl
    Write-Host "   ✅ Remote ajouté" -ForegroundColor Green
}
else {
    Write-Host "✅ Remote déjà configuré" -ForegroundColor Green
    # Mettre à jour l'URL si différente
    $currentUrl = git remote get-url origin
    if ($currentUrl -ne $RepoUrl) {
        Write-Host "   ⚠️  Mise à jour de l'URL du remote..." -ForegroundColor Yellow
        git remote set-url origin $RepoUrl
    }
}

Write-Host ""

# Push vers GitHub
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Green
Write-Host "   Cela peut prendre plusieurs minutes..." -ForegroundColor Gray

git branch -M main

if ($Force) {
    Write-Host "   ⚠️  Force push activé" -ForegroundColor Yellow
    git push -u origin main --force
}
else {
    git push -u origin main
}

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ PUSH TERMINÉ AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📂 Dépôt GitHub: $RepoUrl" -ForegroundColor Cyan
    Write-Host "🔒 Vérifiez que le dépôt est PRIVÉ !" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Prochaines étapes:" -ForegroundColor Cyan
    Write-Host "   1. Aller sur GitHub et vérifier que tous les fichiers sont présents" -ForegroundColor White
    Write-Host "   2. Vérifier que le dépôt est bien PRIVÉ (Settings → Danger Zone)" -ForegroundColor White
    Write-Host "   3. Sur l'autre PC: git clone $RepoUrl" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "❌ ERREUR LORS DU PUSH" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions possibles:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier l'URL du dépôt" -ForegroundColor White
    Write-Host "   2. Vérifier l'authentification (Personal Access Token)" -ForegroundColor White
    Write-Host "   3. Vérifier que le dépôt existe sur GitHub" -ForegroundColor White
    Write-Host "   4. Essayer avec --force: .\push_to_github.ps1 -Force" -ForegroundColor White
    Write-Host ""
}

# Restaurer .gitignore si souhaité
Write-Host "Restaurer .gitignore ? (O/N)" -ForegroundColor Yellow
$restore = Read-Host
if ($restore -eq "O" -or $restore -eq "o") {
    if (Test-Path ".gitignore.backup") {
        Rename-Item ".gitignore.backup" ".gitignore" -Force
        Write-Host "✅ .gitignore restauré" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

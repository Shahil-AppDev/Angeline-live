# ========================================
# PUSH VERS NOUVEAU REPO GITHUB
# ========================================
# Repo: https://github.com/Shahil-AppDev/angelin-nj-live-v2
# Push TOUT sans gitignore (API keys incluses)

$repoUrl = "https://github.com/Shahil-AppDev/angelin-nj-live-v2.git"

Write-Host ""
Write-Host "🚀 PUSH VERS NOUVEAU REPO GITHUB" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "📂 Repo: $repoUrl" -ForegroundColor Cyan
Write-Host ""

# Vérifier Git
try {
    $gitVersion = git --version
    Write-Host "✅ Git: $gitVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Git non installé" -ForegroundColor Red
    Write-Host "   Installez: winget install Git.Git" -ForegroundColor Yellow
    exit 1
}

Write-Host ""

# Aller dans le projet
$projectPath = $PSScriptRoot
Set-Location $projectPath

Write-Host "📂 Projet: $projectPath" -ForegroundColor Cyan
Write-Host ""

# Désactiver .gitignore
if (Test-Path ".gitignore") {
    Write-Host "📝 Désactivation .gitignore..." -ForegroundColor Yellow
    if (Test-Path ".gitignore.backup") {
        Remove-Item ".gitignore.backup" -Force
    }
    Rename-Item ".gitignore" ".gitignore.backup" -Force
    Write-Host "   ✅ .gitignore désactivé" -ForegroundColor Green
}

Write-Host ""

# Supprimer .git existant si présent
if (Test-Path ".git") {
    Write-Host "🗑️  Suppression ancien .git..." -ForegroundColor Yellow
    Remove-Item ".git" -Recurse -Force
    Write-Host "   ✅ Ancien .git supprimé" -ForegroundColor Green
}

Write-Host ""

# Initialiser Git
Write-Host "🔧 Initialisation Git..." -ForegroundColor Yellow
git init
git branch -M main
Write-Host "   ✅ Git initialisé (branche main)" -ForegroundColor Green

Write-Host ""

# Configurer identité
Write-Host "⚙️  Configuration Git..." -ForegroundColor Yellow
git config user.name "Shahil-AppDev"
git config user.email "shahil.appdev@gmail.com"
Write-Host "   ✅ Identité configurée" -ForegroundColor Green

Write-Host ""

# Ajouter TOUS les fichiers
Write-Host "📦 Ajout de TOUS les fichiers..." -ForegroundColor Yellow
Write-Host "   (y compris .env, node_modules, assets, API keys)" -ForegroundColor Gray
git add -A

# Compter
$filesCount = (git status --short | Measure-Object).Count
Write-Host "   ✅ $filesCount fichiers ajoutés" -ForegroundColor Green

Write-Host ""

# Commit
Write-Host "💾 Création commit..." -ForegroundColor Yellow
$commitMessage = "Initial commit - Angeline Live v2 - Système complet (189 cartes, formation, agents)"
git commit -m $commitMessage
Write-Host "   ✅ Commit créé" -ForegroundColor Green

Write-Host ""

# Ajouter remote
Write-Host "🔗 Ajout remote GitHub..." -ForegroundColor Yellow
git remote add origin $repoUrl
Write-Host "   ✅ Remote ajouté" -ForegroundColor Green

Write-Host ""

# Push
Write-Host "🚀 PUSH VERS GITHUB..." -ForegroundColor Green
Write-Host "   Cela peut prendre 5-15 minutes (350-750 MB)..." -ForegroundColor Gray
Write-Host ""

git push -u origin main --force

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅✅✅ PUSH RÉUSSI ! ✅✅✅" -ForegroundColor Green
    Write-Host ""
    Write-Host "📂 Repo GitHub: $repoUrl" -ForegroundColor Cyan
    Write-Host ""
    Write-Host "📊 Contenu pushé:" -ForegroundColor Cyan
    Write-Host "   ✅ Code source complet (apps, packages, agents)" -ForegroundColor White
    Write-Host "   ✅ 189 cartes Oracle Mystica (recadrées)" -ForegroundColor White
    Write-Host "   ✅ Vidéos (BG_LOOP, FX_SMOKE)" -ForegroundColor White
    Write-Host "   ✅ Formation PDF" -ForegroundColor White
    Write-Host "   ✅ Fichiers .env (API keys incluses)" -ForegroundColor White
    Write-Host "   ✅ node_modules" -ForegroundColor White
    Write-Host "   ✅ Documentation complète" -ForegroundColor White
    Write-Host ""
    Write-Host "🔒 IMPORTANT: Mettez le repo en PRIVÉ maintenant !" -ForegroundColor Red
    Write-Host "   1. Aller sur: https://github.com/Shahil-AppDev/angelin-nj-live-v2/settings" -ForegroundColor Yellow
    Write-Host "   2. Scroll → Danger Zone → Change visibility → Make private" -ForegroundColor Yellow
    Write-Host ""
    Write-Host "📋 Sur l'autre PC:" -ForegroundColor Cyan
    Write-Host "   git clone $repoUrl" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "❌ ERREUR LORS DU PUSH" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Solutions:" -ForegroundColor Yellow
    Write-Host "   1. Vérifier que le repo existe sur GitHub" -ForegroundColor White
    Write-Host "   2. Vérifier l'authentification (Personal Access Token)" -ForegroundColor White
    Write-Host "   3. Le push peut être long (5-15 min), patience..." -ForegroundColor White
    Write-Host ""
    Write-Host "🔑 Authentification GitHub:" -ForegroundColor Yellow
    Write-Host "   Username: Shahil-AppDev" -ForegroundColor White
    Write-Host "   Password: [Personal Access Token]" -ForegroundColor White
    Write-Host "   Créer token: https://github.com/settings/tokens" -ForegroundColor White
    Write-Host ""
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

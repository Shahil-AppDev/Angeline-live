# ========================================
# SCRIPT UPDATE ORACLE MYSTICA SUR GITHUB
# ========================================
# Remplace le dossier Oracle Mystica sur GitHub

param(
    [string]$RepoUrl = ""
)

Write-Host ""
Write-Host "🔄 UPDATE ORACLE MYSTICA SUR GITHUB" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Git est installé
try {
    $gitVersion = git --version
    Write-Host "✅ Git détecté: $gitVersion" -ForegroundColor Green
}
catch {
    Write-Host "❌ Git n'est pas installé" -ForegroundColor Red
    exit 1
}

# Aller dans le dossier du projet
$projectPath = $PSScriptRoot
Set-Location $projectPath

Write-Host "📂 Dossier projet: $projectPath" -ForegroundColor Cyan
Write-Host ""

# Vérifier que Git est initialisé
if (-not (Test-Path ".git")) {
    Write-Host "❌ Git n'est pas initialisé dans ce dossier" -ForegroundColor Red
    Write-Host "   Exécutez d'abord: .\push_to_github.ps1" -ForegroundColor Yellow
    exit 1
}

# Désactiver .gitignore temporairement
if (Test-Path ".gitignore") {
    Write-Host "📝 Désactivation de .gitignore..." -ForegroundColor Yellow
    if (Test-Path ".gitignore.backup") {
        Remove-Item ".gitignore.backup" -Force
    }
    Rename-Item ".gitignore" ".gitignore.backup" -Force
}

Write-Host ""

# Supprimer l'ancien dossier Oracle Mystica du tracking Git
Write-Host "🗑️  Suppression de l'ancien Oracle Mystica du tracking Git..." -ForegroundColor Yellow
git rm -r --cached "assets/oracles_assets/ORACLE_MYSTICA" 2>$null

Write-Host ""

# Ajouter le nouveau dossier Oracle Mystica
Write-Host "📦 Ajout du nouveau dossier Oracle Mystica..." -ForegroundColor Yellow
git add "assets/oracles_assets/ORACLE_MYSTICA"

# Compter les fichiers
$filesCount = (git diff --cached --name-only | Measure-Object).Count
Write-Host "   ✅ $filesCount fichiers modifiés" -ForegroundColor Green

Write-Host ""

# Créer le commit
Write-Host "💾 Création du commit..." -ForegroundColor Yellow
$commitMessage = "Update: Remplacement dossier Oracle Mystica (189 cartes recadrées)"
git commit -m $commitMessage

Write-Host "   ✅ Commit créé" -ForegroundColor Green

Write-Host ""

# Push vers GitHub
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Green
Write-Host "   Cela peut prendre plusieurs minutes..." -ForegroundColor Gray

git push origin main

if ($LASTEXITCODE -eq 0) {
    Write-Host ""
    Write-Host "✅ ORACLE MYSTICA MIS À JOUR AVEC SUCCÈS !" -ForegroundColor Green
    Write-Host ""
    Write-Host "📊 Contenu mis à jour:" -ForegroundColor Cyan
    Write-Host "   - CORE: 145 cartes" -ForegroundColor White
    Write-Host "   - EXTENSIONS/SENTIMENTAL: 27 cartes + dos" -ForegroundColor White
    Write-Host "   - EXTENSIONS/TRAVAIL: 17 cartes + dos" -ForegroundColor White
    Write-Host "   - backs/back.jpeg: Dos base" -ForegroundColor White
    Write-Host "   Total: 189 cartes recadrées (500x888px)" -ForegroundColor White
    Write-Host ""
}
else {
    Write-Host ""
    Write-Host "❌ ERREUR LORS DU PUSH" -ForegroundColor Red
    Write-Host ""
    Write-Host "💡 Essayez: git push origin main --force" -ForegroundColor Yellow
    Write-Host ""
}

# Restaurer .gitignore
if (Test-Path ".gitignore.backup") {
    Write-Host "Restaurer .gitignore ? (O/N)" -ForegroundColor Yellow
    $restore = Read-Host
    if ($restore -eq "O" -or $restore -eq "o") {
        Rename-Item ".gitignore.backup" ".gitignore" -Force
        Write-Host "✅ .gitignore restauré" -ForegroundColor Green
    }
}

Write-Host ""
Write-Host "Appuyez sur une touche pour fermer..." -ForegroundColor Gray
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

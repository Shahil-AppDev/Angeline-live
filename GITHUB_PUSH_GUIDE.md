# 🚀 GUIDE PUSH GITHUB - PROJET COMPLET

## ⚠️ IMPORTANT

Ce guide permet de pousser **TOUT LE PROJET** sur GitHub, y compris :
- Fichiers `.env` (avec API keys)
- `node_modules/`
- Assets (cartes, vidéos)
- Configurations sensibles

**ATTENTION :** Utilisez un **dépôt privé** uniquement !

---

## 📋 PRÉREQUIS

1. **Compte GitHub** : https://github.com/
2. **Git installé** :
   ```powershell
   winget install Git.Git
   ```
3. **Dépôt GitHub créé** (PRIVÉ)

---

## 🔧 MÉTHODE 1 : PUSH COMPLET (SANS GITIGNORE)

### Étape 1 : Supprimer/Renommer .gitignore

```powershell
# Aller dans le dossier du projet
cd "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live"

# Renommer .gitignore (pour le désactiver)
if (Test-Path ".gitignore") {
    Rename-Item ".gitignore" ".gitignore.backup"
}

# Ou supprimer complètement
# Remove-Item ".gitignore" -Force
```

### Étape 2 : Initialiser Git

```powershell
# Initialiser le dépôt Git
git init

# Configurer votre identité (si pas déjà fait)
git config user.name "Votre Nom"
git config user.email "votre.email@example.com"
```

### Étape 3 : Ajouter tous les fichiers

```powershell
# Ajouter TOUS les fichiers (y compris .env, node_modules, etc.)
git add -A

# Vérifier les fichiers ajoutés
git status
```

### Étape 4 : Commit

```powershell
# Créer le commit initial
git commit -m "Initial commit - Projet Angeline Live complet"
```

### Étape 5 : Lier au dépôt GitHub

```powershell
# Remplacer par votre URL de dépôt GitHub (PRIVÉ)
git remote add origin https://github.com/VOTRE_USERNAME/angeline-live.git

# Vérifier
git remote -v
```

### Étape 6 : Push

```powershell
# Push vers GitHub (branche main)
git branch -M main
git push -u origin main
```

**Si erreur d'authentification :**
```powershell
# Utiliser un Personal Access Token (PAT)
# Aller sur GitHub → Settings → Developer settings → Personal access tokens
# Créer un token avec permissions "repo"
# Utiliser le token comme mot de passe
```

---

## 🔧 MÉTHODE 2 : SCRIPT AUTOMATIQUE

### Script PowerShell

Créer un fichier `push_to_github.ps1` :

```powershell
# Configuration
$repoUrl = "https://github.com/VOTRE_USERNAME/angeline-live.git"
$projectPath = "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live"

Write-Host "🚀 PUSH PROJET COMPLET VERS GITHUB" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Aller dans le dossier
cd $projectPath

# Désactiver .gitignore
if (Test-Path ".gitignore") {
    Write-Host "📝 Désactivation de .gitignore..." -ForegroundColor Yellow
    Rename-Item ".gitignore" ".gitignore.backup" -Force
}

# Initialiser Git (si pas déjà fait)
if (-not (Test-Path ".git")) {
    Write-Host "🔧 Initialisation Git..." -ForegroundColor Yellow
    git init
}

# Ajouter tous les fichiers
Write-Host "📦 Ajout de tous les fichiers..." -ForegroundColor Yellow
git add -A

# Commit
Write-Host "💾 Création du commit..." -ForegroundColor Yellow
$commitMessage = "Update - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')"
git commit -m $commitMessage

# Ajouter remote (si pas déjà fait)
$remoteExists = git remote | Select-String "origin"
if (-not $remoteExists) {
    Write-Host "🔗 Ajout du remote GitHub..." -ForegroundColor Yellow
    git remote add origin $repoUrl
}

# Push
Write-Host "🚀 Push vers GitHub..." -ForegroundColor Green
git branch -M main
git push -u origin main --force

Write-Host ""
Write-Host "✅ Push terminé !" -ForegroundColor Green
Write-Host "📂 Dépôt : $repoUrl" -ForegroundColor Cyan
```

**Exécuter :**
```powershell
.\push_to_github.ps1
```

---

## 🔧 MÉTHODE 3 : GITHUB DESKTOP (PLUS FACILE)

### Étape 1 : Installer GitHub Desktop
```powershell
winget install GitHub.GitHubDesktop
```

### Étape 2 : Configurer
1. Ouvrir GitHub Desktop
2. Se connecter à GitHub
3. **File** → **Add Local Repository**
4. Sélectionner : `C:\Users\DarkNode\Desktop\Projet Web\Angeline-live`

### Étape 3 : Désactiver .gitignore
1. Renommer `.gitignore` en `.gitignore.backup`
2. Dans GitHub Desktop, tous les fichiers apparaîtront

### Étape 4 : Commit et Push
1. Cocher tous les fichiers
2. Commit message : "Initial commit - Projet complet"
3. **Publish repository**
4. ✅ **Private** (IMPORTANT)
5. **Publish**

---

## 📊 TAILLE DU PROJET

### Estimation
- **Code source** : ~50 MB
- **node_modules** : ~200-500 MB
- **Assets (cartes + vidéos)** : ~100-200 MB
- **Total** : ~350-750 MB

### Limites GitHub
- **Fichier max** : 100 MB
- **Dépôt recommandé** : < 1 GB
- **Push max** : 2 GB

**Si trop gros :**
- Utiliser **Git LFS** (Large File Storage)
- Ou exclure `node_modules` (peut être réinstallé avec `npm install`)

---

## 🔒 SÉCURITÉ

### ⚠️ ATTENTION : DONNÉES SENSIBLES

Le projet contient :
- ✅ API keys (OpenRouter, ElevenLabs)
- ✅ Mots de passe (OBS, Database)
- ✅ Secrets (NextAuth)

**IMPÉRATIF :**
- 🔒 **Dépôt PRIVÉ uniquement**
- 🔒 **Ne JAMAIS rendre public**
- 🔒 **Limiter les accès** (vous seul)

### Vérifier que le dépôt est privé
1. Aller sur GitHub
2. Votre dépôt → **Settings**
3. **Danger Zone** → Vérifier "Private"

---

## 🔄 MISES À JOUR FUTURES

### Push des modifications

```powershell
cd "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live"

# Ajouter les modifications
git add -A

# Commit
git commit -m "Update: description des changements"

# Push
git push origin main
```

### Pull sur autre ordinateur

```powershell
# Cloner le dépôt
git clone https://github.com/VOTRE_USERNAME/angeline-live.git

# Ou mettre à jour
cd angeline-live
git pull origin main
```

---

## 🛠️ ALTERNATIVE : GIT LFS (POUR GROS FICHIERS)

Si les vidéos/assets sont trop gros :

### Installer Git LFS
```powershell
git lfs install
```

### Tracker les gros fichiers
```powershell
# Tracker les vidéos
git lfs track "*.mp4"
git lfs track "*.mov"

# Tracker les images
git lfs track "*.jpeg"
git lfs track "*.jpg"
git lfs track "*.png"

# Ajouter .gitattributes
git add .gitattributes
git commit -m "Add Git LFS tracking"
```

### Push avec LFS
```powershell
git add -A
git commit -m "Add assets with LFS"
git push origin main
```

---

## 📋 CHECKLIST

### Avant le push
- [ ] Dépôt GitHub créé (PRIVÉ)
- [ ] Git installé
- [ ] .gitignore désactivé/supprimé
- [ ] Identité Git configurée

### Pendant le push
- [ ] `git init` exécuté
- [ ] `git add -A` exécuté
- [ ] Commit créé
- [ ] Remote ajouté
- [ ] Push réussi

### Après le push
- [ ] Vérifier sur GitHub que tous les fichiers sont présents
- [ ] Vérifier que le dépôt est PRIVÉ
- [ ] Tester le clone sur autre ordinateur
- [ ] `.env` présent et fonctionnel

---

## 🐛 TROUBLESHOOTING

### Erreur : "remote: Repository not found"
- Vérifier l'URL du dépôt
- Vérifier les permissions (dépôt privé)
- Vérifier l'authentification

### Erreur : "file too large"
- Utiliser Git LFS
- Ou exclure les gros fichiers

### Erreur : "authentication failed"
- Utiliser un Personal Access Token (PAT)
- GitHub → Settings → Developer settings → Personal access tokens
- Créer un token avec permissions "repo"
- Utiliser le token comme mot de passe

### Push très lent
- Normal si beaucoup de fichiers/gros fichiers
- Patience (peut prendre 10-30 minutes)
- Vérifier la connexion internet

---

## 📞 COMMANDES UTILES

```powershell
# Voir le statut
git status

# Voir l'historique
git log --oneline

# Voir les remotes
git remote -v

# Voir les fichiers trackés
git ls-files

# Taille du dépôt
git count-objects -vH

# Annuler le dernier commit (avant push)
git reset --soft HEAD~1

# Forcer le push (attention !)
git push origin main --force
```

---

## ✅ RÉSULTAT FINAL

Après le push, vous aurez :
- ✅ Projet complet sur GitHub (privé)
- ✅ Tous les fichiers (code, assets, configs)
- ✅ Historique Git
- ✅ Possibilité de cloner sur autre PC
- ✅ Backup sécurisé

**Le projet est maintenant sauvegardé sur GitHub et prêt à être cloné sur un autre ordinateur !** 🚀✨

# Script simple pour créer un ZIP sans node_modules
$projectName = "Angeline-live"
$sourceDir = "C:\Users\DarkNode\Desktop\Projet Web\Angeline-live"
$desktopPath = [Environment]::GetFolderPath("Desktop")
$zipName = "$projectName-$(Get-Date -Format 'yyyyMMdd-HHmmss').zip"
$zipPath = Join-Path $desktopPath $zipName

Write-Host "=== Création du ZIP sans node_modules ===" -ForegroundColor Cyan
Write-Host "Source: $sourceDir" -ForegroundColor White
Write-Host "Destination: $zipPath" -ForegroundColor White
Write-Host ""

# Liste des dossiers/fichiers à exclure
$excludePatterns = @(
    '*\node_modules\*',
    '*\.git\*',
    '*\dist\*',
    '*\.next\*',
    '*\logs\*',
    '*\*.log',
    '*.ps1'
)

Write-Host "Récupération des fichiers à inclure..." -ForegroundColor Yellow

# Obtenir tous les fichiers en excluant les patterns
$filesToZip = Get-ChildItem -Path $sourceDir -Recurse -File | Where-Object {
    $file = $_
    $shouldExclude = $false
    
    foreach ($pattern in $excludePatterns) {
        if ($file.FullName -like $pattern) {
            $shouldExclude = $true
            break
        }
    }
    
    -not $shouldExclude
}

$fileCount = $filesToZip.Count
Write-Host "Fichiers à compresser: $fileCount" -ForegroundColor Green
Write-Host ""

# Créer le ZIP avec Add-Type (méthode .NET)
Write-Host "Compression en cours (cela peut prendre quelques minutes)..." -ForegroundColor Yellow

Add-Type -AssemblyName System.IO.Compression.FileSystem

# Supprimer le ZIP s'il existe
if (Test-Path $zipPath) {
    Remove-Item $zipPath -Force
}

# Créer le ZIP
$zip = [System.IO.Compression.ZipFile]::Open($zipPath, 'Create')

$progress = 0
foreach ($file in $filesToZip) {
    $progress++
    if ($progress % 100 -eq 0) {
        $percent = [math]::Round(($progress / $fileCount) * 100, 1)
        Write-Host "Progression: $percent% ($progress/$fileCount fichiers)" -ForegroundColor Cyan
    }
    
    $relativePath = $file.FullName.Substring($sourceDir.Length + 1)
    $entryName = $relativePath.Replace('\', '/')
    
    try {
        [System.IO.Compression.ZipFileExtensions]::CreateEntryFromFile($zip, $file.FullName, $entryName, 'Optimal') | Out-Null
    }
    catch {
        Write-Host "Erreur avec: $relativePath" -ForegroundColor Red
    }
}

$zip.Dispose()

Write-Host ""
Write-Host "✅ ZIP créé avec succès!" -ForegroundColor Green
Write-Host "Emplacement: $zipPath" -ForegroundColor White

$zipSize = (Get-Item $zipPath).Length / 1MB
Write-Host "Taille: $([math]::Round($zipSize, 2)) MB" -ForegroundColor White
Write-Host ""
Write-Host "Le fichier est prêt sur votre Bureau!" -ForegroundColor Cyan

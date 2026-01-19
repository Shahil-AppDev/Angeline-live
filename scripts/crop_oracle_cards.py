#!/usr/bin/env python3
"""
Script de recadrage automatique des cartes oracle
Détecte les bords de la carte et recadre pour enlever les espaces blancs/gris
"""

import os
import sys
from pathlib import Path
from PIL import Image, ImageChops
import numpy as np

def detect_card_bounds(image, threshold=30, margin=10):
    """
    Détecte les limites de la carte en trouvant les bords non-blancs
    
    Args:
        image: Image PIL
        threshold: Seuil de détection (0-255). Plus bas = plus strict
        margin: Marge à ajouter autour de la carte (en pixels)
    
    Returns:
        tuple: (left, top, right, bottom)
    """
    # Convertir en numpy array
    img_array = np.array(image.convert('RGB'))
    
    # Calculer la luminosité moyenne de chaque pixel
    brightness = np.mean(img_array, axis=2)
    
    # Trouver les pixels qui ne sont pas blancs/gris clair
    # On considère qu'un pixel fait partie de la carte si sa luminosité < seuil
    non_white = brightness < (255 - threshold)
    
    # Trouver les coordonnées des pixels non-blancs
    rows = np.any(non_white, axis=1)
    cols = np.any(non_white, axis=0)
    
    # Trouver les limites
    if not rows.any() or not cols.any():
        # Pas de carte détectée, retourner l'image complète
        return (0, 0, image.width, image.height)
    
    top = np.argmax(rows)
    bottom = len(rows) - np.argmax(rows[::-1])
    left = np.argmax(cols)
    right = len(cols) - np.argmax(cols[::-1])
    
    # Ajouter une marge
    left = max(0, left - margin)
    top = max(0, top - margin)
    right = min(image.width, right + margin)
    bottom = min(image.height, bottom + margin)
    
    return (left, top, right, bottom)

def crop_card(input_path, output_path, threshold=30, margin=10, target_width=None):
    """
    Recadre une carte oracle
    
    Args:
        input_path: Chemin de l'image source
        output_path: Chemin de l'image de sortie
        threshold: Seuil de détection (0-255)
        margin: Marge autour de la carte
        target_width: Largeur cible (optionnel, garde le ratio)
    """
    try:
        # Ouvrir l'image
        img = Image.open(input_path)
        
        # Détecter les bords
        bounds = detect_card_bounds(img, threshold, margin)
        
        # Recadrer
        cropped = img.crop(bounds)
        
        # Redimensionner si demandé
        if target_width and cropped.width != target_width:
            ratio = target_width / cropped.width
            target_height = int(cropped.height * ratio)
            cropped = cropped.resize((target_width, target_height), Image.Resampling.LANCZOS)
        
        # Sauvegarder
        cropped.save(output_path, quality=95, optimize=True)
        
        return True, f"✅ Recadré: {os.path.basename(input_path)} ({img.width}x{img.height} → {cropped.width}x{cropped.height})"
    
    except Exception as e:
        return False, f"❌ Erreur sur {os.path.basename(input_path)}: {str(e)}"

def process_directory(input_dir, output_dir=None, threshold=30, margin=10, target_width=None, extensions=None):
    """
    Traite tous les fichiers d'un dossier
    
    Args:
        input_dir: Dossier source
        output_dir: Dossier de sortie (si None, écrase les originaux)
        threshold: Seuil de détection
        margin: Marge autour de la carte
        target_width: Largeur cible
        extensions: Liste des extensions à traiter (défaut: jpg, jpeg, png)
    """
    if extensions is None:
        extensions = ['.jpg', '.jpeg', '.png', '.JPG', '.JPEG', '.PNG']
    
    input_path = Path(input_dir)
    
    if not input_path.exists():
        print(f"❌ Le dossier {input_dir} n'existe pas")
        return
    
    # Créer le dossier de sortie si nécessaire
    if output_dir:
        output_path = Path(output_dir)
        output_path.mkdir(parents=True, exist_ok=True)
    else:
        output_path = input_path
    
    # Trouver tous les fichiers images
    image_files = []
    for ext in extensions:
        image_files.extend(input_path.glob(f'*{ext}'))
    
    if not image_files:
        print(f"❌ Aucune image trouvée dans {input_dir}")
        return
    
    print(f"\n📁 Traitement de {len(image_files)} images...")
    print(f"📂 Source: {input_dir}")
    print(f"📂 Destination: {output_dir or input_dir}")
    print(f"⚙️  Seuil: {threshold}, Marge: {margin}px")
    if target_width:
        print(f"📏 Largeur cible: {target_width}px")
    print()
    
    success_count = 0
    error_count = 0
    
    for img_file in sorted(image_files):
        output_file = output_path / img_file.name
        success, message = crop_card(
            str(img_file),
            str(output_file),
            threshold=threshold,
            margin=margin,
            target_width=target_width
        )
        
        print(message)
        
        if success:
            success_count += 1
        else:
            error_count += 1
    
    print(f"\n✅ Terminé: {success_count} succès, {error_count} erreurs")

def main():
    """Point d'entrée principal"""
    import argparse
    
    parser = argparse.ArgumentParser(
        description='Recadre automatiquement les cartes oracle en enlevant les espaces blancs',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Exemples d'utilisation:

  # Recadrer toutes les cartes d'un dossier (écrase les originaux)
  python crop_oracle_cards.py input_folder/

  # Recadrer vers un nouveau dossier
  python crop_oracle_cards.py input_folder/ -o output_folder/

  # Ajuster le seuil de détection (plus bas = plus strict)
  python crop_oracle_cards.py input_folder/ -t 20

  # Ajouter une marge plus grande
  python crop_oracle_cards.py input_folder/ -m 20

  # Redimensionner à une largeur spécifique (garde le ratio)
  python crop_oracle_cards.py input_folder/ -w 500

  # Recadrer une seule image
  python crop_oracle_cards.py carte.jpg -o carte_cropped.jpg
        """
    )
    
    parser.add_argument('input', help='Dossier ou fichier image source')
    parser.add_argument('-o', '--output', help='Dossier ou fichier de sortie (défaut: écrase les originaux)')
    parser.add_argument('-t', '--threshold', type=int, default=30, help='Seuil de détection (0-255, défaut: 30)')
    parser.add_argument('-m', '--margin', type=int, default=10, help='Marge autour de la carte en pixels (défaut: 10)')
    parser.add_argument('-w', '--width', type=int, help='Largeur cible en pixels (garde le ratio)')
    
    args = parser.parse_args()
    
    input_path = Path(args.input)
    
    # Traiter un fichier unique
    if input_path.is_file():
        output_file = args.output if args.output else str(input_path)
        success, message = crop_card(
            str(input_path),
            output_file,
            threshold=args.threshold,
            margin=args.margin,
            target_width=args.width
        )
        print(message)
        sys.exit(0 if success else 1)
    
    # Traiter un dossier
    elif input_path.is_dir():
        process_directory(
            str(input_path),
            output_dir=args.output,
            threshold=args.threshold,
            margin=args.margin,
            target_width=args.width
        )
    
    else:
        print(f"❌ {args.input} n'existe pas")
        sys.exit(1)

if __name__ == '__main__':
    main()

#!/usr/bin/env python3
"""
Optimize project images for the research section
Handles PNG, JPG, SVG, and HEIC formats
"""

import os
from pathlib import Path
from PIL import Image
import subprocess
import shutil

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
OPTIMIZED_DIR = PROJECT_ROOT / "assets" / "images" / "projects"

# Project image mappings
PROJECT_IMAGES = {
    "APEX.png": "apex_osiris",
    "Final Flight Instruments.HEIC": "visions_escapade",
    "silica_for_experiment-01-01.jpg": "pstar_silica",
    "manyBBwithmixes.svg": "nfdap_bennu"
}

# Target dimensions for project images
# We want consistent aspect ratios for a clean grid
TARGET_WIDTH = 800
TARGET_HEIGHT = 600
THUMBNAIL_WIDTH = 400
THUMBNAIL_HEIGHT = 300


def ensure_directories():
    """Create necessary directories"""
    OPTIMIZED_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✓ Output directory ready: {OPTIMIZED_DIR}")


def convert_heic_to_jpg(heic_path, output_path):
    """Convert HEIC to JPG using sips (macOS) or imagemagick"""
    try:
        # Try sips first (macOS built-in)
        cmd = ['sips', '-s', 'format', 'jpeg', str(heic_path), '--out', str(output_path)]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✓ Converted HEIC to JPG using sips")
            return True
    except FileNotFoundError:
        pass

    try:
        # Try ImageMagick convert
        cmd = ['convert', str(heic_path), str(output_path)]
        result = subprocess.run(cmd, capture_output=True, text=True)
        if result.returncode == 0:
            print(f"  ✓ Converted HEIC to JPG using ImageMagick")
            return True
    except FileNotFoundError:
        pass

    print(f"  ⚠️  Could not convert HEIC - install ImageMagick or use macOS")
    return False


def optimize_image(input_path, output_base_name):
    """Optimize a single project image"""
    print(f"\n🖼️  Processing: {input_path.name}")

    # Handle different formats
    if input_path.suffix.lower() == '.svg':
        # Just copy SVG files - they're already optimized vector graphics
        output_svg = OPTIMIZED_DIR / f"{output_base_name}.svg"
        shutil.copy2(input_path, output_svg)
        print(f"  ✓ Copied SVG (vector format, no optimization needed)")
        return

    # Handle HEIC format
    if input_path.suffix.lower() == '.heic':
        # Convert to JPG first
        temp_jpg = PROJECT_ROOT / "temp_converted.jpg"
        if not convert_heic_to_jpg(input_path, temp_jpg):
            return
        input_path = temp_jpg

    # Load and process image
    try:
        img = Image.open(input_path)

        # Convert RGBA to RGB if necessary
        if img.mode in ('RGBA', 'LA', 'P'):
            background = Image.new('RGB', img.size, (255, 255, 255))
            if img.mode == 'P':
                img = img.convert('RGBA')
            background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
            img = background

        # Create full-size version (with aspect ratio preserved)
        # Calculate dimensions to fit within target size
        aspect = img.width / img.height
        if aspect > TARGET_WIDTH / TARGET_HEIGHT:
            # Width is limiting factor
            new_width = TARGET_WIDTH
            new_height = int(TARGET_WIDTH / aspect)
        else:
            # Height is limiting factor
            new_height = TARGET_HEIGHT
            new_width = int(TARGET_HEIGHT * aspect)

        # Create full-size WebP
        full_img = img.resize((new_width, new_height), Image.Resampling.LANCZOS)
        full_webp = OPTIMIZED_DIR / f"{output_base_name}.webp"
        full_img.save(full_webp, 'WEBP', quality=85, method=6)
        print(f"  ✓ Full size: {new_width}x{new_height} WebP")

        # Create thumbnail WebP
        thumb_aspect = THUMBNAIL_WIDTH / THUMBNAIL_HEIGHT
        if aspect > thumb_aspect:
            thumb_width = THUMBNAIL_WIDTH
            thumb_height = int(THUMBNAIL_WIDTH / aspect)
        else:
            thumb_height = THUMBNAIL_HEIGHT
            thumb_width = int(THUMBNAIL_HEIGHT * aspect)

        thumb_img = img.resize((thumb_width, thumb_height), Image.Resampling.LANCZOS)
        thumb_webp = OPTIMIZED_DIR / f"{output_base_name}_thumb.webp"
        thumb_img.save(thumb_webp, 'WEBP', quality=80, method=6)
        print(f"  ✓ Thumbnail: {thumb_width}x{thumb_height} WebP")

        # Create fallback JPG
        full_jpg = OPTIMIZED_DIR / f"{output_base_name}.jpg"
        full_img.save(full_jpg, 'JPEG', quality=85, optimize=True)
        print(f"  ✓ Fallback: JPG created")

        # Clean up temp file if it exists
        if input_path.name == "temp_converted.jpg":
            input_path.unlink()

    except Exception as e:
        print(f"  ❌ Error processing image: {e}")


def main():
    print("="*60)
    print("🚀 Project Image Optimization")
    print("="*60)

    ensure_directories()

    # Process each project image
    for original_name, output_name in PROJECT_IMAGES.items():
        input_path = PROJECT_ROOT / original_name
        if not input_path.exists():
            print(f"\n⚠️  Warning: {original_name} not found")
            continue

        optimize_image(input_path, output_name)

    # Summary
    print("\n" + "="*60)
    print("📊 OPTIMIZATION COMPLETE")
    print("="*60)

    # List created files
    if OPTIMIZED_DIR.exists():
        files = list(OPTIMIZED_DIR.glob("*"))
        if files:
            print(f"\n✓ Created {len(files)} optimized files:")
            for f in sorted(files):
                size_kb = f.stat().st_size / 1024
                print(f"  - {f.name}: {size_kb:.1f} KB")

    print("\n✅ Project images ready for use!")


if __name__ == "__main__":
    main()
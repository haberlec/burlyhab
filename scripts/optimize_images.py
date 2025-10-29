#!/usr/bin/env python3
"""
Image optimization script for BurlyHab website
Compresses large JPG images to WebP format with multiple sizes for responsive design
"""

import os
from pathlib import Path
from PIL import Image
import argparse

# Configuration
PROJECT_ROOT = Path(__file__).parent.parent
ORIGINALS_DIR = PROJECT_ROOT / "assets" / "images" / "originals"
OPTIMIZED_DIR = PROJECT_ROOT / "assets" / "images" / "optimized"

# Images to process (in project root)
IMAGES_TO_OPTIMIZE = [
    "CMC_ppol_aligned.jpg",
    "CMC_xpol_aligned.jpg"
]

# Responsive sizes to generate (width in pixels)
RESPONSIVE_SIZES = {
    "small": 640,      # Mobile
    "medium": 1280,    # Tablet
    "large": 1920      # Desktop
}

# Compression settings
WEBP_QUALITY = 80      # 0-100, 80 is good balance
JPG_QUALITY = 85       # Fallback JPG quality


def ensure_directories():
    """Create necessary directories if they don't exist"""
    ORIGINALS_DIR.mkdir(parents=True, exist_ok=True)
    OPTIMIZED_DIR.mkdir(parents=True, exist_ok=True)
    print(f"✓ Directories ready:")
    print(f"  - Originals: {ORIGINALS_DIR}")
    print(f"  - Optimized: {OPTIMIZED_DIR}")


def get_file_size_mb(filepath):
    """Get file size in MB"""
    size_bytes = os.path.getsize(filepath)
    return size_bytes / (1024 * 1024)


def copy_originals():
    """Copy original images to originals directory"""
    print("\n📁 Copying original images...")
    for image_name in IMAGES_TO_OPTIMIZE:
        source = PROJECT_ROOT / image_name
        if not source.exists():
            print(f"  ⚠️  Warning: {image_name} not found in project root")
            continue

        dest = ORIGINALS_DIR / image_name
        if not dest.exists():
            import shutil
            shutil.copy2(source, dest)
            size_mb = get_file_size_mb(source)
            print(f"  ✓ Copied {image_name} ({size_mb:.1f} MB)")
        else:
            print(f"  → {image_name} already in originals directory")


def optimize_image(image_path, output_name_base):
    """
    Optimize a single image: create WebP versions at multiple sizes + fallback JPG

    Args:
        image_path: Path to original image
        output_name_base: Base name for output files (without extension)
    """
    print(f"\n🖼️  Processing: {image_path.name}")

    # Load original image
    try:
        img = Image.open(image_path)
        original_size = get_file_size_mb(image_path)
        print(f"  Original size: {img.size[0]}x{img.size[1]} ({original_size:.1f} MB)")
    except Exception as e:
        print(f"  ❌ Error loading image: {e}")
        return

    # Convert to RGB if necessary (WebP doesn't support some modes)
    if img.mode in ('RGBA', 'LA', 'P'):
        print(f"  Converting from {img.mode} to RGB...")
        # Create white background
        background = Image.new('RGB', img.size, (255, 255, 255))
        if img.mode == 'P':
            img = img.convert('RGBA')
        background.paste(img, mask=img.split()[-1] if img.mode in ('RGBA', 'LA') else None)
        img = background

    total_savings = 0

    # Generate responsive WebP versions
    for size_name, width in RESPONSIVE_SIZES.items():
        # Calculate height maintaining aspect ratio
        aspect_ratio = img.size[1] / img.size[0]
        height = int(width * aspect_ratio)

        # Skip if original is smaller than target size
        if img.size[0] <= width:
            print(f"  ⊘ Skipping {size_name} ({width}px) - original is smaller")
            continue

        # Resize image
        resized = img.resize((width, height), Image.Resampling.LANCZOS)

        # Save as WebP
        output_path = OPTIMIZED_DIR / f"{output_name_base}_{size_name}.webp"
        resized.save(output_path, 'WEBP', quality=WEBP_QUALITY, method=6)

        output_size = get_file_size_mb(output_path)
        savings = original_size - output_size
        total_savings += savings

        print(f"  ✓ {size_name:6} ({width:4}px): {output_size:5.2f} MB "
              f"(saved {savings:5.2f} MB / {(savings/original_size)*100:.1f}%)")

    # Generate fallback JPG (large size only)
    fallback_width = RESPONSIVE_SIZES["large"]
    aspect_ratio = img.size[1] / img.size[0]
    fallback_height = int(fallback_width * aspect_ratio)

    if img.size[0] > fallback_width:
        fallback = img.resize((fallback_width, fallback_height), Image.Resampling.LANCZOS)
    else:
        fallback = img

    fallback_path = OPTIMIZED_DIR / f"{output_name_base}_fallback.jpg"
    fallback.save(fallback_path, 'JPEG', quality=JPG_QUALITY, optimize=True)

    fallback_size = get_file_size_mb(fallback_path)
    print(f"  ✓ Fallback JPG: {fallback_size:.2f} MB")

    total_savings += (original_size - fallback_size)

    print(f"  💰 Total savings: {total_savings:.2f} MB ({(total_savings/(original_size*4))*100:.1f}% average)")


def optimize_asteroid_sprite():
    """Copy and optimize the asteroid sprite PNG"""
    print(f"\n🪨 Processing asteroid sprite...")

    sprite_path = PROJECT_ROOT / "lutetia_globe_rosetta_8bit.png"
    if not sprite_path.exists():
        print(f"  ⚠️  Warning: lutetia_globe_rosetta_8bit.png not found")
        return

    # Copy to optimized directory with better name
    dest_path = OPTIMIZED_DIR / "asteroid_sprite.png"

    try:
        img = Image.open(sprite_path)
        original_size = get_file_size_mb(sprite_path)
        print(f"  Original: {img.size[0]}x{img.size[1]} ({original_size:.2f} MB)")

        # Optimize PNG (reduce size while maintaining quality)
        img.save(dest_path, 'PNG', optimize=True)

        optimized_size = get_file_size_mb(dest_path)
        savings = original_size - optimized_size

        print(f"  ✓ Optimized: {optimized_size:.2f} MB (saved {savings:.2f} MB / {(savings/original_size)*100:.1f}%)")
        print(f"  ✓ Saved as: asteroid_sprite.png")

    except Exception as e:
        print(f"  ❌ Error: {e}")


def generate_html_examples():
    """Generate example HTML for using responsive images"""
    print("\n📝 Example HTML usage:")
    print("\n<!-- CMC ppol microscope image -->")
    print("""<picture>
  <source
    type="image/webp"
    srcset="assets/images/optimized/CMC_ppol_small.webp 640w,
            assets/images/optimized/CMC_ppol_medium.webp 1280w,
            assets/images/optimized/CMC_ppol_large.webp 1920w"
    sizes="100vw">
  <img
    src="assets/images/optimized/CMC_ppol_fallback.jpg"
    alt="CMC polarized microscope image"
    loading="lazy"
    width="1920"
    height="auto">
</picture>""")

    print("\n<!-- Asteroid sprite -->")
    print("""<img
  src="assets/images/optimized/asteroid_sprite.png"
  alt="Asteroid Lutetia"
  class="asteroid-sprite"
  width="840"
  height="889">""")


def print_summary():
    """Print summary of all optimized files"""
    print("\n" + "="*60)
    print("📊 OPTIMIZATION SUMMARY")
    print("="*60)

    if not OPTIMIZED_DIR.exists():
        print("No optimized files found.")
        return

    total_size = 0
    file_count = 0

    print(f"\n{'Filename':<40} {'Size':>10}")
    print("-" * 60)

    for file_path in sorted(OPTIMIZED_DIR.glob("*")):
        if file_path.is_file():
            size_mb = get_file_size_mb(file_path)
            total_size += size_mb
            file_count += 1
            print(f"{file_path.name:<40} {size_mb:>8.2f} MB")

    print("-" * 60)
    print(f"{'TOTAL:':^40} {total_size:>8.2f} MB")
    print(f"\n✓ Generated {file_count} optimized files")

    # Calculate original total
    original_total = 0
    for img_name in IMAGES_TO_OPTIMIZE:
        img_path = PROJECT_ROOT / img_name
        if img_path.exists():
            original_total += get_file_size_mb(img_path)

    if original_total > 0:
        savings = original_total - total_size
        savings_percent = (savings / original_total) * 100
        print(f"\n💰 Total savings: {savings:.2f} MB ({savings_percent:.1f}%)")
        print(f"   Original: {original_total:.2f} MB → Optimized: {total_size:.2f} MB")


def main():
    parser = argparse.ArgumentParser(
        description='Optimize images for BurlyHab website',
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python optimize_images.py              # Optimize all images
  python optimize_images.py --summary    # Show summary of optimized files
        """
    )
    parser.add_argument('--summary', action='store_true',
                       help='Show summary of optimized files only')
    parser.add_argument('--skip-copy', action='store_true',
                       help='Skip copying originals to backup directory')

    args = parser.parse_args()

    print("="*60)
    print("🚀 BurlyHab Image Optimization")
    print("="*60)

    ensure_directories()

    if args.summary:
        print_summary()
        return

    # Copy originals to backup
    if not args.skip_copy:
        copy_originals()

    # Optimize main images
    for image_name in IMAGES_TO_OPTIMIZE:
        original_path = PROJECT_ROOT / image_name
        if not original_path.exists():
            print(f"\n⚠️  Skipping {image_name} (not found)")
            continue

        # Get base name without extension
        base_name = image_name.rsplit('.', 1)[0]
        optimize_image(original_path, base_name)

    # Optimize asteroid sprite
    optimize_asteroid_sprite()

    # Show summary
    print_summary()

    # Show HTML examples
    generate_html_examples()

    print("\n" + "="*60)
    print("✅ OPTIMIZATION COMPLETE!")
    print("="*60)
    print("\nNext steps:")
    print("  1. Update HTML files to use optimized images")
    print("  2. Test images render correctly in browser")
    print("  3. Update CSS to use asteroid_sprite.png")
    print("  4. Delete old habseteroid.css (32 KB box-shadow sprite)")


if __name__ == "__main__":
    main()

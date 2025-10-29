# BurlyHab Website - Comprehensive Refactoring Analysis

**Date:** October 28, 2025
**Project:** Dr. Christopher Haberle's Academic Portfolio Website
**Repository:** burlyhab
**Analysis Version:** 1.0

---

## Table of Contents

1. [Executive Summary](#executive-summary)
2. [Current Project Structure](#current-project-structure)
3. [Critical Issues](#critical-issues)
4. [Refactoring Recommendations](#refactoring-recommendations)
5. [Proposed File Structure](#proposed-file-structure)
6. [Implementation Phases](#implementation-phases)
7. [Hosting Recommendations](#hosting-recommendations)
8. [Domain Configuration with Squarespace](#domain-configuration-with-squarespace)
9. [Technical Specifications](#technical-specifications)
10. [Next Steps](#next-steps)

---

## Executive Summary

This is a professional academic personal website for Dr. Christopher Haberle, a Research Professor at Northern Arizona University specializing in planetary science. The website features interactive 3D visualizations, publications list, and research information.

### Current Status
- **Project Type:** Static website (HTML/CSS/JavaScript)
- **Total Code Size:** ~204 KB (code) + 54.6 MB (images)
- **Pages:** 4 (index, asteroid visualization, editor tool, publications)
- **Technologies:** HTML5, CSS3, Vanilla JavaScript, Three.js
- **Build System:** None (raw files served directly)

### Overall Assessment: C+ to B-

**Strengths:**
- Clean semantic HTML
- Professional design and layout
- Good use of modern CSS features
- Functional and working website

**Critical Issues:**
- 54 MB of unoptimized images
- 32 KB CSS box-shadow sprite (anti-pattern)
- Extensive inline styles and scripts
- No build process or optimization
- Code duplication across pages
- No modular architecture

### Impact of Refactoring
- **Performance:** 80-90% reduction in load time
- **Maintainability:** Modular code easier to update
- **Scalability:** Easy to add new pages/features
- **Developer Experience:** Clear organization, build tools
- **SEO:** Better structured data, faster performance

---

## Current Project Structure

```
/Users/chaberle/Documents/GitHab/burlyhab/
├── HTML Files (4 pages)
│   ├── index.html (20 KB) - Main homepage
│   ├── asteroid.html (40 KB) - Interactive 3D asteroid visualization
│   ├── asteroid_editor.html (24 KB) - CSS box-shadow editor tool
│   └── publications.html (40 KB) - Complete publication list
├── CSS Files (3 files)
│   ├── styles.css (8 KB) - Main stylesheet
│   ├── habseteroid.css (32 KB) - 8-bit asteroid sprite design
│   └── habseteroid_clean.css (32 KB) - Alternative asteroid design (UNUSED)
├── JavaScript
│   └── script.js (8 KB) - Common functionality
├── Assets
│   ├── CMC_ppol_aligned.jpg (18 MB) ⚠️
│   ├── CMC_xpol_aligned.jpg (36 MB) ⚠️
│   ├── CSS_ML_2022Apr30_wArrows.gif (608 KB)
│   ├── asteroid-reference.png (17 KB)
│   └── Haberle.bib (54 KB)
├── Configuration/Docs
│   └── README.md (3.7 KB)
├── Backup
│   └── styles.css.bak (42 KB) - Outdated backup file (UNUSED)
└── Jupyter Notebook
    └── asteroid_editor.ipynb (49 KB) - Development notebook
```

### File Size Breakdown
| Category | Size | Percentage |
|----------|------|------------|
| Images | 54.6 MB | 99.6% |
| CSS | 114 KB | 0.2% |
| JavaScript | 8 KB | 0.01% |
| HTML | 124 KB | 0.2% |
| **Total** | **~54.8 MB** | **100%** |

---

## Critical Issues

### 🔴 Issue 1: Asset Bloat (HIGH PRIORITY)

**Problem:**
- Two microscope images total 54 MB (18 MB + 36 MB)
- These are used as decorative hero header background
- Current format: High-resolution JPG
- No optimization, compression, or responsive sizing

**Impact:**
- Slow page load times (30+ seconds on slower connections)
- Poor mobile experience
- Negative SEO impact
- High bandwidth costs

**Solution:**
1. Compress images using modern formats:
   - Convert to WebP with JPG fallback
   - Target size: 500 KB - 2 MB per image (90-95% reduction)
   - Use responsive images with srcset for different screen sizes

2. Implement lazy loading:
   ```html
   <img src="CMC_ppol_aligned-optimized.webp"
        srcset="CMC_ppol_small.webp 640w,
                CMC_ppol_medium.webp 1280w,
                CMC_ppol_large.webp 1920w"
        loading="lazy"
        alt="Microscope image">
   ```

3. Consider using a placeholder/blur-up technique

**Tools to Use:**
- ImageMagick or Squoosh.app for compression
- cwebp for WebP conversion
- responsive-image-generator npm package

---

### 🔴 Issue 2: Box-Shadow Sprite Anti-Pattern (HIGH PRIORITY)

**Problem:**
- `habseteroid.css` is 32 KB with a single CSS rule
- Uses 1000+ box-shadow declarations to create pixel art
- Completely unmaintainable and terrible for performance

**Current Code:**
```css
.asteroid-sprite::before {
    box-shadow:
        10px 10px 0 0 rgb(139, 195, 74),
        11px 10px 0 0 rgb(139, 195, 74),
        /* ...998 more lines... */
        190px 189px 0 0 rgb(139, 195, 74);
}
```

**Impact:**
- Poor rendering performance
- Difficult to modify or animate
- Large file size for simple graphic
- CSS parsing overhead

**Solution Options:**

**Option A: SVG (RECOMMENDED)**
- Create SVG version of asteroid sprite
- Size: 0.5-1 KB (97% reduction)
- Scalable without quality loss
- Easy to animate and modify
- Can use CSS filters for effects

```svg
<svg width="200" height="200" viewBox="0 0 200 200">
  <!-- Clean vector paths for asteroid -->
  <path d="M..." fill="#8BC34A"/>
</svg>
```

**Option B: PNG Sprite**
- Export as optimized PNG
- Size: 0.5-1 KB
- Use CSS background-image
- Good browser support

**Option C: CSS Shapes (Modern)**
```css
.asteroid-sprite::before {
    background: radial-gradient(circle, #8BC34A 0%, #689F38 100%);
    clip-path: polygon(30% 0%, 70% 0%, 100% 30%, 100% 70%, 70% 100%, 30% 100%, 0% 70%, 0% 30%);
    filter: drop-shadow(2px 2px 4px rgba(0,0,0,0.3));
}
```

---

### 🟡 Issue 3: Inline Styles and Scripts (MEDIUM PRIORITY)

**Problem:**
- **asteroid.html:** 452 lines of inline JavaScript + 152 lines CSS
- **asteroid_editor.html:** 400 lines inline JS + 152 lines CSS (100% inline!)
- **publications.html:** 26 lines inline CSS

**Impact:**
- Code duplication
- Difficult to maintain
- No caching benefits
- Can't minify separately
- Mixing concerns (structure + style + behavior)

**Solution:**
Extract to external modules:

```
src/
├── css/
│   ├── pages/
│   │   ├── asteroid.css
│   │   ├── editor.css
│   │   └── publications.css
└── js/
    ├── modules/
    │   ├── three-visualization.js  (from asteroid.html)
    │   └── asteroid-editor.js      (from asteroid_editor.html)
    └── main.js
```

---

### 🟡 Issue 4: Code Duplication (MEDIUM PRIORITY)

**Problem:**
1. Publications appear in both `index.html` and `publications.html`
2. Footer HTML repeated in all 4 pages
3. Navigation structure duplicated
4. No shared components

**Impact:**
- Updates require editing multiple files
- Risk of inconsistency
- Harder to maintain
- More code to load

**Solution:**

**Option A: Static Site Generator (RECOMMENDED)**
Use Jekyll (GitHub Pages native) or Hugo:
```
_layouts/
├── default.html        # Shared header/footer
├── page.html
└── publication.html

_includes/
├── header.html
├── footer.html
└── publication-card.html

_data/
└── publications.yml    # Data-driven content
```

**Option B: JavaScript Templates**
Use template literals or a micro-framework to include shared components

**Option C: Build-time Includes**
Use a build tool to concatenate HTML partials

---

### 🟢 Issue 5: No Build Process (LOW PRIORITY but HIGH VALUE)

**Problem:**
- All files served raw to browser
- No minification or optimization
- No CSS preprocessing (SCSS/LESS)
- No module bundling
- No tree-shaking of unused code

**Solution:**
Implement modern build pipeline:

```json
// package.json
{
  "name": "burlyhab",
  "version": "1.0.0",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "optimize-images": "node scripts/optimize-images.js"
  },
  "devDependencies": {
    "vite": "^5.0.0",
    "sass": "^1.69.0",
    "imagemin": "^8.0.1",
    "imagemin-webp": "^7.0.0"
  }
}
```

---

### 🟢 Issue 6: Unused/Dead Code (LOW PRIORITY)

**Files to Remove:**
- `habseteroid_clean.css` (32 KB) - Duplicate, not used
- `styles.css.bak` (42 KB) - Old backup
- `asteroid_editor.ipynb` (49 KB) - Development notebook

**Impact:** 123 KB of unnecessary files in repository

---

## Refactoring Recommendations

### Color Palette (Current)
```css
:root {
  --gunmetal: #1B282F;
  --tea-green: #D1E4B4;
  --cambridge-blue: #6FA088;
  --savoy-blue: #4E5DA4;
  --eerie-black: #181F1B;
  --hunter-green: #3B5947;
}
```

### Recommended CSS Organization

**Base Layer:**
```
css/
├── base/
│   ├── variables.css       # All CSS custom properties
│   ├── reset.css          # Browser normalization
│   ├── typography.css     # Font definitions and scales
│   └── utilities.css      # Helper classes (.text-center, .mb-4)
```

**Component Layer:**
```
├── components/
│   ├── header.css
│   ├── footer.css
│   ├── navigation.css
│   ├── publication-card.css
│   ├── project-card.css
│   ├── contact-info.css
│   └── buttons.css
```

**Layout Layer:**
```
├── layout/
│   ├── container.css
│   ├── section.css
│   └── grid.css
```

**Page-Specific Layer:**
```
├── pages/
│   ├── home.css
│   ├── asteroid.css
│   ├── editor.css
│   └── publications.css
```

**Animation Layer:**
```
├── animations/
│   ├── keyframes.css
│   ├── transitions.css
│   └── scroll-effects.css
```

**Main Entry:**
```
└── main.css              # Imports all other files
```

### Recommended JavaScript Organization

```
js/
├── config/
│   └── constants.js      # Configuration values
├── utils/
│   ├── dom.js           # DOM manipulation helpers
│   ├── math.js          # Calculation helpers
│   └── animation.js     # Animation utilities
├── modules/
│   ├── scroll-animations.js    # Intersection Observer setup
│   ├── hero-animations.js      # Microscope image effects
│   ├── asteroid-animation.js   # Floating asteroid animation
│   ├── three-visualization.js  # 3D orbital visualization
│   └── asteroid-editor.js      # Editor tool logic
├── pages/
│   ├── home.js
│   ├── asteroid.js
│   └── editor.js
└── main.js              # Entry point, imports modules
```

### Configuration System

**constants.js:**
```javascript
export const ANIMATION_CONFIG = {
  asteroid: {
    minDuration: 4000,
    maxDuration: 8000,
    minDelay: 2000,
    maxDelay: 5000,
    size: { min: 20, max: 40 }
  },
  scroll: {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
  }
};

export const THREE_CONFIG = {
  starfield: {
    count: 5000,
    spread: 500
  },
  camera: {
    fov: 60,
    near: 0.1,
    far: 1000
  }
};
```

---

## Proposed File Structure

### Complete Refactored Structure

```
burlyhab/
├── .github/
│   └── workflows/
│       └── deploy.yml                # GitHub Actions for deployment
├── src/
│   ├── css/
│   │   ├── base/
│   │   │   ├── variables.css         # CSS custom properties
│   │   │   ├── reset.css            # Normalize/reset
│   │   │   ├── typography.css       # Font system
│   │   │   └── utilities.css        # Helper classes
│   │   ├── components/
│   │   │   ├── header.css
│   │   │   ├── footer.css
│   │   │   ├── navigation.css
│   │   │   ├── publication-card.css
│   │   │   ├── project-card.css
│   │   │   ├── contact-info.css
│   │   │   └── buttons.css
│   │   ├── layout/
│   │   │   ├── container.css
│   │   │   ├── section.css
│   │   │   └── grid.css
│   │   ├── pages/
│   │   │   ├── home.css
│   │   │   ├── asteroid.css
│   │   │   ├── editor.css
│   │   │   └── publications.css
│   │   ├── animations/
│   │   │   ├── keyframes.css
│   │   │   ├── transitions.css
│   │   │   └── scroll-effects.css
│   │   └── main.css                 # Main import file
│   ├── js/
│   │   ├── config/
│   │   │   └── constants.js
│   │   ├── utils/
│   │   │   ├── dom.js
│   │   │   ├── math.js
│   │   │   └── animation.js
│   │   ├── modules/
│   │   │   ├── scroll-animations.js
│   │   │   ├── hero-animations.js
│   │   │   ├── asteroid-animation.js
│   │   │   ├── three-visualization.js
│   │   │   └── asteroid-editor.js
│   │   ├── pages/
│   │   │   ├── home.js
│   │   │   ├── asteroid.js
│   │   │   └── editor.js
│   │   └── main.js
│   ├── assets/
│   │   ├── images/
│   │   │   ├── originals/          # Keep originals for reference
│   │   │   │   ├── CMC_ppol_aligned.jpg
│   │   │   │   └── CMC_xpol_aligned.jpg
│   │   │   └── optimized/          # Web-optimized versions
│   │   │       ├── CMC_ppol_small.webp
│   │   │       ├── CMC_ppol_medium.webp
│   │   │       ├── CMC_ppol_large.webp
│   │   │       ├── CMC_ppol_fallback.jpg
│   │   │       └── asteroid-sprite.svg
│   │   ├── icons/
│   │   │   ├── favicon.ico
│   │   │   └── icon.svg
│   │   └── data/
│   │       ├── publications.json    # Data-driven content
│   │       └── projects.json
│   └── vendor/
│       └── three/                   # Local copy (CDN backup)
├── dist/                             # Build output (gitignored)
│   ├── css/
│   ├── js/
│   ├── assets/
│   └── *.html
├── scripts/
│   ├── optimize-images.js           # Image optimization script
│   └── generate-publications.js     # Generate HTML from JSON
├── index.html
├── asteroid.html
├── publications.html
├── asteroid_editor.html
├── package.json
├── package-lock.json
├── vite.config.js                   # Build configuration
├── .gitignore
├── .nvmrc                           # Node version
├── README.md
├── REFACTORING_ANALYSIS.md          # This document
└── LICENSE
```

---

## Implementation Phases

### Phase 1: Cleanup & Quick Wins (1-2 hours)

**Priority: HIGH | Effort: LOW | Impact: HIGH**

**Tasks:**
1. Delete unused files:
   - `habseteroid_clean.css` (-32 KB)
   - `styles.css.bak` (-42 KB)
   - `asteroid_editor.ipynb` (-49 KB)

2. Replace box-shadow sprite:
   - Create SVG version of asteroid sprite
   - Replace import in `styles.css`
   - Test rendering across browsers
   - **Expected result:** 32 KB → 1 KB (97% reduction)

3. Optimize images:
   - Compress JPGs to WebP format
   - Create responsive image sets (small/medium/large)
   - Update HTML with srcset
   - **Expected result:** 54 MB → 5-10 MB (80-90% reduction)

**Commands:**
```bash
# Delete unused files
rm habseteroid_clean.css styles.css.bak asteroid_editor.ipynb

# Install image optimization tools
npm install -g sharp-cli

# Optimize images
sharp -i CMC_ppol_aligned.jpg -o CMC_ppol_optimized.webp --webp-quality 80
sharp -i CMC_xpol_aligned.jpg -o CMC_xpol_optimized.webp --webp-quality 80
```

**Testing:**
- Verify sprite renders correctly
- Check image quality on different screens
- Measure page load time improvement

**Success Metrics:**
- Total asset size < 10 MB
- Page load time < 3 seconds
- Lighthouse performance score > 80

---

### Phase 2: Code Organization (4-6 hours)

**Priority: HIGH | Effort: MEDIUM | Impact: HIGH**

**Tasks:**

1. **Extract Inline CSS:**
   - Create `src/css/pages/asteroid.css`
   - Move 152 lines from `<style>` in asteroid.html
   - Create `src/css/pages/editor.css`
   - Move 152 lines from asteroid_editor.html
   - Create `src/css/pages/publications.css`
   - Move 26 lines from publications.html

2. **Modularize CSS:**
   - Break `styles.css` into logical modules
   - Create base/components/layout structure
   - Set up import system in `main.css`

3. **Extract JavaScript Modules:**
   - Extract Three.js code to `modules/three-visualization.js`
   - Extract editor code to `modules/asteroid-editor.js`
   - Split `script.js` into separate modules
   - Create configuration file for constants

4. **Create Shared Templates:**
   - Extract header HTML to include/component
   - Extract footer HTML to include/component
   - Set up include mechanism (or prepare for Jekyll)

**Implementation Example:**

```javascript
// src/js/modules/three-visualization.js
export class AsteroidVisualization {
  constructor(containerId, config = {}) {
    this.container = document.getElementById(containerId);
    this.config = { ...defaultConfig, ...config };
    this.scene = null;
    this.camera = null;
    this.renderer = null;
  }

  async init() {
    try {
      await this.loadThreeJS();
      this.setupScene();
      this.createStarfield();
      this.createOrbits();
      this.createPlanets();
      this.animate();
    } catch (error) {
      this.handleError(error);
    }
  }

  // ... rest of methods
}
```

**Testing:**
- Verify all pages still function correctly
- Check that styles are applied properly
- Test JavaScript modules load and execute
- Validate no console errors

**Success Metrics:**
- Zero inline styles in HTML files
- Zero inline scripts (except initialization)
- All CSS files < 10 KB each
- All JS modules < 20 KB each

---

### Phase 3: Build Infrastructure (6-8 hours)

**Priority: MEDIUM | Effort: HIGH | Impact: MEDIUM**

**Tasks:**

1. **Initialize npm project:**
   ```bash
   npm init -y
   ```

2. **Install dependencies:**
   ```bash
   npm install -D vite sass postcss autoprefixer cssnano
   npm install -D imagemin imagemin-webp imagemin-mozjpeg
   npm install three  # Local copy instead of CDN
   ```

3. **Create build configuration:**

**vite.config.js:**
```javascript
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  root: '.',
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        asteroid: resolve(__dirname, 'asteroid.html'),
        editor: resolve(__dirname, 'asteroid_editor.html'),
        publications: resolve(__dirname, 'publications.html'),
      },
    },
    minify: 'terser',
    sourcemap: true,
  },
  css: {
    postcss: {
      plugins: [
        require('autoprefixer'),
        require('cssnano')({ preset: 'default' }),
      ],
    },
  },
  server: {
    port: 3000,
    open: true,
  },
});
```

4. **Create image optimization script:**

**scripts/optimize-images.js:**
```javascript
import imagemin from 'imagemin';
import imageminWebP from 'imagemin-webp';
import imageminMozjpeg from 'imagemin-mozjpeg';
import sharp from 'sharp';

const sizes = [640, 1280, 1920];

async function optimizeImages() {
  const images = ['CMC_ppol_aligned.jpg', 'CMC_xpol_aligned.jpg'];

  for (const image of images) {
    // Generate WebP versions at different sizes
    for (const size of sizes) {
      await sharp(`assets/${image}`)
        .resize(size)
        .webp({ quality: 80 })
        .toFile(`src/assets/images/optimized/${image.replace('.jpg', `-${size}.webp`)}`);
    }

    // Generate fallback JPG
    await sharp(`assets/${image}`)
      .resize(1920)
      .jpeg({ quality: 85 })
      .toFile(`src/assets/images/optimized/${image.replace('.jpg', '-optimized.jpg')}`);
  }

  console.log('✓ Images optimized successfully');
}

optimizeImages();
```

5. **Update package.json scripts:**
```json
{
  "scripts": {
    "dev": "vite",
    "build": "npm run optimize-images && vite build",
    "preview": "vite preview",
    "optimize-images": "node scripts/optimize-images.js",
    "deploy": "npm run build && gh-pages -d dist"
  }
}
```

**Testing:**
- Run `npm run dev` and verify local development works
- Run `npm run build` and check dist output
- Test built files in dist directory
- Verify minification and optimization

**Success Metrics:**
- Build completes without errors
- Built CSS < 50% of original size
- Built JS < 50% of original size
- All functionality works in production build

---

### Phase 4: Architecture Improvements (8-10 hours)

**Priority: LOW | Effort: HIGH | Impact: MEDIUM**

**Tasks:**

1. **Implement Static Site Generator (Jekyll):**

**_config.yml:**
```yaml
title: Dr. Christopher Haberle
description: Research Professor, Planetary Science
baseurl: ""
url: "https://yoursite.com"

collections:
  publications:
    output: true
    permalink: /publications/:name/

defaults:
  - scope:
      path: ""
      type: "publications"
    values:
      layout: "publication"
```

**_layouts/default.html:**
```html
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>{{ page.title }} | {{ site.title }}</title>
  <link rel="stylesheet" href="{{ '/css/main.css' | relative_url }}">
</head>
<body>
  {% include header.html %}

  <main>
    {{ content }}
  </main>

  {% include footer.html %}

  <script src="{{ '/js/main.js' | relative_url }}"></script>
</body>
</html>
```

**_data/publications.yml:**
```yaml
- title: "Lunar surface roughness characterization"
  authors: "Haberle, C. W., et al."
  journal: "Journal of Geophysical Research: Planets"
  year: 2023
  doi: "10.1029/2023JE007890"
  pdf: "/assets/pdfs/haberle2023.pdf"

- title: "Another publication"
  authors: "..."
  # ...
```

2. **Create data-driven publication system:**
   - Convert publications to JSON/YAML data file
   - Create template for rendering publication cards
   - Generate publication pages from data
   - Add search/filter functionality

3. **Add error handling:**
   - Wrap Three.js initialization in try/catch
   - Add fallback if CDN fails
   - Show loading states
   - Handle missing data gracefully

4. **Performance optimizations:**
   - Lazy load Three.js library
   - Implement service worker for offline support
   - Add performance monitoring
   - Optimize render pipeline

**Testing:**
- Test Jekyll build locally
- Verify all pages generate correctly
- Check data-driven content renders
- Test error handling scenarios

**Success Metrics:**
- Jekyll builds without errors
- All publications render from data
- Error handling prevents crashes
- Performance score > 90

---

## Hosting Recommendations

### Option 1: GitHub Pages (RECOMMENDED)

GitHub Pages is the ideal hosting solution for your academic website because it's:
- **Free** for public repositories
- **Fast** with global CDN
- **Reliable** with 99.9% uptime
- **Easy** to deploy with git push
- **Jekyll-native** for static site generation
- **Custom domain** support included

#### Setup Instructions

**Step 1: Initialize Git Repository**

```bash
cd /Users/chaberle/Documents/GitHab/burlyhab

# Initialize git if not already done
git init

# Create .gitignore
cat > .gitignore << EOF
# Dependencies
node_modules/
package-lock.json

# Build output
dist/

# macOS
.DS_Store

# Editor
.vscode/
.idea/

# Original large images (keep optimized only)
src/assets/images/originals/*.jpg

# Environment
.env
.env.local
EOF

# Add all files
git add .

# Initial commit
git commit -m "Initial commit: BurlyHab academic website"
```

**Step 2: Create GitHub Repository**

```bash
# Create repository on GitHub (use gh CLI or web interface)
gh repo create burlyhab --public --source=. --remote=origin

# Or manually:
# 1. Go to github.com/new
# 2. Create repository named "burlyhab"
# 3. Don't initialize with README (you already have files)

# Add remote and push
git remote add origin https://github.com/YOUR_USERNAME/burlyhab.git
git branch -M main
git push -u origin main
```

**Step 3: Enable GitHub Pages**

**Option A: Via GitHub Web Interface:**
1. Go to repository Settings
2. Navigate to "Pages" in left sidebar
3. Under "Source", select "Deploy from a branch"
4. Select branch: `main` (or `gh-pages`)
5. Select folder: `/ (root)` or `/docs`
6. Click "Save"

**Option B: Via GitHub CLI:**
```bash
gh api repos/YOUR_USERNAME/burlyhab/pages \
  -X POST \
  -f source[branch]=main \
  -f source[path]=/
```

**Step 4: Set Up GitHub Actions for Build & Deploy**

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [ main ]
  workflow_dispatch:

permissions:
  contents: read
  pages: write
  id-token: write

concurrency:
  group: "pages"
  cancel-in-progress: false

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build website
        run: npm run build

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v2
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    runs-on: ubuntu-latest
    needs: build
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v3
```

**Step 5: Verify Deployment**

Your site will be available at:
```
https://YOUR_USERNAME.github.io/burlyhab/
```

Or if using a custom domain:
```
https://www.chrishaberle.com
```

#### GitHub Pages Configuration

**For Jekyll (Alternative to Vite):**

If you prefer Jekyll for easier maintenance:

**_config.yml:**
```yaml
title: Dr. Christopher Haberle
description: Research Professor, Planetary Science
url: "https://YOUR_USERNAME.github.io"
baseurl: "/burlyhab"

# GitHub Pages settings
plugins:
  - jekyll-seo-tag
  - jekyll-sitemap
  - jekyll-feed

# Exclude from build
exclude:
  - node_modules
  - package.json
  - README.md
  - src/
  - scripts/
```

**Gemfile:**
```ruby
source "https://rubygems.org"

gem "github-pages", group: :jekyll_plugins
gem "webrick"

group :jekyll_plugins do
  gem "jekyll-seo-tag"
  gem "jekyll-sitemap"
  gem "jekyll-feed"
end
```

---

### Option 2: Vercel

Vercel offers excellent performance and is free for personal projects:

**Pros:**
- Automatic deployments from Git
- Edge network (fast globally)
- Built-in image optimization
- Serverless functions (if needed later)
- Great developer experience

**Setup:**
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel

# Production deployment
vercel --prod
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "cleanUrls": true,
  "trailingSlash": false
}
```

---

### Option 3: Netlify

Similar to Vercel, excellent for static sites:

**Pros:**
- Drag-and-drop deployment
- Form handling built-in
- Split testing capabilities
- Asset optimization

**Setup:**
1. Sign up at netlify.com
2. Connect GitHub repository
3. Configure build:
   - Build command: `npm run build`
   - Publish directory: `dist`

**netlify.toml:**
```toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

---

### Comparison Table

| Feature | GitHub Pages | Vercel | Netlify |
|---------|--------------|--------|---------|
| **Cost** | Free | Free (personal) | Free (personal) |
| **Custom Domain** | ✅ Free | ✅ Free | ✅ Free |
| **SSL Certificate** | ✅ Automatic | ✅ Automatic | ✅ Automatic |
| **Build Time** | ~3-5 min | ~1-2 min | ~1-2 min |
| **CDN** | ✅ Global | ✅ Edge Network | ✅ Global |
| **Deploy on Git Push** | ✅ | ✅ | ✅ |
| **Jekyll Native** | ✅ Yes | ❌ No | ❌ No |
| **Image Optimization** | ❌ Manual | ✅ Built-in | ✅ Built-in |
| **Analytics** | ❌ Use GA | ✅ Built-in | ✅ Built-in |
| **Serverless Functions** | ❌ No | ✅ Yes | ✅ Yes |
| **Form Handling** | ❌ No | ❌ No | ✅ Yes |

**Recommendation: GitHub Pages** for simplicity and zero cost with custom domain.

---

## Domain Configuration with Squarespace

You mentioned you have a paid domain with Squarespace. Here's how to connect it to your GitHub Pages site.

### Understanding the Setup

**Current Situation:**
- Domain registered/managed with Squarespace
- Want to host website on GitHub Pages
- Need to point Squarespace domain to GitHub Pages

**Two Configuration Options:**

1. **Root Domain** (e.g., `chrishaberle.com`)
2. **Subdomain** (e.g., `www.chrishaberle.com`)

Both can work; most common is to use both (with one redirecting to the other).

---

### Step-by-Step: Connect Squarespace Domain to GitHub Pages

#### Part 1: Configure GitHub Pages for Custom Domain

**Step 1: Add Custom Domain to GitHub Pages**

1. Go to your repository on GitHub
2. Navigate to Settings → Pages
3. Under "Custom domain", enter your domain:
   - `chrishaberle.com` (or whatever your domain is)
4. Click "Save"
5. Check "Enforce HTTPS" (wait until DNS propagates first)

**Step 2: Add CNAME File to Repository**

Create a file named `CNAME` (no extension) in your repository root:

```bash
# Create CNAME file
echo "chrishaberle.com" > CNAME

# Commit and push
git add CNAME
git commit -m "Add custom domain configuration"
git push
```

**Or for www subdomain:**
```bash
echo "www.chrishaberle.com" > CNAME
```

---

#### Part 2: Configure DNS in Squarespace

**Step 1: Access Squarespace DNS Settings**

1. Log in to Squarespace
2. Go to Settings → Domains
3. Click on your domain
4. Click "DNS Settings" or "Advanced Settings"

**Step 2: Configure DNS Records**

You need to add specific DNS records depending on your choice:

**Option A: Apex Domain (chrishaberle.com)**

Add these **A Records**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

And add a **CNAME** for www subdomain:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR_USERNAME.github.io | 3600 |

**Option B: WWW Subdomain (www.chrishaberle.com)**

Add a **CNAME Record**:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR_USERNAME.github.io | 3600 |

And add **A Records** for apex domain to redirect:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

**Step 3: Remove Conflicting Records**

⚠️ **IMPORTANT:** Remove any existing A records or CNAME records that point to Squarespace servers:
- Remove A records pointing to Squarespace IPs
- Remove CNAME pointing to `ext-cust.squarespace.com`
- Remove any @ CNAME records (not allowed with A records)

**Step 4: Save DNS Changes**

Click "Save" or "Apply" to commit DNS changes.

---

#### Part 3: Verify and Test

**DNS Propagation Time:**
- DNS changes can take 24-48 hours to fully propagate
- Often works within 1-4 hours
- Use https://dnschecker.org to monitor propagation

**Verification Steps:**

1. **Check DNS resolution:**
```bash
# Check A records
dig chrishaberle.com +short

# Should return GitHub Pages IPs:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153

# Check CNAME
dig www.chrishaberle.com +short

# Should return:
# YOUR_USERNAME.github.io
```

2. **Test in browser:**
   - Visit http://chrishaberle.com (may take time)
   - Visit http://www.chrishaberle.com
   - Both should load your GitHub Pages site

3. **Enable HTTPS in GitHub:**
   - Once DNS propagates (can take up to 24 hours)
   - Go back to GitHub Settings → Pages
   - Check "Enforce HTTPS"
   - GitHub will automatically provision SSL certificate

---

### Squarespace DNS Configuration Screenshots Guide

Since I can't show screenshots, here's a text guide for finding settings in Squarespace:

**Path to DNS Settings:**
```
Squarespace Dashboard
└── Settings (gear icon)
    └── Domains
        └── [Your Domain Name]
            └── DNS Settings (or Advanced Settings)
                └── Add Record / Edit Records
```

**In the DNS Settings interface, you'll see:**
- List of existing DNS records
- Button to "Add Record" or "+"
- Options to Edit or Delete existing records

**For each A Record:**
1. Click "Add Record"
2. Type: Select "A"
3. Host: Enter "@" (represents root domain)
4. Points To: Enter one of the GitHub IPs
5. TTL: Leave default or set to 3600
6. Click "Save"

**For CNAME Record:**
1. Click "Add Record"
2. Type: Select "CNAME"
3. Host: Enter "www"
4. Points To: Enter "YOUR_USERNAME.github.io"
5. TTL: Leave default or set to 3600
6. Click "Save"

---

### Troubleshooting Common Issues

#### Issue 1: "Domain Not Verified" in GitHub

**Cause:** DNS not propagated yet or misconfigured

**Solution:**
1. Wait 1-4 hours for DNS propagation
2. Verify DNS records are correct (use `dig` command)
3. Ensure CNAME file in repository matches domain
4. Try removing and re-adding custom domain in GitHub settings

#### Issue 2: "Certificate Error" or "Not Secure"

**Cause:** HTTPS not enabled or SSL certificate not issued yet

**Solution:**
1. Wait for DNS to fully propagate (can take 24 hours)
2. GitHub needs to verify domain ownership before issuing SSL
3. Don't check "Enforce HTTPS" until domain is verified
4. Once verified, enable HTTPS and wait ~1 hour for certificate

#### Issue 3: "404 - File Not Found"

**Cause:** CNAME file missing or wrong baseurl in Jekyll

**Solution:**
1. Ensure CNAME file exists in repository root
2. Check Jekyll _config.yml has correct url and baseurl:
   ```yaml
   url: "https://chrishaberle.com"
   baseurl: ""  # Empty for custom domain
   ```
3. Rebuild and redeploy site

#### Issue 4: CSS/JS Not Loading

**Cause:** Incorrect baseurl or absolute paths

**Solution:**
1. Use relative paths: `./css/main.css` or `/css/main.css`
2. For Jekyll, use: `{{ '/css/main.css' | relative_url }}`
3. Check browser console for 404 errors
4. Verify files exist in dist/build output

#### Issue 5: Squarespace Won't Let Me Change DNS

**Cause:** Domain might be on Squarespace hosting plan

**Solution:**
1. Ensure domain is in "Transfer" or "External" mode
2. You may need to "disconnect" domain from Squarespace site first:
   - Settings → Domains → Click domain → "Disconnect Domain"
   - This keeps registration with Squarespace but allows external hosting
3. Contact Squarespace support if stuck

---

### Alternative: Use Squarespace DNS with Redirects

If you have trouble with DNS configuration, alternative approach:

**Option: Keep Squarespace as DNS Provider, Use URL Redirect**

1. Keep domain registered with Squarespace
2. Use Squarespace's built-in URL redirect feature
3. Redirect chrishaberle.com → YOUR_USERNAME.github.io

**Pros:**
- Simpler setup
- No DNS configuration needed
- Works immediately

**Cons:**
- URL shows github.io domain (not clean)
- Not a true custom domain setup
- No SSL on your custom domain

**How to Set Up Redirect in Squarespace:**
1. Settings → Domains
2. Click on your domain
3. Look for "Domain Forwarding" or "URL Redirect"
4. Enter destination: `https://YOUR_USERNAME.github.io/burlyhab`
5. Save

**This is NOT recommended** for professional academic site. Use proper DNS configuration instead.

---

### DNS Configuration Reference

**GitHub Pages IP Addresses (A Records):**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**CNAME Value:**
```
YOUR_USERNAME.github.io
```

**Replace YOUR_USERNAME with your actual GitHub username.**

---

### Post-Configuration Checklist

After setting up custom domain:

- [ ] DNS records added in Squarespace
- [ ] CNAME file in repository root
- [ ] Custom domain saved in GitHub Pages settings
- [ ] Wait 1-24 hours for DNS propagation
- [ ] Verify with `dig` command
- [ ] Test domain in browser
- [ ] Enable "Enforce HTTPS" in GitHub
- [ ] Wait for SSL certificate (up to 1 hour)
- [ ] Test HTTPS works correctly
- [ ] Update any hardcoded URLs in website
- [ ] Update sitemap.xml with new domain
- [ ] Submit new sitemap to Google Search Console

---

### Recommended Final DNS Configuration

**Assuming your domain is `chrishaberle.com`:**

**In Squarespace DNS Settings:**

| Type | Host/Name | Value/Points To | TTL |
|------|-----------|-----------------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |
| CNAME | www | YOUR_USERNAME.github.io | 3600 |

**In your repository:**

**CNAME file contents:**
```
chrishaberle.com
```

**This configuration will:**
- Serve site at both `chrishaberle.com` and `www.chrishaberle.com`
- Automatically provision SSL certificate
- Redirect www to non-www (or vice versa, depending on GitHub settings)

---

## Technical Specifications

### Browser Support Target

| Browser | Min Version | Market Share |
|---------|-------------|--------------|
| Chrome | 90+ | 65% |
| Firefox | 88+ | 10% |
| Safari | 14+ | 20% |
| Edge | 90+ | 4% |
| Mobile Safari | 14+ | 15% |
| Mobile Chrome | 90+ | 10% |

**Total Coverage:** ~99% of users

### Performance Targets

**Lighthouse Scores (Goals):**
- Performance: 90+
- Accessibility: 95+
- Best Practices: 100
- SEO: 100

**Core Web Vitals:**
- **LCP (Largest Contentful Paint):** < 2.5s
- **FID (First Input Delay):** < 100ms
- **CLS (Cumulative Layout Shift):** < 0.1

**Additional Metrics:**
- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3.5s
- **Total Page Size:** < 2 MB (down from 54.8 MB)
- **Total Requests:** < 30

### Asset Budget

| Asset Type | Current | Target | Savings |
|------------|---------|--------|---------|
| HTML | 124 KB | 100 KB | 19% |
| CSS | 114 KB | 50 KB | 56% |
| JavaScript | 8 KB | 30 KB | -275%* |
| Images | 54.6 MB | 8 MB | 85% |
| Fonts | 0 KB | 100 KB | - |
| **Total** | **54.8 MB** | **8.3 MB** | **85%** |

*JavaScript increases due to modularization, but includes Three.js locally

### Technology Stack

**Frontend:**
- HTML5 (semantic markup)
- CSS3 (Grid, Flexbox, Custom Properties)
- JavaScript ES6+ (modules)
- Three.js (r128 or later)

**Build Tools:**
- Vite 5.x (bundler)
- PostCSS (CSS processing)
- Autoprefixer (vendor prefixes)
- Terser (JS minification)
- cssnano (CSS minification)

**Development:**
- Node.js 20.x LTS
- npm 10.x
- Git 2.40+

**Hosting:**
- GitHub Pages
- Custom domain via Squarespace DNS
- GitHub Actions for CI/CD

**Optional Enhancements:**
- Jekyll 4.x (static site generation)
- Sharp (image processing)
- Imagemin (image optimization)

---

## Next Steps

### Immediate Actions (This Week)

1. **Backup Everything:**
   ```bash
   # Create backup branch
   git checkout -b backup-original
   git push -u origin backup-original
   git checkout main
   ```

2. **Create GitHub Repository:**
   - Follow GitHub setup instructions above
   - Push current code to repository
   - Enable GitHub Pages

3. **Phase 1 Implementation:**
   - Delete unused files
   - Replace box-shadow sprite with SVG
   - Optimize images to WebP
   - Test locally

4. **Initial Deployment:**
   - Push changes to GitHub
   - Verify GitHub Pages deployment
   - Test site at github.io URL

### Short Term (Next 2 Weeks)

1. **Phase 2 Implementation:**
   - Extract all inline CSS
   - Modularize JavaScript
   - Reorganize file structure
   - Test thoroughly

2. **Custom Domain Setup:**
   - Configure Squarespace DNS
   - Add CNAME to repository
   - Test domain connection
   - Enable HTTPS

3. **Performance Testing:**
   - Run Lighthouse audits
   - Measure Core Web Vitals
   - Test on real devices
   - Fix any issues found

### Medium Term (Next Month)

1. **Phase 3 Implementation:**
   - Set up build process
   - Configure Vite/webpack
   - Implement CSS preprocessing
   - Set up CI/CD pipeline

2. **Content Updates:**
   - Review and update all content
   - Remove placeholder text
   - Add structured data (Schema.org)
   - Optimize for SEO

3. **Enhancement Features:**
   - Add search to publications
   - Implement filtering
   - Add analytics (optional)
   - Consider adding blog section

### Long Term (Next 3 Months)

1. **Phase 4 Implementation:**
   - Migrate to Jekyll (optional)
   - Implement data-driven architecture
   - Add advanced features
   - Complete refactoring

2. **Maintenance Plan:**
   - Document update procedures
   - Create content management workflow
   - Set up monitoring
   - Plan regular updates

3. **Growth Features:**
   - Add research blog
   - Implement publication search
   - Add interactive visualizations
   - Consider accessibility improvements

---

## Conclusion

This refactoring plan will transform your website from a functional but unoptimized static site into a modern, performant, and maintainable web presence suitable for an academic professional.

**Key Takeaways:**

1. **Biggest Impact:** Optimizing images (54 MB → 8 MB) will dramatically improve load times
2. **Easiest Win:** Replacing box-shadow sprite with SVG (32 KB → 1 KB)
3. **Best Long-term:** Setting up build process and modular architecture
4. **Recommended Hosting:** GitHub Pages with custom Squarespace domain

**Estimated Total Effort:**
- **Phase 1 (Critical):** 1-2 hours
- **Phase 2 (Important):** 4-6 hours
- **Phase 3 (Valuable):** 6-8 hours
- **Phase 4 (Optional):** 8-10 hours
- **Total:** 19-26 hours

**Expected Results:**
- 85% reduction in page size
- 80% faster load times
- 90+ Lighthouse performance score
- Professional custom domain
- Easy to maintain and update
- Scalable for future growth

---

## Questions or Assistance Needed?

If you need help with any step of this process, I can assist with:

- Writing specific code for any component
- Setting up build configuration
- Troubleshooting DNS issues
- Creating GitHub Actions workflows
- Optimizing specific features
- Implementing any phase of the refactoring

Just let me know which area you'd like to tackle first, and I'll provide detailed implementation guidance!

---

**Document Version:** 1.0
**Last Updated:** October 28, 2025
**Author:** Claude (Anthropic)
**Contact:** Dr. Christopher Haberle

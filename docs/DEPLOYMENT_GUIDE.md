# Deployment Guide: GitHub Pages + Squarespace Domain

**Date:** October 28, 2025
**Target:** Deploy BurlyHab website to GitHub Pages with custom Squarespace domain

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [GitHub Repository Setup](#github-repository-setup)
3. [Build for Production](#build-for-production)
4. [Deploy to GitHub Pages](#deploy-to-github-pages)
5. [Configure Squarespace Domain](#configure-squarespace-domain)
6. [Verify Deployment](#verify-deployment)
7. [Troubleshooting](#troubleshooting)

---

## Prerequisites

### What You Need

- [x] GitHub account
- [x] Git installed locally
- [x] Repository built successfully (`npm run build`)
- [x] Squarespace domain purchased
- [ ] GitHub repository created (we'll do this)

---

## GitHub Repository Setup

### Step 1: Create GitHub Repository

1. Go to https://github.com/new
2. **Repository name:** `burlyhab` (or your preferred name)
3. **Description:** "Dr. Christopher Haberle's Academic Portfolio Website"
4. **Visibility:** Public (required for free GitHub Pages)
5. **DO NOT** initialize with README (we have one)
6. Click **"Create repository"**

### Step 2: Initialize Git (If Not Already Done)

```bash
cd /Users/chaberle/Documents/GitHab/burlyhab

# Check if git is already initialized
git status

# If not initialized, run:
git init
git branch -M main
```

### Step 3: Add Remote Repository

```bash
# Replace YOUR_USERNAME with your GitHub username
git remote add origin https://github.com/YOUR_USERNAME/burlyhab.git

# Verify remote is added
git remote -v
```

### Step 4: Initial Commit

```bash
# Stage all files
git add .

# Create initial commit
git commit -m "Initial commit: Complete website with Phases 1-4

- Phase 1: Asset optimization (54MB → 3.8MB)
- Phase 2: Code organization (modular CSS/JS)
- Phase 3: Build infrastructure (Vite)
- Phase 4: Architecture improvements (JSON data, error handling)
- Cleanup: Organized docs, removed duplicates

🤖 Generated with Claude Code"

# Push to GitHub
git push -u origin main
```

---

## Build for Production

### Step 1: Update Vite Config for GitHub Pages

The base path needs to match your repository name.

**Edit `vite.config.js`:**

```javascript
export default defineConfig({
  root: '.',
  base: '/burlyhab/',  // 👈 Change this to match your repo name
  // ... rest of config
});
```

**If using custom domain:** Set `base: '/'`

### Step 2: Build Production Files

```bash
npm run build
```

**Output:** `dist/` folder with optimized production files

### Step 3: Test Production Build Locally

```bash
npm run preview
```

Visit http://localhost:4173 to verify everything works.

---

## Deploy to GitHub Pages

### Option A: Manual Deploy (Quick & Simple)

#### Step 1: Install gh-pages Package

```bash
npm install -D gh-pages
```

#### Step 2: Add Deploy Script to package.json

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "optimize-images": "python3 scripts/optimize_images.py && python3 scripts/optimize_project_images.py",
    "deploy": "vite build && gh-pages -d dist"
  }
}
```

#### Step 3: Deploy

```bash
npm run deploy
```

This will:
1. Build your site
2. Create/update `gh-pages` branch
3. Push `dist/` contents to GitHub Pages

---

### Option B: GitHub Actions (Automated)

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches:
      - main

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4

      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build

      - name: Setup Pages
        uses: actions/configure-pages@v4

      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: './dist'

      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

**Commit and push:**

```bash
git add .github/workflows/deploy.yml
git commit -m "Add GitHub Actions deployment workflow"
git push
```

---

## Configure GitHub Pages Settings

### Step 1: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings** → **Pages** (left sidebar)
3. Under **Source**:
   - **Branch:** `gh-pages` (if using Option A)
   - **Branch:** `main` (if using Option B with Actions)
   - **Folder:** `/ (root)` or `/dist` depending on method
4. Click **Save**

### Step 2: Wait for Deployment

- First deployment takes 2-5 minutes
- Check **Actions** tab for progress
- Site will be available at: `https://YOUR_USERNAME.github.io/burlyhab/`

---

## Configure Squarespace Domain

### What You'll Do

Point your Squarespace domain to GitHub Pages using DNS records.

### Step 1: Get Your GitHub Pages Domain

Your site will be at one of these:
- **Without custom domain:** `https://YOUR_USERNAME.github.io/burlyhab/`
- **With custom domain:** `https://your-domain.com`

### Step 2: Log into Squarespace

1. Go to https://account.squarespace.com/
2. Navigate to **Domains**
3. Click on your domain (e.g., `yourname.com`)

### Step 3: Configure DNS Records

Click **DNS Settings** and add these records:

#### For Apex Domain (yourname.com)

Add **4 A Records** pointing to GitHub Pages IPs:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| A | @ | 185.199.108.153 | 3600 |
| A | @ | 185.199.109.153 | 3600 |
| A | @ | 185.199.110.153 | 3600 |
| A | @ | 185.199.111.153 | 3600 |

#### For www Subdomain (www.yourname.com)

Add **1 CNAME Record**:

| Type | Host | Value | TTL |
|------|------|-------|-----|
| CNAME | www | YOUR_USERNAME.github.io | 3600 |

**Example:**
If your GitHub username is `chaberle`, the CNAME value is `chaberle.github.io`

### Step 4: Remove Conflicting Records

**Important:** Delete any existing A or CNAME records for `@` or `www` that point to Squarespace servers.

### Step 5: Save DNS Changes

Click **Save** in Squarespace DNS settings.

**Note:** DNS propagation takes 24-48 hours (usually faster, ~1-6 hours)

---

## Configure Custom Domain in GitHub

### Step 1: Add Custom Domain to GitHub Pages

1. Go to your GitHub repository
2. **Settings** → **Pages**
3. Under **Custom domain**, enter: `yourname.com`
4. Click **Save**

GitHub will:
- Create a `CNAME` file in your repo
- Verify DNS configuration
- Issue SSL certificate (automatic)

### Step 2: Enable HTTPS

1. Wait for DNS verification (shows green checkmark)
2. Check **"Enforce HTTPS"** checkbox
3. GitHub will automatically provision SSL certificate

**Note:** SSL may take 10-20 minutes after DNS verification

### Step 3: Update Vite Config for Custom Domain

**Edit `vite.config.js`:**

```javascript
export default defineConfig({
  root: '.',
  base: '/',  // 👈 Change to root for custom domain
  // ... rest of config
});
```

**Rebuild and redeploy:**

```bash
npm run deploy
```

---

## Verify Deployment

### Checklist

- [ ] Site loads at GitHub Pages URL
- [ ] All pages accessible (index, asteroid, publications, 404)
- [ ] Images display correctly
- [ ] 3D visualization works
- [ ] Publication search functions
- [ ] No console errors
- [ ] Custom domain resolves (after DNS propagation)
- [ ] HTTPS works (green padlock)

### Test URLs

```bash
# GitHub Pages URL
https://YOUR_USERNAME.github.io/burlyhab/

# Custom domain (after DNS setup)
https://yourname.com
https://www.yourname.com
```

### Check DNS Propagation

Use online tools:
- https://dnschecker.org/
- Enter your domain
- Check if A records point to GitHub IPs
- Check if CNAME points to your GitHub Pages

---

## Troubleshooting

### Issue: Site Shows 404

**Causes:**
1. Base path in `vite.config.js` doesn't match repo name
2. GitHub Pages not enabled
3. Wrong branch selected

**Solutions:**
1. Update `base: '/burlyhab/'` to match your repo name exactly
2. Rebuild: `npm run build`
3. Redeploy: `npm run deploy`
4. Check Settings → Pages is configured correctly

---

### Issue: Images Not Loading

**Causes:**
1. Incorrect base path
2. Absolute paths in HTML instead of relative

**Solutions:**
1. Ensure `base` in `vite.config.js` is correct
2. Vite should handle paths automatically
3. Check browser console for 404 errors on image files

---

### Issue: Custom Domain Not Working

**Causes:**
1. DNS not propagated yet
2. DNS records incorrect
3. CNAME file missing from repo

**Solutions:**

**Check DNS propagation:**
```bash
dig yourname.com
dig www.yourname.com
```

**Verify A records:**
```bash
dig yourname.com +short
# Should show:
# 185.199.108.153
# 185.199.109.153
# 185.199.110.153
# 185.199.111.153
```

**Verify CNAME:**
```bash
dig www.yourname.com +short
# Should show:
# YOUR_USERNAME.github.io
```

**Wait:** DNS changes can take up to 48 hours

---

### Issue: HTTPS Not Working

**Causes:**
1. DNS not fully propagated
2. SSL certificate not issued yet
3. "Enforce HTTPS" enabled too early

**Solutions:**
1. Wait for DNS to fully propagate
2. Uncheck "Enforce HTTPS", wait 10 minutes, re-check
3. Try again in 1-2 hours

---

### Issue: Squarespace DNS Not Saving

**Causes:**
1. Active Squarespace website on domain
2. Domain not fully transferred to you
3. Browser cache

**Solutions:**
1. Cancel any active Squarespace sites using this domain
2. Verify domain ownership in Squarespace account
3. Try different browser or clear cache
4. Contact Squarespace support if needed

---

## Post-Deployment Maintenance

### Updating the Site

#### Method 1: Using npm deploy script

```bash
# Make changes to your code
npm run build      # Test build
npm run preview    # Test locally
npm run deploy     # Deploy to GitHub Pages
```

#### Method 2: Git push (if using GitHub Actions)

```bash
git add .
git commit -m "Update: description of changes"
git push
# GitHub Actions will automatically build and deploy
```

### Regular Maintenance

**Monthly:**
- Check for npm package updates: `npm outdated`
- Update dependencies: `npm update`
- Rebuild and test: `npm run build`

**Quarterly:**
- Review and update publications JSON
- Check for broken links
- Test on different browsers/devices

---

## Complete Deployment Script

Save this as `deploy.sh` in your project root:

```bash
#!/bin/bash

echo "🚀 Starting deployment to GitHub Pages..."

# Build the site
echo "📦 Building production bundle..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed!"
    exit 1
fi

# Deploy
echo "🌐 Deploying to GitHub Pages..."
gh-pages -d dist

if [ $? -eq 0 ]; then
    echo "✅ Deployment successful!"
    echo "🌍 Site will be live in 1-2 minutes at:"
    echo "   https://YOUR_USERNAME.github.io/burlyhab/"
else
    echo "❌ Deployment failed!"
    exit 1
fi
```

**Make executable:**
```bash
chmod +x deploy.sh
```

**Run:**
```bash
./deploy.sh
```

---

## DNS Configuration Cheat Sheet

### Squarespace DNS Settings

```
Type    Host    Points To                  TTL
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
A       @       185.199.108.153            3600
A       @       185.199.109.153            3600
A       @       185.199.110.153            3600
A       @       185.199.111.153            3600
CNAME   www     YOUR_USERNAME.github.io.   3600
```

**Note:** The trailing dot (.) in CNAME is important!

---

## Timeline

### Immediate (0-10 minutes)
- Create GitHub repository
- Initial git commit and push
- Install gh-pages package
- First deployment

### Short Term (10-60 minutes)
- GitHub Pages site live
- Test all functionality
- Configure custom domain in GitHub
- Update Squarespace DNS

### Medium Term (1-6 hours)
- DNS starts propagating
- Some users can access via custom domain
- SSL certificate provisioning begins

### Long Term (6-48 hours)
- DNS fully propagated worldwide
- HTTPS fully enabled
- Custom domain working globally

---

## Summary Checklist

### GitHub Setup
- [ ] Create GitHub repository
- [ ] Initialize git locally
- [ ] Add remote origin
- [ ] Make initial commit
- [ ] Push to GitHub

### Build Configuration
- [ ] Update `base` in vite.config.js
- [ ] Run `npm run build` successfully
- [ ] Test with `npm run preview`

### Deploy to GitHub Pages
- [ ] Install gh-pages package
- [ ] Add deploy script to package.json
- [ ] Run `npm run deploy`
- [ ] Enable GitHub Pages in settings
- [ ] Verify site loads at GitHub URL

### Custom Domain Setup
- [ ] Log into Squarespace
- [ ] Add A records for apex domain
- [ ] Add CNAME record for www subdomain
- [ ] Remove conflicting DNS records
- [ ] Add custom domain in GitHub Pages settings
- [ ] Enable HTTPS
- [ ] Wait for DNS propagation
- [ ] Verify custom domain works

### Final Verification
- [ ] Site loads on custom domain
- [ ] HTTPS working (green padlock)
- [ ] All pages accessible
- [ ] Images load correctly
- [ ] 3D visualization works
- [ ] Publication search works
- [ ] No console errors

---

## Need Help?

### Resources

**GitHub Pages Documentation:**
https://docs.github.com/en/pages

**Squarespace DNS Help:**
https://support.squarespace.com/hc/en-us/articles/205812378

**Vite Deployment Guide:**
https://vitejs.dev/guide/static-deploy.html

**DNS Checker:**
https://dnschecker.org/

### Common Questions

**Q: Can I use a subdomain instead of apex domain?**
A: Yes! Use CNAME record: `subdomain.yourname.com` → `YOUR_USERNAME.github.io`

**Q: How long until my site is live?**
A: GitHub Pages: 2-5 minutes. Custom domain: 1-48 hours (DNS)

**Q: Is GitHub Pages free?**
A: Yes, for public repositories with unlimited bandwidth.

**Q: Can I use HTTPS with custom domain?**
A: Yes, GitHub provides free SSL certificates automatically.

**Q: What if I make a mistake?**
A: Just redeploy! `npm run deploy` overwrites the gh-pages branch.

---

## Quick Start Commands

```bash
# 1. Install deployment tool
npm install -D gh-pages

# 2. Add deploy script to package.json
# (See "Deploy to GitHub Pages" section)

# 3. Deploy!
npm run deploy

# 4. Configure domain
# (Follow Squarespace DNS section)

# 5. Enjoy! 🎉
```

---

**Last Updated:** October 28, 2025
**Status:** Ready for Deployment
**Estimated Time:** 30 minutes (+ DNS propagation)

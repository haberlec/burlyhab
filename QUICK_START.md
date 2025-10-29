# Quick Start: Deploy to GitHub Pages

## Step-by-Step Deployment

### 1. Update Vite Config (One Time)

Edit `vite.config.js` - change the `base` value:

**For repository path (burlyhab):**
```javascript
base: '/burlyhab/',
```

**For custom domain:**
```javascript
base: '/',
```

### 2. Install Deployment Tool

```bash
npm install -D gh-pages
```

### 3. Add Deploy Script

Add to `package.json` scripts:

```json
"deploy": "vite build && gh-pages -d dist"
```

### 4. Deploy to GitHub

```bash
npm run deploy
```

That's it! Your site will be live at:
`https://YOUR_USERNAME.github.io/burlyhab/`

---

## Squarespace Domain Setup

### In Squarespace DNS Settings:

**Add these A Records (for yourname.com):**
```
185.199.108.153
185.199.109.153
185.199.110.153
185.199.111.153
```

**Add CNAME Record (for www.yourname.com):**
```
www → YOUR_USERNAME.github.io
```

### In GitHub Repository Settings → Pages:

1. Add custom domain: `yourname.com`
2. Wait for DNS check (green checkmark)
3. Enable "Enforce HTTPS"

**Wait:** 1-24 hours for DNS propagation

---

## Daily Development

```bash
# Start dev server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview

# Deploy to GitHub Pages
npm run deploy
```

---

## Full Guide

See [docs/DEPLOYMENT_GUIDE.md](docs/DEPLOYMENT_GUIDE.md) for complete instructions.

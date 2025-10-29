# Academic Personal Webpage

A clean, professional personal webpage template for academic researchers and professors. Built with simple HTML, CSS, and JavaScript for easy customization and hosting on GitHub Pages.

## Features

- Responsive design that works on all devices
- Sections for About, Research, Publications, Teaching, and Contact
- Smooth scrolling navigation
- Professional academic styling
- Easy to customize
- No build process required

## Setup Instructions

### 1. Customize Your Content

Edit `index.html` and replace the placeholder content:

- Replace `[Your Name]` with your actual name
- Replace `[University]`, `[Department Name]` with your institution details
- Add your bio, research interests, and current projects
- Add your publications (consider linking to Google Scholar)
- Add your teaching information
- Update contact information
- Add links to your academic profiles (Google Scholar, ResearchGate, ORCID, etc.)

### 2. Add Your Profile Photo

- Add a profile photo named `profile.jpg` to the root directory
- Recommended size: 400x400 pixels or larger (will be displayed as 200x200)
- Square format works best

### 3. Test Locally

Open `index.html` in your web browser to preview your site locally.

### 4. Deploy to GitHub Pages

#### Option A: New Repository

1. Create a new GitHub repository named `username.github.io` (replace `username` with your GitHub username)
2. Initialize git in this directory:
   ```bash
   git init
   git add .
   git commit -m "Initial commit: Academic personal webpage"
   ```
3. Connect to GitHub and push:
   ```bash
   git remote add origin https://github.com/username/username.github.io.git
   git branch -M main
   git push -u origin main
   ```
4. Your site will be live at `https://username.github.io`

#### Option B: Project Repository

1. Create a new GitHub repository with any name (e.g., `personal-website`)
2. Follow steps 2-3 from Option A, but use your repository URL
3. Go to repository Settings → Pages
4. Under "Source", select the `main` branch
5. Your site will be live at `https://username.github.io/repository-name`

### 5. Connect Your Custom Domain

1. In your repository, go to Settings → Pages
2. Under "Custom domain", enter your domain (e.g., `yourname.com`)
3. In your domain registrar (where you purchased your domain):
   - Add a CNAME record pointing to `username.github.io`
   - Or add A records pointing to GitHub's IP addresses:
     - 185.199.108.153
     - 185.199.109.153
     - 185.199.110.153
     - 185.199.111.153
4. Check "Enforce HTTPS" in GitHub Pages settings (may take a few minutes)

Detailed instructions: https://docs.github.com/en/pages/configuring-a-custom-domain-for-your-github-pages-site

## Customization Tips

### Colors
Edit `styles.css` to change the color scheme. Main colors used:
- Primary: `#3498db` (blue)
- Dark: `#2c3e50` (dark blue-gray)
- Light background: `#f8f9fa`

### Layout
All sections are in `index.html`. You can:
- Reorder sections by moving the `<section>` blocks
- Remove sections you don't need
- Add new sections following the same pattern

### Adding More Pages
Create additional HTML files (e.g., `publications.html`, `cv.html`) and link to them from the navigation.

## File Structure

```
.
├── index.html          # Main webpage content
├── styles.css          # Styling and layout
├── script.js           # Interactive features
├── profile.jpg         # Your profile photo (add this)
└── README.md           # This file
```

## Support

For GitHub Pages documentation: https://docs.github.com/en/pages

## License

Free to use and modify for your personal academic webpage.

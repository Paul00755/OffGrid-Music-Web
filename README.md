# OffGrid Music — Official Showcase Website

A fast, responsive, scroll-animated showcase website for **OffGrid Music** with Dark/Light mode, category-filtered 15-layout UI Studio, dual-language Live Lyrics Widget videos, 14-question categorized FAQ, and email support (`offgridmusicsupport@gmail.com`). Built to live in its own **separate private GitHub repository** and deploy directly to **Cloudflare Pages** with zero build step.

## Quick Local Preview

Unzip the project folder and run any local static server:

```bash
# Option 1: Python 3
python3 -m http.server 8000
# Open http://localhost:8000

# Option 2: Node.js
npx serve .

# Option 3: VS Code
# Right-click index.html -> "Open with Live Server"
```

## Pre-Configured Links

- **GitHub App Repo & Live Releases APK:** `https://github.com/Paul00755/OffGrid-Music`
- **Buy Me a Coffee:** `https://buymeacoffee.com/paulrajmes9`
- **Support Email:** `offgridmusicsupport@gmail.com`

## Before You Go Live (1 Quick Edit)

Once Cloudflare Pages assigns your live `*.pages.dev` or custom domain URL, replace `https://offgrid-music.pages.dev` in `index.html` (`canonical`, `og:url`, `og:image`), `robots.txt`, and `sitemap.xml`.

## Deploying to Cloudflare Pages from a Private GitHub Repo

1. Create a **new Private GitHub repository** (e.g. `Paul00755/offgrid-music-web`) so your website code stays separate from the public `Paul00755/OffGrid-Music` app repo.
2. Push this folder:
   ```bash
   git init
   git add .
   git commit -m "OffGrid Music showcase website"
   git branch -M main
   git remote add origin https://github.com/Paul00755/offgrid-music-web.git
   git push -u origin main
   ```
3. In **Cloudflare Dashboard → Workers & Pages → Create → Pages → Connect to Git**, pick your private `offgrid-music-web` repo.
4. Set **Framework preset:** `None`, **Build command:** *(empty)*, **Build output directory:** `.` and click **Save and Deploy**.

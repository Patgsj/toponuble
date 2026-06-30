# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project overview

Static HTML website for a topography/surveying service business in Chile's Ñuble region. No build step — files are served directly. PHP is used only for contact form handlers.

## Dev commands

```bash
npm run dev        # http-server on port 3000, opens browser
```

VS Code Live Server is configured on port 5504 (`.vscode/settings.json`). Either works for local development.

## Deployment

Push to `main` → GitHub Actions (`.github/workflows/deploy.yml`) deploys via FTP to shared hosting. The workflow excludes `.git/`, `node_modules/`, `.vscode/`, and `package*.json`. No build step is needed before deploying.

## Architecture

**No bundler, no framework, no build pipeline.** All HTML, CSS, and JS is authored directly.

### Pages
- `index.html` — single-page site; all sections (#inicio, #servicios, #valores, #proceso, #nosotros, #cobertura, #faq, #blog, #contacto) are in one file
- `blog/*.html` — individual blog article pages

### Partial system
Nav and footer are shared via a custom client-side loader (`partials/load.js`). Pages include:
```html
<div id="nav-placeholder"></div>
<footer id="footer-placeholder"></footer>
<script src="../partials/load.js"></script>
```
`load.js` fetches `partials/nav.html` and `partials/footer.html`, replaces template variables (`{{LOGO_HREF}}`, `{{NAV_HREF}}`, `{{ASSETS}}`), and injects them. Path resolution differs between root (`index.html`) and subdirectory pages (`blog/*.html`) — the loader handles this automatically via a `SITE_ROOT` heuristic. Always edit the partials themselves, never the injected output.

### CSS
Tailwind CSS v3 is loaded via CDN. Custom tokens (colors, fonts) are defined in a `tailwind.config` script block in each page's `<head>`. One-off styles live in a `<style>` tag in `<head>`. There are no external `.css` files.

Custom Tailwind tokens:
- Colors: `ink` (dark bg), `gold` (brand yellow `#F5C500`), `snow` (off-white), `zinc1–3` (grays)
- Fonts: `DM Sans` (sans), `DM Mono` (mono) via Google Fonts

### PHP
`contacto.php` and `send.php` handle POST requests from contact/quote forms. They are standalone handlers with no shared logic.

### Apache
`.htaccess` handles HTTP→HTTPS redirect and hides `.html` extensions via rewrite rules. This is for the shared hosting environment only; it doesn't affect local dev.

### PWA
`manifest.json` defines the PWA shell. Icons are at `img/favicon.png` (and 512px variant).

## Adding blog articles

New articles go in `blog/`. Copy an existing article as a starting point — it must include the partial loader pointing one level up (`../partials/load.js`) and structured Schema.org JSON-LD. Update `sitemap.xml` after adding new pages.

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Illinois Shuffleboard Association website built with Hugo (v0.143.1) static site generator and Tailwind CSS v3. The site is deployed to https://www.illinoisshuffleboard.org via Netlify.

## Development Commands

### Initial Setup
```bash
npm install              # Install Tailwind and PostCSS dependencies
hugo server -D           # Start development server with drafts at http://localhost:1313
```

The development server auto-reloads on file changes.

### Creating Content
```bash
hugo new posts/YYYY-MM-DD-post-title.md    # Create a new post
```

Alternatively, use the GitHub Actions workflow "New Post" via the repository's Actions tab to create posts with templated frontmatter.

## Architecture

### Hugo + Tailwind CSS Integration

The project uses Jonas Duri's technique to integrate Tailwind CSS 3 with Hugo without external npm scripts. Key aspects:

- **Tailwind entry point**: `assets/tw.css` contains Tailwind directives
- **PostCSS processing**: Handled via Hugo Pipes in `layouts/partials/head.html`
- **Development mode**: Uses `ExecuteAsTemplate` with timestamp to force Tailwind regeneration on file changes
- **Production mode**: Minifies, fingerprints, and post-processes CSS

Configuration files:
- `tailwind.config.js`: Scans `layouts/**/*.html`, `content/**/*.md`, `content/**/*.html`
- `postcss.config.js`: Runs Tailwind and Autoprefixer

### Content Structure

**Posts** (`content/posts/*.md`):
- Front matter fields: `title`, `date`, `expiryDate` (optional), `draft`
- Posts automatically expire after `expiryDate` and won't display
- Archetype template in `archetypes/default.md`

**Board Members** (`content/board/*.md`):
- Front matter: `title`, `position`, `order`, `thumbnail`
- Displayed on `/board` page sorted by `order`

**Points Pages** (`content/points/*.md`):
- Front matter: `google_doc` (CSV export URL from Google Sheets)
- Custom layout fetches and displays points data from Google Sheets

**Documents**:
- Static PDFs stored in `content/documents/`
- Includes rules, bylaws, constitution, and tournament docs

### Layouts

**Base template** (`layouts/_default/baseof.html`):
- Sets up the page structure with indigo header, white content card, and footer
- Includes partials: `head.html`, `navbar.html`, `footer.html`

**Partials** (`layouts/partials/`):
- `head.html`: Title, CSS processing, favicon links
- `navbar.html`: Top navigation
- `footer.html`: Site footer

**Content-specific layouts**:
- `layouts/page/`: Page-specific layouts
- `layouts/board/`: Board member display
- `layouts/points/`: Points table rendering from Google Sheets

### Static Assets

- `/static/icon/`: Favicons and app icons
- `/static/img/`: Images including board member photos
- `/static/.well-known/`: Well-known URIs

### Redirects

Managed in `netlify.toml` with 50+ redirect rules for:
- Short links (e.g., `/rules`, `/volunteer`, `/national`)
- League forms and reporting
- External resources (Google Forms, Discord, etc.)
- National tournament resources

Update redirects by editing the `[[redirects]]` sections in `netlify.toml`.

## Key Configuration Files

- `config.toml`: Hugo site configuration (baseURL, title, language)
- `netlify.toml`: Build settings, Hugo version, and all URL redirects
- `.node-version`: Specifies Node.js version (v22.13.1)
- `.github/workflows/new_post.yml`: GitHub Actions workflow to create posts
- `.github/create_blank_post.rb`: Ruby script for post generation

## Deployment

Netlify automatically builds and deploys on push to main branch:
- Build command: `hugo`
- Publish directory: `public/`
- Hugo version: Set in `netlify.toml` under `[build.environment]`

## Content Management Patterns

### Adding a News Post

1. Create file: `content/posts/YYYY-MM-DD-title.md`
2. Add front matter with title, date, optional expiryDate
3. Set `draft: false` when ready to publish
4. Posts automatically appear on homepage and expire after expiryDate

### Updating Points

Edit the `google_doc` URL in the relevant `content/points/YYYY.md` file to point to a new Google Sheets CSV export.

### Adding Board Members

Create `content/board/name.md` with:
- `title`: Full name
- `position`: Board role
- `order`: Display order number
- `thumbnail`: Path to photo in `/static/img/board/`

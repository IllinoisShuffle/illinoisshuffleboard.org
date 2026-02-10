# The Illinois Shuffleboard Association's Website

Our website is built on the [Hugo](https://gohugo.io/) Framework, along with [Tailwind CSS](https://tailwindcss.com/). It is deployed to [https://www.illinoisshuffleboard.org](https://www.illinoisshuffleboard.org) with [Netlify](https://www.netlify.com/).

[![Netlify Status](https://api.netlify.com/api/v1/badges/a2dc1a15-5ed3-4122-a259-834327834bc1/deploy-status)](https://app.netlify.com/sites/ilsa/deploys)

## Development

Requirements:
 * Hugo v0.152.2
 * NodeJS (currently tested with v22.13.1)

### Initial Setup

To spin up a development environment:
 * run `npm install` to install dependencies
 * run `hugo server -D` to generate the site - by default this will regenerate when changes are made
 * visit [http://localhost:1313](http://localhost:1313) to see the site

The development server auto-reloads on file changes.

You can also use [GitHub Codespaces](https://github.com/codespaces) or [VSCode Dev Containers](https://code.visualstudio.com/docs/devcontainers/tutorial) as a development environment.

### Creating Content

To create a new post:
```bash
hugo new posts/YYYY-MM-DD-post-title.md
```

Alternatively, use the Ruby script:
```bash
.github/create_blank_post.rb
```

Or use the GitHub Actions workflow "New Post" via the repository's Actions tab to create posts with templated frontmatter.

## Architecture

### Hugo + Tailwind CSS Integration

The project uses [Jonas Duri's technique](https://dev.to/jonas_duri/how-to-use-tailwindcss-30-without-external-npm-scripts-just-hugo-pipes-2lg9) to integrate Tailwind CSS 3 with Hugo without external npm scripts. Key aspects:

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

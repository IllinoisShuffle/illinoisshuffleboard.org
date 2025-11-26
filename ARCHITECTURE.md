# Architecture Documentation

## Overview

The Illinois Shuffleboard Association website is a static site built with Hugo, styled with Tailwind CSS, and deployed via Netlify. The site provides membership management, event information, tournament points tracking, and organizational documents.

## Technology Stack

- **Static Site Generator:** Hugo v0.143.1 (extended version required for SCSS/PostCSS support)
- **Styling:** Tailwind CSS v3.0.15 with PostCSS
- **Deployment:** Netlify (continuous deployment from GitHub)
- **Payment Processing:** Stripe (for memberships and donations)
- **Data Sources:** Google Sheets (for tournament points via CSV export)
- **Version Control:** GitHub

## Directory Structure

```
.
├── .devcontainer/          # VSCode Dev Container configuration
├── .github/                # GitHub Actions workflows and helper scripts
│   ├── workflows/          # Automated workflows (new posts, rebuilds)
│   └── create_blank_post.rb # Ruby script to generate post templates
├── archetypes/             # Hugo content templates for `hugo new`
│   └── default.md          # Default front matter template
├── assets/                 # Source assets processed by Hugo Pipes
├── content/                # All site content (Markdown and HTML)
│   ├── _index.html         # Homepage content
│   ├── board/              # Board member profiles
│   ├── documents/          # Document listings
│   ├── points/             # Tournament points pages by season
│   ├── posts/              # News/announcements
│   ├── donate.html         # Donation page
│   ├── events.html         # Events calendar
│   ├── join.html           # Membership registration with Stripe
│   └── mailing-list.html   # Email list signup
├── layouts/                # Hugo templates
│   ├── _default/           # Default templates (baseof, single, list)
│   ├── board/              # Board member page templates
│   ├── partials/           # Reusable template components
│   ├── points/             # Points table templates
│   └── index.html          # Homepage template
├── static/                 # Static assets (served as-is)
│   ├── icon/               # Site icons/favicons
│   └── img/                # Images
├── config.toml             # Hugo site configuration
├── netlify.toml            # Netlify deployment & redirect configuration
├── package.json            # Node.js dependencies (Tailwind, PostCSS)
├── postcss.config.js       # PostCSS configuration
├── tailwind.config.js      # Tailwind CSS configuration
└── README.md               # Getting started guide
```

## Hugo Content Model

### Content Organization

Hugo organizes content into sections based on directory structure:

1. **Pages** - Single HTML files in `content/` (e.g., `join.html`, `donate.html`)
2. **Sections** - Directories in `content/` (e.g., `posts/`, `board/`, `points/`)
3. **List Pages** - `_index.md` or `_index.html` files that represent section landing pages

### Content Types

#### Posts (`content/posts/`)
News and announcements with temporal relevance.

**Front Matter:**
```yaml
---
title: "Post Title"
date: 2025-01-22              # Publish date
expiryDate: 2025-02-07        # Optional: hide after this date
draft: false                  # Set to true to hide from production
---
```

#### Board Members (`content/board/`)
Individual profiles for executive board members.

**Front Matter:**
```yaml
---
title: "Member Name"
position: "Board Position"    # e.g., "President", "Vice President"
draft: false
---
```

The `_index.md` provides the board section landing page.

#### Points (`content/points/`)
Tournament points standings by season.

**Front Matter:**
```yaml
---
title: "Points - 2025 Season"
draft: false
menu: "navbar"                # Add to navigation menu
google_doc: "https://..."     # CSV export URL from Google Sheets
sub_title: "2025 Season"
---
```

The Google Sheets CSV is fetched and rendered as a table by the points layout template.

### Front Matter Fields

Common fields used across content:

- `title` - Page/post title
- `date` - Publication date (used for sorting)
- `draft` - Boolean; if true, content is hidden in production builds
- `expiryDate` - Optional; content is automatically hidden after this date
- `menu` - Add to site navigation (e.g., `menu: "navbar"`)
- `weight` - Order in navigation (lower numbers appear first)
- `google_doc` - CSV URL for data import (used in points pages)
- `sub_title` - Additional context text (used in points pages)

## Layout System

### Template Hierarchy

Hugo uses a specific template lookup order. For this site:

1. **baseof.html** - Base template wrapper (if exists)
2. **index.html** - Homepage template (`layouts/index.html`)
3. **single.html** - Single content page template (`layouts/_default/single.html`)
4. **list.html** - Section list page template (`layouts/_default/list.html`)
5. **Section-specific templates** - Override defaults (e.g., `layouts/board/single.html`)

### Key Templates

- **layouts/index.html** - Homepage layout
- **layouts/partials/** - Reusable components (header, footer, navigation)
- **layouts/board/single.html** - Individual board member page layout
- **layouts/points/list.html** - Points table layout with CSV data fetching

### Partials

Partials are reusable template components stored in `layouts/partials/`:

- Navigation bars
- Headers/footers
- Common HTML structures

Include a partial in a template: `{{ partial "partials/header.html" . }}`

## Styling System

### Tailwind CSS Integration

This site uses Tailwind CSS v3 with Hugo Pipes for processing.

**Configuration:**
- `tailwind.config.js` - Tailwind configuration (content paths, plugins)
- `postcss.config.js` - PostCSS plugins (Tailwind + Autoprefixer)

**Content Paths:** Tailwind scans these directories for classes:
```javascript
content: ['./layouts/**/*.html', './content/**/*.md', './content/**/*.html']
```

**Plugins:**
- `@tailwindcss/forms` - Form styling
- `@tailwindcss/typography` - Prose/article styling

### Build Process

1. Hugo processes templates and content
2. PostCSS processes Tailwind directives
3. Autoprefixer adds vendor prefixes
4. Hugo Pipes outputs final CSS

**Note:** There are known issues with Hugo + Tailwind CSS v3. This site uses [Jonas Duri's workaround](https://dev.to/jonas_duri/how-to-use-tailwindcss-30-without-external-npm-scripts-just-hugo-pipes-2lg9).

## Data Flow

### Points System Integration

1. Points data is maintained in Google Sheets
2. Sheet is published as CSV (File → Share → Publish to web → CSV)
3. CSV URL is added to points page front matter (`google_doc` field)
4. Points layout template fetches CSV during build
5. Data is parsed and rendered as an HTML table

**Example:**
```yaml
google_doc: "https://docs.google.com/spreadsheets/d/e/2PACX-.../pub?gid=...&single=true&output=csv"
```

### Stripe Payment Integration

The membership/donation flow (`content/join.html`) integrates Stripe Checkout:

1. User selects membership + optional donation amount
2. JavaScript calculates total and updates UI
3. Checkout button links to pre-configured Stripe Checkout URLs
4. Stripe handles payment processing
5. Stripe sends confirmation emails and manages subscriptions

**Payment Links:** Hardcoded in `join.html` (lines 266-267)
- `prod_data` - Production Stripe Checkout URLs
- `test_data` - Test mode URLs (not used in production)

Each donation amount maps to a specific Stripe Checkout session.

## Deployment

### Netlify Configuration

Configuration is in `netlify.toml`:

**Build Settings:**
```toml
[build]
  command = "hugo"           # Build command
  publish = "public/"        # Output directory

[build.environment]
  HUGO_VERSION = "0.143.1"   # Hugo version to use
```

**Redirects:** 158+ URL redirects for short links (e.g., `/rules`, `/national`, `/duck`)

### Deployment Flow

1. Code is pushed to GitHub (main branch)
2. Netlify detects changes via webhook
3. Netlify runs `hugo` command with specified version
4. Site is built and deployed to CDN
5. Netlify applies redirects from `netlify.toml`

### Scheduled Rebuilds

A GitHub Actions workflow (`netlify.yml`) triggers daily rebuilds at 6:05 AM UTC:

- Ensures expired posts are hidden (via `expiryDate`)
- Updates points data from Google Sheets
- Refreshes any time-sensitive content

## Automation

### GitHub Actions Workflows

#### 1. New Post Workflow (`.github/workflows/new_post.yml`)
- **Trigger:** Manual via GitHub Actions UI
- **Purpose:** Create new post from template
- **Process:**
  1. User provides title, publish date, expiry date
  2. Ruby script generates post file
  3. Commits and pushes to repository
  4. Netlify auto-deploys

#### 2. Rebuild Site Workflow (`.github/workflows/netlify.yml`)
- **Trigger:** Daily at 6:05 AM UTC OR manual
- **Purpose:** Trigger Netlify rebuild without code changes
- **Process:**
  1. Calls Netlify build hook API
  2. Netlify rebuilds and redeploys site
  3. Clears cache for fresh data

### Helper Scripts

**`.github/create_blank_post.rb`**
- Ruby script to generate post files
- Creates properly formatted Markdown with front matter
- Used by new_post workflow

## Development Workflow

### Local Development

1. Clone repository
2. Install dependencies: `npm install`
3. Start Hugo dev server: `hugo server -D`
4. Visit `http://localhost:1313`
5. Hugo auto-reloads on file changes

### Adding Content

**New Post:**
```bash
hugo new posts/YYYY-MM-DD-post-slug.md
```

Or use GitHub Actions "New Post" workflow.

**New Board Member:**
```bash
hugo new board/member-name.md
```

**New Points Season:**
1. Create `content/points/YYYY.md`
2. Add front matter with Google Sheets CSV URL
3. Publish Google Sheet as CSV (File → Share → Publish to web)
4. Update `content/points/_index.md` to link to new season

### Testing Builds

```bash
hugo                          # Build site
hugo server -D                # Serve with drafts
hugo server --disableFastRender  # Full rebuild on each change
```

## Environment Variables

### Netlify Secrets

Set in Netlify dashboard (Site settings → Build & deploy → Environment):

- `NETLIFY_TRIGGER_ID` - Build hook ID for scheduled rebuilds (used by GitHub Actions)

### Stripe Configuration

Stripe Checkout URLs are hardcoded in `content/join.html`. To update:

1. Create Checkout sessions in Stripe Dashboard
2. Update `prod_data` object in `join.html` (line 267)
3. Test with `test_data` URLs before deploying

## Performance Considerations

- **Static Site:** No server-side processing, extremely fast
- **CDN Delivery:** Netlify serves from global CDN
- **Minimal JavaScript:** Only used for Stripe checkout UI
- **Tailwind Purging:** Unused CSS is removed during build
- **Image Optimization:** Consider adding Hugo image processing for large images

## Browser Support

Tailwind CSS supports modern browsers:
- Chrome/Edge (last 2 versions)
- Firefox (last 2 versions)
- Safari (last 2 versions)

## Security

- **Static Site:** No server to compromise
- **Stripe:** PCI compliance handled by Stripe Checkout
- **HTTPS:** Enforced by Netlify
- **Secrets:** Stripe keys managed by Stripe; no sensitive data in repository

## Future Improvements

Potential architectural enhancements:

1. Add Hugo image processing for optimized images
2. Implement content security policy (CSP) headers
3. Add automated testing for build process
4. Consider headless CMS for non-technical content editors
5. Implement structured data (JSON-LD) for SEO
6. Add RSS feed for posts
7. Consider i18n support for multilingual content

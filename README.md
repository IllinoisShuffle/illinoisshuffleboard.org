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

### Local Development with Netlify (Functions + Identity)

This section covers setting up your own personal Netlify account to test the full
Netlify feature set — Identity, Git Gateway, and Functions. Not everything requires
a Netlify account; see the table below.

| What you want to test | Netlify account required? | GitHub write access required? |
|---|---|---|
| Hugo site rendering, content, CSS | No | No |
| Decap CMS (local filesystem only) | No | No |
| Netlify Functions + env vars | Yes (free tier) | No |
| Netlify Identity (login/signup) | Yes — personal site must be deployed | No |
| Git Gateway (CMS writes to GitHub) | Yes | Yes |

---

#### Tier 1: Basic Site (No Netlify Account)

```bash
npm install
hugo server -D
```

Visit [http://localhost:1313](http://localhost:1313). Sufficient for all template,
content, and CSS work.

---

#### Tier 2: Functions + Environment Variables

**One-time setup:**

1. Create a free account at [netlify.com](https://www.netlify.com/).

2. Authenticate the CLI:
   ```bash
   npm install
   npx netlify login
   ```

3. Create a personal Netlify site connected to this repo:
   - Netlify dashboard → "Add new site" → "Import an existing project"
   - Connect GitHub → select `IllinoisShuffle/illinoisshuffleboard.org`
   - Build command: `hugo`, publish directory: `public/`
   - Deploy to any branch (your personal dev branch is safest — see Tier 4)

4. Link your local clone to your personal site:
   ```bash
   npx netlify link
   ```

5. Create your `.env` file using the helper script:
   ```bash
   bash scripts/setup-dev.sh
   ```
   Then fill in the remaining values in `.env`:
   - `STRIPE_SECRET_KEY` — Stripe test key (`sk_test_...`) from [dashboard.stripe.com](https://dashboard.stripe.com/)
   - `RESEND_API_KEY` — from [resend.com](https://resend.com/) (leave blank if not testing email)
   - `SITE_URL` — already set to `http://localhost:8888`

**Running:**
```bash
npm run dev   # starts at http://localhost:8888
```

The `[dev]` section in `netlify.toml` runs `hugo server -D` on port 1313 and
proxies it through port 8888 with Functions support.

---

#### Tier 3: Netlify Identity

Identity is per-site — your personal site has its own Identity instance, completely
separate from production. Your personal site must be deployed at least once before
Identity can initialize locally.

**Enable Identity on your personal site:**

1. Netlify dashboard → your site → Site settings → Identity → Enable Identity
2. Set registration to "Invite only" (recommended) or "Open" for easier testing
3. Identity → Services → Git Gateway → Enable Git Gateway (authorizes GitHub OAuth)

**Create a test user:**

- Identity tab → Invite users → enter your personal email
- Accept the invite, set a password — this is your local test login

**Running:** Same as Tier 2 (`npm run dev`). The Identity widget at `/admin/` and
any Identity-gated pages will authenticate against your personal site's Identity
instance.

---

#### Tier 4: Decap CMS and Git Gateway

> **Branch safety:** `static/admin/config.yml` has `branch: main` hardcoded.
> With Git Gateway enabled, CMS saves commit directly to `main`. If you have write
> access to the repo, test CMS saves can land in production content.

**Recommended: use a personal dev branch for CMS testing**

```bash
git checkout -b dev/your-name
git push origin dev/your-name
```

Then locally edit `static/admin/config.yml` to point at your branch — **do not
commit this change**:
```yaml
backend:
  name: git-gateway
  branch: dev/your-name   # local only, do not commit
```

**Option A — Local filesystem (no GitHub writes, no Identity needed):**

```bash
# Terminal 1
npm run dev

# Terminal 2
npm run cms-proxy   # runs on port 8081
```

Temporarily add `local_backend: true` to your local `static/admin/config.yml`
— **do not commit**:
```yaml
local_backend: true
backend:
  name: git-gateway
  branch: main
```

Visit `http://localhost:8888/admin/` — the CMS reads/writes your local filesystem
with no Identity login required.

**Option B — Full Git Gateway (writes to GitHub, requires Tier 3 + write access):**

Ensure Identity is enabled and Git Gateway is authorized on your personal site,
and that you've set up a personal dev branch above.

Visit `http://localhost:8888/admin/`, log in with your Identity test user, and the
CMS commits via your personal site's Git Gateway to your dev branch.

---

#### Terminal Summary

| Scenario | Terminal 1 | Terminal 2 |
|---|---|---|
| Basic site | `hugo server -D` | — |
| Functions + Identity | `npm run dev` | — |
| CMS (local filesystem) | `npm run dev` | `npm run cms-proxy` |
| CMS (Git Gateway) | `npm run dev` | — |

---

#### Troubleshooting

**"Identity not enabled" at `/admin/`** — Your personal site hasn't been deployed
yet, or Identity isn't enabled. Deploy once via the dashboard, then enable Identity
under Site settings → Identity.

**`netlify link` can't find my site** — Run `npx netlify sites:list` to see your
sites, then `npx netlify link --id SITE_ID`.

**CMS login works but saving fails with a 404** — Git Gateway isn't enabled. Go to
Site settings → Identity → Services → Git Gateway → Enable.

**CMS saves go to `main` instead of my dev branch** — You forgot to update `branch:`
in your local `static/admin/config.yml`. Make the change locally, do not commit.

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

The project uses Hugo's native [`css.TailwindCSS`](https://gohugo.io/functions/css/tailwindcss/) function with Tailwind CSS v4:

- **Tailwind entry point**: `assets/css/main.css` contains Tailwind directives
- **Processing**: Hugo's built-in Tailwind support handles CSS compilation
- **Production mode**: Minifies and fingerprints CSS for cache busting
- **Build stats**: Hugo generates `hugo_stats.json` to track used CSS classes

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

- `config.toml`: Hugo site configuration (baseURL, title, language, build stats)
- `netlify.toml`: Build settings, Hugo version, and all URL redirects
- `.node-version`: Specifies Node.js version (v22.13.1)
- `.github/workflows/new_post.yml`: GitHub Actions workflow to create posts
- `.github/create_blank_post.rb`: Ruby script for post generation
- `assets/css/main.css`: Tailwind CSS entry point

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

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Documentation

For comprehensive project documentation, architecture details, and development workflows, see:

@README.md

## AI-Specific Guidance

### Content Creation Workflow

When creating news posts:
- Use the existing Ruby script at `.github/create_blank_post.rb` which performs validation checks
- Alternatively, suggest using the GitHub Actions "New Post" workflow for consistency
- Follow the naming convention: `content/posts/YYYY-MM-DD-post-title.md`
- Remember to set `draft: false` when the post is ready for publication

### Common Tasks

**Adding redirects**: Edit the `[[redirects]]` sections in `netlify.toml`. The site uses 50+ redirects for short links, league forms, and external resources.

**Updating points data**: Modify the `google_doc` URL in `content/points/YYYY.md` files. These URLs point to Google Sheets CSV exports.

**Managing board members**: Create files in `content/board/` with appropriate front matter (`title`, `position`, `order`, `thumbnail`). The `order` field controls display sequence.

### Key Conventions

- Hugo front matter uses TOML format (enclosed in `+++`)
- Tailwind CSS classes are processed via Hugo Pipes (not external build scripts)
- The site uses Jonas Duri's technique for Tailwind CSS 3 integration
- All content changes trigger automatic Netlify deployments on push to main

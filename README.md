# Static Site Scaffolding

Scaffolding for building a small website with **plain HTML, CSS, and
JavaScript** — no build step, no dependencies — deployed automatically to
GitHub Pages.

This repository contains the conventions and the deploy pipeline. It contains
no website yet: you create the files.

## Quick Start

1. Clone or fork this repository.
2. Enable publishing: **Settings → Pages → Build and deployment →
   Source = GitHub Actions**. Nothing deploys until this is set.
3. Create `index.html` at the repository root, plus the `.css` files you need
   (and `.js` only where a page needs operations). See [AGENTS.md](AGENTS.md)
   for the conventions.
4. Open `index.html` in a browser. No server, no install, no watch process —
   double-clicking the file is the whole local workflow.
5. Push to `main`. The site is live at `https://<user>.github.io/<repo-name>/`
   in about a minute.

## What You Create

The repository root *is* the website — what is in git is byte-for-byte what the
browser receives.

| You create | Purpose |
|---|---|
| `index.html` | Entry point. Required, must sit at the root. |
| further `.html` files | One per page (`about.html`, `contact.html`). Linked with plain relative `<a href>` — no router. |
| `.css` files | Styling. Shared rules in `styles.css`; page-specific rules in a file named after the page. |
| `.js` files | Optional. Operations layered on a page that already works without them. |
| `.csv` / `.md` | Data and content. |

Keep it flat at the root. No `src/`, no nesting, no build output.

## What Is Already Here

```
README.md                    this file
AGENTS.md                    conventions and guardrails
.gitignore
.github/workflows/deploy.yml publishes the repo root to GitHub Pages
specs/_template/spec.md      copy per feature → specs/001-<feature>/spec.md
```

## Three Rules That Matter

- **Relative paths only.** `href="styles.css"`, never `/styles.css`. A GitHub
  Pages project site is served from `/<repo-name>/`, so a leading slash breaks
  every asset — the usual cause of "worked locally, blank page once deployed".
- **No secrets.** Every file here is publicly readable at a predictable URL.
  There is no build step to inject values and no server to hold them. An API
  key in a `.js` file is a published API key.
- **Static only.** No API routes, no server-side rendering, no database.
  Browser storage (`localStorage`, `IndexedDB`) works and is per-device.
- **HTML and CSS carry the site.** Every page must render, read, and navigate
  with JavaScript disabled. Scripts add operations on top of a page that
  already works without them — they never build it. Load them as
  `<script src="app.js" defer></script>`, not `type="module"`: modules and
  `fetch()` are blocked when you open a file directly, which would force you
  to run a server.

## Building With an AI Assistant

Point it at [AGENTS.md](AGENTS.md) — it holds the stack exclusions, the CSS and
JS conventions, and the workflow. Write a spec from
[specs/_template/spec.md](specs/_template/spec.md) first, then implement two or
three acceptance criteria at a time.

Lovable, Bolt, and v0 always generate React + Vite + Tailwind and cannot
reliably produce plain HTML/CSS/JS — use a chat- or CLI-based assistant for
this scaffolding instead.

Open decisions are marked `TODO: Human clarification needed` in `AGENTS.md` —
prompts for whoever adopts this, not oversights.

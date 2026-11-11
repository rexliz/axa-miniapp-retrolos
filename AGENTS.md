# AGENTS.md

Source of truth for AI agents and humans working in this repository.

## Project

Scaffolding for building a small website with **plain HTML, CSS, and
JavaScript, no build step**, deployed to GitHub Pages. The repository root *is*
the website: what is in git is byte-for-byte what the browser receives, with
nothing between source and output.

**There is no website here yet.** This repository holds the conventions and the
deploy pipeline; the HTML, CSS, and JS files are yours to create.

Purpose beyond that, target audience, non-goals: TODO: Human clarification needed.

## Stack

HTML5 · hand-written CSS · vanilla JavaScript · no dependencies.

**HTML and CSS carry the site.** Every page must render, read, and navigate
with JavaScript disabled or still loading. JavaScript is for operations layered
on top — never for building the page, routing, or delivering the content a
visitor came for. There is no toolchain and no dev server either.

**Never introduce** without recording the decision in this file:

- Frameworks (React, Vue, Svelte, Angular) and client-side routers
- Build tools, bundlers, `package.json`, `node_modules`, any lockfile
- CSS frameworks or preprocessors (Tailwind, Bootstrap, Sass, PostCSS)
- TypeScript — there is no compile step to strip types
- CDN `<script>` tags, and any server-side runtime

Allowed file types: `.html`, `.css`, `.js`, `.md`, `.csv`, and images
(`.svg`, `.png`, `.jpg`, `.webp`). Anything else needs a decision here.

## Commands

| Task | Command |
|---|---|
| install / build | none — no dependencies, and the repository root is the website |
| run | open `index.html` in a browser |
| test / lint / format | none; TODO: Human clarification needed |

Opening the file directly works because pages do not depend on JavaScript, and
it is why scripts must be classic and deferred rather than ES modules —
`file://` blocks module loading and `fetch()`.

## Layout

Already present: `README.md`, this file, `.gitignore`,
`.github/workflows/deploy.yml`, and `specs/_template/spec.md` (copy it per
feature to `specs/001-<feature>/spec.md`).

To be created, flat at the repository root:

| File | Purpose |
|---|---|
| `index.html` | entry point — required, must sit at the root |
| `<page>.html` | one file per further page |
| `styles.css` | shared styling, including the `:root` token block |
| `<page>.css` | page-specific styling, loaded after `styles.css` |
| `<page>.js` | optional — operations layered on that page |
| `data/*.csv`, `*.md` | data and content; write it into the HTML instead where you can |

Pages are linked with plain relative `<a href="about.html">`. No `src/`, no
router, no nesting, no build output.

## Conventions

**Paths** — relative only. `href="styles.css"`, never `/styles.css`. A Pages
project site is served from `/<repo-name>/`, so a leading slash breaks every
asset. This is the most common cause of "works locally, blank page deployed".

**HTML** — semantic elements first (`<button>`, `<nav>`, `<main>`, `<label>`);
ARIA only where no native element fits. One `<h1>` per page, heading levels not
skipped. `alt` on every image, a `<label>` for every form control.

**CSS** — design tokens as custom properties on `:root`, declared once at the
top of `styles.css` and named `--color-*`, `--space-*`, `--font-*`, `--radius`,
`--container`; rules reference tokens, never raw values. Define the light
palette on bare `:root`, override it under
`@media (prefers-color-scheme: dark)`. Class names lowercase and hyphenated,
one block per component (`.card`, `.card-title`); no utility-class soup. No
inline `style` and no `!important` unless overriding a browser default with no
other hook — comment why. `box-sizing: border-box` globally; Flexbox for
one-dimensional layout, Grid for two-dimensional; mobile-first with `min-width`
queries; no fixed pixel page widths. Never remove a focus ring without
replacing it. Honour `prefers-reduced-motion`. Text contrast at least WCAG AA
(4.5:1 body, 3:1 large). Token values are yours to pick — TODO: Human
clarification needed on brand palette, typefaces, and logo rules.

**JS** — optional and additive only. A page must be complete before its script
runs, so enhance what the HTML already shows rather than generating it: no
JS-rendered content, no client-side routing, no `fetch()` for content a visitor
came to read. Load it as `<script src="app.js" defer></script>`, **not**
`type="module"` — modules and `fetch()` are blocked on `file://` and would
force a server. `const`/`let`, no globals, cache DOM queries, and prefer a CSS
or native-HTML solution (`<details>`, `<dialog>`, `:target`, form submission).

**Language** — English for code, identifiers, file names, and documentation.

## Workflow

1. Copy `specs/_template/spec.md` to `specs/001-<feature>/spec.md` and fill in
   the acceptance criteria — they are both the prompt and the review checklist.
2. Implement two or three acceptance criteria at a time, not a whole spec.
3. Open the page in a browser and check it against those criteria.
4. Branch off `main`, commit, open a pull request. Commit messages: English,
   imperative, one logical change each. Do not push to `main` directly.

**Definition of Done**

- [ ] A spec exists and its acceptance criteria are met
- [ ] Opened locally in a browser, with JavaScript disabled as well — there is
      no build and no CI check, so this is the only gate
- [ ] Documentation updated in the same change
- [ ] No secrets committed

Required approvals, merge strategy, branch protection: TODO: Human clarification needed.

## Deployment

`.github/workflows/deploy.yml` runs on push to `main`: checkout →
`touch .nojekyll` → publish the repository root to GitHub Pages. No install, no
build, about a minute. It warns when `index.html` is missing, since without an
entry point at the root the published site returns 404.

One-time setup per clone: **Settings → Pages → Build and deployment →
Source = GitHub Actions**. Nothing deploys until this is set.

`.nojekyll` is created in CI rather than committed, keeping it out of the
repository. Without it GitHub runs Jekyll, which hides underscore-prefixed
paths — including `specs/_template/`.

Rollback: `gh run list --workflow=deploy.yml`, then `gh run rerun <run-id>`; or
revert the commit and push.

## Do / Don't

- **Do** read this file and the feature's `spec.md` first, write the spec before
  the code, and record each decision in the change that introduces it.
- **Don't** make a page depend on JavaScript to render, add anything from the
  exclusion list, or use a leading-slash path.
- **Don't** commit a secret. Every file is publicly readable at a predictable
  URL, and there is no build step or server to hide a value — a key in a `.js`
  file is a published key.
- **Don't** rely on a server at runtime (API routes, SSR, database). Browser
  storage (`localStorage`, `IndexedDB`) works, per-device.
- **Don't** replace a `TODO: Human clarification needed` marker with a guess.

# Tesseract — development worklog

Timeline of development work on the tesseract site: what was asked, what changed, what was checked.
Newest entries first. Longer rationale lives in `.dev/docs/`.

---

## 10.23.2026 09:10am CDT — favicon not showing in the browser tab

### Overview

The site published no usable favicon: the tab showed the default globe. Every page had icon links, but
one of them pointed at a non-existent `assets/assets/...` path, the artwork was a tall non-square logo,
and there was no root `favicon.ico` fallback. All seven pages now share one square icon set under new
filenames, so browsers with a cached "no icon" result are forced to re-fetch.

### What changed

- **`assets/favicon.svg`** (new): the purple mark re-framed on a 1024×1024 canvas, square, transparent.
- **`assets/favicon-32.png`, `assets/apple-touch-icon.png`, `favicon.ico`** (new): generated from the SVG
  with `rsvg-convert` + ImageMagick. The ICO carries 16/32/48 frames; the touch icon sits on `#0f0f0f`
  because iOS ignores transparency.
- **`index.html`, `about.html`, `download.html`, `manifesto.html`, `tab-manager.html`**: replaced the
  three old icon links (one of them broken) with the shared four-line favicon block.
- **`404.html`**: was pointing at `assets/tesseract logo 55px*.svg/png`, files that live under
  `assets/@ archive/tesseract logos old/`; now uses the real icon set.
- **`app/app.html`**: same block with a `../` prefix, replacing a `../.assets/...` path that 404'd.
- Kept `assets/tesseract-logo-larger-gap.*` untouched — other pages/artwork still use that mark.

### Decisions

- New filenames instead of fixing the old links in place. Chrome's favicon cache is sticky; a URL the
  browser has never seen is the only reliable cache bust without asking every visitor to clear data.
- Ship SVG + PNG + ICO + Apple touch rather than SVG only, so Safari pinned tabs, iOS and older engines
  are covered for a few KB.
- No web app manifest. It only pays off once the site is installable, which is a different task.

### Validation

- Checked the generated icons visually at 16px and 32px on `#0f0f0f` and `#ffffff`; the mark reads on both.
- `magick identify favicon.ico` → 16, 32, 48 frames present.
- Served the repo with `python3 -m http.server 8123` and resolved every icon URL from all seven pages:
  every one returned `200` with the right content type.
- **Not** confirmed visually in a browser tab: no desktop browser was connected to this session.

### Artifacts

- `.dev/docs/favicons.md` — problem, considered options, icon set table, rollback.

### Subtasks

- [x] Diagnose why the tab icon was missing
- [x] Build a square SVG + PNG + Apple touch + multi-size ICO
- [x] Replace icon markup on all live pages
- [x] Verify every icon URL resolves over HTTP locally
- [ ] Confirm the icon after the GitHub Pages build, then hard-reload once

### Follow-up

- `404.html` and `styles.css` still assume the site is served from a path root (`/assets/noise.png`),
  which is false for `nitroxhq.github.io/tesseract/`. Separate path-cleanup task.
- `archive/` pages keep their old `.assets/` icon paths on purpose; they are frozen.
- Working tree also holds unrelated in-progress theme work (`theme.js`, `script.js`, `navbar.html`) that
  was not touched or committed here.

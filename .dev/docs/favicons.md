# Favicon setup

- **Summary:** The site had icon links that pointed at a tall, non-square logo, one of which was a
  broken `assets/assets/...` path, and no root fallback icon. Every page now shares one square icon set
  served from cache-busting new filenames.
- **Date:** 10.23.2026, done.
- **Related:** `.dev/WORKLOG.md` (10.23.2026 entry), `assets/favicon.svg`, `assets/favicon-32.png`,
  `assets/apple-touch-icon.png`, `favicon.ico`, head blocks in `index.html`, `about.html`,
  `download.html`, `manifesto.html`, `tab-manager.html`, `404.html`, `app/app.html`.

## Problem

The browser tab showed the default globe instead of the tesseract mark. The head of every page had:

```html
<link rel="icon" type="image/svg+xml" href="assets/tesseract-logo-larger-gap.svg">
<link rel="icon" type="image/png" href="assets/tesseract-logo-larger-gap.png">
<link rel="shortcut icon" href="./assets/assets/tesseract-logo-larger-gap.svg">
```

Things that were actually wrong:

1. **`assets/assets/` is not a real path.** The last icon link 404'd on every page. A broken candidate
   is harmless on its own, but it is exactly the kind of thing that leaves an already-cached "no icon"
   result in place.
2. **No `favicon.ico` at the repo root.** `/tesseract/favicon.ico` and any legacy fallback request had
   nothing to answer with.
3. **The icon asset is not square** (867×985). In a 16×16 slot the browser letterboxes it, so the mark
   rendered slightly smaller and softer than it should.
4. **The URLs never changed**, so browsers that had already cached a failed/default favicon for the page
   had no reason to fetch a new one. Chrome's favicon cache is sticky and survives normal reloads.
5. **`404.html` pointed at files that do not exist in `assets/`** (`assets/tesseract logo 55px.svg` lives
   under `assets/@ archive/tesseract logos old/`), so the error page had no icon at all.

## Considered

- **Keep the old filenames and just fix the markup.** Cheapest, but it leaves the browser cache holding
  whatever it already decided, which is likely why the bug looked unfixable.
- **Use only SVG.** Modern browsers are fine, but Safari pinned tabs, iOS home screen and older engines
  still want PNG/ICO. Not worth the gap.
- **Add a web app manifest for Android icons.** Real benefit only once the site is installable; out of
  scope for "the tab has no icon".

## Decision

Ship a small, standard set and give every one of them a URL the browser has never seen before:

| File | Purpose |
| --- | --- |
| `favicon.ico` (16/32/48) | Legacy + automatic `/favicon.ico` fallback |
| `assets/favicon.svg` | Square, scalable, preferred by Chrome/Firefox |
| `assets/favicon-32.png` | PNG fallback, the size tab strips actually use |
| `assets/apple-touch-icon.png` (180, `#0f0f0f` bg) | iOS home screen; iOS does not honour transparency |

`assets/favicon.svg` is the existing purple mark re-framed on a 1024×1024 canvas (96px side margin,
`scale(0.96)`), so it is square and optically fills the slot instead of being letterboxed.

The Png/ICO files were generated from that SVG with `rsvg-convert` + ImageMagick, not checked in as
hand-made art, so re-generating them stays a two-command job.

## What changed

```html
<!-- favicons -->
<link rel="icon" href="favicon.ico" sizes="32x32" />
<link rel="icon" type="image/svg+xml" href="assets/favicon.svg" sizes="any" />
<link rel="icon" type="image/png" href="assets/favicon-32.png" sizes="32x32" />
<link rel="apple-touch-icon" href="assets/apple-touch-icon.png" />
```

`app/app.html` uses the same block with a `../` prefix. The old `assets/tesseract-logo-larger-gap.*`
files stay in place because other artwork uses the same mark.

## Validation

- Rendered the SVG to 16px and 32px over `#0f0f0f` and `#ffffff`: mark is legible on both tab-bar themes.
- `file`/`magick identify`: `favicon.ico` contains 16, 32 and 48px frames; PNGs are RGBA as expected.
- Served the repo with `python3 -m http.server` and resolved every icon URL from all seven pages:
  all `200` with `image/svg+xml`, `image/png` or `image/vnd.microsoft.icon`.
- **Not** verified in a real browser tab: no desktop browser was connected to the session, so "Chrome
  paints the icon" is inferred from the markup and the assets, not observed.

## Rollback or recovery

Restore the three old `<link>` lines from git and delete the four new icon files. Nothing else reads
them, so nothing else breaks.

## Caveats and follow-ups

- GitHub Pages serves the 404 page at the requested path, so relative icon paths on `404.html` only work
  for one level deep. Same limitation as its existing `./styles.css`; fixing it means root-absolute URLs
  or a base tag, which is a separate decision.
- `styles.css` references `/assets/noise.png` with a leading slash, which only resolves if the site is
  served from a domain root. Not touched here, but it is the same class of path bug.
- Archive pages under `archive/` still point at the old `.assets/` shorthands; they are intentionally
  frozen and were left alone.

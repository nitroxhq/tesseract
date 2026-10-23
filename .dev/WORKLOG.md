# Tesseract — development worklog

Timeline of development work on the tesseract site: what was asked, what changed, what was checked.
Newest entries first. Longer rationale lives in `.dev/docs/`.

## 10.23.2026 03:50pm CDT — Letter column centered (continues 03:45pm)

### Overview

Follow-up to the merge five minutes earlier: the owner wanted the letter's text block centered on the page
while its prose stays left-aligned. The column was pinned to the hero's left edge; it now centers.

### What changed

- **`styles.css`** — `.hero.letter .body-right` margin `2rem 0` → `2rem auto`. Max width (620px) and
  `text-align: left` are unchanged; auto cross-axis margins also opt the flex item out of stretch, so the
  column centers inside the 900px hero.

### Validation

- CDP at 1440px: column 660px outer, its center 720px = viewport center; heading `center`, body `left`.
- 390px light: no horizontal overflow; column fills the gutters (center 195px = viewport center).
- **Not checked:** same caveats as the 03:45pm entry (Firefox/Safari, real phones, screen reader).

### Subtasks

- [x] Center the letter column without centering the prose

---

## 10.23.2026 03:45pm CDT — About page merged: letter first, manifesto second

### Overview

Two long-form pages said overlapping things in different registers: `about.html` (“what does tesseract do
differently?”, signed by ellis) and `manifesto.html` (the “let's start at the beginning” presentation).
They are now one read at `about.html`: the letter first, a hairline chapter break, then the manifesto and
the existing join-us outro. The letter body is left-aligned; its title stays centered. The parent site's
merged `nitroxhq.github.io/about.html` (mission folded into the about letter) was the reference for the
one-page shape and the rule between chapters.

### What changed

- **`about.html`** — combines both pages. Letter copy preserved and rewritten as real paragraphs instead of
  manual `<br>` lines (they existed to shape centered text); cleared typos: *begnning → beginning*,
  *effecient → efficient*, *wil → will*, *in field of technology → in the field of technology*. The
  manifesto copy is unchanged apart from the same typo pass. Page title is now `about tesseract.`
- **`styles.css`** — `.hero.letter` left-aligns the letter body while the `h1` stays centered;
  `.hero.letter .body-right` caps the letter measure at 620px (down from 700px — left-aligned 700px ran
  ~100 characters per line); `.letter-signoff` adds breathing room; `.about-rule` draws the chapter
  hairline with `--line`.
- **`navbar.html`** — the `why tesseract?` item is commented out; the manifesto no longer has its own nav
  destination (`about` is the page).
- **`manifesto.html`** — now a redirect stub to `./about.html#manifesto` with a canonical to `about.html`,
  mirroring `nitroxhq.github.io/mission.html`. Old links and the `#manifesto` anchor still resolve.
- **`.dev/docs/navbar-theme-system.md`** — active-state note updated for the removed nav item.

### Decisions

- **Letter first, presentation second** — the owner asked for it, and it reads better: a personal note
  explains why, then the manifesto widens the frame.
- **Centered title, left-aligned prose.** The owner confirmed at 03:38pm that the page title should stay
  centered with the rest of the site; only the letter body reads left-aligned.
- **Keep the manifesto centered.** Its intro paragraphs and `app-reveal` were already centered; leaving
  them that way makes the letter feel like a note and the manifesto like a presentation. Only the letter
  was asked to change.
- **Redirect instead of delete.** `manifesto.html` stays as a stub so shared links do not 404; same pattern
  as the parent's retired `mission.html`.
- **Hairline rule, not a new divider style.** The two `<h1>`s need a chapter break; `.about-rule` borrows
  the existing one-pixel `--line` separator instead of inventing a component.

### Validation

- Headless Chromium via CDP (device-scale 1, emulated light/dark) against `python3 -m http.server 8110`:
  `scrollWidth === clientWidth` at 320, 390, 760, 900, 951, 1200 and 1440.
- Computed alignment at 1440: letter `h1` `text-align: center`, letter body `left`; manifesto heading and
  intro still `center`; letter column 660px outer (620 content); the hairline spans the 900px chapter
  width.
- `manifesto.html` lands on `about.html#manifesto`; `about` is the active nav item on `about.html`.
- Screenshots checked at 390 (light) and 1440 (dark) in both themes; zero console errors.
- **Not checked:** Firefox/Safari, a real phone, a screen reader, GitHub Pages.

### Subtasks

- [x] Merge the letter and manifesto into `about.html`
- [x] Letter first
- [x] Left-align the letter body, keep the title centered
- [x] Redirect `manifesto.html` to `about.html#manifesto`
- [x] Update navbar and navbar doc
- [ ] Decide whether `why tesseract?` returns as a hash link to `#manifesto` (currently commented out)

### Follow-up

- The letter still explains the product (“3 reasons”) rather than telling the personal “I started this
  because…” story the parent about page uses. If the owner wants a true founder letter, that copy is the
  next edit; the page structure already supports it.

---

## 10.23.2026 02:05pm CDT — Tab-manager canvas matched to the site, brand marks pinned

### Overview

Follow-up to the `01:54pm` navbar entry. The tab-manager page was the only page painting its own opaque
canvas on `<body>`, which covered the grain painted on `<html>` and made it look like a different surface.
The navbar brand marks also changed hue with the theme; they are now the same tesseract purple and nitrox
blue in light and dark. The open question about theme-varying marks is recorded in a new `.dev/TODO.md`.

### What changed

- **`styles.css`** — removed `.tab-manager-page { background: var(--canvas) }`. The body stays transparent
  like every other page, so the shared grain shows through. The container/preview styles are unchanged.
- **`styles.css`** — `--nav-logo`, `--nav-logo-hover`, `--nav-nitrox-mark` and `--nav-nitrox-mark-hover` are
  now single values instead of `light-dark()` pairs: `#a161ea` / `#c897ff` and `#3232ff` / `#5a5aff`. A
  comment points at the TODO.
- **`.dev/TODO.md`** (new) — records "should brand/logo colours change when the theme does?", the
  hard-coded `meta[theme-color]` values, and the `backdrop-filter` fallback.
- **`nitroxhq.github.io/.dev/DESIGN.md`** — §6.1 now points to a new §6.1.1 theme-aware nav spec using the
  tesseract navbar as the implemented precedent (token table, blur, active state, pinned marks, hover,
  focus, content-driven breakpoint). §5.4 notes that the parent's `720px` collapse is its own four-link
  measurement and tesseract's five-link pill collapses at `950px`.

### Decisions

- **Transparent body, not `background: var(--canvas)`.** Painting the same colour on the body looks
  identical on a flat design but silently kills the grain, because the texture lives on `<html>`. Keep
  page-level surfaces on `<html>` only.
- **Pin the marks for now.** The hue shift was a detail the eye noticed before the theme change itself; one
  brand colour per mark is calmer and matches the footer marks. If contrast on obsidian becomes a real
  problem, the fix is a deliberate lighter variant, not an accidental `light-dark()`.
- **Mark the parent spec proposed.** The parent nav is not migrated, so §6.1.1 says so explicitly rather
  than describing a page that does not exist.

### Validation

- Headless Chromium against `python3 -m http.server 8099`; body computed background is `rgba(0, 0, 0, 0)`
  on `tab-manager.html` in both themes, matching `index.html`.
- Grain sample (300×200 px): tab-manager and index are identical — light mean `rgb(231,227,239)`, stddev
  2.79; dark mean `rgb(18,18,18)`, stddev 2.79.
- Computed marks are identical across themes: tesseract logo `rgb(161,97,234)`, nitrox mark
  `rgb(50,50,255)` on light and dark. Hover still resolves to `rgb(200,151,255)` / `rgb(90,90,255)`.
- Visual screenshots of tab-manager in both themes: grain present, preview panel and window unchanged.
- Console: zero `console.error` / `pageerror`.
- **Not checked:** Firefox/Safari, real phones, screen reader.

### Artifacts

- [`.dev/TODO.md`](../TODO.md) — open theme questions.
- [`.dev/docs/navbar-theme-system.md`](../docs/navbar-theme-system.md) — mark-pinning caveat added.
- [`nitroxhq.github.io/.dev/DESIGN.md`](../../nitroxhq.github.io/.dev/DESIGN.md) — §6.1.1 nav spec (external
  repo).

### Subtasks

- [x] Remove the tab-manager's extra page background
- [x] Pin navbar mark colours across themes
- [x] Record the theme-varying-colours question in `.dev/TODO.md`
- [x] Add the dark/light navbar spec to the parent design doc
- [ ] Decide whether marks should brighten on dark (see TODO)

---

## 10.23.2026 01:54pm CDT — Navbar follows the theme: light grain, home, purple active state, brand hover

### Overview

Continues the `09:52am` navbar/theme entry. The pill still read as the parent site's white chrome dropped
onto an obsidian page: white surface in both themes, nitrox-blue active link, no `home`, and light mode had
lost the grain entirely. The navbar now resolves through the same `light-dark()` tokens as the rest of the
page — translucent white over lavender, obsidian glass over grain — with `home` first, the active page in
tesseract purple, the blue nitrox mark restored, and one shared hover motion per brand lockup.

### What changed

- **`navbar.html`** — the tesseract mark and wordmark are now one `.nav-brand-home` anchor instead of two
  separate links, so hover applies to both at once. Added `home` as the first nav link. The nitrox link
  keeps the masked `assets/white-logo-svg.svg` mark.
- **`styles.css`** — added the `--nav-*` token set: surface, ink, hover ink, divider, shadow, hover/track/
  control/pressed surfaces, active ink + pill, logo and nitrox-mark colours with hover variants. Every nav
  component rule now consumes a var; no raw colour remains below the token block. The nav gets
  `backdrop-filter` so the dark glass tracks the grain behind it.
- **`styles.css`** — removed both light-mode `background-image: none` overrides (explicit light and the
  `device` + `prefers-color-scheme: light` case), so `assets/noise.png` paints on every canvas.
- **`styles.css`** — `.nav-brand-text` inherits the anchor colour; hover is a 1px lift plus colour change
  from `--nav-ink` to `--nav-ink-hover` (near-black → light grey on the white pill). The logo shifts from
  purple to violet. `.nav-nitrox-mark` is painted with the parent blue token again, and its hover is the
  old lift/lighten rather than grey → black.
- **`styles.css`** — `.nav-buttons.active` uses `--nav-active-ink` (resolves to `--accent`: deep purple on
  light, brand purple on dark) on a 13%/22% purple pill, replacing nitrox blue.
- **`styles.css` + `script.js`** — collapse breakpoint moved 900 → 950px and the wide-screen cue from 901 →
  951px. Five links measure ~909px, so the old breakpoint left 901–940px capping the pill under its
  content.
- **`script.js`** — the active-link pass is now a `markActive()` function that also runs on `hashchange`,
  so the marker follows `home` ↔ `features` navigation in the same document instead of being decided once
  at boot.

### Decisions

- **Theme-aware pill, not a permanently white one.** The parent's white pill works on a blue or paper
  field; on obsidian it reads as a foreign object. `--nav-bg` now resolves to translucent white in light
  and translucent obsidian in dark, and ink flips with it.
- **Active state is tesseract purple, not nitrox blue.** The nav is tesseract's chrome even though the pill
  geometry is shared. `--accent` already encodes the accessible variant (deep on light), so the state uses
  it rather than a raw `#a161ea`.
- **Hover lightens instead of dimming.** `opacity: 0.8` on the white pill made the wordmark darker, not
  lighter. A dedicated `--nav-ink-hover` reproduces the old light-grey against the new surface, and the
  whole lockup shares one transform so the mark and text never animate apart.
- **Nitrox mark stays brand blue.** Parent identity is carried by the mark, so it does not inherit
  `currentColor` any more. Dark mode uses a lighter blue (`#6a6aff`) because `#3232ff` on near-black loses
  contrast.
- **One neutral noise asset for both themes.** The PNG is ~7% alpha with a neutral mean, so it works as
  film grain on obsidian and paper grain on lavender without a second file or a mix-blend trick.
- **950px, not 900px.** The breakpoint is driven by measured content, not a device convention. 951px is the
  first desktop width with a 21px gutter; 950px uses the collapsed panel.

### Validation

- Headless Chromium (Playwright build) against `python3 -m http.server 8099`, device scale 1.
- Computed styles — light nav `rgba(255,255,255,0.92)` / ink `rgb(11,11,16)`; dark nav
  `rgba(23,23,26,0.82)` / ink `rgb(244,239,252)`; `device` followed `emulateMedia` in both directions.
- Active state — `home` on index, `about`, `why tesseract?`, `tab manager` on their pages; no active item on
  `download.html` / `404.html` (no matching link). Active ink `rgb(122,59,196)` light, `rgb(161,97,234)`
  dark. Deep-linking `index.html#features` marks `features` with `aria-current="location"`; clicking `home`
  clears the hash and moves both class and `aria-current` back without a reload.
- Hover — brand text computed to `rgba(11,11,16,0.3)` light / `rgba(255,255,255,0.62)` dark, anchor transform
  `translateY(-1px)`; logo `rgb(161,97,234)` → `rgb(200,151,255)`; nitrox mark `rgb(50,50,255)` with a
  lighter hover. Element screenshots checked in both themes.
- Grain — light background sample before: flat `rgb(244,239,252)`, stddev 0. After: mean
  `rgb(231,227,239)`, stddev 2.8. `backgroundImage` reports `noise.png` in light, dark and both device
  resolutions.
- Overflow — 320 → 1400 including 900/901/920/940/950/951/960: `scrollWidth - clientWidth === 0` at every
  width. Pill width 909px desktop.
- Console: zero `console.error` / `pageerror` across the checked pages.
- **Not checked:** Firefox/Safari (`backdrop-filter` fallback), real phones, screen reader, GitHub Pages.

### Artifacts

- [`.dev/docs/navbar-theme-system.md`](../docs/navbar-theme-system.md) — updated decision, token model,
  breakpoint, validation, caveats.

### Subtasks

- [x] Restore grain on the light canvas
- [x] Make the pill, ink and controls follow the theme
- [x] Add `home` to the nav
- [x] Use tesseract purple for the active page
- [x] Move every nav colour behind a CSS var
- [x] Restore the blue nitrox mark and the pre-pill hover
- [x] Unify the tesseract logo + wordmark hover into one anchor
- [x] Keep the active marker in sync with `#features` navigation
- [x] Re-check widths after the fifth link
- [ ] Check the dark glass pill in a non-Chromium browser
- [ ] Consider a `prefers-reduced-transparency` fallback for `backdrop-filter`

### Follow-up

- `meta[name="theme-color"]` is still set from two hex literals in `script.js`; it could read the resolved
  token instead so the browser chrome can never drift from `--canvas`.
- The inner pages remain half-migrated (pre-existing); this change is navbar-wide, not a page-layout pass.

---

## 10.23.2026 01:40pm CDT — FAQ questions dialed back to Inter SemiBold, heading back to EB Garamond

### Overview

Continues the `01:26–01:30pm` entry. Inter Bold on every FAQ row read too harsh at question size, and the
section heading belonged in the page's serif voice after all. The landing FAQ now keeps the EB Garamond
`h2` and uses Inter SemiBold (600) for the six question rows, still from a real local face rather than a
synthesised weight.

### What changed

- **`styles.css`** — added an Inter 600 `@font-face` (`Inter-SemiBold.woff2`). The 400 and 700 faces remain.
- **`styles.css`** — `.faq-item summary` is now `font-weight: 600`; family stays `var(--sans-serif)`.
- **`styles.css`** — `.faq-heading` reverted to `var(--serif)` with no `font-weight` override.
- **`.dev/docs/faq-inter-bold.md`** — renamed to `.dev/docs/faq-heading-type.md` and rewritten for the new
  scope; the earlier worklog entry's artifact link was updated to the new path.
- **`index.html`** — unchanged.

### Decisions

- **600, not 700 or 500.** Bold overpowered the answer copy; Medium sat too close to the 400 body and
  weakened the question/answer hierarchy. SemiBold is the middle that still reads as a header.
- **Keep the serif `h2`.** The mismatch was at the row level, not the section title; the EB Garamond heading
  is part of the display voice.
- **Keep the Inter 700 face declared.** `about.html` uses inline `<b>` inside Inter body copy, so the real
  bold file is still useful even though the landing FAQ no longer asks for 700.

### Validation

- Computed styles: heading `"EB Garamond", serif` / `700` (UA default, as before) / `32px`; summaries
  `Inter, sans-serif` / `600` / `18.4px`.
- `document.fonts`: Inter 400 and 600 `loaded`, 700 `unloaded` on the landing page (nothing requests it).
- `CSS.getPlatformFontsForNode`: summaries rendered with `Inter-SemiBold`; heading with
  `EBGaramond-Regular`.
- Dark and light screenshots with one row expanded: serif heading restored, semibold questions, open-state
  colors unchanged.
- **Not checked:** Firefox, Safari, real phones, screen-reader hardware, print.

### Artifacts

- `.dev/docs/faq-heading-type.md` — revised rationale, options, validation, rollback.
- `.dev/human-learning.md` §6 — updated to use the 600 face as the example; the synthetic-bold rule is
  unchanged.

### Subtasks

- [x] Add the local Inter 600 face
- [x] Set FAQ question rows to SemiBold
- [x] Restore the EB Garamond section heading
- [x] Verify rendered faces and both themes
- [ ] Decide whether EB Garamond should declare its real variable range (pre-existing faux-bold question)
- [ ] Re-check the FAQ on real displays and non-Chromium browsers

### Follow-up

- The EB Garamond `@font-face` declares only weight 400 for a variable file, so the `h2`'s UA-bold request
  still resolves to the regular face. Pre-existing and untouched; noted in the doc.

---

## 10.23.2026 01:26–01:30pm CDT — FAQ headings switched to real local Inter Bold

### Overview

The landing FAQ still used EB Garamond for both the section heading and every question row, which read as a
separate document from the rest of the Inter-based interface. Both levels now use Inter Bold, backed by a
real local `@font-face` for `Inter-Bold.woff2` rather than a browser-synthesised bold on the 400 face. Only
the landing FAQ is affected; the rest of the page's serif headings are untouched.

### What changed

- **`styles.css`** — added a second Inter `@font-face` (`font-weight: 700`, local
  `assets/fonts/inter/Inter-Bold.woff2`) beside the existing 400 face.
- **`styles.css`** — `.faq-heading` and `.faq-item summary` now use `var(--sans-serif)` with
  `font-weight: 700`. Sizes, spacing, purple marker and open-state colours are unchanged.
- **`index.html`** — no change; the FAQ was already semantic `h2` + `details`/`summary`.

### Decisions

- **Declare the weight instead of relying on `font-weight: 700` alone.** With only a 400 face, the browser
  fakes bold; the vendored bold file was already present, so the honest version cost one block.
- **Leave the type scale alone.** Inter's larger x-height makes `2rem` read bigger than EB Garamond did, but
  resizing the FAQ heading is a design decision separate from the family swap.
- **Use `var(--sans-serif)` rather than hard-coding `'Inter'`.** Keeps the family behind the existing token,
  consistent with the rest of the stylesheet.

### Human actually learned

- A CSS bold request is not a font file: without a declared 700 face, the browser thickens the 400 outlines
  and `document.fonts.check()` plus width measurements both still look "correct". Rendered Fonts / platform
  font data is the only reliable check. Written up in `.dev/human-learning.md` §6.

### Validation

- Headless Chromium (Playwright build) against `python3 -m http.server 8144`.
- Computed styles: heading `Inter, sans-serif` / `700` / `32px`; summaries `Inter, sans-serif` / `700` /
  `18.4px`.
- `document.fonts`: Inter 400 and 700 both `loaded`, no network requests.
- `CSS.getPlatformFontsForNode` reported `Inter-Bold` for `.faq-heading`. Control test with only a 400 face
  and `font-weight: 700` reported `Inter-Regular`, confirming the new face is doing the work.
- Screenshots in dark and light, closed and one row expanded: heading/questions bold, open row keeps its
  purple surface/border, answer body unchanged.
- **Not checked:** Firefox, Safari, real phones, screen-reader hardware, print.

### Artifacts

- `.dev/docs/faq-heading-type.md` — problem, options, the local-face decision, validation, rollback.
- `.dev/human-learning.md` §6 — requested weight vs declared face, synthetic bold, and how to prove which
  face rendered.

### Subtasks

- [x] Declare local Inter 700 from the vendored `Inter-Bold.woff2`
- [x] Apply Inter Bold to the FAQ section heading and question rows
- [x] Verify the rendered face is Inter-Bold in dark/light and open/closed states
- [x] Document the change and the synthetic-bold lesson
- [ ] Decide whether the FAQ type scale needs adjusting now that it is Inter rather than EB Garamond
- [ ] Re-check the heading's inherited `text-shadow` if it looks heavy on real displays

### Follow-up

- The new 700 face is now available to every Inter element; intended, but worth remembering if another
  component starts requesting bold.
- Browser coverage is still Chromium-only for this pass.

---


### Overview

The landing hero was supposed to type through phrases ("idea inbox.", "focus frontier.", …), but the only
implementation was Typed.js from jsDelivr and that `<script>` tag had been commented out — later removed
outright — so `<span id="typeWriter">` stayed empty. The animation now runs from a small vanilla function in
`script.js`: no library, no CDN, no network. The heading also no longer reflows while it types.

### What changed

- **`script.js`** — new `initTypewriter()` (type 55ms/char, erase 28ms, hold 2.2s, gap 350ms, loop),
  called from `DOMContentLoaded` before the navbar fetch so a `file://` load or a failed `navbar.html`
  request cannot stop it. Phrases are copied from `archive/script.js` so the wording is unchanged.
- **`index.html`** — removed the commented Typed.js/Tailwind CDN tags; the empty `#typeWriter` is now inside
  a `.type-line` wrapper with a hidden ghost copy of the longest phrase and an `sr-only` static sentence.
- **`styles.css`** — `.type-line` is an inline grid whose two children share one cell: the live text paints,
  the invisible ghost sets the width. Caret is a `#typeWriter::after` pseudo-element with a `caret-blink`
  keyframe; reduced motion hides it and `script.js` shows the final phrase statically. Added `.sr-only`.

### Decisions

- **Vanilla instead of vendoring Typed.js.** The whole animation is ~40 lines; a 10KB dependency (plus a
  vendored copy to keep offline) buys nothing here.
- **Ghost phrase rather than `min-height`.** A fixed height is a guess that breaks at another viewport; the
  overlapping grid cell reserves exactly the widest line at whatever width is current, so heights measured
  identical for every prefix of every phrase.
- **Animate an `aria-hidden` span, keep one readable sentence.** A heading that mutates character by
  character is noise to a screen reader; the `sr-only` copy gives it a stable name without changing the
  visible design.
- **Typing is a progressive enhancement.** The static phrase moved out of the visible heading, but the site
  already needs JS for the navbar and theme; no separate no-JS path was added.

### Validation

- Playwright Chromium against `python3 -m http.server 8137`: all five phrases type, hold, erase, and loop;
  sampled text at 0.2/0.9/1.6/3/6/12s showed the expected progression.
- Set every prefix of every phrase directly and measured: exactly one heading height per viewport — 62px at
  1440/1200/1024/900, 124px at 820/768, 47px at 700/600, 94px at 480/390/360, 141px at 320 — with the CTA
  block staying put.
- Zero horizontal overflow (scrollWidth − innerWidth = 0) at twelve widths from 320 to 1440px.
- Zero external network requests; loaded over `file://` and the typing still ran with no page errors.
- `prefers-reduced-motion: reduce`: final phrase shown immediately, caret opacity 0, no timers running.
- Accessibility snapshot: `heading "Tesseract is your productivity supertool." [level=1]`.
- Light and dark screenshots; caret inherits the heading ink in both.
- **Not checked:** Firefox, Safari, real phones, screen-reader hardware.

### Artifacts

- `.dev/docs/hero-typewriter.md` — problem, options considered, the ghost-grid decision, code excerpts,
  validation, rollback.
- `.dev/human-learning.md` §5 — overlapping grid items + `visibility: hidden` as a layout reservation, and
  the generated-content caret.

### Subtasks

- [x] Diagnose why the hero never typed (dead CDN tag, empty span)
- [x] Implement the cycle in vanilla JS with reduced-motion and live-setting handling
- [x] Reserve the heading's line count so typing cannot shift the page
- [x] Keep one stable accessible sentence for the animated heading
- [x] Verify loop, offline `file://`, reduced motion, widths, themes and console output
- [ ] Retire the now fully unused legacy `.typewriter h1` / `typing` / `blink-caret` CSS with the rest of
      the dead legacy block

### Follow-up

- Phrase list lives in `script.js`; the ghost and `sr-only` copy in `index.html` assume the longest phrase is
  "productivity supertool." — update both if the list changes.

---

## 10.23.2026 08:57–09:52am CDT — navbar and theme system from the nitrox design docs

### Overview

The landing page was asked to follow the nitrox design docs, with two explicit priorities: the navbar and
theme selection. It now uses the nitrox floating white pill as shared chrome — tesseract brand, nitrox
mark, four page links, a device/dark/light picker and a mobile menu — and the whole site has a real light
theme for the first time, built on one `light-dark()` token block instead of a duplicated dark palette.
Touches every page: `navbar.html`, `theme.js`, `script.js`, `styles.css`, and the six HTML files.

### What changed

- **`navbar.html`** (rewritten): the white pill. tesseract mark + wordmark, divider, nitrox mark + wordmark
  linking to the parent site, `features / about / why tesseract? / tab manager`, three inline Phosphor
  theme icons, hamburger. The nitrox mark is a CSS mask of `assets/white-logo-svg.svg` so it inherits ink.
- **`theme.js`** (new): 19-line pre-paint script. Reads the shared `nitrox-theme` localStorage key, validates
  `device | dark | light`, writes `data-theme` on `<html>`. Storage errors fall back to `device`.
- **`script.js`** (rewritten): nav injection, active-link marking, mobile menu (Escape, outside click, focus
  return, `aria-expanded`), theme picker (localStorage, `aria-pressed`, `meta[theme-color]`). Removed the
  dead Typed.js branch that would have failed offline.
- **`styles.css`**: raw palette + semantic tokens resolved with `light-dark()`; `color-scheme` per theme;
  new nav component and its ≤900px drop-down panel; tokenised buttons, bento, FAQ, footer, about page,
  preview window, 404 and tab-manager; shared `:focus-visible` ring; reduced-motion block; noise path fixed
  to `./assets/noise.png`.
- **`index.html`** (edited): the ten bento icons were `<i class="ph-duotone …">` pointing at a commented-out
  CDN stylesheet, so they rendered nothing. Replaced with twelve vendored Phosphor duotone symbols (MIT,
  inline `<symbol>` sprite, ~5.7KB) referenced by `<svg class="bento-icon"><use href="#i-…">`.
- **`index.html`, `about.html`, `manifesto.html`, `tab-manager.html`, `download.html`, `404.html`**: added
  `<meta name="theme-color">` + `<script src="./theme.js">` before the stylesheet; removed the commented
  Phosphor CDN link.
- **Layout fixes found while screenshotting**: `box-sizing: border-box` on `.bento-section` and
  `.faq-section` (their `width: 100%` + padding overflowed 40px below 990px). The 700–880px overflow was a
  different, pre-existing bug: stray semicolons after the two `@keyframes` blocks made the CSS parser discard
  the *next two rules* — `blink-caret` and the entire `.hero` block — so the hero lost `width: 100%`. Removed
  the semicolons (164 → 178 parsed rules) and removed `white-space: nowrap` from the hero heading, whose
  736px unbreakable line was setting the page width.

### Decisions

- **Shared pill, product skin.** The nav is the parent's chrome: white in both themes, nitrox blue for the
  active link. The tesseract mark and EB Garamond headings stay tesseract's.
- **One token block with `light-dark()`.** The parent duplicates its dark tokens per theme; here a single
  set of semantic tokens resolves through `color-scheme`, so `device` needs no JavaScript and cannot drift
  from `dark`/`light`.
- **Same storage key as the parent (`nitrox-theme`).** Same GitHub Pages origin, so one preference follows
  a visitor between the two sites.
- **Light is a lavender canvas (`#f4effc`), not white.** White cards and the white pill need a tinted
  surface, and the grain texture is a dark-only treatment.
- **Breakpoint moved to 900px** because the pill measures 839px at desktop width — content-driven, not a
  device convention.

### Validation

- Playwright Chromium against `python3 -m http.server 8099`: dark `rgb(15,15,15)`, light `rgb(244,239,252)`,
  `device` follows the emulated OS both ways, live OS switch re-resolves without reload.
- Persistence: pick light → reload → still light; navigate to `about.html` → still light; `meta[theme-color]`
  follows the resolved theme.
- Horizontal scroll is 0 at 320, 390, 480, 600, 700, 768, 820, 850, 900, 950, 1024, 1200 and 1400px, and the
  CSSOM now exposes the rules that the stray semicolons had hidden.
- `styles.css` now parses 178 rules, including `blink-caret` and `.hero`; before the semicolon fix it parsed
  164 and both were missing from `document.styleSheets`.
- Menu: opens/closes with `aria-expanded`, Escape closes and returns focus to the toggle, outside click
  closes, no layout shift.
- Bento icons paint: 28×28 box, sampled `rgb(122,59,196)` light / `rgb(161,97,234)` dark.
- No low-contrast text: every visible text node on all six pages, both themes, stayed above 2.5:1 against
  its nearest opaque ancestor. (Visibility check, not a WCAG audit.)
- Zero `console.error` / `pageerror` in every capture.
- **Not checked:** Firefox, Safari, real iOS, screen readers, the GitHub Pages deployment, or browsers older
  than the 2024 `light-dark()` support window.

### Artifacts

- `.dev/docs/navbar-theme-system.md` — problem, considered options, token rationale, rollback, caveats.
- `.dev/human-learning.md` — new: `light-dark()` + `color-scheme`, and the flex `min-width: auto` overflow.

### Subtasks

- [x] Read the nitrox design docs and the parent navbar/theme implementation
- [x] Rebuild the navbar as the shared white pill
- [x] Add device/dark/light theming with a pre-paint script and a shared storage key
- [x] Retheme landing page, bento, FAQ, footer, about, preview, 404 and tab-manager with tokens
- [x] Restore the bento icons offline (vendored Phosphor duotone sprite)
- [x] Fix the two horizontal-overflow bugs found in screenshots
- [x] Verify widths, themes, persistence, menu behaviour, contrast and console output
- [ ] Migrate the inner pages' body layouts to the parent's type scale
- [ ] Remove the legacy dark-only CSS for classes nothing renders

### Follow-up

- `about.html`, `manifesto.html`, `tab-manager.html`, `download.html` and `404.html` still use the older
  inner-page shell; they inherit the nav, canvas and tokens but are not redrawn.
- `404.html`'s footer is missing the brand block that the other pages have (pre-existing).
- Legacy rules for `.btn-bar`, `.btn-sub`, `.not-found-link`, `.tagline`, `.social-button1` and `.typewriter`
  are unused and still assume a dark canvas.
- Nothing is committed; `.dev/docs/DESIGN.md` is deleted in the working tree with
  `.dev/old-draft-DESIGN.md` untracked — the owner's own move, deliberately left untouched.

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

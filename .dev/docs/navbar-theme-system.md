# Navbar and theme system

- **Summary:** The tesseract site uses the nitrox parent chrome — a floating pill navbar — plus a three-way
  theme picker (device / dark / light) resolved through one set of `light-dark()` tokens. Since the
  `10.23.2026 01:54pm` revision the pill itself follows the canvas (white over lavender, obsidian glass over
  grain), the active link is tesseract purple, `home` is the first link, and grain is present in both themes.
- **Date:** 10.23.2026, decided; revised 10.23.2026 (theme-aware navbar, `home`, purple state, light grain).
  Applies to all six live pages.
- **Related:** [WORKLOG.md](../WORKLOG.md) entries `10.23.2026 09:52am CDT` and `10.23.2026 01:54pm CDT`;
  code in [`navbar.html`](../../navbar.html), [`theme.js`](../../theme.js), [`script.js`](../../script.js),
  [`styles.css`](../../styles.css). Parent precedent: `nitroxhq.github.io/.dev/DESIGN.md` §3.4 (theme model),
  §6.1 (navigation), §7 (icons), §9.3 (grain).

## Problem

The landing page had drifted from the brand it belongs to. Its header was a plain row of links styled
per-page, it only worked on the dark canvas, and it still depended on the Phosphor icon CDN for the bento
grid even though the rest of the site had moved to local fonts and local assets. Visitors arriving from
`nitroxhq.github.io` saw a different navigation shape on the very next click, and there was no way to ask
for a light page on a machine set to dark.

Two things had to be true at once:

1. The header must read as the same chrome as the parent site, not a lookalike.
2. A theme preference chosen on either site should survive the click between them, without a flash of the
   wrong colours on load.

## Considered

**Copy the parent's stylesheet wholesale.** Rejected: the parent ships its own type scale, spacing and
component set. Pulling it in would have meant restyling every tesseract component to match, and coupling
two repos' CSS.

**Duplicate the parent's dark token block for each theme.** This is what the parent does — one `:root`
block plus a `[data-theme]` override. Rejected for tesseract because it triples the chance of one theme
drifting out of sync, and the picker has a third state (`device`) that is neither.

**Separate storage key (`tesseract-theme`).** Rejected. `nitroxhq.github.io` and
`nitroxhq.github.io/tesseract` are the same origin, so localStorage is already shared. A second key would
mean a visitor who picks light on nitrox gets a dark tesseract and has to find the picker again.

**Commit a theme class per element instead of tokens.** Rejected: it spreads the palette across hundreds
of rules and makes the next theme a rewrite rather than a variable change.

**Screenshot the page and hard-code a light palette into images.** Not relevant — the site is type and
flat surfaces, not imagery.

## Decision

**Navigation.** Adopt the parent pill geometry but let the surface follow the page theme: a translucent
white pill on the lavender canvas and a translucent obsidian pill on the dark canvas, both with
`border-radius: 100vmax`, `width: max-content` capped at `calc(100vw - 32px)`, and a shadow that follows the
theme. Brand order is the tesseract mark + wordmark (one link, so hover moves and recolours the lockup
together), then a divider and the blue nitrox mark + wordmark linking to the parent site. The active link
uses the tesseract accent — `--nav-active-ink`, deep purple on light and brand purple on dark — on a purple
pill. The parent's nitrox blue stays on the nitrox mark itself, not on page state.

**Brand hover.** Both brand lockups use the pre-pill animation: lift 1px and lighten. On the white pill the
wordmarks lighten from near-black to the old light-grey, and the marks brighten (tesseract purple → violet,
nitrox blue → lighter blue). The tesseract mark and wordmark share one `<a>`, so hovering either half moves
both.

**Theme.** One `data-theme` attribute on `<html>` with three legal values, and one token block:

```css
:root {
  color-scheme: light dark;      /* device */
  --canvas: light-dark(var(--tess-lavender), var(--tess-obsidian));
  --text:   light-dark(var(--tess-ink), #ffffff);
  /* … */
}
html[data-theme="light"] { color-scheme: light; }
html[data-theme="dark"]  { color-scheme: dark; }
```

`light-dark()` reads the *used* `color-scheme`, so `device` needs no JavaScript at all: the OS preference
flows through CSS, and the page follows a live OS switch. `theme.js` only decides *which* value goes on
`<html>`, and it runs before the stylesheet link so the first paint is already correct.

**Light is lavender, not white.** `#f4effc` canvas with `#0b0b10` ink. White cards and the white nav pill
need a tinted canvas to sit on, and the parent's light surface is warm-white; a lavender canvas keeps the
tesseract purple accent readable without inventing a second accent.

**Grain belongs to both canvases.** The noise texture is neutral at roughly 7% alpha, so the same
`assets/noise.png` works as film grain over obsidian and paper grain over lavender. Light mode no longer
disables it. The grain is a surface treatment, not a silhouette: text and the nav pill stay fully legible.

**Breakpoint is 950px, not 720px.** The pill is a single line of five text links plus three icon buttons.
At 1400px it measures roughly 909px; below about 950px (plus the page gutters) the links would start
colliding with the controls. The menu collapses when the content needs it, not at a device-width
convention. The desktop/mobile cue in `script.js` matches at `min-width: 951px`.

## What changed

- **`navbar.html`** (rewritten, revised 01:54pm): pill markup, one tesseract brand link wrapping mark +
  wordmark, a blue nitrox link, five page links (`home` first), three inline Phosphor theme icons
  (device / moon / sun), hamburger. The nitrox mark is a CSS mask over `assets/white-logo-svg.svg` painted
  with `--nav-nitrox-mark`, so the parent blue survives both themes.
- **`theme.js`** (new, 19 lines): reads `nitrox-theme` from localStorage, validates it against the three
  legal values, writes `document.documentElement.dataset.theme`. Storage failures fall back to `device`.
- **`script.js`** (rewritten): injects the nav fragment via `outerHTML`, marks the current page active
  (re-evaluated on `hashchange`, so `home` ↔ `features` swap without a reload), owns the mobile menu
  (Escape, outside click, focus return, `aria-expanded`), and owns the picker (localStorage write,
  `aria-pressed`, `meta[name="theme-color"]` update). Dead Typed.js code removed. The wide-screen cue is
  `min-width: 951px` after the pill gained `home`.
- **`styles.css`**: raw palette + semantic token block (§ "Theme tokens"), `light-dark()` resolution, one
  `--nav-*` token per nav surface/ink/state, theme-aware nav component and its ≤950px panel, tokenised
  buttons, bento cards, FAQ, footer, about page, preview window, 404 and tab-manager styles, shared
  `:focus-visible` ring, reduced-motion block. The nav component consumes only vars. Grain is declared once
  on `:root` and no longer switched off for light.
- **All six pages**: `<meta name="theme-color">` and `<script src="./theme.js">` before the stylesheet link.
- **`index.html`**: ten Phosphor duotone icons vendored as an inline `<symbol>` sprite (MIT, ~5.7KB at the
  end of `<body>`) and referenced with `<svg class="bento-icon"><use href="#i-…">`. The commented CDN
  stylesheet was removed from every page.
- **Layout fixes found while screenshotting**: `box-sizing: border-box` on `.bento-section` and
  `.faq-section` (their `width: 100%` + padding overflowed by 40px below 990px). The 700–880px overflow had
  a separate, pre-existing cause: two stray semicolons after the `@keyframes` blocks made the CSS parser
  swallow the *next two rules* — `blink-caret` and the whole `.hero` block — so the hero never got
  `width: 100%`. Removing the semicolons restored those rules (164 → 178 parsed rules), and removing the
  hero heading's `white-space: nowrap` stopped the 736px unbreakable line from setting the page width.

## Validation

Run against `python3 -m http.server 8099` with Playwright Chromium (headless), device scale 1.

- **Themes resolve correctly:** dark canvas `rgb(15, 15, 15)`, light canvas `rgb(244, 239, 252)`,
  `device` + OS dark → dark navy/obsidian pill, `device` + OS light → white pill. A live `emulateMedia`
  switch moved `device` between the two.
- **Nav follows the theme:** light pill `rgba(255, 255, 255, 0.92)` with ink `rgb(11, 11, 16)`; dark pill
  `rgba(23, 23, 26, 0.82)` with ink `rgb(244, 239, 252)`. Shadow, divider, picker track, control ink and
  pressed chip all resolve through `--nav-*` tokens in both modes.
- **Grain is back in light:** `getComputedStyle(documentElement).backgroundImage` reports `noise.png` in
  light, dark and both device resolutions. A 300×200 px background sample moved from a flat
  `rgb(244,239,252)` (stddev 0) to mean `rgb(231,227,239)` with stddev 2.8 — visible texture, no loss of
  legibility.
- **Active page uses the tesseract purple:** `home` is active on `index.html`, `about` on `about.html`,
  `tab manager` on `tab-manager.html`. The old `why tesseract?` item is commented out because the manifesto
  now lives inside `about.html` (as `#manifesto`; `manifesto.html` redirects). Computed active ink is
  `rgb(122, 59, 196)` on light and `rgb(161, 97, 234)` on dark, on a 13%/22% purple pill. Pages with no
  matching link (`download.html`, `404.html`) show no active item. A direct load of
  `index.html#features` marks `features` with `aria-current="location"`; clicking `home` clears the hash
  and moves both the class and `aria-current` back, without a reload.
- **Hover lockups are unified:** hovering the tesseract link changes mark and wordmark together — text to
  `rgba(11, 11, 16, 0.3)` on light (the old light grey), logo `rgb(161,97,234)` → `rgb(200,151,255)`, and a
  `translateY(-1px)` on the shared anchor. The nitrox link uses the same lift and text lighten while its
  mark stays the parent blue `rgb(50,50,255)` in both themes.
- **Persistence:** pick light → reload → still light before paint; navigate to `about.html` → still light.
  Pick `device` → stored value is `device`, and `meta[theme-color]` follows the OS resolution.
- **No horizontal scroll:** 320, 390, 480, 600, 700, 768, 820, 850, 900, 901, 920, 940, 950, 951, 960,
  1000, 1024, 1200, 1400 all report `scrollWidth - clientWidth === 0`. The pill measures 909px desktop;
  with `home` added, 950 is the last width that uses the collapsed panel and 951 is the first desktop
  width, which has 21px of gutter. Before moving the breakpoint, 901–940 capped the pill below its content.
- **Rules that were silently missing are back:** `document.styleSheets` for `styles.css` reports 178 style
  rules ... (the earlier semicolon bug) and the keyframes `typing`, `blink-caret`, `nav-menu-in`,
  `color-fill`.
- **Menu behaviour:** opens with `aria-expanded="true"`, Escape closes it and returns focus to the toggle,
  a click outside closes it, page scroll stays locked to zero overflow while open.
- **Icons paint:** first bento icon box is 28×28, sampled pixel `rgb(122, 59, 196)` in light and
  `rgb(161, 97, 234)` in dark — the token values, so the sprite inherits `currentColor` correctly.
- **Contrast:** walked every visible text node on all six pages in both themes, comparing against the
  nearest opaque ancestor background; nothing fell below 2.5:1. (2.5, not 4.5 — this was a "is anything
  invisible" check, not a WCAG audit.)
- **Console:** zero `console.error` and zero `pageerror` across every capture.
- **Not checked:** Firefox and Safari rendering (notably `backdrop-filter` on the pill), a real iOS device,
  a screen reader, and the GitHub Pages deployment. `light-dark()` needs a 2024-or-later evergreen engine;
  no fallback palette was added for older browsers.

## Rollback or recovery

Every change is in tracked files plus one new one, and nothing was committed:

```
git checkout -- navbar.html script.js styles.css index.html about.html manifesto.html tab-manager.html download.html 404.html
rm theme.js
```

If you want to keep the theme system but drop the pill, restore only `navbar.html` and the nav block in
`styles.css` (search for `Shared navigation — inherited from the nitrox parent chrome`); the token system
is independent of the header.

## Caveats and follow-ups

- **The inner pages are only half-migrated.** They share the nav, the canvas and the theme tokens, but
  their body layouts (about article, manifesto, download placeholder, 404, tab-manager hero) still use the
  older shell. They are readable in both themes; they are not redrawn to the parent's type scale.
- **Legacy dark-only CSS is still present** for classes nothing renders any more — `.btn-bar`, `.btn-sub`,
  `.not-found-link`, `.tagline`, `.social-button1`, the `.typewriter` block. They are harmless but they will
  mislead the next person who greps for a button style.
- **404's footer has no brand block.** That is pre-existing markup, not a theme regression.
- **`--primary-color` is still a raw purple** on the inline tesseract logo SVG's presentation attribute. It is
  now only a fallback: `.nav-logo-img { fill: var(--nav-logo) }` overrides it, so the mark resolves through
  the token (and still gets its hover fill). Keep the attribute for the no-CSS case, not as the source of
  truth.
- **Brand mark colours are pinned across themes** — `--nav-logo*` and `--nav-nitrox-mark*` no longer use
  `light-dark()`, so the tesseract purple and nitrox blue are identical on both canvases. Whether they
  should shift with the theme (for contrast on obsidian) is an open question in `.dev/TODO.md`.
- **The dark pill relies on `backdrop-filter`.** Browsers without it still get the translucent
  `rgba(23, 23, 26, 0.82)` surface, just without the blur; the nav remains readable.
- **On ≤950px the nitrox wordmark is hidden** and only the blue mark remains, so the brand row does not
  crowd the theme picker and toggle. Pre-existing behaviour, kept.
- **The theme picker is global, not homepage-only.** The parent site scopes its picker to the landing page;
  tesseract shows it on every page because the preference is shared across the whole brand.
- **No `prefers-contrast` / forced-colors handling.** Windows high-contrast mode will fall back to system
  colours and the pill's shadow will disappear — acceptable, untested.

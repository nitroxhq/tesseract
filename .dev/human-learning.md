# human learning — how the web actually works, from this repo

> **Status:** living notes, started 10.23.2026. Written for the owner, not for users.
> If a note disagrees with the code, the code is right — fix the note.

Read each section the same way: what broke in this repo → the simple model → what the browser actually
does → the fix that shipped → how to prove it in DevTools → the one sentence to keep. The ELI5 is an
analogy, not baby talk; where it stops matching reality, the mechanics section says so.

Sections are added newest-last, and the map at the bottom ties each one back to a real file.

---

## 1. Two stray semicolons deleted two CSS rules — error recovery in the CSS parser

**What we hit.** The landing page was 800px wide inside a 768px window. The likely suspect was the hero
heading, but the actual cause was upstream: `styles.css` contained

```css
@keyframes typing { from { width: 0 } to { width: 100% } };
@keyframes blink-caret { from, to { border-color: transparent } 50% { border-color: orange } };

.hero {
  width: 100%;
  display: flex;
  /* … */
}
```

and the browser had **never applied the `.hero` rule at all**. The rule was not overridden — it was not in
the stylesheet the browser built.

**ELI5.** Imagine reading a recipe and hitting a page that ends mid-sentence with a stray comma. Instead of
skipping just the comma, you flip forward until the next paragraph *starts cleanly*, and the paragraph you
skipped past never gets cooked. CSS does something similar: after a syntax error it discards tokens until it
can find a fresh rule boundary, and anything caught in that sweep is gone.

**What actually happens.** CSS is parsed by the "consume a list of rules" algorithm. At the top level a
`;` is a parse error, and the parser then tries to read a *qualified rule*: it collects everything up to the
next `{`, treats that as a selector, consumes the block, and throws the result away because the selector is
invalid. The stray `;` after `@keyframes typing` therefore ate `@keyframes blink-caret { … }` — and the
following `;` did it again, eating `.hero { … }`. Parsing resumed cleanly at `.logo svg`, which has no
leading semicolon.

The proof is the rule count, not the pixels:

| state | `cssRules.length` | `.hero` present | `blink-caret` present |
|---|---|---|---|
| before | 164 | no | no |
| after removing both `;` | 178 | yes | yes |

The consequences were quiet and plausible-looking. Without `.hero`'s `display: flex; width: 100%`, the hero
became a plain flex item in `.landing-container` with `margin: 0 auto`, i.e. **shrink-to-fit**. Its width
then came from its content — and the `h1` had `white-space: nowrap`, so its min-content width was 736px.
736 + the container's 64px left padding = 800px. A max-content child quietly set the page width.

**The fix.** Remove the semicolons (blocks do not need terminating `;` in CSS), and drop `white-space:
nowrap` from the hero heading so a long line can wrap instead of pushing the page wider. Both shipped. The
`min-width: 0` on `.hero` that we added while guessing turned out to be irrelevant — testing with it and
without it produced identical geometry — so it was removed rather than left in as folklore.

**How to prove it.** In DevTools:

1. Console: `[...document.styleSheets].find(s => (s.href||'').includes('styles')).cssRules.length` — 178
   today. If a rule you edited is not in that list, it never existed for the browser.
2. Search the stylesheet for a rule you can see in Sources but not in the Styles pane.
3. `document.documentElement.scrollWidth - document.documentElement.clientWidth` — 0 at every width now;
   it was 32 at 768px before.
4. Toggle a suspect declaration back on with the Styles pane checkbox and watch `getBoundingClientRect()`
   on `.hero` — it stays 640 (the parent's content box) when `width: 100%` is live.

**Failure mode to remember.** This is why "the CSS is in the file" means nothing. A single character can
invalidate a neighbouring rule with no console warning, because recovery from parse errors is silent by
design. Linters and a CSSOM count catch it; eyeballing the file does not.

**If you remember one thing.** A syntax error in CSS does not stop at the line — it can swallow the next
rule, so verify a rule exists in `document.styleSheets`, not just in `styles.css`.

**Terms to look up.** CSS syntax error recovery, qualified rule, `CSSStyleSheet.cssRules`, `@keyframes`,
min-content size, shrink-to-fit.

---

## 2. `light-dark()` and `color-scheme` — one token block, three picker states

**What we hit.** The site had a dark palette hard-coded in dozens of rules. Adding a light theme the obvious
way meant duplicating every colour under `html[data-theme="light"]`, and the picker's third state — "follow
the device" — matched neither copy.

**ELI5.** Think of a paint shop with two pre-mixed cans behind the counter. You do not carry both cans
around; you say "the dark one" and the shop hands you whichever can the lighting conditions call for.
`light-dark(a, b)` is that sentence, and `color-scheme` is the shop's current lighting setting.

**What actually happens.** `light-dark(a, b)` is not a media query — it is a colour function that resolves
against the element's **used `color-scheme`**. `color-scheme: light dark` on `:root` means "I support both,
follow the OS"; `color-scheme: dark` means "always use the second value". The picker therefore only has to
change one property:

```css
:root { color-scheme: light dark; --canvas: light-dark(#f4effc, #0f0f0f); }
html[data-theme="light"] { color-scheme: light; }
html[data-theme="dark"]  { color-scheme: dark; }
```

`color-scheme` is also why form controls, scrollbars and the canvas default background flip correctly for
free. It is *not* the same thing as `prefers-color-scheme`: that media query asks the OS, while
`color-scheme` is a value you set. Mixing them is how themes end up half-applied — a rule inside
`@media (prefers-color-scheme: light)` will not follow a visitor who forced light on a dark OS.

The pre-paint part is a separate trick. `theme.js` is a classic script placed **before** the stylesheet
link, so the parser blocks on it, it runs before first paint, and it only writes
`document.documentElement.dataset.theme`. No flash, because the very first style resolution already sees the
right attribute. It cannot set colours itself — CSS still owns them.

Left alone, `device` needs no JavaScript at all: the OS preference flows straight through `light-dark()`,
including a live switch while the page is open. Only the browser chrome hint
(`<meta name="theme-color">`) has to be updated by script, because that is not CSS.

**The fix.** One raw palette (`--tess-*`) and one semantic layer (`--canvas`, `--text`, `--surface`, …)
resolved with `light-dark()`; `data-theme` on `<html>` carries the choice; `nitrox-theme` in localStorage
carries it across pages and across the parent site (same origin). Grain is switched off in light mode with
`background-image: none`, because the noise texture is a dark-canvas treatment.

**How to prove it.** DevTools → Rendering → "Emulate CSS media feature prefers-color-scheme" flips `device`
live. Then:

1. `getComputedStyle(document.documentElement).colorScheme` → `light dark` for device, `dark` or `light`
   after an explicit pick.
2. `getComputedStyle(document.documentElement).backgroundColor` → `rgb(15, 15, 15)` vs
   `rgb(244, 239, 252)`.
3. Set a breakpoint on the first line of `theme.js`, reload, and confirm it runs before the first paint
   (Elements shows `data-theme` already set when `<body>` appears).

**Failure mode.** `light-dark()` needs a 2024-or-later engine. In an older browser the declaration is
invalid at computed-value time, the token becomes `unset`, and surfaces fall back to transparent — which
looks like "the theme is broken in Safari 16", not like "an unsupported function". A fallback block is the
honest fix if that audience matters; this site chose to accept the modern-engine requirement.

**If you remember one thing.** `color-scheme` is the switch and `light-dark()` reads it — set the switch,
not a hundred colours.

**Terms to look up.** `color-scheme`, `light-dark()`, used value, `prefers-color-scheme`, FOUC, parser-blocking
script.

---

## 3. An icon can have the right `color` and still paint black — `fill` and the `<use>` shadow tree

**What we hit.** The bento icons were switched from a Phosphor icon font to a vendored inline SVG sprite.
The computed style said `color: rgb(161, 97, 234)`, the icon box measured 28×28 — and the pixels were
`rgb(22, 22, 22)`, i.e. near-black on a near-black card.

**ELI5.** `color` is the pot of paint; `fill` is the instruction that says "use the pot". You can own the
right purple and still paint with the default black if nobody told the brush which pot to dip into.

**What actually happens.** `color` and `fill` are different properties. `fill` defaults to `black`; it only
becomes the text colour when something sets `fill: currentColor`. When the Phosphor SVGs were inlined, the
outer `<svg fill="currentColor">` wrapper was stripped and each `<symbol>` kept only its two `<path>`
elements, so nothing carried a fill. Content inside `<use>` lives in a shadow tree, but **inherited**
properties cross that boundary — which is why one declaration on the host `<svg class="bento-icon">` reaches
every path:

```css
.bento-icon { color: var(--accent); fill: currentColor; }
```

Duotone icons rely on this too: the back shape carries `opacity="0.2"`, so the two-tone effect is the same
colour at two alphas. That is why a "correct-looking" icon can still read as flat grey at 28px.

**The fix.** `fill: currentColor` on `.bento-icon`. Pixel sampling then returned `rgb(122, 59, 196)` in
light and `rgb(161, 97, 234)` in dark — exactly the token values, no per-theme icon files.

**How to prove it.** In DevTools, select the `<svg>` in Elements; the Styles pane shows `fill` as an
inherited rule. Untick it and watch the icon go black. Or sample the rendered crop:

```js
// console, with the icon scrolled into view
const svg = document.querySelector('.bento-icon');
getComputedStyle(svg).fill;   // rgb(122, 59, 196)
getComputedStyle(svg).color;  // same value — but only because fill references it
```

**Failure mode.** Styling paths inside `<use>` from outside is not possible with normal selectors — the
shadow tree is not reachable. If you need per-shape control, use CSS custom properties (`fill:
var(--icon-fill)`) or inline the `<path>` elements directly instead of referencing a symbol.

**If you remember one thing.** `color` does not paint SVG shapes; `fill: currentColor` is the bridge, and
inheritance crosses `<use>`.

**Terms to look up.** `fill` vs `color`, `currentColor`, shadow tree, `<symbol>` + `<use>`, duotone icons.

---

## 4. `width: 100%` plus padding is 100% plus padding — `box-sizing`

**What we hit.** The bento and FAQ sections were 40px wider than the viewport at every width below about
990px. Each was `width: 100%; max-width: 980px; padding: 0 20px`.

**ELI5.** You ask for a box exactly as wide as the shelf, then wrap it in 20px of bubble wrap on each side.
The wrapped box no longer fits the shelf — the wrap was never part of the measurement you asked for.

**What actually happens.** The initial value of `box-sizing` is `content-box`, so `width` describes the
*content* box. Adding `padding: 0 20px` puts 40px outside that width. The section is a block, so `width:
100%` resolves to the parent's content width and the padding is added on top: parent + 40px. Nothing in the
cascade is wrong; the box model is doing exactly what it was told.

Two honest fixes: `box-sizing: border-box` (width now includes padding, so 100% means 100%) or
`width: auto` (a block already fills its parent; the `100%` was redundant). This repo uses `border-box` on
the two sections, matching the `box-sizing: border-box` already sprinkled through the stylesheet.

**The fix.**

```css
.bento-section, .faq-section {
  width: 100%;
  max-width: 980px; /* 780px for FAQ */
  margin: 0 auto;
  padding: 0 20px 4rem;
  box-sizing: border-box;
}
```

**How to prove it.** DevTools → select the section → Computed pane shows `width` and `padding` separately,
and the box model diagram shows the overflow in orange. `document.documentElement.scrollWidth` was 40px
larger than `clientWidth`; it is equal now. Try it live: unticking `box-sizing` re-creates the overflow
instantly.

**Failure mode.** `box-sizing: border-box` on everything (`*, *::before, *::after`) is a common reset, but
it changes the meaning of every existing `width` in a stylesheet. Apply it deliberately — a global reset on
a legacy file is a redesign disguised as a one-liner.

**If you remember one thing.** `width` and `padding` are measured separately unless `box-sizing: border-box`
says otherwise.

**Terms to look up.** box model, content box, border box, `box-sizing`, scrollWidth vs clientWidth.

---

## 5. A heading that types without moving the page — grid overlap and `visibility: hidden`

**What we hit.** The hero heading types five phrases of different lengths. At 768px the heading measured 62px
tall for a short phrase and 124px for a long one, and the CTA buttons below it moved 62px every time the
animation reached a longer phrase. At 320px the longest phrase took three lines, so the page kept stepping
up and down.

**ELI5.** Picture a photo frame with a fixed matte. You keep swapping the picture inside, but the frame is cut
to the largest photo it might ever hold, so the shelf never moves. The hidden ghost phrase is that matte: it
is never seen, but it decides how much room the frame reserves.

**What actually happens.** Two CSS mechanisms combine.

1. **Grid items can share one cell.** Both the live text and the ghost are placed at `grid-area: 1 / 1`, so
   they overlap instead of sitting side by side. The grid container's intrinsic width is the **largest** of
   its items' contributions, not their sum. The ghost is the longest phrase, so it sets the track; the live
   text just paints inside it.
2. **`visibility: hidden` still occupies space.** Unlike `display: none`, it removes paint and the
   accessibility tree but keeps the box and its layout. That is exactly the behaviour needed for a sizer.

```css
.type-line { display: inline-grid; justify-items: start; }
.type-line > * { grid-area: 1 / 1; }
.type-ghost { visibility: hidden; pointer-events: none; }
```

`inline-grid` matters too: it is an **atomic inline-level box**, so line breaking treats the whole
`.type-line` as one unit. Once the reserved block does not fit after "Tesseract is your ", it moves to the
next line as a whole and stays there for every phrase. The heading's width is shrink-to-fit inside the
left-aligned `.hero`, so the reservation also fixes the `h1`'s used width, not just its text.

The caret is `#typeWriter::after` with `content: "|"`. Generated content is not a DOM child, so assigning
`textContent` on every keystroke does not delete it — a plain `<span class="caret">` inside the same element
would have been wiped by the first update.

**The fix.** A ghost copy of the widest phrase in the same grid cell as the live span, plus a generated
caret. Measured heights became one value per viewport: 62px ≥900px, 124px at 820–768px, 47px at 700–600px,
94px at 480–360px, 141px at 320px, with the CTA `top` constant at each width.

**How to prove it.** DevTools:

1. At 768px, toggle `display: none` on `.type-ghost` while a short phrase is showing. The track collapses
   to the live text and the heading height plus the CTA position change as the animation types. Re-enable it
   and the geometry stays fixed.
2. Change `visibility: hidden` to `visible`. The ghost paints on top of the live text, which proves the two
   really share a cell — but the layout does not move at all, which proves the ghost was already reserving it.
3. Console check of the sizer's contribution:
   ```js
   const g = document.querySelector('.type-ghost');
   getComputedStyle(g).visibility;         // "hidden"
   g.getBoundingClientRect().width;        // 424 at 48px type, 318 at 36px
   ```
4. Measure a full cycle instead of trusting the eye:
   ```js
   const h1 = document.querySelector('.hero-heading');
   const t = document.getElementById('typeWriter');
   const heights = new Set();
   for (const p of ['idea inbox.', 'focus frontier.', 'study space.',
                    'creativity catalyst.', 'productivity supertool.']) {
     for (let i = 0; i <= p.length; i++) {
       t.textContent = p.slice(0, i);
       heights.add(Math.round(h1.getBoundingClientRect().height));
     }
   }
   heights; // at 768: Set { 124 } — one height, not two
   ```

**Failure mode.** The ghost must actually be the widest phrase at every breakpoint, or the reservation
silently becomes too small and the jump returns for the longer phrase. If the wrapper is `display: inline`
rather than `inline-grid`, the ghost no longer overlaps the live text — it becomes an invisible phrase after
it, which can add a line instead of reserving one. And `display: none` on the ghost looks equivalent to
`visibility: hidden` in the Elements tree but provides no layout at all.

**If you remember one thing.** Grid items can share a cell, and `visibility: hidden` still takes up space —
together they make a hidden sizer that holds a changing layout still.

**Terms to look up.** `display: inline-grid`, grid item placement (`grid-area`, `grid-column`/`grid-row`),
max-content contribution, atomic inline-level box, shrink-to-fit width, `visibility` vs `display`.

---

## 6. A bold tag is not a bold font — `@font-face` weights and synthetic bold

**What we hit.** The FAQ question rows were set to `font-family: Inter; font-weight: 600`, but the stylesheet
only declared an Inter 400 face. The text looked semibold, so it seemed fine. DevTools' platform-font data
said otherwise: the rows were painted with **Inter-Regular**. The browser was faking the weight. Declaring
the vendored `Inter-SemiBold.woff2` as a 600 face changed the same rows to **Inter-SemiBold** with no other
styling change. The earlier 700 pass on the same section had exactly the same problem.

**ELI5.** Asking a regular actor to "look heavier" versus hiring the actor who is actually heavier. From
across the room both read as "big person"; up close, one is a costume. A browser will absolutely put the
costume on for you — that is synthetic bold.

**What actually happens.** `@font-face` does not declare a font family so much as **one face inside** a
family. Each block says "for family Inter, style normal, weight 400, use this file." When an element asks for
weight 600 (or 700), the CSS font-matching algorithm looks for the closest declared face — here, 400 — and,
because `font-synthesis: weight` defaults to `auto`, thickens those outlines itself. The glyph shapes were
never designed for that weight, so counters fill in and curves get lumpy at display sizes.

Two measurements lie about this:

- **Advance width does not change.** Synthetic bold smears the outline without changing the glyph's advance,
  so measuring `getBoundingClientRect().width` at 400 and 600 returns the same number. Identical width is not
  proof of identical rendering.
- **`document.fonts.check('600 1rem Inter')` returns `true`.** It answers "can this family render this
  text?", not "is there a real 600 face?". A family with only 400 still passes.

The reliable check is which face the renderer actually used.

**The fix.** Declare the real weight next to the regular one, then ask for it:

```css
@font-face {
  font-family: 'Inter';
  font-weight: 400;
  src: url('assets/fonts/inter/Inter-Regular.woff2') format('woff2');
}

@font-face {
  font-family: 'Inter';
  font-weight: 600;
  src: url('assets/fonts/inter/Inter-SemiBold.woff2') format('woff2');
}

.faq-item summary { font-family: 'Inter', sans-serif; font-weight: 600; }
```

No network request and no HTML change: the file was already vendored.

**How to prove it.** In DevTools:

1. Select the heading → **Computed** → **Rendered Fonts** at the bottom. It names the actual face, e.g.
   `Inter — SemiBold` versus `Inter — Regular`. This is the ground truth.
2. Or ask the protocol directly (Chrome DevTools Protocol, same data the panel uses):
   ```js
   // after DOM.enable + CSS.enable
   CSS.getPlatformFontsForNode({ nodeId })
   // [{ familyName: "Inter (Fontations)", postScriptName: "Inter-SemiBold", … }]
   ```
3. Toggle `font-synthesis: none` on the element. With **fake** weight the text drops back to regular;
   with a **real** 600 face it looks unchanged.
4. In the console, list what is actually declared rather than what is requested:
   ```js
   [...document.fonts].filter(f => f.family === 'Inter').map(f => f.weight + ' ' + f.status);
   // ["400 loaded", "600 loaded", "700 unloaded"]
   ```

**Failure mode.** This repo vendors **static** Inter files, one per weight, so every weight that appears in
the design needs its own `@font-face`. A variable font is the opposite case: one file can honestly cover
`font-weight: 100 900` in a single declaration. Do not "help" a static family by declaring its 400 file as
`100 900` — the browser will then use regular for every requested weight and, because the family claims to
cover them, skip synthesis entirely. The text goes flat instead of bold.

**If you remember one thing.** `font-weight: 600` (or `700`) is a request, not a file. If the family has no
face at that weight, the browser fakes it; declare the real file and check Rendered Fonts.

**Terms to look up.** `@font-face` `font-weight` range, CSS font matching algorithm, `font-synthesis`,
synthetic/faux bold, variable fonts vs static instances, `document.fonts` (`FontFaceSet`),
`CSS.getPlatformFontsForNode`.

---

## Map: repo artifact → concept

| Where | What it teaches |
|---|---|
| `styles.css` `@keyframes` section | §1 — a stray `;` silently deleted two rules |
| `styles.css` `:root` token block | §2 — `color-scheme` + `light-dark()` |
| `theme.js`, `<script>` before `<link>` in every page | §2 — pre-paint theme, no flash |
| `navbar.html` theme buttons | §2 — one attribute, three states |
| `index.html` inline `<symbol>` sprite + `.bento-icon` | §3 — `fill: currentColor` across `<use>` |
| `styles.css` `.bento-section`, `.faq-section` | §4 — `box-sizing` and the 40px overflow |
| `index.html` `.type-line` + `.type-ghost` | §5 — overlapping grid items reserve the heading's space |
| `styles.css` `#typeWriter::after` | §5 — generated caret survives `textContent` updates |
| `script.js` `initTypewriter()` | §5 — state machine over `setTimeout`, reduced-motion branch |
| `styles.css` local `@font-face` blocks (Inter 400 / 600 / 700) | §6 — requested weight vs declared face, synthetic bold |
| `styles.css` `.faq-item summary` | §6 — `font-weight: 600` backed by a real local SemiBold file |
| `styles.css` `.nitrox-nav` | nav pill: `width: max-content`, `border-radius: 100vmax`, `display: contents` for the menu wrapper |
| `script.js` nav + theme | progressive enhancement: links exist in `navbar.html`, JS only adds active state and menu behaviour |

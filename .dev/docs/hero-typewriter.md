# Hero typewriter — offline typing without layout shift

- **Summary:** The landing hero cycles five phrases again. A small vanilla function in `script.js` replaces
  the CDN Typed.js dependency, and an invisible ghost phrase shares a grid cell with the live text so the
  heading's line count cannot change mid-word.
- **Date:** 10.23.2026, decided and shipped.
- **Related:** `.dev/WORKLOG.md` → "hero typewriter works offline again"; `script.js` `initTypewriter()`;
  `index.html` `.hero-heading`; `styles.css` `.type-line`; `.dev/human-learning.md` §5.

## Problem

Three separate problems had collected around one empty span.

1. **The animation was gone.** The hero had once used Typed.js from jsDelivr. The `<script>` tag was
   commented out during the offline pass and the dead JS branch was removed, leaving
   `<span id="typeWriter"></span>` with nothing writing to it. The heading read "Tesseract is your" and
   stopped.
2. **The dependency was wrong for the site.** The page is deliberately build-free and every other asset
   (fonts, icons) had already been vendored. Pulling 10KB of library from a CDN to type five sentences
   contradicted that.
3. **A typing heading reflows the page.** The heading is `width: auto` inside a shrink-to-fit `.hero`, so its
   width and line count follow its current text. At 768px the measured height went 62px → 124px as the
   phrase grew, moving the CTA buttons 62px. At 320px it could take three lines. A looping animation that
   shoves the page every four seconds reads as a bug, not as motion.

## Considered

| Option | Why not |
|---|---|
| Vendor `typed.js` into the repo | Solves offline in one file, but keeps a 10KB dependency and its config API for ~70 lines of behaviour. It would also still reflow unless the heading was patched separately. |
| CSS-only `steps()` width animation | Needs a fixed `width`, a monospace face, and one static phrase. Cannot cycle, cannot use the proportional EB Garamond cleanly. |
| Static phrase, no animation | The safest fallback, but it removes the effect the owner asked to restore. |
| Vanilla JS timer + reserved heading space | Chosen. No dependency, full control over timing, pause and reduced motion, and the space problem can be solved in CSS. |

## Decision

- **Plain `setTimeout` cycle in `script.js`.** Phrases live in the script. Timing: 55ms per character,
  28ms erasing, 2.2s hold, 350ms gap between phrases, loop forever.
- **Reserve the widest phrase with an overlay grid.** `.type-line` is `display: inline-grid`; the live span
  and an invisible ghost copy of the longest phrase are both placed at `grid-area: 1 / 1`. The track takes
  the ghost's width, so the heading always occupies the same lines; `visibility: hidden` still contributes
  to layout, unlike `display: none`.
- **Caret is generated content.** `#typeWriter::after` draws the `|`, which keeps the markup to two spans and
  survives `textContent` updates. Reduced motion hides it.
- **One stable accessible sentence.** The animated wrapper is `aria-hidden="true"` and an `sr-only` copy of
  the final phrase sits beside it, so assistive tech never sees a heading that mutates character by
  character.
- **Reduced motion is a real mode, not a shorter animation.** With `prefers-reduced-motion: reduce`, the
  final phrase is rendered immediately and no timers start. Flipping the OS setting mid-session clears the
  pending timer and settles on the full phrase.
- **Typing is progressive enhancement.** The site already needs JavaScript for the navbar and the theme
  picker; no separate no-JS hero was added.

## What changed

`script.js` — new function, called before the navbar fetch so a failed `file://` fetch cannot block it:

```js
function initTypewriter() {
  const target = document.getElementById('typeWriter');
  if (!target) return;

  const phrases = ['idea inbox.', 'focus frontier.', 'study space.',
    'creativity catalyst.', 'productivity supertool.'];
  const TYPE_MS = 55, ERASE_MS = 28, HOLD_MS = 2200, GAP_MS = 350;
  // …type forward, hold, erase, advance, loop…
}
```

`index.html` — the static phrase moved out of the visible heading:

```html
<h1 class="hero-heading">
  <span>Tesseract is your </span>
  <span class="type-line" aria-hidden="true"
    ><span id="typeWriter"></span
    ><span class="type-ghost">productivity supertool.</span></span
  >
  <span class="sr-only">productivity supertool.</span>
</h1>
```

`styles.css` — the reservation and the caret:

```css
.type-line { display: inline-grid; justify-items: start; }
.type-line > * { grid-area: 1 / 1; }
.type-ghost { visibility: hidden; pointer-events: none; }
#typeWriter::after {
  content: "|";
  display: inline-block;
  margin-left: 0.03em;
  animation: caret-blink 1.06s step-end infinite;
}
```

The commented Typed.js and Tailwind CDN tags were deleted from `index.html`.

## Validation

- Full loop observed: every phrase reached its final punctuation, and the set after 25s contained all five.
- For every prefix of every phrase, the heading measured exactly one height per viewport:
  62px at 1440/1200/1024/900, 124px at 820/768, 47px at 700/600, 94px at 480/390/360, 141px at 320.
  The CTA block's `top` stayed constant at each width.
- `scrollWidth - innerWidth = 0` at twelve widths from 320 to 1440px.
- Zero requests outside `127.0.0.1`; the animation also runs from `file://` with no page errors.
- Reduced motion: final phrase immediately, caret opacity `0`, no pending timer.
- Accessibility snapshot of the heading: `"Tesseract is your productivity supertool."`.
- Light and dark screenshots; the caret inherits the heading's ink.
- **Not checked:** Firefox, Safari, real mobile browsers, screen-reader hardware.

## Rollback or recovery

The change is additive and local. To return to a static hero, replace the `.type-line` markup with
`<span>productivity supertool.</span>` and delete the `initTypewriter()` call; the CSS block and `.sr-only`
rule can stay or go without affecting other pages. There is no storage, build step, or cache to clear.

## Caveats and follow-ups

- The ghost and `sr-only` copies in `index.html` assume the **last** phrase in `script.js` is the widest at
  every breakpoint. Adding a longer phrase means updating those two strings; a runtime ghost built from the
  array would remove the duplication but adds layout measurement at boot.
- The heading still starts empty for 600ms. That is deliberate — pre-filling it would flash the full phrase
  before the first erase — but it means the first paint has no visible sentence.
- The legacy `.typewriter h1` rule and the `typing` / `blink-caret` keyframes are now wholly unused and
  belong with the other legacy CSS cleanup.

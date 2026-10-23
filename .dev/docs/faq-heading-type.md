# FAQ heading type

- **Summary:** The landing FAQ section heading stays in EB Garamond; the six question rows use Inter
  SemiBold (600) from a local `@font-face`, not a synthetic weight on the 400 face. This supersedes the first
  pass, which put both levels in Inter Bold.
- **Date:** 10.23.2026 01:40pm CDT, decided. Revised from the 01:30pm pass.
- **Related:** [WORKLOG.md](../WORKLOG.md) entries `10.23.2026 01:26–01:30pm CDT` and
  `10.23.2026 01:40pm CDT`; code in [`styles.css`](../../styles.css) (local font block,
  `.faq-heading`, `.faq-item summary`); markup in [`index.html`](../../index.html) (`.faq-section`).

## Problem

The FAQ rows still used `var(--serif)` (EB Garamond) while the rest of the interface is Inter, so the
questions read like a different document. The first pass moved both the `h2` and the `<summary>` rows to
Inter Bold. On review the bold was too heavy at question size, and the section heading read better in the
original serif — so the scope narrowed: keep the heading serif, make only the questions a sans weight.

The stylesheet also only declared Inter 400 and (from the first pass) 700. Asking for 600 against that set
would match the nearest face and let the browser synthesise the weight.

## Considered

**Inter Bold (700) for the questions.** Rejected after seeing it. It overpowers the answer body and makes
six collapsed rows feel loud.

**Inter Medium (500).** Rejected: too close to the 400 body text, so the question/answer hierarchy gets weak.

**Inter SemiBold (600).** Chosen: clearly heavier than the answer copy without shouting.

**Inter for the section heading too.** Rejected. The EB Garamond `h2` is part of the page's display voice;
the mismatch was only a problem at the row level.

## Decision

Declare the vendored 600 face and use it only on the question rows. The section heading returns to its
previous serif rule with no family or weight override:

```css
@font-face {
  font-family: 'Inter';
  font-weight: 600;
  src: url('assets/fonts/inter/Inter-SemiBold.woff2') format('woff2');
}

.faq-heading {
  font-family: var(--serif);   /* unchanged from the original */
  font-size: 2rem;
}

.faq-item summary {
  font-family: var(--sans-serif);
  font-weight: 600;
  font-size: 1.15rem;
}
```

The Inter 700 face stays declared because inline `<b>` text on `about.html` runs in the body's Inter family
and should use the real bold file rather than faux bold.

## What changed

- **`styles.css`** — added the Inter 600 `@font-face`; kept the 400 and 700 faces.
- **`styles.css`** — `.faq-item summary` is Inter at `font-weight: 600`.
- **`styles.css`** — `.faq-heading` reverted to `var(--serif)` with no `font-weight` override.
- **`index.html`** — unchanged throughout.

## Validation

Headless Chromium (Playwright build) against `python3 -m http.server 8144`:

- Computed styles: `.faq-heading` = `"EB Garamond", serif` / `700` (UA default, as before) / `32px`;
  `.faq-item summary` = `Inter, sans-serif` / `600` / `18.4px`.
- `document.fonts`: Inter 400 and 600 `loaded`; 700 `unloaded` (nothing on the landing page requests it).
- `CSS.getPlatformFontsForNode`: summaries rendered with **Inter-SemiBold**; heading with
  **EBGaramond-Regular**.
- Screenshots in dark and light, one answer expanded: heading serif, questions semibold, open row keeps its
  purple surface and border, answer body unchanged.
- **Not checked:** Firefox, Safari, real phones, screen-reader hardware, print.

## Rollback or recovery

- To go back to the pre-FAQ state: delete the 600 `@font-face` block and restore
  `.faq-item summary { font-family: var(--serif); }` without a `font-weight`.
- To return to the first pass: set `.faq-heading` to `var(--sans-serif)` + `700` and the summary to `700`.

## Caveats and follow-ups

- The 600 face is now available to every Inter element. That is intended, but any future
  `font-weight: 600` in Inter will use the real face.
- **Pre-existing:** EB Garamond is declared with a single 400 face even though the vendored file is a
  variable font. The heading's UA-default `font-weight: 700` therefore resolves to the 400 face
  (`EBGaramond-Regular`), which means the serif heading is not using a true 700 instance. This pass restored
  the original look and did not change that; a proper variable-font range (`font-weight: 400 800`) is a
  separate fix.
- The heading still carries `text-shadow: var(--text-shadow)`; unchanged.

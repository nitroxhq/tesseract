# Tesseract — TODOs and open questions

Small follow-ups and decisions that are deliberately deferred. Not a worklog; when one is answered, log the
change in `WORKLOG.md` and remove or tick the item here.

## Theme

- [ ] **Should brand/logo colours change when the theme does?** Right now the navbar marks are pinned to the
  same colours in both themes: tesseract `#a161ea` (hover `#c897ff`) and nitrox `#3232ff` (hover `#5a5aff`).
  The rest of the navbar still flips with `light-dark()`. Revisit whether the marks should brighten on the
  dark canvas (`#c897ff` / `#6a6aff`) for contrast, or stay identical for brand consistency. If they change,
  move `--nav-logo*` and `--nav-nitrox-mark*` back into `light-dark()` and re-check the nitrox blue on
  obsidian.
- [ ] **`meta[name="theme-color"]` is hard-coded** as `#f4effc` / `#0f0f0f` in `script.js`. Consider reading
  the resolved `--canvas` so browser chrome cannot drift from the CSS.
- [ ] **`backdrop-filter` fallback.** The dark pill is translucent with a blur; check it on Firefox/Safari
  and consider a `prefers-reduced-transparency` rule.

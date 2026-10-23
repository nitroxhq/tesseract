
# `design.md` — Design System & Spatial UI Specification
## Tesseract: Design System & Visual Specification

This document details the visual foundations, color tokens, typography scales, and spatial canvas guidelines extracted from the core Tesseract design language.

---

## 1. Color Palette & Design Tokens

### Backgrounds & Surfaces
- **Canvas Base**: `#0f0f0f` (Deep obsidian dark mode)
- **Window Surface**: `#29292d` (Slightly elevated surface for cards and panels)
- **Noise Texture**: `url('./assets/noise.png')` repeat 200px (Subtle organic grain overlay)

### Brand & Accents
- **Primary Purple**: `#A161EA` (Main action color, buttons, active highlights)
- **Primary Glow / Shadow**: `rgba(161, 97, 234, 0.24)`
- **Secondary Violet**: `#C897FF` (Subheadings, borders, badge backgrounds)
- **Nitrox Blue**: `#0B73EE` (System highlights, link badges)
- **Text Color**: `#FFFFFF` (Headings: 100% white, Subtitles: `rgba(255, 255, 255, 0.7)`)

### Window Controls (macOS Stoplights)
- **Close**: `#ff5f57`
- **Minimize**: `#febc2e`
- **Maximize**: `#28c840`

---

## 2. Typography System

All fonts are loaded locally via `@fontsource` to guarantee zero-latency offline rendering.

| Role | Font Family | Fallback | Intended Usage |
| :--- | :--- | :--- | :--- |
| **Display Serif** | `EB Garamond` / `Instrument Serif` | `serif` | Hero headings, elegant section titles |
| **Primary UI Sans** | `Inter` | `sans-serif` | Body text, menus, navigation, card descriptions |
| **Secondary Sans** | `Instrument Sans` | `sans-serif` | Buttons, metadata tags, tooltips |
| **Monospace** | `Geist Mono` | `monospace` | Code blocks, frontmatter headers, keyboard shortcuts |

### Tailwind CSS Theme Mapping (`tailwind.config.ts` or CSS variables)
```css
:root {
  --font-serif: 'EB Garamond', 'Instrument Serif', serif;
  --font-sans: 'Inter', 'Instrument Sans', sans-serif;
  --font-mono: 'Geist Mono', monospace;
}
```

---

## 3. Iconography: Phosphor Icons

Tesseract standardizes on **Phosphor Icons** with the `duotone` weight for depth and brand personality.

- **Weight**: `duotone`
- **Primary Color**: `#A161EA` / `#FFFFFF`
- **Secondary Opacity**: `0.2` - `0.3`
- **Standard Sizing**:
  - Small / Inline: `16px`
  - Navigation / Actions: `20px`
  - Bento Feature Cards: `32px`

---

## 4. Bento Grid & Canvas Architecture

1. **Bento Card Structure**:
   - Border: `1px solid rgba(255, 255, 255, 0.08)`
   - Backdrop: `rgba(41, 41, 45, 0.7)` with `backdrop-filter: blur(12px)`
   - Hover Effect: Border color shifts to `var(--primary-color)` with subtle `0 0 20px var(--primary-shadow)`
2. **Spatial Canvas Coordinates (Nitrox Easel)**:
   - Coordinate map decoupling: Visual position is never stored in the markdown file itself.
   - Cards are stored as `.tesseract/cards/<id>.md`.
   - Layout manifest is stored as `.tesseract/workspaces/<workspace_id>.json`:
     ```json
     {
       "canvas_id": "workspace_nitrox_01",
       "layout": [
         { "card_id": "tess_9a8b7c", "x": 0, "y": 0, "w": 4, "h": 3 }
       ]
     }
     ```

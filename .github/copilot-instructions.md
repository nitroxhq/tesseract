# Tesseract Copilot Instructions

## Project Overview
Tesseract is a static HTML/CSS website for a productivity tool that unifies notes, calendar, todos, content capture, and mind mapping into one interface. The project is in early development with separate pages for landing, app, and about sections.

## Architecture
- **Structure**: Multi-page static site with folders for each section (landing/, app/, about/). Assets stored in `misc/assets/` but linked as `/assets/` in HTML.
- **Pages**:
  - `landing/index.html`: Homepage with hero section and navbar.
  - `app/app.html`: Main app interface (currently minimal with topBar and tabBar).
  - `about/index.html`: Story page explaining the tool's philosophy.
- **No JavaScript or build tools**: Pure HTML/CSS, no dynamic functionality yet.

## Styling Conventions
- **Theme**: Dark mode with black background (`background-color: black`) and white text (`color: white`).
- **Fonts**:
  - Body text: Inter sans-serif (`font-family: "Inter", sans-serif`).
  - Headings: Instrument Serif (`font-family: "Instrument Serif", serif`).
- **Layout**: Centered text for heroes, responsive with `viewport` meta.
- **Assets**: Images like `wrotebook-glyph.png` used for logos.

## Development Workflow
- **No build process**: Edit HTML/CSS directly, no compilation or bundling.
- **Git**: Standard setup with LF normalization (`.gitattributes`).
- **Deployment**: Static hosting, ensure `/assets/` paths resolve correctly (currently in `misc/assets/`).

## Key Files
- `README.md`: Brief description of the tool.
- `landing/landstyle.css`: Landing page styles.
- `app/appstyle.css`: App page styles (minimal).
- `about/styles.css`: About page styles with serif headings.

## Patterns to Follow
- Use semantic HTML with proper headings and paragraphs.
- Maintain consistent dark theme across pages.
- Link fonts from Google Fonts (Inter and Instrument Serif).
- For new pages, create in dedicated folders with matching CSS files.</content>
<parameter name="filePath">c:\Users\K1404887\OneDrive - Katy Independent School District\GitHub\Tesseract\.github\copilot-instructions.md
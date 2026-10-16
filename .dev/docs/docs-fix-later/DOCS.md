### Suggested Next Steps for Your Repo
1. Create `docs.md`, `agents.md`, and `design.md` in your project root or `.dev/` folder and paste the respective blocks above into them.
2. When ready, initialize the Vite + React + TypeScript configuration and wire up the font packages to swap out the remote CDN links.

# `docs.md` — Architectural Blueprint & Setup Guide


# Tesseract: Architecture & Developer Guide

Tesseract is a local-first, offline-first, cross-platform productivity supertool built with **React**, **Tailwind CSS**, and **Tauri**, written with strict TypeScript type safety. It runs both as a zero-dependency web application and compiles natively to Desktop (Windows, macOS, Linux) and Mobile (Android, iOS) via Tauri 2.0.

---

## 1. Core Architecture: The Platform Abstraction Layer (PAL)

To allow the exact same React codebase to run in a browser and inside Tauri, all native capabilities (filesystem, notifications, clipboard, window management) are accessed through an **Adapter Pattern / Dependency Injection layer**.

```
                ┌──────────────────────────────────────┐
                │          React UI Components         │
                └──────────────────┬───────────────────┘
                                   │
                   ┌───────────────▼───────────────┐
                   │  Platform Interface (Storage) │
                   └───────┬───────────────┬───────┘
                           │               │
        ┌──────────────────▼──┐         ┌──▼───────────────────┐
        │  Tauri FS Adapter   │         │    Web OPFS Adapter  │
        │  (Rust IPC invoke)  │         │  (Origin Private FS) │
        └─────────────────────┘         └──────────────────────┘
```

### TypeScript Storage Interface Contract (`src/lib/storage/types.ts`)
```typescript
export interface StorageAdapter {
  readFile(path: string): Promise<string>;
  writeFile(path: string, content: string): Promise<void>;
  listDir(path: string): Promise<string[]>;
  exists(path: string): Promise<boolean>;
}

export function isTauri(): boolean {
  return typeof window !== 'undefined' && '__TAURI_INTERNALS__' in window;
}
```

---

## 2. Zero-Stall Offline Architecture

To eliminate render-blocking stalls during app startup when offline:

1. **Self-Hosted Web Fonts**: Replace the Google Fonts `<link>` / `@import` with bundled WOFF2 files or `@fontsource` packages:
   - `@fontsource/eb-garamond`
   - `@fontsource/inter`
   - `@fontsource/instrument-sans`
   - `@fontsource/instrument-serif`
   - `@fontsource-variable/geist-mono`
2. **Bundled Icons**: Use `@phosphor-icons/react` components directly in TypeScript instead of loading `https://cdn.jsdelivr.net/.../@phosphor-icons/web`. Icons are tree-shaken and bundled into the JavaScript chunk at build time.
3. **No External CDNs**: Remove all CDN scripts (`cdn.jsdelivr.net`, `cdn.tailwindcss.com`, Typed.js CDN). Bundle dependencies directly via `package.json`.

---

## 3. Strict TypeScript Configuration (`tsconfig.json`)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": false,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",

    /* Strict Type-Checking Options */
    "strict": true,
    "noImplicitAny": true,
    "strictNullChecks": true,
    "strictFunctionTypes": true,
    "strictBindCallApply": true,
    "strictPropertyInitialization": true,
    "noImplicitThis": true,
    "alwaysStrict": true,

    /* Linter-Grade Compiler Checks */
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUncheckedIndexedAccess": true,
    "exactOptionalPropertyTypes": true,

    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"]
    }
  },
  "include": ["src", "src-tauri"]
}
```

---

## 4. Step-by-Step Setup Instructions

### Step 1: Initialize Vite + React + TypeScript
```bash
npm create vite@latest . -- --template react-ts
```

### Step 2: Install Core Dependencies
```bash
# Icons & Offline Fonts
npm install @phosphor-icons/react @fontsource/inter @fontsource/eb-garamond @fontsource/instrument-sans @fontsource/instrument-serif @fontsource-variable/geist-mono

# State & Typing
npm install zustand clsx tailwind-merge
npm install -D tailwindcss @tailwindcss/vite
```

### Step 3: Initialize Tauri 2.0
```bash
npm install -D @tauri-apps/cli
npx tauri init
```

### Step 4: Configure `tauri.conf.json`
Set your development server URL and build distribution:
```json
{
  "build": {
    "beforeDevCommand": "npm run dev",
    "devUrl": "http://localhost:5173",
    "beforeBuildCommand": "npm run build",
    "frontendDist": "../dist"
  }
}
```

---

## 5. Development Workflow

- Run on Web: `npm run dev` (Runs on Vite dev server at port 5173)
- Run on Desktop (Native): `npx tauri dev`
- Build Web Assets: `npm run build`
- Build Native Installers: `npx tauri build`



---


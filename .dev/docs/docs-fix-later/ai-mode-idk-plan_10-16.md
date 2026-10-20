10.16.2026 - 10:11a
Hmm - also maybe have like 500mb free for basic notes?? Or nah just force email login and/or sso + cloud drive required?? Ofc all text on device cloud is just for sync + selective sync (ie not syncing large/old imgs/files unless explicitly selected by the user)

---

📐 Tesseract: Technical Architecture & Development Roadmap
Project: Nitrox / Tesseract (File-First, Offline-First Productivity Supertool)
Target Architecture: Tauri 2.0 (Rust) + React 19 + TypeScript 6.0 + Tailwind CSS
Core Strategy: Zero-cost server footprint, local file ownership, hybrid cloud/local AI workspace.

1. Local AI Infrastructure (Nebulon Workstation Setup)
To keep development fluid on your laptop without battery drain, offload AI tasks to your desktop server, Nebulon, utilizing your 4GB homelab RAM allocation with the following multi-model optimization strategy:
A. Inline Code Autocomplete (FIM)
Model: Qwen 2.5 Coder 0.6B
Target Performance: ~20 Tokens Per Second (TPS)
Deployment: Locked strictly to inline Fill-in-the-Middle (FIM) predictive text in your editor (Zed or VS Code via Continue.dev). It provides instant typing suggestions without disrupting your train of thought.
B. Background Code Review & Refactoring
Models: Gemma 3 4B (~8–12 TPS) or Qwen 2.5 Coder 7B (~3–8 TPS)
Deployment: Invoked manually via custom editor shortcuts. Use these models to analyze highlighted, broken, or complex code blocks, allowing them to rewrite logic or fix linter errors in the background while you focus on architecture.

2. File-First & Offline-First Data Pipeline
Tesseract stores all user data directly on the local machine in open, non-proprietary formats. System memory caches state via a localized reactive layer (e.g., Zustand or Tinybase), while Tauri's Rust core handles strict native file-system access via Inter-Process Communication (IPC).
[ Frontend: React UI Layout (Zustand / Tinybase) ]
                       │
                       ▼ (Tauri IPC Invokes)
[ Backend: Tauri Rust Core (Native File-System I/O) ]
         ├─────────────────────────┤
         ▼                         ▼
[ Raw Markdown (.md) ]    [ Spatial Layout (.json) ]
(Notes, Tasks, Tracking)   (xTiles/Walling Grid Canvas)

A. Structural Text & Tasks via Structured Markdown
Notes, checkboxes, deadlines, and time tracking are saved inside standard .md files. Rich metadata is embedded directly into the file header using a YAML Frontmatter block:
markdown
---
id: "tess_9a8b7c"
title: "Project Nitrox Launch Plan"
type: "task-doc"
tags: [nitrox, dev-log]
created: 2026-10-16T10:09:00
time_tracked: 14200
status: "in-progress"
---

# Project Nitrox Launch Plan
- [x] Configure Nebulon backend endpoint
- [ ] Connect Zed to custom OpenRouter collection

Use code with caution.
B. Visual Workspace Engine (xTiles / Walling Canvas Grid)
Because visual layout data cannot natively live in raw text files, Tesseract decouples content from structural coordinates:
The Content elements: Grid items are compiled as discrete markdown files housed in a hidden project directory (.tesseract/cards/).
The Canvas Manifest: The structural orientation of the dashboard is saved as a single, lightweight JSON map:
json
{
  "canvas_id": "workspace_nitrox_01",
  "layout": [
    { "card_id": "tess_9a8b7c", "x": 0, "y": 0, "w": 4, "h": 3 },
    { "card_id": "tess_112233", "x": 4, "y": 0, "w": 8, "h": 6 }
  ]
}

Use code with caution.

3. Local-First Canvas Engine (Nitrox Easel Core)
To bypass the limitations of existing canvas options (such as Excalidraw's rigid structure and tldraw's color-inverting dark mode), Nitrox Easel Core operates on a strict file-to-render map:
State Extraction: Utilize standard vector or snapshot APIs (like tldraw's modular snapshots) to dump the active workspace drawing straight into a local .tesseract-canvas JSON file.
Custom Rendering Canvas: For granular control over asset rendering, look toward Fabric.js or PixiJS. This ensures native, accurate dark-mode rendering without relying on lazy browser CSS filters (filter: invert(1)), which break color fidelity.

4. Zero-Cost Sync Strategy
To support advanced collaboration and synchronization without building expensive database clusters, Tesseract relies on two structural paths:
A. Configuration Sync (Supabase Free Tier)
Role: Strictly houses lightweight, encrypted metadata strings (e.g., preference toggles, plugin states, workspace path directories).
Footprint: Negligible. Stays safely within Supabase's permanent 500 MB free database tier, accommodating up to 50,000 monthly active users without cost.
B. File & Cloud Storage Sync (User-Owned Storage)
Bring-Your-Own-Cloud (BYO-Cloud): Users link their existing cloud drives (Google Drive, OneDrive, MEGA). Because Tauri operates natively on the desktop, saving files directly to a local, cloud-managed folder lets the platform's native OS client run background backups automatically.
LAN Peer-to-Peer Routing: For cross-platform real-time sync, clients broadcast state modifications across local sockets. If a synchronization collision occurs, devices verify client ranks (e.g., designating one machine as the primary "server-like" node) to auto-merge conflicts or output a separate .conflict.md fallback file.

If you'd like to draft and send this roadmap directly to your files using Google Drive, please connect your account first: Connect Google Workspace.
Would you like me to generate the Tauri Rust backend methods to handle reading and parsing that YAML frontmatter from your Markdown files, or should we design the React state manager to update the canvas coordinate positions?


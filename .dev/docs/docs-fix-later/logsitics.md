# 2. `agents.md` — AI & Homelab Workstation Architecture


# Tesseract: AI System Architecture & Agent Guidelines

This document outlines the offline-first AI routing model, agent prompt conventions, and the Nebulon homelab integration.

---

## 1. Multi-Tier Model Routing (Nebulon Homelab)

To ensure zero battery drain on laptops while remaining local-first, background AI operations are partitioned across specialized models running on the **Nebulon** local network workstation (4GB RAM allocation):

| Tier | Role | Model | Target Performance | Invocation Method |
| :--- | :--- | :--- | :--- | :--- |
| **Tier 1: FIM** | Inline Code Autocomplete | Qwen 2.5 Coder 0.6B | ~20 TPS | Low-latency stream via editor |
| **Tier 2: Refactor** | Code Review & Lint Resolution | Gemma 3 4B / Qwen 2.5 Coder 7B | ~8–12 TPS | Explicit shortcut on selection |
| **Tier 3: Reasoning** | Architecture Planning & Schema Design | Cloud / Antigravity / Claude 3.5 | N/A | Interactive planning sessions |

---


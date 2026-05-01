---
id: KEI-017
title: Build a project-screenshot capture skill / script
status: in-progress
priority: tier2
estimate: small
---

## Problem
Adding a project to the portfolio requires hero + supporting screenshots. There's no tooling — every screenshot has been ad-hoc (manual `cmd+shift+5` or scattered Playwright calls). As the project list grows (chicknz pending, others likely), this becomes a recurring drag.

Cantrip is the visual bar — its hero shots have correct viewport, no chrome, clean background.

## Solution
Build a thin Playwright-based capture script that takes a URL + optional element selector and writes optimized screenshots into `public/screenshots/`. Wrap it as a project-local skill so it's discoverable and reproducible.

Two surfaces:
- **Hero shot** — landscape 1400×800, full viewport, no scroll bar, no devtools indicator.
- **Detail shot** — element-scoped, preserves aspect ratio.

## Acceptance Criteria
- [ ] A script (e.g. `scripts/capture-screenshot.ts`) that accepts:
  - `--url` (required) — page to capture
  - `--out` (required) — output filename (relative to `public/screenshots/`)
  - `--width` / `--height` (default 1400×800)
  - `--selector` (optional) — element to crop to
  - `--wait` (optional ms, default 1000) — settle time after load
- [ ] Disables Next devtools indicator overlay (passes `?_next-dev-tools=false` or sets a cookie / inlines a CSS hide).
- [ ] Writes WebP by default, with `--png` flag for fallback.
- [ ] One npm script: `bun run capture` invokes it.
- [ ] Skill at `.claude/skills/portfolio-screenshot/` (project-local) with a `SKILL.md` describing usage and a few worked examples (chicknz hero, forge-bi hero re-capture).
- [ ] Documented limitations (no video; auth-walled apps need manual intervention).

## Technical Notes
- Playwright is already a dev dependency via the MCP server; add `@playwright/test` to the project if not present.
- Devtools indicator: Next 15 dev mode injects it. Production builds drop it. Easiest path: capture against `bun build && bun start` instead of `bun dev`. Document this in the skill.
- For private/auth-walled targets (forge-bi behind Clerk, chicknz behind Better Auth), the script should support `--state-file` to load a saved storage state.
- **Future v2**: video capture via `playwright.video()` — out of scope for this ticket but design the script CLI so adding `--video` is a small extension.
- Drop screenshots into `public/screenshots/` then commit them — they're tracked because they're tiny and deployment-relevant.

## What this is NOT
- Not a tool for capturing GIFs or animated demos (separate concern).
- Not a global K-Tingz skill — only this project needs it for now. If chicknz, forge-bi, or another portfolio app wants the same thing, we'll promote it.

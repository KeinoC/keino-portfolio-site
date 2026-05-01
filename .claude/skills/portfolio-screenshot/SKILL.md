---
name: portfolio-screenshot
description: Capture polished hero / detail screenshots for portfolio project case studies using Playwright. Use when adding a new project to lib/projects.ts, refreshing an outdated hero image, or capturing a feature-detail shot. Outputs to public/screenshots/.
---

# portfolio-screenshot

Thin Playwright wrapper for capturing portfolio project screenshots. Defined for the keino-portfolio-site project — not promoted to global skills until another project asks for it.

## When to use

- Adding a new project to `lib/projects.ts` (need a `heroImage` and 1–2 supporting `images`).
- Re-capturing a hero shot that's gone stale (UI redesign, branding change).
- Capturing a feature-detail crop (logo, chart, hero text block).

## When NOT to use

- For animated demos or video. Out of scope; capture a clean still frame instead.
- Hardware projects (esp32) — physical setup required, not browser automation.
- Auth-walled apps without a saved storage state — sign in manually first and pass `--state`.

## Quickstart

```bash
# Public landing page — simplest case
bun run capture --url https://lhbk.org --out lhbk-hero

# Local dev server, custom dimensions
bun run capture --url http://localhost:3008 --out chicknz-hero --width 1400 --height 800

# Auth-walled app — load saved storage state from a prior sign-in
bun run capture --url http://localhost:3008/dashboard --out chicknz-dashboard --state ./.auth/chicknz.json

# Element-scoped crop (logo, chart, etc.)
bun run capture --url https://example.com --out logo --selector "header img"

# WebP output (smaller file, ~50% size of PNG)
bun run capture --url https://example.com --out my-hero --webp
```

Output lands in `public/screenshots/<out>.<png|webp>`.

## CLI options

| Flag | Default | Description |
|------|---------|-------------|
| `--url` | (required) | Page to capture |
| `--out` | (required) | Output filename, no extension |
| `--width` | 1400 | Viewport width |
| `--height` | 800 | Viewport height |
| `--selector` | — | CSS selector to crop to (clips to element bounds) |
| `--wait` | 1500 | Settle time after `networkidle` (ms) — bumps animation completion |
| `--webp` | false | Output WebP instead of PNG |
| `--state` | — | Path to Playwright storage state JSON for auth |
| `--full` | false | Capture full scrollable page (not just viewport) |

## Recipes

### Capture a chicknz dashboard view (auth required)

```bash
# 1. One-time: sign in manually to capture auth state
bunx playwright codegen --save-storage=.auth/chicknz.json http://localhost:3008/auth/signin
# (sign in, then close the codegen window)

# 2. Capture with the saved state
bun run capture --url http://localhost:3008/dashboard \
  --out chicknz-dashboard \
  --state ./.auth/chicknz.json
```

### Capture against a production build (cleaner — no Next devtools indicator)

```bash
# In another terminal, in the target repo:
bun run build && bun run start

# Then:
bun run capture --url http://localhost:3000 --out my-hero
```

The script also injects CSS to hide common Next.js dev overlays as a fallback, but production builds are cleaner.

## Quality bar

A good portfolio screenshot:
- **1400×800** (16:9-ish, plays well with the case-study layout grid).
- **2× device pixel ratio** (script defaults to this).
- **No browser chrome** (Playwright is headless, so this is automatic).
- **No devtools overlays** (production build, or rely on the script's CSS hide).
- **No PII / personal data** in dashboards — capture against a seeded test family / demo workspace.
- **Hero shot shows the core value** — landing page above-the-fold, or the most distinctive UI surface.

Cantrip's `apps/web/public/landing/*.png` are the visual bar to clear.

## Anti-patterns

- ❌ Capturing the dev server with the Next.js dev indicator visible (use prod build, or trust the CSS hider).
- ❌ Mobile-cropped screenshots used as the desktop hero — they look amateur in the case-study layout.
- ❌ Screenshots with chat widgets, cookie banners, or third-party overlays. Either dismiss them via JS injection or hide via CSS.
- ❌ Using `--full` for hero shots — long scrolling page captures are useful for QA, not portfolio heros.

## Future v2 (out of scope)

- `--video` flag wrapping `playwright.video()` for short demo loops.
- Bulk mode reading from a JSON manifest.
- Auto-WebP-and-PNG sibling output for `<picture>` source sets.

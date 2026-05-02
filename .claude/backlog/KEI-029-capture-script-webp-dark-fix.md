---
id: KEI-029
title: Fix scripts/capture.ts --webp pipeline + add --dark flag
status: in-progress
priority: tier3
estimate: tiny
blocked_by:
---

## Problem

Two real bugs / gaps surfaced while doing KEI-027 + KEI-028:

1. **`--webp` was broken.** The original script aliased `webp → png` for Playwright's `screenshot({ type })` arg and wrote the PNG bytes to a `.webp` extension. Files were valid PNGs masquerading as WebPs — same byte size as the PNG output, no codec savings. Caught when KEI-028's "WebP retry" produced files identical to the prior PNG capture.
2. **No `--dark` flag.** KEI-027 forge-bi capture caught the site in light mode (no theme cookie set), producing a bright hero that broke the dark `/work` grid aesthetic. Required a manual recapture with `colorScheme: 'dark'` on the browser context. Worth promoting to a flag so future sites with a `prefers-color-scheme` listener can be captured cleanly.

## Solution

`scripts/capture.ts`:

- Capture as PNG buffer always, then convert to WebP via `sharp(buffer).webp({ quality: 82 })` when `--webp` is passed. Real codec, real file.
- Add `--dark` flag → sets `colorScheme: 'dark'` on the Playwright `browser.newContext()` call.
- `sharp` is already in devDependencies (added during KEI-028 exploration); no package.json change required.

## Acceptance Criteria

- [x] `--webp` produces a real WebP (file command reports `RIFF (little-endian) data, Web/P image`)
- [x] `--dark` produces a dark-mode capture for sites that respect `prefers-color-scheme`
- [x] `bunx tsc --noEmit` passes
- [ ] Branch `KEI-029-capture-script-webp-dark-fix` created off main
- [ ] Commit, push, PR opened

## Notes

- Nothing in `lib/projects.ts` or `public/screenshots/` changes as part of this ticket — this is a pure tooling fix.
- The unrelated in-progress work in the tree (`components/feature-showcase*`, `scripts/illustrate.ts`, `public/landing/`, `M app/page.tsx`, `M package.json`) is **not part of this PR** — left untouched.

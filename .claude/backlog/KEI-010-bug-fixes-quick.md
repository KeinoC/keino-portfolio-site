---
id: KEI-010
title: Quick bug fixes — footer year, goodcall URL, dead asset
status: done
priority: tier3
estimate: xs
---

**Resolution (2026-05-01):**
- Footer year: now dynamic via `new Date().getFullYear()` in both `app/page.tsx` and `app/work/[slug]/page.tsx`. Will never go stale again.
- goodcall.nyc → goodcall.org: fixed in `lib/projects.ts` during the chicknz-add session.
- hitide-portal.png: absorbed into HiTide's `images` array (now has 3 supplementary images alongside the hero).


## Problem
Three small visible bugs surfaced in the audit on 2026-05-01:

- **Footer copyright** in `app/page.tsx` and `app/work/[slug]/page.tsx` reads `© 2025` — current year is 2026.
- **Good Call `liveUrl` is `https://goodcall.nyc`** — that domain 301-redirects to `https://goodcall.org`. Update to the canonical domain so the "View Live" link doesn't bounce.
- **`public/screenshots/hitide-portal.png`** isn't referenced from any project. Either use it or remove it.

## Acceptance Criteria
- [ ] Footer year: dynamic via `new Date().getFullYear()` (so this never goes stale again).
- [ ] `lib/projects.ts` Good Call entry uses `https://goodcall.org`.
- [ ] `hitide-portal.png` is either added to a project's `images` (HiTide currently has 2 — could become 3) or deleted from `public/screenshots/`.
- [ ] No console errors after change.

## Technical Notes
- Footer is duplicated between home and project page — extracting to a shared `<Footer />` is a nice-to-have but out of scope here. Just keep the strings in sync.

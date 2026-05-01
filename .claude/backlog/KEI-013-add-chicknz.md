---
id: KEI-013
title: Add chicknz to lib/projects.ts (with screenshots)
status: in-progress
priority: tier1
estimate: small
---

## Problem
`lib/projects.ts` lists 4 projects (Forge BI, HiTide, LHBK, Good Call) but **chicknz** — multi-tenant AI-native family management app, currently the most active dev project — is not represented. Recruiters viewing the portfolio see a stale snapshot of the work.

## Solution
Add chicknz as a Project entry with full case-study fields, capture quality screenshots, and update `nextProject` chain so navigation flows.

## Acceptance Criteria
- [ ] New entry in `lib/projects.ts` for `slug: "chicknz"`.
- [ ] `tech` reflects real stack: Next.js 15, TypeScript, Prisma, Better Auth, Bun, Vercel AI SDK, Ably, Tailwind.
- [ ] `features` covers 3 standout pillars (e.g. age-adaptive UI, AI background intelligence, multi-tenant by `familyId`).
- [ ] `heroImage` set to a captured screenshot in `public/screenshots/chicknz-hero.png` (or `.webp`).
- [ ] `images` includes 1–2 supporting screenshots (e.g. hub kiosk view, parent dashboard).
- [ ] `liveUrl` set if there's a public preview, otherwise omit (don't ship a broken link).
- [ ] `nextProject` chain updated — insert chicknz at a sensible position, fix the wrap-around.
- [ ] Numbering (`number` field) renumbered consistently if chicknz is inserted in the middle.
- [ ] Smoke test in browser: chicknz appears in Selected Work, the case-study page renders without console errors, the hero image loads at desktop + mobile.

## Technical Notes
- Use the screenshot skill (KEI-017) once it's built. Otherwise, drive Playwright manually against the chicknz dev server (`bun dev` runs on port 3008 in chicknz) and grab the landing page + dashboard.
- `chicknz/CLAUDE.md` has the canonical stack and feature list — copy from there to keep facts honest.
- If chicknz is multi-surface (hub kiosk, parent web, kid PWA), pick ONE surface for the hero image — clutter from multiple viewports is worse than a focused single shot.

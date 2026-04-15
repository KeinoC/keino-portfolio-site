---
id: KEI-001
title: Cleanup — archive stale code & docs
status: done
priority: tier3
estimate: small
---

## Completion note (2026-04-14)

All targeted files and directories soft-archived to `.claude/archived/`. Live components folder now contains only `lenis-provider.tsx`, `nav.tsx`, `selected-work.tsx` (exactly the three the live site imports). `plans/` moved wholesale to `.claude/archived/plans/plans-folder/`. Added `.claude/archived/**` to `eslint.config.mjs` ignore list so archived code doesn't surface warnings. `bun lint` clean, `bun run build` produces only `/`, `/_not-found`, and `/work/[slug]` routes.

**Sanity check passed (2026-04-14):** Dev server started on :3003, all four project pages (`/work/forge-bi`, `/work/high-tide-capital`, `/work/lhbk-web`, `/work/good-call-technologies`) and `/` return 200. Archived `/experiment` route correctly 404s. Home HTML contains expected markers (hero name, "Product Engineer" tagline, "Selected Work", "Experience"). No errors in server log. Full browser visual pass still outstanding — no Playwright/screenshot tool wired in this session — so do one eyeball check in a real browser before considering this dead-sealed, but the smoke signals are all clean.

## Problem
The repo carries a large amount of dead weight from an earlier 3D-physics / globe-world version of the portfolio that was never deployed. The live site at keino.dev is the minimal dark portfolio (Hero → Selected Work → About → Experience → CTA → Footer). Everything else in the repo is leftover experimentation and misleads anyone — human or Claude — trying to orient.

Specifically:
- Root `.md` files describe the archived 3D site, not the live one.
- `components/3d/`, `globe-world/`, `themes/`, `skill-tree/`, `pages/`, `street-scene.tsx`, `three-d-menu.tsx` are unused by `app/page.tsx` or `app/work/[slug]/page.tsx`.
- `app/experiment/`, `app/paper-demo/`, `app/fallback/` are unlinked from the live navigation.
- `plans/` pushes a globe-world direction that's no longer active.

## Solution
Soft-archive (not delete) everything unused into `.claude/archived/` so we can mine elements later (the user explicitly wants to preserve for reuse).

## Acceptance Criteria
- [ ] Root stale docs moved to `.claude/archived/docs/`:
  - `3D_MENU_SETUP.md`
  - `STREET_SCENE_GUIDE.md`
  - `THEME_EXPLORATIONS.md`
  - `CLAUDE_CONTEXT.md`
- [ ] Unused components moved to `.claude/archived/components/`:
  - `components/3d/`
  - `components/globe-world/`
  - `components/themes/`
  - `components/skill-tree/`
  - `components/pages/`
  - `components/street-scene.tsx`
  - `components/three-d-menu.tsx`
  - `components/hero-section.tsx` (verified unused)
  - `components/contact-section.tsx` (verified unused)
  - `components/experience-timeline.tsx` (verified unused)
  - `components/skills-showcase.tsx` (verified unused)
- [ ] Unused routes moved to `.claude/archived/routes/`:
  - `app/experiment/`
  - `app/paper-demo/`
  - `app/fallback/`
- [ ] Obsolete plans moved to `.claude/archived/plans/`:
  - `plans/anqua-theme-design.md`
  - `plans/bot-cube-cleanup.md`
  - `plans/globe-world-progress.md`
  - `plans/architecture.md` (if describes the archived world)
  - `plans/README.md` (describes theme selection that's no longer active)
- [ ] `bun build` and `bun lint` pass after archive moves
- [ ] `keino.dev` still renders identically (visual spot-check)

## Technical Notes
- Use `mv` (not `rm`) — archive, don't delete.
- Before each move, `rg` for imports/references to be safe. Grep already confirmed `app/` does not import any of the listed components.
- `components/3d/CubeSocket.tsx` references `/experiment` — that's in unused 3D code, so moot after archive.
- After archive, run `bun dev`, visit `/` and `/work/forge-bi`, verify no console errors and layout matches current production.
- If anything breaks, restore from `.claude/archived/` (that's the point of soft-archive).

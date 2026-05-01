---
id: KEI-026
title: Cantrip-inspired refresh of /work grid imagery + reorder by impressiveness
status: done
priority: tier1
estimate: small
blocked_by:
---

## Problem
The `/work` index grid feels dry on the image side: each card is a single static screenshot with no motion, no hover signal, no atmospheric framing. Compared to the rest of the site (scroll-driven Selected Work cards, animated nav), the index reads as a flat asset list rather than a curated showcase.

Separately, the project order is roughly chronological (forge-bi first, but zairoo and good-call land near the end). For a recruiter scanning top-of-page, the lineup should lead with the most ambitious, recent, AI-native work and push smaller-scope items (zairoo card-renderer) to the end.

## Solution
Two parallel changes:

**1. Reorder `lib/projects.ts`** — impressive-first:
forge-bi → chicknz → cantrip → lhbk-web → good-call-technologies → high-tide-capital → zairoo

Update each project's `nextProject` so the case-study "next" navigation matches the new display order.

**2. Port cantrip's `WorldCard` motion language into `ProjectCard`** (`app/work/page.tsx`):
- Mouse-tracked 3D tilt on the whole card (±6° perspective rotateX/Y)
- Cursor-following radial glow overlay using each project's `accent` color
- Screenshot leans at rest (`rotateY(-3deg)`), snaps flat on hover
- Atmospheric gradient mask at screenshot bottom (fades into card chrome)
- Tech tags stagger-fade-in on hover instead of always-on (gives the at-rest state a quieter typography hierarchy)
- Bottom-edge accent gradient lights up on hover

Keep the screenshots — the screenshot is the proof for a dev portfolio, unlike cantrip's logo-on-gradient (their content is abstract). Port the motion + atmosphere, not the asset replacement.

## Acceptance Criteria
- [x] `KEI-026` ticket exists in `.claude/backlog/`
- [x] `lib/projects.ts` reordered: forge-bi → chicknz → cantrip → lhbk-web → good-call → hitide → zairoo
- [x] All 7 `nextProject` references updated to chain in the new display order
- [x] `app/work/page.tsx` `ProjectCard` is a client component with cursor-tracked tilt + glow
- [x] Screenshot has rest-state perspective tilt that flattens on hover
- [x] Tech chips stagger-reveal on hover (or stay quiet at rest, animate refresh on hover)
- [x] Bottom-edge accent gradient appears on hover, color sourced from `project.accent`
- [x] No horizontal overflow at 1440px or 430px
- [x] Smoke-tested in browser: hover 2-3 cards, click-through to a case study, follow "next project" link to confirm the chain still works
- [x] Committed on `KEI-026-cantrip-inspired-work-grid` branch (no push to main)

## Notes
- Cantrip's `WorldCard` and `FeatureShowcase` live at `cantrip/apps/web/src/app/_components/{world-card,feature-showcase}.tsx` — direct reference
- This ticket is the "low-lift visual win" pass. The bigger PiP demo system (KEI-020 → KEI-025) is a separate, blocked initiative for the case-study pages

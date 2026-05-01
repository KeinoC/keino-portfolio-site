# keino-portfolio-site backlog

Prefix: `KEI-XXX`. One ticket per discrete improvement. Same pattern as `chicknz` and `forge-bi` — frontmatter (id/title/status/priority/estimate) + Problem / Solution / Acceptance Criteria / Technical Notes.

## Status values
- `ready` — scoped, unblocked, can start
- `blocked` — depends on another ticket or external input
- `in-progress` — actively being worked
- `done` — shipped; keep note of commit/PR

## Priority
- `tier1` — highest ROI for SWE job search (case study depth, visible impact)
- `tier2` — visual polish and differentiators
- `tier3` — hygiene / foundational

## Current tickets

| ID | Title | Priority | Status |
|----|-------|----------|--------|
| KEI-001 | Cleanup: archive stale code & docs | tier3 | done |
| KEI-002 | Rewrite stale project CLAUDE.md | tier3 | done |
| KEI-003 | Extend case-study data model (outcomes, architecture, code snippet) | tier1 | done |
| KEI-004 | Expand case-study page template (new sections) | tier1 | done |
| KEI-005 | Case-study content pass: architecture + whatILearned | tier1 | done |
| KEI-006 | SEO tack-on: OG image, sitemap, robots | tier3 | done |
| KEI-007 | Visual polish v1: hero anchor, mobile card fix, live-URL chip | tier2 | done |
| KEI-008 | Visual polish v2: accent colors, mobile nav drawer | tier2 | done |
| KEI-009 | Positioning copy: CTA for SWE-role framing | tier3 | done |
| KEI-010 | Quick bug fixes: footer year, goodcall URL, dead asset | tier3 | done |
| KEI-011 | Per-project metadata for /work/[slug] (SEO + OG) | tier2 | done |
| KEI-012 | Positioning consistency: finish "Product Engineer" → SWE pivot | tier2 | done |
| KEI-013 | Add chicknz to lib/projects.ts (with screenshots) | tier1 | done |
| KEI-014 | Image optimization: convert PNGs, add priority + sizes | tier2 | done |
| KEI-015 | Accessibility pass: accordion semantics, focus styles | tier2 | done |
| KEI-016 | Fix Framer Motion useScroll non-static container warning | tier3 | done |
| KEI-017 | Build a project-screenshot capture skill / script | tier2 | done |
| KEI-018 | Cleanup unstaged working tree noise | tier3 | done |

## Status (2026-05-01)

All 18 tickets shipped in a single chain. The portfolio is visit-ready: 7 projects with rich case studies (architecture + what-I-learned + per-project accents + GitHub pills), per-project SEO metadata, mobile nav drawer, optimized images, accessibility pass, polished hero with KC monogram, screenshot capture skill in place.

**Open follow-ups (not tickets yet):**
- Real numeric outcomes on each project (declined to fabricate; add as available)
- Shiki SSR for code snippets (deferred — security hook blocked the inline-HTML pattern; plain `<pre>` ships)
- Shared-element transitions between Selected Work cards and case-study pages (skipped — Framer `layoutId` across App Router routes is fragile)

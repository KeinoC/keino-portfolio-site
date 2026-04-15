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
| KEI-004 | Expand case-study page template (new sections) | tier1 | ready (KEI-003 unblocked it) |
| KEI-005 | Case-study content pass: metrics + secondary images | tier1 | blocked on KEI-004 |
| KEI-006 | SEO tack-on: OG image, sitemap, robots | tier3 | done |
| KEI-007 | Visual polish v1: hero anchor, mobile card fix, live-URL chip | tier2 | ready |
| KEI-008 | Visual polish v2: shared-element transitions, accent colors, mobile nav | tier2 | ready |
| KEI-009 | Positioning copy: CTA for SWE-role framing | tier3 | done |

## Suggested execution order
1. KEI-001 (clear the workspace)
2. KEI-003 → KEI-004 → KEI-005 (case-study depth — highest recruiter ROI)
3. KEI-007 (quick visual wins)
4. KEI-006 (SEO tack-on)
5. KEI-009 (copy polish)
6. KEI-008 (optional, time-boxed)

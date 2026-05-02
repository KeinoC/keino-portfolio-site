---
id: KEI-030
title: /work as a two-column dossier list + outcomes backfill
status: in-progress
priority: tier1
estimate: medium
blocked_by:
---

## Problem

`/work` today is a 3-up grid (`<WorkCard/>`) that surfaces almost nothing past hero image + 2-line description + 4 tech chips. The data shape in `lib/projects.ts` already carries:

- `architecture.summary` (7/7 — rich, ~3-sentence "what makes this technically interesting")
- `whatILearned` (7/7)
- `role`, `client`, `timeline`, full `tech` array
- `outcomes` (**0/7 — empty across all projects**)

Recruiters scanning `/work` see a pretty grid, not a substantive dossier. The grid loses against the homepage `<SelectedWork/>` because that already shows the same inventory in a richer scroll-driven layout — `/work` becomes a redundant orphan unless it earns its place by going *deeper*.

Decision (after reviewing 4 design options): go deeper, don't remove. Pattern B from the analysis — two-column dossier list, always-expanded.

## Solution

### Part 1 — Outcomes data backfill

Populate the `outcomes` field for all 7 projects. 1-2 outcomes each: a metric/scope line + a description. Defensible — drawn from each project's existing `architecture.summary`, `features`, and (for client work) the experience bullets in `app/page.tsx`. Drafted by Claude, **reviewed and approved by Keino before applying** — recruiter-facing claims need to be true.

### Part 2 — DossierRow component + /work rewrite

New `components/dossier-row.tsx`. Replace the `<WorkCard/>` grid in `app/work/page.tsx` with a vertical list of `<DossierRow/>`s.

**Row layout (desktop, md+):**
- Left col (~5/12): hero thumbnail (16:10), role badge, year + client line, status pill (Live / In dev / Shipped)
- Right col (~7/12): category eyebrow, title (h3 ~28px), shortDescription, architecture summary (1-2 lines, line-clamp-2), full tech chip strip (no +N truncation), outcomes block (when present), "Read full case study →" CTA

**Row layout (mobile, <md):**
- Single column: thumb full-width, then all metadata stacked

**Motion (carrying KEI-026 language, dialed back):**
- Hover: subtle accent border tint, "Read full case study" arrow nudges right, no 3D tilt (rows are too wide for tilt to feel right)
- Cursor-following accent glow OK but lower intensity (~12% alpha vs grid card's 14%)

**Page chrome:** Keep the existing header (eyebrow + "Work" h1 + Stat strip) and footer. Stat strip becomes more interesting now that outcomes exist — possibly add a 4th stat ("N domains" or "AI projects: M"). Defer to design pass.

## Acceptance Criteria

- [x] `KEI-030-work-dossier-list` branch off main
- [ ] Outcomes copy drafted for all 7 projects, presented to Keino, approved
- [ ] `lib/projects.ts` `outcomes` field populated for all 7
- [ ] `components/dossier-row.tsx` shipped
- [ ] `app/work/page.tsx` switched from `<WorkCard/>` grid to `<DossierRow/>` list
- [ ] `/work` smoke-tested at 1440px and 430px (and 375px sanity)
- [ ] No horizontal overflow at any tested width
- [ ] `bun run lint` + `bunx tsc --noEmit` clean
- [ ] Commit, push, PR opened
- [ ] User reviews PR + signs off before merge

## Out of Scope

- Removing `<WorkCard/>` from the codebase. Leave it — might want it back, and it's small.
- Filter pills (Pattern C). Distinct decision; spawn KEI-031 if wanted later.
- Backfilling `codeSnippet` or `github` fields. Separate effort.
- Touching homepage `<SelectedWork/>` or any other route.
- Touching the unrelated in-progress work in the tree (`feature-showcase`, `illustrate.ts`, `app/page.tsx`, `package.json`).

## Notes

- KEI-026 motion lives on inside the case-study `nextProject` chain and the homepage `<SelectedWork/>` cards — the grid card visual isn't sunk cost even if `/work` no longer uses it.
- The Stat strip "N Stacks" calculation is currently `new Set(projects.flatMap(p => p.tech)).size` — keep that, it's still meaningful at the dossier level.

---
id: KEI-004
title: Expand case-study page template (new sections)
status: blocked
priority: tier1
estimate: medium
blocks: KEI-005
blocked_by: KEI-003
---

## Problem
`app/work/[slug]/page.tsx` renders overview, challenge, features, hero image, and a next-project link. There's no slot for outcomes, architecture, code, additional imagery, or reflection — so even once KEI-003 adds those fields, they won't surface.

## Solution
Extend the case-study page with new sections that render conditionally (only when the project has data for them). Keep the existing minimal visual style.

## Acceptance Criteria
- [ ] **Outcome strip** — large-number treatment for each `outcomes` entry (metric as headline, description below). Renders after the hero. Skipped if no outcomes.
- [ ] **Architecture section** — 2-col layout: summary prose on left, optional `diagramImage` on right. Skipped if no architecture.
- [ ] **Code snippet section** — syntax-highlighted excerpt with caption. Skipped if no `codeSnippet`. Use a lightweight highlighter (shiki with a single theme, loaded server-side) — NOT prism/react-highlight (too heavy).
- [ ] **Image gallery** — renders any images in `project.images` that aren't the hero, as a responsive masonry or single-column stack on mobile. Lazy-loaded.
- [ ] **What I Learned** — callout box near the end with bulleted reflections.
- [ ] **GitHub link** — rendered as a pill in the hero metadata row when `github` is set.
- [ ] Mobile (430px) and desktop (1440px) both verified — no horizontal overflow.
- [ ] Dogfood pass on all 4 project pages — even with partial data (3 of 4 projects will likely only have 1-2 of the new sections until KEI-005 fills content).

## Technical Notes
- Shiki is SSR-safe; prefer `import { getHighlighter } from 'shiki'` in a server component or in `generateStaticParams` pre-pass.
- Keep section order: hero → outcomes → overview → challenge → architecture → features → code → gallery → what I learned → next project.
- Reuse existing typography scale — don't introduce new sizes.
- Each new section should be a named local component inside `app/work/[slug]/page.tsx` (or pulled to `components/case-study/*` if the file gets long).
- Visual rule: sections render only when data exists. A sparse project should still look polished, not empty.

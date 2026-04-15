---
id: KEI-008
title: Visual polish v2 — transitions, accent colors, mobile nav
status: ready
priority: tier2
estimate: medium
---

## Problem
Once v1 polish (KEI-007) is in, three higher-effort differentiators remain:
- **No transition between Selected Work card and the project page** — clicking "View Project" is a hard route jump, losing the visual thread.
- **All project pages look identical** — no visual cue that you've landed in a different project, no personality.
- **Nav is hardcoded inline flex with no mobile menu** — at narrow widths the four nav items will crowd or wrap.

## Solution
Shared-element transitions + per-project accent colors + responsive nav. Time-box: if it starts feeling precious, ship what's working and park the rest.

## Acceptance Criteria

**Shared-element transition:**
- [ ] `Selected Work` card uses `layoutId={project.slug}` (framer-motion) and the project page hero image uses the same `layoutId`
- [ ] Clicking "View Project" animates the card image into the project hero position
- [ ] Falls back gracefully if framer-motion transition fails (don't break navigation)
- [ ] Works with Next.js App Router — may require `LayoutGroup` at the layout level

**Per-project accent color:**
- [ ] Use `project.accent` hex (added in KEI-003) to tint:
  - The tech chip border at hover
  - The "View Project" CTA underline
  - A thin top border on the project hero
- [ ] Keep accents muted — saturation ≤40%, no neon
- [ ] Default gray if `accent` is missing

**Responsive nav:**
- [ ] At `<md` breakpoint, collapse Work/Experience/About/Contact into a hamburger menu
- [ ] Animated open/close (slide or fade)
- [ ] Closes on nav click
- [ ] KC logo stays visible
- [ ] `role="menu"` / `aria-expanded` set correctly

**Quality gates:**
- [ ] Verify shared-element transition at 430px and 1440px — it's easy to break at mobile
- [ ] No layout shift when navigating between project pages
- [ ] Lighthouse accessibility not regressed

## Technical Notes
- Shared-element transitions in Next.js App Router can be finicky. If you spend >2 hours fighting it, ship without it — it's polish, not the main feature.
- Accent colors: prefer deriving from the project's category (AI = muted teal, Legal Tech = muted amber, etc.) rather than arbitrary — makes future projects easier to slot in.
- Mobile nav: no need for a full drawer. Full-screen overlay or dropdown sheet is enough. Keep it short.

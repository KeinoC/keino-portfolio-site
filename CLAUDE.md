# CLAUDE.md — keino-portfolio-site

## Project Overview

Keino Chichester's personal portfolio at **keino.dev**. A minimal, dark, typography-first Next.js site that showcases software engineering work, experience, and contact info. Intended primary audience: software engineering recruiters / hiring managers.

This is a single, deployed site — not an experimental playground. For the archived 3D/globe/physics experiment that used to live here, see `.claude/archived/` (components, routes, docs, and plans from that era are preserved in case we want to mine elements).

## Commands

```bash
bun dev          # Dev server (Turbopack) on port 3000
bun build        # Production build
bun start        # Start production server
bun lint         # ESLint
```

## Tech Stack

- **Framework:** Next.js 15 App Router, React 19, TypeScript strict
- **Styling:** Tailwind CSS 4
- **Animation:** Framer Motion 12
- **Scroll:** Lenis (via `components/lenis-provider.tsx`)
- **UI:** Shadcn only (no Radix directly, no MUI)
- **Icons:** Lucide React
- **Package manager:** Bun

## Live Site Structure

```
app/
  layout.tsx              # Root layout — fonts (Geist, Space Grotesk, DM Sans), global metadata
  page.tsx                # Home: Hero → <SelectedWork/> → About → Experience accordion → CTA → Footer
  globals.css             # Global styles + paper-grain utility
  work/
    [slug]/
      page.tsx            # Case-study page, data-driven from lib/projects.ts

components/
  nav.tsx                 # Fixed top nav, scroll-hide backdrop
  lenis-provider.tsx      # Smooth-scroll wrapper
  selected-work.tsx       # Scroll-driven stacked cards showcasing projects

lib/
  projects.ts             # Source of truth for all project case studies (slug, title, tech, features, images, liveUrl)

public/
  screenshots/            # Project hero/gallery images
  fonts/                  # Custom fonts (if any self-hosted)
  resume.pdf              # Downloadable resume (linked from CTA)
```

Anything in `components/` not listed above — and anything in `app/experiment/`, `app/paper-demo/`, `app/fallback/` — has been archived under `.claude/archived/` as of 2026-04-14. If you find references to `components/3d/`, `components/globe-world/`, `components/themes/`, `components/three-d-menu.tsx`, etc., they belong to the archived 3D experiment and should not be reinstated without explicit discussion.

## Adding / Editing a Project

1. Open `lib/projects.ts`.
2. Add a new entry to the `projects` array — `slug`, `title`, `shortDescription`, `tech`, `features`, `heroImage`, optional `liveUrl`, etc.
3. Drop images into `public/screenshots/`.
4. The home page Selected Work section and the `/work/[slug]` detail page pick up the new project automatically.

The page template is intentionally sparse — a planned expansion (outcomes, architecture, code snippets, gallery, what-I-learned) is tracked in `.claude/backlog/KEI-003` and `KEI-004`.

## Backlog

All planned improvements live under `.claude/backlog/KEI-XXX-*.md` (same pattern as the other K-Tingz projects). See `.claude/backlog/README.md` for the full index and suggested execution order. Pick up the highest-priority `status: ready` ticket and update status to `in-progress` when you start.

## Design Preferences

- No pure white (`#FFFFFF`) text — use off-white (`#F5F5F0`)
- No pure black (`#000000`) text — use near-black (`#1A1A2E`)
- Site palette is dark (`#090909` background). Accent colors kept muted — no neon.
- Typography hierarchy uses `font-headline` (Space Grotesk) for titles and `font-body` (DM Sans) for body.

## Quality Gates (MANDATORY)

After ANY visual change (CSS, layout, component swaps):

1. Start dev server if not running.
2. Navigate to affected page(s) — at minimum, the home route and any project page you touched.
3. Take a screenshot and visually verify the result.
4. For interactive features (scroll-driven cards, hover reveals, nav behavior), click through the full user flow.
5. Test at both mobile (430px) and desktop (1440px) widths. Also sanity-check at 375px.
6. NEVER say "Done" based only on typecheck — typecheck proves it compiles, not that it looks right.
7. Check for horizontal overflow at each tested width — if overflowing, fix before moving on.

## Dogfood After Shipping

Quality Gates prove a feature renders. Dogfooding proves it *works*. For every new feature or case-study content change:

1. Use it as a real user would — click through Selected Work, scroll to the end, visit each project page, click "View Project", check the live URL works.
2. Try empty states and edge cases: what does a project without a `heroImage` look like? What if `liveUrl` is missing?
3. Test at mobile (430px) and desktop (1440px) widths.
4. Actively try to break it for at least 30 seconds.
5. File a ticket under `.claude/backlog/` for anything off.

## Response Preferences (MANDATORY)

- **Options → use `AskUserQuestion`, not text.** When presenting choices, use the `AskUserQuestion` tool — not letter/number lists in a code block.
- **One question per call.** Never batch multiple questions into a single `AskUserQuestion` call — it triggers an extra "Submit all answers" step the user finds annoying. Issue single-question calls across turns.
- **Multi-select = parallel execution.** When the user picks multiple options, dispatch them in parallel (one assistant turn, multiple tool calls).
- **Proactive suggestions.** End a completed task with 1–3 concrete next-step suggestions. Don't suggest unasked-for refactors or scope expansion.

## Development Workflow

- **RALPH loop (default):** Rapid prototype → test in browser → iterate. Use placeholders freely, ship working increments, polish later.
- **Branching:** Implementation work goes on a feature branch → PR → review → merge. Never push implementation straight to `main`.

## Git Safety

- **NEVER** use `--no-verify` on commit or push. If hooks fail, fix the underlying issue.
- **NEVER** use `--force` / `--force-with-lease` without explicit user approval.
- Never commit `.env` files or secrets.

## Code Style

- TypeScript strict mode.
- Tailwind CSS for styling (no CSS modules, no styled-components).
- Shadcn only for UI primitives (no direct Radix, no MUI).
- Conventional commits: `KEI-XXX: type(scope): message` or `type: message` when no ticket. No AI co-authoring attribution.

## Security

- Never commit `.env` files or secrets.
- Validate inputs on both client and server (for any form/API work — the current site is mostly static content).

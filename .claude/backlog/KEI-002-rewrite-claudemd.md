---
id: KEI-002
title: Rewrite stale project CLAUDE.md
status: done
priority: tier3
estimate: xs
---

## Problem
`keino-portfolio-site/CLAUDE.md` describes a 3D physics world (Rapier, KEINO letter sculptures, draggable cube, orthographic camera) that doesn't exist in the live codebase. The live site is a minimal dark Next.js portfolio. The stale file misleads Claude Code sessions into planning for the wrong stack.

## Solution
Rewrite the file to describe the actual stack, structure, and conventions of the currently deployed site. Keep the workspace-wide conventions inherited from `K-Tingz/CLAUDE.md` intact.

## Acceptance Criteria
- [x] Remove all 3D / Rapier / physics / KEINO-letter language
- [x] Describe the live stack: Next.js 15, React 19, TypeScript strict, Tailwind 4, Framer Motion, Lenis, Shadcn, Lucide, Bun
- [x] Document the actual directory structure (`app/`, `components/`, `lib/projects.ts`, `public/screenshots/`)
- [x] Document current routing (`/`, `/work/[slug]`)
- [x] Keep: Quality Gates, Dogfood, Response Preferences, Git Safety, Design Preferences
- [x] Note where the archived 3D experiment lives now (`.claude/archived/`)

## Technical Notes
Completed 2026-04-14 in the same session as the backlog setup. File rewritten in place.

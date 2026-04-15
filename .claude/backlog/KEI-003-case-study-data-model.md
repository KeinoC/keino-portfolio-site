---
id: KEI-003
title: Extend case-study data model (outcomes, architecture, code snippet)
status: done
priority: tier1
estimate: small
---

## Completion note (2026-04-14)

Extended `Project` interface in `lib/projects.ts` with all six planned optional fields: `outcomes`, `whatILearned`, `architecture`, `codeSnippet`, `github`, `accent`. All optional — no breaking changes to the 4 existing projects. `bun run build` passes. No UI wired yet; that's KEI-004. Content population is KEI-005.

## Problem
The `Project` type in `lib/projects.ts` captures overview/challenge/role/tech/features but is missing the fields that make case studies compelling to engineering recruiters:
- No **outcomes / metrics** — zero quantified impact across all 4 projects. Recruiters skim for numbers.
- No **architecture** pointer — reviewers who care about depth have nothing to chew on.
- No **code snippet** — no evidence of how I write code, only that I built something.
- No **reflection** — no "what I learned" or tradeoffs.
- No **GitHub link** for projects that are public.

## Solution
Extend the `Project` interface with optional fields, then update case study content once the page template supports them (KEI-004).

## Acceptance Criteria
- [ ] `Project` interface in `lib/projects.ts` adds:
  - `outcomes?: { metric: string; description: string }[]` — 3-5 items max per project
  - `whatILearned?: string[]` — 2-3 bullets, conversational
  - `architecture?: { summary: string; diagramImage?: string }` — short prose, optional diagram path
  - `codeSnippet?: { title: string; language: string; code: string; caption?: string }` — one excerpt, ≤40 lines
  - `github?: string` — full URL
  - `accent?: string` — hex for per-project accent (used by KEI-008)
- [ ] All new fields are optional (no breaking changes to existing 4 projects)
- [ ] TypeScript strict passes
- [ ] No unit tests required — pure type addition

## Technical Notes
- Keep the interface tight. Don't add fields we won't use.
- Code snippet stored as a string in the data file is fine for now (≤4 projects). If we hit 10+ projects, move to separate `.ts` files per project.
- `architecture.diagramImage` uses the same `public/screenshots/` or a new `public/diagrams/` path — decide during implementation.
- No UI work in this ticket — that's KEI-004.

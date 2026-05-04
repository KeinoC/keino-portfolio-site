---
id: KEI-020
title: PiP demo prep & per-project decisions
status: done
priority: tier2
estimate: medium
---

## Problem
Before any code lands, each project that will host a Picture-in-Picture demo on `/work/[slug]` needs upstream decisions made: which surface gets demoed, whether iframe embedding is even possible, what the demo account looks like, and (for projects we don't control) what gets recorded. Without this, KEI-021 ships a shell with nothing to point at.

## Solution
For each project in `lib/projects.ts`, decide demo mode (`iframe` | `video` | `none`) and capture the inputs the player will need. Land everything as a discriminated `demo` field on the `Project` type — no UI work yet, just data + per-project follow-up tickets in the *other* repos.

Ownership split (confirmed against `~/Development/K-Tingz/`):

| Project | Mode | What's needed |
|---|---|---|
| forge-bi | iframe | Demo account with seeded data, CSP `frame-ancestors keino.dev` |
| chicknz | iframe | Public demo `familyId` + auto-login token via `?demo=...` |
| cantrip | iframe | Pre-rolled demo session route (party + ruleset already loaded) |
| lhbk-web | iframe | Pick public surface (community landing) — staff/CRM is auth-walled |
| high-tide-capital | video | ~30s screen recording, 3 scenes (intake → contract → status) |
| good-call-technologies | video | ~30s screen recording, 3 scenes (queue → call controls → handoff) |
| zairoo | none | Discord-only today; revisit when card-renderer web surface ships |

## Acceptance Criteria
- [ ] Extend `lib/projects.ts` `Project` interface with a discriminated `demo` field:
  ```ts
  demo?:
    | { kind: "iframe"; url: string; minSize?: { w: number; h: number }; credentials?: { hint: string } }
    | { kind: "video"; src: string; poster: string; recordedAt: string }
    | { kind: "none"; reason?: string }
  ```
- [ ] Every project entry filled in (even if `{ kind: "none" }`) so the trigger has something to read.
- [ ] Cross-project tickets opened in each owned repo's backlog and linked here:
  - `FORGE-XXX` — CSP + demo account + seed
  - `CHK-XXX` — public demo tenant + auto-login flow
  - `CAN-XXX` — demo session route
  - `LHBK-XXX` — embeddable public route + CSP audit
- [ ] Shot list written for HiTide and Good Call recordings (3 scenes each, ≤30s, target ≤4MB MP4).
- [ ] Decision recorded for any project that fails CSP testing — fall back to `video` and add to the recording shot list.

## Technical Notes
- Don't include the demo account credentials directly in `lib/projects.ts` — that file is in the public bundle. Use `credentials.hint` ("Sign in with `demo@forge.keino.dev` / `demo`") shown in the PiP overlay; the actual account is provisioned in the target repo, not here.
- Multi-tenant demos (chicknz, cantrip, lhbk staff side) are a security review item — the demo tenant must be truly isolated from real tenants, and the auto-login token must be scoped to that tenant only.
- Test `frame-ancestors` on a preview deploy of each owned project before locking the URL — silent CSP misconfig is the #1 way to ship a broken iframe.
- Iframe `minSize` matters: most apps look broken below ~600×420. Default to that floor in the PiP shell unless a project opts higher.
- This ticket is mostly *coordination*. The actual repo work happens in the other backlogs and lands as cross-repo dependencies for KEI-023.

## Work Log

### 2026-05-04 — Closed

- Extended `Project` interface in `lib/projects.ts` with a discriminated `ProjectDemo` union (`iframe` | `video` | `none`). One refinement vs the ticket spec: `recordedAt` stays `string` (required), but `""` is the agreed sentinel for "not yet recorded" — KEI-024 fills it with an ISO date when the recording ships. Cleaner than making the field optional, since downstream `if (recordedAt) { … }` reads naturally.
- Filled in `demo` for all 7 projects:
  - **forge-bi** → `iframe` (`https://forge.keino.dev/demo`, 760×520, demo-account hint).
  - **chicknz** → `iframe` (`https://chicknz.vercel.app/?demo=preview`, 720×480, sandboxed-family hint).
  - **cantrip** → `iframe` (`https://cantrip.vercel.app/session/demo`, 880×560, pre-rolled-session hint).
  - **lhbk-web** → `iframe` (`https://lhbk.org/community`, 720×480, no credentials).
  - **good-call-technologies** → `video` (`/demos/goodcall-walkthrough.mp4`, recordedAt `""`).
  - **high-tide-capital** → `video` (`/demos/hitide-walkthrough.mp4`, recordedAt `""`).
  - **zairoo** → `none` (Discord-only today; revisit when card-renderer ships a public web surface).
- Cross-project tickets opened (each linked back to KEI-020):
  - `forge-bi`: [FOR-223](../../../forge-bi/.claude/backlog/FOR-223-keino-portfolio-pip-demo.md) — `/demo` route, seeded account, CSP `frame-ancestors`.
  - `chicknz`: [CHK-100](../../../chicknz/.claude/backlog/CHK-100-keino-portfolio-pip-demo.md) — public demo family + auto-login + multi-tenant audit + CSP.
  - `cantrip`: [CNT-295](../../../cantrip/.claude/backlog/CNT-295-keino-portfolio-pip-demo.md) — pre-rolled `/session/demo` + CSP.
  - `LHBK-web-mono`: [LHBK-19](../../../LHBK-web-mono/.claude/backlog/LHBK-19-keino-portfolio-pip-demo.md) — CSP audit on public `/community` route.
- Beefed up KEI-024's body with detailed 3-scene shot lists (per-scene beats, timing, capture notes) for both HiTide and Good Call recordings. The skeleton was already there; this makes them recordable without further design.
- No CSP fallback decisions yet — that comes during KEI-023 when each upstream ticket's preview deploy is verified. If any owned project fails CSP testing, the recovery path is to add it to KEI-024's shot list and flip `kind: "iframe"` → `"video"` on that entry.

Verified `bunx tsc --noEmit` and `bun lint` clean. No UI consumer yet, so no browser smoke test needed — KEI-022 will exercise the data shape end-to-end.

---
id: KEI-023
title: Ship iframe demos for owned projects (forge-bi, chicknz, cantrip, lhbk-web)
status: blocked
priority: tier2
estimate: medium
blocked_by: KEI-020, KEI-021, KEI-022
---

## Problem
The PiP shell + trigger are useless without `demo.url` values pointing at real, embeddable surfaces. Each owned project has a different upstream readiness story (CSP config, demo account, public route selection) — KEI-020 captured the *plan*; this ticket consumes the *output* and lights up each project.

## Solution
For each owned project in `lib/projects.ts`, fill in `demo: { kind: "iframe", url, minSize?, credentials? }` once the cross-project ticket is shipped. Verify each one end-to-end on a Vercel preview deploy: does the iframe load? Does the demo account work? Does CSP allow embedding from `keino.dev`?

This is an integration ticket. The hard work happens in the *other* repos (FORGE-XXX, CHK-XXX, CAN-XXX, LHBK-XXX); KEI-023 just verifies and ships.

## Acceptance Criteria
- [ ] **forge-bi**: `demo.url` set to forge.keino.dev/demo (built in `forge-bi/FOR-220`). Verified loads in iframe from a Vercel preview of keino.dev. CSP `frame-ancestors 'self' https://keino.dev https://*.keino.dev` confirmed on `/demo`.
- [ ] **chicknz**: `demo.url` set to a public demo tenant route (e.g. `chicknz.app/demo?token=...`). Verified loads. Auto-login flow works without prompting. Multi-tenant isolation confirmed (demo can't see real family data).
- [ ] **cantrip**: `demo.url` set to demo session route. Pre-rolled party + ruleset visible on first load. AI DM responds.
- [ ] **lhbk-web**: `demo.url` points at the embeddable public route (community landing) OR a built read-only sample property page. Auth-walled CRM/timesheets explicitly excluded.
- [ ] Each iframe tested at the PiP default size (600×420) — none look fundamentally broken; if they do, set per-project `minSize`.
- [ ] `credentials.hint` filled in only where the demo *requires* sign-in (e.g. forge-bi). Skip on projects with a public demo.
- [ ] Smoke test from Selected Work → case-study page → "Try it live" → demo loads → minimize → expand → close, for each of the 4 projects.
- [ ] Verified in both Chrome and Safari (Safari has historically been pickier about iframe cookies / `SameSite`).
- [ ] If any project fails iframe testing despite KEI-020 prep, fall back to `kind: "video"` and add it to KEI-024's shot list.

## Technical Notes
- This ticket is *purely consumption*. If a cross-project ticket isn't done, this ticket stays `blocked` for that specific project — ship the others, keep blocked entry visible, don't merge a half-broken state.
- Don't put real customer / family / session data behind the demo URLs even momentarily. The first time the iframe loads from a Vercel preview, it'll be cached and indexed somewhere.
- Test the failure mode: what happens if forge.keino.dev returns 5xx? The PiP should show an error state with "Open in new tab" — don't let a flaky third-party-feeling iframe spin forever.
- Cookie scoping: if the parent (keino.dev) and demo (forge.keino.dev) are subdomains of the same parent, `SameSite=Lax` works. If a future demo is on a totally different domain, will need `SameSite=None; Secure` and may break Safari's third-party cookie defaults — flag if it comes up.
- Recruiter likely won't sign in. Even when `credentials.hint` is provided, design the demo so the *unauthenticated* state is also valuable (landing page, marketing surface, screenshots) — the iframe shouldn't be a useless login screen for 90% of viewers.

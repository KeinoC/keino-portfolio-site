---
id: KEI-024
title: Ship video demos for client projects (high-tide-capital, good-call-technologies)
status: blocked
priority: tier2
estimate: small
blocked_by: KEI-020, KEI-021, KEI-022
---

## Problem
HiTide Capital and Good Call Technologies are former-client projects we don't host or control. Their live URLs almost certainly block embedding (`X-Frame-Options: DENY` or restrictive `frame-ancestors`). Without a fallback, the PiP system silently degrades to "Visit Site" for these — losing the in-site demo benefit on 2 of the 7 case studies.

## Solution
Record short, polished screen captures of each client product, ship as MP4 in `public/demos/`, and wire them through `demo: { kind: "video", ... }` so the PiP plays them in a fully-controlled, embeddable surface.

Specs:
- ≤30s, no audio (autoplay-friendly), 1280×800 viewport
- 3 scenes per project, slow cursor moves, no chrome (browser bar cropped)
- MP4 (H.264) ≤4MB, target ≤2MB if possible
- Poster frame extracted at 0:01 for instant render

## Acceptance Criteria
- [ ] **high-tide-capital**: 3-scene recording (borrower intake → DocuSign contract flow → loan status), saved as `public/demos/hitide.mp4` + `public/demos/hitide-poster.jpg`.
- [ ] **good-call-technologies**: 3-scene recording (incoming call queue → operator dashboard with hold/transfer → call history), saved as `public/demos/goodcall.mp4` + `public/demos/goodcall-poster.jpg`.
- [ ] Both projects updated in `lib/projects.ts` with `demo: { kind: "video", src, poster, recordedAt: "2026-05" }`.
- [ ] Videos compressed below 4MB each (verified with `ls -lh`). Re-encode with `ffmpeg -crf 28 -preset slow` if needed.
- [ ] Posters under 100KB each.
- [ ] Smoke test: case-study → "Watch demo" → video plays → minimize pauses → expand → ESC closes. Tested at 1440px and 430px.
- [ ] Recording date caption visible inside the PiP chrome (so visitors know it's a recording, not live).

## Shot Lists

### high-tide-capital — `hitide.mp4` (~28s)

| # | Scene | ~Duration | Beats |
|---|-------|-----------|-------|
| 1 | **Borrower intake** | 0:00 – 0:09 | Open on a fresh borrower-application step (Identity). Cursor enters name + email (typed at human speed). Click "Next." Brief pause on Eligibility step showing 3 green checks. |
| 2 | **DocuSign contract flow** | 0:09 – 0:20 | Transition into the contract step. Show envelope generation toast → embedded DocuSign signing iframe (1-2s). Cursor signs (autofill animation). "Contract signed" confirmation lands. |
| 3 | **Loan status** | 0:20 – 0:28 | Cut to the loan dashboard view. Cursor hovers over the status timeline (Submitted → Underwriting → Approved → Funded). Hold on Approved. Fade out. |

**Capture notes**
- Use a seeded demo borrower (no real PII). Names like "Sample Applicant" / "demo@hitide.example".
- DocuSign step should use a sandbox envelope — don't record the live integration.
- 1280×800 viewport, browser chrome cropped, cursor ring on for visibility.

### good-call-technologies — `goodcall.mp4` (~28s)

| # | Scene | ~Duration | Beats |
|---|-------|-----------|-------|
| 1 | **Incoming call queue** | 0:00 – 0:09 | Open on the operator dashboard with the call queue visible. A new call appears at the top (badge animates in). Cursor hovers; shows precinct + caller metadata. Click "Pick up." |
| 2 | **Operator dashboard — hold / transfer** | 0:09 – 0:20 | Active call panel. Cursor demonstrates Hold (button toggles, badge pulses) → Transfer (modal opens, picks an attorney from list) → Conference (third party joins, panel updates). |
| 3 | **Call history** | 0:20 – 0:28 | Cut to the call-history surface. Scroll a few entries (status, duration, attorney). Hover one row to reveal the audit trail. Fade out. |

**Capture notes**
- Use a sandbox tenant with mock calls — no real custody data ever, even on a recording.
- If the live operator dashboard isn't accessible, record from a local clone with stub Twilio events.
- 1280×800 viewport, no PII in the queue (mock numbers, mock precincts).

## Technical Notes
- Use Playwright or QuickTime. Playwright's `video.startTracingToStream` is overkill for 30-second clips; QuickTime → ffmpeg compress is faster.
- Don't include real customer data even on a screen recording. Use seeded demo data or a sandbox tenant for both projects. If neither client has one, mock the surface in a local clone — recording can be of a *replica* as long as nothing is misrepresented.
- Avoid showing the browser chrome in recordings — crop to just the app viewport so the embedded video looks native to the PiP.
- Consider storing recordings in `public/demos/` rather than Vercel Blob for now — files small, predictable, no extra hop. Move to Blob only if multiple recordings per project ship.
- This is the *evergreen* fallback for any project that turns out unembeddable — if KEI-023 finds chicknz or cantrip can't be iframed (CSP, multi-tenant complexity, auth walls that can't be opened), add them to this ticket's shot list rather than spinning up a new ticket.
- Don't loop the video by default — visitor watches once, then either pops out or closes. Looping creates visual noise on case-study pages and competes with the prose.

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

## Technical Notes
- Use Playwright or QuickTime. Playwright's `video.startTracingToStream` is overkill for 30-second clips; QuickTime → ffmpeg compress is faster.
- Don't include real customer data even on a screen recording. Use seeded demo data or a sandbox tenant for both projects. If neither client has one, mock the surface in a local clone — recording can be of a *replica* as long as nothing is misrepresented.
- Avoid showing the browser chrome in recordings — crop to just the app viewport so the embedded video looks native to the PiP.
- Consider storing recordings in `public/demos/` rather than Vercel Blob for now — files small, predictable, no extra hop. Move to Blob only if multiple recordings per project ship.
- This is the *evergreen* fallback for any project that turns out unembeddable — if KEI-023 finds chicknz or cantrip can't be iframed (CSP, multi-tenant complexity, auth walls that can't be opened), add them to this ticket's shot list rather than spinning up a new ticket.
- Don't loop the video by default — visitor watches once, then either pops out or closes. Looping creates visual noise on case-study pages and competes with the prose.

---
id: KEI-007
title: Visual polish v1 — hero anchor, mobile card fix, live-URL chip
status: ready
priority: tier2
estimate: small
---

## Problem
Current design is minimal and professional but can feel *too* bare on first load:
- **Hero is text-only** — no visual anchor, no identity cue. Two-column layout is clean but identical to a thousand minimal portfolios.
- **Mobile Selected Work cards are 240px tall with `object-cover object-top`** — crops images awkwardly on portrait-ish screenshots.
- **Live URLs buried behind "View Project" click** — recruiters who want to see the thing itself have to go a step deeper than necessary.

## Solution
Three surgical visual fixes. No redesign.

## Acceptance Criteria

**Hero anchor:**
- [ ] Add one subtle visual element near the hero text — options (pick one):
  1. Small monogram signature SVG next to "Keino Chichester"
  2. Lightweight animated accent (e.g. a single slowly-pulsing dot, or a grain texture breathing)
  3. Minimal square portrait with grain overlay
- [ ] Doesn't dominate — supports the text, doesn't compete with it
- [ ] Works at 375px without crowding

**Mobile card aspect ratio:**
- [ ] Inspect each project's `heroImage` at `/work/[slug]` and `#work` mobile — no awkward crop
- [ ] Adjust mobile card height (currently 240px) to a ratio that respects the source image, not a fixed pixel height
- [ ] Alternative: use `object-cover` with `object-position: center` and accept some crop, but verify no critical UI gets clipped

**Live-URL chip on active card:**
- [ ] When a card is the active Selected Work card (`offset === 0`), show a small "Live →" pill in the top-right with the project's `liveUrl` domain
- [ ] Clicking the chip opens the live URL in a new tab (don't steal navigation)
- [ ] Hidden on non-active cards
- [ ] Works on desktop stacked view; on mobile, show inline with title instead

**Quality gates:**
- [ ] Screenshot at 375px, 430px, 768px, 1024px, 1440px after changes
- [ ] No horizontal overflow at any width
- [ ] No console errors
- [ ] Lighthouse performance hasn't regressed (check LCP specifically since hero is now heavier)

## Technical Notes
- The hero anchor is the highest-risk change — easy to look gimmicky. Show a before/after screenshot in the PR and ask for a quick design check before merging.
- Mobile card height: current code is `h-[240px]`. Try `aspect-[4/3]` or `aspect-video` per card. Test each actual project's image.
- Live-URL chip: use `<a target="_blank" rel="noopener noreferrer">`. Include an external-link icon.
- Don't add new fonts or colors. Stay in the existing palette.

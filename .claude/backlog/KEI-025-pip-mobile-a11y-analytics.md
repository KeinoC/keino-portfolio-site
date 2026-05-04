---
id: KEI-025
title: PiP mobile polish, a11y audit, analytics
status: done
priority: tier2
estimate: small
blocked_by: KEI-021, KEI-022, KEI-023, KEI-024
---

## Problem
KEI-021 and KEI-022 establish a working baseline for the PiP system, but mobile, accessibility, and instrumentation are easy to skip during the build and become silent regressions. We need to confirm the experience is a11y-clean, the mobile fallback (full-screen modal) genuinely works, and we can measure whether anyone actually uses the demos.

## Solution
A focused finishing pass on top of the shipped PiP system. No new features — just verify and instrument.

## Acceptance Criteria

### Mobile
- [ ] Verify on real device (iPhone Safari + Android Chrome) at 375px, 390px, 430px:
  - PiP shell does NOT render below 768px (sanity check — KEI-021 should already do this).
  - "Try it live" / "Watch demo" trigger opens the correct fallback (full-screen modal for iframe, native video player for video).
  - Modal is dismissable via close button + swipe-down + system back.
  - No horizontal overflow introduced on any case-study page.
- [ ] Touch targets ≥44×44px on the trigger and modal close.

### Accessibility
- [ ] Trigger button has descriptive `aria-label` ("Open Forge BI live demo in a floating window").
- [ ] PiP container has `role="dialog"` + `aria-modal="false"` when floating, `aria-modal="true"` when expanded.
- [ ] Focus management: opening the PiP focuses the chrome region (not the iframe content). Closing returns focus to the trigger.
- [ ] Screen reader announces state changes ("Demo minimized", "Demo expanded").
- [ ] Reduced-motion: no spring transitions; instant state changes.
- [ ] Keyboard-only walkthrough works end-to-end: Tab to trigger → Enter to open → Tab through chrome → ESC to close.
- [ ] axe DevTools clean on `/work/forge-bi` with PiP open in each state.

### Analytics
- [ ] Track these events to whatever analytics surface the site uses (Plausible / Vercel Analytics — match existing pattern):
  - `demo_open` (project, kind)
  - `demo_minimize`
  - `demo_expand`
  - `demo_pop_out` (clicked Open in new tab)
  - `demo_close`
  - `demo_time` (seconds open before close)
- [ ] Verify events fire in dev with the analytics provider's debug mode.
- [ ] Add a one-line readout to `.claude/backlog/README.md` explaining which events the PiP fires (so future-Claude doesn't have to grep).

### Performance
- [ ] No layout shift on the case-study page when PiP opens (PiP is portal-rendered to body — confirm CLS=0).
- [ ] Iframe `<DemoPiP/>` chunk is dynamically imported (`next/dynamic`) — verify `/work/forge-bi` initial JS bundle didn't grow more than ~5KB after this whole feature shipped.

## Technical Notes
- Don't re-test the entire UX on this ticket — KEI-022 and KEI-023 should already have shipped working surfaces. This ticket is *polish + measurement*.
- If axe finds a real a11y issue, fix it here rather than spinning up a separate ticket — that's the spirit of this finishing pass.
- Analytics events should be best-effort — never block the UI on `track()` returning, never bubble errors to the user.
- For `demo_time`, capture a single span (open → close), not per-state-change. Keep cardinality low.
- If `Plausible` is the chosen surface, it ignores high-cardinality custom event props, so `project` should be a slug (`"forge-bi"`), not a free-form title.

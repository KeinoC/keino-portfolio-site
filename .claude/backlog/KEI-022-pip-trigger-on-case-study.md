---
id: KEI-022
title: Wire <DemoTrigger/> into /work/[slug] case-study pages
status: ready
priority: tier2
estimate: small
blocked_by: KEI-020, KEI-021
---

## Problem
`<DemoPiP/>` (KEI-021) is a player driven by a store. Without a trigger on the case-study pages, nothing ever opens. Visitors land on `/work/forge-bi`, scroll, click "Visit Site" → leave the portfolio. Goal of the PiP system is to keep them on-site while interacting with the demo.

## Solution
Add a `<DemoTrigger/>` button to the case-study template at `app/work/[slug]/page.tsx`, near the existing "Visit Site" CTA. Reads from `project.demo` — hides itself when `demo.kind === "none"`, opens the PiP when iframe/video.

Below 768px, the same button opens a full-screen modal (iframe) or new tab (video) instead of the floating PiP — KEI-021 handles the player logic, this ticket handles the trigger affordance and copy.

## Acceptance Criteria
- [ ] `<DemoTrigger project={project} />` component exists in `components/demo-trigger.tsx`.
- [ ] Renders `null` when `project.demo` is missing or `kind === "none"`.
- [ ] Renders next to the existing "Visit Site" / live URL chip on `/work/[slug]`. Layout doesn't break on mobile.
- [ ] Button label: "Try it live" for iframe mode, "Watch demo" for video mode.
- [ ] Click on desktop (≥768px): calls `useDemoPip().open(project.demo)` with project metadata for the PiP header.
- [ ] Click on mobile (<768px):
  - iframe mode → opens an in-page full-screen modal (same iframe, no drag/resize)
  - video mode → opens video in a full-screen modal with native controls (do NOT spawn a new tab; user should stay on the case-study)
- [ ] If `demo.credentials?.hint` is set, show a small dismissible banner inside the PiP/modal: "Sign in with `<hint>`" — copy-to-clipboard on click.
- [ ] Video mode shows "Recorded `<recordedAt>`" caption inside the player chrome.
- [ ] "Open in new tab" pop-out (in PiP chrome) navigates to `demo.url` (iframe) or the project's `liveUrl` (video).
- [ ] No regression on the existing case-study layout — visual smoke test forge-bi and chicknz at 1440px and 430px.

## Technical Notes
- Trigger is a server-component-friendly wrapper around a small client island. Don't hoist the entire case-study page to client.
- Don't auto-open the PiP on page load. Visitor must click — auto-opening would be loud, unexpected, and would break for ad-blocked iframes silently.
- Analytics hooks (open, minimize, expand, pop-out, close, time-in-demo) defer to KEI-025; this ticket only needs the data-attributes in place so KEI-025 can wire them.
- The existing "Visit Site" chip on the case-study page stays. PiP is *additive* — power users still want to open the real site in a new tab; PiP is for casual recruiter demos.
- Reuse the case-study page's existing button styling system (look at how the Visit Site chip is rendered) — don't introduce a new button variant.

---
id: KEI-021
title: Build <DemoPiP/> shell — drag, resize, dock states, iframe + video modes
status: ready
priority: tier2
estimate: large
blocked_by: KEI-020
---

## Problem
Need a reusable Picture-in-Picture player that floats above the case-study pages so visitors can interact with a project demo (iframe) or watch a recorded walkthrough (video) without leaving `/work/[slug]`. Current site has no equivalent — no portal-rendered overlay, no draggable surface, no PiP state machine.

## Solution
Ship a portal-rendered `<DemoPiP/>` component that handles both iframe and video modes, with four dock states (`closed | floating | minimized | expanded`), drag + resize, and proper a11y. Component is decoupled from any specific project — it reads from a context store and renders whatever the trigger pushed in.

State container is a tiny Zustand store (`lib/demo-pip-store.ts`) holding `currentDemo`, `state`, `position`, `size`. Survives in-site route changes so the PiP doesn't blink when navigating between case studies.

## Acceptance Criteria
- [ ] `components/demo-pip.tsx` exists, portal-rendered to `<body>` from the root layout.
- [ ] `lib/demo-pip-store.ts` exposes `useDemoPip()` with `open(demo)`, `close()`, `setState()`, `setPosition()`, `setSize()`.
- [ ] Four dock states implemented:
  - `closed` — unmounted, iframe `src` not set
  - `floating` — bottom-right by default, ~600×420, draggable, resizable from corner
  - `minimized` — pill in corner showing project name + restore icon; iframe stays mounted but video pauses
  - `expanded` — 80% viewport, centered, focus-trapped, ESC closes/restores
- [ ] Drag implemented via Framer Motion `drag` with bounds clamped to viewport.
- [ ] Resize handle on bottom-right corner; respects `demo.minSize` if set; stops at 90% viewport.
- [ ] Iframe mode: `src` only set when `state !== "closed"`. On `closed`, iframe unmounts (don't just hide — frees the document). On `minimized`, iframe stays mounted (so state survives).
- [ ] Video mode: pauses on `minimized`, plays on `floating`/`expanded`, shows poster while paused, `recordedAt` caption visible.
- [ ] Header chrome inside PiP: project title, "Open in new tab" pop-out, minimize/restore toggle, expand/collapse toggle, close (×).
- [ ] Below 768px: `<DemoPiP/>` does not render. Trigger button instead opens a full-screen modal (iframe) or new tab (video) — see KEI-022 for trigger logic.
- [ ] Keyboard: ESC closes (or restores from expanded), Tab cycles through chrome controls, focus trap when expanded.
- [ ] Reduced-motion respected — drag still works, but state transitions skip the spring animation.
- [ ] Position + size persisted to `sessionStorage` so a user moving the PiP doesn't have to re-position on every project visit within the same session.
- [ ] Dev preview route at `app/_dev/demo-pip/page.tsx` (gated to `process.env.NODE_ENV === "development"`) lets you cycle states without case-study coupling.

## Technical Notes
- Use the existing Framer Motion 12 install. Don't add a second drag library.
- Don't use Radix Dialog for the expanded state — it manages focus differently than what we need (we want focus trap *within* the PiP, not within an overlay that dims the page; the page should stay scrollable underneath).
- The portal target is `document.body` — be careful with the existing Lenis smooth-scroll wrapper. Test that scrolling the page underneath the PiP still works (Lenis sometimes captures wheel events too aggressively).
- Iframe `sandbox` attribute: `allow-same-origin allow-scripts allow-forms allow-popups` is the minimum for a real app demo. Don't omit `allow-same-origin` — most apps need it for cookies.
- Iframe `loading="lazy"` doesn't matter once we already gate `src` on `state !== "closed"`, but add it anyway for completeness.
- Don't over-engineer the position math. Storing `{ x, y, w, h }` in viewport-relative coords is fine; recalculate on window resize using a `ResizeObserver` on `document.documentElement`.
- `<DemoPiP/>` should be tree-shakable from pages that don't use it. Mounting an empty store + portal target on every page is fine; loading the player code itself should be dynamic (`next/dynamic` with `ssr: false`).

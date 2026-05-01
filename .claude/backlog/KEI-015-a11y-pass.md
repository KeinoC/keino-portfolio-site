---
id: KEI-015
title: Accessibility pass — accordion semantics, focus styles
status: done
priority: tier2
estimate: small
---

**Resolution (2026-05-01):**
- Experience accordion: outer `<motion.div onClick>` replaced with semantic `<button>` carrying `aria-expanded` + `aria-controls`; panel has matching `id` + `role="region"` + `aria-labelledby`. Keyboard Enter/Space toggles correctly.
- Global focus styles in `app/globals.css` — every `a:focus-visible` and `button:focus-visible` gets a 2px white/40 outline with 2px offset, so keyboard users see a clear ring on every interactive element without needing per-component styles.


## Problem
Two accessibility gaps surfaced during the audit:

1. **Experience accordion** in `app/page.tsx` (`ExperienceRow`) is a `<motion.div onClick>`. It has no role, no `aria-expanded`, no keyboard handlers. Screen readers won't announce it as expandable, and keyboard-only users can't open it.
2. **Focus styles missing** on Selected Work mobile dot indicators, the desktop side-indicator buttons, and "View Project" links inside cards. Default browser outline is also clipped on some elements due to `overflow: hidden` on parent.

## Solution
Replace the accordion's outer container with a `<button>`, add ARIA attributes, and add a Tailwind-driven focus-visible style sitewide.

## Acceptance Criteria
- [ ] Each `ExperienceRow` is a `<button>` (or div with `role="button"` + `tabIndex={0}` + `onKeyDown` for Enter/Space — but a real `<button>` is simpler).
- [ ] Has `aria-expanded={open}` and `aria-controls` pointing to the panel ID.
- [ ] Animated panel has `id` matching `aria-controls` and `role="region"`.
- [ ] Focus-visible styles on every interactive element: `focus-visible:ring-2 focus-visible:ring-white/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[#090909]` (or equivalent).
- [ ] Keyboard test: tab through home page, verify every link/button gets a visible focus ring, Enter/Space opens accordions.
- [ ] axe / Lighthouse a11y score ≥ 95 on the home page.

## Technical Notes
- `<motion.button>` exists for Framer Motion — drop-in replacement.
- The accordion `<motion.div>` with the panel content needs `aria-hidden={!open}` or just unmount via AnimatePresence (already does).
- Don't replace Lucide icons or change the visual design — focus styles only.

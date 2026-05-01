---
id: KEI-016
title: Fix Framer Motion useScroll non-static container warning
status: done
priority: tier3
estimate: xs
---

**Resolution (2026-05-01):** Set `position: relative` on `html` in `app/globals.css`. The warning's "container" is the scroll container (defaults to `documentElement`), not the target's offsetParent — fixing the section's position alone wasn't enough. Also added `className="relative"` on the Selected Work `<section>` as defensive hygiene.


## Problem
On every page load the console warns:

```
Please ensure that the container has a non-static position, like 'relative',
'fixed', or 'absolute' to ensure scroll offset is calculated correctly.
```

Source: `useScroll({ target: sectionRef })` in `components/selected-work.tsx`. The section uses `id="work"` with no explicit `position`, so the resolved CSS position is `static`. Framer Motion needs a positioned ancestor (or the target itself) to compute `scrollYProgress` reliably.

## Acceptance Criteria
- [ ] No console warnings on home page load.
- [ ] Selected Work scroll-driven cards still animate identically.
- [ ] No regression in mobile or desktop layouts.

## Technical Notes
- Simplest fix: add `className="relative"` (or `style={{ position: 'relative' }}`) to the `<section>` in `selected-work.tsx`. The sticky inner div is already `top-0`; adding `relative` to the outer section doesn't break sticky behavior because the sticky container is the inner div, not the section itself.
- Verify scroll progression still feels right after the fix — the warning suggests offset calculation might already be subtly off.

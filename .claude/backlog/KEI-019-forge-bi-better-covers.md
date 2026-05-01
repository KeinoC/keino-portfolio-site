---
id: KEI-019
title: Forge BI cover images — capture better hero + supporting shots
status: done
priority: tier2
estimate: small
---

## Problem
Forge BI's `heroImage` is `forge-bi-hero.png` (17KB after optimization — by far the lightest screenshot in `public/screenshots/`). Reviewing the live portfolio: the shot is the marketing landing's above-the-fold hero ("Democratizing Financial Insights for Startups"), which doesn't actually show the *product* — no dashboard, no AI chat, no Plaid bank-sync UI.

Compared to chicknz/cantrip/zairoo/LHBK/HiTide which all have either app-surface or branded-composite hero shots, Forge BI looks under-represented on both Selected Work and the new /work dashboard index.

## Solution
Capture a fresh Forge BI hero (and 1–2 supporting shots) from the actual product surface at forge.keino.dev. Use the `portfolio-screenshot` skill (`bun run capture`).

## Acceptance Criteria
- [ ] New `forge-bi-hero.png` shows the actual product (AI chat, dashboard, or goals view) — not just the marketing landing.
- [ ] 1–2 supporting `images` for the case-study gallery (different surface than the hero — e.g. hero = chat, supporting = Plaid sync or goals).
- [ ] Run captures against a production build (`bun run build && bun start`) so no dev overlay shows.
- [ ] If Forge BI is auth-walled, save a Playwright storage state and pass `--state` to the capture script (recipe documented in the skill).
- [ ] Re-run `scripts/optimize-images.ts` after capture.
- [ ] Verify Selected Work card + /work dashboard card + /work/forge-bi case-study page all render the new shots cleanly.

## Technical Notes
- Same approach for any other project that ends up looking under-represented (HiTide and Good Call also lean toward marketing-page heroes).
- Don't ship dashboard screenshots that contain real customer data. Use a seeded demo workspace.

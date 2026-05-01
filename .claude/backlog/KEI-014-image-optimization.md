---
id: KEI-014
title: Image optimization — convert PNGs, add priority + sizes
status: done
priority: tier2
estimate: small
---

**Resolution (2026-05-01):** Wrote `scripts/optimize-images.ts` (sharp-based PNG palette compression with 2400px max width). Re-ran on all `public/screenshots/` PNGs:
- `lhbk-hero.png`: 4.4MB → 1.25MB (72%)
- `zairoo-hero.png`: 1.16MB → 220KB (81%)
- `cantrip-session.png`: 1.05MB → 347KB (67%)
- All others 50–90% smaller

Added `priority={isActive}` to the active Selected Work card image. Added `sizes="(max-width: 768px) 100vw, (max-width: 1200px) 75vw, 900px"` so Next picks the right derivative. Project hero `<Image>` on case-study page also got `priority`.


## Problem
Hero screenshots are large unoptimized PNGs:
- `lhbk-hero.png` — 543 KB
- `hitide-hero.png` — 392 KB
- `goodcall-hero.png` — 264 KB

Total `public/screenshots/` ≈ 1.3 MB. The home page Selected Work component renders all of them stacked, so on first load every hero PNG is fetched. LCP suffers and there's no `priority` hint on the above-the-fold hero `<Image>`.

## Solution
1. Convert to WebP/AVIF (Next image pipeline does this automatically when sources are smaller — but the source PNGs are still large, so re-export at lower quality first).
2. Add `priority` to the active above-the-fold hero `<Image>` in `selected-work.tsx` (the first card, `offset === 0`).
3. Set proper `sizes` on every `<Image>` so Next picks the right resolution.

## Acceptance Criteria
- [ ] Each hero source ≤ 200 KB (WebP or compressed PNG).
- [ ] `<Image>` for active card has `priority` set on the initial render. Other cards stay lazy.
- [ ] `sizes` reflects layout: e.g. desktop card is ~66vw, mobile is 100vw.
- [ ] Lighthouse LCP on `/` < 2.5s on simulated mobile (mid-tier device).
- [ ] No regression in card visual quality at 2x DPI.

## Technical Notes
- Run `cwebp` or `sharp` on the existing PNGs — keep the originals in `.claude/archived/screenshots-original/` in case we want to re-derive.
- Next 16's image component handles AVIF automatically if you put them in `public/`. You can keep using `.png` extensions in the data layer; the optimizer transforms.
- Don't optimize `forge-bi-hero.png` (51 KB) — already small.
- The Selected Work animation pre-renders adjacent cards, so `priority` only on the first card is fine; the rest can stay lazy.

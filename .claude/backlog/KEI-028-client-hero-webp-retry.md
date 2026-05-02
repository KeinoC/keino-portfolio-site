---
id: KEI-028
title: Retry client-site /work heroes as WebP
status: wontfix
priority: tier2
estimate: small
blocked_by:
---

## Problem
KEI-027 reverted 3 client-site hero recaptures (lhbk, goodcall, hitide) because they ballooned to 1–4MB each — the photographic backgrounds (storefronts, people, etc.) don't compress well as PNG and added repo bloat without delivering new visual information at thumb size. Cantrip was also reverted but not for size reasons (no real composition gain).

The KEI-027 outcome notes flagged the follow-up: "If we want them refreshed in the future, do it with `--webp` and re-evaluate." This ticket does that.

## Solution
Run `scripts/capture.ts --webp` against the 3 client URLs. Compare WebP file sizes against the prior PNGs:
- lhbk-hero.png (281K) → lhbk-hero.webp (target: <500K)
- goodcall-hero.png (110K) → goodcall-hero.webp (target: <300K)
- hitide-hero.png (102K) → hitide-hero.webp (target: <300K)

For each that hits the target with a fresh, non-broken composition: switch the `heroImage` path in `lib/projects.ts` from `.png` to `.webp`, delete the old `.png`. For any that still bloat or look broken: revert and skip.

Cantrip is out of scope here — its issue wasn't size, just composition redundancy with the prior capture.

Note: Next.js Image already auto-converts source to WebP/AVIF for the browser at request time, so this change is mostly a *repo size + git history* optimization, not a per-request bundle-size win. Still worth doing because the bigger files create noise in `git log` and `git diff --stat`.

## Acceptance Criteria
- [ ] `KEI-028-client-hero-webp-retry` branch created
- [ ] WebP captures for lhbk, goodcall, hitide
- [ ] Each kept capture is &lt;500K; reverts otherwise
- [ ] `lib/projects.ts` `heroImage` paths updated from `.png` to `.webp` for kept ones
- [ ] Old `.png` files deleted for kept ones
- [ ] `/work` smoke-tested at 1440px after the swap
- [ ] Committed, pushed, PR opened

## Outcome (2026-05-01) — wontfix

Captured all 3 client heroes via the (newly fixed) `--webp` pipeline. Compared the resulting WebPs against the **currently-shipped** PNGs (the right baseline — the bloated KEI-027 PNG captures we reverted are not):

| Project   | Shipped PNG | New WebP | Δ      |
|-----------|-------------|----------|--------|
| goodcall  | 110K        | 174K     | **+58%** |
| hitide    | 102K        | 126K     | **+22%** |
| lhbk      | 281K        | 382K     | **+36%** |

All 3 WebPs are *larger* than what's already shipped. The premise — "WebP would compress these photographic hero backgrounds better" — doesn't hold here, because the shipped PNGs are already older, lower-resolution, more aggressively cropped frames. Re-capturing pulls in fresh viewport pixels at 1400×800 @ 2× DPR with current site state (more imagery, more gradients), which floors the file size regardless of codec.

Two real findings from the work:
1. The script's `--webp` flag was broken — wrote PNG bytes with `.webp` extension. Fixed via sharp pipeline. Moved to KEI-029 as a standalone capture-script improvement.
2. WebP-vs-PNG isn't free. For photographic SaaS landings the codec wins; for brand-photography hero crops, the PNG is often already small enough that the WebP encoder's overhead + chrominance coding doesn't pay off at high quality settings.

Closing as wontfix. If we ever want fresher client-site captures, capture as PNG and accept the bloat as the cost, or hand-crop the photographic region out before re-encoding.

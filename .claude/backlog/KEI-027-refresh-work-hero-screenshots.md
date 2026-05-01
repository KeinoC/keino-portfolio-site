---
id: KEI-027
title: Refresh /work hero screenshots to pair with KEI-026 motion
status: done
priority: tier1
estimate: small
blocked_by:
---

## Problem
KEI-026 shipped cantrip-inspired motion on the /work grid (3D tilt, accent glow, screenshot lean-in). The motion compounds the *frame* of the hero image — but the underlying screenshots are now the limiting factor. Some are tightly cropped to text; some are screenshots of dev environments rather than production; the cantrip and zairoo heroes are visually quiet against the new card chrome.

## Solution
Run the existing `scripts/capture.ts` (skill: `portfolio-screenshot`) against each project's live `liveUrl` to recapture at 1400×800 @ 2x DPR. For projects without a `liveUrl` (currently zairoo), defer until a public surface exists.

Per-project source:
- forge-bi → https://forge.keino.dev → `forge-bi-hero.png`
- chicknz → https://chicknz.vercel.app → `chicknz-hero.png`
- cantrip → https://cantrip.vercel.app → `cantrip-hero.png`
- lhbk-web → https://lhbk.org → `lhbk-hero.png`
- good-call-technologies → https://goodcall.org → `goodcall-hero.png`
- high-tide-capital → https://hitidecapital.com → `hitide-hero.png`
- zairoo → no live URL → **deferred**

After capture, visual-review each new image. If a new capture looks worse than the prior (e.g. a cookie banner snuck in, hero text changed), `git restore` that file and keep the old one. Don't ship regressions for the sake of "all of them."

## Acceptance Criteria
- [x] `KEI-027-refresh-work-hero-screenshots` branch created
- [x] All 6 live URLs return HTTP 200 (verified before capture)
- [x] Capture runs cleanly for all 6 (or each failure documented + skipped)
- [x] Each new capture visually reviewed against the prior version; only kept if better-or-equal
- [x] `/work` smoke-tested at 1440px after the swap; no broken images
- [x] Committed on `KEI-027-refresh-work-hero-screenshots`, pushed, PR opened

## Notes
- `scripts/capture.ts` outputs to `public/screenshots/<out>.png` at 1400×800 @ 2x DPR. Defaults are correct for this work.
- zairoo lacks a `liveUrl`; revisit when cantrip exposes a public Zairoo tenant page or after KEI-020 (PiP demo prep) lands a demo URL we can capture from.

## Outcome (2026-05-01)
Swept all 6 live URLs. Kept 2, reverted 4:
- ✅ **forge-bi-hero** — 113K → 177K. Cleaner composition, "Democratizing Financial Insights" headline + Get Started/Sign In CTAs visible. Real improvement.
- ✅ **chicknz-hero** — 98K → 282K. Full nav, brand colors, hero "Stop nagging. Start tracking." typography + cartoon family illustration. Strong improvement.
- ❌ **cantrip-hero** — 50K → 137K. Same content as prior (Cantrip title + ruleset cards). Reverted; not worth the size delta.
- ❌ **lhbk-hero** — 281K → 4.1MB. Massive file with no visual gain over prior capture. Reverted to keep the repo / Core Web Vitals sane. Possible future: re-run with `--webp` flag.
- ❌ **goodcall-hero** — 110K → 1.0MB. Disclaimer banner ate the top of the frame; file too big. Reverted.
- ❌ **hitide-hero** — 102K → 2.0MB. Same hero content, ~20× the file size. Reverted.

Pattern: client sites with photographic hero backgrounds blow up file size but don't deliver new visual information. If we want them refreshed in the future, do it with `--webp` and re-evaluate. Forge-bi and chicknz are clean SaaS landings → PNG compresses well, gain is real.

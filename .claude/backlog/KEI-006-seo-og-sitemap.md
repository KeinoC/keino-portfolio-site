---
id: KEI-006
title: SEO tack-on — OG image, sitemap, robots
status: done
priority: tier3
estimate: xs
---

## Completion note (2026-04-14)

Added:
- `app/opengraph-image.tsx` — edge-runtime, Next `ImageResponse`, dark palette matching site. 1200×630, ~40KB PNG. Dogfood-verified — clean hierarchy, brand-consistent.
- `app/twitter-image.tsx` — reuses the OG renderer (re-exports default/alt/size/contentType, declares `runtime` locally because Next disallows re-exporting `runtime`).
- `app/sitemap.ts` — enumerates `/` and `/work/[slug]` for each project in `lib/projects.ts`. New projects pick up automatically.
- `app/robots.ts` — allow-all, points to sitemap, declares host.
- `app/layout.tsx` — added `metadataBase: new URL("https://keino.dev")` so OG relative paths resolve.

Dogfooded locally: `/robots.txt`, `/sitemap.xml`, `/opengraph-image` all return 200 with correct content. After deploy, force-refresh LinkedIn Post Inspector + opengraph.xyz to verify external rendering — LinkedIn cache is aggressive.

## Problem
`app/layout.tsx` already exports solid `metadata` (title, description, OG, Twitter card). Gaps:
- **No OG image** — social previews will render without an image, hurting link clicks on LinkedIn/Twitter/Slack.
- **No `sitemap.ts`** — Google crawl efficiency.
- **No `robots.ts`** — no explicit allow directive.
- **Twitter card is `summary_large_image`** but there's no image, so LinkedIn/Twitter will fall back awkwardly.

## Solution
Add the missing pieces. All one-file additions inside `app/`.

## Acceptance Criteria
- [ ] `app/opengraph-image.tsx` (or a static image in `public/`) — 1200×630. Simple, branded. Could be: "Keino Chichester — Product Engineer" headline + subtle grain texture + keino.dev URL. No stock photos.
- [ ] `app/twitter-image.tsx` (or reuse OG)
- [ ] `app/sitemap.ts` — enumerate `/`, `/work/[slug]` for each project in `lib/projects.ts`
- [ ] `app/robots.ts` — allow all, point to sitemap
- [ ] Test the social preview via [opengraph.xyz](https://www.opengraph.xyz/) after a deploy
- [ ] `metadata.metadataBase` set in `layout.tsx` so relative OG paths resolve

## Technical Notes
- Prefer Next.js's `ImageResponse` API for the OG image — keeps it in the repo, no external tool needed.
- Keep the OG image design consistent with the site: dark `#090909` background, off-white text, grain overlay if feasible.
- After deploy, re-test the preview; LinkedIn caches aggressively — use their [Post Inspector](https://www.linkedin.com/post-inspector/) to force refresh.

---
id: KEI-011
title: Per-project metadata for /work/[slug] (SEO + OG)
status: done
priority: tier2
estimate: small
---

**Resolution (2026-05-01):** Split `app/work/[slug]/page.tsx` into a server component (page.tsx with `generateMetadata` + `generateStaticParams`) and a client component (`project-client.tsx`). Each project now exposes per-slug title (`{Project Title} — Keino Chichester`), description from `shortDescription`, OG image from `heroImage`, canonical URL, and Twitter `summary_large_image`. Verified via `curl http://localhost:3003/work/chicknz | grep og:` — all tags emit project-specific values.


## Problem
Every `/work/[slug]` page renders the root layout's title — "Keino Chichester — Product Engineer" — regardless of which project is being shown. There's no `generateMetadata` export, so:

- Browser tab title is generic.
- OG/Twitter shares always reference the homepage.
- Search engines can't differentiate project pages.

KEI-006 (sitemap/OG) shipped a single OG image for the homepage. Project pages still inherit the generic one.

## Solution
Add `generateMetadata` to `app/work/[slug]/page.tsx` that returns per-project title, description, OG image, and canonical URL.

## Acceptance Criteria
- [ ] Tab title: `{Project Title} — Keino Chichester` (or similar — keep brand at the end).
- [ ] Meta description: derived from `project.shortDescription` (already exists in data).
- [ ] OG image: prefer the project's `heroImage` if present; fall back to the generic site OG image.
- [ ] OG title + description match the page metadata.
- [ ] Twitter card uses `summary_large_image`.
- [ ] Canonical URL set to the project's slug page.
- [ ] Calling an invalid slug still 404s (don't break `notFound()`).
- [ ] Verify with curl: `curl -s http://localhost:3000/work/forge-bi | grep -E 'og:|<title>'` shows project-specific values.

## Technical Notes
- `generateMetadata` runs on the server, so it can be added even though the page component is `"use client"`. Keep the metadata function in the same file but split out from the client component if Next complains.
- The current `metadataBase` from KEI-006 means relative OG image paths (`/screenshots/forge-bi-hero.png`) will resolve correctly.
- If hero images are >1200px wide they'll work as OG images directly. If smaller, generate a 1200x630 derivative — but probably not worth the engineering for v1.

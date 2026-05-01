---
id: KEI-012
title: Positioning consistency — finish "Product Engineer" → SWE pivot
status: done
priority: tier2
estimate: xs
---

**Resolution (2026-05-01):** Picked "Software Engineer" (matches KEI-009 CTA framing). Updated hero tagline (`app/page.tsx`), root layout title + description + OG + Twitter (`app/layout.tsx`), OG image alt + body (`app/opengraph-image.tsx`). Grep clean — no remaining "Product Engineer" references.


## Problem
KEI-009 updated CTA copy to "Currently exploring full-time software engineering roles", but the user-visible identity strings still read **Product Engineer**:

- Hero tagline (`app/page.tsx`): `<p>PRODUCT ENGINEER</p>`
- Page title (`app/layout.tsx` metadata): `"Keino Chichester — Product Engineer"`
- Default OG/meta description likely repeats the phrase.

A SWE recruiter clicking through from a SWE-targeted CTA lands on a "Product Engineer" page. Inconsistent → mild trust damage.

## Solution
Pick one identity and make every reference match.

## Acceptance Criteria
- [ ] Decide on the canonical title: `Software Engineer` is the safest bet given the audience and KEI-009 framing. Confirm with user before flipping.
- [ ] Hero tagline updated.
- [ ] Root layout `metadata.title` updated.
- [ ] `metadata.description` reviewed for consistent framing.
- [ ] Any leftover instances of "Product Engineer" grepped and updated (or intentionally kept where it's accurate — e.g. role at a past company).

## Technical Notes
- "Software Engineer" is generic but matches the resume + LinkedIn + KEI-009 CTA — coherence wins over distinctiveness here.
- If user prefers a more specific framing ("Full-Stack Engineer", "Product-Minded Software Engineer"), capture that decision in this ticket before edits.

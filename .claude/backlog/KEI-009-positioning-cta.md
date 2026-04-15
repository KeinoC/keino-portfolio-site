---
id: KEI-009
title: Positioning copy — CTA for SWE-role framing
status: done
priority: tier3
estimate: xs
---

## Completion note (2026-04-14)

One-line edit in `app/page.tsx` CTA. Old: *"Have a project in mind? I'm currently available for freelance work."* New: *"Currently exploring full-time software engineering roles. Also open to freelance and contract work."* — leads with SWE job search, keeps freelance as a secondary door. Verified in rendered HTML.

## Problem
The contact CTA currently says *"Have a project in mind? I'm currently available for freelance work."* That positions Keino as a freelancer. The stated career goal (per workspace operating model) is landing a full-time SWE role. Right now the site implicitly signals "hire me per-project," not "hire me full-time."

## Solution
Update the CTA to keep freelance as a secondary door while leading with full-time availability. Small surgical copy change — no structural work.

## Acceptance Criteria
- [ ] CTA headline stays: *"Let's work together."*
- [ ] Subhead updated to something like: *"Currently exploring full-time SWE opportunities. Also open to freelance and contract work."*
- [ ] "Get in touch" button text unchanged
- [ ] "View resume" button unchanged
- [ ] No other pages/sections need updating (Nav, About, Hero stay as-is unless you want a parallel tweak)

## Technical Notes
- Edit is in `app/page.tsx` (currently line ~326). One-line change.
- Consider adding a `<meta name="availability">` or similar semantic hint if recruiters use such things — probably overkill, skip unless there's clear signal it helps.
- If Keino's career plan changes (e.g. focusing on LHBK or Forge BI funding), revisit this copy — don't bake in assumptions that expire.

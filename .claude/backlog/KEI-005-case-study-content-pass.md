---
id: KEI-005
title: Case-study content pass — metrics + secondary images
status: blocked
priority: tier1
estimate: medium
blocked_by: KEI-003, KEI-004
---

## Problem
Once the data model (KEI-003) and template (KEI-004) are in place, we still need real content. Today's case studies read as descriptions, not engineering narratives. Screenshots are underused — `hitide-portal.png` is completely orphaned, and three of four projects use only a single image.

## Solution
Pass through each project, filling in the new fields and wiring up all available imagery.

## Acceptance Criteria
Per-project:

**Forge BI** (personal — full control):
- [ ] 3 outcomes with real numbers (e.g. accounts synced, latency, shipped-in-N-weeks)
- [ ] Architecture summary: Next.js 15 App Router + Vercel AI SDK streaming + Plaid webhook handler + Prisma schema shape
- [ ] Code snippet: one clean excerpt (e.g. the AI chat streaming handler or the Plaid sync job)
- [ ] What I learned: 2-3 bullets
- [ ] GitHub link if public

**HiTide Capital** (client — need permission for metrics):
- [ ] Outcomes using publicly-defensible numbers (engineering metrics are fine: "N document types validated," "DocuSign round-trip <Xs")
- [ ] Architecture summary: Prisma schema scope, DocuSign envelope lifecycle
- [ ] Code snippet: redacted where necessary; prefer something architectural (schema, middleware) over business logic
- [ ] Wire `hitide-portal.png` into `images` (currently orphaned)
- [ ] What I learned: 2-3 bullets

**LHBK Web** (community — need impact numbers if available):
- [ ] Outcomes: traffic or event-signup numbers if accessible; otherwise engineering metrics (page weight, Lighthouse, accessibility score)
- [ ] Architecture summary: CMS flow, static vs dynamic rendering decisions
- [ ] What I learned: 2-3 bullets

**Good Call Technologies** (client — carefully scoped):
- [ ] Outcomes: call-routing reliability, queue depth, precincts served (public-safe framing)
- [ ] Architecture summary: Twilio TwiML flow, operator-dashboard state model
- [ ] Code snippet: Twilio handler or queue manager (sanitized)
- [ ] What I learned: 2-3 bullets

Cross-cutting:
- [ ] All 4 projects have at least 2 images wired through `project.images`
- [ ] No unused screenshots left in `public/screenshots/`
- [ ] Dogfood each project page — verify outcomes render, code block highlights correctly, gallery lays out cleanly at 430px and 1440px

## Technical Notes
- For client work, when in doubt, default to engineering-detail metrics (tech choices, schema decisions, perf numbers) rather than business metrics that need permission.
- Code snippets should reflect *your* engineering taste — don't paste boilerplate. Prefer the one line that shows judgment.
- If a project doesn't have enough substance for a full outcomes section, it's fine to leave it off. A sparse section is better than a filler one.
- If you want to add new projects (chicknz, msk-air, ESP32), file a separate ticket — don't pad this one.

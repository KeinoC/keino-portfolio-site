---
id: KEI-018
title: Cleanup unstaged working tree noise
status: done
priority: tier3
estimate: xs
---

**Resolution (2026-05-01):**
- Deleted `.husky/pre-commit.ktingz-backup` — the shared hook is in place; git history preserves the prior version.
- Moved `.claude/design/GLOBE_WORLD_PLAN.md` → `.claude/archived/` (matches KEI-001 archive convention) and removed empty `.claude/design/`.
- `.husky/pre-commit` modification reviewed (typo cleanup in shared-hook fallback message) — keeping.
- Added `audit-*.png`, `verify-*.png`, `.playwright-mcp/`, `.auth/` to `.gitignore` and removed loose files from disk.


## Problem
`git status` at audit time (2026-05-01):

```
D .claude/Plans/GLOBE_WORLD_PLAN.md
 M .husky/pre-commit
?? .claude/design/
?? .husky/pre-commit.ktingz-backup
```

These have been sitting unresolved. The `GLOBE_WORLD_PLAN.md` deletion is the archived 3D experiment cleanup (KEI-001 territory). The husky changes look intentional but the `.ktingz-backup` is a residue file. `.claude/design/` is untracked and unclear.

## Acceptance Criteria
- [ ] Decide on each file:
  - `.claude/Plans/GLOBE_WORLD_PLAN.md` — confirm intentional delete; commit it.
  - `.husky/pre-commit` modification — review diff, commit if intentional.
  - `.husky/pre-commit.ktingz-backup` — delete unless there's a reason it's hanging around.
  - `.claude/design/` — check contents; either commit, gitignore, or remove.
- [ ] Working tree clean after this ticket.

## Technical Notes
- Don't bundle these into another feature commit — give it a dedicated `chore: tidy working tree` commit so the diff stays auditable.

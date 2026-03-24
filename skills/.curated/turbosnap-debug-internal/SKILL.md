---
name: turbosnap-debug-internal
description: Debug TurboSnap cases for support and Solutions Engineers. Use when you need a raw TurboSnap diagnosis card, internal reasoning, and a customer-safe explanation that can be sent back immediately.
metadata:
  short-description: TurboSnap debugging for internal support work
---

# TurboSnap Debug Internal

Use this skill for active support and Solutions Engineering investigations.

## Required references

Before diagnosing, read these shared core files:
- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `reference/intake-templates.md`
- `reference/trace-minimization.md`

Use the examples if the case shape is similar:
- `examples/internal-investigation.md`

## Workflow

1. Work in `internal-triage` mode unless stats and changed files are already available.
2. Inventory the evidence already available.
3. Choose one normalized diagnosis code from the shared taxonomy.
4. If confidence is not high, request or run the smallest next proof step from the shared evidence ladder and command catalog.
5. If a preview/config bail is already known and stats are available, use `reference/trace-minimization.md`.
6. Render the standard diagnosis card.
7. Append:
   - a customer-safe explanation
   - the single next artifact to request if the case is still unresolved

## Internal-specific behavior

- Use normalized diagnosis codes.
- Be explicit about raw TurboSnap states such as enabled, unavailable, or disabled for this build.
- Prefer targeted repo-aware checks over broad troubleshooting lists.
- Prefer the compact intake and prompt templates in `reference/intake-templates.md`.
- Do not bias toward engineering escalation if the case can still be solved through support guidance.
- Do not recommend turning TurboSnap off as the intended end state.

## Output

Use the internal wrapper add-on from `reference/output-contract.md`.

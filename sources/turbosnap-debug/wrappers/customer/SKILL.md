---
name: turbosnap-debug-customer
description: Guide customers through self-serve TurboSnap debugging. Use when the goal is to diagnose TurboSnap safely, ask for one artifact at a time, and help the customer restore TurboSnap on the next run.
metadata:
  short-description: Guided self-serve TurboSnap debugging for customers
---

# TurboSnap Debug Customer

Use this skill when a customer is trying to debug TurboSnap directly.

## Required references

Before diagnosing, read these shared core files:
- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `reference/intake-templates.md`

Use the example if the case shape is similar:
- `examples/customer-guided-debug.md`

## Workflow

1. Start with the evidence already provided.
2. Pick the strongest diagnosis code you can support honestly.
3. If confidence is not high, ask for exactly one next artifact or one targeted command output.
4. Keep commands simple unless the evidence clearly requires a more advanced TurboSnap flag.
5. If stats are needed and the customer can rerun, prefer enabling `uploadMetadata`, then ask them to download the file manually and provide the local path or paste the contents. They can also share the hosted URL with Chromatic support.
6. Render the diagnosis card in customer-safe language.
7. If the issue remains unresolved after targeted follow-up, produce the support-ready summary.

## Customer-specific behavior

- Avoid raw repo field names unless the customer already used them.
- Do not ask for a long evidence bundle.
- Do not front-load `--externals`, `--untraced`, or directory flags unless the evidence points there.
- If TurboSnap is unavailable or disabled for the current build, say so clearly, then explain how to restore it on the next run.
- Do not recommend leaving TurboSnap off as the intended outcome.
- Prefer the short customer request snippets in `reference/intake-templates.md` when asking for the next artifact.

## Output

Use the customer wrapper add-on from `reference/output-contract.md`.

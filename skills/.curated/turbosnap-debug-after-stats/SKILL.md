---
name: turbosnap-debug-after-stats
description: Validate or minimize TurboSnap fixes after a stats file and changed files are available. Use when the bail reason is already known and you need the smallest technically valid fix path plus coverage risk notes.
metadata:
  short-description: TurboSnap validation and minimization after stats are available
---

# TurboSnap Debug After Stats

Use this skill once the investigation has reached the tracing stage.

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

Use the example if the case shape is similar:
- `examples/internal-investigation.md`

## Workflow

1. Work in `internal-after-stats` mode.
2. Confirm the current diagnosis from the existing evidence before changing the fix path.
3. Validate the current behavior with `chromatic trace` using the provided local stats file or pasted contents plus changed files.
4. If the issue is a preview/config bail, minimize against the first-hop preview imports before proposing `--untraced`.
5. Separate:
   - the minimal technical fix
   - the safer recommended fix
   - the coverage risk
6. Render the standard diagnosis card plus a customer-safe explanation.

## After-stats specific behavior

- Assume the user already has a known bail or active-tracing issue.
- Do not restart from generic setup questions unless the supplied evidence is inconsistent.
- Be explicit about whether TurboSnap is now active, still broad, or still disabled.
- Treat broad trace output as expected behavior until the evidence shows otherwise.
- Do not present the smallest no-bail set as the safe default without a risk note.
- If the only available artifact is a hosted URL, ask the user to download it manually and provide the local path or paste the relevant contents before running CLI trace.

## Output

Use the internal wrapper add-on from `reference/output-contract.md`.

# High-Evidence Investigation Example

## Input

Customer says TurboSnap is enabled, but a change in `packages/ui/src/Button.tsx` retriggered most stories in the monorepo.

They shared:
- `TurboSnap enabled`
- a hosted `.chromatic/preview-stats.trimmed.json` URL
- `--trace-changed=expanded`
- `storybookBaseDir` is not set
- trace output touches shared preview imports and files outside the UI package

## Expected use of the skill

- classify as `TS_ACTIVE_TOO_BROAD` or `TS_CONFIG_BASE_DIR`
- treat the hosted metadata URL as a support-shareable reference and ask the user for a local file path or pasted contents before running trace
- cite the shared imports and missing base-dir evidence
- recommend one targeted next check, likely `npx @chromatic-com/turbosnap-helper` or a repo-aware `chromatic trace` with explicit `-b`
- produce the diagnosis card and, if helpful, a deeper technical note that says TurboSnap is working but directory or shared-import configuration is causing it to treat too much of the repo as relevant

## Workflow phase

This is a Triage to Artifact Request case from `reference/workflow-playbook.md`:
- classify first
- request one next artifact
- prefer a local stats artifact or pasted contents even when a hosted URL exists
- do not jump to `--untraced`

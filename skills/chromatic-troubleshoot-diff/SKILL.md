---
name: chromatic-troubleshoot-diff
description: Diagnose unexpected Chromatic visual diffs, snapshot inconsistencies, font and resource loading drift, animation timing issues, viewport or globals mismatches, sticky or fixed positioning quirks, and nondeterministic story output. Use when snapshots change unexpectedly or the same code produces inconsistent diffs and you need the narrowest next step to stabilize the snapshot.
metadata:
  short-description: Troubleshoot Chromatic visual diffs
---

# Troubleshoot Diff

Diagnose why a Chromatic snapshot changed and identify the narrowest stabilizing fix.

## Required workflow

### 1) Start with current evidence and choose the likely branch

Prefer evidence already provided:
- the build URL or build number
- the affected story name or story ID
- a diff screenshot or a plain-language description of what changed
- whether the same rendering issue appears in local Storybook
- the exact Chromatic parameters or Storybook globals already in play
- any recent changes to fonts, assets, animations, viewport settings, decorators, or shared preview code

Do not ask for a broad repo dump if the current evidence already points to one likely branch.

Choose one primary diagnosis code from `reference/diagnosis-taxonomy.md`.

If multiple signals exist, prioritize:
- a confirmed local rendering problem over Chromatic-only theories
- a deterministic global config cause over story-local speculation
- a concrete timing or animation signal over generic flake language
- a missing baseline or expectation mismatch only after rendering causes have been cleared

### 2) Read the matching Chromatic source notes before proposing a fix

After you choose a likely diagnosis, read the mapped local source file(s) from `reference/source-pack/` via `reference/docs-map.md`.

Prefer the smallest relevant pack:
- font drift: `font-loading.txt`
- viewports or globals: `viewports.txt`
- external assets or async rendering: `resource-loading.txt`, then `delay.txt` if the issue is timing-based
- motion: `animations.txt`, then `delay.txt` only if the animation cannot be disabled cleanly
- sticky or fixed layout behavior: `position-sticky.txt`
- inconsistent or still-ambiguous rendering: `troubleshooting-snapshots.txt`

Do not recommend a fix path that contradicts the local source pack when one of these files clearly applies.

### 3) Separate rendering source from capture source

Always answer this branch early:
- if the issue reproduces in local Storybook, treat it as a component, story, asset, or Storybook behavior problem first
- if the issue does not reproduce locally, look for environment-dependent assets, async timing, globals, fonts, or viewport and mode differences
- if the story intentionally changed, say the diff is expected rather than offering stabilization workarounds

Do not treat `diffThreshold`, ignores, or snapshot suppression as the first-line answer to unexplained drift.

### 4) Ask for the smallest next artifact or proof step

Ask for exactly one next artifact or one targeted repo probe.

Typical next artifacts:
- the exact build URL or build number
- one screenshot or diff link for the affected story
- confirmation whether the issue reproduces in local Storybook
- the relevant story file or `.storybook/preview.*` snippet
- one console or network error if asset loading is suspected

If the repo is available, inspect the exact story and shared preview code before asking for more screenshots. Before asking for more data, look at the code, run and check the local Storybook, and try to reproduce in Playwright if available.

If the issue looks inconsistent across reruns or still resists classification, ask for the rerun build or trace-viewer evidence before escalating to generic debugging advice.

### 5) Output a diagnosis card every time

Always return the diagnosis card from `reference/output-contract.md`.

If confidence is still low:
- name the most likely diagnosis
- say why confidence is limited
- request one exact artifact or repo check
- avoid speculative global rewrites

## Boundaries

- Ask for one artifact at a time.
- Do not recommend `diffThreshold`, snapshot ignores, or broad suppression as the first response to unexplained diffs.
- Do not claim Chromatic is the root cause when the same issue is already visible in local Storybook.
- Use the local source pack when it clearly applies instead of giving generic advice.
- Do not ask for the entire repository, all screenshots, or long CI logs when one story-level artifact would settle the branch.

## References and examples

- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/source-pack/README.md`
- `reference/source-pack/font-loading.txt`
- `reference/source-pack/viewports.txt`
- `reference/source-pack/resource-loading.txt`
- `reference/source-pack/animations.txt`
- `reference/source-pack/position-sticky.txt`
- `reference/source-pack/troubleshooting-snapshots.txt`
- `reference/source-pack/delay.txt`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `template.md`
- `examples/font-loading-drift.md`
- `examples/local-storybook-repro.md`
- `examples/position-sticky-fixed.md`
- `evaluations/README.md`

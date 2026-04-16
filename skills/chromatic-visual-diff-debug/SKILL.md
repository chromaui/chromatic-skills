---
name: chromatic-visual-diff-debug
description: Diagnose unexpected Chromatic visual diffs, snapshot inconsistencies, font or asset rendering drift, animation timing issues, viewport or globals mismatches, and nondeterministic story output. Use when snapshots change unexpectedly, the same code produces inconsistent diffs, or a team needs the smallest next step to stabilize a flaky visual test.
metadata:
  short-description: Diagnose Chromatic visual diffs and stabilization issues
---

# Visual Diff Debug

Public-safe skill for debugging why a Chromatic snapshot changed and what the narrowest stabilizing fix should be.

This package is the single source of truth for:
- visual diff diagnosis codes
- the evidence ladder
- a repo-safe command catalog
- the diagnosis card output contract
- documentation topic mapping
- copy-paste intake templates
- public-safe examples and evaluations

## Quick start

1. Read `reference/workflow-playbook.md` and identify the current phase.
2. Read `reference/diagnosis-taxonomy.md` and choose the strongest diagnosis code the evidence supports.
3. Read `reference/evidence-ladder.md` and decide whether you can answer now or need one more artifact.
4. Use `reference/command-catalog.md` only when the repo is available or one targeted proof step is needed.
5. Render the response with `reference/output-contract.md`.
6. If the user wants follow-up reading, use `reference/docs-map.md`.

## Required workflow

### 1) Start with current evidence

Prefer evidence already provided:
- the build URL or build number
- the affected story name or story ID
- a diff screenshot or a plain-language description of what changed
- whether the same rendering issue appears in local Storybook
- the exact Chromatic parameters or Storybook globals already in play
- any recent changes to fonts, assets, animations, viewport settings, decorators, or shared preview code

Do not ask for a broad repo dump if the current evidence already points to one likely branch.

### 2) Classify before prescribing

Choose one primary diagnosis code from `reference/diagnosis-taxonomy.md`.

If multiple signals exist, prioritize:
- a confirmed local rendering problem over Chromatic-only theories
- a deterministic global config cause over story-local speculation
- a concrete timing or animation signal over generic flake language
- a missing baseline or expectation mismatch only after rendering causes have been cleared

### 3) Separate rendering source from capture source

Always answer this branch early:
- if the issue reproduces in local Storybook, treat it as a component, story, asset, or Storybook behavior problem first
- if the issue does not reproduce locally, look for environment-dependent assets, async timing, globals, fonts, or viewport and mode differences
- if the story intentionally changed, say the diff is expected rather than offering stabilization workarounds

Do not treat `diffThreshold`, ignores, or snapshot suppression as the first-line answer to unexplained drift.

### 4) Ask for the smallest next artifact

Ask for exactly one next artifact or one targeted repo probe.

Typical next artifacts:
- the exact build URL or build number
- one screenshot or diff link for the affected story
- confirmation whether the issue reproduces in local Storybook
- the relevant story file or `.storybook/preview.*` snippet
- one console or network error if asset loading is suspected

If the repo is available, inspect the exact story and shared preview code before asking for more screenshots.

### 5) Output a diagnosis card every time

Always return the diagnosis card from `reference/output-contract.md`.

If confidence is still low:
- name the most likely diagnosis
- say why confidence is limited
- request one exact artifact or repo check
- avoid speculative global rewrites

## Boundaries

- Keep the skill public-safe and customer-safe.
- Ask for one artifact at a time.
- Do not recommend `diffThreshold`, snapshot ignores, or broad suppression as the first response to unexplained diffs.
- Do not claim Chromatic is the root cause when the same issue is already visible in local Storybook.
- Do not ask for the entire repository, all screenshots, or long CI logs when one story-level artifact would settle the branch.
- Do not rely on live external documentation inside the installed skill.

## References and examples

- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `template.md`
- `examples/font-loading-drift.md`
- `examples/local-storybook-repro.md`
- `evaluations/README.md`

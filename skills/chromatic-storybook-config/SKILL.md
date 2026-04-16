---
name: chromatic-storybook-config
description: Diagnose Storybook configuration issues that block Chromatic or local Storybook, including missing stories, framework or builder mismatches, addon conflicts, preview errors, static asset path issues, and package version drift. Use when Storybook fails to build, Chromatic cannot verify Storybook, stories are missing, or a team needs the smallest config change to restore a working Storybook surface.
metadata:
  short-description: Diagnose Storybook configuration issues that block Chromatic
---

# Storybook Config

Public-safe skill for debugging and repairing Storybook configuration issues that block a stable Storybook surface for Chromatic.

This package is the single source of truth for:
- Storybook config diagnosis codes
- the evidence ladder
- a repo-safe config inspection catalog
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

### 1) Inspect the actual Storybook surface first

Prefer evidence already provided:
- the exact error text from Storybook or Chromatic verification
- `.storybook/main.*` and `.storybook/preview.*`
- the Storybook-related section of `package.json`
- the framework and builder in use
- one story file path that should be detected or is failing
- whether local Storybook already fails before Chromatic runs

Do not recommend a config rewrite before you know which file or compatibility edge is actually broken.

### 2) Classify before editing

Choose one primary diagnosis code from `reference/diagnosis-taxonomy.md`.

If multiple signals exist, prioritize:
- a local Storybook build failure over Chromatic-specific follow-on symptoms
- framework or builder mismatches over addon speculation
- exact preview or decorator runtime errors over generic config uncertainty
- story discovery problems before package-version cleanup suggestions

### 3) Separate local Storybook failure from Chromatic follow-through

Always answer this branch early:
- if Storybook already fails locally, fix the Storybook surface first
- if Storybook runs locally but Chromatic cannot verify it, inspect the build script, output expectations, and Storybook config shape next
- if stories are simply missing, prove the story glob or file pattern mismatch before changing builders or addons

Do not mix Vite and Webpack guidance in the same recommendation unless the evidence proves a migration boundary.

### 4) Ask for the smallest next artifact

Ask for exactly one next artifact or one targeted repo check.

Typical next artifacts:
- the exact error block
- `.storybook/main.*`
- `.storybook/preview.*`
- the Storybook dependency and scripts section from `package.json`
- one story file path that should be present or is failing

If the repo is available, inspect those files before asking for more logs.

### 5) Output a diagnosis card every time

Always return the diagnosis card from `reference/output-contract.md`.

If confidence is still low:
- name the most likely diagnosis
- say why confidence is limited
- request one exact config artifact or repo check
- avoid speculative migrations

## Boundaries

- Keep the skill public-safe and customer-safe.
- Ask for one artifact at a time.
- Do not recommend sweeping config rewrites when one file-level fix is more likely.
- Do not assume React, Vite, Webpack, or a specific Storybook major version without evidence.
- Do not invent script names; inspect `package.json` first.
- Do not rely on live external documentation inside the installed skill.

## References and examples

- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `template.md`
- `examples/stories-glob-mismatch.md`
- `examples/preview-runtime-error.md`
- `evaluations/README.md`

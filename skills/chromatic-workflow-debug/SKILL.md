---
name: chromatic-workflow-debug
description: Diagnose Chromatic workflow issues involving git history, baselines, pull request event shape, merge queues, merge-base failures, replacement builds, and patch builds. Use when builds compare against the wrong baseline, an ancestor build is not found, pull request comparisons look wrong, or CI git context does not match Chromatic's expectations.
metadata:
  short-description: Diagnose Chromatic git and baseline workflow issues
---

# Workflow Debug

Public-safe skill for debugging how Chromatic maps CI, git history, and prior builds into comparisons and baselines.

This package is the single source of truth for:
- workflow diagnosis codes
- the evidence ladder
- the command catalog
- the diagnosis card output contract
- documentation topic mapping
- copy-paste intake prompts
- public-safe examples and evaluations

## Quick start

1. Read `reference/workflow-playbook.md` and identify the current workflow phase.
2. Read `reference/diagnosis-taxonomy.md` and choose the strongest diagnosis code the evidence supports.
3. Read `reference/evidence-ladder.md` and decide whether you can answer now or need one more artifact.
4. Use `reference/command-catalog.md` only when the current evidence is insufficient.
5. Render the result with `reference/output-contract.md`.
6. If the user wants follow-up reading, use the topic map in `reference/docs-map.md`.

## Required workflow

### 1) Start with current evidence

Prefer evidence already provided:
- the exact Chromatic command or GitHub Action step
- the relevant warning or error text
- CI event type and branch information
- git checkout settings such as shallow history or detached HEAD
- build URL and the expected comparison target
- any manual overrides like `branchName`, `repositorySlug`, `patchBuild`, or `ignoreLastBuildOnBranch`

Do not ask for a broad dump if the current evidence already points to one branch of the decision tree.

### 2) Classify before proposing changes

Choose one primary workflow diagnosis code from `reference/diagnosis-taxonomy.md`.

If multiple signals exist, prioritize:
- incorrect or missing git history over downstream symptoms
- wrong CI branch or PR event shape over later baseline confusion
- merge-base or patch-build failures over generic comparison complaints
- replacement-build and rebase behavior over speculative Storybook causes

### 3) Ask for the smallest next artifact

Ask for exactly one next artifact or one targeted command result.

Typical next artifacts:
- the exact `actions/checkout` step or equivalent CI checkout snippet
- the exact Chromatic invocation line or action inputs
- `git branch --show-current`
- `git rev-parse HEAD`
- `git log --oneline --decorate -n 10`
- `git merge-base <head> <base>`
- the specific Chromatic warning mentioning baselines, merge base, or no ancestor build

Do not jump straight to Storybook flags or TurboSnap suppression flags unless the workflow evidence already cleared the git branch.

### 4) Stay truthful about the current run

If the current run cannot compute the intended comparison safely, say so plainly.

Examples:
- a shallow checkout means the current run cannot reason about baselines correctly
- a `pull_request` merge commit can point Chromatic at the wrong SHA or branch unless the action passes the correct values
- a rebased branch may need `ignoreLastBuildOnBranch` or a fresh baseline path
- a missing merge base means a patch build path is needed, not a baseline guess

### 5) Output a diagnosis card every time

Always return the diagnosis card from `reference/output-contract.md`.

If confidence is still low:
- name the most likely diagnosis
- say why confidence is limited
- request one exact next artifact or command
- avoid speculative repo surgery

## Boundaries

- Keep the skill public-safe and customer-safe.
- Ask for one artifact at a time.
- Do not rely on live external documentation inside the installed skill.
- Do not recommend unrelated monorepo flags as a first response to git or baseline problems.
- Do not assume the customer is using GitHub Actions unless the evidence says so, but prefer GitHub Actions examples when you need a concrete pattern.

## References and examples

- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `template.md`
- `examples/pr-merge-commit.md`
- `examples/rebase-replacement-build.md`
- `evaluations/README.md`

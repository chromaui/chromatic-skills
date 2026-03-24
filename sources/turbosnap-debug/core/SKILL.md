---
name: turbosnap-debug
description: Diagnose TurboSnap behavior using logs, config, git context, hosted metadata URLs, and targeted trace commands. Use when you need the shared TurboSnap decision tree or want to classify why TurboSnap is enabled, disabled, unavailable, or tracing the wrong stories.
metadata:
  short-description: Shared TurboSnap diagnosis core
---

# TurboSnap Debug Core

Shared TurboSnap diagnostic contract for the internal and customer wrappers.

This package is the single source of truth for:
- normalized diagnosis codes
- the evidence ladder
- the command catalog
- the diagnosis card output contract
- the mapping from diagnosis classes to official docs
- the support workflow for internal and customer use
- reusable intake templates and prompt snippets
- preview-bail trace minimization guidance

## Quick start

1. Read `reference/workflow-playbook.md` and identify which support phase you are in.
2. Read `reference/diagnosis-taxonomy.md` and identify the most likely diagnosis code from the evidence already provided.
3. Read `reference/evidence-ladder.md` and decide whether you can diagnose immediately or need one more targeted artifact.
4. Use `reference/command-catalog.md` only when evidence is incomplete or the repo is available and targeted proof is needed.
5. If the issue is a preview/config bail and the task is to restore TurboSnap, read `reference/trace-minimization.md`.
6. Render the result using `reference/output-contract.md`.
7. If you cite docs or give follow-up reading, use `reference/docs-map.md`.

## Operating modes

Choose one mode before you start:
- `internal-triage`: classify the issue and decide the next artifact to request
- `internal-after-stats`: use changed files and a stats file to validate or minimize the fix path
- `customer-guided`: explain findings in plain language and ask for one artifact or command at a time

If the user did not specify a mode, infer it from the evidence:
- build URL, logs, and no stats file yet usually means `internal-triage`
- changed files plus stats file, hosted metadata URL, or trace output usually means `internal-after-stats`
- direct customer conversation usually means `customer-guided`

## Required workflow

### 1) Start with current evidence

Prefer evidence already in the conversation:
- CLI output
- `chromatic.config.json`, `package.json` scripts, or CI snippets
- Storybook build details
- hosted metadata URLs under `.chromatic/`
- changed file lists
- prior `chromatic` or `chromatic trace` command output
- screenshots or customer summaries

Do not jump to speculative fixes if the current evidence already maps cleanly to a diagnosis code.

### 2) Classify before probing

Map the issue to one normalized diagnosis code from `reference/diagnosis-taxonomy.md`.

If the case includes multiple signals, choose:
- the strongest hard-bail or availability state first
- otherwise the highest-confidence active-tracing diagnosis
- otherwise `TS_NEEDS_MORE_EVIDENCE`

### 3) Follow the support phases

Use the workflow in `reference/workflow-playbook.md`.

The default support path is:
- Phase A: classify the build state and name the bail or active-tracing diagnosis
- Phase B: ask for the smallest next artifact
- Phase C: if stats and changed files are available, run targeted trace and minimize only when needed
- Phase D: return the diagnosis card plus a customer-safe next step

Do not skip directly to `--untraced` or repo surgery when the current phase is still classification.

### 4) Preserve TurboSnap, but stay truthful

The remediation posture is to restore or preserve TurboSnap where possible.

That does not permit hiding reality:
- if TurboSnap is unavailable, say so
- if TurboSnap is disabled for the current build, say so
- if a full rebuild is happening now, say so

Then pivot to the exact fix path that restores TurboSnap on the next run.

### 5) Output a diagnosis card every time

Always return the diagnosis card from `reference/output-contract.md`.

If you cannot reach a confident fix:
- name the most likely diagnosis
- state confidence honestly
- ask for the next artifact
- or, for customer flows, emit the support-ready summary format

## Prompting and intake

Use `reference/intake-templates.md` when:
- an internal user wants a prompt to hand to the skill
- a customer needs a copy-paste request for the next artifact
- the team wants a standard intake form for SE handoff

The canonical prompt templates should live in this skill so they stay versioned with the workflow.

Customer-facing snippets should still be shared as needed:
- keep them short
- request one artifact at a time
- avoid internal field names unless the customer already used them
- prefer a single exact command over a list of options
- prefer hosted metadata URLs over local stats paths once the workflow has reached a stats stage

## Boundaries

- Do not recommend “just leave TurboSnap off” as the intended end state in v1.
- Do not suggest `--externals`, `--untraced`, `--storybook-base-dir`, or `--storybook-config-dir` unless the evidence points there.
- Do not ask for large evidence bundles when one smaller artifact would settle the branch.

## References and examples

- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `reference/intake-templates.md`
- `reference/trace-minimization.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `examples/internal-investigation.md`
- `examples/customer-guided-debug.md`
- `evaluations/README.md`

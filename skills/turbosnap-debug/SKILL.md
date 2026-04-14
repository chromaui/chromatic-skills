---
name: turbosnap-debug
description: Diagnose TurboSnap behavior using logs, config, git context, support-shareable hosted metadata references, and targeted trace commands. Use when you need to classify why TurboSnap is enabled, disabled, unavailable, or tracing the wrong stories, then recommend the smallest valid next step.
metadata:
  short-description: Adaptive TurboSnap diagnosis and fix guidance
---

# TurboSnap Debug

Public TurboSnap diagnostic contract for customers, support, and engineers.

This package is the single source of truth for:
- normalized diagnosis codes
- the evidence ladder
- the command catalog
- the diagnosis card output contract
- the local documentation guidance
- the support workflow across low-evidence and stats-rich cases
- reusable intake templates and prompt snippets
- preview-bail trace minimization guidance

## Quick start

1. Read `reference/workflow-playbook.md` and identify which workflow phase you are in.
2. Read `reference/diagnosis-taxonomy.md` and identify the most likely diagnosis code from the evidence already provided.
3. Read `reference/evidence-ladder.md` and decide whether you can diagnose immediately or need one more targeted artifact.
4. Use `reference/command-catalog.md` only when evidence is incomplete or the repo is available and targeted proof is needed.
5. If the issue is a preview/config bail and the task is to restore TurboSnap, read `reference/trace-minimization.md`.
6. Render the result using `reference/output-contract.md`.
7. If a human user needs follow-up reading, use the local guidance in `reference/docs-map.md`.

## Workflow phases

Use one adaptive workflow:
- `triage`: classify the current TurboSnap state from logs, config, and symptoms
- `artifact-request`: ask for the smallest next artifact when evidence is incomplete
- `trace-validation`: use changed files, a stats artifact, or trace output to validate the bail or minimize the fix path
- `recommendation`: return the smallest valid fix, a safer alternative if needed, and the exact next step

Infer the current phase from the evidence:
- build URL, logs, and no stats file or trace output usually means `triage`
- a likely diagnosis but one missing proof artifact usually means `artifact-request`
- changed files plus stats file, pasted contents, or trace output usually means `trace-validation`
- enough evidence to act and explain usually means `recommendation`

## Required workflow

### 1) Start with current evidence

Prefer evidence already in the conversation:
- CLI output
- `chromatic.config.json`, `package.json` scripts, or CI snippets
- Storybook build details
- hosted metadata URLs under `.chromatic/` as human-shareable references
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

### 3) Follow the workflow phases

Use the workflow in `reference/workflow-playbook.md`.

The default path is:
- Triage: classify the build state and name the bail or active-tracing diagnosis
- Artifact request: ask for the smallest next artifact
- Trace validation: if stats, changed files, or trace output are available, validate and minimize only when needed
- Recommendation: return the diagnosis card, the likely fix path, and the exact next step

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

Default tone:
- customer-safe, but technically honest
- use terms like `bail reason`, `trace`, and `untraced` when they improve precision
- define those terms plainly when the user is unlikely to know them
- ask for one artifact at a time when evidence is incomplete
- include a deeper technical note only when it changes the recommendation or materially helps a support handoff

If you cannot reach a confident fix:
- name the most likely diagnosis
- state confidence honestly
- ask for the next artifact
- or append the support-ready summary format

## Prompting and intake

Use `template.md` when:
- an internal user wants a prompt to hand to the skill
- a customer needs a copy-paste request for the next artifact
- the team wants a standard intake form for SE handoff

The canonical prompt templates live in `template.md` so they stay versioned with the workflow.

Customer-facing snippets should still be shared as needed:
- keep them short
- request one artifact at a time
- avoid internal field names unless the user already used them
- prefer a single exact command over a list of options
- do not fetch hosted metadata inside the installed skill; ask the user to provide a local file path or pasted contents instead

## Boundaries

- Do not recommend “just leave TurboSnap off” as the intended end state in v1.
- Do not suggest `--externals`, `--untraced`, `--storybook-base-dir`, or `--storybook-config-dir` unless the evidence points there.
- When suggesting `--untraced`, keep the minimal technical set explicit and compress the safer recommendation into one monorepo-safe picomatch glob when possible.
- Do not ask for large evidence bundles when one smaller artifact would settle the branch.

## References and examples

- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `template.md`
- `reference/trace-minimization.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `examples/internal-investigation.md`
- `examples/customer-guided-debug.md`
- `evaluations/README.md`

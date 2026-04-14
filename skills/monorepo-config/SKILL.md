---
name: monorepo-config
description: Recommend Chromatic best practices for Nx and Turborepo monorepos, including one-project versus multi-project topology, workingDir, buildCommand or outputDir, storybookBaseDir, storybookConfigDir, onlyChanged, externals, untraced, shared lockfile behavior, and TurboSnap-safe CI patterns. Use when a monorepo needs an initial setup recommendation or an audit of an existing Chromatic configuration.
metadata:
  short-description: Recommend Chromatic monorepo topology and TurboSnap-safe configuration
---

# Monorepo Config

Public-safe skill for recommending and auditing Chromatic configurations in Nx and Turborepo monorepos.

This package is the single source of truth for:
- topology recommendations
- the recommendation playbook
- Nx and Turborepo scenario guidance
- config snippet patterns
- safety rules for `untraced` and `externals`
- the recommendation card output contract
- public-safe examples and evaluations

## Quick start

1. Read `reference/topology-rubric.md` and choose the recommended target topology.
2. Read `reference/recommendation-playbook.md` and identify the smallest set of repo facts you still need.
3. Read `reference/safety-rubric.md` before recommending `untraced` or `externals`.
4. Use `reference/snippet-catalog.md` to produce exact flags, config snippets, and GitHub Action patterns.
5. Render the result with `reference/output-contract.md`.
6. If the user wants follow-up reading, use `reference/docs-map.md`.

## Operating mode

The default mode is hybrid:
- if the repo or config is available, inspect it and turn the response into a concrete audit
- if the repo is not available, still make a clear recommendation based on the topology and workflow facts the user provides

Do not withhold a recommendation just because some details are missing.

## Required workflow

### 1) Identify the current topology

Start with the facts that decide the recommendation fastest:
- one Storybook or multiple Storybooks
- one deployable UI package or many
- one Chromatic project already in use or several
- whether the build runs from repo root or a package directory
- whether Nx or Turborepo is orchestrating the build

### 2) Make an explicit topology decision

Always answer whether the repo should:
- keep one Chromatic project
- or split into multiple Chromatic projects

Use `reference/topology-rubric.md` before discussing flags.

### 3) Map the build entrypoint and working directory

Choose the right execution pattern:
- repo-root run with `workingDir`
- package-local run
- `buildCommand` plus `outputDir` when the Storybook build is not exposed as a plain package script
- `storybookBaseDir` and `storybookConfigDir` when the build and trace roots differ from the current working directory

### 4) Classify TurboSnap risk surfaces

Check for:
- shared root lockfiles
- shared root `package.json` files
- root preview or config imports
- cross-package Storybook composition
- changes that should use `externals`
- changes that might justify `untraced`

Use `reference/safety-rubric.md` before recommending any suppression path.

### 5) Return a recommendation card

Always include:
- the topology decision
- the concrete config changes
- exact snippet patterns when enough context is available
- rationale and risk notes
- one follow-up question only if a missing repo fact would materially change the recommendation

## Boundaries

- Keep the skill public-safe and customer-safe.
- Treat Nx and Turborepo as first-class named scenarios.
- Do not recommend `untraced` for root package or lockfile changes without calling out coverage risk.
- Do not assume one Chromatic project is always better than multiple projects.
- Prefer repo-root-relative glob guidance when talking about `externals` or `untraced`.
- Do not rely on live external documentation inside the installed skill.

## References and examples

- `reference/recommendation-playbook.md`
- `reference/topology-rubric.md`
- `reference/snippet-catalog.md`
- `reference/safety-rubric.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `template.md`
- `examples/nx-single-project.md`
- `examples/turborepo-multi-project.md`
- `evaluations/README.md`

---
name: chromatic-troubleshoot-config
description: Diagnose Storybook configuration issues that block Chromatic or local Storybook, including missing stories, framework or builder mismatches, addon conflicts, preview errors, static asset path issues, and package version drift. Use when Storybook fails to build, Chromatic cannot verify Storybook, stories are missing, or a team needs the smallest config change to restore a working Storybook surface.
metadata:
  short-description: Troubleshoot Storybook configuration issues
---

# Troubleshoot Config

Diagnose Storybook configuration problems that block Chromatic or local Storybook and identify the narrowest fix.

## Required workflow

1. Start with the current evidence: exact error text, `.storybook/main.*`, `.storybook/preview.*`, Storybook scripts and dependencies in `package.json`, framework or builder, one representative story path, and whether local Storybook already fails.
2. Choose one primary diagnosis from `reference/diagnosis-taxonomy.md`. Use `reference/workflow-playbook.md` when the branch is unclear. Prioritize local Storybook failures before Chromatic follow-on symptoms, framework or builder mismatches before addon speculation, and story discovery issues before version cleanup.
3. Separate local Storybook failure from Chromatic follow-through. If Storybook fails locally, fix that surface first. If Storybook runs locally but Chromatic cannot verify it, inspect build scripts, output expectations, and config shape next.
4. Inspect the repo before asking for more evidence. Use `reference/command-catalog.md` to check `.storybook/main.*`, `.storybook/preview.*`, the Storybook section of `package.json`, and one representative story path. Do not invent scripts or migration paths.
5. If one artifact is still missing, request exactly one next item using `reference/evidence-ladder.md`.
6. Return the diagnosis card from `reference/output-contract.md`. If confidence is low, name the most likely diagnosis, explain the gap, and ask for the single artifact that resolves it.

## Boundaries

- Ask for one artifact at a time.
- Prefer the narrowest config repair over broad rewrites.
- Do not assume React, Vite, Webpack, or a Storybook major version without evidence.
- Do not invent script names or mix Vite and Webpack guidance unless the evidence proves a migration boundary.
- Avoid asking for the whole repo, full lockfiles, or broad logs when one targeted artifact settles the branch.

## References

- `reference/workflow-playbook.md`
- `reference/diagnosis-taxonomy.md`
- `reference/evidence-ladder.md`
- `reference/command-catalog.md`
- `reference/output-contract.md`
- `reference/docs-map.md`
- `template.md`
- `evaluations/README.md`

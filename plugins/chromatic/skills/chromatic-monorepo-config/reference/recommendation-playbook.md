# Monorepo Recommendation Playbook

Use this workflow to make a concrete Chromatic recommendation instead of a generic checklist.

## Default path

1. identify current topology
2. choose one-project or multi-project
3. map the build entrypoint and working directory
4. classify TurboSnap risk surfaces
5. return exact config patterns and risk notes

## Phase A: Identify the topology

Look for the facts that matter most:
- one Storybook vs multiple Storybooks
- one UI package vs several independently owned UI packages
- one review surface vs multiple independently approved review surfaces
- central orchestration through Nx or Turborepo

## Phase B: Decide the project model

Recommend one Chromatic project when:
- there is one shared Storybook review surface
- teams expect one combined visual review stream
- shared preview or configuration files are part of the intended review surface

Recommend multiple Chromatic projects when:
- there are multiple independently owned Storybooks
- teams want independent approval and baseline lifecycles
- unrelated packages should not share change noise or release cadence

## Phase C: Map execution

Choose between:
- repo-root execution with `workingDir`
- package-local execution
- `buildCommand` plus `outputDir` for orchestrated builds such as Nx targets
- `storybookBaseDir` and `storybookConfigDir` when trace roots differ from the run directory

## Phase D: Classify shared-file behavior

Call out how Chromatic should treat:
- root lockfiles
- root package manifests
- shared preview and manager files
- shared Storybook config directories
- generated static output paths

## Phase E: Return exact next steps

Prefer exact snippets when the evidence supports them.

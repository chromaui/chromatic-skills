# Chromatic Skills

Canonical Chromatic workflows for git and baseline debugging, TurboSnap investigations, Storybook and visual diff diagnosis, and monorepo configuration guidance. Built on the [Agent Skills](https://agentskills.io) open standard — works with Claude Code, Codex, and any compatible AI tool.

## Skills

### `chromatic-workflow-debug`

Diagnose Chromatic workflow issues involving git history, baselines, pull request event shape, merge queues, merge-base failures, replacement builds, and patch builds. Use when builds compare against the wrong baseline, an ancestor build is not found, or CI git context does not match Chromatic's expectations.

### `diagnose-chromatic-baselines`

Trace why an accepted visual change did not carry forward using customer-owned build records, CLI logs, and Git history. The workflow separates confirmed ancestry evidence from questions that require Chromatic Support.

For stacked PRs, merge queues, and overlapping builds, use the [baselines and concurrent-build playbook](skills/diagnose-chromatic-baselines/reference/concurrent-builds.md). It includes a timeline, recovery decision table, and a sanitized example.

### `chromatic-turbosnap-debug`

Diagnose TurboSnap behavior using logs, config, git context, hosted metadata references, and targeted trace commands. Use when TurboSnap is enabled but triggering full rebuilds, tracing too broadly, or skipping stories unexpectedly.

### `chromatic-turbosnap-audit`

Audit current preview imports, barrel candidates, configuration modules, and dependency footprints. Probe hypothetical changed inputs with the official CLI, then report evidence and supported recommendations without modifying code or tracing rules.

### `chromatic-turbosnap-check`

Check Git changes before pushing using one fresh Storybook build. Flag new preview imports and configuration modules, trace application changes for bails, and use explicit exit policies for optional local hooks. Both TurboSnap prevention skills bundle the same runtime and can be installed separately.

### `chromatic-turbosnap-compare`

Compare TurboSnap 1 and 2 using local logs, manifests, and stats. Trace preview hash changes to specific inputs, including content changes absent from Git's changed-file list.

### `chromatic-troubleshoot-config`

Diagnose Storybook configuration issues that block Chromatic or local Storybook, including missing stories, framework or builder mismatches, addon conflicts, preview errors, static asset path issues, and package version drift.

### `chromatic-troubleshoot-diff`

Diagnose visual differences between local Storybook and Chromatic, including font and resource loading, viewport globals, nondeterministic data, animation timing, and fixed or sticky positioning.

### `chromatic-monorepo-config`

Recommend and audit Chromatic configurations in Nx and Turborepo monorepos, including topology choice (one project vs. many), `workingDir`, `buildCommand`, `storybookBaseDir`, `onlyChanged`, `externals`, and `untraced`.

### `chromatic-setup-ci`

Configure CI/CD pipelines to run Chromatic visual tests. Use when adding Chromatic to a new CI workflow or migrating an existing one.

### `chromatic-viewports`

Configure Chromatic to capture visual test snapshots at multiple viewport sizes using the Modes API. Use when setting up responsive visual testing, applying viewports to stories globally or per-component, or migrating from the legacy `chromatic.viewports` API.

### `chromatic-themes`

Configure Chromatic to capture visual snapshots across multiple themes with Storybook globals, the Modes API, and supported theme addons or decorators.

## Install

```bash
npx skills add chromaui/chromatic-skills
```

To install a single skill:

```bash
npx skills add chromaui/chromatic-skills@chromatic-workflow-debug
npx skills add chromaui/chromatic-skills@diagnose-chromatic-baselines
npx skills add chromaui/chromatic-skills@chromatic-turbosnap-debug
npx skills add chromaui/chromatic-skills@chromatic-turbosnap-audit
npx skills add chromaui/chromatic-skills@chromatic-turbosnap-check
npx skills add chromaui/chromatic-skills@chromatic-turbosnap-compare
npx skills add chromaui/chromatic-skills@chromatic-troubleshoot-config
npx skills add chromaui/chromatic-skills@chromatic-troubleshoot-diff
npx skills add chromaui/chromatic-skills@chromatic-monorepo-config
npx skills add chromaui/chromatic-skills@chromatic-setup-ci
npx skills add chromaui/chromatic-skills@chromatic-viewports
npx skills add chromaui/chromatic-skills@chromatic-themes
```

## Hosted Metadata

When a TurboSnap investigation reaches the stats or trace stage, hosted metadata can be useful as a human handoff artifact.

Preferred artifact: `<storybookUrl>.chromatic/preview-stats.trimmed.json`

Installed skills do not fetch hosted URLs automatically. Share the URL with Chromatic support, or download the file manually and provide a local path or pasted contents.

See `docs/metadata-artifacts.md` for enablement, URL patterns, and the manual handoff workflow.

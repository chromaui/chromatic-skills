# Chromatic Skills

Canonical Chromatic workflows for git and baseline debugging, TurboSnap investigations, Storybook diagnosis, and monorepo configuration guidance. Built on the [Agent Skills](https://agentskills.io) open standard — works with Claude Code, Codex, and any compatible AI tool.

## Skills

### `chromatic-workflow-debug`

Diagnose Chromatic workflow issues involving git history, baselines, pull request event shape, merge queues, merge-base failures, replacement builds, and patch builds. Use when builds compare against the wrong baseline, an ancestor build is not found, or CI git context does not match Chromatic's expectations.

### `chromatic-turbosnap-debug`

Diagnose TurboSnap behavior using logs, config, git context, hosted metadata references, and targeted trace commands. Use when TurboSnap is enabled but triggering full rebuilds, tracing too broadly, or skipping stories unexpectedly.

### `chromatic-troubleshoot-config`

Diagnose Storybook configuration issues that block Chromatic or local Storybook, including missing stories, framework or builder mismatches, addon conflicts, preview errors, static asset path issues, and package version drift.

### `chromatic-monorepo-config`

Recommend and audit Chromatic configurations in Nx and Turborepo monorepos, including topology choice (one project vs. many), `workingDir`, `buildCommand`, `storybookBaseDir`, `onlyChanged`, `externals`, and `untraced`.

### `chromatic-setup-ci`

Configure CI/CD pipelines to run Chromatic visual tests. Use when adding Chromatic to a new CI workflow or migrating an existing one.

### `chromatic-viewports`

Configure Chromatic to capture visual test snapshots at multiple viewport sizes using the Modes API. Use when setting up responsive visual testing, applying viewports to stories globally or per-component, or migrating from the legacy `chromatic.viewports` API.

## Install

```bash
npx skills add chromaui/chromatic-skills
```

To install a single skill:

```bash
npx skills add chromaui/chromatic-skills@chromatic-workflow-debug
npx skills add chromaui/chromatic-skills@chromatic-turbosnap-debug
npx skills add chromaui/chromatic-skills@chromatic-troubleshoot-config
npx skills add chromaui/chromatic-skills@chromatic-monorepo-config
npx skills add chromaui/chromatic-skills@chromatic-setup-ci
npx skills add chromaui/chromatic-skills@chromatic-viewports
```

## Hosted Metadata

When a TurboSnap investigation reaches the stats or trace stage, hosted metadata can be useful as a human handoff artifact.

Preferred artifact: `<storybookUrl>.chromatic/preview-stats.trimmed.json`

Installed skills do not fetch hosted URLs automatically. Share the URL with Chromatic support, or download the file manually and provide a local path or pasted contents.

See `docs/metadata-artifacts.md` for enablement, URL patterns, and the manual handoff workflow.

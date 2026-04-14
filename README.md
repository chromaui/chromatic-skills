# Chromatic Skills

Canonical Chromatic workflows for git and baseline debugging, TurboSnap investigations, and monorepo configuration guidance. Built on the [Agent Skills](https://agentskills.io) open standard — works with Claude Code, Codex, and any compatible AI tool.

## Skills

### `workflow-debug`

Diagnose Chromatic workflow issues involving git history, baselines, pull request event shape, merge queues, merge-base failures, replacement builds, and patch builds. Use when builds compare against the wrong baseline, an ancestor build is not found, or CI git context does not match Chromatic's expectations.

### `turbosnap-debug`

Diagnose TurboSnap behavior using logs, config, git context, hosted metadata references, and targeted trace commands. Use when TurboSnap is enabled but triggering full rebuilds, tracing too broadly, or skipping stories unexpectedly.

### `monorepo-config`

Recommend and audit Chromatic configurations in Nx and Turborepo monorepos, including topology choice (one project vs. many), `workingDir`, `buildCommand`, `storybookBaseDir`, `onlyChanged`, `externals`, and `untraced`.

## Install

```bash
npx skills add chromaui/chromatic-skills
```

To install a single skill:

```bash
npx skills add chromaui/chromatic-skills@workflow-debug
npx skills add chromaui/chromatic-skills@turbosnap-debug
npx skills add chromaui/chromatic-skills@monorepo-config
```

## Hosted Metadata

When a TurboSnap investigation reaches the stats or trace stage, hosted metadata can be useful as a human handoff artifact.

Preferred artifact: `<storybookUrl>.chromatic/preview-stats.trimmed.json`

Installed skills do not fetch hosted URLs automatically. Share the URL with Chromatic support, or download the file manually and provide a local path or pasted contents.

See `docs/metadata-artifacts.md` for enablement, URL patterns, and the manual handoff workflow.

## Repository Layout

```text
skills/
  monorepo-config/   SKILL.md, template.md, examples/, reference/, evaluations/
  turbosnap-debug/   SKILL.md, template.md, examples/, reference/, evaluations/
  workflow-debug/    SKILL.md, template.md, examples/, reference/, evaluations/
docs/
  metadata-artifacts.md
```

Each skill is self-contained. Edit files directly inside `skills/<name>/` — there is no build step.

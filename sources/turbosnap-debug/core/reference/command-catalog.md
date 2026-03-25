# TurboSnap Command Catalog

Only recommend commands that materially reduce uncertainty.

Do not front-load advanced TurboSnap flags if the existing evidence already identifies the issue.

## Activation and config checks

Use these to confirm whether TurboSnap is actually enabled:

```bash
rg -n '"(scripts|chromatic)|onlyChanged|--only-changed|storybookBaseDir|storybookConfigDir|externals|untraced|uploadMetadata"' chromatic.config.json package.json .github/workflows .
```

Use this when the user thinks TurboSnap is on, but the config is unclear.

When both are present:
- inspect the script or workflow step that actually invokes `chromatic`
- inspect `chromatic.config.json` for defaults and shared options
- do not assume all TurboSnap flags live in only one place

## Hosted metadata handoff

Use hosted metadata when the workflow has already reached a stats or trace stage and the build published `.chromatic/` artifacts.

Ask for one of these only as human-operated artifacts:
- direct hosted stats URL: `<storybookUrl>.chromatic/preview-stats.trimmed.json`
- hosted metadata directory URL: `<storybookUrl>.chromatic/`

Use hosted metadata for:
- `TS_BAIL_MISSING_STATS` follow-up when a rerun is possible
- `TS_ACTIVE_TOO_BROAD`
- `TS_ACTIVE_MISSED_EXPECTED_STORY`
- preview/config bail minimization after a hosted build is already available

Installed skills should not fetch these URLs directly.
If continued analysis is needed inside the skill:
- ask the user to download the file manually and provide a local path
- or ask them to paste the relevant contents
- or ask them to share the URL with Chromatic support

## Stats file checks

Use these to confirm the required local stats artifact exists:

```bash
rg --files -g 'preview-stats*.json' .
```

If the built Storybook path is known:

```bash
rg --files storybook-static .chromatic dist build -g 'preview-stats*.json'
```

Use these for `TS_BAIL_MISSING_STATS` and `TS_CONFIG_PATH_MISMATCH` when hosted metadata is unavailable.

## Repo-aware Chromatic trace checks

Use these when you already know:
- the changed file or files
- the local stats file path
- the Storybook base and config directories if they are non-default

Compact trace:

```bash
npx chromatic trace -s <path-to-preview-stats.json> <changed-file>...
```

Expanded trace:

```bash
npx chromatic trace -s <path-to-preview-stats.json> -m expanded <changed-file>...
```

If the repo uses a non-default layout:

```bash
npx chromatic trace \
  -s <path-to-preview-stats.json> \
  -b <storybook-base-dir> \
  -c <storybook-config-dir> \
  -m expanded \
  <changed-file>...
```

Use these for:
- `TS_ACTIVE_TOO_BROAD`
- `TS_ACTIVE_MISSED_EXPECTED_STORY`
- `TS_CONFIG_BASE_DIR`
- `TS_CONFIG_PATH_MISMATCH`
- `TS_TRACE_UNTRACED_EFFECT`

If the issue is already a known hard bail and the next step is minimization:
- prefer a local stats artifact or pasted contents
- otherwise trace the local changed leaves first
- then trace or reason about the first-hop preview imports before proposing `--untraced`
- use `reference/trace-minimization.md` for the decision rules

## Full-run proof when the user already has a runnable setup

Use this only when a targeted trace is not enough and the user can run Chromatic locally:

```bash
npx chromatic --only-changed --trace-changed=expanded --debug
```

Use this to confirm:
- the changed-file list
- the active bail state
- the affected story-file trace during a real run

Do not recommend this first when the missing evidence is only config or stats-path related.

Use this after a proposed fix when you need to validate that:
- the bail is gone
- TurboSnap is active
- the affected story set still looks defensible

## Helper-driven setup checks

Use the helper when directory configuration is suspected:

```bash
npx @chromatic-com/turbosnap-helper
```

This is especially useful for:
- `TS_CONFIG_BASE_DIR`
- `TS_CONFIG_PATH_MISMATCH`
- monorepo layouts

## Git-history checks

Use these for `TS_BAIL_INVALID_GIT_HISTORY`, `TS_BAIL_NO_ANCESTOR_BUILD`, and suspicious merge-commit behavior:

```bash
git rev-parse --is-inside-work-tree
git log --oneline --decorate -n 10
git branch --show-current
```

In CI, also inspect checkout depth and merge-commit strategy before tracing anything deeper.

## Guardrails

- Do not suggest `--externals` or `--untraced` unless the current evidence points to those exact flags.
- When suggesting `--untraced`, separate the minimal technical set from the safer recommended set.
- Do not recommend removing TurboSnap as the main fix path in v1.
- If a hard bail is proven, focus on the smallest fix that restores TurboSnap on the next run.

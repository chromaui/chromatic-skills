# Chromatic Skills

Installable Codex skills for Chromatic support, Solutions Engineering, and customer self-serve workflows.

## Repository Layout

```text
skills/
  .curated/
    turbosnap-debug/
    turbosnap-debug-internal/
    turbosnap-debug-customer/
    turbosnap-debug-after-stats/
  .experimental/
scripts/
.github/workflows/
```

Each skill directory is self-contained and installable on its own.

## Included Skills

- `turbosnap-debug`
  Shared TurboSnap diagnosis core, taxonomy, workflow, and references.
- `turbosnap-debug-internal`
  Internal support and Solutions Engineering wrapper for classification and customer-ready output.
- `turbosnap-debug-customer`
  Customer-safe wrapper for step-by-step self-serve debugging.
- `turbosnap-debug-after-stats`
  Internal wrapper for validation and minimization after a stats file and changed files are available.

## Development Workflow

1. Update the shared core in `skills/.curated/turbosnap-debug`.
2. Run `./scripts/sync-turbosnap-wrappers.sh` to refresh wrapper references and examples.
3. Run `./scripts/validate-skills.sh`.
4. Commit the synchronized result.

## Installation

The exact install command depends on the distribution channel you use.

If this repo is indexed by the Skills CLI, the install shape should be:

```bash
npx skills add <owner>/chromatic-skills@turbosnap-debug
npx skills add <owner>/chromatic-skills@turbosnap-debug-internal
npx skills add <owner>/chromatic-skills@turbosnap-debug-customer
npx skills add <owner>/chromatic-skills@turbosnap-debug-after-stats
```

If you are using a GitHub path-based installer, install from:

```text
skills/.curated/<skill-name>
```

## Publishing Notes

- Keep stable skills in `skills/.curated/`.
- Put trial workflows in `skills/.experimental/`.
- Wrapper skills must remain self-contained because many installers copy one skill directory at a time.

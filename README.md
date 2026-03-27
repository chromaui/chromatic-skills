# Chromatic Skills

Canonical Chromatic workflows and prompt adapters for git and baseline debugging, TurboSnap investigations, and monorepo configuration guidance.

## Repository Layout

```text
sources/
  monorepo-config/
    core/
  turbosnap-debug/
    core/
    prompts/
  workflow-debug/
    core/
prompts/
  claude-code/
  copilot/
  generic/
docs/
skills/
  .curated/
  .experimental/
scripts/
.github/workflows/
```

## Authoring Model

- `sources/<family>/**` is the canonical authored source.
- `skills/.curated/**` contains generated self-contained Codex or OpenAI installables.
- `prompts/**` contains generated prompt adapters for Claude Code, Copilot, and generic chat or editor usage.
- `docs/**` explains usage by tool and any family-specific workflow notes.

Do not edit `skills/.curated/**` directly unless you are intentionally changing generated output as part of the build process.

## Included Codex Skills

- `workflow-debug`
  Public-safe diagnosis skill for git history, baselines, pull request event shape, merge queues, merge-base failures, and patch-build workflow issues.
- `monorepo-config`
  Public-safe recommendation and audit skill for Nx and Turborepo Chromatic setups, including topology choice and TurboSnap-safe configuration.
- `turbosnap-debug`
  Public adaptive TurboSnap diagnosis skill for low-evidence triage, artifact requests, trace validation, and safer-fix guidance.

## Hosted Metadata

When a TurboSnap investigation reaches the stats or trace stage, hosted metadata can be useful as a human handoff artifact.

Preferred artifact:
- `<storybookUrl>.chromatic/preview-stats.trimmed.json`

Fallback discovery URL:
- `<storybookUrl>.chromatic/`

Installed skills do not fetch hosted URLs automatically.
Users can share the hosted URL with Chromatic support or download the file manually and provide a local path or pasted contents.

See `docs/metadata-artifacts.md` for enablement, URL patterns, and the manual handoff workflow.

## Tool Usage

Codex:
- install from `skills/.curated/<skill-name>` or the indexed `npx skills add chromaui/chromatic-skills@<skill-name>` flow
- see `docs/usage-codex.md`

Claude Code:
- use the prompt pack under `prompts/claude-code/`
- see `docs/usage-claude-code.md`

Copilot and VS Code-hosted workflows:
- use `prompts/copilot/` or the generic snippets under `prompts/generic/`
- see `docs/usage-copilot.md`

## Development Workflow

1. Edit the canonical source in `sources/<family>/`.
2. Run `./scripts/sync-skills.sh`.
3. Run `./scripts/build-prompt-adapters.sh`.
4. Run `./scripts/validate-skills.sh`.
5. Commit both source and generated output.

## Publishing Notes

- Keep stable installable skills in `skills/.curated/`.
- Put trial workflows in `skills/.experimental/`.
- Wrapper-based families, if any are added later, must remain self-contained because many installers copy one skill directory at a time.

# Chromatic Skills

Canonical TurboSnap workflows and prompt adapters for Chromatic support, Solutions Engineering, and customer self-serve debugging.

## Repository Layout

```text
sources/
  turbosnap-debug/
    core/
    wrappers/
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

- `sources/turbosnap-debug/**` is the canonical authored source.
- `skills/.curated/**` contains generated self-contained Codex/OpenAI installables.
- `prompts/**` contains generated prompt adapters for Claude Code, Copilot, and generic chat/editor usage.
- `docs/**` explains hosted metadata and usage by tool.

Do not edit `skills/.curated/**` directly unless you are intentionally changing generated output as part of the build process.

## Hosted Metadata

When a TurboSnap investigation reaches the stats or trace stage, hosted metadata can be useful as a human handoff artifact.

Preferred artifact:
- `<storybookUrl>.chromatic/preview-stats.trimmed.json`

Fallback discovery URL:
- `<storybookUrl>.chromatic/`

Installed skills do not fetch hosted URLs automatically.
Users can share the hosted URL with Chromatic support or download the file manually and provide a local path or pasted contents.

See `docs/metadata-artifacts.md` for enablement, URL patterns, and the manual handoff workflow.

## Included Codex Skills

- `turbosnap-debug`
  Shared TurboSnap diagnosis core, taxonomy, workflow, and references.
- `turbosnap-debug-internal`
  Internal support and Solutions Engineering wrapper for classification and customer-ready output.
- `turbosnap-debug-customer`
  Customer-safe wrapper for step-by-step self-serve debugging.
- `turbosnap-debug-after-stats`
  Internal wrapper for validation and minimization after a stats artifact and changed files are available.

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

1. Edit the canonical source in `sources/turbosnap-debug`.
2. Run `./scripts/sync-turbosnap-wrappers.sh`.
3. Run `./scripts/build-prompt-adapters.sh`.
4. Run `./scripts/validate-skills.sh`.
5. Commit both source and generated output.

## Publishing Notes

- Keep stable installable skills in `skills/.curated/`.
- Put trial workflows in `skills/.experimental/`.
- Wrapper skills must remain self-contained because many installers copy one skill directory at a time.

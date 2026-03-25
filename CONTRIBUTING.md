# Contributing

## Principles

- Keep the shared workflow and references in `sources/turbosnap-debug/core`.
- Keep wrapper source files thin in `sources/turbosnap-debug/wrappers`.
- Keep generated Codex skills self-contained in `skills/.curated`.
- Ask for one artifact at a time in customer-facing flows.
- Prefer hosted metadata URLs once the workflow reaches a stats or trace stage.
- Installed skills must not fetch remote content directly.
- Installed skills must not include direct download commands such as `curl` or `wget`.
- Hosted metadata URLs are human-facing artifacts only unless the user manually converts them into a local file path or pasted contents.
- Separate the minimal technical fix from the safer recommended fix whenever `--untraced` or similar suppression is involved.

## Updating TurboSnap Skills

1. Edit `sources/turbosnap-debug/**`.
2. Run `./scripts/sync-turbosnap-wrappers.sh`.
3. Run `./scripts/build-prompt-adapters.sh`.
4. Run `./scripts/validate-skills.sh`.
5. Review the generated diffs in `skills/.curated/**` and `prompts/**` before committing.

## Adding A New Skill

1. Add canonical source content first.
2. Decide whether the skill needs generated Codex installables, prompt adapters, or both.
3. Keep installable skill outputs self-contained.
4. Add README and usage docs once the skill is ready to share.

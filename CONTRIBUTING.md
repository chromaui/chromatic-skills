# Contributing

## Principles

- Treat `sources/<family>/core` as the canonical source for any public installable skill.
- Keep wrapper source files thin when a family uses wrappers.
- Keep generated Codex skills self-contained in `skills/.curated`.
- Keep new public families customer-safe end to end.
- Ask for one artifact at a time in diagnostic workflows.
- Prefer exact config and CI snippets in recommendation workflows when enough context is available.
- Installed skills must not fetch remote content directly.
- Installed skills must not include direct download commands such as `curl` or `wget`.
- Hosted metadata URLs are human-facing artifacts only unless the user manually converts them into a local file path or pasted contents.
- Separate the minimal technical fix from the safer recommended fix whenever `untraced`, `externals`, or similar suppression is involved.

## Updating Skills

1. Edit `sources/<family>/**`.
2. Run `./scripts/sync-skills.sh`.
3. Run `./scripts/build-prompt-adapters.sh`.
4. Run `./scripts/validate-skills.sh`.
5. Review the generated diffs in `skills/.curated/**` and `prompts/**` before committing.

## Adding a New Skill Family

1. Add canonical source content first under `sources/<family>/core`.
2. Decide whether the family is core-only or also needs wrappers.
3. Keep installable outputs self-contained.
4. Add prompt adapters under `sources/<family>/prompts`.
5. Update README and usage docs once the family is ready to share.

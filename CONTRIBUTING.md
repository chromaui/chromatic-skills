# Contributing

## Principles

- Keep the shared workflow and references in `skills/.curated/turbosnap-debug`.
- Keep wrapper skills thin and self-contained.
- Ask for one artifact at a time in customer-facing flows.
- Separate the minimal technical fix from the safer recommended fix whenever `--untraced` or similar suppression is involved.

## Updating TurboSnap Skills

1. Update the core skill.
2. Run `./scripts/sync-turbosnap-wrappers.sh`.
3. Run `./scripts/validate-skills.sh`.
4. Review the wrapper diffs before committing.

## Adding A New Skill

1. Create a new skill folder under `skills/.curated/` or `skills/.experimental/`.
2. Include `SKILL.md` and usually `agents/openai.yaml`.
3. Keep the skill self-contained.
4. Add it to the README once it is ready to share.

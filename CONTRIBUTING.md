# Contributing

## Principles

- Each skill in `skills/` is the single source of truth for its workflow. Edit it directly — there is no build step.
- Keep skills customer-safe end to end.
- Ask for one artifact at a time in diagnostic workflows.
- Prefer exact config and CI snippets in recommendation workflows when enough context is available.
- Installed skills must not fetch remote content directly.
- Installed skills must not include direct download commands such as `curl` or `wget`.
- Hosted metadata URLs are human-facing artifacts only unless the user manually converts them into a local file path or pasted contents.
- Separate the minimal technical fix from the safer recommended fix whenever `untraced`, `externals`, or similar suppression is involved.

## Skill Structure

```text
skills/<name>/
  SKILL.md          Main instructions and frontmatter (required)
  template.md       Intake template for users to fill in
  examples/         Example outputs showing expected format
  reference/        Detailed reference docs loaded on demand
  evaluations/      JSON test scenarios
  agents/           openai.yaml for Codex UI metadata
  assets/           Icons and visual assets
```

## Updating a Skill

1. Edit files directly in `skills/<name>/`.
2. Keep `SKILL.md` under 500 lines. Move detailed content to `reference/`.
3. If you change the intake workflow, update `template.md` to match.
4. If you add a new reference file, link it from the `## References and examples` section in `SKILL.md`.

## Adding a New Skill

1. Scaffold the skill:
   ```bash
   npx skills init skills/<new-name>
   ```
2. Fill in `SKILL.md` with `name`, `description`, and instructions.
3. Replace `template.md` with the intake form users should fill in.
4. Add `examples/`, `reference/`, and `evaluations/` as needed.
5. Update `README.md` with a short description of the new skill.

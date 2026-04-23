# Storybook Config Workflow Playbook

Use this workflow to move from a vague Storybook failure to one concrete config repair path.

## Default path

1. identify whether Storybook already fails locally
2. inspect `main.*`, `preview.*`, and `package.json`
3. classify the primary config or compatibility failure
4. ask for one exact artifact or run one targeted repo probe if needed
5. return the diagnosis card with one verification step

## Phase A: Triage

Look for the fastest branch-cutting facts:
- is Storybook failing locally or only during Chromatic verification?
- are stories missing, or is startup failing?
- does the error point at `main.*`, `preview.*`, addons, builder packages, or story globs?

## Phase B: Config-cause selection

Prefer these branches in order:
- local build broken
- framework or builder mismatch
- preview runtime error
- story glob mismatch
- addon conflict
- static asset path issue
- package version drift

## Phase C: Targeted validation

If the repo is available, inspect:
- `.storybook/main.*`
- `.storybook/preview.*`
- Storybook scripts and dependencies in `package.json`
- one representative story file path

## Phase D: Recommendation

Return the narrowest config change that matches the evidence.

If evidence is still incomplete, ask for one exact config artifact instead of proposing a wholesale setup rewrite.

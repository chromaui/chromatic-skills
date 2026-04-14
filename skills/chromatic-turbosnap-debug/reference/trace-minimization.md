# Preview Bail Trace Minimization

Use this when:
- the primary diagnosis is `TS_BAIL_STORYBOOK_FILE`
- the build is bailing through `.storybook/preview.*` or another Storybook config file
- the goal is to restore TurboSnap on the next run

## Purpose

Separate three different questions:

1. which changed files are participating in the bail
2. which first-hop preview imports are carrying those changed files into the bail
3. which proposed suppression is technically minimal versus operationally safe

Do not collapse those into one answer.

## Workflow

### 1) Confirm the hard bail

Look for:
- `Changed Storybook Files`
- `Found a Storybook config change in ...`
- trace output that reaches `.storybook/preview.*`

If the hard bail is not proven yet, stop and classify first.

### 2) Distinguish leaves from preview-entry points

Treat these separately:
- changed leaves: files from git diff or the build log
- preview-entry points: first-hop imports directly under `preview.*`

The same case may have many changed leaves but only a few preview-entry points.

### 3) Minimize against preview-entry points first

If the objective is only to remove the preview bail:
- map each changed leaf to the first-hop preview import it reaches
- search for the smallest set of preview-entry points that covers all changed leaves that trigger the bail

This is the minimal technical set.

### 4) Then evaluate safety

Ask whether each proposed `--untraced` candidate is likely to affect rendering or story data.

High-risk examples:
- global providers
- app stores or reducers
- story data sources
- visual utility modules used directly by components
- global MSW handler registries when stories depend on them

If a candidate looks rendering-relevant, say so explicitly.

## Output Rules

When suggesting suppression, always separate:

- Minimal technical fix:
  the smallest explicit set that removes the hard bail

- Safer recommendation:
  the narrower or more conservative set you would advise support to suggest first
  render this as a single `--untraced '<picomatch-pattern>'` flag, not one flag per path
  use one monorepo-safe picomatch pattern when the safer set spans disjoint roots
  if `.storybook` is included, exclude `main.*` and `preview.*` by default so Storybook entry files stay traced

- Coverage risk:
  what kind of regressions could be missed if those paths are untraced

Do not glob-compress the minimal technical fix. Keep that section explicit so the model shows exactly which preview-entry points or files remove the bail.

## Example Transformation

If the current safer set includes these paths:

- `.storybook/*`
- `src/themes.tsx`
- `packages/styles/global/*`
- `storybook/blocks/**`
- `storybook/docs-manifest.json`

Prefer a single recommended flag instead:

```bash
npx chromatic --only-changed \
  --untraced '**/(.storybook/!(main.*|preview.*)|src/themes.tsx|packages/styles/global/*|storybook/blocks/**|storybook/docs-manifest.json)'
```

The exact pattern can vary with the repo layout, but the safer recommendation should still be one `--untraced` flag with one picomatch pattern rather than repeated per-path lines.

## What not to do

- Do not call every broad trace a circular dependency.
- Do not say a wide trace is wrong just because many stories are affected.
- Do not recommend leaf-level `--untraced` first if the real leverage is in the preview-entry points.
- Do not present the minimal technical set as the safe default without a risk note.
- Do not render the safer recommendation as one `--untraced` line per file when one glob can express the same recommendation.

# Safety Rubric for `externals` and `untraced`

Use this file before recommending any suppression path.

## Prefer no suppression first

If correct `workingDir`, `storybookBaseDir`, `storybookConfigDir`, topology, or build segmentation solves the issue, prefer that path.

## `externals`

Recommend `externals` when a file change should intentionally trigger a full rebuild because it is broad and genuinely affects many stories.

Typical candidates:
- root preview wrappers
- shared design-token bundles with repo-wide visual reach
- root Storybook configuration that intentionally changes the review surface

## `untraced`

Recommend `untraced` only when the file changes are technically present in the trace graph but are safe to ignore for the intended review surface.

High-risk candidates that need extra caution:
- root lockfiles
- root `package.json`
- shared preview and decorator files
- shared Storybook config directories

If you recommend `untraced` for any of those, call out the coverage risk explicitly.

## Package-file rule

Never treat root package or lockfile changes as automatically safe to `untraced`.

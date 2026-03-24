# TurboSnap Diagnosis Taxonomy

Use these normalized diagnosis codes in every diagnosis card.

Choose one primary code. Mention secondary factors in the evidence or unresolved sections.

## Availability and activation

| Code | When to use it | Typical cues | Default next move |
| --- | --- | --- | --- |
| `TS_NOT_ENABLED` | TurboSnap is not turned on at all. | No `--only-changed`, no `onlyChanged: true`, or the user expected TurboSnap without enabling it. | Show how to enable TurboSnap in CLI, config, or GitHub Action. |
| `TS_UNAVAILABLE_ACCOUNT` | TurboSnap is unavailable because the account or project has not met availability requirements yet. | Output like “TurboSnap not available for your account” or reference to fewer than 10 CI builds. | Explain availability state and point to setup or manage-screen guidance. |

## Hard bails and explicit disable states

| Code | Raw repo cues | Meaning | Default next move |
| --- | --- | --- | --- |
| `TS_BAIL_MISSING_STATS` | `missingStatsFile`, “Did not find preview-stats.json” | Storybook was built without the required stats artifact. | Verify the build command uses `--stats-json` or `--webpack-stats-json` and confirm the built output contains the stats file. |
| `TS_BAIL_INVALID_GIT_HISTORY` | `invalidChangedFiles`, “missing git history” | TurboSnap could not compute changed files from baseline commits. | Inspect checkout depth, merge-commit behavior, rebases, and CI git settings. |
| `TS_BAIL_NO_ANCESTOR_BUILD` | `noAncestorBuild` | There is no usable ancestor baseline build. | Confirm baseline build availability and whether the branch has a usable history. |
| `TS_BAIL_REBUILD` | `rebuild` | This is a rebuild, so TurboSnap is intentionally disabled for the run. | Explain current build behavior and focus on restoring TurboSnap on the next non-rebuild run. |
| `TS_BAIL_EXTERNALS` | `changedExternalFiles`, “matching --externals” | A file matched `--externals`, which intentionally forces a full build. | Validate the externals glob and whether the matched file really must bypass tracing. |
| `TS_BAIL_PACKAGE_FILE` | `changedPackageFiles` | Package metadata or dependency changes could not be safely traced. | Check whether the dependency change is expected, whether helper/config cleanup is needed, and whether the package-file scope is broader than intended. |
| `TS_BAIL_STORYBOOK_FILE` | `changedStorybookFiles` | A Storybook config or preview-side file changed in a way that forces a full build. | Review preview and config changes, then optimize shared imports or directory config if appropriate. |
| `TS_BAIL_STATIC_FILE` | `changedStaticFiles` | A static asset changed in a way that forces a full build. | Confirm static asset handling and whether the asset belongs in externals or should be relocated. |

## Active tracing states

| Code | When to use it | Typical cues | Default next move |
| --- | --- | --- | --- |
| `TS_ACTIVE_EXPECTED` | TurboSnap is enabled and the trace behavior matches the reported outcome. | “TurboSnap enabled”, sensible affected story files, no trust issue in the report. | Explain why the selected stories are expected and point to the key evidence. |
| `TS_ACTIVE_NO_AFFECTED_STORIES` | TurboSnap is enabled and found no affected stories. | Enabled output plus empty or near-empty trace result. | Validate the changed files and trace output before treating this as a bug. |
| `TS_ACTIVE_TOO_BROAD` | TurboSnap is enabled, but the user believes too many stories were retested. | Trace reaches many shared files, preview/config churn, broad dependency ripples, or bad base/config dir setup. | Trace the widest dependency edge and look for shared imports, preview usage, directory mismatch, or externals overreach. |
| `TS_ACTIVE_MISSED_EXPECTED_STORY` | TurboSnap is enabled, but the user believes a story that should have run was skipped. | Trace output does not include an expected story or the changed file was filtered out. | Verify the changed file list, stats coverage, dynamic imports, untraced globs, and path normalization. |

## Configuration and path problems

| Code | When to use it | Typical cues | Default next move |
| --- | --- | --- | --- |
| `TS_CONFIG_BASE_DIR` | The main issue is the Storybook base directory being wrong. | “TurboSnap disabled until base directory is set correctly”, unrelated files triggering rebuilds, trace paths rooted incorrectly. | Validate `storybookBaseDir` from repo root and recommend the TurboSnap helper when available. |
| `TS_CONFIG_PATH_MISMATCH` | The config directory, stats path, or root/base/config relationship looks wrong. | CSF globs missing, trace paths do not line up with repo paths, wrong `.storybook` path, or missing generated entry files. | Verify `storybookConfigDir`, stats file location, and how the Storybook build was produced. |
| `TS_TRACE_UNTRACED_EFFECT` | `--untraced` is likely hiding a dependency edge that the user expected to be traced. | Untraced files shown in trace output or globs that match the changed file. | Review the `--untraced` list and remove or narrow the glob that suppresses the expected trace. |

## Low-confidence catch-all

| Code | When to use it | Typical cues | Default next move |
| --- | --- | --- | --- |
| `TS_NEEDS_MORE_EVIDENCE` | You cannot honestly choose a stronger code yet. | Partial logs, no config, no changed-file list, or conflicting evidence. | Ask for the next artifact from `reference/evidence-ladder.md`. |

## Prioritization rule

If multiple diagnoses look plausible, prioritize in this order:
1. availability state
2. explicit hard bail
3. configuration/path failure
4. active tracing trust issue
5. `TS_NEEDS_MORE_EVIDENCE`

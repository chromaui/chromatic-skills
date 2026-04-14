# Documentation Guidance

Installed skills should explain the diagnosis directly and should not depend on live external documentation links.

If a human user needs follow-up reading, point them toward the relevant Chromatic documentation topic outside the installed skill flow.

## Suggested mapping

| Diagnosis code or class | Documentation topic |
| --- | --- |
| `TS_NOT_ENABLED` | TurboSnap setup |
| `TS_UNAVAILABLE_ACCOUNT` | TurboSnap setup and availability |
| `TS_BAIL_MISSING_STATS` | TurboSnap setup and stats generation |
| `TS_BAIL_INVALID_GIT_HISTORY` | TurboSnap overview and git history requirements |
| `TS_BAIL_NO_ANCESTOR_BUILD` | TurboSnap overview and baseline build behavior |
| `TS_BAIL_REBUILD` | TurboSnap overview and rebuild behavior |
| `TS_BAIL_EXTERNALS` | TurboSnap best practices for externals |
| `TS_BAIL_PACKAGE_FILE` | TurboSnap best practices or monorepo guidance |
| `TS_BAIL_STORYBOOK_FILE` | TurboSnap best practices for preview/config changes |
| `TS_BAIL_STATIC_FILE` | TurboSnap best practices for static assets |
| `TS_CONFIG_BASE_DIR` | TurboSnap setup or monorepo guidance |
| `TS_CONFIG_PATH_MISMATCH` | TurboSnap setup and path alignment |
| `TS_TRACE_UNTRACED_EFFECT` | TurboSnap best practices for untraced files |
| `TS_ACTIVE_TOO_BROAD` | TurboSnap best practices or monorepo guidance |
| `TS_ACTIVE_MISSED_EXPECTED_STORY` | TurboSnap overview, then setup if config is implicated |

## Citation rule

- Explain the diagnosis directly in the installed skill.
- Keep external documentation references in human-facing repo docs, not as a dependency of the installed workflow.

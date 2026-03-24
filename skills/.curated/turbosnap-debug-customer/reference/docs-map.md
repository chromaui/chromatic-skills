# Official Docs Map

Use these live Chromatic docs pages when the diagnosis clearly maps to them.

## Core pages

- TurboSnap overview and how it works:
  - `https://www.chromatic.com/docs/turbosnap/`
- TurboSnap setup:
  - `https://www.chromatic.com/docs/turbosnap/setup/`
- TurboSnap best practices:
  - `https://www.chromatic.com/docs/turbosnap/best-practices/`
- TurboSnap for monorepos:
  - `https://www.chromatic.com/docs/turbosnap-for-monorepos`
- FAQ: turn off TurboSnap:
  - `https://www.chromatic.com/docs/faq/how-do-i-turn-off-turbosnap/`

## Suggested mapping

| Diagnosis code or class | Best doc target |
| --- | --- |
| `TS_NOT_ENABLED` | setup |
| `TS_UNAVAILABLE_ACCOUNT` | setup |
| `TS_BAIL_MISSING_STATS` | setup |
| `TS_BAIL_INVALID_GIT_HISTORY` | overview |
| `TS_BAIL_NO_ANCESTOR_BUILD` | overview |
| `TS_BAIL_REBUILD` | overview |
| `TS_BAIL_EXTERNALS` | best practices |
| `TS_BAIL_PACKAGE_FILE` | best practices or monorepos |
| `TS_BAIL_STORYBOOK_FILE` | best practices |
| `TS_BAIL_STATIC_FILE` | best practices |
| `TS_CONFIG_BASE_DIR` | setup or monorepos |
| `TS_CONFIG_PATH_MISMATCH` | setup |
| `TS_TRACE_UNTRACED_EFFECT` | best practices |
| `TS_ACTIVE_TOO_BROAD` | best practices or monorepos |
| `TS_ACTIVE_MISSED_EXPECTED_STORY` | overview first, then setup if config is implicated |

## Citation rule

- Link docs only when they help the exact diagnosis.
- Prefer one relevant page over a long reading list.
- In customer output, explain the diagnosis first and link second.

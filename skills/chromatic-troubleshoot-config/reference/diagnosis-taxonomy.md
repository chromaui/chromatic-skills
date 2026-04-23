# Storybook Config Diagnosis Taxonomy

Use one primary code per response.

| Code | Meaning | Typical evidence |
| --- | --- | --- |
| `SB_CFG_STORIES_GLOB_MISMATCH` | Storybook is not finding the intended stories because the `stories` pattern or file layout does not match the repo. | zero stories found, expected story file not detected, wrong glob |
| `SB_CFG_FRAMEWORK_OR_BUILDER_MISMATCH` | The configured framework or builder does not match the installed packages or intended runtime. | Vite package with webpack config, wrong `framework` entry, builder-specific failures |
| `SB_CFG_ADDON_CONFLICT` | One or more addons are incompatible, duplicated, or conflicting with the current Storybook setup. | addon startup failure, duplicate registration, version mismatch around an addon |
| `SB_CFG_PREVIEW_RUNTIME_ERROR` | Shared preview code, decorators, globals, or imports break Storybook before stories render correctly. | runtime error in `preview.*`, decorator exception, globals or provider setup crash |
| `SB_CFG_STATIC_ASSET_PATH` | Assets, public paths, or static directory configuration are wrong for Storybook or Chromatic. | missing images or fonts, asset 404s, wrong static dir configuration |
| `SB_CFG_PACKAGE_VERSION_DRIFT` | Storybook packages are on incompatible or mixed versions that destabilize the config surface. | mixed major versions, partially upgraded packages, framework package mismatch |
| `SB_CFG_LOCAL_BUILD_BROKEN` | Local Storybook is already broken, so Chromatic verification issues are downstream symptoms. | local Storybook build fails before upload |
| `SB_CFG_NEEDS_MORE_EVIDENCE` | The current evidence is not enough to choose one branch confidently. | missing config files, vague failure text, no package context |

## Priority rule

If more than one code appears plausible, prefer the earliest confirmed config or compatibility failure in the chain.

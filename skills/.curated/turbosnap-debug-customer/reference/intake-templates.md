# TurboSnap Intake Templates

Use these templates to standardize how people ask the skill for help.

## Canonical prompt location

These templates should live in the skill itself.

Reason:
- they stay versioned with the workflow
- they can be updated when the TurboSnap product or support process changes
- internal users can copy them without reconstructing the right ask from memory

Customer-facing prompts should usually be shared as needed:
- send only the shortest prompt that matches the current step
- ask for one artifact or one command run at a time
- do not dump the full internal intake form on a customer unless they asked for a self-serve workflow

## Compact Intake Form

Use this when the user can provide a structured bundle.

```text
Audience: internal | customer
Goal: classify bail | restore TurboSnap | reduce affected stories | validate proposed fix
Symptom: <full rebuild / too broad / missed story / unavailable>
Current message: <exact warning or error>
Chromatic command: <exact command or action step>
Storybook build command: <exact command>
Build URL: <optional>
Stats file path: <optional>
Changed files: <optional>
Trace output: <optional>
storybookBaseDir: <optional>
storybookConfigDir: <optional>
Repo layout: <single package / monorepo / package path>
```

## Internal Triage Prompt

```text
Use turbosnap-debug in internal-triage mode.

Goal:
Identify the primary TurboSnap diagnosis code and the single next artifact to request.

Known evidence:
- Build URL: <url>
- CLI output or warning: <paste>
- Exact Chromatic command or GitHub Action step: <paste>
- Storybook build command: <paste if known>
- Repo layout / base dir / config dir: <paste if known>
- Changed files: <paste if known>

Instructions:
- Classify first.
- If evidence is enough, stop and return the diagnosis card plus a customer-safe explanation.
- If evidence is not enough, ask for exactly one next artifact.
```

## Internal After-Stats Prompt

```text
Use turbosnap-debug in internal-after-stats mode.

Goal:
Use the provided stats file and changed files to determine the smallest technically valid change that removes the current bail reason.

Inputs:
- Diagnosis so far: <code or summary>
- Stats file path: <path>
- Changed files: <paste list>
- Trace output: <paste if already run>
- Storybook base dir / config dir: <paste if non-default>

Instructions:
- If this is a preview/config bail, map changed leaves to the first-hop imports under preview.
- Separate the minimal technical untraced set from the safer recommended set.
- Be explicit about coverage risk.
- End with a customer-safe explanation.
```

## Internal Validation Prompt

```text
Use turbosnap-debug in internal-after-stats mode.

Goal:
Validate whether this proposed fix actually removes the bail and whether it is safe.

Proposed fix:
- untraced: <paste>
- externals: <paste if any>
- baseDir/configDir changes: <paste if any>

Evidence:
- Trace output before: <paste>
- Trace output after: <paste>

Instructions:
- Say whether the fix removes the bail.
- Say whether TurboSnap is now active, still broad, or still disabled.
- Call out risk of false negatives if the fix suppresses rendering-relevant dependencies.
```

## Customer Self-Serve Prompt

```text
Help me diagnose TurboSnap.

What I’m seeing:
- <full build every time / too many stories / story was skipped>
- Current warning or error: <paste exact text>

My setup:
- Chromatic command: <paste>
- Storybook build command: <paste>
- Monorepo or single package: <say which>

Please ask me for one artifact at a time and explain exactly what command to run next.
```

## Customer After-Bail Prompt

```text
Help me investigate this TurboSnap bail.

Known issue:
- TurboSnap is enabled, but the build says: <paste exact bail message>

Available artifact:
- Stats file path: <path>

Please tell me the next single trace command to run and what result you need from it.
```

## Customer Request Snippets

Use these as copy-paste prompts from internal support to customers.

Request exact invocation:

```text
Please share the exact command that runs Chromatic, including the package script or GitHub Action step if that is where it lives.
```

Request stats confirmation:

```text
Please confirm whether your built Storybook output contains a `preview-stats.json` file, and share its path if it does.
```

Request one trace:

```text
Please run this exact command and paste the output:

npx chromatic trace -s <path-to-preview-stats.json> -m expanded <changed-file>
```

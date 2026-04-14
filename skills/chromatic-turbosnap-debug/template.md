# TurboSnap Debug Intake

## Compact Intake Form

Use this when the user can provide a structured bundle.

```text
Audience: internal | customer | mixed handoff
Goal: classify bail | restore TurboSnap | reduce affected stories | validate proposed fix
Symptom: <full rebuild / too broad / missed story / unavailable>
Current message: <exact warning or error>
Chromatic command: <exact command or action step>
Storybook build command: <exact command>
Build URL: <optional>
Hosted metadata URL: <optional support-shareable .chromatic/preview-stats.trimmed.json URL>
Hosted metadata directory: <optional support-shareable .chromatic/ directory URL>
Stats file path: <optional local path>
Changed files: <optional>
Trace output: <optional>
storybookBaseDir: <optional>
storybookConfigDir: <optional>
Repo layout: <single package / monorepo / package path>
```

## General Diagnosis Prompt

```text
Use $chromatic-turbosnap-debug to diagnose this TurboSnap issue.

Goal:
Identify the primary TurboSnap diagnosis code, explain the current state, and choose the single next artifact or fix.

Known evidence:
- Build URL: <url>
- CLI output or warning: <paste>
- Exact Chromatic command or GitHub Action step: <paste>
- Storybook build command: <paste if known>
- Hosted metadata URL: <paste if available>
- Repo layout / base dir / config dir: <paste if known>
- Changed files: <paste if known>

Instructions:
- Classify first.
- If evidence is enough, stop and return the diagnosis card.
- If evidence is not enough, ask for exactly one next artifact.
- Use technical terms when they improve precision, but define them plainly.
- If stats are needed and only a hosted URL exists, ask the user to download the file themselves and provide the local path or paste the relevant contents.
```

## Trace Validation Prompt

```text
Use $chromatic-turbosnap-debug to validate this TurboSnap issue now that richer evidence is available.

Goal:
Use the provided stats artifact, changed files, or trace output to determine the smallest technically valid change that removes the current bail reason or explains the broad or missed trace.

Inputs:
- Diagnosis so far: <code or summary>
- Hosted metadata URL, local stats path, or pasted contents: <support URL, local path, or text>
- Changed files: <paste list>
- Trace output: <paste if already run>
- Storybook base dir / config dir: <paste if non-default>

Instructions:
- If this is a preview/config bail, map changed leaves to the first-hop preview imports under preview.
- Separate the minimal technical fix from the safer recommended set.
- Keep the minimal technical set explicit.
- Render the safer recommended `--untraced` output as one monorepo-safe picomatch glob, not one flag per path.
- If the safer glob covers `.storybook`, exclude `main.*` and `preview.*` by default.
- Be explicit about coverage risk.
- End with the diagnosis card and include a deeper technical note only if it helps.
```

## Proposed-Fix Validation Prompt

```text
Use $chromatic-turbosnap-debug to validate whether this proposed TurboSnap fix is both effective and safe.

Goal:
Validate whether this proposed fix actually removes the bail and whether it is safe.

Proposed fix:
- untraced: <paste>
- externals: <paste if any>
- baseDir/configDir changes: <paste if any>

Evidence:
- Trace output before: <paste>
- Trace output after: <paste>
- Hosted metadata URL, local stats path, or pasted contents: <paste>

Instructions:
- Say whether the fix removes the bail.
- Say whether TurboSnap is now active, still broad, or still disabled.
- If the proposed safer fix uses `--untraced`, prefer one picomatch glob over repeated per-path flags.
- Call out risk of false negatives if the fix suppresses rendering-relevant dependencies.
```

## Customer Self-Serve Prompt

```text
Use $chromatic-turbosnap-debug to help me diagnose TurboSnap.

What I'm seeing:
- <full build every time / too many stories / story was skipped>
- Current warning or error: <paste exact text>

My setup:
- Chromatic command: <paste>
- Storybook build command: <paste>
- Monorepo or single package: <say which>
- Hosted metadata URL: <paste if you already enabled uploadMetadata and want to share it with support>

Please ask me for one artifact at a time, explain any jargon briefly, and tell me exactly what command to run next.
```

## Focused Post-Bail Prompt

```text
Use $chromatic-turbosnap-debug to investigate this TurboSnap bail.

Known issue:
- TurboSnap is enabled, but the build says: <paste exact bail message>

Available artifact:
- Hosted metadata URL, stats file path, or pasted contents: <path, URL, or text>

Please tell me the next single trace command to run and what result you need from it.
```

## Customer Request Snippets

Use these as copy-paste prompts from internal support to customers.

Request exact invocation:

```text
Please share the exact command that runs Chromatic, including the package script or GitHub Action step if that is where it lives.
```

Request hosted metadata upload:

```text
If you can rerun the build, please enable `uploadMetadata: true` for that run so Chromatic publishes a `.chromatic/` metadata directory alongside the hosted Storybook.
```

Request hosted stats URL:

```text
If you have the hosted `.chromatic/preview-stats.trimmed.json` URL, you can share it with Chromatic support. If you want to continue here, please download the file yourself and share the local path or paste the relevant contents.
```

Request hosted metadata directory:

```text
If you only have the `.chromatic/` directory URL, you can share it with Chromatic support. If you want to continue here, please download the relevant file yourself and share the local path or paste the relevant contents.
```

Request local stats confirmation:

```text
If hosted metadata is not available, please confirm whether your built Storybook output contains a `preview-stats.json` file, and share its path if it does.
```

Request one trace:

```text
Please run this exact command and paste the output:

npx chromatic trace -s <path-to-preview-stats.json> -m expanded <changed-file>
```

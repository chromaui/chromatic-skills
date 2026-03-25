# Generic TurboSnap Prompt Snippets

## Internal triage

```text
Use the TurboSnap internal-triage workflow.

Goal:
Identify the primary diagnosis code and the single next artifact to request.

Known evidence:
- Build URL: <url>
- CLI output or warning: <paste>
- Exact Chromatic command or workflow step: <paste>
- Storybook build command: <paste if known>
- Hosted metadata URL: <paste if available>
- Changed files: <paste if known>

Instructions:
- Classify first.
- Ask for exactly one next artifact if the evidence is incomplete.
- If the only available artifact is a hosted `.chromatic/preview-stats.trimmed.json` URL, ask the user to download the file themselves and provide the local path or paste the contents.
```

## Customer guided

```text
Help me diagnose TurboSnap.

What I’m seeing:
- <full build every time / too many stories / story was skipped>
- Current warning or error: <paste exact text>

My setup:
- Chromatic command: <paste>
- Storybook build command: <paste>
- Monorepo or single package: <say which>
- Hosted metadata URL: <paste if uploadMetadata is already enabled and you want to share it with support>

Please ask me for one artifact at a time and explain exactly what command to run next.
```

## After stats

```text
Use the TurboSnap internal-after-stats workflow.

Goal:
Use the provided stats artifact and changed files to determine the smallest technically valid change that removes the current bail reason.

Inputs:
- Diagnosis so far: <code or summary>
- Local stats path, pasted contents, or support-shareable hosted URL: <paste>
- Changed files: <paste list>
- Trace output: <paste if already run>

Instructions:
- If this is a preview/config bail, map changed leaves to the first-hop imports under preview.
- Separate the minimal technical fix from the safer recommended fix.
- Be explicit about coverage risk.
```

# Generic TurboSnap Prompt Snippets

## General diagnosis

```text
Use $turbosnap-debug to diagnose this TurboSnap issue.

Goal:
Identify the primary diagnosis code, explain the current TurboSnap state, and choose the single next artifact or fix.

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
- Use technical terms when they improve precision, but define them plainly.
- If the only available artifact is a hosted `.chromatic/preview-stats.trimmed.json` URL, ask the user to download the file themselves and provide the local path or paste the contents.
```

## Customer self-serve

```text
Use $turbosnap-debug to help me diagnose TurboSnap.

What I’m seeing:
- <full build every time / too many stories / story was skipped>
- Current warning or error: <paste exact text>

My setup:
- Chromatic command: <paste>
- Storybook build command: <paste>
- Monorepo or single package: <say which>
- Hosted metadata URL: <paste if uploadMetadata is already enabled and you want to share it with support>

Please ask me for one artifact at a time, explain any technical terms briefly, and tell me exactly what command to run next.
```

## Trace validation

```text
Use $turbosnap-debug to validate this TurboSnap issue now that richer evidence is available.

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

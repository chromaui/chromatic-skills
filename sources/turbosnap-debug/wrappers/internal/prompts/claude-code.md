# TurboSnap Internal Triage for Claude Code

Use the TurboSnap internal-triage workflow.

Goal:
Identify the primary TurboSnap diagnosis code and the single next artifact to request.

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
- If evidence is enough, stop and return the diagnosis card plus a customer-safe explanation.
- If evidence is not enough, ask for exactly one next artifact.
- If stats are needed and only a hosted `.chromatic/preview-stats.trimmed.json` URL exists, ask the user to download the file themselves and provide the local path or paste the contents.

# TurboSnap Customer-Guided Debug for Claude Code

Help diagnose TurboSnap in customer-guided mode.

What the user is seeing:
- <full build every time / too many stories / story was skipped>
- Current warning or error: <paste exact text>

Customer setup:
- Chromatic command: <paste>
- Storybook build command: <paste>
- Monorepo or single package: <say which>
- Hosted metadata URL: <paste if uploadMetadata is already enabled>

Instructions:
- Ask for one artifact at a time.
- Keep the explanation customer-safe.
- If stats are needed and the customer can rerun, prefer enabling `uploadMetadata` and asking for the direct hosted `.chromatic/preview-stats.trimmed.json` URL.

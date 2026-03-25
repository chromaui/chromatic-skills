# TurboSnap Customer-Guided Debug for Copilot

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
- If stats are needed and the customer can rerun, prefer enabling `uploadMetadata`, then ask them to download the file themselves and provide the local path or paste the contents. They can still share the hosted URL with Chromatic support.

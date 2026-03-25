# TurboSnap After-Stats Debug for Claude Code

Use the TurboSnap internal-after-stats workflow.

Goal:
Use the provided stats artifact and changed files to determine the smallest technically valid change that removes the current bail reason.

Inputs:
- Diagnosis so far: <code or summary>
- Local stats path, pasted contents, or support-shareable hosted URL: <paste>
- Changed files: <paste list>
- Trace output: <paste if already run>
- Storybook base dir / config dir: <paste if non-default>

Instructions:
- If this is a preview/config bail, map changed leaves to the first-hop imports under preview.
- Separate the minimal technical untraced set from the safer recommended set.
- Be explicit about coverage risk.
- End with a customer-safe explanation.

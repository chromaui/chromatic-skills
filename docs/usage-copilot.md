# Using Chromatic Prompts from Copilot

Copilot does not use the Codex skill install format directly in this repo.
Use the prompt pack under `prompts/copilot/`.

Available prompts:
- `prompts/copilot/workflow-debug.md`
- `prompts/copilot/monorepo-config.md`
- `prompts/copilot/turbosnap-debug.md`

Recommended workflow:
1. Pick the prompt file that matches the task.
2. Paste the prompt into Copilot Chat or agent mode with the case evidence.
3. If the task is a TurboSnap stats or trace case, use the hosted `.chromatic/preview-stats.trimmed.json` URL as a support-shareable reference only.
4. For continued analysis in Copilot, download the file yourself and provide the local path or paste the contents.

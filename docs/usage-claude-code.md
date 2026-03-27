# Using Chromatic Prompts from Claude Code

Claude Code does not use the Codex skill install format directly in this repo.
Use the prompt pack under `prompts/claude-code/`.

Available prompts:
- `prompts/claude-code/workflow-debug.md`
- `prompts/claude-code/monorepo-config.md`
- `prompts/claude-code/turbosnap-debug-internal.md`
- `prompts/claude-code/turbosnap-debug-customer.md`
- `prompts/claude-code/turbosnap-debug-after-stats.md`

Recommended workflow:
1. Pick the prompt file that matches the task.
2. Paste the prompt into Claude Code with the case evidence.
3. If the task is a TurboSnap stats or trace case, use the hosted `.chromatic/preview-stats.trimmed.json` URL as a support-shareable reference only.
4. For continued analysis in Claude Code, download the file yourself and provide the local path or paste the contents.

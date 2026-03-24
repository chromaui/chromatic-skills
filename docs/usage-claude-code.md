# Using TurboSnap Prompts from Claude Code

Claude Code does not use the Codex skill install format directly in this repo.
Use the prompt pack under `prompts/claude-code/`.

Available prompts:
- `prompts/claude-code/turbosnap-debug-internal.md`
- `prompts/claude-code/turbosnap-debug-customer.md`
- `prompts/claude-code/turbosnap-debug-after-stats.md`

Recommended workflow:
1. Pick the prompt file that matches the mode.
2. Paste the prompt into Claude Code with the case evidence.
3. If stats are needed, prefer the direct hosted `.chromatic/preview-stats.trimmed.json` URL.
4. Use the `.chromatic/` directory URL only when the direct JSON URL is unknown.

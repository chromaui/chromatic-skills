# Using TurboSnap Prompts from Copilot

Copilot does not use the Codex skill install format directly in this repo.
Use the prompt pack under `prompts/copilot/`.

Available prompts:
- `prompts/copilot/turbosnap-debug-internal.md`
- `prompts/copilot/turbosnap-debug-customer.md`
- `prompts/copilot/turbosnap-debug-after-stats.md`

Recommended workflow:
1. Pick the prompt file that matches the mode.
2. Paste the prompt into Copilot Chat or agent mode with the case evidence.
3. If stats are needed, prefer the direct hosted `.chromatic/preview-stats.trimmed.json` URL.
4. Fall back to the local stats path only when hosted metadata is unavailable.

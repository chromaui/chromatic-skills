#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_ROOT="$ROOT/sources/turbosnap-debug"
WRAPPER_SOURCE="$SOURCE_ROOT/wrappers"
PROMPTS="$ROOT/prompts"

rm -rf "$PROMPTS/claude-code" "$PROMPTS/copilot" "$PROMPTS/generic"
mkdir -p "$PROMPTS/claude-code" "$PROMPTS/copilot" "$PROMPTS/generic"

cp "$WRAPPER_SOURCE/internal/prompts/claude-code.md" "$PROMPTS/claude-code/turbosnap-debug-internal.md"
cp "$WRAPPER_SOURCE/customer/prompts/claude-code.md" "$PROMPTS/claude-code/turbosnap-debug-customer.md"
cp "$WRAPPER_SOURCE/after-stats/prompts/claude-code.md" "$PROMPTS/claude-code/turbosnap-debug-after-stats.md"

cp "$WRAPPER_SOURCE/internal/prompts/copilot.md" "$PROMPTS/copilot/turbosnap-debug-internal.md"
cp "$WRAPPER_SOURCE/customer/prompts/copilot.md" "$PROMPTS/copilot/turbosnap-debug-customer.md"
cp "$WRAPPER_SOURCE/after-stats/prompts/copilot.md" "$PROMPTS/copilot/turbosnap-debug-after-stats.md"

cp "$SOURCE_ROOT/prompts/generic/intake-snippets.md" "$PROMPTS/generic/intake-snippets.md"

echo "Built TurboSnap prompt adapters."

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATUS=0

required_paths=(
  "$ROOT/sources/turbosnap-debug/core/SKILL.md"
  "$ROOT/sources/turbosnap-debug/core/reference/workflow-playbook.md"
  "$ROOT/sources/turbosnap-debug/wrappers/internal/SKILL.md"
  "$ROOT/sources/turbosnap-debug/wrappers/customer/SKILL.md"
  "$ROOT/sources/turbosnap-debug/wrappers/after-stats/SKILL.md"
  "$ROOT/prompts/claude-code/turbosnap-debug-internal.md"
  "$ROOT/prompts/claude-code/turbosnap-debug-customer.md"
  "$ROOT/prompts/claude-code/turbosnap-debug-after-stats.md"
  "$ROOT/prompts/copilot/turbosnap-debug-internal.md"
  "$ROOT/prompts/copilot/turbosnap-debug-customer.md"
  "$ROOT/prompts/copilot/turbosnap-debug-after-stats.md"
  "$ROOT/prompts/generic/intake-snippets.md"
  "$ROOT/docs/metadata-artifacts.md"
  "$ROOT/docs/usage-codex.md"
  "$ROOT/docs/usage-claude-code.md"
  "$ROOT/docs/usage-copilot.md"
)

for path in "${required_paths[@]}"; do
  if [[ ! -f "$path" ]]; then
    echo "Missing required file: $path" >&2
    STATUS=1
  fi
done

while IFS= read -r skill_dir; do
  if [[ ! -f "$skill_dir/SKILL.md" ]]; then
    echo "Missing SKILL.md in $skill_dir" >&2
    STATUS=1
  fi

  if [[ ! -f "$skill_dir/agents/openai.yaml" ]]; then
    echo "Missing agents/openai.yaml in $skill_dir" >&2
    STATUS=1
  fi

  if rg -n "\.\./turbosnap-debug/" "$skill_dir" >/dev/null 2>&1; then
    echo "Found non-self-contained wrapper references in $skill_dir" >&2
    STATUS=1
  fi

  if rg -n "curl|wget|http://|https://" "$skill_dir" >/dev/null 2>&1; then
    echo "Found remote fetch or external URL content in installable skill: $skill_dir" >&2
    STATUS=1
  fi
done < <(find "$ROOT/skills/.curated" "$ROOT/skills/.experimental" -mindepth 1 -maxdepth 1 -type d | sort)

if rg -n "preview-stats\.trimmed\.json" "$ROOT/sources/turbosnap-debug/core" >/dev/null 2>&1; then
  :
else
  echo "Expected preview-stats.trimmed.json guidance in canonical source files" >&2
  STATUS=1
fi

if [[ $STATUS -eq 0 ]]; then
  echo "Skill validation passed."
fi

exit "$STATUS"

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATUS=0

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
done < <(find "$ROOT/skills/.curated" "$ROOT/skills/.experimental" -mindepth 1 -maxdepth 1 -type d | sort)

if [[ $STATUS -eq 0 ]]; then
  echo "Skill validation passed."
fi

exit "$STATUS"

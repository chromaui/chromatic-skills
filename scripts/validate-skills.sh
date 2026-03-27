#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
STATUS=0

skill_name_from() {
  awk '/^name:/ { print $2; exit }' "$1"
}

require_file() {
  local path="$1"

  if [[ ! -f "$path" ]]; then
    echo "Missing required file: $path" >&2
    STATUS=1
  fi
}

require_dir() {
  local path="$1"

  if [[ ! -d "$path" ]]; then
    echo "Missing required directory: $path" >&2
    STATUS=1
  fi
}

check_curated_skill() {
  local skill_dir="$1"

  require_file "$skill_dir/SKILL.md"
  require_file "$skill_dir/agents/openai.yaml"

  if rg -n '\.\./' "$skill_dir" >/dev/null 2>&1; then
    echo "Found non-self-contained relative references in $skill_dir" >&2
    STATUS=1
  fi

  if rg -n 'curl|wget|http://|https://' "$skill_dir" >/dev/null 2>&1; then
    echo "Found remote fetch or external URL content in installable skill: $skill_dir" >&2
    STATUS=1
  fi
}

required_paths=(
  "$ROOT/README.md"
  "$ROOT/CONTRIBUTING.md"
  "$ROOT/docs/metadata-artifacts.md"
  "$ROOT/docs/usage-codex.md"
  "$ROOT/docs/usage-claude-code.md"
  "$ROOT/docs/usage-copilot.md"
  "$ROOT/scripts/sync-skills.sh"
  "$ROOT/scripts/build-prompt-adapters.sh"
  "$ROOT/scripts/validate-skills.sh"
)

for path in "${required_paths[@]}"; do
  require_file "$path"
done

while IFS= read -r family_dir; do
  core_dir="$family_dir/core"
  require_dir "$core_dir"
  require_file "$core_dir/SKILL.md"
  require_file "$core_dir/agents/openai.yaml"

  if [[ -f "$core_dir/SKILL.md" ]]; then
    core_skill_name="$(skill_name_from "$core_dir/SKILL.md")"
    check_curated_skill "$ROOT/skills/.curated/$core_skill_name"

    if [[ -f "$family_dir/prompts/claude-code.md" ]]; then
      require_file "$ROOT/prompts/claude-code/$core_skill_name.md"
    fi

    if [[ -f "$family_dir/prompts/copilot.md" ]]; then
      require_file "$ROOT/prompts/copilot/$core_skill_name.md"
    fi
  fi

  if [[ -d "$family_dir/prompts/generic" ]]; then
    while IFS= read -r generic_prompt; do
      require_file "$ROOT/prompts/generic/$(basename "$generic_prompt")"
    done < <(find "$family_dir/prompts/generic" -mindepth 1 -maxdepth 1 -type f | sort)
  fi

  if [[ -d "$family_dir/wrappers" ]]; then
    while IFS= read -r wrapper_dir; do
      require_file "$wrapper_dir/SKILL.md"
      require_file "$wrapper_dir/agents/openai.yaml"

      wrapper_skill_name="$(skill_name_from "$wrapper_dir/SKILL.md")"
      check_curated_skill "$ROOT/skills/.curated/$wrapper_skill_name"

      if [[ -f "$wrapper_dir/prompts/claude-code.md" ]]; then
        require_file "$ROOT/prompts/claude-code/$wrapper_skill_name.md"
      fi

      if [[ -f "$wrapper_dir/prompts/copilot.md" ]]; then
        require_file "$ROOT/prompts/copilot/$wrapper_skill_name.md"
      fi
    done < <(find "$family_dir/wrappers" -mindepth 1 -maxdepth 1 -type d | sort)
  fi

  if [[ "$(basename "$family_dir")" == "turbosnap-debug" ]]; then
    if ! rg -n 'preview-stats\.trimmed\.json' "$core_dir" >/dev/null 2>&1; then
      echo "Expected preview-stats.trimmed.json guidance in canonical source files" >&2
      STATUS=1
    fi
  fi
done < <(find "$ROOT/sources" -mindepth 1 -maxdepth 1 -type d | sort)

while IFS= read -r curated_dir; do
  check_curated_skill "$curated_dir"
done < <(find "$ROOT/skills/.curated" "$ROOT/skills/.experimental" -mindepth 1 -maxdepth 1 -type d 2>/dev/null | sort)

if [[ $STATUS -eq 0 ]]; then
  echo "Skill validation passed."
fi

exit "$STATUS"

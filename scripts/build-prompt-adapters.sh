#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCES="$ROOT/sources"
PROMPTS="$ROOT/prompts"

skill_name_from() {
  awk '/^name:/ { print $2; exit }' "$1"
}

copy_prompt_if_present() {
  local source_file="$1"
  local target_file="$2"

  if [[ -f "$source_file" ]]; then
    cp "$source_file" "$target_file"
  fi
}

rm -rf "$PROMPTS/claude-code" "$PROMPTS/copilot" "$PROMPTS/generic"
mkdir -p "$PROMPTS/claude-code" "$PROMPTS/copilot" "$PROMPTS/generic"

while IFS= read -r family_dir; do
  [[ -f "$family_dir/core/SKILL.md" ]] || continue

  local_core_name="$(skill_name_from "$family_dir/core/SKILL.md")"

  copy_prompt_if_present \
    "$family_dir/prompts/claude-code.md" \
    "$PROMPTS/claude-code/$local_core_name.md"
  copy_prompt_if_present \
    "$family_dir/prompts/copilot.md" \
    "$PROMPTS/copilot/$local_core_name.md"

  if [[ -d "$family_dir/prompts/generic" ]]; then
    while IFS= read -r generic_prompt; do
      cp "$generic_prompt" "$PROMPTS/generic/$(basename "$generic_prompt")"
    done < <(find "$family_dir/prompts/generic" -mindepth 1 -maxdepth 1 -type f | sort)
  fi

  if [[ -d "$family_dir/wrappers" ]]; then
    while IFS= read -r wrapper_dir; do
      wrapper_skill_name="$(skill_name_from "$wrapper_dir/SKILL.md")"
      copy_prompt_if_present \
        "$wrapper_dir/prompts/claude-code.md" \
        "$PROMPTS/claude-code/$wrapper_skill_name.md"
      copy_prompt_if_present \
        "$wrapper_dir/prompts/copilot.md" \
        "$PROMPTS/copilot/$wrapper_skill_name.md"
    done < <(find "$family_dir/wrappers" -mindepth 1 -maxdepth 1 -type d | sort)
  fi
done < <(find "$SOURCES" -mindepth 1 -maxdepth 1 -type d | sort)

echo "Built prompt adapters from source families."

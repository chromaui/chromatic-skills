#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCES="$ROOT/sources"
CURATED="$ROOT/skills/.curated"

skill_name_from() {
  awk '/^name:/ { print $2; exit }' "$1"
}

copy_dir_contents() {
  local source_dir="$1"
  local target_dir="$2"

  rm -rf "$target_dir"
  mkdir -p "$target_dir"
  cp -R "$source_dir"/. "$target_dir/"
}

copy_shared_references() {
  local core_dir="$1"
  local target_dir="$2"

  if [[ -d "$core_dir/reference" ]]; then
    mkdir -p "$target_dir/reference"
    cp -R "$core_dir/reference"/. "$target_dir/reference/"
  fi
}

copy_all_examples() {
  local core_dir="$1"
  local target_dir="$2"

  if [[ -d "$core_dir/examples" ]]; then
    mkdir -p "$target_dir/examples"
    cp -R "$core_dir/examples"/. "$target_dir/examples/"
  fi
}

copy_wrapper_overrides() {
  local wrapper_dir="$1"
  local target_dir="$2"
  local dir

  for dir in reference examples; do
    if [[ -d "$wrapper_dir/$dir" ]]; then
      mkdir -p "$target_dir/$dir"
      cp -R "$wrapper_dir/$dir"/. "$target_dir/$dir/"
    fi
  done
}

rebuild_family() {
  local family_dir="$1"
  local core_dir="$family_dir/core"
  local core_skill_name

  core_skill_name="$(skill_name_from "$core_dir/SKILL.md")"
  copy_dir_contents "$core_dir" "$CURATED/$core_skill_name"

  if [[ -d "$family_dir/wrappers" ]]; then
    while IFS= read -r wrapper_dir; do
      [[ -f "$wrapper_dir/SKILL.md" ]] || continue

      local wrapper_skill_name
      local target_dir

      wrapper_skill_name="$(skill_name_from "$wrapper_dir/SKILL.md")"
      target_dir="$CURATED/$wrapper_skill_name"

      rm -rf "$target_dir"
      mkdir -p "$target_dir/agents"
      cp "$wrapper_dir/SKILL.md" "$target_dir/SKILL.md"
      cp "$wrapper_dir/agents/openai.yaml" "$target_dir/agents/openai.yaml"
      copy_shared_references "$core_dir" "$target_dir"
      copy_all_examples "$core_dir" "$target_dir"
      copy_wrapper_overrides "$wrapper_dir" "$target_dir"
    done < <(find "$family_dir/wrappers" -mindepth 1 -maxdepth 1 -type d | sort)
  fi
}

rm -rf "$CURATED"
mkdir -p "$CURATED"

while IFS= read -r family_dir; do
  [[ -f "$family_dir/core/SKILL.md" ]] || continue
  rebuild_family "$family_dir"
done < <(find "$SOURCES" -mindepth 1 -maxdepth 1 -type d | sort)

echo "Synchronized curated skills from sources."

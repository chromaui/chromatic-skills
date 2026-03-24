#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
SOURCE_ROOT="$ROOT/sources/turbosnap-debug"
CORE_SOURCE="$SOURCE_ROOT/core"
WRAPPER_SOURCE="$SOURCE_ROOT/wrappers"
CURATED="$ROOT/skills/.curated"

copy_shared() {
  local target="$1"
  mkdir -p "$target/reference" "$target/examples"
  cp "$CORE_SOURCE"/reference/diagnosis-taxonomy.md "$target/reference/"
  cp "$CORE_SOURCE"/reference/evidence-ladder.md "$target/reference/"
  cp "$CORE_SOURCE"/reference/command-catalog.md "$target/reference/"
  cp "$CORE_SOURCE"/reference/output-contract.md "$target/reference/"
  cp "$CORE_SOURCE"/reference/docs-map.md "$target/reference/"
  cp "$CORE_SOURCE"/reference/workflow-playbook.md "$target/reference/"
  cp "$CORE_SOURCE"/reference/intake-templates.md "$target/reference/"
  cp "$CORE_SOURCE"/reference/trace-minimization.md "$target/reference/"
}

rebuild_core() {
  rm -rf "$CURATED/turbosnap-debug"
  mkdir -p "$CURATED/turbosnap-debug"
  cp -R "$CORE_SOURCE"/. "$CURATED/turbosnap-debug/"
}

rebuild_wrapper() {
  local source_name="$1"
  local target_name="$2"
  local example_name="$3"
  local target="$CURATED/$target_name"

  rm -rf "$target"
  mkdir -p "$target/agents" "$target/reference" "$target/examples"
  cp "$WRAPPER_SOURCE/$source_name/SKILL.md" "$target/SKILL.md"
  cp "$WRAPPER_SOURCE/$source_name/agents/openai.yaml" "$target/agents/openai.yaml"
  copy_shared "$target"
  cp "$CORE_SOURCE/examples/$example_name" "$target/examples/"
}

rebuild_core
rebuild_wrapper internal turbosnap-debug-internal internal-investigation.md
rebuild_wrapper customer turbosnap-debug-customer customer-guided-debug.md
rebuild_wrapper after-stats turbosnap-debug-after-stats internal-investigation.md

echo "Synchronized TurboSnap curated skills from sources."

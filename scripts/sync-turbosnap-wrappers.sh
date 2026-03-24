#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
CURATED="$ROOT/skills/.curated"
CORE="$CURATED/turbosnap-debug"

copy_shared() {
  local target="$1"
  mkdir -p "$target/reference" "$target/examples"
  cp "$CORE"/reference/diagnosis-taxonomy.md "$target/reference/"
  cp "$CORE"/reference/evidence-ladder.md "$target/reference/"
  cp "$CORE"/reference/command-catalog.md "$target/reference/"
  cp "$CORE"/reference/output-contract.md "$target/reference/"
  cp "$CORE"/reference/docs-map.md "$target/reference/"
  cp "$CORE"/reference/workflow-playbook.md "$target/reference/"
  cp "$CORE"/reference/intake-templates.md "$target/reference/"
  cp "$CORE"/reference/trace-minimization.md "$target/reference/"
}

copy_shared "$CURATED/turbosnap-debug-internal"
copy_shared "$CURATED/turbosnap-debug-customer"
copy_shared "$CURATED/turbosnap-debug-after-stats"

cp "$CORE/examples/internal-investigation.md" "$CURATED/turbosnap-debug-internal/examples/"
cp "$CORE/examples/customer-guided-debug.md" "$CURATED/turbosnap-debug-customer/examples/"
cp "$CORE/examples/internal-investigation.md" "$CURATED/turbosnap-debug-after-stats/examples/"

echo "Synchronized TurboSnap wrapper references."

#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"

"$ROOT/scripts/sync-skills.sh"

echo "Synchronized TurboSnap curated skills from sources via sync-skills.sh."

#!/usr/bin/env bash
# Exporte tous les diagrammes de séquence par acteur (Mermaid → PNG + SVG).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/docs/diagrammes-mermaid/sequences"
OUT="${ROOT}/docs/diagrammes-images/sequences"
FLATTEN="${ROOT}/scripts/flatten-diagram-export.py"

mkdir -p "${OUT}/eleve" "${OUT}/admin" "${OUT}/agent"

count=0
for actor in eleve admin agent; do
  dir="${SRC}/${actor}"
  [ -d "${dir}" ] || continue
  shopt -s nullglob
  for f in "${dir}"/*.mmd; do
    base=$(basename "$f" .mmd)
    echo "Export ${actor}/${base}..."
    curl -sS -f -X POST "https://kroki.io/mermaid/png" \
      -H "Content-Type: text/plain" \
      --data-binary @"$f" \
      -o "${OUT}/${actor}/${base}.png"
    curl -sS -f -X POST "https://kroki.io/mermaid/svg" \
      -H "Content-Type: text/plain" \
      --data-binary @"$f" \
      -o "${OUT}/${actor}/${base}.svg"
    python3 "${FLATTEN}" "${OUT}/${actor}/${base}.png" "${OUT}/${actor}/${base}.svg"
    count=$((count + 1))
  done
done

echo "Done: ${count} sequence diagram(s) -> ${OUT}"

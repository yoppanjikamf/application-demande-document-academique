#!/usr/bin/env bash
# Regenerates PNG and SVG for sequence-*-v3-soutenance.mmd via Kroki (no Puppeteer).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/docs/diagrammes-mermaid"
OUT="${ROOT}/docs/diagrammes-images"

shopt -s nullglob
files=("${SRC}"/sequence-*-v3-soutenance.mmd)

if [ ${#files[@]} -eq 0 ]; then
  echo "No v3 sequence .mmd files found in ${SRC}" >&2
  exit 1
fi

FLATTEN="${ROOT}/scripts/flatten-diagram-export.py"

for f in "${files[@]}"; do
  base=$(basename "$f" .mmd)
  echo "Export ${base}..."
  curl -sS -f -X POST "https://kroki.io/mermaid/png" \
    -H "Content-Type: text/plain" \
    --data-binary @"$f" \
    -o "${OUT}/${base}.png"
  curl -sS -f -X POST "https://kroki.io/mermaid/svg" \
    -H "Content-Type: text/plain" \
    --data-binary @"$f" \
    -o "${OUT}/${base}.svg"
  python3 "${FLATTEN}" "${OUT}/${base}.png" "${OUT}/${base}.svg"
done

echo "Done: ${#files[@]} diagram(s) -> ${OUT}"

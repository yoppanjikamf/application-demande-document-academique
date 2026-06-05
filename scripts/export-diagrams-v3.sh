#!/usr/bin/env bash
# Regenerates PNG and SVG for sequence-*-v3-soutenance.mmd via Kroki (no Puppeteer).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="${ROOT}/docs/diagrammes-mermaid"
DOT_SRC="${ROOT}/docs/diagrammes-graphviz"
OUT="${ROOT}/docs/diagrammes-images"

shopt -s nullglob
files=("${SRC}"/sequence-*-v3-soutenance.mmd)

if [ ${#files[@]} -eq 0 ]; then
  echo "No .mmd files found in ${SRC}" >&2
  exit 1
fi

FLATTEN="${ROOT}/scripts/flatten-diagram-export.py"

for f in "${files[@]}"; do
  base=$(basename "$f" .mmd)
  echo "Export ${base} (mermaid)..."
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

# Diagramme de classes : source Graphviz (.dot) pour un rendu noir sur blanc
# avec liaisons orthogonales (splines=ortho).
dot_files=("${DOT_SRC}"/*.dot)
for f in "${dot_files[@]}"; do
  base=$(basename "$f" .dot)
  echo "Export ${base} (graphviz)..."
  curl -sS -f -X POST "https://kroki.io/graphviz/png" \
    -H "Content-Type: text/plain" \
    --data-binary @"$f" \
    -o "${OUT}/${base}.png"
  curl -sS -f -X POST "https://kroki.io/graphviz/svg" \
    -H "Content-Type: text/plain" \
    --data-binary @"$f" \
    -o "${OUT}/${base}.svg"
done

echo "Done: ${#files[@]} mermaid + ${#dot_files[@]} graphviz diagram(s) -> ${OUT}"

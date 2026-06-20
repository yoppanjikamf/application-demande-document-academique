#!/usr/bin/env bash
# Regénère tous les Markdown de docs/ en DOCX + PDF (documents-word/).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="${ROOT}/docs/documents-word"
CONVERTER="${ROOT}/scripts/md_to_docx.py"

if command -v libreoffice >/dev/null 2>&1; then
  LO="libreoffice"
elif command -v soffice >/dev/null 2>&1; then
  LO="soffice"
else
  echo "Erreur: LibreOffice introuvable (libreoffice ou soffice)." >&2
  exit 1
fi

mkdir -p "$OUT"

mapfile -t MD_FILES < <(find "${ROOT}/docs" -name '*.md' -type f ! -path '*/documents-word/*' | sort)

output_stem() {
  local md="$1"
  local rel="${md#${ROOT}/docs/}"
  if [[ "$rel" == */* ]]; then
    local stem="${rel%.md}"
    echo "${stem//\//_}"
  else
    basename "$md" .md
  fi
}

echo "=== Conversion Markdown -> DOCX (${#MD_FILES[@]} fichiers) ==="
for md in "${MD_FILES[@]}"; do
  stem="$(output_stem "$md")"
  python3 "$CONVERTER" "$md" "$OUT"
  default="${OUT}/$(basename "$md" .md).docx"
  if [[ -f "$default" && "$default" != "${OUT}/${stem}.docx" ]]; then
    mv -f "$default" "${OUT}/${stem}.docx"
  fi
  echo "  ${md#${ROOT}/docs/} -> ${stem}.docx"
done

echo ""
echo "=== Conversion DOCX -> PDF ==="
shopt -s nullglob
for docx in "$OUT"/*.docx; do
  base="$(basename "$docx" .docx)"
  if [[ ! -f "${OUT}/${base}.pdf" ]] || [[ "$docx" -nt "${OUT}/${base}.pdf" ]]; then
    "$LO" --headless --convert-to pdf --outdir "$OUT" "$docx"
    echo "  ${base}.pdf"
  fi
done

count=$(ls -1 "$OUT"/*.pdf 2>/dev/null | wc -l)

if [[ -f "${OUT}/demo_KIT_DEMO_COMPLET.pdf" ]]; then
  cp -f "${OUT}/demo_KIT_DEMO_COMPLET.pdf" "${OUT}/KIT_DEMO_COMPLET.pdf"
fi

echo ""
echo "=== Suppression des fichiers DOCX (conservation PDF uniquement) ==="
shopt -s nullglob
for docx in "$OUT"/*.docx; do
  rm -f "$docx"
  echo "  supprimé : $(basename "$docx")"
done

echo ""
echo "=== Terminé : ${count} fichiers PDF dans ${OUT} ==="

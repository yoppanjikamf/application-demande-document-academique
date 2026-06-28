#!/usr/bin/env python3
"""Supprime w:line=360 des paragraphes texte du Ch. 2 (cause des bandes blanches)."""
from __future__ import annotations

import importlib.util
import shutil
import sys
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

_spec = importlib.util.spec_from_file_location("align", ROOT / "scripts" / "align-memoire-bou.py")
align = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(align)

W = align.W
para_text = align.para_text
register_docx_namespaces = align.register_docx_namespaces

DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-fix-ch2-lines.docx"


def find_ch2_bounds(body: ET.Element) -> tuple[int, int]:
    children = list(body)
    start = end = None
    for i, child in enumerate(children):
        if child.tag != f"{{{W}}}p":
            continue
        text = para_text(child).strip()
        if text == "CHAPITRE 2:CHAPITRE 2:" and i > 400:
            start = i
        if start is not None and text.startswith("CHAPITRE 3 :") and i > 400:
            end = i
            break
    if start is None or end is None:
        raise SystemExit("Limites Ch. 2 introuvables (corps du chapitre).")
    return start, end


def strip_line360(body: ET.Element) -> int:
    children = list(body)
    start, end = find_ch2_bounds(body)
    line_key = f"{{{W}}}line"
    rule_key = f"{{{W}}}lineRule"
    removed = 0

    for child in children[start:end]:
        if child.tag != f"{{{W}}}p":
            continue
        if child.find(f".//{{{W}}}drawing") is not None:
            continue
        ppr = child.find(f"{{{W}}}pPr")
        if ppr is None:
            continue
        spacing = ppr.find(f"{{{W}}}spacing")
        if spacing is None:
            continue
        if spacing.get(f"{{{W}}}line") != "360":
            continue
        spacing.attrib.pop(line_key, None)
        spacing.attrib.pop(rule_key, None)
        removed += 1

    return removed


def main() -> None:
    if not DOCX.exists():
        raise SystemExit(f"Fichier introuvable : {DOCX}")

    shutil.copy2(DOCX, BACKUP)
    register_docx_namespaces()

    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None

    removed = strip_line360(body)
    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — {removed} paragraphes Ch. 2 corrigés (interligne 360 supprimé)")
    print(f"Fichier : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

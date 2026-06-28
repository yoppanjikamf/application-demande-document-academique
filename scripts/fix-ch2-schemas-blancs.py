#!/usr/bin/env python3
"""Corrige les traits blancs sur les schémas Ch. 2 (interligne + espacement images)."""
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
BACKUP = ROOT / "bout aligne.backup-fix-schemas-blancs.docx"


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
        raise SystemExit("Limites Ch. 2 introuvables.")
    return start, end


def clear_line_spacing(spacing: ET.Element) -> bool:
    line_key = f"{{{W}}}line"
    rule_key = f"{{{W}}}lineRule"
    changed = False
    if line_key in spacing.attrib:
        del spacing.attrib[line_key]
        changed = True
    if rule_key in spacing.attrib:
        del spacing.attrib[rule_key]
        changed = True
    return changed


def ensure_spacing(ppr: ET.Element) -> ET.Element:
    spacing = ppr.find(f"{{{W}}}spacing")
    if spacing is None:
        spacing = ET.SubElement(ppr, f"{{{W}}}spacing")
    return spacing


def tighten_image_para(p: ET.Element) -> None:
    ppr = p.find(f"{{{W}}}pPr")
    if ppr is None:
        ppr = ET.SubElement(p, f"{{{W}}}pPr")
        p.insert(0, ppr)
    spacing = ensure_spacing(ppr)
    spacing.set(f"{{{W}}}before", "0")
    spacing.set(f"{{{W}}}after", "0")
    clear_line_spacing(spacing)
    jc = ppr.find(f"{{{W}}}jc")
    if jc is None:
        jc = ET.SubElement(ppr, f"{{{W}}}jc")
    jc.set(f"{{{W}}}val", "center")
    snap = ppr.find(f"{{{W}}}snapToGrid")
    if snap is None:
        snap = ET.SubElement(ppr, f"{{{W}}}snapToGrid")
    snap.set(f"{{{W}}}val", "0")


def fix_ch2(body: ET.Element) -> tuple[int, int, int]:
    children = list(body)
    start, end = find_ch2_bounds(body)
    line_removed = 0
    images_fixed = 0
    neighbors_fixed = 0

    image_indices: set[int] = set()
    for i in range(start, end):
        child = children[i]
        if child.tag == f"{{{W}}}p" and child.find(f".//{{{W}}}drawing") is not None:
            image_indices.add(i)

    for i in range(start, end):
        child = children[i]
        for spacing in child.iter(f"{{{W}}}spacing"):
            if clear_line_spacing(spacing):
                line_removed += 1

        if i in image_indices:
            tighten_image_para(child)
            images_fixed += 1
            for neighbor in (i - 1, i + 1):
                if neighbor < start or neighbor >= end:
                    continue
                n = children[neighbor]
                if n.tag != f"{{{W}}}p" or n.find(f".//{{{W}}}drawing") is not None:
                    continue
                ppr = n.find(f"{{{W}}}pPr")
                if ppr is None:
                    continue
                spacing = ensure_spacing(ppr)
                clear_line_spacing(spacing)
                spacing.set(f"{{{W}}}before", "0")
                spacing.set(f"{{{W}}}after", "40")
                neighbors_fixed += 1

    return line_removed, images_fixed, neighbors_fixed


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

    line_removed, images_fixed, neighbors_fixed = fix_ch2(body)
    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — Ch.2 schémas : {line_removed} interlignes supprimés, "
          f"{images_fixed} images resserrées, {neighbors_fixed} voisins ajustés")
    print(f"Fichier : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

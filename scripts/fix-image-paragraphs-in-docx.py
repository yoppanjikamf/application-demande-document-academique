#!/usr/bin/env python3
"""Corrige l'affichage Word des images : supprime l'interligne sur les paragraphes figure."""
from __future__ import annotations

import importlib.util
import shutil
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-fix-image-paras.docx"

_spec = importlib.util.spec_from_file_location("align", ROOT / "scripts" / "align-memoire-bou.py")
align = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(align)

W = align.W
register_docx_namespaces = align.register_docx_namespaces


def fix_image_paragraph(p: ET.Element) -> bool:
    if p.find(f".//{{{W}}}drawing") is None:
        return False

    pPr = p.find(f"{{{W}}}pPr")
    if pPr is None:
        pPr = ET.SubElement(p, f"{{{W}}}pPr")
        p.insert(0, pPr)

    spacing = pPr.find(f"{{{W}}}spacing")
    if spacing is None:
        spacing = ET.SubElement(pPr, f"{{{W}}}spacing")
    spacing.set(f"{{{W}}}before", "0")
    spacing.set(f"{{{W}}}after", "80")
    for attr in (f"{{{W}}}line", f"{{{W}}}lineRule"):
        if attr in spacing.attrib:
            del spacing.attrib[attr]

    jc = pPr.find(f"{{{W}}}jc")
    if jc is None:
        jc = ET.SubElement(pPr, f"{{{W}}}jc")
    jc.set(f"{{{W}}}val", "center")

    for r in p.findall(f"{{{W}}}r"):
        if r.find(f"{{{W}}}drawing") is not None:
            rpr = r.find(f"{{{W}}}rPr")
            if rpr is None:
                rpr = ET.SubElement(r, f"{{{W}}}rPr")
                r.insert(0, rpr)
            if rpr.find(f"{{{W}}}noProof") is None:
                ET.SubElement(rpr, f"{{{W}}}noProof")
    return True


def main() -> None:
    register_docx_namespaces()
    shutil.copy2(DOCX, BACKUP)

    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None

    fixed = sum(1 for p in body.iter(f"{{{W}}}p") if fix_image_paragraph(p))
    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — {fixed} paragraphe(s) image corrigé(s) : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

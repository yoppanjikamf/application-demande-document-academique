#!/usr/bin/env python3
"""Réinsère les brouillons d'introduction VERSION A/B/C dans bout aligne.docx."""
from __future__ import annotations

import copy
import importlib.util
import shutil
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-restore-brouillons.docx"
SOURCE = ROOT / "bout aligne.backup-finition-memoire.docx"

_spec = importlib.util.spec_from_file_location("append_intro", ROOT / "scripts" / "append-intro-versions-abc.py")
append_intro = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(append_intro)

W = append_intro.W
para_text = append_intro.para_text
clone_pPr = append_intro.clone_pPr
build_brouillons = append_intro.build_all_paragraphs


def intro_end_index(body: ET.Element) -> int:
    """Index du dernier paragraphe de l'intro principale (avant chapitre 1)."""
    paragraphs = body.findall(f"{W}p")
    start = end = None
    for i, p in enumerate(paragraphs):
        text = para_text(p)
        if start is None and text.startswith("Dans un monde marqué"):
            start = i
            continue
        if start is None:
            continue
        if "BROUILLON" in text:
            return end if end is not None else i - 1
        if text.startswith("CHAPITRE 1") and "…" not in text:
            return end if end is not None else i - 1
        if text == "INTRODUCTION":
            return end if end is not None else i - 1
        if text:
            end = i
    if start is None or end is None:
        raise SystemExit("Fin de l'introduction principale introuvable.")
    return end


def brouillon_paragraphs_from_source() -> list[ET.Element]:
    with zipfile.ZipFile(SOURCE) as z:
        root = ET.fromstring(z.read("word/document.xml"))
    body = root.find(f"{W}body")
    assert body is not None
    children = list(body)
    start = end = None
    for i, el in enumerate(children):
        if el.tag != f"{W}p":
            continue
        text = para_text(el)
        if "BROUILLON — VERSION A" in text:
            start = i
        if start is not None and text.startswith("CHAPITRE 1") and "…" not in text:
            end = i
            break
    if start is None or end is None:
        raise SystemExit("Brouillons introuvables dans la sauvegarde.")
    return [copy.deepcopy(el) for el in children[start:end]]


def brouillon_paragraphs_from_script(ppr_template: ET.Element | None) -> list[ET.Element]:
    all_paras = build_brouillons(ppr_template)
    out: list[ET.Element] = []
    capturing = False
    for p in all_paras:
        text = para_text(p)
        if "BROUILLON — VERSION A" in text:
            capturing = True
        if capturing:
            out.append(p)
    if not out:
        raise SystemExit("Impossible de générer les brouillons.")
    return out


def main() -> None:
    if not DOCX.exists():
        raise SystemExit(f"Fichier introuvable : {DOCX}")

    shutil.copy2(DOCX, BACKUP)

    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{W}body")
    assert body is not None

    end_idx = intro_end_index(body)
    end_p = body.findall(f"{W}p")[end_idx]
    insert_at = list(body).index(end_p) + 1

    ppr = clone_pPr(end_p)
    if SOURCE.exists():
        brouillons = brouillon_paragraphs_from_source()
    else:
        brouillons = brouillon_paragraphs_from_script(ppr)

    for offset, el in enumerate(brouillons):
        body.insert(insert_at + offset, el)

    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — {len(brouillons)} éléments brouillon réinsérés après l'intro principale")
    print(f"Fichier : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

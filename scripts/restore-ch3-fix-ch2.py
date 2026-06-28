#!/usr/bin/env python3
"""Corrige le mémoire : nouveau Ch. 2 + §2.5–2.9 conservés, Ch. 3 intact."""
from __future__ import annotations

import copy
import importlib.util
import shutil
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "bout aligne.backup-avant-restore-ch3.docx"
BACKUP_ORIG = ROOT / "bout aligne.backup-chapitre2.docx"
DOCX = ROOT / "bout aligne.docx"

_spec = importlib.util.spec_from_file_location("align", ROOT / "scripts" / "align-memoire-bou.py")
align = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(align)

W = align.W
para_text = align.para_text
register_docx_namespaces = align.register_docx_namespaces
set_para_text = align.set_para_text


def find_body_ch3(children: list[ET.Element], after: int = 400) -> int:
    for i, child in enumerate(children):
        if i < after or child.tag != f"{{{W}}}p":
            continue
        text = para_text(child).strip()
        if text.startswith("CHAPITRE 3") and "RESULTATS" in text.upper():
            return i
    raise SystemExit("Chapitre 3 (corps) introuvable.")


def find_para_after(children: list[ET.Element], pred, after: int = 0) -> int:
    for i, child in enumerate(children):
        if i < after or child.tag != f"{{{W}}}p":
            continue
        if pred(para_text(child).strip()):
            return i
    raise SystemExit("Paragraphe introuvable.")


def clone_nodes(children: list[ET.Element], start: int, end: int) -> list[ET.Element]:
    return [copy.deepcopy(children[i]) for i in range(start, end)]


def rename_ds(nodes: list[ET.Element]) -> None:
    for node in nodes:
        if node.tag != f"{{{W}}}p":
            continue
        text = para_text(node)
        if "DR-DOCSCOL" in text:
            set_para_text(node, text.replace("DR-DOCSCOL", "D-SCOLCAM"))


def main() -> None:
    register_docx_namespaces()
    shutil.copy2(SOURCE, DOCX)

    with zipfile.ZipFile(BACKUP_ORIG) as z:
        orig = ET.fromstring(z.read("word/document.xml"))
    orig_body = orig.find(f"{{{W}}}body")
    assert orig_body is not None
    oc = list(orig_body)

    idx_25 = find_para_after(oc, lambda t: t.startswith("2.5 DÉVELOPPEMENT"))
    idx_29 = find_para_after(oc, lambda t: t.startswith("2.9 CONCLUSION"))
    idx_ch3_orig = find_body_ch3(oc)
    idx_cg_orig = find_para_after(oc, lambda t: t.startswith("CONCLUSION GENERALE"), after=idx_ch3_orig)

    dev_block = clone_nodes(oc, idx_25, idx_29 + 2)
    ch3_block = clone_nodes(oc, idx_ch3_orig, idx_cg_orig)
    rename_ds(dev_block)

    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}
    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None
    children = list(body)

    idx_new_concl = None
    for i, child in enumerate(children):
        if i < 400 or child.tag != f"{{{W}}}p" or para_text(child).strip() != "CONCLUSION":
            continue
        nxt = children[i + 1]
        if nxt.tag == f"{{{W}}}p" and "méthodologie Agile" in para_text(nxt):
            idx_new_concl = i
            break
    if idx_new_concl is None:
        raise SystemExit("Conclusion provisoire Ch. 2 introuvable.")

    idx_ch3 = find_body_ch3(children)
    idx_cg = find_para_after(children, lambda t: t.startswith("CONCLUSION GENERALE"), after=idx_ch3)

    for node in children[idx_new_concl:idx_cg]:
        body.remove(node)

    for offset, node in enumerate(dev_block):
        body.insert(idx_new_concl + offset, node)
    for offset, node in enumerate(ch3_block):
        body.insert(idx_new_concl + len(dev_block) + offset, node)

    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — Ch. 2 : nouveau contenu + §2.5–2.9 ; Ch. 3 restauré : {DOCX}")


if __name__ == "__main__":
    main()

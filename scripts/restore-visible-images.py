#!/usr/bin/env python3
"""Restaure les images visibles + réinjecte les PNG sources (format inline éprouvé)."""
from __future__ import annotations

import importlib.util
import shutil
import struct
import sys
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP_GOOD = ROOT / "bout aligne.backup-fix-traits-blancs-v2.docx"
BACKUP_NOW = ROOT / "bout aligne.backup-before-restore-images.docx"

sys.path.insert(0, str(ROOT / "scripts"))

_spec = importlib.util.spec_from_file_location(
    "reinject_ch2", ROOT / "scripts" / "reinject-ch2-images.py"
)
reinject = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(reinject)

_spec2 = importlib.util.spec_from_file_location("align", ROOT / "scripts" / "align-memoire-bou.py")
align = importlib.util.module_from_spec(_spec2)
assert _spec2.loader is not None
_spec2.loader.exec_module(align)

W = align.W
para_text = align.para_text
register_docx_namespaces = align.register_docx_namespaces
resolve_ui_image = align.resolve_ui_image
make_clean_image_para = reinject.make_clean_image_para
scale_emu = reinject.scale_emu
png_dimensions = reinject.png_dimensions

SCREENSHOT_PATHS = [
    resolve_ui_image("fig-08-activation.png"),
    resolve_ui_image("fig-09-login.png"),
    resolve_ui_image("fig-10-dashboard-documents.png"),
    resolve_ui_image("fig-11-document-detail.png"),
    resolve_ui_image("fig-12-duplicata-form.png"),
    resolve_ui_image("fig-13-rdv.png"),
    resolve_ui_image("fig-14-notifications.png"),
    resolve_ui_image("fig-15-admin-dashboard.png"),
    resolve_ui_image("fig-16-admin-documents.png"),
    resolve_ui_image("fig-17-import-csv.png"),
    resolve_ui_image("fig-18-duplicata-admin.png"),
    resolve_ui_image("fig-19-agent-rdv-list.png"),
    resolve_ui_image("fig-20-agent-confirm.png"),
]


def has_embedded_image(p: ET.Element) -> bool:
    blip = p.find(f".//{{{align.A}}}blip")
    return blip is not None and blip.get(f"{{{align.R}}}embed") is not None


def image_block(body: ET.Element, p: ET.Element) -> ET.Element:
    """Paragraphe image ou tableau qui le contient."""
    for child in body:
        if child is p:
            return child
        if child.tag == f"{{{W}}}tbl" and p in child.iter():
            return child
    return p


def chapter_bounds(body: ET.Element) -> tuple[int, int, int]:
    paragraphs = body.findall(f".//{{{W}}}p")
    ch2 = ch3 = ch3_end = None
    for i, p in enumerate(paragraphs):
        text = para_text(p).strip()
        if text.startswith("CHAPITRE 2") and "…" not in text and i > 400:
            ch2 = i
        if text.startswith("CHAPITRE 3") and "…" not in text and i > 400:
            ch3 = i
        if text.startswith("CONCLUSION G") and i > 800:
            ch3_end = i
            break
    if ch2 is None or ch3 is None or ch3_end is None:
        raise SystemExit("Limites de chapitres introuvables.")
    return ch2, ch3, ch3_end


def image_dimensions(path: Path) -> tuple[int, int]:
    if path.suffix.lower() == ".png":
        with path.open("rb") as f:
            header = f.read(24)
        if len(header) < 24:
            return 1200, 800
        return struct.unpack(">II", header[16:24])
    from PIL import Image

    with Image.open(path) as im:
        return im.size


def main() -> None:
    if not BACKUP_GOOD.exists():
        raise SystemExit(f"Sauvegarde introuvable : {BACKUP_GOOD}")

    if DOCX.exists():
        shutil.copy2(DOCX, BACKUP_NOW)
    shutil.copy2(BACKUP_GOOD, DOCX)

    diagram_paths = reinject.collect_paths()
    sources = diagram_paths + SCREENSHOT_PATHS
    for p in sources:
        if not p.exists():
            raise SystemExit(f"Image source manquante : {p}")

    register_docx_namespaces()
    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None

    ch2, ch3, ch3_end = chapter_bounds(body)
    paragraphs = body.findall(f".//{{{W}}}p")
    embedded = [(i, p) for i, p in enumerate(paragraphs) if has_embedded_image(p)]
    ch2_items = [(i, p) for i, p in embedded if ch2 <= i < ch3]
    ch3_items = [(i, p) for i, p in embedded if ch3 <= i < ch3_end]

    rels_text = files["word/_rels/document.xml.rels"].decode("utf-8")
    ct_text = files["[Content_Types].xml"].decode("utf-8")
    docpr = 15000
    replaced = 0

    def replace_batch(items: list[tuple[int, ET.Element]], src_list: list[Path], prefix: str) -> None:
        nonlocal rels_text, ct_text, docpr, replaced
        for n, ((_, old_p), src) in enumerate(zip(items, src_list)):
            w_px, h_px = image_dimensions(src)
            cx, cy = scale_emu(w_px, h_px)
            ext = src.suffix.lower().lstrip(".")
            media_ext = "jpeg" if ext in ("jpg", "jpeg") else "png"
            media_name = f"{prefix}_{n + 1:02d}.{media_ext}"
            media_path = f"word/media/{media_name}"
            rid = f"rIdFixImg_{prefix}_{n + 1}"

            if f'Id="{rid}"' not in rels_text:
                rels_text = rels_text.replace(
                    "</Relationships>",
                    f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{media_name}"/></Relationships>',
                )
            if f'Extension="{media_ext}"' not in ct_text:
                ct = "image/jpeg" if media_ext == "jpeg" else "image/png"
                ct_text = ct_text.replace(
                    "</Types>",
                    f'<Default Extension="{media_ext}" ContentType="{ct}"/></Types>',
                )

            files[media_path] = src.read_bytes()
            docpr += 1
            new_p = make_clean_image_para(rid, cx, cy, docpr, src.name)
            old_block = image_block(body, old_p)
            idx = list(body).index(old_block)
            body.remove(old_block)
            body.insert(idx, new_p)
            replaced += 1

    replace_batch(ch2_items, diagram_paths, "diagram")
    replace_batch(ch3_items, SCREENSHOT_PATHS, "screenshot")

    files["word/_rels/document.xml.rels"] = rels_text.encode("utf-8")
    files["[Content_Types].xml"] = ct_text.encode("utf-8")
    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — {replaced} images restaurées (format inline visible)")
    print(f"Fichier : {DOCX}")
    print(f"Sauvegarde avant restauration : {BACKUP_NOW}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Corrige définitivement les traits blancs : PNG propres + images Word sans espacement."""
from __future__ import annotations

import importlib.util
import shutil
import struct
import subprocess
import sys
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-fix-traits-blancs-v2.docx"

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
R = align.R
A = align.A
WP = align.WP
PIC = align.PIC
para_text = align.para_text
register_docx_namespaces = align.register_docx_namespaces
resolve_ui_image = align.resolve_ui_image

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


def regenerate_png_from_svg() -> None:
    script = ROOT / "scripts" / "regenerate-png-from-svg.mjs"
    subprocess.run(["node", str(script)], check=True, cwd=ROOT)


def repair_png_white_lines() -> None:
    script = ROOT / "scripts" / "repair-png-white-lines.py"
    subprocess.run([sys.executable, str(script)], check=True, cwd=ROOT)


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as f:
        header = f.read(24)
    if len(header) < 24:
        return 1200, 800
    return struct.unpack(">II", header[16:24])


def image_dimensions(path: Path) -> tuple[int, int]:
    if path.suffix.lower() == ".png":
        return png_dimensions(path)
    from PIL import Image

    with Image.open(path) as im:
        return im.size


def scale_emu(w_px: int, h_px: int, max_cx: int = 5600000, max_cy: int = 7600000) -> tuple[int, int]:
    px_to_emu = 914400 / 96
    cx = int(w_px * px_to_emu)
    cy = int(h_px * px_to_emu)
    ratio = min(max_cx / cx, max_cy / cy, 1.0)
    return int(cx * ratio), int(cy * ratio)


def make_clean_image_para(rid: str, cx: int, cy: int, docpr_id: int, name: str) -> ET.Element:
    """Paragraphe image inline standard (compatible Word / LibreOffice)."""
    safe = name.replace("&", "&amp;")
    xml = f'''<w:p xmlns:w="{W}">
  <w:pPr>
    <w:spacing w:before="0" w:after="80"/>
    <w:jc w:val="center"/>
    <w:snapToGrid w:val="0"/>
  </w:pPr>
  <w:r><w:rPr><w:noProof/></w:rPr><w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="{WP}">
      <wp:extent cx="{cx}" cy="{cy}"/>
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      <wp:docPr id="{docpr_id}" name="{safe}"/>
      <wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1" xmlns:a="{A}"/></wp:cNvGraphicFramePr>
      <a:graphic xmlns:a="{A}"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <pic:pic xmlns:pic="{PIC}">
          <pic:nvPicPr><pic:cNvPr id="0" name="Picture"/><pic:cNvPicPr/></pic:nvPicPr>
          <pic:blipFill><a:blip r:embed="{rid}" xmlns:r="{R}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
          <pic:spPr>
            <a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          </pic:spPr>
        </pic:pic>
      </a:graphicData></a:graphic>
    </wp:inline>
  </w:drawing></w:r>
</w:p>'''
    return ET.fromstring(xml)


def has_embedded_image(p: ET.Element) -> bool:
    blip = p.find(f".//{{{A}}}blip")
    return blip is not None and blip.get(f"{{{R}}}embed") is not None


def container_in_body(body: ET.Element, target: ET.Element) -> ET.Element:
    for child in body:
        if child is target:
            return child
        if child.tag == f"{{{W}}}tbl" and target in child.iter():
            return child
    return target


def clear_line_spacing(spacing: ET.Element | None) -> None:
    if spacing is None:
        return
    for key in (f"{{{W}}}line", f"{{{W}}}lineRule"):
        spacing.attrib.pop(key, None)


def tighten_figure_blocks(body: ET.Element) -> int:
    paragraphs = body.findall(f".//{{{W}}}p")
    image_indices = {i for i, p in enumerate(paragraphs) if has_embedded_image(p)}
    fixed = 0
    for i in image_indices:
        for j in range(max(0, i - 2), min(len(paragraphs), i + 3)):
            p = paragraphs[j]
            ppr = p.find(f"{{{W}}}pPr")
            if ppr is None:
                ppr = ET.SubElement(p, f"{{{W}}}pPr")
                p.insert(0, ppr)
            spacing = ppr.find(f"{{{W}}}spacing")
            if spacing is None:
                spacing = ET.SubElement(ppr, f"{{{W}}}spacing")
            clear_line_spacing(spacing)
            text = para_text(p).strip()
            if j in image_indices:
                spacing.set(f"{{{W}}}before", "0")
                spacing.set(f"{{{W}}}after", "80")
                snap = ppr.find(f"{{{W}}}snapToGrid")
                if snap is None:
                    snap = ET.SubElement(ppr, f"{{{W}}}snapToGrid")
                snap.set(f"{{{W}}}val", "0")
            elif text.startswith("Figure"):
                spacing.set(f"{{{W}}}before", "0")
                spacing.set(f"{{{W}}}after", "120")
            elif j == i - 1:
                spacing.set(f"{{{W}}}before", "0")
                spacing.set(f"{{{W}}}after", "0")
            fixed += 1
    return fixed


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


def embedded_image_paragraphs(body: ET.Element) -> list[tuple[int, ET.Element]]:
    paragraphs = body.findall(f".//{{{W}}}p")
    return [(i, p) for i, p in enumerate(paragraphs) if has_embedded_image(p)]


def media_name_for(path: Path, prefix: str, index: int) -> tuple[str, bytes]:
    ext = path.suffix.lower().lstrip(".")
    media_ext = "jpeg" if ext in ("jpg", "jpeg") else "png"
    return f"word/media/{prefix}_{index:02d}.{media_ext}", path.read_bytes()


def add_relationship(rels_text: str, rid: str, target: str) -> str:
    if f'Id="{rid}"' in rels_text:
        return rels_text
    return rels_text.replace(
        "</Relationships>",
        f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="{target}"/></Relationships>',
    )


def ensure_content_type(ct_text: str, ext: str) -> str:
    if f'Extension="{ext}"' in ct_text:
        return ct_text
    ct_type = "image/jpeg" if ext == "jpeg" else "image/png"
    return ct_text.replace(
        "</Types>",
        f'<Default Extension="{ext}" ContentType="{ct_type}"/></Types>',
    )


def main() -> None:
    if not DOCX.exists():
        raise SystemExit(f"Fichier introuvable : {DOCX}")

    print("1/5 — Régénération PNG depuis SVG (Playwright)…")
    regenerate_png_from_svg()
    print("2/5 — Réparation pixels (traits blancs dans les PNG)…")
    repair_png_white_lines()

    diagram_paths = reinject.collect_paths()
    for p in diagram_paths + SCREENSHOT_PATHS:
        if not p.exists():
            raise SystemExit(f"Image source manquante : {p}")

    shutil.copy2(DOCX, BACKUP)
    register_docx_namespaces()

    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None

    ch2, ch3, ch3_end = chapter_bounds(body)
    embedded = embedded_image_paragraphs(body)
    ch2_items = [(i, p) for i, p in embedded if ch2 <= i < ch3]
    ch3_items = [(i, p) for i, p in embedded if ch3 <= i < ch3_end]

    rels_text = files["word/_rels/document.xml.rels"].decode("utf-8")
    ct_text = files["[Content_Types].xml"].decode("utf-8")
    docpr = 12000
    replaced = 0

    def replace_batch(items: list[tuple[int, ET.Element]], sources: list[Path], prefix: str) -> None:
        nonlocal rels_text, ct_text, docpr, replaced
        for n, ((_, old_p), src) in enumerate(zip(items, sources)):
            w_px, h_px = image_dimensions(src)
            cx, cy = scale_emu(w_px, h_px)
            media_rel, media_bytes = media_name_for(src, prefix, n + 1)
            media_target = media_rel.replace("word/", "")
            rid = f"rIdNoBlank_{prefix}_{n + 1}"
            rels_text = add_relationship(rels_text, rid, media_target)
            ext = media_rel.rsplit(".", 1)[-1]
            ct_text = ensure_content_type(ct_text, ext)
            files[media_rel] = media_bytes
            docpr += 1
            new_p = make_clean_image_para(rid, cx, cy, docpr, src.name)
            old_block = container_in_body(body, old_p)
            idx = list(body).index(old_block)
            body.remove(old_block)
            body.insert(idx, new_p)
            replaced += 1

    print("3/5 — Réinjection schémas Ch.2…")
    replace_batch(ch2_items, diagram_paths, "diagram")
    print("4/5 — Réinjection captures Ch.3…")
    replace_batch(ch3_items, SCREENSHOT_PATHS, "screenshot")
    print("5/5 — Ajustement espacement Word…")
    adjusted = tighten_figure_blocks(body)

    files["word/_rels/document.xml.rels"] = rels_text.encode("utf-8")
    files["[Content_Types].xml"] = ct_text.encode("utf-8")
    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — {replaced} images réinjectées, {adjusted} espacements ajustés")
    print(f"Fichier : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Réinjecte les PNG clairs du dossier diagrammes-images dans le Ch. 2 (format Word propre)."""
from __future__ import annotations

import copy
import importlib.util
import shutil
import struct
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-reinject-images.docx"
IMG_ROOT = ROOT / "docs" / "diagrammes-images"

_spec = importlib.util.spec_from_file_location("align", ROOT / "scripts" / "align-memoire-bou.py")
align = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(align)

W = align.W
R = align.R
A = align.A
WP = align.WP
PIC = align.PIC
para_text = align.para_text
register_docx_namespaces = align.register_docx_namespaces

sys_path = ROOT / "scripts"
import sys

sys.path.insert(0, str(sys_path))
from memoire_tamela_blocks import ELEVE_MODULES, ADMIN_MODULES, AGENT_MODULES, IMG  # noqa: E402


def collect_paths() -> list[Path]:
    paths: list[Path] = [
        IMG_ROOT / "architecture-generale-solution.png",
        IMG / "cas-utilisation-general.png",
        IMG / "cas-utilisation-eleve.drawio.png",
    ]
    for mod in ELEVE_MODULES:
        paths += [mod["activity_img"], mod["sequence_img"]]
        if mod.get("extra_sequence_img"):
            paths.append(mod["extra_sequence_img"])
    paths.append(IMG / "cas-utilisation-admin-obc-decc.drawio.png")
    for mod in ADMIN_MODULES:
        paths += [mod["activity_img"], mod["sequence_img"]]
        if mod.get("extra_sequence_img"):
            paths.append(mod["extra_sequence_img"])
    paths.append(IMG / "cas-utilisation-agent-centre.drawio.png")
    for mod in AGENT_MODULES:
        paths += [mod["activity_img"], mod["sequence_img"]]
    paths.append(IMG / "diagramme-classes-simplifie.png")
    return paths


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as f:
        header = f.read(24)
    if len(header) < 24:
        return 1200, 800
    return struct.unpack(">II", header[16:24])


def scale_emu(w_px: int, h_px: int, max_cx: int = 5600000, max_cy: int = 7600000) -> tuple[int, int]:
    px_to_emu = 914400 / 96
    cx = int(w_px * px_to_emu)
    cy = int(h_px * px_to_emu)
    ratio = min(max_cx / cx, max_cy / cy, 1.0)
    return int(cx * ratio), int(cy * ratio)


def make_clean_image_para(rid: str, cx: int, cy: int, docpr_id: int, name: str) -> ET.Element:
    """Format identique aux figures Ch. 3 qui s'affichent sans traits blancs."""
    xml = f'''<w:p xmlns:w="{W}">
  <w:pPr><w:spacing w:before="0" w:after="80"/><w:jc w:val="center"/></w:pPr>
  <w:r><w:rPr><w:noProof/></w:rPr><w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="{WP}">
      <wp:extent cx="{cx}" cy="{cy}"/>
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      <wp:docPr id="{docpr_id}" name="{name.replace("&", "&amp;")}"/>
      <wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1" xmlns:a="{A}"/></wp:cNvGraphicFramePr>
      <a:graphic xmlns:a="{A}"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
        <pic:pic xmlns:pic="{PIC}">
          <pic:nvPicPr><pic:cNvPr id="0" name="Picture"/><pic:cNvPicPr/></pic:nvPicPr>
          <pic:blipFill><a:blip r:embed="{rid}" xmlns:r="{R}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
          <pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
            <a:prstGeom prst="rect"><a:avLst/></a:prstGeom>
          </pic:spPr>
        </pic:pic>
      </a:graphicData></a:graphic>
    </wp:inline>
  </w:drawing></w:r>
</w:p>'''
    return ET.fromstring(xml)


def find_ch2_drawing_paras(body) -> list[ET.Element]:
    children = list(body)
    in_ch2 = False
    result: list[ET.Element] = []
    for child in children:
        if child.tag != f"{{{W}}}p":
            continue
        text = para_text(child).strip()
        if text.startswith("2.1 DÉMARCHE"):
            in_ch2 = True
        if text.startswith("2.5 DÉVELOPPEMENT"):
            break
        if in_ch2 and child.find(f".//{{{W}}}drawing") is not None:
            result.append(child)
    return result


def main() -> None:
    register_docx_namespaces()
    paths = collect_paths()
    for p in paths:
        if not p.exists():
            raise SystemExit(f"Image manquante : {p}")

    shutil.copy2(DOCX, BACKUP)

    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None

    drawing_paras = find_ch2_drawing_paras(body)
    if len(drawing_paras) != len(paths):
        print(f"Attention : {len(drawing_paras)} figures dans le doc, {len(paths)} fichiers source")

    rels_text = files["word/_rels/document.xml.rels"].decode("utf-8")
    ct_text = files["[Content_Types].xml"].decode("utf-8")

    # Nouveaux rId à partir de 500 pour éviter les collisions
    next_id = 500
    docpr = 5000

    for i, (para, src) in enumerate(zip(drawing_paras, paths)):
        w_px, h_px = png_dimensions(src)
        cx, cy = scale_emu(w_px, h_px)
        rid = f"rIdCh2Img{i + 1}"
        ext = src.suffix.lower().lstrip(".")
        media_ext = "jpeg" if ext in ("jpg", "jpeg") else "png"
        media_name = f"ch2_figure_{i + 1}.{media_ext}"

        rels_text = rels_text.replace(
            "</Relationships>",
            f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/{media_name}"/></Relationships>',
        )
        if f'Extension="{media_ext}"' not in ct_text:
            ct_type = "image/jpeg" if media_ext == "jpeg" else "image/png"
            ct_text = ct_text.replace(
                "</Types>",
                f'<Default Extension="{media_ext}" ContentType="{ct_type}"/></Types>',
            )

        files[f"word/media/{media_name}"] = src.read_bytes()

        docpr += 1
        new_para = make_clean_image_para(rid, cx, cy, docpr, src.name)
        parent = body
        idx = list(parent).index(para)
        parent.remove(para)
        parent.insert(idx, new_para)

    files["word/_rels/document.xml.rels"] = rels_text.encode("utf-8")
    files["[Content_Types].xml"] = ct_text.encode("utf-8")
    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — {min(len(drawing_paras), len(paths))} images Ch.2 réinjectées depuis docs/diagrammes-images/")
    print(DOCX)


if __name__ == "__main__":
    main()

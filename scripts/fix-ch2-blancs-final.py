#!/usr/bin/env python3
"""Fix définitif traits blancs Ch.2 : supprime interligne sur TOUT le chapitre + JPEG propres."""
from __future__ import annotations

import importlib.util
import io
import shutil
import struct
import sys
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-fix-blancs.docx"
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

sys.path.insert(0, str(ROOT / "scripts"))
from memoire_tamela_blocks import ELEVE_MODULES, ADMIN_MODULES, AGENT_MODULES, IMG  # noqa: E402

try:
    from PIL import Image
except ImportError:
    raise SystemExit("Pillow requis")


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


def png_dimensions(data: bytes) -> tuple[int, int]:
    if len(data) < 24:
        return 1200, 800
    return struct.unpack(">II", data[16:24])


def scale_emu(w_px: int, h_px: int) -> tuple[int, int]:
    px_to_emu = 914400 / 96
    cx = int(w_px * px_to_emu)
    cy = int(h_px * px_to_emu)
    ratio = min(5600000 / cx, 7600000 / cy, 1.0)
    return int(cx * ratio), int(cy * ratio)


def to_jpeg_bytes(src: Path) -> bytes:
    im = Image.open(src).convert("RGB")
    buf = io.BytesIO()
    im.save(buf, format="JPEG", quality=95, optimize=True)
    return buf.getvalue()


def strip_line_spacing(pPr: ET.Element | None) -> None:
    if pPr is None:
        return
    sp = pPr.find(f"{{{W}}}spacing")
    if sp is None:
        return
    for key in (f"{{{W}}}line", f"{{{W}}}lineRule"):
        sp.attrib.pop(key, None)


def make_image_para(rid: str, cx: int, cy: int, docpr_id: int) -> ET.Element:
    xml = f'''<w:p xmlns:w="{W}">
  <w:pPr><w:spacing w:before="0" w:after="80"/><w:jc w:val="center"/></w:pPr>
  <w:r><w:rPr><w:noProof/></w:rPr><w:drawing>
    <wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="{WP}">
      <wp:extent cx="{cx}" cy="{cy}"/>
      <wp:effectExtent l="0" t="0" r="0" b="0"/>
      <wp:docPr id="{docpr_id}" name="Picture"/>
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


def in_ch2(text: str, active: bool) -> bool:
    if text.startswith("2.1 DÉMARCHE"):
        return True
    if text.startswith("2.5 DÉVELOPPEMENT"):
        return False
    return active


def main() -> None:
    register_docx_namespaces()
    paths = collect_paths()
    shutil.copy2(DOCX, BACKUP)

    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None

    ch2_active = False
    stripped = 0
    drawing_paras: list[ET.Element] = []
    for p in body.iter(f"{{{W}}}p"):
        text = para_text(p).strip()
        if text.startswith("2.1 DÉMARCHE"):
            ch2_active = True
        if text.startswith("2.5 DÉVELOPPEMENT"):
            ch2_active = False
        if not ch2_active:
            continue
        pPr = p.find(f"{{{W}}}pPr")
        before = pPr.find(f"{{{W}}}spacing") is not None and pPr.find(f"{{{W}}}spacing").get(f"{{{W}}}line") if pPr is not None else None
        strip_line_spacing(pPr)
        if before:
            stripped += 1
        if p.find(f".//{{{W}}}drawing") is not None:
            drawing_paras.append(p)

    rels = files["word/_rels/document.xml.rels"].decode("utf-8")
    ct = files["[Content_Types].xml"].decode("utf-8")
    if 'Extension="jpeg"' not in ct:
        ct = ct.replace("</Types>", '<Default Extension="jpeg" ContentType="image/jpeg"/></Types>')

    docpr = 8000
    for i, (para, src) in enumerate(zip(drawing_paras, paths)):
        jpeg = to_jpeg_bytes(src)
        w_px, h_px = png_dimensions(jpeg)
        cx, cy = scale_emu(w_px, h_px)
        rid = f"rIdFix{i + 1}"
        media = f"word/media/ch2fix_{i + 1}.jpeg"
        files[media] = jpeg
        rels = rels.replace(
            "</Relationships>",
            f'<Relationship Id="{rid}" Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" Target="media/ch2fix_{i + 1}.jpeg"/></Relationships>',
        )
        docpr += 1
        new_p = make_image_para(rid, cx, cy, docpr)
        idx = list(body).index(para)
        body.remove(para)
        body.insert(idx, new_p)

    files["word/_rels/document.xml.rels"] = rels.encode("utf-8")
    files["[Content_Types].xml"] = ct.encode("utf-8")
    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — {stripped} paragraphes Ch.2 sans interligne + {len(drawing_paras)} images JPEG")
    print(DOCX)


if __name__ == "__main__":
    main()

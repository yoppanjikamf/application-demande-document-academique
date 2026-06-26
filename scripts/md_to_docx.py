#!/usr/bin/env python3
"""Conversion Markdown -> DOCX (WordprocessingML), sans dependance externe.

Usage: python3 scripts/md_to_docx.py <fichier.md> [dossier_sortie]

Prend en charge : titres (#, ##, ###), paragraphes, listes (-/*),
citations (>), regles horizontales (---), tableaux pipe, images ![alt](path),
gras **...** et code `...`.
"""

import os
import re
import struct
import sys
import zipfile

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def parse_inline(text: str):
    """Retourne une liste de segments (texte, bold, code)."""
    segments = []
    pattern = re.compile(r"\*\*(.+?)\*\*|`(.+?)`")
    pos = 0
    for m in pattern.finditer(text):
        if m.start() > pos:
            segments.append((text[pos:m.start()], False, False))
        if m.group(1) is not None:
            segments.append((m.group(1), True, False))
        else:
            segments.append((m.group(2), False, True))
        pos = m.end()
    if pos < len(text):
        segments.append((text[pos:], False, False))
    return segments or [("", False, False)]


def run_xml(text, bold=False, code=False, size=22, color=None):
    rpr = []
    if code:
        rpr.append('<w:rFonts w:ascii="Consolas" w:hAnsi="Consolas"/>')
        rpr.append('<w:shd w:val="clear" w:color="auto" w:fill="F4F4F4"/>')
    if bold:
        rpr.append("<w:b/>")
    if color:
        rpr.append(f'<w:color w:val="{color}"/>')
    rpr.append(f'<w:sz w:val="{size}"/><w:szCs w:val="{size}"/>')
    return (
        f"<w:r><w:rPr>{''.join(rpr)}</w:rPr>"
        f'<w:t xml:space="preserve">{esc(text)}</w:t></w:r>'
    )


def runs_for(text, size=22, bold_all=False, color=None):
    out = []
    for seg, bold, code in parse_inline(text):
        out.append(run_xml(seg, bold=bold or bold_all, code=code, size=size, color=color))
    return "".join(out)


def para(inner, ppr=""):
    return f"<w:p>{ppr}{inner}</w:p>"


def figure_title(text):
    """Titre de figure centré (obligatoire avant chaque image)."""
    ppr = (
        '<w:pPr><w:jc w:val="center"/>'
        '<w:spacing w:before="180" w:after="80"/>'
        '<w:keepNext/></w:pPr>'
    )
    return para(runs_for(text, size=24, bold_all=True, color="1F2937"), ppr)


def is_figure_title_line(line):
    return re.match(r"^\*\*Figure\s+", line.strip()) is not None


def parse_figure_title(line):
    m = re.match(r"^\*\*(Figure .+?)\*\*(.*)$", line.strip())
    if m:
        suffix = m.group(2).strip()
        return m.group(1) + (f" {suffix}" if suffix else "")
    return re.sub(r"^\*\*|\*\*$", "", line.strip())


def heading(text, level):
    size = {1: 40, 2: 30, 3: 26}.get(level, 24)
    color = {1: "1F2937", 2: "334155", 3: "475569"}.get(level, "475569")
    ppr = '<w:pPr><w:spacing w:before="220" w:after="100"/></w:pPr>'
    return para(runs_for(text, size=size, bold_all=True, color=color), ppr)


def hr():
    ppr = (
        '<w:pPr><w:pBdr><w:bottom w:val="single" w:sz="6" w:space="1" '
        'w:color="CCCCCC"/></w:pBdr></w:pPr>'
    )
    return para("", ppr)


def blockquote(lines):
    ppr = (
        '<w:pPr><w:pBdr><w:left w:val="single" w:sz="18" w:space="6" '
        'w:color="CBD5E1"/></w:pBdr><w:ind w:left="240"/></w:pPr>'
    )
    inner = "".join(
        runs_for(l, size=22, color="555555") + ('<w:br/>' if i < len(lines) - 1 else "")
        for i, l in enumerate(lines)
    )
    return para(inner, ppr)


def bullet(text):
    ppr = '<w:pPr><w:ind w:left="360" w:hanging="220"/></w:pPr>'
    return para(run_xml("\u2022  ", size=22) + runs_for(text, size=22), ppr)


def table(header, rows):
    borders = (
        "<w:tblBorders>"
        + "".join(
            f'<w:{e} w:val="single" w:sz="4" w:space="0" w:color="999999"/>'
            for e in ("top", "left", "bottom", "right", "insideH", "insideV")
        )
        + "</w:tblBorders>"
    )
    ncols = max(len(header), 1)
    col_pct = 5000 // ncols
    grid = "".join(f'<w:gridCol w:w="{col_pct}"/>' for _ in range(ncols))
    tblpr = (
        f'<w:tblPr><w:tblW w:w="5000" w:type="pct"/>'
        f'<w:tblLayout w:type="fixed"/>'
        f"{borders}</w:tblPr>"
        f"<w:tblGrid>{grid}</w:tblGrid>"
    )

    def cell(text, head=False):
        shd = '<w:shd w:val="clear" w:color="auto" w:fill="F0F0F0"/>' if head else ""
        tcpr = (
            f"<w:tcPr>"
            f'<w:tcW w:w="{col_pct}" w:type="pct"/>'
            f'<w:vAlign w:val="top"/>'
            f"{shd}</w:tcPr>"
        )
        ppr = '<w:pPr><w:spacing w:after="40"/></w:pPr>'
        body = para(runs_for(text, size=18, bold_all=head), ppr)
        return f"<w:tc>{tcpr}{body}</w:tc>"

    out = [f"<w:tbl>{tblpr}"]
    out.append("<w:tr>" + "".join(cell(c, head=True) for c in header) + "</w:tr>")
    for r in rows:
        padded = r + [""] * (ncols - len(r))
        out.append("<w:tr>" + "".join(cell(c) for c in padded[:ncols]) + "</w:tr>")
    out.append("</w:tbl>")
    out.append(para(""))
    return "".join(out)


def is_table_row(line):
    return re.match(r"^\s*\|.*\|\s*$", line) is not None


def split_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def png_dimensions(path):
    with open(path, "rb") as f:
        header = f.read(24)
    if len(header) < 24 or header[:8] != b"\x89PNG\r\n\x1a\n":
        return 1200, 800
    return struct.unpack(">II", header[16:24])


def jpeg_dimensions(path):
    with open(path, "rb") as f:
        data = f.read()
    i = 2
    while i < len(data) - 9:
        if data[i] != 0xFF:
            i += 1
            continue
        marker = data[i + 1]
        if marker in (0xC0, 0xC1, 0xC2, 0xC3, 0xC5, 0xC6, 0xC7, 0xC9, 0xCA, 0xCB, 0xCD, 0xCE, 0xCF):
            height = (data[i + 5] << 8) + data[i + 6]
            width = (data[i + 7] << 8) + data[i + 8]
            return width, height
        if marker in (0xD8, 0xD9):
            break
        length = (data[i + 2] << 8) + data[i + 3]
        i += 2 + length
    return 1200, 800


def image_dimensions(path):
    ext = os.path.splitext(path)[1].lower()
    if ext == ".png":
        return png_dimensions(path)
    if ext in (".jpg", ".jpeg"):
        return jpeg_dimensions(path)
    return 1200, 800


def image_media_info(path):
    ext = os.path.splitext(path)[1].lower()
    if ext in (".jpg", ".jpeg"):
        return "jpeg", "image/jpeg"
    return "png", "image/png"


# Largeur max affichée en portrait (EMU ≈ 15 cm). Hauteur libre : le texte suit juste en dessous.
PORTRAIT_MAX_W = 5900000


def scale_to_page_width(width_px, height_px, max_w_emu=PORTRAIT_MAX_W):
    """Ajuste uniquement la largeur d'affichage ; conserve l'image source en pleine résolution."""
    px_to_emu = 914400 / 96
    cx = int(width_px * px_to_emu)
    cy = int(height_px * px_to_emu)
    if cx <= max_w_emu:
        return cx, cy
    ratio = max_w_emu / cx
    return int(cx * ratio), int(cy * ratio)


def page_break():
    return f'<w:p><w:r><w:br w:type="page"/></w:r></w:p>'


def section_break(landscape=False):
    if landscape:
        pg_sz = '<w:pgSz w:w="16838" w:h="11906" w:orient="landscape"/>'
    else:
        pg_sz = '<w:pgSz w:w="11906" w:h="16838"/>'
    return (
        f"<w:p><w:pPr><w:sectPr>{pg_sz}"
        '<w:pgMar w:top="567" w:right="567" w:bottom="567" w:left="567" '
        'w:header="720" w:footer="720" w:gutter="0"/>'
        "</w:sectPr></w:pPr></w:p>"
    )


class ImageRegistry:
    def __init__(self):
        self.items: list[str] = []

    def add(self, source_path):
        for idx, path in enumerate(self.items, start=1):
            if path == source_path:
                return f"rId{idx}"
        self.items.append(source_path)
        return f"rId{len(self.items)}"


def image_paragraph(rid, cx, cy, docpr_id, name="Image"):
    return (
        "<w:p><w:pPr><w:jc w:val=\"center\"/>"
        "<w:spacing w:before=\"40\" w:after=\"100\"/></w:pPr><w:r><w:drawing>"
        '<wp:inline distT="0" distB="0" distL="0" distR="0" '
        'xmlns:wp="http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing">'
        f'<wp:extent cx="{cx}" cy="{cy}"/>'
        f'<wp:docPr id="{docpr_id}" name="{esc(name)}"/>'
        '<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1" '
        'xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main"/></wp:cNvGraphicFramePr>'
        '<a:graphic xmlns:a="http://schemas.openxmlformats.org/drawingml/2006/main">'
        '<a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        '<pic:pic xmlns:pic="http://schemas.openxmlformats.org/drawingml/2006/picture">'
        "<pic:nvPicPr>"
        f'<pic:cNvPr id="0" name="{esc(name)}"/>'
        "<pic:cNvPicPr/>"
        "</pic:nvPicPr>"
        "<pic:blipFill>"
        '<a:blip r:embed="' + rid + '" '
        'xmlns:r="http://schemas.openxmlformats.org/officeDocument/2006/relationships"/>'
        "<a:stretch><a:fillRect/></a:stretch>"
        "</pic:blipFill>"
        "<pic:spPr>"
        f'<a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>'
        '<a:prstGeom prst="rect"><a:avLst/></a:prstGeom>'
        "</pic:spPr>"
        "</pic:pic>"
        "</a:graphicData>"
        "</a:graphic>"
        "</wp:inline>"
        "</w:drawing></w:r></w:p>"
    )


def caption_para(text):
    ppr = '<w:pPr><w:jc w:val="center"/><w:spacing w:before="40" w:after="80"/></w:pPr>'
    return para(runs_for(text, size=20, color="555555"), ppr)


def image_placeholder(alt, path):
    return blockquote(
        [
            f"Emplacement figure — {alt}",
            f"Insérer l'image : {path}",
            "(Fichier introuvable au moment de la conversion ; glisser-déposer le PNG dans Word.)",
        ]
    )


def convert(md_path, out_dir):
    md_dir = os.path.dirname(os.path.abspath(md_path))
    images = ImageRegistry()
    docpr_id = 1

    with open(md_path, encoding="utf-8") as f:
        lines = f.read().splitlines()

    body = []
    i = 0
    n = len(lines)
    while i < n:
        line = lines[i]
        if not line.strip():
            i += 1
            continue
        comment = line.strip()
        if comment == "<!-- pagebreak -->":
            body.append(page_break())
            i += 1
            continue
        if comment in ("<!-- pagebreak landscape -->", "<!-- pagebreak portrait -->"):
            i += 1
            continue
        img_match = re.match(r"^!\[([^\]]*)\]\(([^)]+)\)\s*$", line.strip())
        if img_match:
            alt = img_match.group(1).strip() or "Figure"
            rel_path = img_match.group(2).strip()
            abs_path = rel_path if os.path.isabs(rel_path) else os.path.normpath(os.path.join(md_dir, rel_path))
            if os.path.isfile(abs_path) and abs_path.lower().endswith((".png", ".jpg", ".jpeg")):
                w_px, h_px = image_dimensions(abs_path)
                cx, cy = scale_to_page_width(w_px, h_px)
                rid = images.add(abs_path)
                docpr_id += 1
                body.append(image_paragraph(rid, cx, cy, docpr_id, alt))
            else:
                body.append(image_placeholder(alt, rel_path))
            i += 1
            continue
        if re.match(r"^---+\s*$", line):
            body.append(hr())
            i += 1
            continue
        m = re.match(r"^(#{1,6})\s+(.*)$", line)
        if m:
            body.append(heading(m.group(2), len(m.group(1))))
            i += 1
            continue
        if (
            is_table_row(line)
            and i + 1 < n
            and re.match(r"^\s*\|[\s:|-]+\|\s*$", lines[i + 1])
        ):
            header = split_row(line)
            i += 2
            rows = []
            while i < n and is_table_row(lines[i]):
                rows.append(split_row(lines[i]))
                i += 1
            body.append(table(header, rows))
            continue
        if re.match(r"^>\s?", line):
            quote = []
            while i < n and re.match(r"^>\s?", lines[i]):
                quote.append(re.sub(r"^>\s?", "", lines[i]))
                i += 1
            body.append(blockquote(quote))
            continue
        if re.match(r"^\s*[-*]\s+", line):
            while i < n and re.match(r"^\s*[-*]\s+", lines[i]):
                body.append(bullet(re.sub(r"^\s*[-*]\s+", "", lines[i])))
                i += 1
            continue
        if is_figure_title_line(line):
            body.append(figure_title(parse_figure_title(line)))
            i += 1
            continue
        body.append(para(runs_for(line, size=22)))
        i += 1

    document = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        f'<w:document xmlns:w="{W}"><w:body>'
        + "".join(body)
        + '<w:sectPr><w:pgSz w:w="11906" w:h="16838"/>'
        '<w:pgMar w:top="1134" w:right="1134" w:bottom="1134" w:left="1134" '
        'w:header="720" w:footer="720" w:gutter="0"/></w:sectPr>'
        "</w:body></w:document>"
    )

    content_types = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">'
        '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>'
        '<Default Extension="xml" ContentType="application/xml"/>'
        '<Default Extension="png" ContentType="image/png"/>'
        '<Default Extension="jpeg" ContentType="image/jpeg"/>'
        '<Default Extension="jpg" ContentType="image/jpeg"/>'
        '<Override PartName="/word/document.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
    )
    for idx, img_path in enumerate(images.items, start=1):
        media_ext, media_type = image_media_info(img_path)
        content_types += (
            f'<Override PartName="/word/media/image{idx}.{media_ext}" ContentType="{media_type}"/>'
        )
    content_types += "</Types>"

    doc_rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
    )
    for idx, img_path in enumerate(images.items, start=1):
        media_ext, _ = image_media_info(img_path)
        doc_rels += (
            f'<Relationship Id="rId{idx}" '
            'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
            f'Target="media/image{idx}.{media_ext}"/>'
        )
    doc_rels += "</Relationships>"
    rels = (
        '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>'
        '<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">'
        '<Relationship Id="rId1" '
        'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/officeDocument" '
        'Target="word/document.xml"/></Relationships>'
    )

    stem = os.path.splitext(os.path.basename(md_path))[0]
    os.makedirs(out_dir, exist_ok=True)
    out_path = os.path.join(out_dir, f"{stem}.docx")
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
        z.writestr("[Content_Types].xml", content_types)
        z.writestr("_rels/.rels", rels)
        z.writestr("word/document.xml", document)
        if images.items:
            z.writestr("word/_rels/document.xml.rels", doc_rels)
        for idx, img_path in enumerate(images.items, start=1):
            media_ext, _ = image_media_info(img_path)
            with open(img_path, "rb") as img_f:
                z.writestr(f"word/media/image{idx}.{media_ext}", img_f.read())
    print(f"OK -> {out_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/md_to_docx.py <fichier.md> [dossier_sortie]")
        sys.exit(1)
    md = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(md))
    convert(md, out)

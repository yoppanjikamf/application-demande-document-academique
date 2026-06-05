#!/usr/bin/env python3
"""Conversion Markdown -> DOCX (WordprocessingML), sans dependance externe.

Usage: python3 scripts/md_to_docx.py <fichier.md> [dossier_sortie]

Prend en charge : titres (#, ##, ###), paragraphes, listes (-/*),
citations (>), regles horizontales (---), tableaux pipe, gras **...**
et code `...`. Suffisant pour la documentation du projet.
"""

import os
import re
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
    tblpr = f'<w:tblPr><w:tblW w:w="5000" w:type="pct"/>{borders}</w:tblPr>'

    def cell(text, head=False):
        shd = '<w:shd w:val="clear" w:color="auto" w:fill="F0F0F0"/>' if head else ""
        tcpr = f"<w:tcPr>{shd}</w:tcPr>"
        body = para(runs_for(text, size=20, bold_all=head))
        return f"<w:tc>{tcpr}{body}</w:tc>"

    out = [f"<w:tbl>{tblpr}"]
    out.append("<w:tr>" + "".join(cell(c, head=True) for c in header) + "</w:tr>")
    for r in rows:
        out.append("<w:tr>" + "".join(cell(c) for c in r) + "</w:tr>")
    out.append("</w:tbl>")
    # un paragraphe vide apres le tableau (exigence Word)
    out.append(para(""))
    return "".join(out)


def is_table_row(line):
    return re.match(r"^\s*\|.*\|\s*$", line) is not None


def split_row(line):
    return [c.strip() for c in line.strip().strip("|").split("|")]


def convert(md_path, out_dir):
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
        '<Override PartName="/word/document.xml" '
        'ContentType="application/vnd.openxmlformats-officedocument.wordprocessingml.document.main+xml"/>'
        "</Types>"
    )
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
    print(f"OK -> {out_path}")


if __name__ == "__main__":
    if len(sys.argv) < 2:
        print("Usage: python3 scripts/md_to_docx.py <fichier.md> [dossier_sortie]")
        sys.exit(1)
    md = sys.argv[1]
    out = sys.argv[2] if len(sys.argv) > 2 else os.path.dirname(os.path.abspath(md))
    convert(md, out)

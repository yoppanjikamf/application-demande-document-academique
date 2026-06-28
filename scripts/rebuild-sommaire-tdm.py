#!/usr/bin/env python3
"""Reconstruit le sommaire court et la table des matières détaillée du mémoire."""
from __future__ import annotations

import importlib.util
import re
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
normalize_text = align.normalize_text
para_text = align.para_text
patch_tamela_styles = align.patch_tamela_styles
register_docx_namespaces = align.register_docx_namespaces
set_para_text = align.set_para_text

DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-sommaire-tdm.docx"

CHAPTER_TITLES = {
    "CHAPITRE 1": "CHAPITRE 1 : CONTEXTE ET PROBLÉMATIQUE",
    "CHAPITRE 2:CHAPITRE 2:": "CHAPITRE 2 : MÉTHODOLOGIE",
    "CHAPITRE 2": "CHAPITRE 2 : MÉTHODOLOGIE",
}

TITLE_DEDUP = {
    "REMERCIEMENTSREMERCIEMENTS": "REMERCIEMENTS",
    "GLOSSAIREGLOSSAIRE": "GLOSSAIRE",
    "RÉSUMÉRÉSUMÉ": "RÉSUMÉ",
    "SOMMAIRESOMMAIRE": "SOMMAIRE",
    "LISTE DES TABLEAUXLISTE DES TABLEAUX": "LISTE DES TABLEAUX",
    "ABSTRATABSTRAT": "ABSTRACT",
    "REFERENCES BIBLIOGRAPHIQUESREFERENCES BIBLIOGRAPHIQUES": "RÉFÉRENCES BIBLIOGRAPHIQUES",
    "INTRODUCTION GENERALE           INTRODUCTION GENERALE": "INTRODUCTION GÉNÉRALE",
}

SOMMAIRE_SHORT = [
    "DÉDICACE",
    "REMERCIEMENTS",
    "GLOSSAIRE",
    "RÉSUMÉ",
    "ABSTRACT",
    "LISTE DES FIGURES",
    "LISTE DES TABLEAUX",
    "SOMMAIRE",
    "TABLE DES MATIÈRES",
    "INTRODUCTION GÉNÉRALE",
    "CHAPITRE 1 : CONTEXTE ET PROBLÉMATIQUE",
    "CHAPITRE 2 : MÉTHODOLOGIE",
    "CHAPITRE 3 : IMPLÉMENTATION ET PRÉSENTATION DES RÉSULTATS",
    "CONCLUSION GÉNÉRALE",
    "RÉFÉRENCES BIBLIOGRAPHIQUES",
]

UML_SUB = [
    "Diagramme de cas d'utilisation",
    "Analyse des cas d'utilisation — package Élève",
    "Analyse des cas d'utilisation — package Administrateur",
    "Analyse des cas d'utilisation — package Agent",
    "DIAGRAMME DES CLASSES",
]

RE_SECTION = re.compile(
    r"^("
    r"CHAPITRE \d[^.]*|"
    r"INTRODUCTION GÉNÉRALE|INTRODUCTION GENERALE|"
    r"CONCLUSION GÉNÉRALE|CONCLUSION GENERALE|"
    r"\d+\.\d+(?:\.\d+){0,2}\s+[A-ZÉÈÊÀÂÄÔÖÙÛÜÇÎÏŒ0-9]|"
    r"INTRODUCTION|CONCLUSION"
    r")",
    re.UNICODE,
)


def leader_line(title: str, *, short: bool = False) -> str:
    clean = title.strip()
    target = 62 if short else 68
    dots = min(36, max(4, target - len(clean)))
    return f"{clean}{'…' * dots}"


def _ppr(*, center: bool = False, left_indent: int = 0, bold: bool = False, after: str = "80") -> ET.Element:
    ppr = ET.Element(f"{{{W}}}pPr")
    spacing = ET.SubElement(ppr, f"{{{W}}}spacing")
    spacing.set(f"{{{W}}}after", after)
    spacing.set(f"{{{W}}}line", "276")
    spacing.set(f"{{{W}}}lineRule", "auto")
    if center:
        ET.SubElement(ppr, f"{{{W}}}jc", {f"{{{W}}}val": "center"})
    if left_indent:
        ET.SubElement(ppr, f"{{{W}}}ind", {f"{{{W}}}left": str(left_indent)})
    if bold:
        rpr = ET.SubElement(ppr, f"{{{W}}}rPr")
        ET.SubElement(rpr, f"{{{W}}}b")
        ET.SubElement(rpr, f"{{{W}}}bCs")
    return ppr


def _run(text: str, *, bold: bool = False) -> ET.Element:
    r = ET.Element(f"{{{W}}}r")
    rpr = ET.SubElement(r, f"{{{W}}}rPr")
    ET.SubElement(rpr, f"{{{W}}}rFonts", {
        f"{{{W}}}ascii": "Times New Roman",
        f"{{{W}}}hAnsi": "Times New Roman",
        f"{{{W}}}cs": "Times New Roman",
    })
    ET.SubElement(rpr, f"{{{W}}}sz", {f"{{{W}}}val": "24"})
    ET.SubElement(rpr, f"{{{W}}}szCs", {f"{{{W}}}val": "24"})
    if bold:
        ET.SubElement(rpr, f"{{{W}}}b")
        ET.SubElement(rpr, f"{{{W}}}bCs")
    t = ET.SubElement(r, f"{{{W}}}t")
    t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t.text = text
    return r


def make_heading(text: str) -> ET.Element:
    p = ET.Element(f"{{{W}}}p")
    p.append(_ppr(center=True, bold=True, after="160"))
    p.append(_run(text, bold=True))
    return p


def make_toc_entry(title: str, level: int = 0, *, short: bool = False) -> ET.Element:
    indent = {0: 0, 1: 360, 2: 720, 3: 1080}.get(level, 0)
    p = ET.Element(f"{{{W}}}p")
    p.append(_ppr(left_indent=indent, after="60"))
    line = leader_line(title, short=short)
    p.append(_run(line, bold=(level == 0 and title.startswith("CHAPITRE"))))
    return p


def fix_all_text_nodes(root: ET.Element) -> None:
    for t in root.iter(f"{{{W}}}t"):
        if t.text:
            raw = t.text
            for old, new in TITLE_DEDUP.items():
                if old in raw:
                    t.text = raw.replace(old, new)
            if raw.strip().startswith("RESUME") and "RESUME" in raw and len(raw) > 10:
                t.text = "RÉSUMÉ"
            if raw.strip().startswith("LISTE DES FIGURES") and len(raw) > 25:
                t.text = "LISTE DES FIGURES"


def normalize_chapter_title(text: str) -> str:
    t = text.strip()
    if t in CHAPTER_TITLES:
        return CHAPTER_TITLES[t]
    if t.startswith("CHAPITRE 3 :"):
        return "CHAPITRE 3 : IMPLÉMENTATION ET PRÉSENTATION DES RÉSULTATS"
    return t


def heading_level(text: str, *, in_chapter: bool) -> int | None:
    t = text.strip()
    if t.startswith("CHAPITRE "):
        return 0
    if t in ("INTRODUCTION GÉNÉRALE", "CONCLUSION GÉNÉRALE"):
        return 0
    if re.match(r"^\d+\.\d+\.\d+\.\d+\s", t):
        return 3
    if re.match(r"^\d+\.\d+\.\d+\s", t):
        return 2
    if re.match(r"^\d+\.\d+\s", t):
        return 1
    if in_chapter and t == "INTRODUCTION":
        return 1
    if in_chapter and t == "CONCLUSION":
        return 1
    if t in UML_SUB:
        return 2
    return None


def extract_tdm_entries(body: ET.Element) -> list[tuple[int, str]]:
    entries: list[tuple[int, str]] = []
    in_main = False
    in_chapter = False
    past_uml = False

    for p in body.findall(f"{{{W}}}p"):
        text = para_text(p).strip()
        if not text or "BROUILLON" in text:
            continue
        if text.startswith("Figure ") or text.startswith("Tableau "):
            continue

        if text in ("INTRODUCTION GÉNÉRALE", "INTRODUCTION GENERALE") or text.startswith(
            "INTRODUCTION GENERALE"
        ):
            in_main = True
            entries.append((0, "INTRODUCTION GÉNÉRALE"))
            continue

        if not in_main:
            continue

        if text.startswith("CONCLUSION GENERALE") or text.startswith("CONCLUSION GÉNÉRALE"):
            entries.append((0, "CONCLUSION GÉNÉRALE"))
            break

        if text.startswith("CHAPITRE "):
            in_chapter = True
            past_uml = False
            entries.append((0, normalize_chapter_title(text)))
            continue

        if text.startswith("2.5 "):
            past_uml = True

        if not past_uml and text in UML_SUB:
            entries.append((2, text))
            continue

        lvl = heading_level(text, in_chapter=in_chapter)
        if lvl is not None:
            entries.append((lvl, text))

    return entries


def find_sommaire_block(body: ET.Element) -> tuple[ET.Element | None, ET.Element | None, ET.Element | None]:
    """Retourne (titre SOMMAIRE, 1re entrée à remplacer, titre INTRODUCTION à remplacer)."""
    paragraphs = body.findall(f"{{{W}}}p")
    heading = start_p = intro_p = None
    for i, p in enumerate(paragraphs):
        t = normalize_text(para_text(p)).strip()
        if t in ("SOMMAIRE", "SOMMAIRESOMMAIRE"):
            heading = p
            continue
        if heading is not None and start_p is None and (
            t.startswith("DÉDICACE") or t.startswith("DEDICACE")
        ) and ("…" in t or "..." in t):
            start_p = p
            continue
        if start_p is not None and ("…" not in t and "..." not in t) and (
            t.startswith("INTRODUCTION GENERALE")
            or t.startswith("INTRODUCTION GÉNÉRALE")
        ):
            intro_p = p
            break
    return heading, start_p, intro_p


def remove_orphan_toc_before_intro(body: ET.Element) -> None:
    """Supprime les reliquats de sommaire entre le titre intro et le corps du texte."""
    paragraphs = body.findall(f"{{{W}}}p")
    intro_idx = None
    for i, p in enumerate(paragraphs):
        t = para_text(p).strip()
        if ("…" not in t and "..." not in t) and t in ("INTRODUCTION GÉNÉRALE", "INTRODUCTION GENERALE"):
            intro_idx = i
            break
    if intro_idx is None:
        return

    to_remove = []
    for p in paragraphs[intro_idx + 1 : intro_idx + 12]:
        t = para_text(p).strip()
        if not t:
            continue
        if t.startswith("Dans un monde") or t.startswith("——— BROUILLON"):
            break
        if "…" in t or "..." in t or t.startswith("TABLE DES MATIÈRES"):
            to_remove.append(p)
        elif t in ("INTRODUCTION GÉNÉRALE", "INTRODUCTION GENERALE"):
            to_remove.append(p)
    for p in to_remove:
        body.remove(p)


def rebuild(body: ET.Element) -> None:
    fix_all_text_nodes(body)

    for p in body.findall(f"{{{W}}}p"):
        raw = para_text(p).strip()
        if raw in TITLE_DEDUP:
            set_para_text(p, TITLE_DEDUP[raw])
        elif raw.startswith("LISTE DES FIGURES") and len(raw) > 30:
            set_para_text(p, "LISTE DES FIGURES")
        elif raw.startswith("RESUME") and len(raw) > 15:
            set_para_text(p, "RÉSUMÉ")
        elif raw in CHAPTER_TITLES:
            set_para_text(p, CHAPTER_TITLES[raw])
        elif raw == "CHAPITRE 1":
            set_para_text(p, CHAPTER_TITLES["CHAPITRE 1"])

    tdm_front = [
        (0, "DÉDICACE"),
        (0, "REMERCIEMENTS"),
        (0, "GLOSSAIRE"),
        (0, "RÉSUMÉ"),
        (0, "ABSTRACT"),
        (0, "LISTE DES FIGURES"),
        (0, "LISTE DES TABLEAUX"),
        (0, "SOMMAIRE"),
        (0, "TABLE DES MATIÈRES"),
    ]
    tdm_body = extract_tdm_entries(body)
    tdm_all = tdm_front + tdm_body + [(0, "RÉFÉRENCES BIBLIOGRAPHIQUES")]

    heading, start_p, intro_p = find_sommaire_block(body)
    if heading is None or start_p is None:
        raise SystemExit("Bloc SOMMAIRE introuvable.")

    si = list(body).index(start_p)
    ei = list(body).index(intro_p) if intro_p is not None else si + 20
    for el in list(body)[si : ei + 1]:
        body.remove(el)

    insert_at = si
    for title in SOMMAIRE_SHORT:
        block = make_toc_entry(title, 0, short=True)
        body.insert(insert_at, block)
        insert_at += 1

    body.insert(insert_at, make_heading("TABLE DES MATIÈRES"))
    insert_at += 1
    for level, title in tdm_all:
        body.insert(insert_at, make_toc_entry(title, level))
        insert_at += 1

    body.insert(insert_at, make_heading("INTRODUCTION GÉNÉRALE"))
    remove_orphan_toc_before_intro(body)
    print(f"   Sommaire court : {len(SOMMAIRE_SHORT)} entrées")
    print(f"   Table des matières : {len(tdm_all)} entrées")


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

    rebuild(body)

    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    if "word/styles.xml" in files:
        files["word/styles.xml"] = patch_tamela_styles(files["word/styles.xml"])

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — sommaire et table des matières reconstruits")
    print(f"Fichier : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

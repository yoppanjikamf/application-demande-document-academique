#!/usr/bin/env python3
"""Replace RÉSUMÉ and ABSTRACT body in bout aligne.docx."""
from __future__ import annotations

import copy
import re
import shutil
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup.docx"

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

RESUME_PARAS: list[list[tuple[str, bool, bool]]] = [
    [
        (
            "L'Office du Baccalauréat du Cameroun (OBC) et la Direction des Examens, des Concours et de la Certification (DECC) occupent une place centrale dans la délivrance des diplômes et documents scolaires au Cameroun, à travers leurs antennes et centres de retrait répartis sur l'ensemble du territoire. Des milliers d'élèves et de diplômés dépendent chaque année de ces structures pour obtenir leurs relevés de notes, leurs diplômes ou leurs duplicatas.",
            False,
            False,
        ),
    ],
    [
        (
            "Toutefois, au sein de ces services, les démarches de retrait restent largement fondées sur des procédures manuelles et des canaux informels de communication. Les usagers peinent à savoir si leur document est disponible avant de se déplacer, subissent parfois de longues attentes au guichet ou des amendes liées au retard de retrait, tandis que l'administration consacre un temps important à la saisie, au suivi et à la coordination des dossiers sans outil numérique unifié.",
            False,
            False,
        ),
    ],
    [
        ("Problématique : ", True, False),
        (
            "Comment concevoir et développer une application web permettant de réduire le temps consacré aux démarches de retrait de documents scolaires, tant pour les élèves que pour les services OBC/DECC, tout en rendant le processus plus transparent, traçable et sécurisé ?",
            False,
            True,
        ),
    ],
    [
        (
            "Face à ces limites, le présent mémoire propose la conception, le développement et l'implémentation de D-SCOLCAM, une application web dédiée à la vérification et à la gestion des retraits de documents scolaires. Cette solution vise à centraliser le suivi des demandes, à informer l'usager avant tout déplacement et à alléger le travail administratif.",
            False,
            False,
        ),
    ],
    [
        (
            "Le projet a été mené selon une démarche structurée, de l'analyse de l'existant à la conception UML, puis au développement et aux tests. Les technologies retenues sont Next.js, React, TypeScript, PostgreSQL avec Prisma, Supabase Auth, Tailwind CSS, Nodemailer et Zod, avec un déploiement cible sur Vercel et Supabase Cloud.",
            False,
            False,
        ),
    ],
    [
        (
            "Mots-clés : Application web, Documents scolaires, OBC, DECC, D-SCOLCAM, Rendez-vous, Duplicata, Digitalisation.",
            True,
            False,
        ),
    ],
]

ABSTRACT_PARAS: list[list[tuple[str, bool, bool]]] = [
    [
        (
            "The Office du Baccalaureate of Cameroon (OBC) and the Directorate of Examinations, Competitions and Certification (DECC) play a central role in the delivery of diplomas and academic documents across the country, through regional offices and collection centers nationwide. Each year, thousands of students and graduates rely on these bodies to obtain transcripts, diplomas or certified duplicates.",
            False,
            False,
        ),
    ],
    [
        (
            "However, within these services, retrieval procedures remain largely based on manual processes and informal communication channels. Users often travel without knowing whether their document is ready, face long waits at counters or fines for late collection, while staff spend considerable time on manual data entry, tracking and coordination without a unified digital tool.",
            False,
            False,
        ),
    ],
    [
        ("Research question: ", True, False),
        (
            "How can a web application be designed and developed to reduce the time spent on academic document retrieval procedures, for both students and OBC/DECC services, while making the process more transparent, traceable and secure?",
            False,
            True,
        ),
    ],
    [
        (
            "In response to these limitations, this thesis presents the design, development and implementation of D-SCOLCAM, a web application dedicated to verifying and managing the retrieval of academic documents. The solution aims to centralize request tracking, inform users before any travel and simplify administrative work.",
            False,
            False,
        ),
    ],
    [
        (
            "The project followed a structured approach, from analysis of the existing system to UML modeling, then development and testing. The technologies used are Next.js, React, TypeScript, PostgreSQL with Prisma, Supabase Auth, Tailwind CSS, Nodemailer and Zod, with deployment on Vercel and Supabase Cloud.",
            False,
            False,
        ),
    ],
    [
        (
            "Keywords: Web application, Academic documents, OBC, DECC, D-SCOLCAM, Appointments, Duplicate, Digitalization.",
            True,
            False,
        ),
    ],
]


def para_text(p: ET.Element) -> str:
    return "".join(t.text or "" for t in p.iter(f"{W}t")).strip()


def clone_pPr(template: ET.Element) -> ET.Element | None:
    pPr = template.find(f"{W}pPr")
    return copy.deepcopy(pPr) if pPr is not None else None


def make_run(text: str, bold: bool = False, italic: bool = False) -> ET.Element:
    r = ET.Element(f"{W}r")
    if bold or italic:
        rPr = ET.SubElement(r, f"{W}rPr")
        if bold:
            ET.SubElement(rPr, f"{W}b")
            ET.SubElement(rPr, f"{W}bCs")
        if italic:
            ET.SubElement(rPr, f"{W}i")
            ET.SubElement(rPr, f"{W}iCs")
    t = ET.SubElement(r, f"{W}t")
    if text.startswith(" ") or text.endswith(" "):
        t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t.text = text
    return r


def make_paragraph(parts: list[tuple[str, bool, bool]], pPr_template: ET.Element | None) -> ET.Element:
    p = ET.Element(f"{W}p")
    if pPr_template is not None:
        p.append(copy.deepcopy(pPr_template))
    for text, bold, italic in parts:
        p.append(make_run(text, bold=bold, italic=italic))
    return p


def clear_paragraph(p: ET.Element) -> None:
    for child in list(p):
        if child.tag != f"{W}pPr":
            p.remove(child)


def set_paragraph_content(
    p: ET.Element, parts: list[tuple[str, bool, bool]]
) -> None:
    clear_paragraph(p)
    for text, bold, italic in parts:
        p.append(make_run(text, bold=bold, italic=italic))


def is_resume_start(text: str) -> bool:
    return text.startswith("Au Cameroun, la récupération") or text.startswith(
        "L'Office du Baccalauréat"
    )


def is_mots_cles(text: str) -> bool:
    return text.startswith("Mots-clés")


def is_abstract_start(text: str) -> bool:
    return text.startswith("In Cameroon, the retrieval")


def is_keywords(text: str) -> bool:
    return text.startswith("Keywords:")


def main() -> None:
    if not DOCX.exists():
        raise SystemExit(f"Fichier introuvable : {DOCX}")

    shutil.copy2(DOCX, BACKUP)

    with zipfile.ZipFile(DOCX, "r") as zin:
        xml = zin.read("word/document.xml")
        other_files = {name: zin.read(name) for name in zin.namelist() if name != "word/document.xml"}

    root = ET.fromstring(xml)
    body = root.find(f"{W}body")
    if body is None:
        raise SystemExit("document.xml invalide")

    children = list(body)
    pPr_template: ET.Element | None = None

    resume_start_idx: int | None = None
    resume_end_idx: int | None = None
    abstract_start_idx: int | None = None
    abstract_end_idx: int | None = None

    for i, child in enumerate(children):
        if child.tag != f"{W}p":
            continue
        text = para_text(child)
        if pPr_template is None and is_resume_start(text):
            pPr_template = clone_pPr(child)
        if resume_start_idx is None and (
            is_resume_start(text) or text.startswith("Au Cameroun, la récupération")
        ):
            resume_start_idx = i
        if resume_start_idx is not None and resume_end_idx is None and is_mots_cles(text):
            resume_end_idx = i
        if abstract_start_idx is None and is_abstract_start(text):
            abstract_start_idx = i
        if abstract_start_idx is not None and abstract_end_idx is None and is_keywords(text):
            abstract_end_idx = i

    if resume_start_idx is None or resume_end_idx is None:
        raise SystemExit("Section RÉSUMÉ introuvable dans le document.")
    if abstract_start_idx is None or abstract_end_idx is None:
        raise SystemExit("Section ABSTRACT introuvable dans le document.")

    if pPr_template is None:
        pPr_template = clone_pPr(children[resume_start_idx])

    resume_block = children[resume_start_idx : resume_end_idx + 1]
    abstract_block = children[abstract_start_idx : abstract_end_idx + 1]

    new_resume = [
        make_paragraph(parts, pPr_template) for parts in RESUME_PARAS
    ]
    new_abstract = [
        make_paragraph(parts, pPr_template) for parts in ABSTRACT_PARAS
    ]

    def replace_block(old_block: list[ET.Element], new_paras: list[ET.Element]) -> None:
        if len(new_paras) == len(old_block):
            for old_p, parts in zip(old_block, [p for p in RESUME_PARAS]):
                pass
        # Rebuild: remove old nodes, insert new at first position
        insert_at = body.index(old_block[0])
        for node in old_block:
            body.remove(node)
        for offset, new_p in enumerate(new_paras):
            body.insert(insert_at + offset, new_p)

    # Replace résumé
    body_children = list(body)
    insert_at = body_children.index(resume_block[0])
    for node in resume_block:
        body.remove(node)
    for offset, new_p in enumerate(new_resume):
        body.insert(insert_at + offset, new_p)

    # Re-find abstract after résumé mutation
    children = list(body)
    abstract_start_idx = abstract_end_idx = None
    for i, child in enumerate(children):
        if child.tag != f"{W}p":
            continue
        text = para_text(child)
        if abstract_start_idx is None and is_abstract_start(text):
            abstract_start_idx = i
        if abstract_start_idx is not None and abstract_end_idx is None and is_keywords(text):
            abstract_end_idx = i

    if abstract_start_idx is None:
        # abstract text was only in old block - find ABSTRAT header then next content para
        for i, child in enumerate(children):
            if child.tag != f"{W}p":
                continue
            if "ABSTRAT" in para_text(child).upper() and len(para_text(child)) < 30:
                # find next non-empty after header empties
                for j in range(i + 1, min(i + 8, len(children))):
                    if children[j].tag == f"{W}p" and para_text(children[j]):
                        abstract_start_idx = j
                        break
                break

    if abstract_start_idx is not None:
        abstract_end_idx = abstract_start_idx
        for j in range(abstract_start_idx, len(children)):
            if children[j].tag != f"{W}p":
                continue
            text = para_text(children[j])
            if is_keywords(text):
                abstract_end_idx = j
                break
            if text.startswith("LISTE DES FIGURES"):
                break

    abstract_block = children[abstract_start_idx : abstract_end_idx + 1]
    body_children = list(body)
    insert_at = body_children.index(abstract_block[0])
    for node in abstract_block:
        body.remove(node)
    for offset, new_p in enumerate(new_abstract):
        body.insert(insert_at + offset, new_p)

    new_xml = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(DOCX, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        zout.writestr("word/document.xml", new_xml)
        for name, data in other_files.items():
            zout.writestr(name, data)

    print(f"OK — RÉSUMÉ et ABSTRACT mis à jour dans : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Aligne bibliographie, reconstruit TDM, nettoie titres. Conclusion : option --conclusion."""
from __future__ import annotations

import argparse
import copy
import importlib.util
import re
import shutil
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]


def _load_module(name: str, path: Path):
    spec = importlib.util.spec_from_file_location(name, path)
    mod = importlib.util.module_from_spec(spec)
    assert spec.loader is not None
    spec.loader.exec_module(mod)
    return mod


align = _load_module("align", ROOT / "scripts" / "align-memoire-bou.py")
rs = _load_module("rebuild_sommaire_tdm", ROOT / "scripts" / "rebuild-sommaire-tdm.py")

W = align.W
para_text = align.para_text
register_docx_namespaces = align.register_docx_namespaces
set_para_text = align.set_para_text

DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-finition-memoire.docx"

REN_CITES = {18: 8, 17: 7, 16: 6, 15: 5, 14: 4}

BIBLIO_SECTIONS = [
    ("Sites institutionnels", [
        "[1]  Office du Baccalauréat du Cameroun (OBC), Site officiel, [En ligne]. "
        "Disponible sur : https://www.officedubac.cm. [Consulté en 2026].",
        "[2]  Ministère des Enseignements Secondaires du Cameroun (MINESEC), Site officiel, [En ligne]. "
        "Disponible sur : https://www.minesec.gov.cm. [Consulté en 2026].",
        "[3]  Délégation Générale à la Sûreté Nationale (DGSN), Plateforme IDCAM — "
        "Pré-enrôlement en ligne pour la carte nationale d'identité, [En ligne]. "
        "Disponible sur : https://www.idcam.cm. [Consulté en 2026].",
    ]),
    ("Articles et textes officiels", [
        "[4]  Office du Baccalauréat du Cameroun (OBC), « Nos services », [En ligne]. "
        "Disponible sur : https://officedubac.cm/nos-services/. [Consulté en 2026].",
        "[5]  République du Cameroun, Décret n°2018/608 du 18 octobre 2018 portant "
        "organisation de l'Office du Baccalauréat du Cameroun, [En ligne]. "
        "Disponible sur : https://www.primature.cm/. [Consulté en 2026].",
        "[6]  Journalducameroun.com, « Cameroun : les diplômes des baccalauréats session 2024 "
        "sont disponibles », [En ligne]. Disponible sur : "
        "https://fr.journalducameroun.com/cameroun-les-diplomes-des-baccalaureats-session-2024-sont-disponibles/. "
        "[Consulté en 2026].",
        "[7]  The Times of Cameroon, « Session 2024 : Les diplômes sont disponibles », [En ligne]. "
        "Disponible sur : https://timesofcameroon.com/session-2024-les-diplomes-sont-disponibles/. "
        "[Consulté en 2026].",
        "[8]  Kamerpower, « Procédure de retrait ANDD et diplômes OBC.cm », [En ligne]. "
        "Disponible sur : https://kamerpower.com/fr/procedure-de-retrait-andd-et-diplomes/. "
        "[Consulté en 2026].",
    ]),
]

CONCLUSION_PARAS = [
    (
        "Dans un contexte marqué par la transformation numérique des services publics, la "
        "modernisation des procédures administratives s'impose avec une urgence croissante. "
        "Au Cameroun, la gestion des documents scolaires demeurait largement tributaire de "
        "pratiques manuelles, privant de nombreux élèves et diplômés d'un accès simple et "
        "transparent à leurs documents officiels. C'est dans cette dynamique que s'inscrit "
        "le présent mémoire."
    ),
    (
        "L'objectif principal de ce travail était de concevoir, développer et implémenter "
        "D-SCOLCAM, une application web de vérification et de gestion des retraits de "
        "documents scolaires, dédiée aux services de l'OBC et de la DECC. Une analyse "
        "approfondie de l'existant a permis d'identifier les insuffisances majeures : "
        "absence de canal d'information fiable, déplacements répétés, files d'attente, "
        "opacité des procédures et faible traçabilité."
    ),
    (
        "À partir de ces constats, une solution numérique centralisée a été conçue selon "
        "une approche itérative. L'application permet aux élèves de consulter la "
        "disponibilité de leurs documents, de soumettre des demandes, de planifier des "
        "rendez-vous de retrait et de suivre leurs démarches. Côté administration, un "
        "back-office complet couvre la gestion des élèves, des documents, des rendez-vous, "
        "des paiements, des notifications et des imports CSV."
    ),
    (
        "Le développement s'est appuyé sur Next.js, React, PostgreSQL, Prisma, Supabase "
        "Auth, Tailwind CSS, Nodemailer et Zod. Les tests menés ont confirmé le bon "
        "fonctionnement des parcours principaux. Des limites subsistent néanmoins : "
        "paiement Mobile Money non branché à un opérateur réel, stockage des justificatifs "
        "de duplicata à durcir en production, et déploiement institutionnel effectif à "
        "poursuivre."
    ),
    (
        "En définitive, ce projet répond à un besoin concret de la communauté des "
        "diplômés camerounais. À l'image de la plateforme IDCAM pour la carte "
        "nationale d'identité [3], D-SCOLCAM aspire à améliorer l'accès aux documents "
        "scolaires avec plus d'efficacité, de transparence et d'équité."
    ),
]


def clone_ppr(template: ET.Element | None) -> ET.Element | None:
    if template is None:
        return None
    ppr = template.find(f"{{{W}}}pPr")
    return copy.deepcopy(ppr) if ppr is not None else None


def make_body_para(text: str, template_ppr: ET.Element | None, *, jc: str | None = None) -> ET.Element:
    p = ET.Element(f"{{{W}}}p")
    if template_ppr is not None:
        ppr = copy.deepcopy(template_ppr)
        spacing = ppr.find(f"{{{W}}}spacing")
        if spacing is not None:
            spacing.set(f"{{{W}}}after", "120")
            spacing.attrib.pop(f"{{{W}}}line", None)
            spacing.attrib.pop(f"{{{W}}}lineRule", None)
        if jc:
            jc_el = ppr.find(f"{{{W}}}jc")
            if jc_el is None:
                jc_el = ET.SubElement(ppr, f"{{{W}}}jc")
            jc_el.set(f"{{{W}}}val", jc)
        p.append(ppr)
    r = ET.SubElement(p, f"{{{W}}}r")
    t = ET.SubElement(r, f"{{{W}}}t")
    t.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t.text = text
    return p


def bib_start_paragraph(body: ET.Element) -> ET.Element:
    """Dernière section bibliographie (entrée [1] juste après le titre)."""
    paragraphs = body.findall(f"{{{W}}}p")
    candidates: list[ET.Element] = []
    for p in paragraphs:
        text = para_text(p)
        if "REFERENCES BIBLIOGRAPHIQUES" in text or "RÉFÉRENCES BIBLIOGRAPHIQUES" in text:
            if "…" in text or "..." in text:
                continue
            candidates.append(p)
    for p in reversed(candidates):
        idx = paragraphs.index(p)
        rest = paragraphs[idx + 1 : idx + 4]
        if any(para_text(r).strip().startswith("[") for r in rest):
            return p
    if candidates:
        return candidates[-1]
    raise SystemExit("Bibliographie introuvable.")


def renumber_citations(body: ET.Element) -> None:
    bib_p = bib_start_paragraph(body)
    bib_idx = list(body).index(bib_p)
    for i, p in enumerate(body.findall(f"{{{W}}}p")):
        if list(body).index(p) >= bib_idx:
            continue
        text = para_text(p)
        if not re.search(r"\[\d+\]", text):
            continue
        new_text = text
        for old, new in sorted(REN_CITES.items(), reverse=True):
            new_text = new_text.replace(f"[{old}]", f"[{new}]")
        if new_text != text:
            set_para_text(p, new_text)


def remove_intro_brouillons(body: ET.Element) -> None:
    children = list(body)
    removing = False
    for el in children:
        if el.tag != f"{{{W}}}p":
            if removing:
                removing = False
            continue
        text = para_text(el).strip()
        if text.startswith("——— BROUILLON"):
            removing = True
            body.remove(el)
            continue
        if removing:
            body.remove(el)
            if text.startswith("CHAPITRE ") or text.startswith("1.1 "):
                removing = False


def fix_duplicate_headings(body: ET.Element) -> None:
    rs.fix_all_text_nodes(body)
    for p in body.findall(f"{{{W}}}p"):
        raw = para_text(p).strip()
        if raw in rs.TITLE_DEDUP:
            set_para_text(p, rs.TITLE_DEDUP[raw])
        elif raw in rs.CHAPTER_TITLES:
            set_para_text(p, rs.CHAPTER_TITLES[raw])


def conclusion_section_indices(body: ET.Element) -> tuple[int, int]:
    paragraphs = body.findall(f"{{{W}}}p")
    start = end = None
    for i, p in enumerate(paragraphs):
        text = para_text(p).strip()
        if text in ("CONCLUSION GENERALE", "CONCLUSION GÉNÉRALE") or (
            text.startswith("CONCLUSION GENERALE") and "…" not in text
        ):
            if i > 500:
                start = i
    if start is None:
        raise SystemExit("Conclusion générale introuvable.")
    for j in range(start + 1, len(paragraphs)):
        text = para_text(paragraphs[j]).strip()
        if ("REFERENCES BIBLIOGRAPHIQUES" in text or "RÉFÉRENCES BIBLIOGRAPHIQUES" in text) and (
            "…" not in text
        ):
            end = j
            break
    if end is None:
        raise SystemExit("Fin de conclusion introuvable.")
    return start, end


def replace_conclusion(body: ET.Element, template_ppr: ET.Element | None) -> None:
    start, end = conclusion_section_indices(body)
    children = list(body)
    start_el = body.findall(f"{{{W}}}p")[start]
    end_el = body.findall(f"{{{W}}}p")[end]
    si = children.index(start_el)
    ei = children.index(end_el)
    for el in children[si + 1 : ei]:
        body.remove(el)
    pos = si + 1
    for para in CONCLUSION_PARAS:
        body.insert(pos, make_body_para(para, template_ppr, jc="both"))
        pos += 1
    set_para_text(start_el, "CONCLUSION GÉNÉRALE")


def replace_bibliography(body: ET.Element, template_ppr: ET.Element | None) -> None:
    start_p = bib_start_paragraph(body)
    si = list(body).index(start_p)
    for el in list(body)[si + 1 :]:
        body.remove(el)
    set_para_text(start_p, "RÉFÉRENCES BIBLIOGRAPHIQUES")
    pos = si + 1
    for section_title, entries in BIBLIO_SECTIONS:
        body.insert(pos, make_body_para(section_title, template_ppr))
        pos += 1
        for entry in entries:
            body.insert(pos, make_body_para(entry, template_ppr))
            pos += 1


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--strip-brouillons",
        action="store_true",
        help="Supprime les brouillons VERSION A/B/C (désactivé par défaut)",
    )
    parser.add_argument(
        "--conclusion",
        action="store_true",
        help="Remplace la conclusion (à n'utiliser qu'après validation du texte)",
    )

    args = parser.parse_args()

    if not DOCX.exists():
        raise SystemExit(f"Fichier introuvable : {DOCX}")

    shutil.copy2(DOCX, BACKUP)
    register_docx_namespaces()

    with zipfile.ZipFile(DOCX) as z:
        files = {n: z.read(n) for n in z.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None

    template_ppr = None
    for p in body.findall(f"{{{W}}}p"):
        if para_text(p).strip().startswith("[1]"):
            template_ppr = clone_ppr(p)
            break

    fix_duplicate_headings(body)
    if args.strip_brouillons:
        remove_intro_brouillons(body)
    renumber_citations(body)
    rs.rebuild(body)
    if args.conclusion:
        replace_conclusion(body, template_ppr)
    replace_bibliography(body, template_ppr)

    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    if "word/styles.xml" in files:
        files["word/styles.xml"] = align.patch_tamela_styles(files["word/styles.xml"])

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    parts = ["bibliographie [1]-[8]", "table des matières complète", "titres dupliqués"]
    if args.strip_brouillons:
        parts.append("brouillons intro supprimés")
    if args.conclusion:
        parts.append("conclusion reformatée")
    print("OK — " + ", ".join(parts))
    print(f"Fichier : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

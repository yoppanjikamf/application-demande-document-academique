#!/usr/bin/env python3
"""Replace INTRODUCTION GÉNÉRALE body in bout aligne.docx (synthèse A+B+D)."""
from __future__ import annotations

import copy
import shutil
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-intro.docx"

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

RESEARCH_Q = (
    "Comment concevoir et développer une application web permettant de réduire le temps "
    "consacré aux démarches de retrait de documents scolaires, tant pour les élèves que "
    "pour les services OBC/DECC, tout en rendant le processus plus transparent, "
    "traçable et sécurisé ?"
)

INTRO_PARAS: list[list[tuple[str, bool, bool]]] = [
    [
        (
            "Dans un monde marqué par la généralisation du numérique, la digitalisation et la "
            "modernisation des services publics ne constituent plus une simple option : elles "
            "s'imposent comme une obligation pour améliorer la qualité du service rendu aux "
            "citoyens, renforcer la transparence des procédures et accélérer le traitement "
            "des demandes.",
            False,
            False,
        ),
    ],
    [
        (
            "La mise à disposition d'informations fiables en ligne, le suivi des démarches à "
            "distance et la traçabilité des opérations illustrent concrètement les apports de "
            "cette transformation pour des millions d'usagers.",
            False,
            False,
        ),
    ],
    [
        (
            "Pourtant, dans de nombreuses administrations, les modes de fonctionnement demeurent "
            "largement manuels et peu structurés. Saisies répétitives, coordination difficile, "
            "communication informelle et absence d'outil unifié de suivi prolongent les délais, "
            "multiplient les erreurs et alourdissent la charge des agents comme celle des usagers. "
            "Ce décalage entre les exigences d'une administration moderne et la réalité du terrain "
            "freine l'efficacité des services publics et accentue la frustration des bénéficiaires.",
            False,
            False,
        ),
    ],
    [
        (
            "La délivrance des documents scolaires au Cameroun illustre particulièrement cette "
            "situation. L'Office du Baccalauréat du Cameroun (OBC) et la Direction des Examens, "
            "des Concours et de la Certification (DECC) occupent un rôle central dans la remise "
            "des diplômes, relevés de notes et duplicatas à travers le pays. Des milliers d'élèves "
            "et de diplômés dépendent chaque année de ces structures, alors que les démarches de "
            "retrait reposent encore sur des pratiques archaïques : déplacements répétés, files "
            "d'attente, annonces dispersées sur des canaux informels et faible visibilité sur "
            "l'état réel des dossiers.",
            False,
            False,
        ),
    ],
    [
        (
            "Comme de nombreux diplômés, j'ai moi-même dû me rendre plusieurs fois au guichet "
            "sans certitude d'obtenir mon document — une contrainte parmi d'autres qui confirme "
            "l'urgence d'une réponse adaptée.",
            False,
            False,
        ),
    ],
    [
        (
            "Face à ce constat, une solution fondée sur les technologies de l'information "
            "apparaît pertinente : analyser le besoin, modéliser le système à l'aide du langage "
            "UML, concevoir une application web adaptée aux règles métier OBC/DECC, puis "
            "digitaliser et tracer les étapes du processus de retrait. La question centrale qui "
            "oriente ce travail est la suivante : ",
            False,
            False,
        ),
        (RESEARCH_Q, False, True),
    ],
    [
        (
            "L'objectif général de ce mémoire est de proposer une réponse concrète à cette question "
            "à travers la conception, le développement et l'implémentation de D-SCOLCAM, une "
            "application web dédiée à la vérification et à la gestion des retraits de documents "
            "scolaires. La solution vise à faciliter et alléger les démarches, raccourcir les "
            "procédures, réduire les pertes de temps et d'argent liées aux déplacements inutiles, "
            "et mieux informer usagers et services à chaque étape du processus.",
            False,
            False,
        ),
    ],
    [
        (
            "Sur le plan spécifique, l'application doit permettre de vérifier la disponibilité "
            "d'un document avant tout déplacement, de réduire le nombre d'interventions physiques "
            "inutiles et la durée des procédures, d'organiser les retraits de manière plus fluide, "
            "de limiter les files d'attente au guichet et de renforcer la traçabilité des "
            "opérations menées par les services OBC/DECC.",
            False,
            False,
        ),
    ],
    [
        (
            "Le projet a été mené selon une approche itérative et incrémentale inspirée de la "
            "méthode Agile, allant de l'analyse de l'existant à la conception, au développement "
            "et aux tests de la solution. Le présent document s'organise comme suit : une "
            "introduction générale ; un premier chapitre consacré au contexte et à la "
            "problématique ; un second chapitre présentant la méthodologie adoptée ; un troisième "
            "chapitre relatif à l'implémentation et à la présentation des résultats ; enfin une "
            "conclusion générale.",
            False,
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


def is_intro_start(text: str) -> bool:
    return text.startswith("Dans un contexte mondial") or (
        text.startswith("Dans un monde") and "numérique" in text
    )


def is_intro_end(text: str) -> bool:
    return text == "CHAPITRE 1" or (text.startswith("CHAPITRE 1") and len(text) <= 12)


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
    start_idx = end_idx = None
    pPr_template = None

    for i, child in enumerate(children):
        if child.tag != f"{W}p":
            continue
        text = para_text(child)
        if start_idx is None and is_intro_start(text):
            start_idx = i
            pPr_template = clone_pPr(child)
        if start_idx is not None and end_idx is None and is_intro_end(text):
            end_idx = i
            break

    if start_idx is None or end_idx is None:
        raise SystemExit("Introduction générale introuvable.")

    old_block = children[start_idx:end_idx]
    new_paras = [make_paragraph(parts, pPr_template) for parts in INTRO_PARAS]

    body_children = list(body)
    insert_at = body_children.index(old_block[0])
    for node in old_block:
        body.remove(node)
    for offset, new_p in enumerate(new_paras):
        body.insert(insert_at + offset, new_p)

    new_xml = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    with zipfile.ZipFile(DOCX, "w", compression=zipfile.ZIP_DEFLATED) as zout:
        zout.writestr("word/document.xml", new_xml)
        for name, data in other_files.items():
            zout.writestr(name, data)

    print(f"OK — Introduction mise à jour ({len(new_paras)} paragraphes) : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

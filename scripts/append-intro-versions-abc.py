#!/usr/bin/env python3
"""Intro principale (synthèse) + versions A, B, C en brouillon dans bout aligne.docx."""
from __future__ import annotations

import copy
import shutil
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-intro-versions.docx"

W = "{http://schemas.openxmlformats.org/wordprocessingml/2006/main}"

RESEARCH_Q = (
    "Comment concevoir et développer une application web permettant de réduire le temps "
    "consacré aux démarches de retrait de documents scolaires, tant pour les élèves que "
    "pour les services OBC/DECC, tout en rendant le processus plus transparent, "
    "traçable et sécurisé ?"
)

# Synthèse A+B+D (version principale en tête)
SYNTHESIS: list[list[tuple[str, bool, bool]]] = [
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

VERSION_A: list[str] = [
    "Dans un monde marqué par la généralisation du numérique, la digitalisation et la modernisation des services publics ne constituent plus une simple option : elles s'imposent comme une obligation pour améliorer la qualité du service rendu aux citoyens, renforcer la transparence des procédures et accélérer le traitement des demandes.",
    "La mise à disposition d'informations fiables en ligne, le suivi des démarches à distance et la traçabilité des opérations illustrent concrètement les apports de cette transformation pour des millions d'usagers.",
    "Pourtant, dans de nombreuses administrations, les modes de fonctionnement demeurent largement manuels et peu structurés. Registres papier, communications informelles et absence d'outils unifiés prolongent les délais, multiplient les erreurs et alourdissent la charge des agents comme celle des usagers. Ce décalage entre les exigences d'une administration moderne et la réalité du terrain freine l'efficacité des services publics et accentue la frustration des bénéficiaires.",
    "La délivrance des documents scolaires au Cameroun illustre particulièrement cette situation. L'Office du Baccalauréat du Cameroun (OBC) et la Direction des Examens, des Concours et de la Certification (DECC) occupent un rôle central dans la remise des diplômes, relevés de notes et duplicatas à travers le pays. Des milliers d'élèves et de diplômés dépendent chaque année de ces structures, alors que les démarches de retrait reposent encore sur des pratiques archaïques : déplacements répétés, files d'attente, annonces dispersées sur des canaux informels et faible visibilité sur l'état réel des dossiers.",
    "Comme beaucoup de diplômés, j'ai moi-même dû me rendre plusieurs fois au guichet sans certitude d'obtenir mon document, ce qui m'a sensibilisé à l'urgence d'une réponse adaptée.",
    "Face à ce constat, une solution fondée sur les technologies de l'information apparaît pertinente : concevoir une application web, modéliser le système en amont à l'aide du langage UML, puis digitaliser et tracer les étapes du processus de retrait. La question centrale qui oriente ce travail est la suivante : " + RESEARCH_Q,
    "L'objectif général de ce mémoire est de proposer une réponse concrète à cette question à travers la conception, le développement et l'implémentation de D-SCOLCAM, une application web dédiée à la vérification et à la gestion des retraits de documents scolaires. Plus précisément, la solution vise à informer l'usager sur la disponibilité de son document avant tout déplacement, à réduire les démarches inutiles et les temps d'attente, à raccourcir les procédures de demande et de retrait, à limiter les pertes de temps et d'argent liées aux allers-retours, et à faciliter le travail de coordination et de suivi côté administration comme côté usager.",
    "Le projet a été mené selon une approche itérative et incrémentale inspirée de la méthode Agile, allant de l'analyse de l'existant à la conception, au développement et aux tests de la solution. Le présent document s'organise comme suit : une introduction générale ; un premier chapitre consacré au contexte et à la problématique ; un second chapitre présentant la méthodologie adoptée ; un troisième chapitre relatif à l'implémentation et à la présentation des résultats ; enfin une conclusion générale.",
]

VERSION_B: list[str] = [
    "À l'heure où le numérique transforme profondément les relations entre l'administration et les citoyens, la modernisation des services publics n'est plus seulement une nécessité : c'est une condition pour offrir des démarches plus rapides, plus lisibles et mieux suivies. Informer à distance, réduire les déplacements superflus et conserver une trace des opérations sont autant d'atouts que la digitalisation peut apporter à des millions d'usagers au quotidien.",
    "Toutefois, de nombreux services publics continuent de fonctionner selon des logiques manuelles héritées du passé. L'absence de portail centralisé, la communication informelle et la saisie répétitive des mêmes informations entretiennent des lenteurs, des erreurs et une opacité préjudiciables tant pour les agents que pour les usagers. Ce fossé entre le potentiel du numérique et la réalité des pratiques freine la modernisation attendue.",
    "Au Cameroun, la remise des documents scolaires en offre un exemple parlant. L'OBC et la DECC assurent, chacun dans son périmètre, la délivrance des diplômes, relevés et duplicatas pour des candidats répartis sur l'ensemble du territoire. Or, les procédures de retrait demeurent largement physiques et peu prévisibles : l'usager ignore souvent si son document est disponible, subit de longues attentes et, dans certains cas, des sanctions pour retard de retrait faute d'information adéquate. J'en ai personnellement fait l'expérience lors de démarches répétées au guichet, sans garantie de succès immédiat.",
    "Dans cette perspective, ce mémoire adopte une orientation clairement informatique : modéliser le système, concevoir une application web adaptée aux règles métier OBC/DECC, et digitaliser le parcours de retrait pour le rendre plus court, plus transparent et mieux traçable. La question de recherche qui guide l'ensemble du travail est la suivante : " + RESEARCH_Q,
    "Pour y répondre, nous proposons D-SCOLCAM, dont l'objectif général est de faciliter et d'alléger les démarches de retrait, de réduire les pertes de temps et les déplacements inutiles, et de mieux informer chaque acteur au bon moment. Concrètement, l'application doit permettre de vérifier la disponibilité d'un document avant un déplacement, de réduire la durée et la complexité des procédures, d'organiser les retraits de manière plus fluide, de limiter les files d'attente au guichet et de renforcer la traçabilité des opérations menées par les services concernés.",
    "La réalisation du projet s'appuie sur une démarche Agile, structurée en cycles successifs d'analyse, de conception, de développement et de validation. Le mémoire se compose d'une introduction générale, d'un chapitre 1 consacré au contexte et à la problématique, d'un chapitre 2 présentant la méthodologie, d'un chapitre 3 exposant l'implémentation et les résultats obtenus, puis d'une conclusion générale.",
]

VERSION_C: list[str] = [
    "Le numérique redéfinit aujourd'hui la manière dont les administrations interagissent avec les citoyens. Digitaliser les services publics, c'est offrir plus de clarté, accélérer les traitements et permettre un suivi fiable des démarches — des exigences devenues incontournables dans un contexte où l'usager attend réactivité et transparence.",
    "Malheureusement, plusieurs secteurs publics demeurent marqués par des pratiques manuelles, lentes et peu traçables. Lorsque l'information circule de façon informelle et que chaque demande repose sur des déplacements physiques, les délais s'allongent, les coûts augmentent et la charge de travail des agents s'accroît sans gain d'efficacité réel.",
    "C'est le cas de la délivrance des documents scolaires au Cameroun, où l'OBC et la DECC jouent un rôle déterminant. Malgré l'importance de ces services, le retrait des diplômes, relevés ou duplicatas repose encore sur des procédures archaïques. Beaucoup d'usagers multiplient les visites au guichet sans certitude sur la disponibilité de leur dossier — situation que j'ai moi-même connue et qui motive le présent travail.",
    "Ce mémoire s'inscrit dans une logique de génie logiciel : analyser le besoin, modéliser la solution en UML, puis concevoir une application web capable de digitaliser et de tracer le processus de retrait. " + RESEARCH_Q + " — telle est la question de recherche qui structure notre démarche.",
    "La réponse apportée passe par D-SCOLCAM, une application web visant à raccourcir les procédures, à réduire les démarches superflues, à indiquer clairement la disponibilité d'un document, à limiter les pertes de temps liées aux déplacements et à faciliter le suivi des retraits, tant du côté des usagers que des services OBC/DECC.",
    "Conduit selon une approche Agile, le projet est présenté en trois chapitres — contexte et problématique, méthodologie, implémentation et résultats — précédés de la présente introduction et suivis d'une conclusion générale.",
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


def make_simple(text: str, pPr_template: ET.Element | None, bold: bool = False) -> ET.Element:
    return make_paragraph([(text, bold, False)], pPr_template)


def is_intro_start(text: str) -> bool:
    return text.startswith("Dans un contexte mondial") or text.startswith("Dans un monde marqué")


def is_intro_end(text: str) -> bool:
    return text == "CHAPITRE 1" or (text.startswith("CHAPITRE 1") and len(text) <= 12)


def build_all_paragraphs(pPr_template: ET.Element | None) -> list[ET.Element]:
    out: list[ET.Element] = []

    # Version principale (synthèse) — sans libellé brouillon
    for parts in SYNTHESIS:
        out.append(make_paragraph(parts, pPr_template))

    out.append(make_simple("", pPr_template))

    for label, version in [
        ("——— BROUILLON — VERSION A — À SUPPRIMER APRÈS CHOIX ———", VERSION_A),
        ("——— BROUILLON — VERSION B — À SUPPRIMER APRÈS CHOIX ———", VERSION_B),
        ("——— BROUILLON — VERSION C — À SUPPRIMER APRÈS CHOIX ———", VERSION_C),
    ]:
        out.append(make_simple(label, pPr_template, bold=True))
        for text in version:
            out.append(make_simple(text, pPr_template))
        out.append(make_simple("", pPr_template))

    return out


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
    new_paras = build_all_paragraphs(pPr_template)

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

    print(f"OK — Intro synthèse + versions A, B, C : {DOCX}")
    print(f"Paragraphes insérés : {len(new_paras)}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

#!/usr/bin/env python3
"""Réécrit le Chapitre 2 de bout aligne.docx (méthode, analyse, conception, 12 UC)."""
from __future__ import annotations

import copy
import importlib.util
import shutil
import sys
import zipfile
from pathlib import Path
import xml.etree.ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
sys.path.insert(0, str(ROOT / "scripts"))

_spec = importlib.util.spec_from_file_location("align_memoire_bou", ROOT / "scripts" / "align-memoire-bou.py")
align = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(align)

ImageInjector = align.ImageInjector
W = align.W
para_text = align.para_text
patch_tamela_styles = align.patch_tamela_styles
register_docx_namespaces = align.register_docx_namespaces
set_para_text = align.set_para_text
from memoire_tamela_blocks import (  # noqa: E402
    Counters,
    IMG,
    add_figure,
    build_uml_blocks,
    fiche_table,
    para,
)

DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-chapitre2.docx"
ARCH = ROOT / "docs" / "diagrammes-images" / "architecture-generale-solution.png"

DEV_RENUMBER = {
    "2.5 DÉVELOPPEMENT ET IMPLÉMENTATION": "3.2 DÉVELOPPEMENT ET IMPLÉMENTATION",
    "2.5.1 Environnement de développement": "3.2.1 Environnement de développement",
    "2.5.2 Gestion des versions": "3.2.2 Gestion des versions",
    "2.5.3 Bonnes pratiques de développement": "3.2.3 Bonnes pratiques de développement",
    "2.5.4 Intégration continue et déploiement continu (CI/CD)": (
        "3.2.4 Intégration continue et déploiement continu (CI/CD)"
    ),
    "2.6 MÉTHODE DE TEST ET VALIDATION": "3.3 MÉTHODE DE TEST ET VALIDATION",
    "2.6.1 Types de tests réalisés": "3.3.1 Types de tests réalisés",
    "2.6.2 Outils de test utilisés": "3.3.2 Outils de test utilisés",
    "2.7 DÉPLOIEMENT ET MAINTENANCE": "3.4 DÉPLOIEMENT ET MAINTENANCE",
    "2.7.1 Stratégie de déploiement": "3.4.1 Stratégie de déploiement",
    "2.7.2 Monitoring et maintenance": "3.4.2 Monitoring et maintenance",
    "2.8 LIMITES ET DIFFICULTÉS RENCONTRÉES": "3.5 LIMITES ET DIFFICULTÉS RENCONTRÉES",
    "2.8.1 Problèmes techniques rencontrés": "3.5.1 Problèmes techniques rencontrés",
    "2.8.2 Contraintes liées au temps": "3.5.2 Contraintes liées au temps",
    "2.8.3 Limites fonctionnelles de la version actuelle": "3.5.3 Limites fonctionnelles de la version actuelle",
}

CH3_RENUMBER = {
    "3.2 PRÉSENTATION DES RÉSULTATS OBTENUS": "3.6 PRÉSENTATION DES RÉSULTATS OBTENUS",
    "3.2.1 Résultats techniques": "3.6.1 Résultats techniques",
    "3.2.2 Présentation de la solution": "3.6.2 Présentation de la solution",
    "3.2.2.1 Espace élève": "3.6.2.1 Espace élève",
    "3.2.2.2 Espace administrateur OBC / DECC": "3.6.2.2 Espace administrateur OBC / DECC",
    "3.2.2.3 Espace agent centre d'examen": "3.6.2.3 Espace agent centre d'examen",
    "3.2.2.3 Espace agent centre d\u2019examen": "3.6.2.3 Espace agent centre d\u2019examen",
    "3.2.3 Résultats des tests": "3.6.3 Résultats des tests",
    "3.2.4 Couverture des tests": "3.6.4 Couverture des tests",
    "3.2.5 Bugs identifiés et corrections apportées": "3.6.5 Bugs identifiés et corrections apportées",
    "3.3 ANALYSE CRITIQUE ET DISCUSSION": "3.7 ANALYSE CRITIQUE ET DISCUSSION",
    "3.3.1 Points forts du projet": "3.7.1 Points forts du projet",
    "3.3.2 Limites et difficultés rencontrées": "3.7.2 Limites et difficultés rencontrées",
    "3.3.3 Comparaison avec des solutions existantes": "3.7.3 Comparaison avec des solutions existantes",
    "3.4 PERSPECTIVES D'AMÉLIORATION": "3.8 PERSPECTIVES D'AMÉLIORATION",
    "3.4 PERSPECTIVES D\u2019AMÉLIORATION": "3.8 PERSPECTIVES D\u2019AMÉLIORATION",
    "3.5 CONCLUSION": "3.9 CONCLUSION",
}


def renumber_paragraph(p: ET.Element, mapping: dict[str, str]) -> None:
    text = para_text(p).strip()
    for old, new in mapping.items():
        if text == old or text.startswith(old):
            set_para_text(p, text.replace(old, new, 1))
            return


def clone_pPr(template: ET.Element | None) -> ET.Element | None:
    if template is None:
        return None
    pPr = template.find(f"{{{W}}}pPr")
    return copy.deepcopy(pPr) if pPr is not None else None


def apply_template_pPr(block: ET.Element, template_pPr: ET.Element | None) -> None:
    if template_pPr is None:
        return
    if block.find(f".//{{{W}}}drawing") is not None:
        return
    if block.find(f".//{{{W}}}tbl") is not None:
        return
    pPr = block.find(f"{{{W}}}pPr")
    if pPr is not None:
        block.remove(pPr)
    block.insert(0, copy.deepcopy(template_pPr))


def build_ch2_prose(injector: ImageInjector) -> list[ET.Element]:
    blocks: list[ET.Element] = []
    counters = Counters(figure=1, table=2)

    blocks.append(para("INTRODUCTION", style="Titre3"))
    blocks.append(para(
        "Ce chapitre présente la démarche retenue pour concevoir D-SCOLCAM. Nous exposons la "
        "méthodologie de travail, une synthèse de l'analyse et de la conception issues du cahier "
        "d'analyse et du cahier de conception, puis la modélisation UML des cas d'utilisation "
        "essentiels. L'implémentation, les tests et le déploiement sont traités au chapitre 3.",
        jc="both",
    ))

    blocks.append(para("2.1 DÉMARCHE MÉTHODOLOGIQUE", style="Titre3"))
    blocks.append(para("2.1.1 Choix du modèle de développement", style="Titre4"))
    blocks.append(para(
        "Le projet a été mené selon une approche itérative et incrémentale, inspirée de la "
        "méthode Agile. Le travail a été découpé en sprints successifs, chacun livrant un "
        "incrément testable.",
        jc="both",
    ))

    tbl_n = counters.next_tbl()
    blocks.append(para(f"Tableau {tbl_n} : Planification des sprints du projet", style="Lgende", jc="center"))
    blocks.append(fiche_table([
        ("Sprint 1", "Authentification et base technique — schéma Prisma, activation, connexion, rôles"),
        ("Sprint 2", "Documents et back-office — espace Mes documents, imports CSV, routage OBC/DECC"),
        ("Sprint 3", "RDV, paiements, notifications — quota, jours fériés, duplicata, RDV"),
        ("Sprint 4", "Finalisation — tests, corrections, déploiement, documentation"),
    ]))

    blocks.append(para("2.1.2 Outil de gestion", style="Titre4"))
    blocks.append(para(
        "GitHub Projects a servi à suivre les tâches, en lien direct avec le dépôt de code.",
        jc="both",
    ))

    blocks.append(para("2.1.3 Collecte et analyse des besoins", style="Titre4"))
    blocks.append(para(
        "La collecte s'est appuyée sur l'observation du processus manuel OBC/DECC (chapitre 1), "
        "le cahier des charges, une analyse comparative (IDCAM [3]) et la validation progressive "
        "par l'implémentation. Le détail figure dans le cahier d'analyse.",
        jc="both",
    ))

    blocks.append(para("2.2 SYNTHÈSE DE L'ANALYSE", style="Titre3"))
    blocks.append(para("2.2.1 Acteurs et périmètre", style="Titre4"))
    blocks.append(fiche_table([
        ("Élève / diplômé", "Consultation, demandes, paiement duplicata, rendez-vous de retrait"),
        ("Administrateur OBC / DECC", "Imports, disponibilisation, validation duplicata, paramétrage RDV"),
        ("Agent centre d'examen", "Consultation des RDV, confirmation du retrait physique"),
        ("Périmètre", "Documents OBC/DECC ; retraits centre d'examen et antennes régionales"),
    ]))

    blocks.append(para("2.2.2 Besoins retenus", style="Titre4"))
    blocks.append(para(
        "Les besoins fonctionnels essentiels répondent à la problématique : informer l'usager avant "
        "le déplacement, structurer les demandes, limiter l'affluence (quota, RDV, jours fériés) "
        "et tracer les opérations. Les besoins non fonctionnels portent sur la sécurité, la "
        "traçabilité et la maintenabilité.",
        jc="both",
    ))

    blocks.append(para("2.3 SYNTHÈSE DE LA CONCEPTION", style="Titre3"))
    blocks.append(para("2.3.1 Architecture logicielle", style="Titre4"))
    blocks.append(para(
        "L'application suit une architecture web en couches : interface (Next.js), logique métier "
        "(Server Actions, services), persistance (PostgreSQL via Prisma), authentification "
        "(Supabase Auth).",
        jc="both",
    ))
    add_figure(
        blocks, injector, counters, ARCH,
        "Architecture générale de l'application D-SCOLCAM.",
    )

    blocks.append(para("2.3.2 Choix technologiques", style="Titre4"))
    blocks.append(fiche_table([
        ("Frontend", "Next.js, React, Tailwind CSS — interface responsive"),
        ("Backend", "Server Actions, API Routes — traitement métier"),
        ("Données", "Prisma, PostgreSQL (Supabase) — modèle relationnel"),
        ("Auth", "Supabase Auth — sessions sécurisées"),
        ("Emails", "Nodemailer — notifications et reçus"),
    ]))

    blocks.append(para("2.4 MODÉLISATION UML — CAS D'UTILISATION ESSENTIELS", style="Titre3"))
    blocks.extend(build_uml_blocks(injector, counters))

    blocks.append(para("CONCLUSION", style="Titre3"))
    blocks.append(para(
        "Ce chapitre a présenté la méthodologie Agile retenue, la synthèse de l'analyse et de la "
        "conception de D-SCOLCAM, ainsi que la modélisation UML de douze cas d'utilisation "
        "essentiels. Le chapitre suivant présente l'implémentation, les tests, le déploiement "
        "et les résultats obtenus.",
        jc="both",
    ))
    return blocks


def find_ch2_bounds(body) -> tuple[int, int, int, ET.Element | None]:
    children = list(body)
    idx_21 = idx_25 = idx_ch3 = None
    pPr_template = None

    for i, child in enumerate(children):
        if child.tag != f"{{{W}}}p":
            continue
        text = para_text(child).strip()
        if idx_21 is None and text.startswith("2.1") and "INTRODUCTION" in text:
            idx_21 = i
            pPr_template = clone_pPr(child)
        if text.startswith("2.5 DÉVELOPPEMENT"):
            idx_25 = i
        if idx_25 is not None and text.startswith("CHAPITRE 3"):
            idx_ch3 = i
            break

    if idx_21 is None or idx_25 is None or idx_ch3 is None:
        raise SystemExit(
            f"Impossible de localiser le Chapitre 2 (2.1={idx_21}, 2.5={idx_25}, ch3={idx_ch3})."
        )
    return idx_21, idx_25, idx_ch3, pPr_template


def main() -> None:
    if not DOCX.exists():
        raise SystemExit(f"Fichier introuvable : {DOCX}")

    shutil.copy2(DOCX, BACKUP)
    register_docx_namespaces()
    injector = ImageInjector()

    with zipfile.ZipFile(DOCX, "r") as zin:
        files = {name: zin.read(name) for name in zin.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None

    idx_21, idx_25, idx_ch3, pPr_template = find_ch2_bounds(body)
    children = list(body)

    dev_nodes: list[ET.Element] = []
    for i in range(idx_25, idx_ch3):
        node = copy.deepcopy(children[i])
        if node.tag == f"{{{W}}}p" and "DR-DOCSCOL" in para_text(node):
            set_para_text(node, para_text(node).replace("DR-DOCSCOL", "D-SCOLCAM"))
        dev_nodes.append(node)

    # Remplacer uniquement 2.1–2.4 (avant §2.5), conserver §2.5–2.9 et le Ch. 3 intacts
    old_block = children[idx_21:idx_25]
    for node in old_block:
        body.remove(node)

    new_blocks = build_ch2_prose(injector)
    # Retirer la conclusion provisoire : §2.9 original clôt le chapitre après §2.5–2.8
    while new_blocks:
        last = new_blocks[-1]
        if last.tag == f"{{{W}}}p":
            t = para_text(last).strip()
            if t == "CONCLUSION" or "méthodologie Agile" in t:
                new_blocks.pop()
                continue
        break

    insert_at = idx_21
    for offset, block in enumerate(new_blocks):
        apply_template_pPr(block, pPr_template)
        body.insert(insert_at + offset, block)

    insert_dev = idx_21 + len(new_blocks)
    for offset, node in enumerate(dev_nodes):
        body.insert(insert_dev + offset, node)

    for p in body.findall(f"{{{W}}}p"):
        text = para_text(p)
        if "DR-DOCSCOL" in text:
            set_para_text(p, text.replace("DR-DOCSCOL", "D-SCOLCAM"))

    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    if "word/styles.xml" in files:
        files["word/styles.xml"] = patch_tamela_styles(files["word/styles.xml"])

    if injector.items:
        rels = files.get("word/_rels/document.xml.rels", b"").decode("utf-8")
        ct = files.get("[Content_Types].xml", b"").decode("utf-8")
        for i, path in enumerate(injector.items, start=1):
            ext = path.suffix.lower().lstrip(".")
            media_ext = "jpeg" if ext in ("jpg", "jpeg") else ext
            ct_type = "image/jpeg" if media_ext == "jpeg" else "image/png"
            rels = rels.replace(
                "</Relationships>",
                f'<Relationship Id="rIdImg{i}" '
                'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
                f'Target="media/align_image{i}.{media_ext}"/></Relationships>',
            )
            ct = ct.replace(
                "</Types>",
                f'<Default Extension="{media_ext}" ContentType="{ct_type}"/></Types>',
            )
            files[f"word/media/align_image{i}.{media_ext}"] = path.read_bytes()
        files["word/_rels/document.xml.rels"] = rels.encode("utf-8")
        files["[Content_Types].xml"] = ct.encode("utf-8")

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as zout:
        for name, data in files.items():
            zout.writestr(name, data)

    print(f"OK — Chapitre 2 mis à jour ({len(new_blocks)} blocs) : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")
    print(f"§2.5–2.9 conservés dans le Ch. 2 : {len(dev_nodes)} nœuds")


if __name__ == "__main__":
    main()

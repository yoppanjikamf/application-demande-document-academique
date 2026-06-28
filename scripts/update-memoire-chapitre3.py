#!/usr/bin/env python3
"""Ajoute §3.2 justifications technologiques et renumérote le Chapitre 3."""
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

_spec = importlib.util.spec_from_file_location("align", ROOT / "scripts" / "align-memoire-bou.py")
align = importlib.util.module_from_spec(_spec)
assert _spec.loader is not None
_spec.loader.exec_module(align)

W = align.W
para_text = align.para_text
patch_tamela_styles = align.patch_tamela_styles
register_docx_namespaces = align.register_docx_namespaces
set_para_text = align.set_para_text

from memoire_tamela_blocks import fiche_table, para  # noqa: E402

DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-chapitre3.docx"

# Renumérotation : ancien → nouveau (ordre du plus spécifique au plus général)
REN_MAP: list[tuple[str, str]] = [
    ("3.2.2.3 Espace agent centre d\u2019examen", "3.3.2.3 Espace agent centre d\u2019examen"),
    ("3.2.2.3 Espace agent centre d'examen", "3.3.2.3 Espace agent centre d'examen"),
    ("3.2.2.2 Espace administrateur OBC / DECC", "3.3.2.2 Espace administrateur OBC / DECC"),
    ("3.2.2.1 Espace élève", "3.3.2.1 Espace élève"),
    ("3.2.5 Bugs identifiés et corrections apportées", "3.3.5 Bugs identifiés et corrections apportées"),
    ("3.2.4 Couverture des tests", "3.3.4 Couverture des tests"),
    ("3.2.3 Résultats des tests", "3.3.3 Résultats des tests"),
    ("3.2.2 Présentation de la solution", "3.3.2 Présentation de la solution"),
    ("3.2.1 Résultats techniques", "3.3.1 Résultats techniques"),
    ("3.2 PRÉSENTATION DES RÉSULTATS OBTENUS", "3.3 PRÉSENTATION DES RÉSULTATS OBTENUS"),
    ("3.3.3 Comparaison avec des solutions existantes", "3.4.3 Comparaison avec des solutions existantes"),
    ("3.3.2 Limites et difficultés rencontrées", "3.4.2 Limites et difficultés rencontrées"),
    ("3.3.1 Points forts du projet", "3.4.1 Points forts du projet"),
    ("3.3 ANALYSE CRITIQUE ET DISCUSSION", "3.4 ANALYSE CRITIQUE ET DISCUSSION"),
    ("3.4 PERSPECTIVES D\u2019AMÉLIORATION", "3.5 PERSPECTIVES D\u2019AMÉLIORATION"),
    ("3.4 PERSPECTIVES D'AMÉLIORATION", "3.5 PERSPECTIVES D'AMÉLIORATION"),
    ("3.5 CONCLUSION", "3.6 CONCLUSION"),
]

INTRO_31 = (
    "Ce chapitre présente l'implémentation concrète de D-SCOLCAM : justification des choix "
    "technologiques retenus, résultats obtenus (interfaces et fonctionnalités livrées), "
    "analyse critique et perspectives d'évolution. L'environnement de développement, les tests "
    "et le déploiement ont été traités au chapitre 2."
)

CH3_TITLE = "CHAPITRE 3 : IMPLÉMENTATION ET PRÉSENTATION DES RÉSULTATS"


def clone_pPr(template: ET.Element | None) -> ET.Element | None:
    if template is None:
        return None
    pPr = template.find(f"{{{W}}}pPr")
    return copy.deepcopy(pPr) if pPr is not None else None


def apply_pPr(block: ET.Element, template_pPr: ET.Element | None) -> None:
    if template_pPr is None or block.find(f".//{{{W}}}drawing") is not None:
        return
    if block.find(f".//{{{W}}}tbl") is not None:
        return
    pPr = block.find(f"{{{W}}}pPr")
    if pPr is not None:
        block.remove(pPr)
    block.insert(0, copy.deepcopy(template_pPr))


def renumber_in_ch3(p: ET.Element) -> None:
    text = para_text(p).strip()
    for old, new in REN_MAP:
        if text == old:
            set_para_text(p, new)
            return


def build_section_32() -> list[ET.Element]:
    blocks: list[ET.Element] = []

    blocks.append(para("3.2 CHOIX TECHNOLOGIQUES ET JUSTIFICATION", style="Titre3"))
    blocks.append(para(
        "Cette section justifie les technologies retenues pour construire D-SCOLCAM. "
        "Le cahier d'implémentation du projet détaille l'ensemble des choix ; nous en "
        "présentons ici une synthèse orientée soutenance.",
        jc="both",
    ))

    blocks.append(para("3.2.1 Principes directeurs", style="Titre4"))
    blocks.append(fiche_table([
        ("Un seul langage", "TypeScript côté interface et logique métier (Next.js full-stack)"),
        ("MVP réalisable", "Stack documentée, hébergement accessible (Vercel + Supabase)"),
        ("Sécurité", "Auth externalisée, ORM typé, validation systématique des entrées"),
        ("Contexte Cameroun", "Interface responsive, consultation QR, notifications e-mail"),
    ]))

    blocks.append(para("3.2.2 Stack globale", style="Titre4"))
    blocks.append(para(
        "Le tableau suivant récapitule la stack retenue (alignée sur le §2.3.2 du chapitre 2).",
        jc="both",
    ))
    blocks.append(fiche_table([
        ("Frontend", "Next.js 15, React 19, Tailwind CSS, Radix UI"),
        ("Backend", "Server Actions, Route Handlers (API REST)"),
        ("Données", "PostgreSQL (Supabase), Prisma ORM"),
        ("Authentification", "Supabase Auth, cookies SSR (@supabase/ssr)"),
        ("Validation", "Zod, react-hook-form"),
        ("Emails", "Nodemailer (SMTP)"),
        ("Hébergement", "Vercel (application), Supabase Cloud (BDD, auth, storage)"),
    ]))

    blocks.append(para("3.2.3 Justifications détaillées", style="Titre4"))
    blocks.append(para(
        "Pour chaque brique, nous indiquons le motif de choix, une alternative envisagée "
        "et la raison de son écart.",
        jc="both",
    ))

    tech_blocks = [
        ("Next.js 15 (App Router)", (
            "Framework full-stack regroupant pages, API et Server Actions dans un projet "
            "TypeScript unique ; Server Components pour le chargement des tableaux de bord ; "
            "déploiement natif sur Vercel.",
            "Laravel, Django+React séparé, Create React App seul : plus de projets à maintenir "
            "ou pas de SSR natif ; délai MVP plus long.",
        )),
        ("React 19 + TypeScript", (
            "Composants réutilisables pour les trois espaces (élève, admin, agent) ; typage "
            "statique aligné sur le schéma Prisma.",
            "JavaScript pur : moins sûr sur 25+ écrans et règles métier OBC/DECC.",
        )),
        ("PostgreSQL + Prisma", (
            "Modèle relationnel naturel (élève, documents, RDV, paiements) ; migrations "
            "versionnées ; client typé ; hébergement Supabase.",
            "MongoDB : jointures fréquentes et contraintes métier mal adaptées ; "
            "SQL brut : plus verbeux et error-prone.",
        )),
        ("Supabase Auth", (
            "Mots de passe hashés et sessions JWT hors base métier ; cookies HttpOnly via "
            "middleware ; lien avec User.authUserId en Prisma.",
            "NextAuth maison, JWT+bcrypt : temps de dev et risque sécurité ; "
            "Clerk/Auth0 : coût et dépendance tierce.",
        )),
        ("Server Actions et API REST", (
            "Server Actions pour formulaires internes (dashboard, admin) ; Route Handlers "
            "pour consultation publique, RDV agent et paiement simulé.",
            "API REST seule : boilerplate client inutile pour les écrans internes ; "
            "GraphQL : surdimensionné pour le MVP.",
        )),
        ("Zod + react-hook-form", (
            "Schémas partagés serveur/client ; validation des imports CSV, duplicata et RDV.",
            "Validation manuelle : incohérences et oublis sur les formulaires longs.",
        )),
        ("Tailwind CSS + Radix UI", (
            "Interface responsive (mobile first) ; composants accessibles (modales, selects) "
            "sans surcouche lourde.",
            "Bootstrap seul : personnalisation plus lente pour un design cohérent.",
        )),
        ("Nodemailer (SMTP)", (
            "Notifications transactionnelles (activation, disponibilité, RDV) ; "
            "journalisation via mail_logs.",
            "SendGrid/Mailgun : dépendance payante non indispensable en MVP académique.",
        )),
        ("Vercel + Supabase Cloud", (
            "Déploiement continu depuis GitHub ; Postgres managé, auth et storage sur une "
            "même plateforme.",
            "Serveur VPS dédié : maintenance et coût plus élevés pour un stage.",
        )),
    ]

    for name, (why, alt) in tech_blocks:
        blocks.append(para(name, style="Titre5"))
        blocks.append(para(f"Retenu : {why}", jc="both"))
        blocks.append(para(f"Alternative écartée : {alt}", jc="both"))

    blocks.append(para(
        "En synthèse, la stack retenue privilégie un langage unique, la sécurité par défaut "
        "et un déploiement compatible avec les contraintes de temps du projet.",
        jc="both",
    ))
    return blocks


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
    children = list(body)

    ch3_start = ch3_end = idx_31 = idx_old_32 = None
    pPr_template = None
    in_ch3 = False

    for i, child in enumerate(children):
        if child.tag != f"{{{W}}}p":
            continue
        text = para_text(child).strip()
        if "CHAPITRE 3" in text and "RESULTATS" in text.upper():
            in_ch3 = True
            ch3_start = i
            set_para_text(child, CH3_TITLE)
        if in_ch3 and text == "3.1 INTRODUCTION":
            idx_31 = i
            pPr_template = clone_pPr(child)
        if in_ch3 and text == "3.2 PRÉSENTATION DES RÉSULTATS OBTENUS":
            idx_old_32 = i
        if in_ch3 and text.startswith("CONCLUSION GENERALE"):
            ch3_end = i
            break

    if idx_31 is None or idx_old_32 is None:
        raise SystemExit("Structure Ch.3 introuvable (3.1 ou 3.2).")

    # Intro §3.1
    intro_body = children[idx_31 + 1]
    if intro_body.tag == f"{{{W}}}p":
        set_para_text(intro_body, INTRO_31)

    # Renuméroter §3.2+ → §3.3+ (d'abord, avant insertion)
    for i in range(idx_old_32, ch3_end or len(children)):
        child = children[i]
        if child.tag == f"{{{W}}}p":
            renumber_in_ch3(child)

    # DR-DOCSCOL → D-SCOLCAM dans le Ch.3
    for i in range(ch3_start or 0, ch3_end or len(children)):
        child = children[i]
        if child.tag != f"{{{W}}}p":
            continue
        text = para_text(child)
        if "DR-DOCSCOL" in text or "DR-DOCS" in text:
            set_para_text(child, text.replace("DR-DOCSCOL", "D-SCOLCAM").replace("DR-DOCS", "D-SCOLCAM"))

    # Insérer nouveau §3.2 avant l'ancien (devenu §3.3)
    new_blocks = build_section_32()
    insert_at = idx_old_32
    for offset, block in enumerate(new_blocks):
        apply_pPr(block, pPr_template)
        body.insert(insert_at + offset, block)

    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)
    if "word/styles.xml" in files:
        files["word/styles.xml"] = patch_tamela_styles(files["word/styles.xml"])

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — Ch.3 : §3.2 ajouté ({len(new_blocks)} blocs), sections renumérotées")
    print(f"Fichier : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

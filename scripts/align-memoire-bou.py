#!/usr/bin/env python3
"""Aligne MEMOIRE_bou.docx sur le code actuel DR-DOCSCOL + mise en forme UPAC.

Produit : MEMOIRE_bou_aligne.docx (original conservé)
"""
from __future__ import annotations

import re
import struct
import zipfile
from pathlib import Path
from xml.etree import ElementTree as ET

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "MEMOIRE_bou.docx"
OUT = ROOT / "MEMOIRE_bou_aligne.docx"
TAMELA = ROOT / "originalTAMELA.docx"

import sys

sys.path.insert(0, str(ROOT / "scripts"))
from memoire_tamela_blocks import Counters, build_uml_blocks  # noqa: E402
IMG = ROOT / "docs" / "diagrammes-images"
SHOT = ROOT / "docs" / "memoire-screenshots"
PUB = ROOT / "public" / "images"

UI_FALLBACKS = {
    "fig-10-dashboard-documents.png": PUB / "photos" / "documents.jpg",
    "fig-11-document-detail.png": PUB / "actions" / "retrait.png",
    "fig-12-duplicata-form.png": PUB / "photos" / "duplicata.png",
    "fig-13-rdv.png": PUB / "photos" / "rendez-vous.jpg",
    "fig-14-notifications.png": PUB / "photos" / "notifications.png",
}


def resolve_ui_image(name: str) -> Path:
    shot = SHOT / name
    if shot.exists():
        return shot
    fallback = UI_FALLBACKS.get(name)
    if fallback and fallback.exists():
        return fallback
    return shot

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
PIC = "http://schemas.openxmlformats.org/drawingml/2006/picture"

# Captures d'écran ch. 3 — numérotation après UML (figures 2–20) ; UI = 21–33
FIGURE_MAP = {
    "[ Insérer ici : Architecture MVC de l'application DR-DOCSCOL ]": (
        IMG / "architecture-generale-solution.png",
        "Figure 1 : Architecture générale de l'application DR-DOCSCOL",
    ),
    "[ Insérer ici : Page d'activation du compte élève ]": (
        resolve_ui_image("fig-08-activation.png"),
        "Figure 21 : Activation du compte élève",
    ),
    "[ Insérer ici : Page de connexion ]": (
        resolve_ui_image("fig-09-login.png"),
        "Figure 22 : Portail de connexion élève",
    ),
    "[ Insérer ici : Tableau de bord élève — liste des documents ]": (
        resolve_ui_image("fig-10-dashboard-documents.png"),
        "Figure 23 : Tableau de bord élève — documents disponibles",
    ),
    "[ Insérer ici : Page de détail d'un document — instructions de retrait ]": (
        resolve_ui_image("fig-11-document-detail.png"),
        "Figure 24 : Détail document inline — instructions de retrait",
    ),
    "[ Insérer ici : Formulaire de demande de duplicata ]": (
        resolve_ui_image("fig-12-duplicata-form.png"),
        "Figure 25 : Demande de duplicata",
    ),
    "[ Insérer ici : Page de prise de rendez-vous ]": (
        resolve_ui_image("fig-13-rdv.png"),
        "Figure 26 : Prise de rendez-vous de retrait",
    ),
    "[ Insérer ici : Page des notifications et reçus ]": (
        resolve_ui_image("fig-14-notifications.png"),
        "Figure 27 : Notifications et reçus",
    ),
    "[ Insérer ici : Tableau de bord administratif ]": (
        resolve_ui_image("fig-15-admin-dashboard.png"),
        "Figure 28 : Tableau de bord administrateur OBC",
    ),
    "[ Insérer ici : Interface de gestion des documents — back-office admin ]": (
        resolve_ui_image("fig-16-admin-documents.png"),
        "Figure 29 : Gestion des documents scolaires (back-office)",
    ),
    "[ Insérer ici : Interface d'import CSV ]": (
        resolve_ui_image("fig-17-import-csv.png"),
        "Figure 30 : Import et gestion des données (CSV)",
    ),
    "[ Insérer ici : Interface de traitement des demandes de duplicata ]": (
        resolve_ui_image("fig-18-duplicata-admin.png"),
        "Figure 31 : Traitement des demandes de duplicata",
    ),
    "[ Insérer ici : Interface agent — liste des rendez-vous transmis ]": (
        resolve_ui_image("fig-19-agent-rdv-list.png"),
        "Figure 32 : Portail agent centre — rendez-vous transmis",
    ),
    "[ Insérer ici : Interface agent — confirmation du retrait effectué ]": (
        resolve_ui_image("fig-20-agent-confirm.png"),
        "Figure 33 : Confirmation du retrait par l'agent centre",
    ),
}

REPLACEMENTS = [
    ("DEDICACEDEDICACE", "DEDICACE"),
    ("REMERCIEMENTSREMERCIEMENTS", "REMERCIEMENTS"),
    ("GLOSSAIRESGLOSSAIRES", "GLOSSAIRE"),
    ("RESUMERESUME", "RÉSUMÉ"),
    ("LISTES DES FIGURES                                      LISTES DES FIGURES", "LISTE DES FIGURES"),
    ("SOMMAIRESOMMAIRE", "SOMMAIRE"),
    ("LISTE DES TABLEAUXLISTE DES TABLEAUX", "LISTE DES TABLEAUX"),
    ("CONCLUSION GENERALECONCLUSION GENERALE", "CONCLUSION GÉNÉRALE"),
    ("CHAPITRE 1 : CONTEXTE ET PROBLEMATIQUECHAPITRE 1 : CONTEXTE ET PROBLEMATIQUE", "CHAPITRE 1 : CONTEXTE ET PROBLÉMATIQUE"),
    ("CHAPITRE 2 : METHODOLOGIECHAPITRE 2 : METHODOLOGIE", "CHAPITRE 2 : MÉTHODOLOGIE"),
    ("[ Ajouter ici les noms de tes amis / camarades à remercier ]", ""),
    ("[ Ajouter ici les autres personnes spécifiques à remercier ]", ""),
    (
        "Mots-clés : Application web, Documents scolaires, OBC, DECC, Gestion des retraits, Rendez-vous, Notifications.",
        "Mots-clés : Application web, Documents scolaires, OBC, DECC, DR-DOCSCOL, Consultation publique, QR code, Rendez-vous, Duplicata, Notifications.",
    ),
    (
        "Keywords: Web application, Academic documents, OBC, DECC, Document retrieval management, Appointements, Notifications.",
        "Keywords: Web application, Academic documents, OBC, DECC, DR-DOCSCOL, Public consultation, QR code, Appointments, Duplicate requests, Notifications.",
    ),
    (
        "Figure 1 : Architecture MVC de l'application DR-DOCSCOL..",
        "Figure 1 : Architecture générale de l'application DR-DOCSCOL..",
    ),
    (
        "Figure 2 : Diagramme de cas d'utilisation — DR-DOCSCOL..",
        "Figure 2a : Diagramme de cas d'utilisation — Élève..",
    ),
    (
        "Figure 1 : Architecture MVC de l'application DR-DOCSCOL",
        "Figure 1 : Architecture générale de l'application DR-DOCSCOL",
    ),
    (
        "Figure 2 : Diagramme de cas d'utilisation — DR-DOCSCOL",
        "Figure 2a : Diagramme de cas d'utilisation — Élève",
    ),
    (
        "Le diagramme de classes ci-dessous modélise la structure statique du système. Il représente les principales entités métier (Utilisateur, DocumentScolaire, Duplicata, Paiement, Notification, RendezVous, Reçu) ainsi que leurs associations, avec les multiplicités UML aux deux extrémités.",
        "Le diagramme de classes ci-dessous modélise la structure statique du système (vue simplifiée pour la soutenance). Il représente les héritages Utilisateur → Élève, Administrateur, AgentCentreExamen et DocumentScolaire → OriginalDiplome, ReleveNote, la classe Duplicata, ainsi que les associations métier essentielles avec leurs multiplicités UML (0..*, 0..1, 1, *). Le modèle exhaustif (20 tables Prisma) est documenté dans le cahier de conception du projet.",
    ),
    (
        "Ce diagramme décrit la manière dont un élève connecté consulte ses documents scolaires. L'élève ouvre",
        "Ce diagramme décrit la consultation publique par matricule ou QR code (sans connexion), implémentée sur la landing page et la route `/consultation`. L'élève ou un visiteur ouvre",
    ),
    (
        "– Vérification par QR code : permettre aux employeurs et institutions de vérifier l'authenticité d'un document scolaire via un scan QR.",
        "– Vérification par QR code pour employeurs / tiers : authentification d'un document par un non-élève (distinct du QR de consultation publique déjà implémenté sur la landing).",
    ),
    (
        "– Stockage des justificatifs : mise en place d'un système de stockage de fichiers (Supabase Storage ou équivalent) pour les pièces jointes des demandes de duplicata.",
        "– Stockage des justificatifs duplicata : finaliser le bucket Supabase `duplicata-documents` et le parcours de dépôt des pièces (`PieceDuplicata`) côté élève et admin.",
    ),
    (
        "Demande de duplicata et paiement : formulaire de demande avec simulation de paiement Mobile Money, g",
        "Demande de duplicata et paiement : formulaire avec pièces justificatives, validation admin (`PieceDuplicata`), simulation de paiement Mobile Money, g",
    ),
    (
        "Authentification sécurisée : système de connexion basé sur Supabase Auth avec gestion des rôles (élève, administrateur OBC/DECC, agent centre d'examen) et activation des comptes par import CSV.",
        "Authentification sécurisée : système de connexion basé sur Supabase Auth avec gestion des rôles (élève, administrateur OBC/DECC, agent centre d'examen). L'activation élève se fait par auto-inscription (`/auth/register`) après pré-enregistrement du matricule ; l'import CSV sert à l'administration (élèves, examens, disponibilisation).",
    ),
    (
        "La page de connexion permet à tous les types d'utilisateurs (élève, administrateur, agent) de s'authentifier sur la plateforme à l'aide de leur email et mot de passe. Selon le rôle détecté, l'utilisateur est redirigé vers son espace dédié.",
        "La connexion élève s'effectue via `/auth/login` avec matricule, email et mot de passe. Les administrateurs OBC/DECC et les agents centre disposent de portails dédiés (`/auth/login/obc`, `/auth/login/decc`, `/auth/login/centre-examen`). Selon le rôle détecté, l'utilisateur est redirigé vers son espace (`/dashboard`, `/admin` ou `/centre-examen`).",
    ),
    (
        "En cliquant sur un document, l'élève accède à une page de détail présentant les instructions complètes de retrait : adresse du centre ou de l'antenne, pièces à présenter, conditions particulières et rendez-vous actif éventuel.",
        "En développant un document sur la page « Mes documents » (`/dashboard/documents`), l'élève consulte inline les instructions de retrait : adresse du centre ou de l'antenne, pièces à présenter, conditions particulières et rendez-vous actif éventuel (pas de page de détail séparée).",
    ),
    (
        "Certaines fonctionnalités initialement prévues n'ont pas pu être intégrées dans cette version, notamment le téléchargement numérique sécurisé des documents scolaires, l'intégration complète d'une passerelle Mobile Money certifiée, la mise en place de notifications push natives et le stockage des justificatifs de duplicata.",
        "Certaines fonctionnalités initialement prévues n'ont pas pu être intégrées dans cette version, notamment le téléchargement numérique sécurisé des documents scolaires, l'intégration complète d'une passerelle Mobile Money certifiée et la mise en place de notifications push natives. Le stockage des justificatifs duplicata est partiellement implémenté (`PieceDuplicata`, bucket Supabase) et reste à durcir en production.",
    ),
    (
        "CHAPITRE 3 : IMPLÉMENTATION ET PRÉSENTATION DES RÉSULTATS 1​2",
        "CHAPITRE 3 : IMPLÉMENTATION ET PRÉSENTATION DES RÉSULTATS",
    ),
    (
        "3.2.2 Présentation des interfaces réalisées27",
        "3.2.2 Présentation de la solution",
    ),
    (
        "3.2.6 Feedback et retours35",
        "",
    ),
    (
        "d) Page de détail d'un document",
        "d) Détail inline d'un document (panneau développable)",
    ),
]

INSERT_AFTER = {
    "3.2.1 Résultats techniques": [
        "Consultation publique par matricule et QR code : section « Consultation rapide » sur la landing (`components/landing/consultation-access.tsx`) et page `/consultation`, conformes au cahier des charges (F-37).",
        "Espace agent centre d'examen : portail dédié pour consulter les rendez-vous transmis et confirmer le retrait physique (`app/centre-examen/`, API `confirm-withdrawal`).",
        "Journal d'audit : traçabilité des actions sensibles via la table `AuditLog` et l'interface admin associée.",
    ],
}

FIGURE_LIST_ENTRIES = [
    "Figure 1 : Architecture générale de l'application DR-DOCSCOL..",
    "Figure 2 : Diagramme général des cas d'utilisation DR-DOCSCOL..",
    "Figure 3 : Diagramme de cas d'utilisation — package Élève..",
    "Figure 4 : Diagramme d'activité de l'authentification élève..",
    "Figure 5 : Diagramme de séquence du cas « s'authentifier » (élève)..",
    "Figure 6 : Diagramme d'activité de la consultation publique..",
    "Figure 7 : Diagramme de séquence du cas « consulter via QR code »..",
    "Figure 8 : Diagramme d'activité — demande de duplicata et paiement..",
    "Figure 9 : Diagramme de séquence du cas « demande de duplicata et paiement »..",
    "Figure 10 : Diagramme d'activité — prise de rendez-vous de retrait..",
    "Figure 11 : Diagramme de séquence du cas « prendre rendez-vous »..",
    "Figure 12 : Diagramme de cas d'utilisation — Administrateur OBC/DECC..",
    "Figure 13 : Diagramme d'activité — import de disponibilisation..",
    "Figure 14 : Diagramme de séquence du cas « import disponibilisation »..",
    "Figure 15 : Diagramme d'activité — validation d'une demande de duplicata..",
    "Figure 16 : Diagramme de séquence du cas « valider demande duplicata »..",
    "Figure 17 : Diagramme de cas d'utilisation — Agent centre d'examen..",
    "Figure 18 : Diagramme d'activité — confirmation du retrait par l'agent..",
    "Figure 19 : Diagramme de séquence du cas « confirmer retrait effectué »..",
    "Figure 20 : Diagramme des classes du système DR-DOCSCOL (vue simplifiée)..",
    "Figure 21 : Activation du compte élève..",
    "Figure 22 : Portail de connexion élève..",
    "Figure 23 : Tableau de bord élève — documents disponibles..",
    "Figure 24 : Détail document inline — instructions de retrait..",
    "Figure 25 : Demande de duplicata..",
    "Figure 26 : Prise de rendez-vous de retrait..",
    "Figure 27 : Notifications et reçus..",
    "Figure 28 : Tableau de bord administrateur OBC..",
    "Figure 29 : Gestion des documents scolaires (back-office)..",
    "Figure 30 : Import et gestion des données (CSV)..",
    "Figure 31 : Traitement des demandes de duplicata..",
    "Figure 32 : Portail agent centre — rendez-vous transmis..",
    "Figure 33 : Confirmation du retrait par l'agent centre..",
]

SOMMAIRE_SHORT_ENTRIES = [
    "DÉDICACE…………………………………………………………………....",
    "GLOSSAIRE…………………………………………………………………..",
    "RÉSUMÉ……………………………………………………………………….…",
    "ABSTRACT………………………………………………………………………",
    "LISTE DES FIGURES………………………………………………………...",
    "LISTE DES TABLEAUX……………………………………………………...",
    "SOMMAIRE……………………………………………………………………",
    "INTRODUCTION GÉNÉRALE……………………………………………....",
    "CHAPITRE 1 : CONTEXTE ET PROBLÉMATIQUE………………………...",
    "CHAPITRE 2 : MÉTHODOLOGIE…………………………………………….…",
    "CHAPITRE 3 : IMPLÉMENTATION ET PRÉSENTATION DES RÉSULTATS…………",
    "CONCLUSION GÉNÉRALE…………………………………………………...",
    "RÉFÉRENCES BIBLIOGRAPHIQUES………………………………………..",
]

CAPTION_UPDATES = {
    "Figure 1 : Architecture MVC de l'application DR-DOCSCOL": "Figure 1 : Architecture générale de l'application DR-DOCSCOL",
    "Figure 8 : Page d'activation du compte élève": "Figure 21 : Activation du compte élève",
    "Figure 9 : Page de connexion": "Figure 22 : Portail de connexion élève",
    "Figure 10 : Tableau de bord élève — liste des documents": "Figure 23 : Tableau de bord élève — documents disponibles",
    "Figure 11 : Page de détail d'un document — instructions de retrait": "Figure 24 : Détail document inline — instructions de retrait",
    "Figure 12 : Formulaire de demande de duplicata": "Figure 25 : Demande de duplicata",
    "Figure 13 : Page de prise de rendez-vous": "Figure 26 : Prise de rendez-vous de retrait",
    "Figure 14 : Page des notifications et reçus": "Figure 27 : Notifications et reçus",
    "Figure 15 : Tableau de bord administratif": "Figure 28 : Tableau de bord administrateur OBC",
    "Figure 16 : Interface de gestion des documents — back-office admin": "Figure 29 : Gestion des documents scolaires (back-office)",
    "Figure 17 : Interface d'import CSV": "Figure 30 : Import et gestion des données (CSV)",
    "Figure 18 : Interface de traitement des demandes de duplicata": "Figure 31 : Traitement des demandes de duplicata",
    "Figure 19 : Interface agent — liste des rendez-vous transmis": "Figure 32 : Portail agent centre — rendez-vous transmis",
    "Figure 20 : Interface agent — confirmation du retrait effectué": "Figure 33 : Confirmation du retrait par l'agent centre",
}


def register_docx_namespaces():
    ET.register_namespace("w", W)
    ET.register_namespace("r", R)
    ET.register_namespace("a", A)
    ET.register_namespace("wp", WP)
    ET.register_namespace("pic", PIC)
    ET.register_namespace("mc", "http://schemas.openxmlformats.org/markup-compatibility/2006")
    ET.register_namespace("w14", "http://schemas.microsoft.com/office/word/2010/wordml")
    ET.register_namespace("w15", "http://schemas.microsoft.com/office/word/2012/wordml")


def png_dimensions(path: Path):
    with path.open("rb") as f:
        header = f.read(24)
    if len(header) < 24:
        return 1200, 800
    return struct.unpack(">II", header[16:24])


def scale_emu(w_px, h_px, max_cx=5600000, max_cy=7600000):
    px_to_emu = 914400 / 96
    cx = int(w_px * px_to_emu)
    cy = int(h_px * px_to_emu)
    ratio = min(max_cx / cx, max_cy / cy, 1.0)
    return int(cx * ratio), int(cy * ratio)


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def normalize_text(s: str) -> str:
    return s.replace("\u2019", "'").replace("\u2018", "'").replace("\u201c", '"').replace("\u201d", '"')


def para_text(p) -> str:
    return "".join(t.text or "" for t in p.iter(f"{{{W}}}t"))


def set_para_text(p, text: str):
    ts = list(p.iter(f"{{{W}}}t"))
    if not ts:
        r = ET.SubElement(p, f"{{{W}}}r")
        t = ET.SubElement(r, f"{{{W}}}t")
        t.text = text
        return
    ts[0].text = text
    for t in ts[1:]:
        t.text = ""


def ensure_ppr(p):
    ppr = p.find(f"{{{W}}}pPr")
    if ppr is None:
        ppr = ET.Element(f"{{{W}}}pPr")
        p.insert(0, ppr)
    return ppr


def apply_body_style(p, *, center=False, bold=False, after=120):
    ppr = ensure_ppr(p)
    spacing = ppr.find(f"{{{W}}}spacing")
    if spacing is None:
        spacing = ET.SubElement(ppr, f"{{{W}}}spacing")
    spacing.set(f"{{{W}}}line", "360")
    spacing.set(f"{{{W}}}lineRule", "auto")
    spacing.set(f"{{{W}}}after", str(after))
    if center:
        jc = ppr.find(f"{{{W}}}jc")
        if jc is None:
            jc = ET.SubElement(ppr, f"{{{W}}}jc")
        jc.set(f"{{{W}}}val", "center")
    for r in p.findall(f"{{{W}}}r"):
        rpr = r.find(f"{{{W}}}rPr")
        if rpr is None:
            rpr = ET.SubElement(r, f"{{{W}}}rPr")
            r.insert(0, rpr)
        fonts = rpr.find(f"{{{W}}}rFonts")
        if fonts is None:
            fonts = ET.SubElement(rpr, f"{{{W}}}rFonts")
        fonts.set(f"{{{W}}}ascii", "Times New Roman")
        fonts.set(f"{{{W}}}hAnsi", "Times New Roman")
        fonts.set(f"{{{W}}}cs", "Times New Roman")
        sz = rpr.find(f"{{{W}}}sz")
        if sz is None:
            sz = ET.SubElement(rpr, f"{{{W}}}sz")
        sz.set(f"{{{W}}}val", "24")
        szcs = rpr.find(f"{{{W}}}szCs")
        if szcs is None:
            szcs = ET.SubElement(rpr, f"{{{W}}}szCs")
        szcs.set(f"{{{W}}}val", "24")
        if bold:
            if rpr.find(f"{{{W}}}b") is None:
                ET.SubElement(rpr, f"{{{W}}}b")


def make_text_para(text: str, *, center=False, bold=False) -> ET.Element:
    p = ET.Element(f"{{{W}}}p")
    apply_body_style(p, center=center, bold=bold)
    r = ET.SubElement(p, f"{{{W}}}r")
    apply_body_style(p)
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
    t = ET.SubElement(r, f"{{{W}}}t")
    t.text = text
    return p


def replace_placeholder_with_figure(
    body,
    placeholder_p,
    injector: "ImageInjector",
    img_path: Path,
    caption: str,
):
    if not img_path.exists():
        set_para_text(placeholder_p, f"[Image manquante : {img_path.name}]")
        return None

    cap_p = next_figure_caption_para(body, placeholder_p)
    idx = list(body).index(placeholder_p)
    w_px, h_px = png_dimensions(img_path)
    cx, cy = scale_emu(w_px, h_px)
    rid = injector.add(img_path)
    injector.docpr += 1
    img_p = ET.fromstring(make_image_para(rid, cx, cy, injector.docpr, caption))
    body.remove(placeholder_p)
    body.insert(idx, img_p)

    if cap_p is not None:
        set_para_text(cap_p, caption)
        apply_body_style(cap_p, center=True, after=80)
        return cap_p

    cap_p = make_text_para(caption, center=True)
    apply_body_style(cap_p, center=True, after=80)
    body.insert(idx + 1, cap_p)
    return cap_p


def update_figure_captions(body):
    for p in body.findall(f"{{{W}}}p"):
        text = para_text(p).strip().rstrip(".")
        if text not in CAPTION_UPDATES:
            continue
        set_para_text(p, CAPTION_UPDATES[text])
        apply_body_style(p, center=True, after=80)


def next_figure_caption_para(body, p):
    children = list(body)
    try:
        idx = children.index(p)
    except ValueError:
        return None

    to_remove = []
    cap_p = None
    for candidate in children[idx + 1 : idx + 8]:
        text = para_text(candidate).strip()
        if text.startswith("Figure "):
            cap_p = candidate
            break
        if not text and candidate.find(f".//{{{W}}}drawing") is None:
            to_remove.append(candidate)

    for empty_p in to_remove:
        body.remove(empty_p)

    return cap_p


def remove_duplicate_figure_captions(body):
    prev = ""
    for p in list(body.findall(f"{{{W}}}p")):
        text = para_text(p).strip()
        if not text.startswith("Figure "):
            prev = ""
            continue
        if text == prev:
            body.remove(p)
            continue
        prev = text


def remove_empty_paragraphs(body):
    for p in list(body.findall(f"{{{W}}}p")):
        if para_text(p).strip():
            continue
        if p.find(f".//{{{W}}}drawing") is not None:
            continue
        body.remove(p)


def remove_trailing_toc_block(body):
    paragraphs = body.findall(f"{{{W}}}p")
    start_idx = None
    for i, p in enumerate(paragraphs):
        text = para_text(p).strip()
        if text == "DÉDICACEi":
            start_idx = i
            break
        if text == "TABLE DES MATIÈRES" and i + 1 < len(paragraphs):
            if para_text(paragraphs[i + 1]).strip() == "DÉDICACEi":
                start_idx = i
                break

    if start_idx is None:
        return

    for p in paragraphs[start_idx:]:
        body.remove(p)


def sync_figure_list(body):
    paragraphs = body.findall(f"{{{W}}}p")
    start = end = None
    for i, p in enumerate(paragraphs):
        text = para_text(p).strip()
        if text in {"LISTE DES FIGURES", "LISTES DES FIGURES"} and start is None:
            start = i + 1
            continue
        if start is not None and text.startswith("LISTE DES TABLEAUX"):
            end = i
            break

    if start is None or end is None:
        return

    for p in paragraphs[start:end]:
        body.remove(p)

    insert_at = start
    for entry in FIGURE_LIST_ENTRIES:
        new_p = make_text_para(entry)
        body.insert(insert_at, new_p)
        insert_at += 1


def sync_short_sommaire(body):
    paragraphs = body.findall(f"{{{W}}}p")
    sommaire_heading_idx = None
    for i, p in enumerate(paragraphs):
        if para_text(p).strip() == "SOMMAIRE":
            sommaire_heading_idx = i
            break
    if sommaire_heading_idx is None:
        return

    start = end = None
    for i in range(sommaire_heading_idx + 1, len(paragraphs)):
        text = para_text(paragraphs[i]).strip()
        if start is None and text.startswith("DÉDICACE") and ("…" in text or "..." in text):
            start = i
            continue
        if start is None:
            continue
        if text.startswith("CHAPITRE 1 :") and "…" not in text and "..." not in text:
            end = i
            break
        if text.startswith("TABLE DES MATIÈRES"):
            end = i
            break
        if "CHAPITRE 1 : CONTEXTE ET PROBLEMATIQUECHAPITRE" in text:
            end = i
            break

    if start is None:
        return
    if end is None:
        end = min(start + len(SOMMAIRE_SHORT_ENTRIES), len(paragraphs))

    for p in paragraphs[start:end]:
        body.remove(p)

    insert_at = start
    for entry in SOMMAIRE_SHORT_ENTRIES:
        body.insert(insert_at, make_text_para(entry))
        insert_at += 1


def insert_figure_block(body, after_p, injector: ImageInjector, img_path: Path, caption: str):
    w_px, h_px = png_dimensions(img_path)
    cx, cy = scale_emu(w_px, h_px)
    rid = injector.add(img_path)
    injector.docpr += 1
    img_p = ET.fromstring(make_image_para(rid, cx, cy, injector.docpr, caption))
    cap_p = make_text_para(caption, center=True)
    apply_body_style(cap_p, center=True, after=80)
    idx = list(body).index(after_p)
    body.insert(idx + 1, img_p)
    body.insert(idx + 2, cap_p)
    return cap_p


def make_image_para(rid: str, cx: int, cy: int, docpr_id: int, name: str) -> str:
    return f'''<w:p xmlns:w="{W}"><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="80" w:line="240" w:lineRule="auto"/></w:pPr><w:r><w:drawing>
<wp:inline distT="0" distB="0" distL="0" distR="0" xmlns:wp="{WP}">
<wp:extent cx="{cx}" cy="{cy}"/>
<wp:docPr id="{docpr_id}" name="{esc(name)}"/>
<wp:cNvGraphicFramePr><a:graphicFrameLocks noChangeAspect="1" xmlns:a="{A}"/></wp:cNvGraphicFramePr>
<a:graphic xmlns:a="{A}"><a:graphicData uri="http://schemas.openxmlformats.org/drawingml/2006/picture">
<pic:pic xmlns:pic="{PIC}"><pic:nvPicPr><pic:cNvPr id="0" name="{esc(name)}"/><pic:cNvPicPr/></pic:nvPicPr>
<pic:blipFill><a:blip r:embed="{rid}" xmlns:r="{R}"/><a:stretch><a:fillRect/></a:stretch></pic:blipFill>
<pic:spPr><a:xfrm><a:off x="0" y="0"/><a:ext cx="{cx}" cy="{cy}"/></a:xfrm>
<a:prstGeom prst="rect"><a:avLst/></a:prstGeom></pic:spPr></pic:pic></a:graphicData></a:graphic></wp:inline>
</w:drawing></w:r></w:p>'''


class ImageInjector:
    def __init__(self):
        self.items: list[Path] = []
        self.docpr = 1000

    def add(self, path: Path) -> str:
        for i, p in enumerate(self.items, start=1):
            if p == path:
                return f"rIdImg{i}"
        self.items.append(path)
        return f"rIdImg{len(self.items)}"

    def rels_xml(self) -> str:
        parts = [
            '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>',
            f'<Relationships xmlns="http://schemas.openxmlformats.org/package/2006/relationships">',
        ]
        for i, path in enumerate(self.items, start=1):
            ext = path.suffix.lower().lstrip(".")
            if ext == "jpg":
                ext = "jpeg"
            parts.append(
                f'<Relationship Id="rIdImg{i}" '
                'Type="http://schemas.openxmlformats.org/officeDocument/2006/relationships/image" '
                f'Target="media/align_image{i}.{ext}"/>'
            )
        parts.append("</Relationships>")
        return "".join(parts)


def patch_styles(styles_xml: bytes) -> bytes:
    text = styles_xml.decode("utf-8")
    if "Times New Roman" not in text:
        text = text.replace(
            "<w:docDefaults>",
            '<w:docDefaults><w:rPrDefault><w:rPr>'
            '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
            '<w:sz w:val="24"/><w:szCs w:val="24"/>'
            "</w:rPr></w:rPrDefault></w:docDefaults><w:docDefaults>",
            1,
        )
    text = re.sub(
        r"(<w:docDefaults>.*?<w:rPr>)(.*?)(</w:rPr>)",
        lambda m: m.group(1)
        + re.sub(r"<w:rFonts[^/]*/>", "", m.group(2))
        + '<w:rFonts w:ascii="Times New Roman" w:hAnsi="Times New Roman" w:cs="Times New Roman"/>'
        + re.sub(r"<w:sz[^/]*/>", "", m.group(2))
        + '<w:sz w:val="24"/><w:szCs w:val="24"/>'
        + m.group(3),
        text,
        count=1,
        flags=re.S,
    )
    return text.encode("utf-8")


def write_docx(out_path: Path, files: dict[str, bytes]):
    with zipfile.ZipFile(out_path, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)


def patch_tamela_styles(styles_xml: bytes) -> bytes:
    """Fusionne les styles Tamela (Titre3–6, Lgende) pour titres et légendes."""
    text = patch_styles(styles_xml).decode("utf-8")
    if not TAMELA.exists() or 'w:styleId="Titre5"' in text:
        return text.encode("utf-8")
    tam = zipfile.ZipFile(TAMELA).read("word/styles.xml").decode("utf-8")
    for sid in ("Titre3", "Titre4", "Titre5", "Titre6", "Lgende", "Titre3Car", "Titre4Car", "Titre5Car", "Titre6Car"):
        m = re.search(rf'<w:style[^>]*w:styleId="{sid}"[^>]*>.*?</w:style>', tam, re.S)
        if m and f'w:styleId="{sid}"' not in text:
            text = text.replace("</w:styles>", m.group(0) + "</w:styles>")
    return text.encode("utf-8")


def rebuild_uml_section(body, injector: "ImageInjector") -> None:
    """Remplace §2.4.3 par la syntaxe Tamela : UC général → packages → fiches → classes."""
    start_p = end_p = None
    for p in body.findall(f"{{{W}}}p"):
        t = para_text(p).strip()
        if t.startswith("2.4.3 Modélisation UML"):
            start_p = p
        elif start_p is not None and t.startswith("2.5 DÉVELOPPEMENT"):
            end_p = p
            break
    if start_p is None or end_p is None:
        print("   AVERTISSEMENT : §2.4.3 introuvable — UML Tamela non injecté")
        return

    children = list(body)
    si = children.index(start_p)
    ei = children.index(end_p)
    for el in children[si + 1 : ei]:
        body.remove(el)

    counters = Counters(figure=2, table=5)
    blocks = build_uml_blocks(injector, counters)
    for i, block in enumerate(blocks):
        body.insert(si + 1 + i, block)
    print(f"   §2.4.3 reconstruit (syntaxe Tamela) — {len(blocks)} blocs, figures 2–{counters.figure - 1}")


def find_uc_eleve_caption(body):
    paragraphs = body.findall(f"{{{W}}}p")
    target = "Figure 2a : Diagramme de cas d'utilisation — Élève"
    for i, p in enumerate(paragraphs):
        if para_text(p).strip().rstrip(".") != target:
            continue
        if i == 0:
            continue
        prev = paragraphs[i - 1]
        if prev.find(f".//{{{W}}}drawing") is not None:
            return p
    return None


def main():
    if not SRC.exists():
        raise SystemExit(f"Fichier introuvable : {SRC}")

    register_docx_namespaces()
    injector = ImageInjector()
    extra_paras: list[tuple[ET.Element, ET.Element]] = []

    with zipfile.ZipFile(SRC, "r") as zin:
        files = {name: zin.read(name) for name in zin.namelist()}

    root = ET.fromstring(files["word/document.xml"])
    body = root.find(f"{{{W}}}body")
    assert body is not None

    seen = set()
    to_remove = []

    for p in list(body.findall(f"{{{W}}}p")):
        raw = normalize_text(para_text(p))
        if not raw.strip():
            continue

        key = raw.strip()
        if key in seen and key in {
            "DEDICACE", "REMERCIEMENTS", "GLOSSAIRE", "RÉSUMÉ", "RESUME",
            "LISTE DES FIGURES", "LISTE DES TABLEAUX", "SOMMAIRE",
            "CONCLUSION GÉNÉRALE", "CONCLUSION GENERALE",
            "CHAPITRE 1 : CONTEXTE ET PROBLÉMATIQUE",
            "CHAPITRE 2 : MÉTHODOLOGIE", "CHAPITRE 2 : METHODOLOGIE",
        }:
            to_remove.append(p)
            continue
        seen.add(key)

        new_text = raw
        for old, new in REPLACEMENTS:
            new_text = new_text.replace(normalize_text(old), new)
        if new_text != raw:
            if new_text == "":
                to_remove.append(p)
            else:
                set_para_text(p, new_text)

        apply_body_style(p, center="Figure" in para_text(p) and ":" in para_text(p))

        for anchor, lines in INSERT_AFTER.items():
            if normalize_text(para_text(p)).strip() == normalize_text(anchor):
                for line in lines:
                    extra_paras.append((p, make_text_para(line)))

        if raw.strip() in FIGURE_MAP:
            img_path, caption = FIGURE_MAP[raw.strip()]
            replace_placeholder_with_figure(body, p, injector, img_path, caption)

    for p in to_remove:
        body.remove(p)

    for after_p, new_p in extra_paras:
        idx = list(body).index(after_p)
        body.insert(idx + 1, new_p)

    rebuild_uml_section(body, injector)

    update_figure_captions(body)

    remove_empty_paragraphs(body)
    remove_duplicate_figure_captions(body)
    sync_figure_list(body)
    sync_short_sommaire(body)
    remove_trailing_toc_block(body)
    remove_empty_paragraphs(body)

    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

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
                f'<Override PartName="/word/media/align_image{i}.{media_ext}" ContentType="{ct_type}"/></Types>',
            )
            files[f"word/media/align_image{i}.{media_ext}"] = path.read_bytes()
        files["word/_rels/document.xml.rels"] = rels.encode("utf-8")
        files["[Content_Types].xml"] = ct.encode("utf-8")

    if "word/styles.xml" in files:
        files["word/styles.xml"] = patch_tamela_styles(files["word/styles.xml"])

    write_docx(OUT, files)

    print(f"OK -> {OUT}")
    print(f"   Images insérées : {len(injector.items)}")
    print("   Mise en forme : Times New Roman 12 pt, interligne 1,5 (styles par défaut)")


if __name__ == "__main__":
    main()

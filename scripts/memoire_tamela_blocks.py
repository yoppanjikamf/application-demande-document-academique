"""Blocs UML au format mémoire Tamela (originalTAMELA.docx).

Ordre : diagramme général → packages UC → par cas : Tableau + activité + séquence → classes.
"""
from __future__ import annotations

import struct
from pathlib import Path
from typing import Callable
from xml.etree import ElementTree as ET

W = "http://schemas.openxmlformats.org/wordprocessingml/2006/main"
R = "http://schemas.openxmlformats.org/officeDocument/2006/relationships"
A = "http://schemas.openxmlformats.org/drawingml/2006/main"
WP = "http://schemas.openxmlformats.org/drawingml/2006/wordprocessingDrawing"
PIC = "http://schemas.openxmlformats.org/drawingml/2006/picture"

IMG = Path(__file__).resolve().parents[1] / "docs" / "diagrammes-images"


def esc(s: str) -> str:
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def png_dimensions(path: Path) -> tuple[int, int]:
    with path.open("rb") as f:
        header = f.read(24)
    if len(header) < 24:
        return 1200, 800
    return struct.unpack(">II", header[16:24])


def scale_emu(w_px: int, h_px: int, max_cx: int = 5600000, max_cy: int = 7600000) -> tuple[int, int]:
    px_to_emu = 914400 / 96
    cx = int(w_px * px_to_emu)
    cy = int(h_px * px_to_emu)
    ratio = min(max_cx / cx, max_cy / cy, 1.0)
    return int(cx * ratio), int(cy * ratio)


def make_image_para(rid: str, cx: int, cy: int, docpr_id: int, name: str) -> str:
    return f'''<w:p xmlns:w="{W}"><w:pPr><w:jc w:val="center"/><w:spacing w:before="0" w:after="80" w:line="360" w:lineRule="auto"/></w:pPr><w:r><w:drawing>
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


def _ppr(style: str | None = None, jc: str | None = None, after: str = "120") -> ET.Element:
    ppr = ET.Element(f"{{{W}}}pPr")
    spacing = ET.SubElement(ppr, f"{{{W}}}spacing")
    spacing.set(f"{{{W}}}line", "360")
    spacing.set(f"{{{W}}}lineRule", "auto")
    spacing.set(f"{{{W}}}after", after)
    if jc:
        ET.SubElement(ppr, f"{{{W}}}jc", {f"{{{W}}}val": jc})
    if style:
        ET.SubElement(ppr, f"{{{W}}}pStyle", {f"{{{W}}}val": style})
    return ppr


def _run(text: str, *, bold: bool = False, italic: bool = False) -> ET.Element:
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
    if italic:
        ET.SubElement(rpr, f"{{{W}}}i")
    t = ET.SubElement(r, f"{{{W}}}t")
    t.text = text
    return r


def para(text: str, *, style: str | None = None, jc: str | None = None, bold: bool = False) -> ET.Element:
    p = ET.Element(f"{{{W}}}p")
    p.append(_ppr(style, jc))
    if bold and not style:
        p.append(_run(text, bold=True))
    else:
        p.append(_run(text))
    return p


def fiche_table(rows: list[tuple[str, str]]) -> ET.Element:
    tbl = ET.Element(f"{{{W}}}tbl")
    tbl_pr = ET.SubElement(tbl, f"{{{W}}}tblPr")
    ET.SubElement(tbl_pr, f"{{{W}}}tblW", {f"{{{W}}}w": "9067", f"{{{W}}}type": "dxa"})
    grid = ET.SubElement(tbl, f"{{{W}}}tblGrid")
    ET.SubElement(grid, f"{{{W}}}gridCol", {f"{{{W}}}w": "2800"})
    ET.SubElement(grid, f"{{{W}}}gridCol", {f"{{{W}}}w": "6267"})
    for label, value in rows:
        tr = ET.SubElement(tbl, f"{{{W}}}tr")
        for cell_text in (label, value):
            tc = ET.SubElement(tr, f"{{{W}}}tc")
            tc_pr = ET.SubElement(tc, f"{{{W}}}tcPr")
            ET.SubElement(tc_pr, f"{{{W}}}tcW", {f"{{{W}}}w": "2800" if cell_text == label else "6267", f"{{{W}}}type": "dxa"})
            cp = ET.SubElement(tc, f"{{{W}}}p")
            cp.append(_ppr())
            cp.append(_run(cell_text, bold=(cell_text == label)))
    return tbl


class Counters:
    def __init__(self, figure: int = 1, table: int = 1) -> None:
        self.figure = figure
        self.table = table

    def next_fig(self) -> int:
        n = self.figure
        self.figure += 1
        return n

    def next_tbl(self) -> int:
        n = self.table
        self.table += 1
        return n


def add_figure(
    blocks: list[ET.Element],
    injector,
    counters: Counters,
    img: Path,
    caption: str,
    intro: str | None = None,
) -> int:
    num = counters.next_fig()
    cap = f"Figure {num}: {caption}"
    if intro:
        blocks.append(para(intro, jc="both"))
    if img.exists():
        w_px, h_px = png_dimensions(img)
        cx, cy = scale_emu(w_px, h_px)
        injector.docpr += 1
        rid = injector.add(img)
        blocks.append(ET.fromstring(make_image_para(rid, cx, cy, injector.docpr, cap)))
    else:
        blocks.append(para(f"[Image manquante : {img.name}]", jc="center"))
    blocks.append(para(cap, style="Lgende", jc="center"))
    return num


def add_uc_module(
    blocks: list[ET.Element],
    injector,
    counters: Counters,
    *,
    case_title: str,
    table_title: str,
    fiche_rows: list[tuple[str, str]],
    activity_intro: str,
    activity_img: Path,
    activity_caption: str,
    sequence_intro: str,
    sequence_img: Path,
    sequence_caption: str,
    module_intro: str | None = None,
) -> None:
    blocks.append(para(f"Analyse du cas d'utilisation « {case_title} »", style="Titre5"))
    if module_intro:
        blocks.append(para(module_intro, jc="both"))
    else:
        blocks.append(para(
            f"Nous allons dans un premier temps décrire le cas d'utilisation « {case_title} », "
            "ensuite son diagramme d'activité et pour finir son diagramme de séquence.",
            jc="both",
        ))
    blocks.append(para("Description du cas d'utilisation", style="Titre6"))
    tbl_n = counters.next_tbl()
    blocks.append(para(f"Tableau {tbl_n}: Description du cas d'utilisation « {table_title} »", style="Lgende", jc="center"))
    blocks.append(fiche_table(fiche_rows))

    blocks.append(para(f"Activité — {case_title}", style="Titre6"))
    blocks.append(para(activity_intro, jc="both"))
    fig_a = counters.figure
    blocks.append(para(f"Ce scénario est matérialisé par la figure {fig_a} suivante :", jc="both"))
    add_figure(blocks, injector, counters, activity_img, activity_caption)

    blocks.append(para(f"Diagramme de séquence du cas « {table_title} »", style="Titre6"))
    blocks.append(para(sequence_intro, jc="both"))
    fig_s = counters.figure
    blocks.append(para(f"Les échanges sont illustrés par la figure {fig_s} suivante :", jc="both"))
    add_figure(blocks, injector, counters, sequence_img, sequence_caption)


# --- Contenu aligné sur le code DR-DOCSCOL ---

ELEVE_MODULES = [
    dict(
        case_title="Activer son compte et s'authentifier",
        table_title="Activer son compte élève",
        fiche_rows=[
            ("Titre", "Activer son compte élève / S'authentifier"),
            ("Résumé", "Créer les identifiants à partir d'un matricule pré-enregistré puis ouvrir une session sécurisée."),
            ("Acteurs", "Élève"),
            ("Précondition", "Matricule présent en base (Import B) ; Supabase Auth configuré."),
            ("Scénario nominal", "▪ Accès à /auth/register ou /auth/login ; ▪ Saisie matricule, email, mot de passe ; ▪ Vérification Prisma + Supabase Auth ; ▪ Redirection /dashboard."),
            ("Post condition", "Compte activé et/ou session ouverte ; trace LOGIN dans audit_logs."),
            ("Exception", "Matricule ou email inconnu ; compte déjà activé ; mot de passe invalide."),
        ],
        activity_intro="Le cas regroupe l'activation (UC-01) et la connexion élève. L'élève saisit ses identifiants ; le système contrôle le rôle ELEVE en base avant d'appeler Supabase Auth.",
        activity_img=IMG / "activites" / "act-uc-auth-eleve.png",
        activity_caption="Diagramme d'activité de l'authentification élève.",
        sequence_intro="L'élève soumet le formulaire de connexion ; signInAction() vérifie le matricule en Prisma, authentifie via Supabase Auth et redirige vers le tableau de bord.",
        sequence_img=IMG / "sequences" / "eleve" / "seq-eleve-01-authentifier.png",
        sequence_caption="Diagramme de séquence du cas « s'authentifier » (élève).",
    ),
    dict(
        case_title="Consulter via QR code / matricule",
        table_title="Consultation publique",
        fiche_rows=[
            ("Titre", "Consultation publique (UC-03)"),
            ("Résumé", "Vérifier la disponibilité des documents sans compte utilisateur."),
            ("Acteurs", "Visiteur, Élève non connecté"),
            ("Précondition", "Aucune authentification ; matricule valide ; rate-limit IP respecté."),
            ("Scénario nominal", "▪ Accès landing #consultation ou /consultation ; ▪ Saisie matricule ; ▪ POST /api/public/consultation ; ▪ Affichage des statuts (hors duplicatas)."),
            ("Post condition", "Consultation en lecture seule ; aucune modification en base."),
            ("Exception", "Matricule inconnu ; compte non activé ; HTTP 429 (trop de requêtes)."),
        ],
        activity_intro="Le visiteur saisit un matricule sur la page publique. Le système recherche l'élève et retourne les statuts documentaires autorisés sans exposer les duplicatas.",
        activity_img=IMG / "activites" / "act-uc-03-consultation-publique.png",
        activity_caption="Diagramme d'activité de la consultation publique.",
        sequence_intro="La route API lookupPublicConsultationByMatricule() interroge Prisma et renvoie une réponse JSON affichée sur components/landing/consultation-access.tsx.",
        sequence_img=IMG / "sequences" / "eleve" / "seq-eleve-02-consulter-via-qrcode.png",
        sequence_caption="Diagramme de séquence du cas « consulter via QR code ».",
    ),
    dict(
        case_title="Demander un duplicata et effectuer le paiement",
        table_title="Demande de duplicata et paiement",
        fiche_rows=[
            ("Titre", "Demande de duplicata (UC-05)"),
            ("Résumé", "Soumettre une demande de duplicata, joindre des pièces et simuler le paiement Mobile Money."),
            ("Acteurs", "Élève connecté"),
            ("Précondition", "Session élève ; document éligible ; formulaire et pièces valides (Zod)."),
            ("Scénario nominal", "▪ Formulaire duplicata ; ▪ Enregistrement DemandeDuplicata + PieceDuplicata ; ▪ Simulation paiement ; ▪ Génération reçu ; ▪ Notification admin."),
            ("Post condition", "Demande EN_ATTENTE ; paiement et reçu créés ; admin alerté."),
            ("Exception", "Document non éligible ; paiement refusé ; pièce manquante."),
        ],
        activity_intro="L'élève remplit le formulaire de duplicata depuis /dashboard. Le système valide l'éligibilité, enregistre la demande et déclenche le flux de paiement simulé.",
        activity_img=IMG / "activites" / "act-eleve-demande-duplicata.png",
        activity_caption="Diagramme d'activité — demande de duplicata et paiement.",
        sequence_intro="Les Server Actions créent la demande en base, appellent le service de paiement simulé et notifient l'administrateur OBC/DECC pour validation.",
        sequence_img=IMG / "sequences" / "eleve" / "seq-eleve-06-demande-duplicata-formulaire.png",
        sequence_caption="Diagramme de séquence du cas « demande de duplicata et paiement ».",
    ),
    dict(
        case_title="Prendre un rendez-vous de retrait",
        table_title="Prise de rendez-vous de retrait",
        fiche_rows=[
            ("Titre", "Rendez-vous de retrait (UC-06)"),
            ("Résumé", "Planifier ou annuler un créneau de retrait selon quotas et routage centre/antenne."),
            ("Acteurs", "Élève connecté"),
            ("Précondition", "Document au statut DISPONIBLE ; créneau libre ; quota journalier non saturé."),
            ("Scénario nominal", "▪ Choix créneau sur /dashboard ; ▪ Vérification routage et quota ; ▪ Création RendezVous PLANIFIE ; ▪ Transmission agent ou antenne."),
            ("Post condition", "RDV enregistré ; lieu et horaire affichés ; agent informé si centre d'examen."),
            ("Exception", "Créneau indisponible ; document non disponible ; annulation par l'élève."),
        ],
        activity_intro="L'élève sélectionne une date et un créneau. Le service de routage détermine le lieu de retrait (centre d'examen ou antenne OBC/DECC) avant confirmation.",
        activity_img=IMG / "activites" / "act-uc-06-rdv-retrait.png",
        activity_caption="Diagramme d'activité — prise de rendez-vous de retrait.",
        sequence_intro="createRendezVousAction() contrôle le statut document, le quota RDV (QuotaJournalier) et persiste le rendez-vous avec le lieu calculé.",
        sequence_img=IMG / "sequences" / "eleve" / "seq-eleve-09-prendre-rdv.png",
        sequence_caption="Diagramme de séquence du cas « prendre rendez-vous ».",
    ),
]

ADMIN_MODULES = [
    dict(
        case_title="Effectuer un import de disponibilisation",
        table_title="Import et disponibilisation",
        fiche_rows=[
            ("Titre", "Disponibilisation des documents (UC-08)"),
            ("Résumé", "Importer un CSV pour passer les documents au statut DISPONIBLE et notifier les élèves."),
            ("Acteurs", "Administrateur OBC / DECC"),
            ("Précondition", "Compte admin ; fichier CSV conforme au modèle Import A."),
            ("Scénario nominal", "▪ Upload CSV admin ; ▪ Validation ligne à ligne ; ▪ Mise à jour statuts ; ▪ Notifications email."),
            ("Post condition", "Documents DISPONIBLE ; historique import enregistré."),
            ("Exception", "Ligne CSV invalide ; matricule introuvable ; doublon de traitement."),
        ],
        activity_intro="L'administrateur importe un fichier de disponibilisation. Chaque ligne est validée avant mise à jour du statut document et envoi de notification.",
        activity_img=IMG / "activites" / "act-admin-disponibilisation.png",
        activity_caption="Diagramme d'activité — import de disponibilisation.",
        sequence_intro="L'API d'import parse le CSV, applique les règles métier OBC/DECC et déclenche Nodemailer pour informer les élèves concernés.",
        sequence_img=IMG / "sequences" / "admin" / "seq-admin-10-import-disponibilisation.png",
        sequence_caption="Diagramme de séquence du cas « import disponibilisation ».",
    ),
    dict(
        case_title="Valider une demande de duplicata",
        table_title="Validation duplicata",
        fiche_rows=[
            ("Titre", "Valider / rejeter un duplicata (UC-10)"),
            ("Résumé", "Instruire une demande de duplicata soumise par un élève."),
            ("Acteurs", "Administrateur OBC / DECC"),
            ("Précondition", "Demande EN_ATTENTE ; admin habilité sur l'organisme."),
            ("Scénario nominal", "▪ Consultation file duplicata ; ▪ Analyse pièces ; ▪ Validation ou rejet ; ▪ Notification élève."),
            ("Post condition", "Statut VALIDEE ou REJETEE ; trace AuditLog."),
            ("Exception", "Pièces insuffisantes ; demande déjà traitée."),
        ],
        activity_intro="L'administrateur ouvre la demande, vérifie les pièces jointes (PieceDuplicata) et valide ou rejette avec motif.",
        activity_img=IMG / "activites" / "act-uc-10-valider-duplicata.png",
        activity_caption="Diagramme d'activité — validation d'une demande de duplicata.",
        sequence_intro="validateDuplicataAction() met à jour le statut, journalise l'action et notifie l'élève du résultat.",
        sequence_img=IMG / "sequences" / "admin" / "seq-admin-08-valider-demande-duplicata.png",
        sequence_caption="Diagramme de séquence du cas « valider demande duplicata ».",
    ),
]

AGENT_MODULES = [
    dict(
        case_title="Confirmer le retrait effectué",
        table_title="Confirmation de retrait",
        fiche_rows=[
            ("Titre", "Confirmer retrait physique (UC-11)"),
            ("Résumé", "Confirmer que l'élève a retiré son document au centre d'examen."),
            ("Acteurs", "Agent centre d'examen"),
            ("Précondition", "RDV transmis au centre ; agent authentifié sur /centre-examen."),
            ("Scénario nominal", "▪ Consultation liste RDV ; ▪ Vérification identité sur place ; ▪ confirm-withdrawal API ; ▪ Statut RETIRE."),
            ("Post condition", "Document RETIRE ; historique mis à jour ; élève notifié."),
            ("Exception", "RDV annulé ; document déjà retiré ; identité non conforme."),
        ],
        activity_intro="L'agent consulte les rendez-vous du jour et confirme le retrait après vérification de l'identité de l'élève.",
        activity_img=IMG / "activites" / "act-agent-confirmation-retrait.png",
        activity_caption="Diagramme d'activité — confirmation du retrait par l'agent.",
        sequence_intro="L'API confirm-withdrawal met à jour DocumentAcademique et RendezVous, et enregistre l'opération pour traçabilité.",
        sequence_img=IMG / "sequences" / "agent" / "seq-agent-03-confirmer-retrait-effectue.png",
        sequence_caption="Diagramme de séquence du cas « confirmer retrait effectué ».",
    ),
]


def build_uml_blocks(injector, counters: Counters | None = None) -> list[ET.Element]:
    """Construit la section 2.4.3 complète (Tamela + syntaxe DR-DOCSCOL)."""
    if counters is None:
        counters = Counters(figure=2, table=5)

    blocks: list[ET.Element] = []

    blocks.append(para(
        "Pour bien représenter le fonctionnement du système, plusieurs diagrammes UML ont été réalisés "
        "selon la syntaxe : diagramme général, diagrammes par package (acteur), puis pour chaque cas phare "
        "une fiche descriptive (tableau), un diagramme d'activité et un diagramme de séquence. "
        "Le diagramme de classes clôt la modélisation statique.",
        jc="both",
    ))

    blocks.append(para("Diagramme de cas d'utilisation", style="Titre4"))
    blocks.append(para(
        "Le diagramme général (figure 2) regroupe les trois acteurs — élève, administrateur OBC/DECC "
        "et agent centre d'examen — et l'ensemble des cas avec leurs relations include, extend et généralisations.",
        jc="both",
    ))
    add_figure(
        blocks, injector, counters,
        IMG / "cas-utilisation-general.png",
        "Diagramme général des cas d'utilisation DR-DOCSCOL.",
    )

    blocks.append(para(
        "Chaque package acteur fait l'objet d'un diagramme dédié (figures 3 à 5). "
        "Nous détaillons ensuite les cas phares par fiche, activité et séquence.",
        jc="both",
    ))

    blocks.append(para(
        "Le diagramme du package élève couvre authentification, consultation publique, demandes, duplicata et rendez-vous.",
        jc="both",
    ))
    add_figure(
        blocks, injector, counters,
        IMG / "cas-utilisation-eleve.drawio.png",
        "Diagramme de cas d'utilisation — package Élève.",
    )

    blocks.append(para("Analyse des cas d'utilisation — package Élève", style="Titre4"))
    blocks.append(para(
        "Dans cette partie, nous nous intéresserons à l'aspect dynamique du parcours élève.",
        jc="both",
    ))
    for mod in ELEVE_MODULES:
        add_uc_module(blocks, injector, counters, **mod)

    blocks.append(para(
        "Le diagramme du package administrateur OBC/DECC regroupe imports, mise à jour des statuts, "
        "validation duplicata, quotas RDV et journal d'audit.",
        jc="both",
    ))
    add_figure(
        blocks, injector, counters,
        IMG / "cas-utilisation-admin-obc-decc.drawio.png",
        "Diagramme de cas d'utilisation — Administrateur OBC/DECC.",
    )
    blocks.append(para("Analyse des cas d'utilisation — package Administrateur", style="Titre4"))
    for mod in ADMIN_MODULES:
        add_uc_module(blocks, injector, counters, **mod)

    blocks.append(para(
        "Le diagramme du package agent centre d'examen couvre la consultation des rendez-vous transmis "
        "et la confirmation du retrait physique.",
        jc="both",
    ))
    add_figure(
        blocks, injector, counters,
        IMG / "cas-utilisation-agent-centre.drawio.png",
        "Diagramme de cas d'utilisation — Agent centre d'examen.",
    )
    blocks.append(para("Analyse des cas d'utilisation — package Agent", style="Titre4"))
    for mod in AGENT_MODULES:
        add_uc_module(blocks, injector, counters, **mod)

    blocks.append(para("DIAGRAMME DES CLASSES", style="Titre4"))
    blocks.append(para(
        "Le diagramme de classes modélise la structure statique du système (vue simplifiée pour la soutenance). "
        "Il représente les héritages Utilisateur → Élève, Administrateur, AgentCentreExamen et "
        "DocumentScolaire → OriginalDiplome, ReleveNote, la classe Duplicata et les associations essentielles. "
        "Le modèle exhaustif (20 tables Prisma) est documenté dans le cahier de conception du projet.",
        jc="both",
    ))
    add_figure(
        blocks, injector, counters,
        IMG / "diagramme-classes-simplifie.png",
        "Diagramme des classes du système DR-DOCSCOL (vue simplifiée).",
    )
    blocks.append(para(
        "Cardinalités principales : Élève–Notification (0..* / 1), Élève–Paiement (0..* / 1), "
        "Élève–RendezVous (0..* / 1), Administrateur–DocumentScolaire (* / *), "
        "DocumentScolaire–Duplicata (0..1 / 1).",
        jc="both",
    ))

    return blocks


def figure_list_entries(counters: Counters) -> list[str]:
    """Génère les entrées liste des figures UML (figures 2..N). Placeholder — rempli après build."""
    return []  # filled dynamically in align script from counters

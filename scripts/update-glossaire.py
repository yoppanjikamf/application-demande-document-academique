#!/usr/bin/env python3
"""Glossaire condensé, trié alphabétiquement, pour tenir sur une page."""
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
register_docx_namespaces = align.register_docx_namespaces

DOCX = ROOT / "bout aligne.docx"
BACKUP = ROOT / "bout aligne.backup-glossaire.docx"

# Termes essentiels au mémoire D-SCOLCAM — ordre alphabétique
GLOSSAIRE_ENTRIES: list[tuple[str, str]] = [
    ("API", "Interface de programmation permettant la communication entre modules logiciels."),
    ("BEPC", "Brevet d'Études du Premier Cycle."),
    ("CRUD", "Create, Read, Update, Delete — opérations de base sur les données."),
    ("CSV", "Format de fichier tabulaire utilisé pour l'import des élèves et documents."),
    ("DECC", "Direction des Examens, des Concours et de la Certification."),
    ("JWT", "JSON Web Token — jeton d'authentification de session."),
    ("MVP", "Minimum Viable Product — première version fonctionnelle du produit."),
    ("Next.js", "Framework React full-stack (interface, API, déploiement)."),
    ("OBC", "Office du Baccalauréat du Cameroun."),
    ("PostgreSQL", "Système de gestion de base de données relationnelle."),
    ("Prisma", "ORM TypeScript pour accéder à PostgreSQL avec typage fort."),
    ("React", "Bibliothèque JavaScript pour construire l'interface utilisateur."),
    ("SSR", "Server Side Rendering — rendu des pages côté serveur."),
    ("Supabase", "Plateforme PostgreSQL managée avec authentification intégrée."),
    ("UML", "Unified Modeling Language — langage de modélisation des systèmes."),
    ("Zod", "Bibliothèque TypeScript de validation des données et formulaires."),
]


def make_entry(term: str, definition: str, template_ppr: ET.Element | None) -> ET.Element:
    p = ET.Element(f"{{{W}}}p")
    if template_ppr is not None:
        ppr = copy.deepcopy(template_ppr)
        spacing = ppr.find(f"{{{W}}}spacing")
        if spacing is not None:
            spacing.set(f"{{{W}}}after", "60")
            spacing.attrib.pop(f"{{{W}}}line", None)
            spacing.attrib.pop(f"{{{W}}}lineRule", None)
        p.append(ppr)

    r_term = ET.SubElement(p, f"{{{W}}}r")
    rpr = ET.SubElement(r_term, f"{{{W}}}rPr")
    ET.SubElement(rpr, f"{{{W}}}b")
    ET.SubElement(rpr, f"{{{W}}}bCs")
    t_term = ET.SubElement(r_term, f"{{{W}}}t")
    t_term.text = term

    r_def = ET.SubElement(p, f"{{{W}}}r")
    t_def = ET.SubElement(r_def, f"{{{W}}}t")
    t_def.set("{http://www.w3.org/XML/1998/namespace}space", "preserve")
    t_def.text = f" : {definition}"

    return p


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

    start = end = None
    template_ppr = None
    for i, child in enumerate(children):
        if child.tag != f"{{{W}}}p":
            continue
        text = para_text(child).strip()
        if text in ("GLOSSAIRE", "GLOSSAIREGLOSSAIRE"):
            start = i
        elif start is not None and (
            text.startswith("RÉSUMÉ") or text.startswith("RESUME") or text == "RÉSUMÉRÉSUMÉ"
        ):
            end = i
            break
        elif start is not None and end is None and " : " in text and template_ppr is None:
            ppr = child.find(f"{{{W}}}pPr")
            if ppr is not None:
                template_ppr = ppr

    if start is None or end is None:
        raise SystemExit("Section GLOSSAIRE introuvable.")

    # Fix titre dupliqué
    for t in root.iter(f"{{{W}}}t"):
        if t.text and "GLOSSAIREGLOSSAIRE" in t.text:
            t.text = t.text.replace("GLOSSAIREGLOSSAIRE", "GLOSSAIRE")

    si = start + 1
    ei = end
    for el in list(body)[si:ei]:
        body.remove(el)

    insert_at = start + 1
    for term, definition in GLOSSAIRE_ENTRIES:
        body.insert(insert_at, make_entry(term, definition, template_ppr))
        insert_at += 1

    files["word/document.xml"] = ET.tostring(root, encoding="utf-8", xml_declaration=True)

    with zipfile.ZipFile(DOCX, "w", zipfile.ZIP_DEFLATED) as z:
        for name, data in files.items():
            z.writestr(name, data)

    print(f"OK — glossaire : {len(GLOSSAIRE_ENTRIES)} entrées (ordre alphabétique)")
    print(f"Fichier : {DOCX}")
    print(f"Sauvegarde : {BACKUP}")


if __name__ == "__main__":
    main()

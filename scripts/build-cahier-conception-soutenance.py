#!/usr/bin/env python3
"""
Génère docs/cahier_conception_soutenance.md — version impression (~20–25 pages).
Conserve : architecture (contexte, packages, MVC), UC par package, fiches texte,
6 séquences phares, 2 activités globales, classe + stack.
Retire : images activité/séquence par UC (renvoi annexe numérique).
"""
from pathlib import Path
import re

ROOT = Path(__file__).resolve().parents[1]
SRC = ROOT / "docs" / "cahier_conception.md"
OUT = ROOT / "docs" / "cahier_conception_soutenance.md"

# Séquences phares conservées en figure (soutenance)
SEQ_KEEP = {
    "seq-eleve-02-consulter-via-qrcode",
    "seq-eleve-05-demande-releve",
    "seq-eleve-09-prendre-rdv",
    "seq-admin-10-import-disponibilisation",
    "seq-admin-08-valider-demande-duplicata",
    "seq-agent-03-confirmer-retrait-effectue",
}

ACT_KEEP = {
    "act-eleve-parcours-retrait-document",
    "act-eleve-demande-duplicata",
}


def strip_uc_dynamic_images(text: str) -> str:
    """Supprime les PNG activité/séquence dans §3.7–3.9 sauf renvois texte."""
    lines = text.splitlines()
    out = []
    in_detail = False
    skip_until_heading = False
    section = None

    for line in lines:
        if line.startswith("## 3.2 ") or line.startswith("## 3.3 ") or line.startswith("## 3.4 ") or line.startswith("### 3.2.") or line.startswith("### 3.3.") or line.startswith("### 3.4."):
            in_detail = True
        if line.startswith("## 3.5 ") or line.startswith("## 4."):
            in_detail = False

        if in_detail and line.startswith("#### Diagramme d'activité"):
            skip_until_heading = True
            section = "act"
            out.append(line)
            out.append("")
            out.append("*Figure en annexe numérique — dossier `diagrammes-images/activites/`.*")
            continue

        if in_detail and line.startswith("#### Diagramme de séquence"):
            skip_until_heading = True
            section = "seq"
            out.append(line)
            continue

        if skip_until_heading:
            if line.startswith("!["):
                continue
            if line.startswith("**Figure") and section == "act":
                continue
            if line.startswith("**Figure") and section == "seq":
                # keep caption lines that aren't followed by kept images
                out.append(line)
                continue
            if line.startswith("#### ") or line.startswith("### ") or line.strip() == "---":
                skip_until_heading = False
                section = None
            elif line.startswith("!["):
                continue
            elif section == "seq" and line.startswith("!["):
                continue
            else:
                if not (section == "seq" and "diagrammes-images/sequences" in line):
                    out.append(line)
                continue

        out.append(line)

    return "\n".join(out)


def filter_section_354(text: str) -> str:
    """Garde ACT-01 et ACT-02 seulement dans §3.5.4."""
    lines = text.splitlines()
    out = []
    in_354 = False
    skip_figure = False

    for i, line in enumerate(lines):
        if line.startswith("### 3.5.4 "):
            in_354 = True
        if in_354 and line.startswith("## 4."):
            in_354 = False

        if in_354 and line.startswith("**Figure 3.3") and "ACT-0" in line:
            # detect ACT-03, ACT-04 figures
            fig_line = line
            # peek next non-empty for image path
            skip_figure = False
            for j in range(i + 1, min(i + 4, len(lines))):
                if lines[j].startswith("!["):
                    path = lines[j]
                    if not any(k in path for k in ACT_KEEP):
                        skip_figure = True
                    break
            if skip_figure:
                continue

        if in_354 and skip_figure:
            if line.startswith("!["):
                skip_figure = False
                continue
            if line.startswith("**Figure") and "ACT-0" in line:
                skip_figure = False

        if in_354 and line.startswith("![") and "activites/act-" in line:
            if not any(k in line for k in ACT_KEEP):
                continue

        out.append(line)

    return "\n".join(out)


def condense_late_chapters(text: str) -> str:
    """Remplace ch. 6–10 par un résumé court."""
    marker = "## 6. CONCEPTION DE L'INTERFACE UTILISATEUR"
    end_marker = "## 11. CONCLUSION ET PERSPECTIVES"
    if marker not in text or end_marker not in text:
        return text

    head, rest = text.split(marker, 1)
    _, tail = rest.split(end_marker, 1)

    summary = """## 6. SYNTHÈSE TECHNIQUE (version impression)

Les chapitres détaillés **interface (§6 complet), imports batch (§8), tests (§9), déploiement (§10)** figurent dans le cahier de conception intégral (`docs/cahier_conception.md`) et dans le dépôt source. Synthèse :

| Thème | Choix retenus |
| --- | --- |
| **Interface** | Tailwind, responsive mobile-first, charte ardoise/ambre (`docs/CHARTE_GRAPHIQUE_COULEURS.md`) |
| **Imports CSV** | Import B (élèves) et Import A (disponibilisation), erreurs par ligne |
| **Tests** | Scénarios manuels par rôle — `docs/GUIDE_TEST_FONCTIONNEL.md` |
| **Déploiement** | Vercel + Supabase ; variables d'environnement documentées §10.3 du cahier intégral |
| **Sécurité** | Supabase Auth, rôles, périmètre admin, rate-limit consultation publique |

---

"""
    return head + summary + end_marker + tail


def add_header_note(text: str) -> str:
    note = """> **Version impression / soutenance** — Document allégé (~20–25 pages).  
> Le cahier intégral avec toutes les figures activité/séquence par cas : `docs/cahier_conception.md`  
> Dossier annexe numérique des diagrammes : `docs/diagrammes-images/`

"""
    return text.replace(
        "**Document associé :** Cahier d'analyse",
        note + "**Document associé :** Cahier d'analyse",
        1,
    )


def main() -> None:
    text = SRC.read_text(encoding="utf-8")
    text = add_header_note(text)
    text = strip_uc_dynamic_images(text)
    text = filter_section_354(text)
    text = condense_late_chapters(text)
    text = text.replace(
        "# CAHIER DE CONCEPTION",
        "# CAHIER DE CONCEPTION — VERSION SOUTENANCE (IMPRESSION)",
        1,
    )
    OUT.write_text(text, encoding="utf-8")
    print(f"OK -> {OUT} ({OUT.stat().st_size // 1024} Ko)")


if __name__ == "__main__":
    main()

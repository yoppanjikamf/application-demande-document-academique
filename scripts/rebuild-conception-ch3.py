#!/usr/bin/env python3
"""Réorganise le chapitre 3 du cahier de conception (blocs UC synchronisés)."""
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
DOC = ROOT / "docs" / "cahier_conception.md"
CH3 = ROOT / "docs" / "_ch3_conception_sync.md"

# Contenu généré : voir fichier _ch3_conception_sync.md (maintenu à part pour lisibilité)


def main() -> None:
    text = DOC.read_text(encoding="utf-8")
    head, _, tail = text.partition("### 3.6 — Méthode de documentation synchronisée")
    if not tail:
        raise SystemExit("Marqueur §3.6 introuvable")
    _, _, tail = tail.partition("\n## 4. CONCEPTION TECHNIQUE")
    if not tail.startswith("\n"):
        raise SystemExit("Marqueur chapitre 4 introuvable")

    ch3 = CH3.read_text(encoding="utf-8")
    new_doc = head.rstrip() + "\n\n" + ch3.rstrip() + "\n\n## 4. CONCEPTION TECHNIQUE" + tail

    # Table des matières
    new_doc = new_doc.replace(
        "3. Conception fonctionnelle *(tableau UC §3.2, fiches §3.6, séquences §3.7, activités §3.8)*",
        "3. Conception fonctionnelle *(cas d'utilisation synchronisés : fiche → activité → séquence, §3.6–3.10)*",
    )
    new_doc = new_doc.replace(
        "- la conception fonctionnelle (cas d'utilisation, fiches descriptives, flux, routage) ;",
        "- la conception fonctionnelle (cas d'utilisation synchronisés : fiche, activité, séquence par cas phare) ;",
    )

    DOC.write_text(new_doc, encoding="utf-8")
    print(f"Mis à jour : {DOC}")


if __name__ == "__main__":
    main()

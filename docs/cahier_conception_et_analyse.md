# Documentation DR-DOCSCOL — Cahiers séparés

Export **PDF uniquement** dans `documents-word/` (pas de fichiers Word conservés).

| Document | Markdown | PDF |
| --- | --- | --- |
| **Cahier d'analyse** | `cahier_analyse.md` | `documents-word/cahier_analyse.pdf` |
| **Cahier de conception** | `cahier_conception.md` | `documents-word/cahier_conception.pdf` |

## Diagrammes (dossier `diagrammes-images/`)

| Type | Fichier |
| --- | --- |
| **Cas d'utilisation général (3 acteurs)** | `cas-utilisation-general.png` |
| Cas d'utilisation Élève | `cas-utilisation-eleve.drawio.png` |
| Cas d'utilisation Admin OBC/DECC | `cas-utilisation-admin-obc-decc.drawio.png` |
| Cas d'utilisation Agent centre | `cas-utilisation-agent-centre.drawio.png` |
| Classes (vue simplifiée) | `diagramme-classes-simplifie.png` |
| Séquences phares Élève | `sequences/eleve/seq-eleve-*.png` (01, 02, 03, 05–07, 09, 10) |
| Séquences phares Admin | `sequences/admin/seq-admin-*.png` (01, 02, 06, 08, 10, 11) |
| Séquences phares Agent | `sequences/agent/seq-agent-*.png` (01, 02, 03) |
| Activités (flux métier) | `activites/act-*.png` (4 diagrammes — `npm run diagrams:activites`) |

**Sources draw.io (cas d'utilisation)** — dossier `diagramme cas utilisation/` à la racine du dépôt :
`Image collée.png` (général), `cas utilisation eleve .drawio.png`, `vivi.drawio.png`, `agent centre.drawio.png`.

Index complet des 24 séquences : `SEQUENCES_PAR_CAS_UTILISATION.md`.

Les cahiers Markdown référencent ces images directement. Mise à jour des figures UC : recopier les exports draw.io vers `diagrammes-images/`. Variante vectorielle programmatique : `npm run diagrams:cas-utilisation`. Régénération PDF : `npm run export:docs-pdf` ou conversion ciblée via `scripts/md_to_docx.py`.

Les anciens fichiers `sequence-*-v3-soutenance.png` et `cas utilisation.jpeg` ne sont plus référencés dans les cahiers.

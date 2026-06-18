# Dossier demo — guide et PDF

| Fichier | Description |
| --- | --- |
| `KIT_DEMO_COMPLET.md` / `KIT_DEMO_COMPLET.pdf` | Guide complet demo (parcours, comptes, ordre des imports) |

## Fichiers CSV (dans le dossier parent `docs/`)

Les CSV d'import ne sont pas dans `demo/` : ils sont a la **racine de `docs/`** pour les trouver facilement :

| Fichier | Chemin | Usage |
| --- | --- | --- |
| Import B — nouveaux eleves | `docs/import-nouveaux-eleves-demo-2025.csv` | ELEVE9001–9005 |
| Import B — documents DEMO | `docs/import-documents-eleves-demo-existants.csv` | DEMO2026001–005 |
| Import A — disponibilisation | `docs/import-disponibilisation-session-2024.csv` | Passer en Disponible |
| Liste eleves seed | `docs/test-data-soutenance-eleves.csv` | 5 eleves apres `seed:soutenance-eleves` |
| Export depuis votre BD | `docs/import-disponibilisation-depuis-bd.csv` | Genere par `npm run export:disponibilisation-csv` |

**Prerequis seed :** `npm run seed:soutenance-eleves`

Modèles vides pour l'app : `public/templates/import-eleves.csv` et `public/templates/import-disponibilisation.csv`

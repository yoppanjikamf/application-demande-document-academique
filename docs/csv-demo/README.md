# CSV de démonstration — par région et organisme

Les fichiers CSV reflètent le fonctionnement réel : **l’OBC et la DECC ne reçoivent pas les mêmes fichiers**.

## Structure

```
docs/csv-demo/
  {region}/
    obc/
      import-eleves-probatoire-bac.csv
      import-disponibilisation-probatoire-bac.csv
    decc/
      import-eleves-bepc.csv
      import-disponibilisation-bepc.csv
```

Régions : `adamaoua`, `centre`, `est`, `extreme-nord`, `littoral`, `nord`, `nord-ouest`, `ouest`, `sud`, `sud-ouest`.

## Deux types d’import (inchangés)

| Type | Fichier OBC | Fichier DECC | Effet |
| --- | --- | --- | --- |
| **Élèves** | `import-eleves-probatoire-bac.csv` | `import-eleves-bepc.csv` | Crée élève + examen + document **Pas disponible** |
| **Disponibilisation** | `import-disponibilisation-probatoire-bac.csv` | `import-disponibilisation-bepc.csv` | Passe à **Disponible** (crée la fiche si besoin) |

## Démo soutenance (région Centre)

```bash
npm run seed:soutenance-eleves
```

### Admin OBC — `ADM-02-CENTRE`

1. Disponibilisation : `docs/csv-demo/centre/obc/import-disponibilisation-probatoire-bac.csv`  
   → ex. relevé Probatoire **DEMO2026002** (Faïssa) pour le parcours RDV.
2. (Option) Nouveaux élèves : `docs/csv-demo/centre/obc/import-eleves-probatoire-bac.csv`  
   → `ELEVE9001`–`9005`.

### Admin DECC — `DECC-02-CENTRE`

1. Disponibilisation : `docs/csv-demo/centre/decc/import-disponibilisation-bepc.csv`  
   → BEPC pour **DEMO2026001**–**005**.
2. (Option) Nouveaux élèves BEPC : `docs/csv-demo/centre/decc/import-eleves-bepc.csv`.

## Modèles UI

Téléchargés depuis `/admin/students` selon l’organisme connecté :

- OBC : `public/templates/obc/import-eleves.csv`, `import-disponibilisation.csv`
- DECC : `public/templates/decc/import-eleves.csv`, `import-disponibilisation.csv`

## Régénérer tous les CSV

```bash
node scripts/generate-demo-csv-by-region.mjs
```

## Anciens fichiers (racine `docs/`)

Les fichiers `import-*-demo*.csv` à la racine de `docs/` sont **obsolètes**. Utiliser `docs/csv-demo/` à la place.

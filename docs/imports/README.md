# Imports CSV — données réelles

Dossier unique pour les imports admin (remplace l’ancien `docs/csv-demo/`).

## Fichiers

| Fichier | Usage |
| --- | --- |
| `centre/obc/import-disponibilisation.csv` | **Disponibilisation** — matricules déjà en base, documents repassés à *Pas disponible* |
| `centre/obc/import-ajout-eleves.csv` | **Ajout d’élèves** — nouveaux matricules (`DEMO2026006+`) pas encore en base |
| `eleves-en-base.csv` | Référence lecture seule (élèves conservés après nettoyage) |

## Régénérer depuis la base

```bash
npm run reset:imports
```

Ce script :
1. supprime les élèves `@example.com`
2. désactive tous les comptes élèves (`authUserId` vidé)
3. remet tous les documents à **Pas disponible**
4. régénère les CSV ci-dessus depuis la base

## Parcours admin (Centre / OBC)

1. **Disponibilisation** : coller `import-disponibilisation.csv` → les matricules correspondent aux 5 élèves réels en base
2. **Nouveaux élèves** : coller `import-ajout-eleves.csv` → crée `DEMO2026006` et `DEMO2026007` en *Pas disponible*

Modèles vides : `public/templates/obc/`

## Élèves de référence (emails réels)

| Matricule | Email |
| --- | --- |
| DEMO2026001 | francialengambia@gmail.com |
| DEMO2026002 | faissayoppanjikam@gmail.com |
| DEMO2026003 | eyaanemesselehelenedoucette@gmail.com |
| DEMO2026004 | ambiankeu@gmail.com |
| DEMO2026005 | prince.mabengue@facsciences-uy1.cm |

Recréer les fiches élèves seules : `npm run seed:soutenance-eleves` puis `npm run reset:imports`.

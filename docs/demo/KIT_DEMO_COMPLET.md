# Kit de démonstration DR-DOCSCOL

**Version :** 1.1 — Juin 2026  
**Objectif :** Tester l’import CSV, la disponibilisation, la consultation publique et les parcours par rôle (élève, admin OBC, admin DECC, agent centre).

---

## 1. Prérequis

Jeux de données possibles dans votre base :

| Seed | Matricules élèves | Documents en base |
| --- | --- | --- |
| `npm run seed:soutenance-eleves` | **DEMO2026001** à **DEMO2026005** | Examens oui, documents **non** (à créer via Import B) |

Commandes admin / agents :

```bash
npm run seed:regional-admins
npm run seed:decc-admins
npm run seed:centre-agents
npm run seed:soutenance-eleves
```

Variables d’environnement : Supabase Auth + `DATABASE_URL` (Prisma) doivent être configurées.

**Région unique pour la demo :** tous les élèves (DEMO202600x et ELEVE900x) sont en **Centre**. Connectez-vous avec **ADM-02-CENTRE** (OBC), **DECC-02-CENTRE** (DECC) ou **AGENT-CE-02-CENTRE** (agent centre).

---

## 2. Syntaxe des matricules (implémentée dans le projet)

| Profil | Format | Exemple |
| --- | --- | --- |
| Élève import demo | `ELEVE` + 4 chiffres | `ELEVE9001` |
| Élève seed soutenance | `DEMO2026` + 3 chiffres | `DEMO2026001` |
| Admin OBC | `ADM-NN-REGION` | `ADM-02-CENTRE` |
| Admin DECC | `DECC-NN-REGION` | `DECC-02-CENTRE` |
| Agent centre | `AGENT-CE-NN-REGION` | `AGENT-CE-02-CENTRE` |

Emails élèves fictifs : `eleve9001@example.com`.

---

## 3. Fichiers CSV fournis

**Emplacement :** dossier `docs/` à la racine de la documentation (pas dans `documents-word/` qui ne contient que des PDF).

| Fichier | Chemin | Type | Usage |
| --- | --- | --- | --- |
| Nouveaux élèves | `docs/import-nouveaux-eleves-demo-2025.csv` | **Import B** | 5 élèves `ELEVE9001`–`ELEVE9005`, région Centre |
| Documents DEMO | `docs/import-documents-eleves-demo-existants.csv` | **Import B** | Documents Pas disponible pour **DEMO2026001**–**005** |
| Disponibilisation | `docs/import-disponibilisation-session-2024.csv` | **Import A** | Disponibiliser des documents DEMO |

Export automatique depuis **votre** base (si `DATABASE_URL` configurée) :

```bash
npm run export:disponibilisation-csv
```

→ génère `docs/import-disponibilisation-depuis-bd.csv` avec les matricules réellement présents en statut Pas disponible.

Modèles vides : `public/templates/import-eleves.csv` et `public/templates/import-disponibilisation.csv`.

---

## 4. Ordre de test recommandé (seed soutenance DEMO)

### Étape 0 — Créer les documents des élèves DEMO existants

Si vous avez lancé `seed:soutenance-eleves` : les élèves existent mais **sans document**.

1. Admin OBC ou DECC (région correspondante).
2. `/admin/students` → **Import nouveaux élèves** → fichier `docs/import-documents-eleves-demo-existants.csv`.
3. Vérifier : documents créés en **Pas disponible** pour DEMO2026001–005.

### Étape 1 — Import B (nouveaux élèves)

1. `/admin/students` → importer `docs/import-nouveaux-eleves-demo-2025.csv`.
2. Vérifier : `ELEVE9001` à `ELEVE9005` créés (noms camerounais : NGONO, FOUDA, MBALLA, NJOCK, KAMGA).

### Étape 2 — Import A (disponibilisation)

1. Importer `docs/import-disponibilisation-session-2024.csv` (section **Disponibiliser des documents**).
2. Utiliser l’admin **DECC** pour les lignes **BEPC**, **OBC** pour **Probatoire** / **Bac** (région de l’élève).
3. Vérifier : statut **Disponible** + notification si SMTP configuré.

### Étape 3 — Disponibiliser les nouveaux ELEVE900x

Après l’étape 1, ajouter par exemple :

```
ELEVE9001,BEPC,ORIGINAL,2025
ELEVE9003,BACCALAUREAT,RELEVE_NOTES,2025
```

### Étape 4 — Consultation publique

- URL : `/consultation`
- Matricules : `DEMO2026002`, `ELEVE9001`, etc.

### Étape 5 — Activation élève

- `/auth/register` avec `DEMO2026002` + `faissayoppanjikam@gmail.com` (ou `ELEVE9001` + `eleve9001@example.com`).

### Étape 6 — Agent centre

- `/centre-examen` → confirmer un retrait (document routé centre).

---

## 5. Comptes de démonstration (région Centre — recommandé)

### Admin OBC — Centre

| Champ | Valeur |
| --- | --- |
| Page | `/auth/login/obc` |
| Email | `admin.centre@example.com` |
| Mot de passe | `AdminCentre2026!` |
| Matricule | `ADM-02-CENTRE` |
| Antenne | Centre (Yaoundé) |
| Périmètre | Probatoire, Baccalauréat — région Centre |

### Admin DECC — Centre

| Champ | Valeur |
| --- | --- |
| Page | `/auth/login/decc` |
| Email | `admin.decc.centre@example.com` |
| Mot de passe | `DeccCentre2026!` |
| Matricule | `DECC-02-CENTRE` |
| Antenne | DECC Centre |
| Périmètre | BEPC — région Centre |

### Agent centre d'examen — Centre

| Champ | Valeur |
| --- | --- |
| Page | `/auth/login/centre-examen` |
| Email | `agent.centre.centre@example.com` |
| Mot de passe | `AgentCentre2026!` |
| Matricule | `AGENT-CE-02-CENTRE` |
| Centre | Centre d'examen Centre |
| Rôle | Confirmer retraits au centre uniquement |

### Élèves DEMO déjà en base (seed soutenance)

Liste alignée sur la base Postgres au 05/06/2026 — **5 élèves**, dont **Anicet MBIANKEU** (`DEMO2026004`).

| Matricule | Email | Nom complet | Centre examen | Région | Docs en BD |
| --- | --- | --- | --- | --- | --- |
| DEMO2026001 | francialengambia@gmail.com | Françial NGAMBIA | Centre d'examen Centre | Centre | 0 |
| DEMO2026002 | faissayoppanjikam@gmail.com | Faïssa NJIKAM | Centre d'examen Centre | Centre | 3 |
| DEMO2026003 | eyaanemesselehelenedoucette@gmail.com | Doucette MESSELE | Centre d'examen Centre | Centre | 0 |
| DEMO2026004 | ambiankeu@gmail.com | Anicet MBIANKEU | Centre d'examen Centre | Centre | 0 |
| DEMO2026005 | prince.mabengue@facsciences-uy1.cm | Prince MABENGUE | Centre d'examen Centre | Centre | 0 |

### Nouveaux élèves (après Import B `ELEVE900x`)

| Matricule | Email | Nom | Examen | Région |
| --- | --- | --- | --- | --- |
| ELEVE9001 | eleve9001@example.com | Claire NGONO | BEPC 2025 | Centre |
| ELEVE9002 | eleve9002@example.com | Samuel FOUDA | Probatoire 2025 | Centre |
| ELEVE9003 | eleve9003@example.com | Estelle MBALLA | Bac 2025 | Centre |
| ELEVE9004 | eleve9004@example.com | Brice NJOCK | BEPC 2025 | Centre |
| ELEVE9005 | eleve9005@example.com | Thierry KAMGA | Probatoire 2025 | Centre |

Tous les élèves demo sont en **région Centre** (centre d'examen : Centre d'examen Centre). Comptes admin recommandés pour les tests : **ADM-02-CENTRE**, **DECC-02-CENTRE**, **AGENT-CE-02-CENTRE**.

Mot de passe élève : créer via `/auth/register`.

---

## 6. Détail CSV Import A — Disponibilisation (DEMO2026001–005)

| Matricule | Diplôme | Document | Session | Admin |
| --- | --- | --- | --- | --- |
| DEMO2026001 | BEPC | ORIGINAL | 2019 | DECC Centre |
| DEMO2026001 | BEPC | RELEVE_NOTES | 2019 | DECC Centre |
| DEMO2026002 | PROBATOIRE | RELEVE_NOTES | 2021 | OBC Centre |
| DEMO2026003 | BACCALAUREAT | RELEVE_NOTES | 2022 | OBC Centre |
| DEMO2026004 | BEPC | ORIGINAL | 2019 | DECC Centre |
| DEMO2026005 | BEPC | RELEVE_NOTES | 2019 | DECC Centre |

> Prérequis : importer d’abord `import-documents-eleves-demo-existants.csv` si les documents n’existent pas encore.

---

## 7. Détail CSV Import B — Nouveaux élèves ELEVE9001–9005

Syntaxe matricule nouveaux élèves : **`ELEVE` + 4 chiffres** (ex. `ELEVE9001`).
Noms et prénoms **camerounais** (NGONO, FOUDA, MBALLA, NJOCK, KAMGA).  
Statut initial documents : **Pas disponible** (forcé par l’application).

---

## 8. Tous les admins et agents (10 régions)

Mot de passe agents : `AgentCentre2026!` pour tous.

### Admins OBC

| Région | Email | Mot de passe | Matricule |
| --- | --- | --- | --- |
| Adamaoua | admin.adamaoua@example.com | AdminAdamaoua2026! | ADM-01-ADAMAOUA |
| Centre | admin.centre@example.com | AdminCentre2026! | ADM-02-CENTRE |
| Est | admin.est@example.com | AdminEst2026! | ADM-03-EST |
| Extreme-Nord | admin.extreme-nord@example.com | AdminExtremeNord2026! | ADM-04-EXTREME-NORD |
| Littoral | admin.littoral@example.com | AdminLittoral2026! | ADM-05-LITTORAL |
| Nord | admin.nord@example.com | AdminNord2026! | ADM-06-NORD |
| Nord-Ouest | admin.nord-ouest@example.com | AdminNordOuest2026! | ADM-07-NORD-OUEST |
| Ouest | admin.ouest@example.com | AdminOuest2026! | ADM-08-OUEST |
| Sud | admin.sud@example.com | AdminSud2026! | ADM-09-SUD |
| Sud-Ouest | admin.sud-ouest@example.com | AdminSudOuest2026! | ADM-10-SUD-OUEST |

### Admins DECC

| Région | Email | Mot de passe | Matricule |
| --- | --- | --- | --- |
| Adamaoua | admin.decc.adamaoua@example.com | DeccAdamaoua2026! | DECC-01-ADAMAOUA |
| Centre | admin.decc.centre@example.com | DeccCentre2026! | DECC-02-CENTRE |
| Est | admin.decc.est@example.com | DeccEst2026! | DECC-03-EST |
| Extreme-Nord | admin.decc.extreme-nord@example.com | DeccExtremeNord2026! | DECC-04-EXTREME-NORD |
| Littoral | admin.decc.littoral@example.com | DeccLittoral2026! | DECC-05-LITTORAL |
| Nord | admin.decc.nord@example.com | DeccNord2026! | DECC-06-NORD |
| Nord-Ouest | admin.decc.nord-ouest@example.com | DeccNordOuest2026! | DECC-07-NORD-OUEST |
| Ouest | admin.decc.ouest@example.com | DeccOuest2026! | DECC-08-OUEST |
| Sud | admin.decc.sud@example.com | DeccSud2026! | DECC-09-SUD |
| Sud-Ouest | admin.decc.sud-ouest@example.com | DeccSudOuest2026! | DECC-10-SUD-OUEST |

### Agents centre d'examen

| Région | Email | Matricule |
| --- | --- | --- |
| Adamaoua | agent.centre.adamaoua@example.com | AGENT-CE-01-ADAMAOUA |
| Centre | agent.centre.centre@example.com | AGENT-CE-02-CENTRE |
| Est | agent.centre.est@example.com | AGENT-CE-03-EST |
| Extreme-Nord | agent.centre.extreme-nord@example.com | AGENT-CE-04-EXTREME-NORD |
| Littoral | agent.centre.littoral@example.com | AGENT-CE-05-LITTORAL |
| Nord | agent.centre.nord@example.com | AGENT-CE-06-NORD |
| Nord-Ouest | agent.centre.nord-ouest@example.com | AGENT-CE-07-NORD-OUEST |
| Ouest | agent.centre.ouest@example.com | AGENT-CE-08-OUEST |
| Sud | agent.centre.sud@example.com | AGENT-CE-09-SUD |
| Sud-Ouest | agent.centre.sud-ouest@example.com | AGENT-CE-10-SUD-OUEST |

---

## 9. Pages utiles

| Page | URL |
| --- | --- |
| Accueil + QR consultation | `/` |
| Consultation matricule | `/consultation` |
| Admin | `/admin` |
| Élèves + imports | `/admin/students` |
| Documents | `/admin/documents` |
| Agent centre | `/centre-examen` |
| Activation élève | `/auth/register` |

---

## 10. Rappels métier

- **Import B** : crée des élèves → documents toujours **Pas disponible**.
- **Import A** : élève + document doivent exister → passe à **Disponible** + notification.
- **Duplicatas** : exclus de l’Import A.
- **Probatoire** : pas de diplôme original.
- **Consultation publique** : matricule seul, pas de création de compte.

---

## 11. Dépannage

| Problème | Cause probable |
| --- | --- |
| Import A : élève introuvable | Matricule absent de la BD (utiliser DEMO202600x ou `npm run export:disponibilisation-csv`) |
| Import A : document introuvable | Importer d’abord `import-documents-eleves-demo-existants.csv` |
| Import A : hors périmètre | Admin connecté sur une autre région |
| Matricule inconnu à l'import | Utiliser un matricule présent en base (`DEMO202600x`) ou exporter via `npm run export:disponibilisation-csv` |
| Connexion admin échoue | Prisma / `DATABASE_URL` inaccessible |
| Élève ne s’active pas | Matricule ou email incorrect vs base |

Référence complète : `docs/connexions-tests-completes.md`

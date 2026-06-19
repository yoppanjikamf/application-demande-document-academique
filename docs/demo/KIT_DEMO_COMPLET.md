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

**Région unique pour la demo :** tous les élèves utilisent le format **`DEMO202600x`** (ex. `DEMO2026002` pour Faïssa). Connectez-vous avec **ADM-02-CENTRE** (OBC), **DECC-02-CENTRE** (DECC) ou **AGENT-CE-02-CENTRE** (agent centre).

---

## 2. Syntaxe des matricules (implémentée dans le projet)

| Profil | Format | Exemple |
| --- | --- | --- |
| Élève seed / existant | `DEMO2026` + 3 chiffres | `DEMO2026002` |
| Nouvel élève import CSV | `DEMO2026` + 3 chiffres | `DEMO2026006` |
| Élève seed soutenance | `DEMO2026` + 3 chiffres | `DEMO2026001` |
| Admin OBC | `ADM-NN-REGION` | `ADM-02-CENTRE` |
| Admin DECC | `DECC-NN-REGION` | `DECC-02-CENTRE` |
| Agent centre | `AGENT-CE-NN-REGION` | `AGENT-CE-02-CENTRE` |

Emails nouveaux élèves fictifs : `demo2026006@example.com`, `demo2026009@example.com`.

---

## 3. Fichiers CSV fournis

**Emplacement :** `docs/csv-demo/{region}/{obc|decc}/` — voir [`docs/csv-demo/README.md`](../csv-demo/README.md).

| Organisme | Import élèves | Import disponibilisation |
| --- | --- | --- |
| OBC (Centre) | `centre/obc/import-eleves-probatoire-bac.csv` | `centre/obc/import-disponibilisation-probatoire-bac.csv` |
| DECC (Centre) | `centre/decc/import-eleves-bepc.csv` | `centre/decc/import-disponibilisation-bepc.csv` |

Modèles UI (selon organisme connecté) : `public/templates/obc/` et `public/templates/decc/`.

Régénération : `npm run generate:demo-csv`

---

## 4. Ordre de test recommandé (seed soutenance DEMO)

### Étape 1 — Disponibilisation (une étape par organisme)

Après `seed:soutenance-eleves`, les élèves **DEMO2026001**–**005** existent sans document.

**Admin OBC Centre** (`ADM-02-CENTRE`) :

1. `/admin/students` → importer `docs/csv-demo/centre/obc/import-disponibilisation-probatoire-bac.csv`
2. Vérifier : relevé Probatoire **DEMO2026002** → Disponible (parcours RDV Faïssa).

**Admin DECC Centre** (`DECC-02-CENTRE`) :

1. Importer `docs/csv-demo/centre/decc/import-disponibilisation-bepc.csv`
2. Vérifier : documents BEPC Disponibles pour les DEMO concernés.

### Étape 2 — Import élèves (nouveaux matricules DEMO)

1. OBC : `docs/csv-demo/centre/obc/import-eleves-probatoire-bac.csv` → **DEMO2026006**–**008**
2. DECC : `docs/csv-demo/centre/decc/import-eleves-bepc.csv` → **DEMO2026009**–**011**
3. Puis réimporter les CSV de disponibilisation pour activer les lignes **DEMO2026006+**.

### Étape 3 — Disponibiliser les nouveaux DEMO2026006+

Après l’import élèves, réimporter les CSV de disponibilisation (les lignes **DEMO2026006+** sont déjà incluses).

### Étape 4 — Consultation publique

- URL : `/consultation`
- Matricules : `DEMO2026002`, `DEMO2026006`, etc.

### Étape 5 — Activation élève

- `/auth/register` avec `DEMO2026002` + `faissayoppanjikam@gmail.com` (ou `DEMO2026006` + `demo2026006@example.com`).

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

### Nouveaux élèves OBC (après import `import-eleves-probatoire-bac.csv`)

| Matricule | Email | Nom | Examen | Région |
| --- | --- | --- | --- | --- |
| DEMO2026006 | demo2026006@example.com | Marie TCHOUA | Probatoire + Bac 2025 | Centre |
| DEMO2026007 | demo2026007@example.com | Yannick FOTSING | Probatoire 2025 | Centre |
| DEMO2026008 | demo2026008@example.com | Carine NANA | Bac 2025 | Centre |

### Nouveaux élèves DECC (après import `import-eleves-bepc.csv`)

| Matricule | Email | Nom | Examen | Région |
| --- | --- | --- | --- | --- |
| DEMO2026009 | demo2026009@example.com | Judith EBOGO | BEPC 2025 | Centre |
| DEMO2026010 | demo2026010@example.com | Patrick MENGUE | BEPC 2025 | Centre |
| DEMO2026011 | demo2026011@example.com | Berthe ONGA | BEPC 2025 | Centre |

Tous les élèves demo sont en **région Centre** (centre d'examen : Centre d'examen Centre). Comptes admin recommandés pour les tests : **ADM-02-CENTRE**, **DECC-02-CENTRE**, **AGENT-CE-02-CENTRE**.

Mot de passe élève : créer via `/auth/register`.

---

## 6. Détail CSV disponibilisation (DEMO + nouveaux élèves)

**OBC** (`centre/obc/import-disponibilisation-probatoire-bac.csv`) — sessions alignées sur le seed (Probatoire 2021, Bac 2022) :

| Matricule | Diplôme | Document | Session |
| --- | --- | --- | --- |
| DEMO2026001 | PROBATOIRE | RELEVE_NOTES | 2021 |
| DEMO2026001 | BACCALAUREAT | RELEVE_NOTES | 2022 |
| DEMO2026002 | PROBATOIRE | RELEVE_NOTES | 2021 |
| DEMO2026003 | BACCALAUREAT | RELEVE_NOTES | 2022 |
| DEMO2026003 | BACCALAUREAT | ORIGINAL | 2022 |
| DEMO2026004 | PROBATOIRE | RELEVE_NOTES | 2021 |
| DEMO2026005 | BACCALAUREAT | RELEVE_NOTES | 2022 |
| DEMO2026005 | BACCALAUREAT | ORIGINAL | 2022 |
| DEMO2026006 | PROBATOIRE | RELEVE_NOTES | 2025 |
| DEMO2026007 | PROBATOIRE | RELEVE_NOTES | 2025 |
| DEMO2026008 | BACCALAUREAT | ORIGINAL | 2025 |
| DEMO2026008 | BACCALAUREAT | RELEVE_NOTES | 2025 |

**DECC** (`centre/decc/import-disponibilisation-bepc.csv`) — BEPC session 2019 pour le seed :

| Matricule | Diplôme | Document | Session |
| --- | --- | --- | --- |
| DEMO2026001 | BEPC | ORIGINAL | 2019 |
| DEMO2026001 | BEPC | RELEVE_NOTES | 2019 |
| DEMO2026002 | BEPC | RELEVE_NOTES | 2019 |
| DEMO2026003 | BEPC | ORIGINAL | 2019 |
| DEMO2026004 | BEPC | ORIGINAL | 2019 |
| DEMO2026004 | BEPC | RELEVE_NOTES | 2019 |
| DEMO2026005 | BEPC | RELEVE_NOTES | 2019 |
| DEMO2026009 | BEPC | ORIGINAL | 2025 |
| DEMO2026009 | BEPC | RELEVE_NOTES | 2025 |
| DEMO2026010 | BEPC | RELEVE_NOTES | 2025 |
| DEMO2026011 | BEPC | ORIGINAL | 2025 |

> Les lignes **DEMO2026001**–**005** fonctionnent dès `seed:soutenance-eleves`. Les lignes **DEMO2026006+** nécessitent l’import élèves avant.

---

## 7. Détail CSV import élèves — DEMO2026006+ (OBC) / DEMO2026009+ (DECC)

Syntaxe matricule : **`DEMO2026` + 3 chiffres** (même format que `DEMO2026002`).  
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
| Import A : document introuvable | Vérifier que l'élève existe (`seed:soutenance-eleves`) puis réimporter `docs/csv-demo/centre/*/import-disponibilisation-*.csv` |
| Import A : hors périmètre | Admin connecté sur une autre région |
| Matricule inconnu à l'import | Utiliser un matricule présent en base (`DEMO202600x`) ou exporter via `npm run export:disponibilisation-csv` |
| Connexion admin échoue | Prisma / `DATABASE_URL` inaccessible |
| Élève ne s’active pas | Matricule ou email incorrect vs base |

Référence complète : `docs/connexions-tests-completes.md`

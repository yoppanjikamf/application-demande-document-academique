# Connexions de test completes

Fichier central pour tester les connexions DR-DOCSCOL. Les comptes administrateurs et agents ont deja un mot de passe. Les eleves doivent creer leur mot de passe lors de l'activation du compte.

Derniere verification documentaire: 17/06/2026.

## Etat de validation

- Les comptes Supabase Auth des admins OBC / DECC et des agents peuvent etre seedees avec les scripts du projet.
- Le compte DECC Adamaoua a ete verifie dans Supabase Auth: email, mot de passe, role, organisme et antenne sont corrects.
- Si une connexion admin renvoie une erreur serveur alors que les identifiants sont corrects, verifier la connexion Postgres Prisma / Supavisor avant de changer le mot de passe.
- Les eleves de test doivent activer leur compte via `/auth/register` avant de se connecter.

## Pages de connexion

| Profil                | Page                      | Regle                                          |
| --------------------- | ------------------------- | ---------------------------------------------- |
| Eleve                 | /auth/login               | Connexion apres activation du compte           |
| Activation eleve      | /auth/register            | Creation du mot de passe eleve                 |
| Admin OBC             | /auth/login/obc           | Bac, Probatoire et releves OBC selon la region |
| Admin DECC            | /auth/login/decc          | BEPC selon la region                           |
| Agent Centre d'Examen | /auth/login/centre-examen | Rendez-vous de retrait du centre rattache      |

## Commandes de seed recommandees

Jeu de donnees **demo / soutenance** (5 eleves — celui present en base apres seed soutenance) :

```bash
npm run seed:regional-admins
npm run seed:decc-admins
npm run seed:centre-agents
npm run seed:soutenance-eleves
```

## Rappel infrastructure

L'application a besoin de Supabase Auth et de Postgres via Prisma.

- Supabase Auth peut accepter un mot de passe meme si Postgres est inaccessible.
- L'application a ensuite besoin de Prisma pour charger le profil applicatif `User`.
- Si Prisma ne joint pas `DATABASE_URL`, la connexion echoue avec une erreur serveur.

## Regles duplicata de test

- Frais duplicata relevé: 10 000 FCFA.
- Frais duplicata original: 15 000 FCFA.
- Justificatifs obligatoires duplicata (4 pieces) : declaration de perte, CNI, demande adressee au DG OBC, decharge bordereau de reussite.
- Les duplicatas BEPC sont retires exclusivement a l'antenne regionale DECC competente.
- Les duplicatas ne sont pas traites par l'Agent Centre d'Examen.

## Admins OBC regionaux

| Region       | Email                          | Mot de passe          | Matricule           | Antenne              | Connexion       |
| ------------ | ------------------------------ | --------------------- | ------------------- | -------------------- | --------------- |
| Adamaoua     | admin.adamaoua@example.com     | AdminAdamaoua2026!    | ADM-01-ADAMAOUA     | antenne-adamaoua     | /auth/login/obc |
| Centre       | admin.centre@example.com       | AdminCentre2026!      | ADM-02-CENTRE       | antenne-centre       | /auth/login/obc |
| Est          | admin.est@example.com          | AdminEst2026!         | ADM-03-EST          | antenne-est          | /auth/login/obc |
| Extreme-Nord | admin.extreme-nord@example.com | AdminExtremeNord2026! | ADM-04-EXTREME-NORD | antenne-extreme-nord | /auth/login/obc |
| Littoral     | admin.littoral@example.com     | AdminLittoral2026!    | ADM-05-LITTORAL     | antenne-littoral     | /auth/login/obc |
| Nord         | admin.nord@example.com         | AdminNord2026!        | ADM-06-NORD         | antenne-nord         | /auth/login/obc |
| Nord-Ouest   | admin.nord-ouest@example.com   | AdminNordOuest2026!   | ADM-07-NORD-OUEST   | antenne-nord-ouest   | /auth/login/obc |
| Ouest        | admin.ouest@example.com        | AdminOuest2026!       | ADM-08-OUEST        | antenne-ouest        | /auth/login/obc |
| Sud          | admin.sud@example.com          | AdminSud2026!         | ADM-09-SUD          | antenne-sud          | /auth/login/obc |
| Sud-Ouest    | admin.sud-ouest@example.com    | AdminSudOuest2026!    | ADM-10-SUD-OUEST    | antenne-sud-ouest    | /auth/login/obc |

## Admins DECC regionaux

| Region       | Email                               | Mot de passe         | Matricule            | Antenne                   | Connexion        |
| ------------ | ----------------------------------- | -------------------- | -------------------- | ------------------------- | ---------------- |
| Adamaoua     | admin.decc.adamaoua@example.com     | DeccAdamaoua2026!    | DECC-01-ADAMAOUA     | antenne-decc-adamaoua     | /auth/login/decc |
| Centre       | admin.decc.centre@example.com       | DeccCentre2026!      | DECC-02-CENTRE       | antenne-decc-centre       | /auth/login/decc |
| Est          | admin.decc.est@example.com          | DeccEst2026!         | DECC-03-EST          | antenne-decc-est          | /auth/login/decc |
| Extreme-Nord | admin.decc.extreme-nord@example.com | DeccExtremeNord2026! | DECC-04-EXTREME-NORD | antenne-decc-extreme-nord | /auth/login/decc |
| Littoral     | admin.decc.littoral@example.com     | DeccLittoral2026!    | DECC-05-LITTORAL     | antenne-decc-littoral     | /auth/login/decc |
| Nord         | admin.decc.nord@example.com         | DeccNord2026!        | DECC-06-NORD         | antenne-decc-nord         | /auth/login/decc |
| Nord-Ouest   | admin.decc.nord-ouest@example.com   | DeccNordOuest2026!   | DECC-07-NORD-OUEST   | antenne-decc-nord-ouest   | /auth/login/decc |
| Ouest        | admin.decc.ouest@example.com        | DeccOuest2026!       | DECC-08-OUEST        | antenne-decc-ouest        | /auth/login/decc |
| Sud          | admin.decc.sud@example.com          | DeccSud2026!         | DECC-09-SUD          | antenne-decc-sud          | /auth/login/decc |
| Sud-Ouest    | admin.decc.sud-ouest@example.com    | DeccSudOuest2026!    | DECC-10-SUD-OUEST    | antenne-decc-sud-ouest    | /auth/login/decc |

## Agents Centres d'Examen

| Region       | Centre                       | Email                                 | Mot de passe     | Matricule                | Connexion                 |
| ------------ | ---------------------------- | ------------------------------------- | ---------------- | ------------------------ | ------------------------- |
| Adamaoua     | Centre d'examen Adamaoua     | agent.centre.adamaoua@example.com     | AgentCentre2026! | AGENT-CE-01-ADAMAOUA     | /auth/login/centre-examen |
| Centre       | Centre d'examen Centre       | agent.centre.centre@example.com       | AgentCentre2026! | AGENT-CE-02-CENTRE       | /auth/login/centre-examen |
| Est          | Centre d'examen Est          | agent.centre.est@example.com          | AgentCentre2026! | AGENT-CE-03-EST          | /auth/login/centre-examen |
| Extreme-Nord | Centre d'examen Extreme-Nord | agent.centre.extreme-nord@example.com | AgentCentre2026! | AGENT-CE-04-EXTREME-NORD | /auth/login/centre-examen |
| Littoral     | Centre d'examen Littoral     | agent.centre.littoral@example.com     | AgentCentre2026! | AGENT-CE-05-LITTORAL     | /auth/login/centre-examen |
| Nord         | Centre d'examen Nord         | agent.centre.nord@example.com         | AgentCentre2026! | AGENT-CE-06-NORD         | /auth/login/centre-examen |
| Nord-Ouest   | Centre d'examen Nord-Ouest   | agent.centre.nord-ouest@example.com   | AgentCentre2026! | AGENT-CE-07-NORD-OUEST   | /auth/login/centre-examen |
| Ouest        | Centre d'examen Ouest        | agent.centre.ouest@example.com        | AgentCentre2026! | AGENT-CE-08-OUEST        | /auth/login/centre-examen |
| Sud          | Centre d'examen Sud          | agent.centre.sud@example.com          | AgentCentre2026! | AGENT-CE-09-SUD          | /auth/login/centre-examen |
| Sud-Ouest    | Centre d'examen Sud-Ouest    | agent.centre.sud-ouest@example.com    | AgentCentre2026! | AGENT-CE-10-SUD-OUEST    | /auth/login/centre-examen |

## Eleves demo en base (seed soutenance)

Liste verifiee le 05/06/2026 depuis la base Postgres (`DATABASE_URL`). **5 eleves** — dont **Anicet MBIANKEU** (`DEMO2026004`).

Le mot de passe n'est pas seede : aller sur `/auth/register`, saisir le matricule et l'email, puis creer le mot de passe.

Source CSV : `docs/test-data-soutenance-eleves.csv`

| Matricule   | Email                                 | Nom     | Prenom   | Date naiss. | Centre examen            | Region | Examens composes                                | Docs en BD | Activation     |
| ----------- | ------------------------------------- | ------- | -------- | ----------- | ------------------------ | ------ | ----------------------------------------------- | ---------- | -------------- |
| DEMO2026001 | francialengambia@gmail.com            | NGAMBIA | Françial | 2003-02-14  | Centre d'examen Centre   | Centre | BEPC 2019 / Probatoire 2021 / Baccalaureat 2022 | 0          | /auth/register |
| DEMO2026002 | faissayoppanjikam@gmail.com           | NJIKAM  | Faïssa   | 2004-05-20  | Centre d'examen Centre   | Centre | BEPC 2019 / Probatoire 2021 / Baccalaureat 2022 | 0*         | /auth/register |
| DEMO2026003 | eyaanemesselehelenedoucette@gmail.com | MESSELE | Doucette | 2003-09-08  | Centre d'examen Centre   | Centre | BEPC 2019 / Probatoire 2021 / Baccalaureat 2022 | 0          | /auth/register |
| DEMO2026004 | ambiankeu@gmail.com                   | MBIANKEU| Anicet   | 2002-11-27  | Centre d'examen Centre   | Centre | BEPC 2019 / Probatoire 2021 / Baccalaureat 2022 | 0          | /auth/register |
| DEMO2026005 | prince.mabengue@facsciences-uy1.cm    | MABENGUE| Prince   | 2003-07-03  | Centre d'examen Centre   | Centre | BEPC 2019 / Probatoire 2021 / Baccalaureat 2022 | 0          | /auth/register |

> *Colonne « Docs en BD » : **0 apres `seed:soutenance-eleves` seul**. Les chiffres > 0 indiquent une base deja importee (Import B). Appliquer `import-documents-eleves-demo-existants.csv` puis `import-disponibilisation-session-2024.csv` pour la demo complete.

## Eleves demo import CSV (kit demo — optionnel)

Ces matricules **n'existent pas** tant que vous n'avez pas importe `docs/import-nouveaux-eleves-demo-2025.csv` depuis l'admin (Import B nouveaux eleves).

| Matricule | Email                 | Nom    | Prenom  | Region   | Statut initial apres import |
| --------- | --------------------- | ------ | ------- | -------- | --------------------------- |
| ELEVE9001 | eleve9001@example.com | NGONO  | Claire  | Centre | PAS_DISPONIBLE              |
| ELEVE9002 | eleve9002@example.com | FOUDA  | Samuel  | Centre | PAS_DISPONIBLE              |
| ELEVE9003 | eleve9003@example.com | MBALLA | Estelle | Centre | PAS_DISPONIBLE              |
| ELEVE9004 | eleve9004@example.com | NJOCK  | Brice   | Centre | PAS_DISPONIBLE              |
| ELEVE9005 | eleve9005@example.com | KAMGA  | Thierry | Centre | PAS_DISPONIBLE              |

> Tous les eleves demo (DEMO + ELEVE900x) sont en **region Centre**. Pour les tests admin, utiliser **ADM-02-CENTRE** (OBC), **DECC-02-CENTRE** (DECC) et **AGENT-CE-02-CENTRE** (centre d'examen).

## Consultation publique (sans connexion)

- Page : `/consultation`
- Saisir un matricule existant en base (ex. `DEMO2026001` apres disponibilisation)

## Kit demo complet

Pour une demonstration pas a pas (imports CSV, consultation, parcours par role) :

- Guide : `docs/demo/KIT_DEMO_COMPLET.pdf`
- CSV : dossier `docs/` (fichiers `import-*.csv` et `test-data-soutenance-eleves.csv`)

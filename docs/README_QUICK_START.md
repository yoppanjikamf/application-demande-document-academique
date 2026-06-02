# TL;DR - Etat actuel du MVP DR-DOCSCOL

Derniere mise a jour: 02/06/2026.

## Ce qui est fait

Le projet contient:

- 25 pages UI.
- 37 route handlers `route.ts`.
- 4 fichiers de Server Actions.
- 3 roles applicatifs: `ELEVE`, `ADMINISTRATEUR`, `AGENT_CENTRE_EXAMEN`.
- 10 admins OBC regionaux.
- 10 admins DECC regionaux.
- 10 agents centres d'examen.
- 1000 eleves de test.

## Quick start

### 1. Verifier les variables

Variables minimales:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `INTERNAL_API_SECRET`

### 2. Verifier Postgres

```bash
set -a; source .env; set +a
psql "$DATABASE_URL" -c 'select now();'
```

Si cette commande timeout, le login applicatif peut echouer meme si Supabase Auth accepte le mot de passe.

### 3. Generer et migrer

```bash
npm run db:generate
npm run db:migrate
```

### 4. Seeder les donnees de test

```bash
npm run seed:regional-admins
npm run seed:decc-admins
npm run seed:centre-agents
npm run seed:1000-eleves
```

### 5. Demarrer

```bash
npm run dev
```

Serveur attendu: `http://localhost:3000`.

### 6. Tester une connexion admin DECC

- Page: `/auth/login/decc`
- Matricule: `DECC-01-ADAMAOUA`
- Email: `admin.decc.adamaoua@example.com`
- Mot de passe: `DeccAdamaoua2026!`

## Routes majeures

| Domaine | Routes |
| --- | --- |
| Auth | `/api/auth/register`, `/api/auth/login`, `/api/auth/logout`, `/api/auth/me`, reset password |
| Eleve | `/api/students/me/documents`, rendez-vous, paiements, recus, notifications |
| Admin | dashboard stats, documents, students, payments, withdrawals, audit logs |
| Centre examen | liste RDV et confirmation de retrait |
| Interne | dispatch notifications, rappel 30 jours, webhook paiement |

## Etat production

Pret pour demonstration et soutenance.

Pas encore production complete tant que:

- Prisma/Postgres Supabase n'est pas stable;
- le paiement externe n'est pas branche;
- les justificatifs duplicata ne sont pas stockes dans un stockage fichier.

Voir `ETAT_FINAL_PROJET.md`.

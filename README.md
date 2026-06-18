# DR-DOCSCOL

Application web de gestion des **demandes et retraits de documents scolaires** (BEPC, Probatoire, Baccalauréat) pour les organismes **OBC** et **DECC**, les **élèves** et les **agents de centre d'examen**.

Stack : **Next.js 15** (App Router) · **Supabase Auth** · **Prisma** · **PostgreSQL** · **Tailwind** · **shadcn/ui**

## Démarrage rapide

```bash
npm install
cp .env.template .env   # renseigner Supabase + DATABASE_URL
npm run db:generate
npm run db:migrate
npm run seed:soutenance-eleves
npm run dev
```

Ouvrir [http://localhost:3000](http://localhost:3000).

Variables minimales : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `DATABASE_URL`, `DIRECT_URL`, `INTERNAL_API_SECRET`.

Guide détaillé : [`docs/README_QUICK_START.md`](docs/README_QUICK_START.md).

## Rôles et parcours

| Rôle | Connexion | Espace |
|------|-----------|--------|
| Élève | `/auth/login` · activation `/auth/register` | `/dashboard` |
| Admin OBC | `/auth/login/obc` | `/admin` |
| Admin DECC | `/auth/login/decc` | `/admin` |
| Agent centre d'examen | `/auth/login/centre-examen` | `/centre-examen` |

Consultation publique (sans compte) : `/consultation` (matricule).

## Scripts utiles

| Commande | Usage |
|----------|--------|
| `npm run seed:soutenance-eleves` | 5 élèves démo `DEMO2026001`–`005` (région Centre) |
| `npm run seed:regional-admins` | Admins OBC régionaux |
| `npm run seed:decc-admins` | Admins DECC régionaux |
| `npm run seed:centre-agents` | Agents centres d'examen |
| `npm run generate:demo-csv` | Régénère les CSV par région OBC/DECC |
| `npm run export:disponibilisation-csv` | Export CSV disponibilisation depuis la base |
| `npm run lint` · `npm run build` | Qualité et build |

## Données démo (CSV)

Fichiers **par région et organisme** : [`docs/csv-demo/README.md`](docs/csv-demo/README.md)

Exemple région **Centre** :

- OBC : `docs/csv-demo/centre/obc/import-disponibilisation-probatoire-bac.csv`
- DECC : `docs/csv-demo/centre/decc/import-disponibilisation-bepc.csv`

Identifiants de test : [`docs/connexions-tests-completes.md`](docs/connexions-tests-completes.md).

## Documentation

Index complet : [`docs/README.md`](docs/README.md).

| Document | Contenu |
|----------|---------|
| [`docs/ETAT_FINAL_PROJET.md`](docs/ETAT_FINAL_PROJET.md) | État du projet, limites connues |
| [`docs/GUIDE_TEST_FONCTIONNEL.md`](docs/GUIDE_TEST_FONCTIONNEL.md) | Tests manuels |
| [`docs/demo/KIT_DEMO_COMPLET.md`](docs/demo/KIT_DEMO_COMPLET.md) | Scénario de démonstration |
| [`docs/routes-implementees.md`](docs/routes-implementees.md) | Pages, API, Server Actions |

## Déploiement

**Vercel** : variables d'environnement Supabase + `DATABASE_URL` + `DIRECT_URL`. Build : `npm run vercel-build`.

**Docker** : `docker build -t dr-docscol .` puis `docker run -p 3000:3000 --env-file .env dr-docscol`.

## État du projet

Prêt pour **soutenance et démo encadrée**. Trois points restent ouverts avant une production réelle : connectivité Prisma/Supabase stable, paiement Mobile Money réel, stockage durable des pièces duplicata.

Voir [`docs/ETAT_FINAL_PROJET.md`](docs/ETAT_FINAL_PROJET.md).

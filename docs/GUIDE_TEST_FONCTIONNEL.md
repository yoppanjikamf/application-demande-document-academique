# Guide de test fonctionnel DR-DOCSCOL

Derniere mise a jour: 02/06/2026.

Ce guide couvre les parcours complets eleve, admin OBC, admin DECC et agent centre d'examen.

## 1. Pre-requis

```bash
npm run db:generate
npm run db:migrate
npm run seed:regional-admins
npm run seed:decc-admins
npm run seed:centre-agents
npm run seed:1000-eleves
npm run dev
```

Verifier Postgres:

```bash
set -a; source .env; set +a
psql "$DATABASE_URL" -c 'select now();'
```

## 2. Test eleve

1. Aller sur `/auth/register`.
2. Activer un eleve reel, par exemple:
   - Matricule: `ELEVE0001`
   - Email: `faissayoppanjikam@gmail.com`
3. Creer un mot de passe.
4. Aller sur `/dashboard`.
5. Verifier:
   - statistiques;
   - documents;
   - notifications;
   - paiements;
   - rendez-vous.
6. Aller sur `/dashboard/documents`.
7. Choisir un examen compose.
8. Tester releve, original et duplicata selon les regles.

## 3. Test admin OBC

1. Aller sur `/auth/login/obc`.
2. Utiliser:
   - Matricule: `ADM-02-CENTRE`
   - Email: `admin.centre@example.com`
   - Mot de passe: `AdminCentre2026!`
3. Verifier `/admin`.
4. Verifier `/admin/documents`.
5. Passer un document a `DISPONIBLE`.
6. Verifier notification et email si SMTP est configure.
7. Verifier `/admin/appointments`.
8. Verifier `/admin/rdv-disponibilites`.
9. Verifier `/admin/payments`.
10. Verifier `/admin/audit-logs`.

## 4. Test admin DECC

1. Aller sur `/auth/login/decc`.
2. Utiliser:
   - Matricule: `DECC-01-ADAMAOUA`
   - Email: `admin.decc.adamaoua@example.com`
   - Mot de passe: `DeccAdamaoua2026!`
3. Verifier `/admin`.
4. Verifier que seuls les documents DECC Adamaoua sont visibles.
5. Verifier que les documents BEPC sont presents dans le scope.
6. Verifier qu'un admin DECC est redirige hors de:
   - `/admin/appointments`
   - `/admin/rdv-disponibilites`

## 5. Test agent centre d'examen

1. Aller sur `/auth/login/centre-examen`.
2. Utiliser:
   - Matricule: `AGENT-CE-02-CENTRE`
   - Email: `agent.centre.centre@example.com`
   - Mot de passe: `AgentCentre2026!`
3. Verifier `/centre-examen`.
4. Tester les filtres:
   - Aujourd'hui;
   - A venir;
   - Deja traites.
5. Confirmer un retrait.
6. Verifier que le document passe a `RETIRE`.

## 6. Test import CSV

1. Se connecter avec un admin du bon scope.
2. Aller sur `/admin/import`.
3. Importer `docs/test-data-eleves.csv`.
4. Verifier que les documents hors scope sont refuses si l'admin n'est pas responsable.
5. Verifier les documents importes dans `/admin/documents`.

## 7. Test routes internes

Utiliser `INTERNAL_API_SECRET`.

```bash
curl -X POST http://localhost:3000/api/internal/notifications/reminder-30days \
  -H "Authorization: Bearer YOUR_INTERNAL_SECRET"
```

```bash
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Authorization: Bearer YOUR_INTERNAL_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"paymentId":"PAYMENT_ID","statut":"EFFECTUE","numeroRecu":"REC-TEST","montant":25000}'
```

## 8. Erreurs connues a diagnostiquer

### Connexion admin avec mot de passe correct mais erreur serveur

Cause probable: Prisma ne joint pas Postgres Supabase.

Verifier:

```bash
set -a; source .env; set +a
psql "$DATABASE_URL" -c 'select now();'
```

Si la commande timeout, corriger `DATABASE_URL`, le pooler Supabase ou l'etat du projet Supabase.

### Paiement reel absent

Normal dans le MVP: le paiement externe n'est pas encore branche.

### Justificatif non stocke en fichier

Normal dans le MVP: le formulaire exige le fichier, mais le stockage Supabase Storage reste a faire pour la production.

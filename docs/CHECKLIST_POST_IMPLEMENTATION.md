# Checklist finale DR-DOCSCOL

Derniere mise a jour: 02/06/2026.

## 1. Infrastructure

- [ ] `DATABASE_URL` charge et accessible.
- [ ] `DIRECT_URL` charge et accessible.
- [ ] Supabase Auth accessible.
- [ ] `SUPABASE_SERVICE_ROLE_KEY` configuree et non exposee cote client.
- [ ] `NEXT_PUBLIC_SUPABASE_URL` configuree.
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` configuree.
- [ ] `INTERNAL_API_SECRET` configure.
- [ ] SMTP configure si les emails doivent partir.

Commande de controle:

```bash
set -a; source .env; set +a
psql "$DATABASE_URL" -c 'select now();'
```

## 2. Build et schema

- [ ] `npm run db:generate`
- [ ] `npm run db:migrate`
- [ ] `npm run build`

## 3. Seeds

- [ ] `npm run seed:regional-admins`
- [ ] `npm run seed:decc-admins`
- [ ] `npm run seed:centre-agents`
- [ ] `npm run seed:1000-eleves`

## 4. Tests de connexion

- [ ] Eleve active son compte via `/auth/register`.
- [ ] Eleve se connecte via `/auth/login`.
- [ ] Admin OBC se connecte via `/auth/login/obc`.
- [ ] Admin DECC se connecte via `/auth/login/decc`.
- [ ] Agent centre d'examen se connecte via `/auth/login/centre-examen`.
- [ ] Mauvais organisme bloque correctement: admin OBC refuse sur `/auth/login/decc`, admin DECC refuse sur `/auth/login/obc`.

## 5. Tests eleve

- [ ] Dashboard eleve charge.
- [ ] Documents generes depuis les examens valides.
- [ ] Demande de releve fonctionne.
- [ ] Demande de duplicata exige justificatif.
- [ ] Paiement duplicata cree un recu.
- [ ] Recu consultable et telechargeable.
- [ ] RDV possible uniquement pour document disponible et route necessitant RDV.
- [ ] Annulation RDV fonctionne.
- [ ] Export `.ics` fonctionne.

## 6. Tests admin OBC

- [ ] Dashboard `/admin` charge avec scope OBC.
- [ ] Documents visibles uniquement pour l'antenne.
- [ ] Statut document modifiable.
- [ ] Notifications creees lors du passage a `DISPONIBLE` ou `RETIRE`.
- [ ] Paiements visibles uniquement dans le scope.
- [ ] Import CSV refuse les documents hors scope.
- [ ] `/admin/appointments` accessible.
- [ ] `/admin/rdv-disponibilites` accessible.

## 7. Tests admin DECC

- [ ] Dashboard `/admin` charge avec scope DECC.
- [ ] Documents BEPC visibles uniquement pour l'antenne DECC.
- [ ] Duplicatas BEPC visibles dans le scope.
- [ ] Statut document modifiable.
- [ ] `/admin/appointments` redirige vers `/admin`.
- [ ] `/admin/rdv-disponibilites` redirige vers `/admin`.

## 8. Tests agent centre d'examen

- [ ] Liste RDV du jour.
- [ ] Liste RDV a venir.
- [ ] Liste deja traites.
- [ ] Confirmation retrait passe le RDV a `HONORE`.
- [ ] Confirmation retrait passe le document a `RETIRE`.
- [ ] Agent ne voit pas les duplicatas.

## 9. Tests internes

- [ ] `/api/internal/notifications/dispatch` protege par secret.
- [ ] `/api/internal/notifications/reminder-30days` protege par secret.
- [ ] `/api/payments/webhook` protege par secret.

## 10. Points a finaliser avant production

- [ ] Paiement externe Orange Money / MTN Money / carte bancaire.
- [ ] Stockage fichier des justificatifs duplicata.
- [ ] Tests automatises E2E.
- [ ] Regeneration des `.docx`.
- [ ] Verification RLS/Supabase si les tables sont exposees via Data API.

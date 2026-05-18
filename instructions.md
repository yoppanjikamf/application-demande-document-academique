# Instructions de projet

## Conventions
- Les roles utilisateurs sont ceux du schema Prisma: `ELEVE`, `ADMINISTRATEUR`.
- Les comptes admin sont crees en base et relies a Supabase Auth par script ou lors de la premiere connexion.
- Les pages de test sont dans `app/test/*` et ne doivent pas etre exposees en production.

## Auth
- Connexion eleve: via Supabase Auth.
- Connexion admin: creation/validation automatique Supabase Auth si necessaire.

## Profil
- La page `/account` permet la modification du profil utilisateur apres connexion.
- Les eleves modifient `nom`, `prenom`, `dateNaissance`.
- Les admins modifient `nom`, `prenom`, `nomService`.

## Eleves
- `/dashboard/documents` liste les documents academiques (sans date de creation).
- `/dashboard/rendezvous` affiche un calendrier (lundi-vendredi) et des creneaux fixes de 30 min.
- Les jours complets sont barres si le quota admin est atteint.

## Admin
- `/admin/rdv-disponibilites` permet de definir le quota journalier par admin.
- `/admin/import` permet d'importer un CSV de test (eleves, documents, rdv).

## CSV de test
- Colonnes attendues: `eleve_matricule`, `eleve_email`, `eleve_password`, `eleve_nom`, `eleve_prenom`, `eleve_date_naissance`, `document_type`, `document_statut`, `admin_matricule`, `rdv_date`, `rdv_heure`, `rdv_lieu`, `rdv_statut`, `rdv_commentaire`.
- Les comptes eleves sont crees dans Supabase Auth lors de l'import.

## Scripts
- Script admin: `scripts/seed-admin.ts` (variables `ADMIN_*`).
- Script eleve test: `scripts/seed-auth-test-user.ts` (variables `TEST_ELEVE_*`).

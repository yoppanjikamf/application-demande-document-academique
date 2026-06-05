# Guide API Next.js mis a jour

- Application : DR-DOCSCOL, gestion des demandes et retraits de documents scolaires
- Date de mise a jour : 02/06/2026

## 1. Positionnement

Le projet utilise Next.js App Router. La logique metier est repartie entre :

- Route Handlers dans `app/api/*` pour les endpoints HTTP ;
- Server Actions dans `app/auth/actions.ts`, `app/dashboard/actions.ts`, `app/admin/actions.ts` et `app/account/actions.ts` ;
- services partages dans `lib/*` ;
- schema relationnel dans `prisma/schema.prisma`.

Le projet expose 37 route handlers `route.ts`, dont 36 sous `/api` et 1 route applicative `/logout`. Les routes critiques du MVP sont implementees. Les limites restantes concernent surtout le paiement externe, le stockage reel des justificatifs et la stabilite de la connexion Prisma/Postgres Supabase.

## 2. Etat final court

| Domaine | Etat | Notes |
| --- | --- | --- |
| Auth eleve/admin/agent | Implemente | Supabase Auth + profil Prisma |
| Routage OBC / DECC | Implemente | BEPC vers DECC, Bac/Probatoire vers OBC |
| Dashboard eleve | Implemente | Documents, RDV, paiements, notifications |
| Admin OBC | Implemente | Documents, RDV, disponibilites, paiements, audit |
| Admin DECC | Implemente | Documents BEPC et duplicatas BEPC par region |
| Agent centre d'examen | Implemente | Consultation RDV `PLANIFIE`/`CONFIRME` et confirmation du retrait physique |
| Notifications email | Implemente | Via Nodemailer + `mail_logs` |
| Paiement externe | Partiel | Paiement applicatif + webhook, pas de prestataire reel |
| Justificatifs duplicata | Partiel | Fichier requis, stockage fichier a brancher |
| Production Supabase | A valider | Pooler Postgres / Prisma a stabiliser |

## 3. Conventions API

### 3.1 Authentification

- Les sessions sont gerees par Supabase Auth.
- Les routes protegees recuperent l'utilisateur via `getCurrentUser()`.
- Les routes API utilisent `requireApiUser()`.
- Les routes internes utilisent `INTERNAL_API_SECRET`.

### 3.2 Autorisation

| Role | Acces |
| --- | --- |
| `ELEVE` | Routes `/api/students/me/*`, dashboard eleve |
| `ADMINISTRATEUR` | Routes `/api/admin/*`, back-office OBC / DECC selon scope |
| `AGENT_CENTRE_EXAMEN` | Routes `/api/centre-examen/*`, page centre examen |
| Systeme interne | Routes `/api/internal/*` et `/api/payments/webhook` avec secret interne |

### 3.3 Reponses HTTP attendues

| Code | Signification |
| --- | --- |
| 200 | Operation reussie |
| 201 | Ressource creee |
| 202 | Traitement accepte |
| 204 | Operation reussie sans contenu |
| 400 | Donnees invalides |
| 401 | Connexion requise ou secret invalide |
| 403 | Acces refuse |
| 404 | Ressource introuvable |
| 409 | Conflit metier |
| 422 | Regle metier non respectee |
| 500 | Erreur serveur |
| 503 | Configuration manquante |

## 4. Routes implementees

### 4.1 Auth

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/auth/register` | POST | Public | Implemente | Active un eleve deja present en base |
| `/api/auth/login` | POST | Public | Implemente | Connexion matricule + email + mot de passe |
| `/api/auth/logout` | POST | Connecte | Implemente | Deconnexion Supabase |
| `/api/auth/me` | GET | Connecte | Implemente | Retourne le profil connecte |
| `/api/auth/password/forgot` | POST | Public | Implemente | Demande reset password via email |
| `/api/auth/password/reset` | POST | Public | Implemente | Finalisation reset avec token Supabase |

### 4.2 Profil

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/users/me` | PATCH | Connecte | Implemente | Appelle `updateProfileAction` |

### 4.3 Documents eleve

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/students/me/documents` | GET | Eleve | Implemente | Liste documents + statut + lieu + RDV actif |
| `/api/students/me/documents/:documentId` | GET | Eleve | Implemente | Detail document |
| `/api/students/me/documents/:documentId/instructions` | GET | Eleve | Implemente | Instructions de retrait |
| `/api/students/me/documents/:documentId/appointments` | POST | Eleve | Implemente | Reservation RDV `PLANIFIE` si document disponible et RDV requis |
| `/api/students/me/documents/:documentId/calendar-event` | POST | Eleve | Implemente | Export calendrier `.ics` |

### 4.4 Rendez-vous

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/appointments/slots` | GET | Eleve | Implemente | Liste les creneaux disponibles pour une date/document |
| `/api/students/me/appointments/:appointmentId/cancel` | PATCH | Eleve | Implemente | Annulation eleve |
| `/api/admin/appointments` | GET | Admin OBC | Via page | Planning dans `app/admin/appointments/page.tsx` |
| `/api/admin/appointments/:appointmentId/cancel` | PATCH | Admin OBC | Via Server Action | `cancelAppointmentAction` |

### 4.5 Notifications

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/students/me/notifications` | GET | Eleve | Implemente | Historique notifications |
| `/api/internal/notifications/dispatch` | POST | Systeme interne | Implemente | Envoi document disponible via secret |
| `/api/internal/notifications/reminder-30days` | POST | Systeme interne | Implemente | Rappel auto 30j avant RDV |

### 4.6 Paiements

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/students/me/payments/initiate` | POST | Eleve | Partiel | Cree paiement duplicata applicatif avec `cibleDocument` et montant attendu : 10 000 FCFA pour `RELEVE_NOTES`, 15 000 FCFA pour `ORIGINAL` |
| `/api/students/me/payments/:paymentId` | GET | Eleve | Implemente | Detail paiement + recu |
| `/api/students/me/payments/:paymentId/cancel` | PATCH | Eleve | Implemente | Annulation paiement EN_ATTENTE |
| `/api/payments/webhook` | POST | Systeme interne | Partiel | Confirmation via secret interne avec controle du montant attendu |
| `/api/admin/payments` | GET | Admin | Implemente | Suivi admin paiements |

### 4.7 Administration

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/admin/students` | GET | Admin | Implemente | Liste/recherche eleves |
| `/api/admin/students/import` | POST | Admin | Implemente | Import CSV |
| `/api/admin/documents` | GET | Admin | Implemente | Liste documents scoped |
| `/api/admin/documents/:documentId` | GET | Admin | Implemente | Detail document + RDV |
| `/api/admin/documents/:documentId/status` | PATCH | Admin | Implemente | Changement statut + audit log |
| `/api/admin/withdrawals` | GET | Admin | Implemente | Historique retraits |
| `/api/admin/withdrawals` | POST | Admin | Implemente | Enregistre retrait physique |
| `/api/admin/users/:userId/role` | PATCH | Admin | Implemente | Changement role |
| `/api/admin/dashboard/stats` | GET | Admin | Implemente | Statistiques dashboard |
| `/api/admin/audit-logs` | GET | Admin | Implemente | Journalisation actions sensibles |

### 4.8 Centre d'examen

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/centre-examen/appointments` | GET | Agent centre | Implemente | Liste les RDV `PLANIFIE`/`CONFIRME` du centre |
| `/api/centre-examen/appointments/:appointmentId/confirm-withdrawal` | PATCH | Agent centre | Implemente | Confirme uniquement le retrait physique effectue |

### 4.9 Technique

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/health` | GET | Public | Implemente | Verification de sante |

## 5. Server Actions avec Audit Logs

| Fichier | Action | Audit Log | Notes |
| --- | --- | --- | --- |
| `app/auth/actions.ts` | `signInAction` | LOGIN | Enregistre toute connexion |
| `app/auth/actions.ts` | `signUpAction` | - | Inscription/activation eleve |
| `app/account/actions.ts` | `updateProfileAction` | - | Profil |
| `app/dashboard/actions.ts` | `reserverDisponibiliteAction` | - | Reservation RDV |
| `app/dashboard/actions.ts` | `cancelRendezVousAction` | - | Annulation RDV eleve |
| `app/dashboard/actions.ts` | `requestReleveNotesAction` | - | Demande releve |
| `app/dashboard/actions.ts` | `submitDuplicataRequestAction` | - | Demande duplicata + paiement + recu |
| `app/admin/actions.ts` | `updateDocumentStatusAction` | DOCUMENT_STATUS_CHANGED | Changement statut doc |
| `app/admin/actions.ts` | `updateAdminQuotaAction` | QUOTA_CHANGED | Modification quota RDV |
| `app/admin/actions.ts` | `importTestDataAction` | - | Import CSV |
| `app/admin/actions.ts` | `cancelAppointmentAction` | - | Annulation RDV admin |

## 6. Backlog restant pour production

1. Paiement Mobile Money reel :
   - provider Orange Money/MTN Money ;
   - reference transaction ;
   - statut echec/succes ;
   - motif d'echec ;
   - verification signature webhook.
2. Stockage fichier des justificatifs de duplicata.
3. Stabilisation de la connexion Prisma/Postgres Supabase.
4. Tests E2E avec Cypress ou Playwright.

## 7. Mapping cahier des charges -> code

| Fonctionnalite | Code principal |
| --- | --- |
| Auth | `app/auth/actions.ts`, `app/api/auth/*`, `lib/auth.ts` |
| Profil | `app/account/*`, `app/api/users/me/route.ts` |
| Documents eleve | `app/dashboard/documents/page.tsx`, `app/api/students/me/documents/*` |
| Routage OBC/DECC | `lib/document-routing.ts` |
| RDV/quotas | `lib/appointment-service.ts`, `app/api/appointments/slots/route.ts` |
| Notifications | `lib/mail-service.ts`, `app/dashboard/notifications/page.tsx` |
| Paiements | `app/dashboard/actions.ts`, `app/api/students/me/payments/*`, `app/api/payments/webhook/route.ts` |
| Admin documents | `app/admin/documents/page.tsx`, `app/api/admin/documents/*` |
| Retraits | `app/api/admin/withdrawals/route.ts`, `app/centre-examen/page.tsx`, `app/api/centre-examen/*` |
| Import CSV | `app/admin/import/page.tsx`, `app/admin/actions.ts`, `docs/test-data-eleves.csv` |
| Seeds | `scripts/seed-regional-admins.ts`, `scripts/seed-decc-regional-admins.ts`, `scripts/seed-centre-examen-agents.ts`, `scripts/seed-1000-eleves.ts` |

## 8. Donnees attendues pour l'import CSV

Colonnes recommandees :

```csv
eleve_matricule,eleve_email,eleve_password,eleve_nom,eleve_prenom,eleve_date_naissance,diplome_type,centre_examen,region_composition,document_type,document_statut,admin_matricule,rdv_date,rdv_heure,rdv_lieu,rdv_statut,rdv_commentaire
```

Valeurs acceptees :

- `diplome_type` : `BEPC`, `PROBATOIRE`, `BACCALAUREAT`
- `document_type` : `ORIGINAL`, `RELEVE_NOTES`, `DUPLICATA`
- alias toleres : `DIPLOME` -> `ORIGINAL`, `RELEVE` -> `RELEVE_NOTES`
- `document_statut` : `PAS_DISPONIBLE`, `DISPONIBLE`, `RETIRE`
- alias toleres : `EN_ATTENTE`, `NON_DISPONIBLE` -> `PAS_DISPONIBLE`
- `rdv_statut` : `PLANIFIE`, `CONFIRME`, `ANNULE`, `HONORE`

## 9. Verification manuelle recommandee

1. Seeder les comptes OBC, DECC, agents centre et eleves.
2. Se connecter comme eleve.
3. Consulter `/dashboard/documents`.
4. Demander un duplicata.
5. Verifier `/dashboard/payments`.
6. Se connecter comme admin OBC et passer un document a `DISPONIBLE`.
7. Se connecter comme admin DECC et verifier les documents BEPC scopes.
8. Se connecter comme agent centre et confirmer un retrait.
9. Verifier les notifications et les logs.

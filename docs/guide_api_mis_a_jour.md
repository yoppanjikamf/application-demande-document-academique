# Guide API Next.js mis a jour

- Application : OBC/DECC de gestion des retraits de documents academiques
- Date de mise a jour : 27/05/2026

## 1. Positionnement

Le projet utilise Next.js App Router. La logique metier est repartie entre :

- Route Handlers dans `app/api/*` pour les endpoints HTTP ;
- Server Actions dans `app/auth/actions.ts`, `app/dashboard/actions.ts`, `app/admin/actions.ts` et `app/account/actions.ts` ;
- services partages dans `lib/*` ;
- schema relationnel dans `prisma/schema.prisma`.

Le guide initial prevoyait 35 routes cibles. Le MVP actuel couvre la majorite des routes critiques, mais certaines fonctionnalites restent partielles ou absentes.

## 2. Conventions API

### 2.1 Authentification

- Les sessions sont gerees par Supabase Auth.
- Les routes protegees recuperent l'utilisateur via `getCurrentUser()`.
- Les routes API utilisent `requireApiUser()`.
- Les routes internes utilisent `INTERNAL_API_SECRET`.

### 2.2 Autorisation

| Role | Acces |
| --- | --- |
| `ELEVE` | Routes `/api/students/me/*`, dashboard eleve |
| `ADMINISTRATEUR` | Routes `/api/admin/*`, back-office |
| Systeme interne | Routes `/api/internal/*` et `/api/payments/webhook` avec secret interne |

### 2.3 Reponses HTTP attendues

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

## 3. Routes implementees

### 3.1 Auth

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/auth/register` | POST | Public | Implemente | Active un eleve deja present en base |
| `/api/auth/login` | POST | Public | Implemente | Connexion matricule + email + mot de passe |
| `/api/auth/logout` | POST | Connecte | Implemente | Deconnexion Supabase |
| `/api/auth/me` | GET | Connecte | Implemente | Retourne le profil connecte |
| `/api/auth/password/forgot` | POST | Public | A faire | Reset password |
| `/api/auth/password/reset` | POST | Public | A faire | Finalisation reset |

### 3.2 Profil

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/users/me` | PATCH | Connecte | Implemente | Appelle `updateProfileAction` |

### 3.3 Documents eleve

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/students/me/documents` | GET | Eleve | Implemente | Liste documents + statut + lieu + RDV actif |
| `/api/students/me/documents/:documentId` | GET | Eleve | Implemente | Detail document |
| `/api/students/me/documents/:documentId/instructions` | GET | Eleve | Implemente | Instructions de retrait |
| `/api/students/me/documents/:documentId/appointments` | POST | Eleve | Implemente | Reservation RDV si document disponible et RDV requis |
| `/api/students/me/documents/:documentId/calendar-event` | POST | Eleve | A faire | Export calendrier `.ics` |

### 3.4 Rendez-vous

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/appointments/slots` | GET | Eleve | Implemente | Liste les creneaux disponibles pour une date/document |
| `/api/students/me/appointments/:appointmentId/cancel` | PATCH | Eleve | Implemente | Annulation eleve |
| `/api/admin/appointments` | GET | Admin | Via page/Server Action | Planning admin dans `app/admin/appointments/page.tsx` |
| `/api/admin/appointments/:appointmentId/confirm` | PATCH | Admin | Via Server Action | `confirmAppointmentAction` |
| `/api/admin/appointments/:appointmentId/cancel` | PATCH | Admin | Via Server Action | `cancelAppointmentAction` |

### 3.5 Notifications

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/students/me/notifications` | GET | Eleve | Implemente | Historique notifications |
| `/api/internal/notifications/dispatch` | POST | Systeme interne | Implemente | Envoi document disponible via secret |
| `/api/internal/notifications/reminder-30days` | POST | Systeme interne | A faire | Rappel automatique |
| `/api/students/me/notifications/history` | GET | Eleve | Fusionne | Deja couvert par `/notifications` |

### 3.6 Paiements

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/students/me/payments/initiate` | POST | Eleve | Implemente partiellement | Cree paiement duplicata |
| `/api/students/me/payments/:paymentId` | GET | Eleve | Implemente | Detail paiement + reçu |
| `/api/payments/webhook` | POST | Systeme interne | Implemente partiellement | Confirmation via secret interne |
| `/api/students/me/payments/:paymentId/cancel` | PATCH | Eleve | A faire | Annulation paiement |
| `/api/admin/payments` | GET | Admin | A faire | Suivi admin paiements |

### 3.7 Administration

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/admin/students` | GET | Admin | Implemente | Liste/recherche eleves |
| `/api/admin/students/import` | POST | Admin | Implemente | Import CSV |
| `/api/admin/documents` | GET | Admin | Implemente | Liste documents scoped |
| `/api/admin/documents/:documentId` | GET | Admin | Implemente | Detail document + RDV |
| `/api/admin/documents/:documentId/status` | PATCH | Admin | Implemente | Changement statut + notifications |
| `/api/admin/withdrawals` | GET | Admin | Implemente | Historique retraits |
| `/api/admin/withdrawals` | POST | Admin | Implemente | Enregistre retrait physique |
| `/api/admin/users/:userId/role` | PATCH | Admin | Implemente | Changement role |
| `/api/admin/dashboard/stats` | GET | Admin | Implemente | Statistiques dashboard |
| `/api/admin/audit-logs` | GET | Admin | A faire | Journalisation actions sensibles |

### 3.8 Technique

| Route | Methode | Acteur | Etat | Notes |
| --- | --- | --- | --- | --- |
| `/api/health` | GET | Public | Implemente | Verification de sante |

## 4. Server Actions importantes

Certaines operations existent deja, mais pas sous forme de route HTTP dediee.

| Fichier | Action | Role |
| --- | --- | --- |
| `app/auth/actions.ts` | `signInAction` | Connexion |
| `app/auth/actions.ts` | `signUpAction` | Inscription/activation eleve |
| `app/account/actions.ts` | `updateProfileAction` | Profil |
| `app/dashboard/actions.ts` | `reserverDisponibiliteAction` | Reservation RDV |
| `app/dashboard/actions.ts` | `cancelRendezVousAction` | Annulation RDV eleve |
| `app/dashboard/actions.ts` | `requestReleveNotesAction` | Demande releve |
| `app/dashboard/actions.ts` | `submitDuplicataRequestAction` | Demande duplicata + paiement + reçu |
| `app/admin/actions.ts` | `updateAdminQuotaAction` | Quota RDV |
| `app/admin/actions.ts` | `updateDocumentStatusAction` | Statut document |
| `app/admin/actions.ts` | `importTestDataAction` | Import CSV |
| `app/admin/actions.ts` | `confirmAppointmentAction` | Confirmation RDV admin |
| `app/admin/actions.ts` | `cancelAppointmentAction` | Annulation RDV admin |

## 5. Backlog restant

### 5.1 Critique si soutenance exige le cahier initial complet

1. Reset password :
   - `POST /api/auth/password/forgot`
   - `POST /api/auth/password/reset`
2. Paiement Mobile Money reel :
   - provider Orange Money/MTN Money ;
   - reference transaction ;
   - statut echec/succes ;
   - motif d'echec ;
   - verification signature webhook.
3. Export calendrier :
   - `POST /api/students/me/documents/:documentId/calendar-event`
   - fichier `.ics` ou lien calendrier.
4. Rappel automatique 30 jours :
   - cron ou route interne protegee ;
   - notification + email.
5. Audit logs :
   - connexions ;
   - changement role ;
   - changement statut ;
   - retrait ;
   - paiement.

### 5.2 Important mais non bloquant

- Page admin paiements.
- Annulation paiement.
- Role `SERVICE_DELIVRANCE`.
- Marquer notification comme lue via API.
- Tests automatises des routes critiques.

## 6. Mapping cahier des charges -> code

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
| Retraits | `app/admin/withdrawals/page.tsx`, `app/api/admin/withdrawals/route.ts` |
| Import CSV | `app/admin/import/page.tsx`, `app/admin/actions.ts`, `docs/test-data-eleves.csv` |
| Seeds | `scripts/seed-admin.ts`, `scripts/seed-diplomes.ts` |

## 7. Donnees attendues pour l'import CSV

Colonnes recommandees :

```csv
eleve_matricule,eleve_email,eleve_password,eleve_nom,eleve_prenom,eleve_date_naissance,diplome_type,centre_examen,region_composition,document_type,document_statut,admin_matricule,rdv_date,rdv_heure,rdv_lieu,rdv_statut,rdv_commentaire
```

Valeurs acceptees :

- `diplome_type` : `BEPC`, `PROBATOIRE`, `BACCALAUREAT`
- `document_type` : `ORIGINAL`, `RELEVE_NOTES`, `DUPLICATA`
- alias encore toleres : `DIPLOME` -> `ORIGINAL`, `RELEVE` -> `RELEVE_NOTES`
- `document_statut` : `PAS_DISPONIBLE`, `DISPONIBLE`, `RETIRE`
- alias encore toleres : `EN_ATTENTE`, `NON_DISPONIBLE` -> `PAS_DISPONIBLE`
- `rdv_statut` : `PLANIFIE`, `CONFIRME`, `ANNULE`, `HONORE`

## 8. Verification manuelle recommandee

1. Creer ou seed un administrateur.
2. Importer le CSV de test.
3. Se connecter comme eleve.
4. Consulter `/dashboard/documents`.
5. Demander un duplicata.
6. Verifier `/dashboard/payments`.
7. Passer un document a `DISPONIBLE` cote admin.
8. Verifier la notification et le mail log.
9. Reserver un rendez-vous si le document exige une antenne regionale.
10. Marquer le retrait comme effectue.
11. Verifier l'historique des retraits.

# Routes implementees

Derniere mise a jour: 18/06/2026.

Ce document liste les routes actuellement presentes dans le projet Next.js App Router.

## Resume rapide

- `page.tsx`: 25 pages UI (incluant `/consultation`).
- `route.ts`: 39 handlers HTTP (37 sous `/api` + `/logout` + `/auth/callback`).
- `actions.ts`: 5 fichiers de Server Actions.
- Segments dynamiques utilises: `[documentId]`, `[appointmentId]`, `[paymentId]`, `[userId]`, `[notificationId]`.

## Pages UI

### Racine et compte

| Route | Fichier |
| --- | --- |
| `/` | `app/page.tsx` |
| `/consultation` | `app/consultation/page.tsx` |
| `/account` | `app/account/page.tsx` |

### Authentification

| Route | Fichier | Acteur |
| --- | --- | --- |
| `/auth/login` | `app/auth/login/page.tsx` | Eleve |
| `/auth/login/obc` | `app/auth/login/obc/page.tsx` | Admin OBC |
| `/auth/login/decc` | `app/auth/login/decc/page.tsx` | Admin DECC |
| `/auth/login/centre-examen` | `app/auth/login/centre-examen/page.tsx` | Agent centre d'examen |
| `/auth/register` | `app/auth/register/page.tsx` | Eleve a activer |
| `/auth/password/forgot` | `app/auth/password/forgot/page.tsx` | Public |
| `/auth/password/reset` | `app/auth/password/reset/page.tsx` | Session recovery Supabase |

### Dashboard eleve

| Route | Fichier |
| --- | --- |
| `/dashboard` | `app/dashboard/page.tsx` |
| `/dashboard/documents` | `app/dashboard/documents/page.tsx` |
| `/dashboard/notifications` | `app/dashboard/notifications/page.tsx` |
| `/dashboard/payments` | `app/dashboard/payments/page.tsx` |
| `/dashboard/rendez-vous` | `app/dashboard/rendez-vous/page.tsx` |
| `/dashboard/rendezvous` | Redirection permanente vers `/dashboard/rendez-vous` (`next.config.ts`) |

### Administration OBC / DECC

| Route | Fichier | Notes |
| --- | --- | --- |
| `/admin` | `app/admin/page.tsx` | Dashboard admin scope organisme + antenne |
| `/admin/documents` | `app/admin/documents/page.tsx` | Statuts documents |
| `/admin/students` | `app/admin/students/page.tsx` | Eleves visibles dans le scope admin |
| `/admin/payments` | `app/admin/payments/page.tsx` | Paiements duplicata |
| `/admin/audit-logs` | `app/admin/audit-logs/page.tsx` | Journaux d'audit scopes |
| `/admin/import` | `app/admin/import/page.tsx` | Redirection vers `/admin/students` |
| `/admin/appointments` | `app/admin/appointments/page.tsx` | OBC uniquement |
| `/admin/rdv-disponibilites` | `app/admin/rdv-disponibilites/page.tsx` | OBC uniquement |

### Agent centre d'examen

| Route | Fichier |
| --- | --- |
| `/centre-examen` | `app/centre-examen/page.tsx` |

## Routes non API

| Methode | Route | Fichier |
| --- | --- | --- |
| GET/POST selon handler | `/auth/callback` | `app/auth/callback/route.ts` |
| POST | `/logout` | `app/logout/route.ts` |

## API

### Health

| Methode | Route | Fichier |
| --- | --- | --- |
| GET | `/api/health` | `app/api/health/route.ts` |

### Auth

| Methode | Route | Fichier |
| --- | --- | --- |
| POST | `/api/auth/register` | `app/api/auth/register/route.ts` |
| POST | `/api/auth/login` | `app/api/auth/login/route.ts` |
| POST | `/api/auth/logout` | `app/api/auth/logout/route.ts` |
| GET | `/api/auth/me` | `app/api/auth/me/route.ts` |
| POST | `/api/auth/password/forgot` | `app/api/auth/password/forgot/route.ts` |
| POST | `/api/auth/password/reset` | `app/api/auth/password/reset/route.ts` |

### Profil

| Methode | Route | Fichier |
| --- | --- | --- |
| PATCH | `/api/users/me` | `app/api/users/me/route.ts` |

### Eleve: documents

| Methode | Route | Fichier |
| --- | --- | --- |
| GET | `/api/students/me/documents` | `app/api/students/me/documents/route.ts` |
| GET | `/api/students/me/documents/[documentId]` | `app/api/students/me/documents/[documentId]/route.ts` |
| GET | `/api/students/me/documents/[documentId]/instructions` | `app/api/students/me/documents/[documentId]/instructions/route.ts` |
| POST | `/api/students/me/documents/[documentId]/appointments` | `app/api/students/me/documents/[documentId]/appointments/route.ts` |
| POST | `/api/students/me/documents/[documentId]/calendar-event` | `app/api/students/me/documents/[documentId]/calendar-event/route.ts` |

### Consultation publique

| Methode | Route | Fichier |
| --- | --- | --- |
| POST | `/api/public/consultation` | `app/api/public/consultation/route.ts` |

### Eleve: rendez-vous, notifications, paiements

| Methode | Route | Fichier |
| --- | --- | --- |
| PATCH | `/api/students/me/appointments/[appointmentId]/cancel` | `app/api/students/me/appointments/[appointmentId]/cancel/route.ts` |
| GET | `/api/students/me/notifications` | `app/api/students/me/notifications/route.ts` |
| DELETE | `/api/students/me/notifications/[notificationId]` | `app/api/students/me/notifications/[notificationId]/route.ts` |
| POST | `/api/students/me/payments/initiate` | `app/api/students/me/payments/initiate/route.ts` |
| GET | `/api/students/me/payments/[paymentId]` | `app/api/students/me/payments/[paymentId]/route.ts` |
| PATCH | `/api/students/me/payments/[paymentId]/cancel` | `app/api/students/me/payments/[paymentId]/cancel/route.ts` |
| GET | `/api/students/me/payments/[paymentId]/receipt` | `app/api/students/me/payments/[paymentId]/receipt/route.ts` |

### Rendez-vous publics/utilitaires

| Methode | Route | Fichier |
| --- | --- | --- |
| GET | `/api/appointments/slots` | `app/api/appointments/slots/route.ts` |

### Admin

| Methode | Route | Fichier |
| --- | --- | --- |
| GET | `/api/admin/dashboard/stats` | `app/api/admin/dashboard/stats/route.ts` |
| GET | `/api/admin/documents` | `app/api/admin/documents/route.ts` |
| GET | `/api/admin/documents/[documentId]` | `app/api/admin/documents/[documentId]/route.ts` |
| PATCH | `/api/admin/documents/[documentId]/status` | `app/api/admin/documents/[documentId]/status/route.ts` |
| GET | `/api/admin/students` | `app/api/admin/students/route.ts` |
| POST | `/api/admin/students/import` | `app/api/admin/students/import/route.ts` |
| GET | `/api/admin/payments` | `app/api/admin/payments/route.ts` |
| GET | `/api/admin/audit-logs` | `app/api/admin/audit-logs/route.ts` |
| GET | `/api/admin/withdrawals` | `app/api/admin/withdrawals/route.ts` |
| POST | `/api/admin/withdrawals` | `app/api/admin/withdrawals/route.ts` |
| PATCH | `/api/admin/users/[userId]/role` | `app/api/admin/users/[userId]/role/route.ts` |

### Centre d'examen

| Methode | Route | Fichier |
| --- | --- | --- |
| GET | `/api/centre-examen/appointments` | `app/api/centre-examen/appointments/route.ts` |
| PATCH | `/api/centre-examen/appointments/[appointmentId]/confirm-withdrawal` | `app/api/centre-examen/appointments/[appointmentId]/confirm-withdrawal/route.ts` |

### Routes internes

| Methode | Route | Fichier |
| --- | --- | --- |
| POST | `/api/internal/notifications/dispatch` | `app/api/internal/notifications/dispatch/route.ts` |
| POST | `/api/internal/notifications/reminder-30days` | `app/api/internal/notifications/reminder-30days/route.ts` |
| POST | `/api/payments/webhook` | `app/api/payments/webhook/route.ts` |

## Server Actions

| Fichier | Role |
| --- | --- |
| `app/auth/actions.ts` | Connexion, inscription, selection antenne admin, reset indirect |
| `app/dashboard/actions.ts` | RDV eleve, demandes releve, demandes duplicata |
| `app/dashboard/notifications/actions.ts` | Suppression notifications eleve |
| `app/admin/actions.ts` | Statuts documents, import CSV, quota, jours feries, RDV admin |
| `app/account/actions.ts` | Mise a jour profil |

## Notes importantes

- Les routes admin utilisent le scope `organismeId + antenneRegionaleId`.
- Les admins DECC sont rediriges hors des pages OBC-only: `/admin/appointments` et `/admin/rdv-disponibilites`.

# Dossier de soutenance - DR-DOCSCOL

Date de preparation : 02/06/2026

Ce document resume l'etat final du projet, les parcours couverts, les technologies utilisees et les points a maitriser pour la soutenance.

## 0. Etat actuel du projet

Le projet est pret pour une soutenance ou une demonstration encadree. Le coeur metier est implemente : eleves, admin OBC, admin DECC, agents centre d'examen, routage des documents, demandes, rendez-vous, paiements applicatifs, notifications, imports CSV et audit logs.

Il reste trois points a presenter comme limites de production :

- stabiliser la connexion Prisma/Postgres Supabase ;
- brancher un prestataire de paiement reel ;
- stocker reellement les justificatifs de duplicata.

## 1. Presentation rapide

DR-DOCSCOL est une application web de gestion des demandes et retraits de documents scolaires. Elle permet a un eleve d'activer son compte, de consulter ses documents, de demander un releve de notes ou un duplicata, de suivre ses paiements, de reserver un rendez-vous lorsque necessaire et de recevoir des notifications.

L'application comporte aussi :

- un espace admin OBC ;
- un espace admin DECC ;
- un espace agent centre d'examen ;
- des routes internes pour notifications et paiements ;
- des donnees de test pour la demonstration.

## 2. Objectifs fonctionnels couverts

- Activation du compte eleve a partir d'un matricule et d'un email existants.
- Authentification avec Supabase Auth.
- Redirection automatique selon le role : `ELEVE`, `ADMINISTRATEUR`, `AGENT_CENTRE_EXAMEN`.
- Connexions separees : eleve, admin OBC, admin DECC, agent centre.
- Protection des pages privees par middleware et verification serveur.
- Consultation des documents scolaires par eleve.
- Creation automatique des documents attendus a partir des examens valides.
- Demande de releve de notes.
- Demande de duplicata avec paiement applicatif et generation de recu.
- Gestion des statuts : `PAS_DISPONIBLE`, `DISPONIBLE`, `RETIRE`.
- Reservation, annulation et confirmation de retrait physique.
- Gestion du quota journalier de rendez-vous.
- Export calendrier `.ics`.
- Import CSV d'eleves, examens, documents et rendez-vous.
- Envoi de notifications applicatives et emails.
- Historisation des actions sensibles dans des audit logs.

## 3. Technologies utilisees

| Technologie | Role |
| --- | --- |
| Next.js 15 | Framework principal, App Router, pages, routes API et Server Actions |
| React 19 | Interfaces utilisateur |
| TypeScript | Typage du code |
| Tailwind CSS | Mise en forme responsive |
| shadcn/ui / Radix UI | Composants UI |
| Lucide React | Icones |
| Supabase Auth | Authentification et sessions |
| `@supabase/ssr` | Integration Supabase avec Next.js |
| Prisma | ORM PostgreSQL |
| PostgreSQL | Base relationnelle |
| Zod | Validation des formulaires et payloads |
| Nodemailer | Envoi d'emails |
| Sonner | Notifications interface |
| Docker / Vercel | Conteneurisation et deploiement |

## 4. Architecture

| Dossier / fichier | Role |
| --- | --- |
| `app/` | Pages, routes API et Server Actions |
| `components/` | Composants reutilisables |
| `lib/auth.ts` | Utilisateur courant, role, redirection |
| `lib/api-utils.ts` | Helpers API et securite |
| `lib/appointment-service.ts` | Rendez-vous, quotas, disponibilites |
| `lib/document-routing.ts` | Routage OBC / DECC |
| `lib/mail-service.ts` | Notifications email |
| `lib/supabase/` | Clients Supabase |
| `prisma/schema.prisma` | Modeles, relations et enums |

## 5. Roles

| Role | Parcours |
| --- | --- |
| `ELEVE` | Dashboard eleve, documents, demandes, paiements, RDV, notifications |
| `ADMINISTRATEUR` OBC | Documents Bac/Probatoire, RDV antenne, imports, paiements, audit |
| `ADMINISTRATEUR` DECC | Documents BEPC et duplicatas BEPC scopes par region |
| `AGENT_CENTRE_EXAMEN` | Consultation des rendez-vous centre et confirmation des retraits physiques |

## 6. Regles metier importantes

- BEPC vers DECC.
- Probatoire vers OBC, sans diplome original.
- Baccalaureat vers OBC.
- BEPC original et releve : retrait au centre d'examen avec rendez-vous `PLANIFIE`.
- BEPC duplicata : retrait a l'antenne regionale DECC.
- Probatoire : uniquement releve, retrait au centre d'examen avec rendez-vous `PLANIFIE`.
- Baccalaureat releve : retrait au centre d'examen avec rendez-vous `PLANIFIE`.
- Baccalaureat original : retrait a l'antenne regionale OBC avec rendez-vous.
- Les rendez-vous centre sont pris par l'eleve et transmis a l'agent centre.
- L'agent centre confirme uniquement le retrait physique effectue.
- Un document retire passe au statut `RETIRE`.
- Un rendez-vous honore passe au statut `HONORE`.

## 7. Pages principales

| Route | Acteur | Description |
| --- | --- | --- |
| `/` | Public | Accueil |
| `/auth/login` | Eleve | Connexion eleve |
| `/auth/login/obc` | Admin OBC | Connexion admin OBC |
| `/auth/login/decc` | Admin DECC | Connexion admin DECC |
| `/auth/login/centre-examen` | Agent | Connexion agent centre |
| `/dashboard` | Eleve | Tableau de bord |
| `/dashboard/documents` | Eleve | Documents et demandes |
| `/dashboard/rendez-vous` | Eleve | Rendez-vous |
| `/dashboard/payments` | Eleve | Paiements et recus |
| `/admin` | Admin | Tableau de bord admin |
| `/admin/documents` | Admin | Gestion documents |
| `/admin/students` | Admin | Gestion eleves |
| `/admin/import` | Admin | Import CSV |
| `/centre-examen` | Agent | Retraits centre |

## 8. Routes API

Le projet expose 37 route handlers, dont 36 sous `/api` et 1 route `/logout`. Les familles principales sont :

- `/api/auth/*` ;
- `/api/students/me/*` ;
- `/api/admin/*` ;
- `/api/centre-examen/*` ;
- `/api/internal/*` ;
- `/api/payments/webhook` ;
- `/api/health`.

Le detail complet est disponible dans `routes-implementees.md` et `guide_api_mis_a_jour.md`.

## 9. Parcours de demonstration

1. Se connecter comme eleve.
2. Consulter les documents.
3. Demander un duplicata.
4. Consulter le paiement et le recu.
5. Se connecter comme admin OBC ou DECC.
6. Changer le statut d'un document.
7. Verifier la notification eleve.
8. Se connecter comme agent centre.
9. Confirmer un retrait physique.
10. Verifier que le document passe a `RETIRE`.

## 10. Point important a expliquer au jury

Un compte peut etre valide dans Supabase Auth mais echouer dans l'application si Prisma ne parvient pas a charger le profil depuis PostgreSQL. Dans ce cas, le probleme n'est pas le mot de passe : c'est la connectivite Postgres/Supavisor.

Exemple observe :

- Supabase Auth accepte `admin.decc.adamaoua@example.com`.
- Prisma echoue sur `aws-1-eu-central-1.pooler.supabase.com:5432`.
- La connexion application retourne donc une erreur serveur.

## 11. Conclusion

Le projet couvre le coeur fonctionnel attendu pour la soutenance. Pour une production reelle, il faut finaliser l'infrastructure Supabase/Postgres, le paiement externe et le stockage des justificatifs.

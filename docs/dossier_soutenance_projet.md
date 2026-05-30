# Dossier de soutenance - DR-DOCSCOL

Date de preparation : 29 mai 2026

Ce document resume ce qui a ete realise dans le projet, les routes implementees, les technologies utilisees et les points importants a maitriser pour la soutenance.

## 1. Presentation rapide du projet

DR-DOCSCOL est une application web de gestion des demandes et retraits de documents academiques. Elle permet a un eleve d'activer son compte, de se connecter, de consulter ses documents academiques, de faire des demandes de releve de notes ou de duplicata, de suivre ses paiements, de reserver un rendez-vous de retrait lorsque le document est disponible, et de recevoir des notifications.

L'application comporte aussi un espace administrateur permettant de suivre les eleves, les documents, les rendez-vous, les retraits physiques, les paiements, les imports CSV et les journaux d'audit.

## 2. Objectifs fonctionnels couverts

- Activation du compte eleve a partir d'un matricule et d'un email deja existants en base.
- Authentification avec Supabase Auth.
- Redirection automatique selon le role : eleve vers `/dashboard`, administrateur vers `/admin`.
- Protection des pages privees par middleware et verification serveur.
- Gestion des roles `ELEVE` et `ADMINISTRATEUR`.
- Tableau de bord eleve avec statistiques, derniers documents, rendez-vous et notifications.
- Tableau de bord administrateur avec statistiques globales et indicateurs de suivi.
- Consultation des documents academiques par eleve.
- Creation automatique des documents attendus a partir des examens valides.
- Demande de releve de notes.
- Demande de duplicata avec paiement et generation de recu.
- Gestion des statuts de document : `PAS_DISPONIBLE`, `DISPONIBLE`, `RETIRE`.
- Reservation, confirmation et annulation de rendez-vous.
- Gestion du quota journalier de rendez-vous.
- Export calendrier au format `.ics` pour un rendez-vous.
- Import CSV d'eleves, documents et rendez-vous.
- Envoi de notifications en base et par email.
- Historisation des actions importantes dans des audit logs.
- Endpoint interne pour envoyer des rappels apres 30 jours de disponibilite.
- Endpoint webhook pour mettre a jour les paiements.

## 3. Technologies utilisees

| Technologie | Role dans le projet |
| --- | --- |
| Next.js 15 | Framework principal, App Router, pages serveur, routes API et Server Actions |
| React 19 | Construction des interfaces utilisateur |
| TypeScript | Typage du code et securisation des donnees manipulees |
| Tailwind CSS | Mise en forme rapide et responsive |
| shadcn/ui / Radix UI | Composants UI reutilisables : boutons, champs, labels, dialogues |
| Lucide React | Icones utilisees dans la navigation et les interfaces |
| Supabase Auth | Authentification email/mot de passe et gestion des sessions |
| `@supabase/ssr` | Integration Supabase avec les cookies et le rendu serveur Next.js |
| Prisma | ORM pour acceder a PostgreSQL |
| PostgreSQL | Base de donnees relationnelle |
| Zod | Validation des formulaires et des payloads API |
| React Hook Form | Gestion des formulaires cote client |
| Nodemailer | Envoi d'emails SMTP |
| Sonner | Notifications toast cote interface |
| Framer Motion | Animations frontend |
| Docker | Conteneurisation de l'application |
| Vercel | Configuration de deploiement via `vercel.json` |

## 4. Architecture generale

Le projet utilise l'App Router de Next.js. Les pages visibles sont dans le dossier `app/`, les routes API sont dans `app/api/`, les composants reutilisables dans `components/`, la logique metier dans `lib/`, et le schema de base de donnees dans `prisma/schema.prisma`.

Structure importante :

- `app/` : pages, routes API et Server Actions.
- `components/auth/` : formulaires de connexion, inscription et mot de passe.
- `components/dashboard/` : layout de tableau de bord, sidebar, header, cartes statistiques.
- `components/documents/` : dialogue de prise de rendez-vous.
- `components/account/` : formulaire de profil.
- `lib/auth.ts` : recuperation utilisateur courant, protection des pages et redirection par role.
- `lib/api-utils.ts` : helpers API, erreurs, pagination, protection par role.
- `lib/appointment-service.ts` : logique des rendez-vous, quotas, jours feries et creneaux.
- `lib/document-routing.ts` : regles de routage des documents vers OBC/DECC et antennes regionales.
- `lib/mail-service.ts` : notifications email suivies en base.
- `lib/supabase/` : clients Supabase serveur, navigateur, admin et middleware.
- `prisma/schema.prisma` : modeles, enums et relations de la base.

## 5. Securite et controle d'acces

- Les routes `/dashboard`, `/admin` et `/account` sont protegees par `middleware.ts`.
- Les pages privees verifient aussi l'utilisateur cote serveur avec `requireUser` ou `requireRole`.
- Les routes API utilisent `requireApiUser(role)` pour imposer les roles.
- Les endpoints internes utilisent un secret serveur via `INTERNAL_API_SECRET`.
- La cle Supabase `service_role` est uniquement utilisee cote serveur via `createSupabaseAdminClient`.
- `next.config.ts` ajoute plusieurs headers de securite : CSP, X-Frame-Options, Referrer-Policy, Permissions-Policy, etc.
- Les saisies importantes sont validees avec Zod avant traitement.

## 6. Base de donnees

La base est geree avec Prisma et PostgreSQL. Les principaux modeles sont :

| Modele | Utilite |
| --- | --- |
| `User` | Eleves et administrateurs, avec matricule, email, role et lien Supabase Auth |
| `Organisme` | Organismes responsables comme OBC ou DECC |
| `AntenneRegionale` | Antennes regionales OBC selon la region |
| `ExamenValide` | Examens valides d'un eleve : BEPC, Probatoire, Baccalaureat |
| `DocumentAcademique` | Documents demandes ou suivis : original, releve, duplicata |
| `Duplicata` | Demandes de duplicata avec instructions et justification |
| `Paiement` | Paiements associes aux duplicatas |
| `Recu` | Recus generes apres paiement |
| `RendezVous` | Rendez-vous de retrait de documents |
| `DisponibiliteRdv` | Disponibilites de rendez-vous |
| `ParametreRendezVous` | Parametres globaux comme le quota journalier |
| `CreneauHoraire` | Creneaux horaires actifs |
| `JourFerie` | Jours non ouvrables |
| `Notification` | Messages visibles par l'eleve |
| `MailLog` | Suivi des emails envoyes ou en erreur |
| `AuditLog` | Historique des actions sensibles |

Enums importants :

- `Role` : `ELEVE`, `ADMINISTRATEUR`.
- `StatutDocument` : `PAS_DISPONIBLE`, `DISPONIBLE`, `RETIRE`.
- `StatutRendezVous` : `PLANIFIE`, `CONFIRME`, `ANNULE`, `HONORE`.
- `StatutPaiement` : `EN_ATTENTE`, `EFFECTUE`, `ANNULE`.
- `TypeDocument` : `ORIGINAL`, `RELEVE_NOTES`, `DUPLICATA`.
- `DiplomePrincipal` : `BEPC`, `PROBATOIRE`, `BACCALAUREAT`.

## 7. Routes pages implementees

| Route | Acces | Description |
| --- | --- | --- |
| `/` | Public | Page d'accueil de l'application |
| `/auth/login` | Public | Connexion par matricule, email et mot de passe |
| `/auth/register` | Public | Activation du compte eleve |
| `/auth/password/forgot` | Public | Demande de reinitialisation du mot de passe |
| `/auth/password/reset` | Public | Definition d'un nouveau mot de passe |
| `/auth/callback` | Public technique | Callback Supabase pour verifier un token email |
| `/logout` | Connecte | Deconnexion cote serveur |
| `/dashboard` | Eleve | Tableau de bord eleve |
| `/dashboard/documents` | Eleve | Consultation et demandes de documents |
| `/dashboard/rendez-vous` | Eleve | Suivi et annulation des rendez-vous |
| `/dashboard/rendezvous` | Eleve | Ancienne route qui redirige vers `/dashboard/rendez-vous` |
| `/dashboard/payments` | Eleve | Liste des paiements et recus |
| `/dashboard/notifications` | Eleve | Notifications liees aux documents et rendez-vous |
| `/account` | Connecte | Consultation et modification du profil |
| `/admin` | Administrateur | Tableau de bord administrateur |
| `/admin/students` | Administrateur | Recherche et suivi des eleves |
| `/admin/documents` | Administrateur | Suivi des documents et changement de statut |
| `/admin/appointments` | Administrateur | Planning des retraits et actions de confirmation/annulation |
| `/admin/withdrawals` | Administrateur | Historique des retraits physiques |
| `/admin/payments` | Administrateur | Suivi des paiements |
| `/admin/audit-logs` | Administrateur | Historique des actions sensibles |
| `/admin/rdv-disponibilites` | Administrateur | Gestion du quota journalier et consultation des jours reserves |
| `/admin/import` | Administrateur | Import CSV des donnees |

## 8. Routes API implementees

### Authentification et compte

| Methode | Route | Description |
| --- | --- | --- |
| `POST` | `/api/auth/register` | Active un compte eleve via matricule, email et mot de passe |
| `POST` | `/api/auth/login` | Connecte un utilisateur et retourne la redirection selon son role |
| `POST` | `/api/auth/logout` | Deconnecte l'utilisateur |
| `GET` | `/api/auth/me` | Retourne l'utilisateur connecte |
| `POST` | `/api/auth/password/forgot` | Lance la procedure de reset mot de passe |
| `POST` | `/api/auth/password/reset` | Met a jour le mot de passe |
| `PATCH` | `/api/users/me` | Met a jour le profil utilisateur |

### Espace eleve

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/students/me/documents` | Liste les documents de l'eleve connecte |
| `GET` | `/api/students/me/documents/[documentId]` | Recupere le detail d'un document |
| `GET` | `/api/students/me/documents/[documentId]/instructions` | Recupere les instructions de retrait |
| `POST` | `/api/students/me/documents/[documentId]/appointments` | Cree un rendez-vous de retrait |
| `POST` | `/api/students/me/documents/[documentId]/calendar-event` | Genere un fichier calendrier `.ics` |
| `PATCH` | `/api/students/me/appointments/[appointmentId]/cancel` | Annule un rendez-vous actif |
| `GET` | `/api/students/me/notifications` | Liste les notifications de l'eleve |
| `POST` | `/api/students/me/payments/initiate` | Initie un paiement de duplicata |
| `GET` | `/api/students/me/payments/[paymentId]` | Recupere le detail d'un paiement |
| `PATCH` | `/api/students/me/payments/[paymentId]/cancel` | Annule un paiement en attente |
| `GET` | `/api/appointments/slots` | Retourne les creneaux disponibles pour une date et un document |

### Administration

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/admin/dashboard/stats` | Retourne les statistiques admin |
| `GET` | `/api/admin/students` | Liste et recherche les eleves |
| `POST` | `/api/admin/students/import` | Importe des donnees CSV |
| `GET` | `/api/admin/documents` | Liste les documents selon le perimetre admin |
| `GET` | `/api/admin/documents/[documentId]` | Recupere le detail d'un document |
| `PATCH` | `/api/admin/documents/[documentId]/status` | Change le statut d'un document |
| `GET` | `/api/admin/payments` | Liste les paiements |
| `GET` | `/api/admin/withdrawals` | Liste les retraits honores |
| `POST` | `/api/admin/withdrawals` | Confirme un retrait physique |
| `GET` | `/api/admin/audit-logs` | Liste les audit logs avec recherche et statistiques |
| `PATCH` | `/api/admin/users/[userId]/role` | Change le role d'un utilisateur |

### Endpoints internes et techniques

| Methode | Route | Description |
| --- | --- | --- |
| `GET` | `/api/health` | Verifie que l'application repond |
| `POST` | `/api/payments/webhook` | Met a jour un paiement et cree un recu si necessaire |
| `POST` | `/api/internal/notifications/dispatch` | Envoie une notification de disponibilite pour un document |
| `POST` | `/api/internal/notifications/reminder-30days` | Envoie un rappel si un document disponible n'est pas retire apres 30 jours |

## 9. Server Actions importantes

Les Server Actions permettent d'executer des traitements serveur directement depuis les formulaires Next.js.

| Fichier | Actions principales |
| --- | --- |
| `app/auth/actions.ts` | `signInAction`, `signUpAction` |
| `app/dashboard/actions.ts` | `reserverDisponibiliteAction`, `cancelRendezVousAction`, `requestReleveNotesAction`, `submitDuplicataRequestAction` |
| `app/admin/actions.ts` | `updateAdminQuotaAction`, `updateDocumentStatusAction`, `importTestDataAction`, `confirmAppointmentAction`, `cancelAppointmentAction` |
| `app/account/actions.ts` | `updateProfileAction` |

## 10. Parcours utilisateur eleve

1. L'eleve est deja present en base avec son matricule et son email.
2. Il active son compte via `/auth/register`.
3. L'application cree ou met a jour l'utilisateur dans Supabase Auth.
4. L'eleve se connecte via `/auth/login`.
5. Il arrive sur `/dashboard`.
6. Dans `/dashboard/documents`, les documents sont generes a partir de ses examens valides.
7. Il peut demander un releve de notes ou un duplicata.
8. Pour un duplicata, un paiement et un recu sont crees.
9. Quand un document devient disponible, l'eleve recoit une notification et un email.
10. Si le retrait necessite un rendez-vous, il choisit une date et un creneau.
11. Il suit ses rendez-vous dans `/dashboard/rendez-vous`.
12. Quand le document est retire, son statut passe a `RETIRE`.

## 11. Parcours administrateur

1. L'administrateur se connecte via `/auth/login`.
2. Il est redirige vers `/admin`.
3. Il consulte les statistiques : eleves, documents, rendez-vous, retraits.
4. Il peut rechercher des eleves dans `/admin/students`.
5. Il peut consulter et changer le statut des documents dans `/admin/documents`.
6. Quand un document devient `DISPONIBLE`, une notification et un email sont envoyes.
7. Quand un document devient `RETIRE`, les rendez-vous actifs associes sont marques `HONORE`.
8. Il peut confirmer ou annuler des rendez-vous dans `/admin/appointments`.
9. Il peut consulter les retraits physiques dans `/admin/withdrawals`.
10. Il peut suivre les paiements dans `/admin/payments`.
11. Il peut ajuster le quota journalier dans `/admin/rdv-disponibilites`.
12. Il peut importer des donnees CSV depuis `/admin/import`.
13. Les actions sensibles sont tracees dans `/admin/audit-logs`.

## 12. Regles metier importantes

- Le BEPC est rattache a la DECC, les autres diplomes sont rattaches a l'OBC.
- Le Baccalaureat original est oriente vers une antenne regionale selon la region de composition.
- Certains documents se retirent au centre d'examen sans rendez-vous.
- Le Probatoire ne donne pas lieu a un diplome original.
- Un document deja retire ne doit pas etre redemande comme original : il faut passer par un duplicata.
- Les rendez-vous ne sont pas autorises les week-ends ni les jours feries.
- Le quota journalier controle le nombre de rendez-vous disponibles.
- Les statuts actifs d'un rendez-vous sont `PLANIFIE` et `CONFIRME`.
- Les retraits finalises sont representes par le statut `HONORE` sur les rendez-vous et `RETIRE` sur les documents.

## 13. Notifications et emails

Le projet gere plusieurs types de notifications :

- Document disponible.
- Demande de duplicata enregistree.
- Confirmation de rendez-vous.
- Document retire.
- Rappel apres 30 jours si le document disponible n'a pas ete retire.

Les notifications sont enregistrees dans la table `Notification`. Les emails sont envoyes via Nodemailer et traces dans `MailLog`.

## 14. Paiements

Le paiement concerne principalement les demandes de duplicata.

Deux approches existent dans le code :

- Dans le parcours formulaire eleve, la demande de duplicata cree directement un paiement `EFFECTUE` et un recu.
- Via l'API, `/api/students/me/payments/initiate` peut creer un paiement `EN_ATTENTE`, puis `/api/payments/webhook` peut le passer a `EFFECTUE` et creer le recu.

Pour la soutenance, il faut expliquer que l'integration paiement est preparee comme un MVP : la logique de suivi existe, mais elle peut etre connectee plus tard a un vrai operateur de paiement mobile money ou bancaire.

## 15. Deploiement et execution

Scripts disponibles dans `package.json` :

- `npm run dev` : lancer le projet en developpement.
- `npm run build` : construire l'application.
- `npm run start` : lancer la version production.
- `npm run vercel-build` : generer Prisma puis construire pour Vercel.
- `npm run db:generate` : generer le client Prisma.
- `npm run db:migrate` : appliquer les migrations en developpement.
- `npm run db:migrate:deploy` : appliquer les migrations en production.
- `npm run db:studio` : ouvrir Prisma Studio.
- `npm run seed:admin` : creer/initialiser un administrateur.
- `npm run seed:test-auth` : creer un utilisateur de test.
- `npm run prisma:seed` : injecter des donnees de diplomes.
- `npm run supabase:start` / `supabase:stop` / `supabase:status` : gerer Supabase localement.

Le projet contient aussi :

- `Dockerfile` : build multi-stage Node 20 Alpine avec mode standalone Next.js.
- `docker-compose.yml` : lancement de l'application sur le port 3000.
- `vercel.json` : configuration de build Vercel.
- `/api/health` : endpoint utilise par le health check Docker.

## 16. Variables d'environnement importantes

Les variables suivantes sont importantes pour expliquer la configuration :

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `DATABASE_URL`
- `DIRECT_URL`
- `NEXT_PUBLIC_SITE_URL`
- `INTERNAL_API_SECRET`
- `SMTP_HOST`
- `SMTP_PORT`
- `SMTP_SECURE`
- `SMTP_USER`
- `SMTP_PASSWORD`
- `SMTP_FROM`

## 17. Ce que je dois savoir expliquer a l'oral

- Pourquoi Next.js : il permet d'avoir les pages, les API et la logique serveur dans le meme projet.
- Pourquoi Supabase : il gere l'authentification et les sessions utilisateurs.
- Pourquoi Prisma : il simplifie l'acces a PostgreSQL avec un schema type et des requetes lisibles.
- Pourquoi Zod : il evite de traiter des donnees invalides.
- Comment les roles protegent les espaces eleve et administrateur.
- Comment un document passe de `PAS_DISPONIBLE` a `DISPONIBLE`, puis a `RETIRE`.
- Comment la notification est envoyee quand un document devient disponible.
- Comment le rendez-vous est reserve en tenant compte du quota, des creneaux, des week-ends et des jours feries.
- Comment les audit logs permettent de garder une trace des actions sensibles.
- Comment l'import CSV facilite l'alimentation initiale de la base.
- Quelles limites restent possibles : integration paiement reelle, stockage de fichiers justificatifs, interface de gestion complete des creneaux horaires, tests automatises plus nombreux.

## 18. Questions probables du jury et reponses courtes

**Question : Pourquoi avoir separe l'espace eleve et l'espace administrateur ?**

Pour appliquer le principe de controle d'acces. Un eleve ne doit voir que ses documents, paiements et rendez-vous. L'administrateur a une vue de gestion limitee a son organisme ou a son antenne.

**Question : Comment l'application sait-elle ou retirer un document ?**

La fonction de routage documentaire determine l'organisme et le lieu selon le diplome, le type de document et la region de composition. Par exemple, le Baccalaureat original passe par une antenne regionale OBC.

**Question : Que se passe-t-il quand un document devient disponible ?**

Son statut est mis a jour, une notification est creee en base, un email est envoye, et l'eleve peut ensuite suivre les instructions ou prendre rendez-vous selon le type de retrait.

**Question : Pourquoi utiliser des audit logs ?**

Pour tracer les actions sensibles : connexion, changement de statut, changement de quota, rappel envoye, annulation de paiement, etc. Cela aide au controle, a la transparence et au diagnostic.

**Question : Le paiement est-il totalement connecte a un operateur ?**

La logique applicative est preparee : creation de paiement, statut, recu et webhook. Pour un environnement reel, il faudrait brancher l'API d'un fournisseur comme Orange Money, MTN Mobile Money ou une passerelle bancaire.

**Question : Comment sont evitees les reservations excessives ?**

Le service de rendez-vous calcule les creneaux disponibles selon un quota journalier, les rendez-vous deja actifs, les week-ends et les jours feries.

## 19. Points forts du projet

- Architecture moderne avec Next.js App Router.
- Separation claire entre espace eleve et espace administrateur.
- Authentification centralisee avec Supabase.
- Modele de donnees riche et adapte au domaine academique.
- Gestion des statuts, rendez-vous, paiements, notifications et audit logs.
- Routes API documentables et reutilisables.
- Deploiement prepare pour Docker et Vercel.
- Logique metier localisee dans `lib/`, ce qui rend le code plus facile a expliquer.

## 20. Ameliorations possibles

- Ajouter des tests automatises pour les parcours critiques.
- Connecter le paiement a un operateur reel.
- Ajouter le stockage des pieces justificatives dans Supabase Storage.
- Ajouter une interface admin complete pour gerer les creneaux horaires et jours feries.
- Ajouter un export PDF des recus et attestations.
- Ajouter des filtres plus avances dans les tableaux administrateur.
- Ajouter une documentation technique API au format OpenAPI/Swagger.

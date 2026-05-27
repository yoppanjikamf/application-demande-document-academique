# Changelog UML et documentation

## 27/05/2026 - Synchronisation avec le code actuel

### Resume

La documentation a ete alignee avec l'etat reel de l'application Next.js/Supabase/Prisma. Les anciens diagrammes mentionnaient uniquement utilisateur, eleve, administrateur, document, paiement, notification et rendez-vous. Le code contient maintenant des regles metier plus precises et plusieurs entites supplementaires.

### Ajouts fonctionnels a refleter

- Authentification Supabase Auth avec profil applicatif Prisma.
- Activation des comptes eleves a partir d'un matricule existant.
- Creation/validation automatique des comptes administrateurs via scripts ou premiere connexion.
- Gestion des organismes `OBC` et `DECC`.
- Gestion des antennes regionales OBC.
- Routage automatique des documents selon diplome, type de document et region de composition.
- Regle BEPC -> DECC.
- Regle Baccalaureat original -> antenne regionale OBC avec rendez-vous.
- Regle releves et certains documents -> centre d'examen sans rendez-vous.
- Regle Probatoire : pas de diplome original.
- Demande de releve de notes.
- Demande de duplicata avec motif, session, centre d'examen et paiement.
- Generation de reçu.
- Notifications applicatives et emails.
- Journalisation des emails dans `mail_logs`.
- Import CSV enrichi avec diplome, centre d'examen et region.
- Quota journalier global de rendez-vous.
- Creneaux horaires actifs.
- Jours feries et week-ends bloques.
- Historique de retrait via `RendezVous` au statut `HONORE`.

### Entites ajoutees dans le modele

- `Organisme`
- `AntenneRegionale`
- `ExamenValide`
- `ParametreRendezVous`
- `CreneauHoraire`
- `JourFerie`
- `MailLog`
- `Recu`

### Entites existantes a corriger

- `Utilisateur` devient `User`.
- `Etudiant` devient `Eleve`.
- `Administrateur` n'est pas une table separee : c'est un `User` avec role `ADMINISTRATEUR`.
- `password` ne doit plus apparaitre dans le modele applicatif : le mot de passe est gere par Supabase Auth.
- `DocumentAcademique` doit porter `typeDocument`, `diplomeType`, `centreExamen`, `regionComposition`, `organismeId`, `antenneRegionaleId`.
- `Paiement` doit etre lie a `Duplicata` et optionnellement a `DocumentAcademique`.

### Statuts actuels

- `StatutDocument` : `PAS_DISPONIBLE`, `DISPONIBLE`, `RETIRE`
- `StatutRendezVous` : `PLANIFIE`, `CONFIRME`, `ANNULE`, `HONORE`
- `StatutPaiement` : `EN_ATTENTE`, `EFFECTUE`
- `StatutNotification` : `ENVOYEE`, `RECUE`, `LUE`
- `StatutDisponibilite` : `LIBRE`, `RESERVE`, `ANNULE`

### Diagrammes sources crees

- `diagrammes_uml_mis_a_jour.md`
- `cahier_des_charges_mis_a_jour.md`
- `guide_api_mis_a_jour.md`

## 18/05/2026 - Eleves et rendez-vous

### Resume

- Ajout des creneaux de disponibilite pour les rendez-vous de retrait.
- Ajout des pages eleves pour lister les documents et gerer les retraits.
- Ajout de l'import CSV admin.

### Impact schema

- Nouveau modele `DisponibiliteRdv`.
- Liaison optionnelle entre `RendezVous` et `DisponibiliteRdv`.

## 18/05/2026 - Quota calendrier

### Resume

- Quota journalier.
- Calendrier eleve avec jours bloques si quota atteint.
- Creneaux fixes.

### Evolution depuis cette note

Le code actuel utilise un modele global `ParametreRendezVous` avec `quotaJournalier`, ainsi que `CreneauHoraire` et `JourFerie`. Le champ `User.maxRdvParJour` existe encore, mais la logique principale de disponibilite passe par les parametres globaux.

## 18/05/2026 - Auth et profil

### Resume

- Ajout du flux de connexion admin avec creation/validation automatique Supabase Auth.
- Mise a jour du profil utilisateur via une page dediee.

### Evolution depuis cette note

Le flux reste valide. Il faut cependant documenter que les roles actuellement geres sont `ELEVE` et `ADMINISTRATEUR`.

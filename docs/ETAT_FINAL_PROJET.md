# Etat final du projet DR-DOCSCOL

Date d'audit: 02/06/2026.

## Verdict

Le projet est fonctionnellement tres avance et peut etre considere comme pret pour une soutenance ou une demonstration encadree.

Il ne faut pas encore le presenter comme une production totalement terminee, car trois points restent a verrouiller:

- la connectivite Postgres Supabase via Prisma / Supavisor est instable depuis la machine de developpement;
- le paiement Mobile Money / carte bancaire est simule ou confirme applicativement selon le flux, mais pas encore branche a un prestataire reel;
- le stockage reel des justificatifs de duplicata reste a brancher.

## Ce qui est termine

### Authentification et profils

- Activation eleve via matricule + email existants.
- Connexion eleve via `/auth/login`.
- Connexion admin OBC via `/auth/login/obc`.
- Connexion admin DECC via `/auth/login/decc`.
- Connexion agent centre d'examen via `/auth/login/centre-examen`.
- Redirection selon role: eleve vers `/dashboard`, admin vers `/admin`, agent vers `/centre-examen`.
- Mot de passe gere par Supabase Auth, pas par Prisma.
- Profil utilisateur modifiable via `/account`.

### Roles et perimetres

- `ELEVE`: consulte ses documents, demandes, paiements, notifications et rendez-vous.
- `ADMINISTRATEUR`: gere les documents, eleves, paiements, imports et journaux d'audit dans son scope.
- `AGENT_CENTRE_EXAMEN`: voit les rendez-vous de retrait de son centre et confirme les retraits.
- Les admins sont scopes par `organismeId` et `antenneRegionaleId`.
- Les comptes OBC et DECC ont des pages de connexion separees.

### Routage OBC / DECC

- BEPC vers DECC.
- Probatoire vers OBC, sans diplome original.
- Baccalaureat vers OBC.
- BEPC original et releve vers centre d'examen avec rendez-vous `PLANIFIE`.
- BEPC duplicata vers antenne regionale DECC.
- Probatoire: uniquement le releve, retire au centre d'examen avec rendez-vous `PLANIFIE`.
- Baccalaureat releve vers centre d'examen avec rendez-vous `PLANIFIE`.
- Baccalaureat original vers antenne regionale OBC avec rendez-vous.
- Documents rattaches a une region de composition et a une antenne regionale.

### Parcours eleve

- Dashboard eleve.
- Liste des examens deja composes.
- Documents generes automatiquement depuis les examens valides.
- Consultation des statuts document.
- Demande de releve de notes.
- Demande de duplicata avec session, motif, centre d'examen, justificatif et mode de paiement.
- Paiement duplicata applicatif avec generation de recu.
- Consultation et telechargement du recu.
- Prise de rendez-vous quand le document le demande.
- Annulation de rendez-vous actif.
- Export calendrier `.ics`.
- Notifications en base.

### Parcours admin OBC / DECC

- Dashboard admin.
- Liste des documents du scope.
- Changement de statut document: `PAS_DISPONIBLE`, `DISPONIBLE`, `RETIRE`.
- Notification eleve lors de la disponibilite et du retrait.
- Liste des eleves du scope.
- Liste des paiements du scope.
- Journaux d'audit scopes.
- Import CSV d'eleves, examens, documents et rendez-vous.
- Historique de retraits via API `/api/admin/withdrawals`.
- OBC uniquement: gestion planning RDV et disponibilites.
- DECC: gestion des demandes BEPC et duplicatas BEPC dans son antenne regionale.

### Parcours agent centre d'examen

- Connexion agent dediee.
- Liste des rendez-vous `PLANIFIE`/`CONFIRME` du jour, a venir et deja traites.
- Confirmation uniquement du retrait physique effectue.
- Mise a jour du document en `RETIRE`.
- Journalisation et notification eleve.

### Donnees de test

- 10 admins OBC regionaux.
- 10 admins DECC regionaux.
- 10 agents centres d'examen.
- 1000 eleves de test via `docs/test-data-1000-eleves.csv`.
- 5 eleves avec emails reels pour activation manuelle.

## Ce qui reste a faire avant production

1. Stabiliser la connexion Prisma/Postgres Supabase.
   - Symptome observe: `Can't reach database server` ou timeout pooler sur `aws-1-eu-central-1.pooler.supabase.com`.
   - Supabase Auth fonctionne, mais Postgres via Prisma peut etre inaccessible.
   - Verifier dans Supabase Dashboard la connection string, le mode pooler, la taille du pool et l'etat du projet.

2. Brancher un paiement reel.
   - Le flux duplicata cree un paiement et un recu applicatif.
   - Le webhook existe, mais aucun prestataire Orange Money / MTN Money / carte bancaire n'est integre.

3. Stocker vraiment les pieces justificatives.
   - Le formulaire exige un fichier.
   - Le code conserve surtout le nom du fichier dans les instructions.
   - Pour production, utiliser Supabase Storage ou un stockage equivalent.

4. Ajouter des tests automatises de bout en bout.
   - Connexion eleve.
   - Connexion admin OBC.
   - Connexion admin DECC.
   - Connexion agent centre d'examen.
   - Demande duplicata.
   - Changement statut document.
   - Confirmation retrait centre d'examen.

## Commandes utiles

```bash
npm run build
npm run seed:regional-admins
npm run seed:decc-admins
npm run seed:centre-agents
npm run seed:1000-eleves
```

## Identifiants de reference

### Admin DECC Adamaoua

- Page: `/auth/login/decc`
- Matricule: `DECC-01-ADAMAOUA`
- Email: `admin.decc.adamaoua@example.com`
- Mot de passe: `DeccAdamaoua2026!`

### Admin OBC Centre

- Page: `/auth/login/obc`
- Matricule: `ADM-02-CENTRE`
- Email: `admin.centre@example.com`
- Mot de passe: `AdminCentre2026!`

### Agent Centre

- Page: `/auth/login/centre-examen`
- Matricule: `AGENT-CE-02-CENTRE`
- Email: `agent.centre.centre@example.com`
- Mot de passe: `AgentCentre2026!`

## Conclusion

Le coeur metier est en place: OBC, DECC, eleves, duplicatas, rendez-vous, notifications, audit logs et centre d'examen.

Le projet est bon pour presentation, tests fonctionnels et soutenance. Pour production reelle, il reste surtout l'infrastructure Supabase/Postgres, le stockage des justificatifs et le paiement externe.

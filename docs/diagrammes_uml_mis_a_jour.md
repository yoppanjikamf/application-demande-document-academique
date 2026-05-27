# DIAGRAMMES UML — Application de Gestion des Documents Académiques
## OBC / DECC — Cameroun | Version 2.0

---

## TABLE DES MATIÈRES

1. Diagramme de Cas d'Utilisation
2. Diagramme de Classes
3. Diagrammes de Séquence
4. Diagramme MCD / MLD
5. Notes de Cohérence avec le Code Actuel

---

## 1. Diagramme de Cas d'Utilisation

Ce diagramme représente les interactions entre les acteurs principaux et le système de gestion des documents académiques. Les acteurs humains restent à l’extérieur du système, tandis que les cas d’utilisation sont regroupés dans le rectangle système intitulé "Gestion de retrait de documents académiques".

```mermaid
graph TB
    Etudiant(("👤\nÉtudiant"))
    Admin(("👤\nAdministration"))
    SystemeInterne(("⚙️\nSystème interne"))

    subgraph Systeme["Gestion de retrait de documents académiques"]
        UC1((authentifier))
        UC2((activer compte\nélève))
        UC3((modifier profil))
        UC4((demander retrait\nde document))
        UC5((demander retrait\nde diplôme))
        UC6((demander retrait\nde relevé))
        UC7((demander retrait\nde duplicata))
        UC8((vérifier\ndisponibilité))
        UC9((vérifier disponibilité\ndiplôme))
        UC10((vérifier disponibilité\nrelevé))
        UC11((vérifier disponibilité\nduplicata))
        UC12((prendre rdv))
        UC13((annuler rdv))
        UC14((effectuer\npaiement))
        UC15((consulter reçu))
        UC16((consulter\nnotifications))
        UC17((mettre à jour))
        UC18((mettre à jour\ndisponibilité))
        UC19((mettre à jour\nstatut document))
        UC20((importer CSV))
        UC21((gérer élèves))
        UC22((gérer documents))
        UC23((gérer rendez-vous))
        UC24((enregistrer retrait))
        UC25((consulter historique\nretraits))
        UC26((consulter statistiques))
        UC27((modifier rôle\nutilisateur))
        UC28((configurer quota\nrdv))
        UC29((envoyer notification))
        UC30((journaliser email))
        UC31((confirmer paiement\nwebhook))
    end

    Etudiant --> UC1
    Etudiant --> UC2
    Etudiant --> UC3
    Etudiant --> UC4
    Etudiant --> UC12
    Etudiant --> UC13
    Etudiant --> UC14
    Etudiant --> UC15
    Etudiant --> UC16

    Admin --> UC1
    Admin --> UC3
    Admin --> UC17
    Admin --> UC20
    Admin --> UC21
    Admin --> UC22
    Admin --> UC23
    Admin --> UC24
    Admin --> UC25
    Admin --> UC26
    Admin --> UC27
    Admin --> UC28

    SystemeInterne --> UC29
    SystemeInterne --> UC30
    SystemeInterne --> UC31

    UC12 -.->|"<<include>>"| UC1
    UC13 -.->|"<<include>>"| UC1
    UC4 -.->|"<<include>>"| UC8
    UC7 -.->|"<<include>>"| UC14
    UC29 -.->|"<<include>>"| UC30
    UC19 -.->|"<<extend>>"| UC29
    UC24 -.->|"<<extend>>"| UC29
    UC12 -.->|"<<extend>>"| UC29

    UC4 --> UC5
    UC4 --> UC6
    UC4 --> UC7
    UC8 --> UC9
    UC8 --> UC10
    UC8 --> UC11
    UC17 --> UC18
    UC17 --> UC19
```

**Acteurs :**

| Acteur | Rôle |
|--------|------|
| Étudiant | Élève ou diplômé souhaitant consulter, demander ou retirer un document académique. |
| Administration | Service OBC / DECC chargé de gérer les élèves, documents, statuts, rendez-vous, retraits et statistiques. |
| Système interne | Composant technique chargé des notifications, emails, webhooks de paiement et traitements internes protégés. |

**Relations :**

| Relation | Type | Signification |
|----------|------|---------------|
| prendre rdv → authentifier | <<include>> | Toute réservation de rendez-vous nécessite une authentification préalable. |
| annuler rdv → authentifier | <<include>> | Toute annulation côté élève nécessite une session active. |
| demander retrait → vérifier disponibilité | <<include>> | Le système doit vérifier la disponibilité avant d’autoriser un retrait ou une réservation. |
| demander retrait de duplicata → effectuer paiement | <<include>> | Le paiement est obligatoire pour une demande de duplicata. |
| envoyer notification → journaliser email | <<include>> | Chaque email envoyé ou échoué est journalisé dans `mail_logs`. |
| mettre à jour statut document → envoyer notification | <<extend>> | Une notification est déclenchée lorsque le statut devient `DISPONIBLE` ou `RETIRE`. |
| enregistrer retrait → envoyer notification | <<extend>> | Un accusé de retrait est envoyé lorsque le retrait physique est enregistré. |
| prendre rdv → envoyer notification | <<extend>> | Une confirmation est envoyée après la réservation d’un rendez-vous. |

---

## 2. Diagramme de Classes

Ce diagramme présente la structure statique du système, les entités métier, leurs attributs, leurs méthodes principales et les relations entre elles. Les classes reprennent les concepts historiques des diagrammes initiaux tout en les alignant avec le code actuel : Supabase Auth, Prisma, OBC / DECC, antennes régionales, paiements, reçus et journaux d’emails.

```mermaid
classDiagram
    class Utilisateur {
        - id : String
        - authUserId : String
        + role : Role
        + email : String
        + matricule : String
        + nom : String
        + prenom : String
        + dateCreation : DateTime
        + derniereConnexion : DateTime
        + seConnecter(email, password) Boolean
        + seDeconnecter() void
        + modifierProfil() void
        + changerMotDePasse() void
    }

    class Eleve {
        + dateNaissance : Date
        + consulterDocuments() DocumentAcademique[]
        + demanderReleve(diplomeType) void
        + demanderDuplicata(documentId) void
        + prendreRendezVous(date, heure) RendezVous
        + annulerRendezVous(rendezVousId) void
        + effectuerPaiement() Paiement
        + consulterNotifications() Notification[]
    }

    class Administrateur {
        + nomService : String
        + organismeId : String
        + antenneRegionaleId : String
        + maxRdvParJour : int
        + importerCSV(fichier) void
        + validerDocument(documentId) void
        + publierDocument(documentId) void
        + gererRendezVous(rendezVousId) void
        + enregistrerRetrait(documentId) void
        + envoyerNotification(userId) void
    }

    class Organisme {
        - id : String
        + nom : String
        + ajouterAntenne(antenne) void
    }

    class AntenneRegionale {
        - id : String
        + nom : String
        + region : String
        + ville : String
        + organismeId : String
        + traiterDocument(documentId) void
    }

    class ExamenValide {
        - id : String
        + diplomeType : DiplomePrincipal
        + anneeSession : int
        + centreExamen : String
        + regionComposition : String
        + verifierEligibilite() Boolean
    }

    class DocumentAcademique {
        - id : String
        + eleveId : String
        + typeDocument : TypeDocument
        + diplomeType : DiplomePrincipal
        + statut : StatutDocument
        + centreExamen : String
        + regionComposition : String
        + organismeId : String
        + antenneRegionaleId : String
        + rendreDisponible() void
        + marquerRetire() void
        + verifierStatut() StatutDocument
        + determinerLieuRetrait() String
    }

    class RendezVous {
        - id : String
        + dateRendezVous : Date
        + heureRendezVous : String
        + lieu : String
        + statut : StatutRendezVous
        + commentaire : String
        + planifier() void
        + annuler() void
        + confirmer() void
        + honorer() void
    }

    class DisponibiliteRdv {
        - id : String
        + dateRdv : Date
        + heureRdv : String
        + lieu : String
        + statut : StatutDisponibilite
        + reserver() void
        + liberer() void
    }

    class ParametreRendezVous {
        - id : String
        + quotaJournalier : int
        + lieuObc : String
        + modifierQuota(quota) void
    }

    class CreneauHoraire {
        - id : String
        + heureDebut : String
        + heureFin : String
        + actif : Boolean
        + activer() void
        + desactiver() void
    }

    class JourFerie {
        - id : String
        + date : Date
        + nom : String
        + annuel : Boolean
        + bloquerDate() void
    }

    class Paiement {
        - id : String
        + duplicataId : String
        + documentAcademiqueId : String
        + statut : StatutPaiement
        + modePaiement : String
        + montant : double
        + motif : String
        + initierPaiement() void
        + confirmerPaiement() void
        + annulerPaiement() void
    }

    class Recu {
        - id : String
        + numero : String
        + montant : double
        + dateEmission : DateTime
        + modePaiement : String
        + commentaire : String
        + generer() void
    }

    class Notification {
        - id : String
        - typeNotification : String
        - message : String
        + statut : StatutNotification
        + dateEnvoi : DateTime
        + envoyer() void
        + marquerCommeLu() void
    }

    class MailLog {
        - id : String
        + to : String
        + subject : String
        + status : String
        + error : String
        + journaliser() void
    }

    class Releve {
        + nomReleve : String
        + instruction : String
        + faireDemandeReleve() void
    }

    class Duplicata {
        - id : String
        + nomDocument : String
        + motifDemande : String
        + instruction : String
        + paiement : Boolean
        + regionComposition : String
        + creerDemande() void
        + verifierPaiement() Boolean
        + validerDuplicata() void
    }

    class Diplome {
        + nomDiplome : String
        + instruction : String
        + anneeObtention : int
        + faireDemandeDiplome() void
    }

    Utilisateur <|-- Eleve
    Utilisateur <|-- Administrateur
    DocumentAcademique <|-- Releve
    DocumentAcademique <|-- Duplicata
    DocumentAcademique <|-- Diplome

    Organisme "1" --> "0..*" Administrateur : rattache
    Organisme "1" --> "0..*" AntenneRegionale : possède
    Organisme "1" --> "0..*" DocumentAcademique : gère
    AntenneRegionale "1" --> "0..*" Administrateur : localise
    AntenneRegionale "1" --> "0..*" DocumentAcademique : traite
    Eleve "1" --> "0..*" ExamenValide : possède
    Eleve "1" --> "1..*" DocumentAcademique : choisit
    Eleve "1" --> "0..*" RendezVous : prend
    Eleve "1" --> "0..*" Paiement : effectue
    Eleve "1" --> "0..*" Notification : reçoit
    Eleve "1" --> "0..*" Recu : reçoit
    Administrateur "1" --> "0..*" RendezVous : confirme
    Administrateur "1" --> "0..*" DocumentAcademique : met à jour
    DocumentAcademique "1" --> "0..*" RendezVous : concerne
    DocumentAcademique "0..1" --> "0..1" Paiement : finance
    Duplicata "1" --> "0..1" Paiement : exige
    Paiement "1" --> "0..*" Recu : génère
    DisponibiliteRdv "0..1" --> "0..1" RendezVous : réserve
    ParametreRendezVous "1" --> "0..*" CreneauHoraire : configure
    JourFerie "0..*" --> "0..*" RendezVous : bloque
    Notification "1" --> "0..*" MailLog : journalise
```

**Description des classes :**

| Classe | Rôle |
|--------|------|
| Utilisateur | Classe mère logique de tous les utilisateurs du système ; dans le code, elle correspond au modèle Prisma `User`. |
| Eleve | Élève ou diplômé utilisant l’application pour consulter, demander, payer et réserver. |
| Administrateur | Agent OBC / DECC gérant les documents, imports, rendez-vous, retraits et statistiques. |
| Organisme | Structure responsable des documents, actuellement OBC ou DECC. |
| AntenneRegionale | Antenne régionale OBC utilisée pour certains retraits, notamment le Baccalauréat original. |
| ExamenValide | Examen obtenu par l’élève, utilisé pour déterminer les documents demandables. |
| DocumentAcademique | Entité centrale représentant un document académique : diplôme, relevé ou duplicata. |
| RendezVous | Planification d’un retrait physique ou trace d’un retrait honoré. |
| DisponibiliteRdv | Modèle de disponibilité dédié encore présent dans le schéma. |
| ParametreRendezVous | Paramètres globaux de rendez-vous, notamment quota journalier et lieu OBC. |
| CreneauHoraire | Plage horaire configurable pour les rendez-vous. |
| JourFerie | Date bloquée dans le calendrier de rendez-vous. |
| Paiement | Gestion du paiement lié à une demande, principalement le duplicata dans le MVP. |
| Recu | Trace de paiement générée pour l’élève. |
| Notification | Message applicatif envoyé à un élève. |
| MailLog | Journalisation des emails envoyés ou échoués. |
| Diplome, Releve, Duplicata | Spécialisations fonctionnelles de `DocumentAcademique`. |

---

## 3. Diagrammes de Séquence

### SEQ-01 — Inscription et activation du compte

Ce diagramme décrit le processus d’inscription d’un élève dans le MVP actuel. L’élève ne crée pas un compte totalement libre : son matricule et son email doivent déjà exister dans la base métier, puis le système active ou crée le compte Supabase Auth correspondant.

```mermaid
sequenceDiagram
    participant Eleve as Élève
    participant Systeme as Système
    participant Auth as Service Auth (Supabase)
    participant BDD as Base de données
    participant Admin as Administrateur

    Eleve->>Systeme: soumet formulaire d'inscription (matricule, email, mot de passe)
    Systeme->>BDD: vérifie existence du matricule et de l'email
    BDD-->>Systeme: profil élève trouvé
    Systeme->>Auth: crée ou met à jour le compte Supabase Auth
    Auth-->>Systeme: compte auth activé
    Systeme->>BDD: rattache authUserId au profil élève
    BDD-->>Systeme: profil mis à jour
    Systeme-->>Eleve: compte activé et session ouverte
    Note over Admin,Systeme: Les comptes administrateurs sont créés par script ou validés automatiquement lors de la première connexion.
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’élève soumet matricule, email et mot de passe. | Le système reçoit la demande d’activation. |
| 2 | Le système vérifie le profil Prisma. | Le compte n’est activé que si le matricule et l’email correspondent. |
| 3 | Supabase Auth crée ou met à jour le compte. | Le mot de passe est géré hors Prisma. |
| 4 | Prisma reçoit `authUserId`. | Le profil métier est relié au compte Auth. |
| 5 | L’élève est connecté. | L’utilisateur est redirigé vers le tableau de bord. |

### SEQ-02 — Connexion et déconnexion

Ce diagramme décrit la connexion d’un utilisateur avec matricule, email et mot de passe. Le système vérifie d’abord la cohérence du matricule dans Prisma, puis délègue l’authentification du mot de passe à Supabase Auth.

```mermaid
sequenceDiagram
    participant Eleve as Élève / Admin
    participant Systeme as Système
    participant Auth as Service Auth (JWT / Supabase)
    participant BDD as Base de données

    Eleve->>Systeme: saisit matricule + email + mot de passe
    Systeme->>BDD: recherche utilisateur par matricule
    BDD-->>Systeme: données utilisateur trouvées
    Systeme->>Auth: vérifie email + mot de passe
    Auth-->>Systeme: session Supabase valide
    Systeme->>BDD: met à jour derniereConnexion
    BDD-->>Systeme: connexion enregistrée
    Systeme-->>Eleve: connexion réussie — redirection selon le rôle
    Note over Eleve,Systeme: Session active côté Supabase Auth
    Eleve->>Systeme: clique "Se déconnecter"
    Systeme->>Auth: invalide la session
    Auth-->>Systeme: session fermée
    Systeme-->>Eleve: redirection vers page de connexion
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’utilisateur saisit ses identifiants. | Le système reçoit matricule, email et mot de passe. |
| 2 | Prisma vérifie le matricule et l’email. | Les erreurs de couple matricule/email sont bloquées. |
| 3 | Supabase Auth vérifie le mot de passe. | Une session sécurisée est ouverte. |
| 4 | Prisma met à jour la dernière connexion. | La traçabilité de connexion est conservée. |
| 5 | L’utilisateur se déconnecte. | La session Supabase est fermée. |

### SEQ-03 — Consultation des documents académiques

Ce diagramme décrit la consultation des documents par un élève connecté. Le système garantit que seuls les documents de l’élève courant sont chargés, puis affiche le statut, le lieu de retrait et l’éventuel rendez-vous actif.

```mermaid
sequenceDiagram
    participant Eleve as Élève
    participant Systeme as Système
    participant Service as Service documents / routage
    participant BDD as Base de données

    Eleve->>Systeme: accède à "Mes Documents"
    Systeme->>BDD: récupère l'élève connecté
    BDD-->>Systeme: profil élève
    Systeme->>Service: garantit les documents issus des examens validés
    Service->>BDD: upsert documents manquants si nécessaire
    BDD-->>Service: documents synchronisés
    Systeme->>BDD: requête documents de l'élève
    BDD-->>Systeme: liste des documents avec statuts et RDV actifs
    Systeme->>Service: calcule titre, statut lisible et lieu de retrait
    Service-->>Systeme: informations formatées
    Systeme-->>Eleve: affiche liste avec statuts et actions possibles
    Eleve->>Systeme: clique sur un document disponible
    Systeme->>BDD: récupère détail et instructions
    BDD-->>Systeme: adresse, horaires, pièces requises
    Systeme-->>Eleve: affiche détails + instructions de retrait
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’élève ouvre la page des documents. | Le système identifie l’utilisateur connecté. |
| 2 | Les documents sont synchronisés depuis les examens validés. | Les documents demandables sont disponibles en base. |
| 3 | Le système charge la liste. | Les statuts et rendez-vous actifs sont récupérés. |
| 4 | Le routage calcule le lieu de retrait. | Le système distingue centre d’examen et antenne régionale. |
| 5 | L’élève consulte un détail. | Les instructions de retrait sont affichées. |

### SEQ-04 — Envoi de notification de disponibilité

Ce diagramme décrit le processus déclenché lorsqu’un administrateur marque un document comme disponible. Dans le MVP actuel, la notification est enregistrée en base et un email est envoyé via Nodemailer ; la notification push native reste une évolution future.

```mermaid
sequenceDiagram
    participant Admin as Admin
    participant Systeme as Système
    participant ServiceNotif as Service notif / email
    participant BDD as Base de données
    participant Etudiant as Étudiant

    Admin->>Systeme: met à jour statut document → DISPONIBLE
    Systeme->>BDD: vérifie document dans le périmètre admin
    BDD-->>Systeme: document + élève trouvés
    Systeme->>BDD: met à jour statut document
    BDD-->>Systeme: statut mis à jour
    Systeme->>ServiceNotif: déclenche notification DOCUMENT_DISPONIBLE
    ServiceNotif->>BDD: crée notification applicative
    ServiceNotif->>Etudiant: envoie email de disponibilité
    Etudiant-->>ServiceNotif: réception email
    ServiceNotif->>BDD: journalise email dans MailLog
    BDD-->>ServiceNotif: journal créé
    ServiceNotif-->>Systeme: confirmation envoi
    Systeme-->>Admin: confirmation mise à jour effectuée
    Etudiant->>Systeme: consulte document disponible
    Systeme-->>Etudiant: affiche détails + instructions retrait
    Etudiant->>Systeme: consulte notification
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’administrateur change le statut. | Le document passe à `DISPONIBLE`. |
| 2 | Le système contrôle le périmètre admin. | Un agent ne modifie que ses documents autorisés. |
| 3 | Une notification applicative est créée. | L’élève voit l’information dans son dashboard. |
| 4 | Un email est envoyé. | L’élève reçoit la disponibilité du document. |
| 5 | L’email est journalisé. | Le succès ou l’erreur est conservé dans `mail_logs`. |

### SEQ-05 — Demande de duplicata et paiement

Ce diagramme décrit la demande de duplicata et le paiement associé. Le MVP gère un paiement applicatif simplifié avec reçu, tandis que l’intégration Mobile Money réelle reste à finaliser.

```mermaid
sequenceDiagram
    participant Eleve as Élève
    participant Systeme as Système
    participant Paiement as Service Paiement
    participant Admin as Administrateur
    participant BDD as Base de données

    Eleve->>Systeme: sélectionne "Demander un duplicata"
    Systeme-->>Eleve: affiche formulaire (diplôme, cible, session, centre, motif, mode paiement)
    Eleve->>Systeme: soumet demande
    Systeme->>BDD: vérifie examen validé et règle Probatoire
    BDD-->>Systeme: élève éligible
    Systeme->>BDD: crée ou met à jour DocumentAcademique DUPLICATA
    Systeme->>BDD: crée demande Duplicata
    Systeme-->>Eleve: affiche montant à payer
    Eleve->>Paiement: initie paiement
    Paiement-->>Systeme: paiement confirmé dans le MVP
    Systeme->>BDD: crée Paiement statut EFFECTUE
    Systeme->>BDD: génère Recu
    Systeme->>BDD: crée notification DEMANDE_DUPLICATA
    Systeme->>Admin: notification "Nouvelle demande de duplicata"
    Admin->>Systeme: traite la demande
    Systeme->>BDD: met à jour statut → DISPONIBLE
    Systeme-->>Eleve: notification "Votre duplicata est disponible"
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’élève saisit sa demande. | Le système reçoit le diplôme, le document cible, la session, le centre et le motif. |
| 2 | Le système vérifie l’éligibilité. | Le Probatoire ne permet pas de duplicata de diplôme original. |
| 3 | Le duplicata est enregistré. | `DocumentAcademique` et `Duplicata` sont créés ou mis à jour. |
| 4 | Le paiement est confirmé. | Le MVP crée un paiement `EFFECTUE`. |
| 5 | Un reçu est généré. | L’élève dispose d’une trace de paiement. |
| 6 | L’administration traite la demande. | Le document pourra passer à `DISPONIBLE`. |

### SEQ-06 — Réservation et annulation de rendez-vous

Ce diagramme décrit la réservation puis l’annulation d’un rendez-vous. Le système vérifie la disponibilité du document, le besoin réel de rendez-vous, les jours bloqués, les quotas et l’absence de rendez-vous actif déjà existant.

```mermaid
sequenceDiagram
    participant Eleve as Élève
    participant Systeme as Système
    participant Service as Service RDV
    participant BDD as Base de données
    participant Admin as Administrateur

    Eleve->>Systeme: clique "Réserver un rendez-vous"
    Systeme->>Service: vérifie document, routage et besoin RDV
    Service->>BDD: récupère quota, créneaux, RDV existants et jours fériés
    BDD-->>Service: données calendrier
    Service-->>Systeme: liste des créneaux disponibles
    Systeme-->>Eleve: affiche calendrier des disponibilités
    Eleve->>Systeme: sélectionne date + heure
    Systeme->>Service: valide date, créneau et quota
    Service->>BDD: vérifie absence RDV actif pour le document
    BDD-->>Service: aucun RDV actif
    Service->>BDD: crée RDV (statut = CONFIRMÉ)
    BDD-->>Service: RDV créé
    Systeme-->>Eleve: confirmation RDV + instructions de retrait
    Systeme-->>Admin: RDV visible dans le planning
    Note over Eleve,Systeme: Plus tard...
    Eleve->>Systeme: clique "Annuler le rendez-vous"
    Systeme->>BDD: met à jour statut → ANNULÉ
    BDD-->>Systeme: RDV annulé
    Systeme-->>Admin: notification "RDV annulé par l'élève"
    Systeme-->>Eleve: confirmation annulation
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’élève demande un rendez-vous. | Le système vérifie si le document nécessite réellement un RDV. |
| 2 | Le calendrier est calculé. | Week-ends, jours fériés, quotas et créneaux actifs sont pris en compte. |
| 3 | L’élève choisit date et heure. | Le système valide le créneau. |
| 4 | Le rendez-vous est créé. | Le statut devient `CONFIRME`. |
| 5 | L’élève annule plus tard. | Le statut devient `ANNULE`. |

### SEQ-07 — Mise à jour du statut d’un document

Ce diagramme complète le scénario de notification en montrant les contrôles administratifs et les effets métier. Lorsqu’un document est marqué `RETIRE`, les rendez-vous actifs liés sont passés à `HONORE`.

```mermaid
sequenceDiagram
    participant Admin as Administrateur
    participant Systeme as Système
    participant Service as Service documents
    participant BDD as Base de données
    participant Notif as Service notif / email
    participant Eleve as Élève

    Admin->>Systeme: sélectionne document + nouveau statut
    Systeme->>Service: contrôle rôle et périmètre organisme / antenne
    Service->>BDD: recherche document autorisé
    BDD-->>Service: document + élève
    Service->>Service: applique règles Probatoire / OBC / DECC
    Service->>BDD: met à jour statut document
    BDD-->>Service: document mis à jour
    alt Statut devient DISPONIBLE
        Service->>Notif: notifier document disponible
        Notif->>BDD: crée notification et MailLog
        Notif-->>Eleve: email de disponibilité
    else Statut devient RETIRE
        Service->>BDD: passe RDV actifs à HONORE
        Service->>Notif: notifier retrait confirmé
        Notif->>BDD: crée notification et MailLog
        Notif-->>Eleve: email d'accusé de retrait
    end
    Service-->>Systeme: résultat de l'opération
    Systeme-->>Admin: confirmation action effectuée
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’administrateur choisit un statut. | Le système reçoit la demande de mise à jour. |
| 2 | Le périmètre est contrôlé. | L’accès hors organisme ou antenne est refusé. |
| 3 | Les règles métier sont appliquées. | Le Probatoire ne donne pas lieu à diplôme original. |
| 4 | Le statut est modifié. | Le document devient disponible ou retiré. |
| 5 | Les notifications sont envoyées. | L’élève est informé et l’email est journalisé. |

### SEQ-08 — Retrait physique d’un document

Ce diagramme décrit l’enregistrement d’un retrait physique par l’administration. Le retrait est tracé par le statut `RETIRE` sur le document et par un rendez-vous `HONORE`, existant ou créé à cet effet.

```mermaid
sequenceDiagram
    participant Admin as Administrateur
    participant Systeme as Système
    participant Service as Service retraits
    participant BDD as Base de données
    participant Notif as Service notif / email
    participant Eleve as Élève

    Admin->>Systeme: confirme retrait physique
    Systeme->>Service: transmet documentId et commentaire
    Service->>BDD: vérifie document dans le périmètre admin
    BDD-->>Service: document + élève
    Service->>BDD: cherche RDV actif lié au document
    BDD-->>Service: RDV trouvé ou absent
    Service->>BDD: transaction document → RETIRE
    alt RDV existe
        Service->>BDD: met RDV → HONORE
    else Aucun RDV
        Service->>BDD: crée RDV HONORE comme trace de retrait
    end
    Service->>Notif: notifier retrait confirmé
    Notif->>BDD: crée notification et MailLog
    Notif-->>Eleve: email d'accusé de réception
    Service-->>Systeme: retrait enregistré
    Systeme-->>Admin: historique mis à jour
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’administrateur confirme le retrait. | Le système initie l’enregistrement. |
| 2 | Le document est vérifié. | Le périmètre admin est respecté. |
| 3 | Le document passe à `RETIRE`. | Le retrait est validé. |
| 4 | Le rendez-vous est honoré ou créé. | La traçabilité du retrait est conservée. |
| 5 | L’élève est notifié. | Un email et une notification sont créés. |

---

## 4. Diagramme MCD / MLD

Ce diagramme logique présente les principales tables issues du schéma Prisma actuel. Il complète le diagramme de classes en précisant les clés primaires, clés étrangères et relations relationnelles entre les entités.

```mermaid
erDiagram
  ORGANISMES ||--o{ USERS : possede
  ORGANISMES ||--o{ ANTENNES_REGIONALES : possede
  ORGANISMES ||--o{ DOCUMENTS : gere
  ORGANISMES ||--o{ DUPLICATAS : gere

  ANTENNES_REGIONALES ||--o{ USERS : rattache
  ANTENNES_REGIONALES ||--o{ DOCUMENTS : traite
  ANTENNES_REGIONALES ||--o{ DUPLICATAS : traite

  USERS ||--o{ EXAMENS_VALIDES : obtient
  USERS ||--o{ DOCUMENTS : demande
  USERS ||--o{ RENDEZ_VOUS : prend
  USERS ||--o{ NOTIFICATIONS : recoit
  USERS ||--o{ MAIL_LOGS : journalise
  USERS ||--o{ DUPLICATAS : demande
  USERS ||--o{ RECUS : recoit

  DOCUMENTS ||--o{ RENDEZ_VOUS : concerne
  DOCUMENTS ||--o| PAIEMENTS : finance
  DUPLICATAS ||--o| PAIEMENTS : exige
  PAIEMENTS ||--o{ RECUS : genere
  DISPONIBILITES_RDV ||--o| RENDEZ_VOUS : reserve

  ORGANISMES {
    string id PK
    string nom UK
  }

  ANTENNES_REGIONALES {
    string id PK
    string nom
    string region UK
    string ville
    string organismeId FK
  }

  USERS {
    string id PK
    string authUserId UK
    string role
    string email UK
    string matricule UK
    string nom
    string prenom
    datetime dateNaissance
    string nomService
    int maxRdvParJour
    string organismeId FK
    string antenneRegionaleId FK
  }

  EXAMENS_VALIDES {
    string id PK
    string diplomeType
    int anneeSession
    string centreExamen
    string regionComposition
    string eleveId FK
  }

  DOCUMENTS {
    string id PK
    string typeDocument
    string diplomeType
    string statut
    string centreExamen
    string regionComposition
    string eleveId FK
    string organismeId FK
    string antenneRegionaleId FK
  }

  RENDEZ_VOUS {
    string id PK
    datetime dateRdv
    string heureRdv
    string lieu
    string statut
    string commentaire
    string adminId FK
    string eleveId FK
    string documentId FK
    string disponibiliteId FK
  }

  NOTIFICATIONS {
    string id PK
    string typeNotification
    string statut
    string message
    datetime dateEnvoi
    string userId FK
  }

  MAIL_LOGS {
    string id PK
    string to
    string subject
    string status
    string error
    string userId FK
  }

  DUPLICATAS {
    string id PK
    string typeDocument
    string nomDuplicata
    string statut
    string intruction
    string regionComposition
    string eleveId FK
    string organismeId FK
    string antenneRegionaleId FK
  }

  PAIEMENTS {
    string id PK
    string statut
    string modePaiment
    string duplicataId FK
    string documentAcademiqueId FK
  }

  RECUS {
    string id PK
    string numero UK
    float montant
    datetime dateEmission
    string modePaiement
    string commentaire
    string userId FK
    string paiementId FK
  }
```

**Tables principales :**

| Table | Rôle |
|-------|------|
| `users` | Profils applicatifs des élèves et administrateurs. |
| `organismes` | Organismes responsables, OBC ou DECC. |
| `antennes_regionales` | Antennes régionales OBC. |
| `examens_valides` | Examens validés permettant de générer les documents. |
| `documents` | Documents académiques suivis par l’application. |
| `rendez_vous` | Rendez-vous et retraits honorés. |
| `notifications` | Notifications applicatives. |
| `mail_logs` | Journalisation des emails. |
| `duplicatas` | Demandes de duplicata. |
| `paiements` | Paiements liés aux duplicatas et documents. |
| `recus` | Reçus de paiement. |

---

## 5. Notes de Cohérence avec le Code Actuel

| Point | Décision de cohérence |
|-------|-----------------------|
| Utilisateur / User | Les diagrammes utilisent `Utilisateur` pour la lisibilité UML, mais le modèle Prisma réel est `User`. |
| Étudiant / Élève | Les anciens diagrammes parlaient d’`Étudiant`; la documentation actuelle privilégie `Élève`, cohérent avec le rôle `ELEVE`. |
| Mot de passe | L’attribut `password` n’est pas stocké dans Prisma ; il est géré par Supabase Auth. |
| Administrateur | Il n’existe pas de table séparée `Administrateur`; il s’agit d’un `User` avec rôle `ADMINISTRATEUR`. |
| Service délivrance | Le rôle séparé `SERVICE_DELIVRANCE` reste une évolution possible ; il est actuellement inclus dans `ADMINISTRATEUR`. |
| Notifications push | Les anciens diagrammes mentionnaient le push ; le MVP actuel réalise notification en base + email. |
| Paiement Mobile Money | Le vrai flux Orange Money / MTN Money reste à finaliser ; le MVP gère un paiement applicatif simplifié avec reçu. |
| Probatoire | Le Probatoire ne donne pas lieu à un diplôme original. |
| BEPC | Les documents du BEPC sont rattachés à la DECC. |
| Baccalauréat original | Le diplôme original du Baccalauréat est routé vers une antenne régionale OBC et nécessite un rendez-vous. |
| Retrait physique | Un retrait est représenté par un document `RETIRE` et un rendez-vous `HONORE`. |

---

*Document généré le 27/05/2026 — Version 2.0*

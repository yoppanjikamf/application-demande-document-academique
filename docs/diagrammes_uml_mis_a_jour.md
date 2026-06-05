# DIAGRAMMES UML — Application de Gestion des Documents Scolaires
## OBC / DECC — Cameroun | Version 2.1

---

## TABLE DES MATIÈRES

1. Diagramme de Cas d'Utilisation
2. Diagramme de Classes
3. Diagrammes de Séquence
4. Diagramme MCD / MLD
5. Notes de Cohérence avec le Code Actuel

---

## Note de synchronisation du 02/06/2026

Le code actuel contient trois roles applicatifs:

- `ELEVE`
- `ADMINISTRATEUR`
- `AGENT_CENTRE_EXAMEN`

Les diagrammes ci-dessous sont alignes avec le code et les regles metier validees le 02/06/2026. Les images PNG/SVG correspondantes sont dans `diagrammes-images/` et les sources Mermaid separees sont dans `diagrammes-mermaid/`.

Mise a jour de conformité: les versions finales conformes a la notation de reference fournie sont des diagrammes personnalises et detailles, generes dans `docs/diagrammes-images/`:

- `diagramme-mcd-v2.png` / `.svg`: MCD detaille avec toutes les entites, associations en ovales, cardinalites et liaisons.
- `diagramme-mld-v2.png` / `.svg`: MLD detaille avec toutes les tables Prisma, tous les attributs, cles PK/FK et traits de liaison rattaches aux tables concernees.
- `diagramme-classes-v2.png` / `.svg`: diagramme de classes detaille aligne sur les tables et relations actuelles.
- `diagramme-mcd-mld-v2.png` / `.svg`: planche de synthese qui renvoie vers les versions detaillees.

Important: pour les livrables Word/PDF, utiliser les images finales ci-dessus plutot que les anciens rendus Mermaid lorsque la notation attendue est celle du modele de reference.

Le document de reference final est `ETAT_FINAL_PROJET.md`.

Mise a jour du 04/06/2026 — diagrammes de sequence **v3 soutenance** :

- Sources : `docs/diagrammes-mermaid/sequence-*-v3-soutenance.mmd`
- Images PNG/SVG : `docs/diagrammes-images/sequence-*-v3-soutenance.{png,svg}`
- Structure : Acteur → Systeme DR-DOCSCOL → Base de donnees, avec `alt` Donnees valides / invalides
- Regeneration : `npm run diagrams:export-v3`
- Cas supplementaires par rapport a la v2 : ajout eleves admin (SEQ-09), demande releve/diplome par l eleve (SEQ-10)

Pour la soutenance, preferer les images v3 ; la section 3 ci-dessous conserve les diagrammes v2 detailles (composants API, Supabase, etc.).

---

## 1. Diagramme de Cas d'Utilisation

Ce diagramme représente les interactions entre les acteurs principaux et le système de gestion des documents scolaires. Les acteurs humains restent à l’extérieur du système, tandis que les cas d’utilisation sont regroupés dans le rectangle système intitulé "Gestion de retrait de documents scolaires".

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "22px", "primaryColor": "#eaf6ff", "primaryBorderColor": "#1f6f9f", "lineColor": "#4b5563"}}}%%
flowchart TB
    Connexion([Se connecter])

    subgraph Diagramme["Diagramme de cas d'utilisation"]
        direction TB

        subgraph BlocEleve["Espace eleve"]
            direction LR
            Eleve["Acteur : Eleve"]
            subgraph CasEleve[" "]
                direction TB
                E1([Activer son compte])
                E2([Consulter ses documents])
                E3([Demander un releve])
                E4([Demander un duplicata])
                E5([Payer un duplicata])
                E6([Prendre rendez-vous])
                E7([Annuler un rendez-vous])
                E8([Consulter notifications et recus])
            end

            Eleve --> E1
            Eleve --> E2
            Eleve --> E3
            Eleve --> E4
            Eleve --> E5
            Eleve --> E6
            Eleve --> E7
            Eleve --> E8
        end

        subgraph BlocAdmin["Espace administrateur OBC / DECC"]
            direction LR
            Admin["Acteur : Admin OBC / DECC"]
            subgraph CasAdmin[" "]
                direction TB
                A1([Importer les eleves])
                A2([Verifier les examens valides])
                A3([Publier un document])
                A4([Traiter un duplicata])
                A5([Consulter les rendez-vous])
                A6([Confirmer un retrait antenne])
                A7([Consulter paiements et recus])
                A8([Envoyer notifications])
            end

            Admin --> A1
            Admin --> A2
            Admin --> A3
            Admin --> A4
            Admin --> A5
            Admin --> A6
            Admin --> A7
            Admin --> A8
        end

        subgraph BlocAgent["Espace agent centre d'examen"]
            direction LR
            Agent["Acteur : Agent centre"]
            subgraph CasAgent[" "]
                direction TB
                C1([Consulter les rendez-vous transmis])
                C2([Confirmer le retrait effectue])
            end

            Agent --> C1
            Agent --> C2
        end

        subgraph BlocSysteme["Systeme"]
            direction LR
            Systeme["Acteur : Systeme interne"]
            subgraph CasSysteme[" "]
                direction TB
                S1([Router OBC / DECC])
                S2([Determiner centre ou antenne])
                S3([Transmettre RDV a l'agent centre])
                S4([Envoyer email et notification])
                S5([Journaliser actions])
                S6([Confirmer paiement webhook])
            end

            Systeme --> S1
            Systeme --> S2
            Systeme --> S3
            Systeme --> S4
            Systeme --> S5
            Systeme --> S6
        end
    end

    E1 -.-> Connexion
    E2 -.-> Connexion
    E3 -.-> Connexion
    E4 -.-> Connexion
    E5 -.-> Connexion
    E6 -.-> Connexion
    E7 -.-> Connexion
    E8 -.-> Connexion
    A1 -.-> Connexion
    A2 -.-> Connexion
    A3 -.-> Connexion
    A4 -.-> Connexion
    A5 -.-> Connexion
    A6 -.-> Connexion
    A7 -.-> Connexion
    A8 -.-> Connexion
    C1 -.-> Connexion
    C2 -.-> Connexion

    E3 --> S1
    E4 --> S1
    E6 --> S2
    S2 --> S3
    A3 --> S4
    A4 --> S4
    C2 --> S5
    E5 --> S6

    Eleve ==> Admin
    Admin ==> Agent
    Agent ==> Systeme

    classDef actor fill:#ffffff,stroke:#111827,stroke-width:2px,color:#111827;
    classDef usecase fill:#eef8ff,stroke:#1f6f9f,stroke-width:2px,color:#0f172a;
    classDef system fill:#fff7ed,stroke:#c2410c,stroke-width:2px,color:#0f172a;
    class Eleve,Admin,Agent,Systeme actor;
    class E1,E2,E3,E4,E5,E6,E7,E8,A1,A2,A3,A4,A5,A6,A7,A8,C1,C2,Connexion usecase;
    class S1,S2,S3,S4,S5,S6 system;
```

**Acteurs :**

| Acteur | Rôle |
|--------|------|
| Étudiant | Élève ou diplômé souhaitant consulter, demander ou retirer un document scolaire. |
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

Version detaillee: `docs/diagrammes-images/diagramme-classes-v2.png`.

Version principale pour la soutenance (structure en croix du modele de reference + 9 classes metier : Eleve, Document, Duplicata, ExamenValide, CentreExamen, RendezVous, Organisme, Paiement, types de documents) : `docs/diagrammes-images/diagramme-classes-soutenance.png`. Regeneration : `npm run diagrams:classes-soutenance`.

Version technique exhaustive (20 tables Prisma) : `diagramme-classes-v2.png` via `npm run diagrams:conform`.

Cette image remplace le rendu Mermaid pour la presentation finale lorsque la notation stricte du modele fourni est exigee.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px", "primaryColor": "#eaf6ff", "primaryBorderColor": "#1f6f9f", "lineColor": "#4b5563"}}}%%
classDiagram
    direction LR

    class Utilisateur {
        +String id
        +String email
        +String matricule
        +String nom
        +String prenom
        +Role role
        +DateTime derniereConnexion
        +seConnecter()
        +modifierProfil()
    }

    class Eleve {
        +Date dateNaissance
        +consulterDocuments()
        +demanderReleve()
        +demanderDuplicata()
        +prendreRendezVous()
        +effectuerPaiement()
    }

    class Administrateur {
        +String nomService
        +String organisme
        +String region
        +importerEleves()
        +publierDocument()
        +traiterDuplicata()
        +confirmerRetraitAntenne()
    }

    class AgentCentreExamen {
        +String centreExamen
        +consulterRendezVousTransmis()
        +confirmerRetraitEffectue()
    }

    class Organisme {
        +String id
        +String nom
    }

    class AntenneRegionale {
        +String id
        +String region
        +String ville
    }

    class CentreExamen {
        +String id
        +String nom
        +String region
    }

    class ExamenValide {
        +DiplomePrincipal diplomeType
        +Int anneeSession
        +String centreExamen
        +String regionComposition
    }

    class DocumentAcademique {
        +String id
        +TypeDocument typeDocument
        +DiplomePrincipal diplomeType
        +StatutDocument statut
        +String lieuRetrait
        +rendreDisponible()
        +verifierStatut()
        +marquerRetire()
    }

    class Releve {
        +String nomReleve
        +String instruction
        +faireDemandeReleve()
    }

    class Duplicata {
        +String nomDuplicata
        +String motif
        +String instruction
        +creerDemande()
        +verifierPaiement()
        +validerDuplicata()
    }

    class Diplome {
        +String nomDiplome
        +String instruction
        +Int anneeObtention
        +faireDemandeDiplome()
    }

    class RendezVous {
        +String id
        +Date dateRdv
        +String heureRdv
        +String lieu
        +StatutRendezVous statut
        +planifier()
        +annuler()
        +confirmerRetrait()
    }

    class Paiement {
        +String id
        +StatutPaiement statut
        +String modePaiement
        +initierPaiement()
        +confirmerPaiement()
        +annulerPaiement()
    }

    class Recu {
        +String numero
        +Float montant
        +DateTime dateEmission
        +generer()
    }

    class Notification {
        +String typeNotification
        +String message
        +StatutNotification statut
        +envoyer()
        +marquerCommeLue()
    }

    Utilisateur <|-- Eleve
    Utilisateur <|-- Administrateur
    Utilisateur <|-- AgentCentreExamen

    DocumentAcademique <|-- Releve
    DocumentAcademique <|-- Duplicata
    DocumentAcademique <|-- Diplome

    Organisme "1" --> "0..*" AntenneRegionale : possede
    Organisme "1" --> "0..*" Administrateur : rattache
    AntenneRegionale "1" --> "0..*" DocumentAcademique : retrait antenne
    CentreExamen "1" --> "0..*" AgentCentreExamen : affecte
    CentreExamen "1" --> "0..*" RendezVous : recoit RDV transmis

    Eleve "1" --> "0..*" ExamenValide : possede
    Eleve "1" --> "0..*" DocumentAcademique : demande
    Eleve "1" --> "0..*" RendezVous : prend
    Eleve "1" --> "0..*" Notification : recoit

    Administrateur "1" --> "0..*" DocumentAcademique : publie
    Administrateur "1" --> "0..*" RendezVous : planifie
    AgentCentreExamen "1" --> "0..*" RendezVous : confirme retrait

    DocumentAcademique "1" --> "0..*" RendezVous : retrait planifie
    Duplicata "1" --> "1" Paiement : exige
    Paiement "1" --> "0..*" Recu : produit
```

**Description des classes :**

| Classe | Rôle |
|--------|------|
| Utilisateur | Classe mère logique de tous les utilisateurs du système ; dans le code, elle correspond au modèle Prisma `User`. |
| Eleve | Élève ou diplômé utilisant l’application pour consulter, demander, payer et réserver. |
| Administrateur | Agent OBC / DECC gérant les documents, imports, rendez-vous, retraits et statistiques. |
| Organisme | Structure responsable des documents, actuellement OBC ou DECC. |
| AntenneRegionale | Antenne régionale OBC ou DECC utilisée selon l'organisme, le diplome et la region de composition. |
| ExamenValide | Examen obtenu par l’élève, utilisé pour déterminer les documents demandables. |
| DocumentAcademique | Entité centrale représentant un document scolaire : diplôme, relevé ou duplicata. |
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

### Version v3 soutenance (recommandee pour le dossier)

| Ref. | Image | Cas metier |
|------|-------|------------|
| SEQ-01 | `diagrammes-images/sequence-01-inscription-v3-soutenance.png` | Activation compte eleve |
| SEQ-02 | `diagrammes-images/sequence-02-connexion-v3-soutenance.png` | Connexion multi-role |
| SEQ-03 | `diagrammes-images/sequence-03-consultation-documents-v3-soutenance.png` | Consultation Mes documents |
| SEQ-04 | `diagrammes-images/sequence-04-notification-disponibilite-v3-soutenance.png` | Admin : disponibilite + notification |
| SEQ-05 | `diagrammes-images/sequence-05-duplicata-paiement-v3-soutenance.png` | Duplicata et paiement |
| SEQ-06 | `diagrammes-images/sequence-06-rendez-vous-v3-soutenance.png` | RDV planifie par l eleve |
| SEQ-07 | `diagrammes-images/sequence-07-statut-document-v3-soutenance.png` | Admin : changement de statut |
| SEQ-08 | `diagrammes-images/sequence-08-retrait-physique-v3-soutenance.png` | Agent : confirmation retrait |
| SEQ-09 | `diagrammes-images/sequence-09-ajout-eleve-admin-v3-soutenance.png` | Admin : ajout manuel ou import CSV |
| SEQ-10 | `diagrammes-images/sequence-10-demande-document-v3-soutenance.png` | Eleve : demande releve ou diplome |

Formats vectoriels : remplacer `.png` par `.svg` si besoin.

### Version v2 detaillee (reference technique)

### SEQ-01 — Inscription et activation du compte

Ce diagramme décrit le processus d’inscription d’un élève dans le MVP actuel. L’élève ne crée pas un compte totalement libre : son matricule et son email doivent déjà exister dans la base métier, puis le système active ou crée le compte Supabase Auth correspondant.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px"}}}%%
sequenceDiagram
    autonumber
    actor Eleve
    participant UI as Interface inscription
    participant Auth as Supabase Auth
    participant API as API interne
    participant DB as PostgreSQL / Prisma
    participant Mail as Service email

    Eleve->>UI: saisit matricule, email et mot de passe
    UI->>API: demande activation du compte
    API->>DB: recherche eleve par matricule
    DB-->>API: profil eleve et examens valides
    API->>Auth: cree le compte authentifie
    Auth-->>API: authUserId
    API->>DB: lie authUserId au profil eleve
    API->>Mail: envoie email de bienvenue
    API-->>UI: activation reussie
    UI-->>Eleve: redirection tableau de bord
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
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px"}}}%%
sequenceDiagram
    autonumber
    actor Utilisateur
    participant UI as Page connexion
    participant Auth as Supabase Auth
    participant API as Middleware / API
    participant DB as PostgreSQL / Prisma

    Utilisateur->>UI: saisit email et mot de passe
    UI->>Auth: signInWithPassword()
    Auth-->>UI: session
    UI->>API: charge le profil applicatif
    API->>DB: recherche user par authUserId
    DB-->>API: role et rattachement
    API-->>UI: profil complet
    alt Eleve
        UI-->>Utilisateur: ouvre /dashboard
    else Admin OBC / DECC
        UI-->>Utilisateur: ouvre /admin
    else Agent centre
        UI-->>Utilisateur: ouvre /centre-examen
    end
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’utilisateur saisit ses identifiants. | Le système reçoit matricule, email et mot de passe. |
| 2 | Prisma vérifie le matricule et l’email. | Les erreurs de couple matricule/email sont bloquées. |
| 3 | Supabase Auth vérifie le mot de passe. | Une session sécurisée est ouverte. |
| 4 | Prisma met à jour la dernière connexion. | La traçabilité de connexion est conservée. |
| 5 | L’utilisateur se déconnecte. | La session Supabase est fermée. |

### SEQ-03 — Consultation des documents scolaires

Ce diagramme décrit la consultation des documents par un élève connecté. Le système garantit que seuls les documents de l’élève courant sont chargés, puis affiche le statut, le lieu de retrait et l’éventuel rendez-vous actif.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px"}}}%%
sequenceDiagram
    autonumber
    actor Eleve
    participant UI as Tableau de bord
    participant API as API documents
    participant Route as Service routage
    participant DB as PostgreSQL / Prisma

    Eleve->>UI: ouvre ses documents
    UI->>API: GET documents eleve
    API->>DB: charge examens valides, documents, duplicatas, RDV
    DB-->>API: donnees eleve
    API->>Route: calcule organisme et lieu de retrait
    Route-->>API: OBC / DECC, centre ou antenne
    API-->>UI: liste documents et actions autorisees
    UI-->>Eleve: affiche statut, lieu, paiement ou RDV
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
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px"}}}%%
sequenceDiagram
    autonumber
    actor Admin as Admin OBC / DECC
    participant UI as Interface admin
    participant API as API statut document
    participant DB as PostgreSQL / Prisma
    participant Notif as Notifications
    participant Eleve as Eleve

    Admin->>UI: marque le document disponible
    UI->>API: PATCH statut DISPONIBLE
    API->>DB: met a jour le document
    API->>DB: identifie le lieu de retrait
    alt Retrait centre d'examen
        API->>Notif: message avec prise de RDV obligatoire
        Notif-->>Eleve: notification document disponible
    else Retrait antenne regionale
        API->>Notif: message avec service regional concerne
        Notif-->>Eleve: notification document disponible
    end
    API-->>UI: statut mis a jour
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
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px"}}}%%
sequenceDiagram
    autonumber
    actor Eleve
    participant UI as Tableau de bord
    participant API as Action duplicata
    participant Pay as Service paiement
    participant DB as PostgreSQL / Prisma
    participant Admin as Admin OBC / DECC

    Eleve->>UI: demande un duplicata
    UI->>API: envoie motif, examen, justificatif et mode paiement
    API->>DB: verifie eligibilite et delai
    API->>DB: cree la demande duplicata
    API->>Pay: initie paiement applicatif
    Pay-->>API: paiement EFFECTUE
    API->>DB: cree paiement et recu
    API->>Admin: notifie nouvelle demande duplicata
    API-->>UI: demande enregistree
    UI-->>Eleve: affiche recu et statut de traitement
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
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px"}}}%%
sequenceDiagram
    autonumber
    actor Eleve
    participant UI as Interface eleve
    participant API as API rendez-vous
    participant Route as Service routage
    participant DB as PostgreSQL / Prisma
    participant Agent as Agent centre d'examen
    participant Admin as Admin antenne

    Eleve->>UI: choisit un creneau
    UI->>API: POST rendez-vous document
    API->>DB: verifie document DISPONIBLE et creneau libre
    API->>Route: determine lieu de retrait
    Route-->>API: centre d'examen ou antenne regionale
    API->>DB: cree rendez-vous statut PLANIFIE
    alt Retrait centre d'examen
        API->>Agent: transmet le rendez-vous planifie
    else Retrait antenne regionale
        API->>Admin: rend le rendez-vous visible a l'antenne
    end
    API-->>UI: rendez-vous planifie
    UI-->>Eleve: affiche date, heure et lieu

    opt Annulation avant retrait
        Eleve->>UI: annule le rendez-vous
        UI->>API: DELETE rendez-vous
        API->>DB: passe le rendez-vous a ANNULE
        API-->>UI: annulation confirmee
    end
```

**Étapes clés :**

| Étape | Action | Résultat |
|-------|--------|----------|
| 1 | L’élève demande un rendez-vous. | Le système vérifie si le document nécessite réellement un RDV. |
| 2 | Le calendrier est calculé. | Week-ends, jours fériés, quotas et créneaux actifs sont pris en compte. |
| 3 | L’élève choisit date et heure. | Le système valide le créneau. |
| 4 | Le rendez-vous est créé. | Le statut devient `PLANIFIE` et il est transmis au service concerné. |
| 5 | L’élève annule plus tard. | Le statut devient `ANNULE`. |

### SEQ-07 — Mise à jour du statut d’un document

Ce diagramme complète le scénario de notification en montrant les contrôles administratifs et les effets métier. Lorsqu’un document est marqué `RETIRE`, les rendez-vous actifs liés sont passés à `HONORE`.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px"}}}%%
sequenceDiagram
    autonumber
    actor Admin as Admin OBC / DECC
    participant UI as Interface admin
    participant API as API statut
    participant DB as PostgreSQL / Prisma
    participant Notif as Service notification
    participant Eleve

    Admin->>UI: modifie le statut du document
    UI->>API: PATCH document
    API->>DB: verifie portee OBC / DECC / region
    alt Statut DISPONIBLE
        API->>DB: enregistre DISPONIBLE
        API->>Notif: notifie document disponible
        Notif-->>Eleve: invitation a prendre RDV si necessaire
    else Statut RETIRE en antenne
        API->>DB: enregistre RETIRE
        API->>DB: marque RDV actif HONORE si existe
        API->>Notif: notifie retrait confirme
    else Statut PAS_DISPONIBLE
        API->>DB: remet en attente
    end
    API-->>UI: statut actualise
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
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px"}}}%%
sequenceDiagram
    autonumber
    actor Agent as Agent centre d'examen
    participant UI as Espace centre d'examen
    participant API as API confirmation retrait
    participant DB as PostgreSQL / Prisma
    participant Notif as Service notification
    participant Eleve

    Agent->>UI: consulte les rendez-vous transmis
    UI->>API: GET rendez-vous PLANIFIE / CONFIRME du centre
    API->>DB: filtre par centre d'examen de l'agent
    DB-->>API: liste rendez-vous
    API-->>UI: rendez-vous a traiter

    Agent->>UI: confirme que le retrait est effectue
    UI->>API: POST confirmer retrait
    API->>DB: verifie centre, statut PLANIFIE ou CONFIRME
    API->>DB: met le document a RETIRE
    API->>DB: met le rendez-vous a HONORE
    API->>Notif: notifie retrait confirme
    Notif-->>Eleve: document retire
    API-->>UI: retrait confirme
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

Versions finales conformes:

- MCD detaille: `docs/diagrammes-images/diagramme-mcd-v2.png`
- MLD detaille: `docs/diagrammes-images/diagramme-mld-v2.png`
- Planche MCD/MLD synthetique: `docs/diagrammes-images/diagramme-mcd-mld-v2.png`

Ces images listent les attributs des tables du schema Prisma actuel et corrigent les liaisons afin qu'elles soient rattachees aux tables concernees.

```mermaid
%%{init: {"theme": "base", "themeVariables": {"fontFamily": "Arial", "fontSize": "20px", "primaryColor": "#eaf6ff", "primaryBorderColor": "#1f6f9f", "lineColor": "#4b5563"}}}%%
erDiagram
    ORGANISMES ||--o{ ANTENNES_REGIONALES : possede
    ORGANISMES ||--o{ USERS : rattache
    ORGANISMES ||--o{ DOCUMENTS : gere
    ORGANISMES ||--o{ DUPLICATAS : gere

    ANTENNES_REGIONALES ||--o{ USERS : rattache
    ANTENNES_REGIONALES ||--o{ DOCUMENTS : retrait_antenne
    ANTENNES_REGIONALES ||--o{ DUPLICATAS : retrait_antenne

    CENTRES_EXAMEN ||--o{ USERS : affecte_agent
    CENTRES_EXAMEN ||--o{ RENDEZ_VOUS : recoit_rdv_transmis

    USERS ||--o{ EXAMENS_VALIDES : possede
    USERS ||--o{ DOCUMENTS : demande
    USERS ||--o{ DUPLICATAS : demande
    USERS ||--o{ RENDEZ_VOUS : prend
    USERS ||--o{ RENDEZ_VOUS : planifie
    USERS ||--o{ RENDEZ_VOUS : confirme_retrait
    USERS ||--o{ NOTIFICATIONS : recoit
    USERS ||--o{ MAIL_LOGS : journalise
    USERS ||--o{ RECUS : recoit

    DOCUMENTS ||--o{ RENDEZ_VOUS : retrait_planifie
    DOCUMENTS ||--o| PAIEMENTS : paiement_optionnel
    DOCUMENTS ||--o| RELEVES : detail_releve
    DOCUMENTS ||--o| DIPLOMES : detail_diplome

    DUPLICATAS ||--|| PAIEMENTS : paiement
    DUPLICATAS ||--o| RELEVES : duplicata_releve
    DUPLICATAS ||--o| DIPLOMES : duplicata_diplome
    PAIEMENTS ||--o{ RECUS : produit

    ORGANISMES {
        string id PK
        string nom UK
        datetime createdAt
        datetime updatedAt
    }

    ANTENNES_REGIONALES {
        string id PK
        string nom
        string region
        string ville
        string organismeId FK
    }

    CENTRES_EXAMEN {
        string id PK
        string nom
        string region UK
        string ville
    }

    USERS {
        string id PK
        string authUserId UK
        string email UK
        string matricule UK
        string role
        string organismeId FK
        string antenneRegionaleId FK
        string centreExamenId FK
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

    RENDEZ_VOUS {
        string id PK
        datetime dateRdv
        string heureRdv
        string lieu
        string statut
        string adminId FK
        string eleveId FK
        string documentId FK
        string retraitConfirmeParId FK
        datetime retraitConfirmeAt
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
        string paiementId FK
        string userId FK
    }

    NOTIFICATIONS {
        string id PK
        string typeNotification
        string statut
        string message
        string userId FK
    }

    MAIL_LOGS {
        string id PK
        string to
        string subject
        string status
        string userId FK
    }
```

**Tables principales :**

| Table | Rôle |
|-------|------|
| `users` | Profils applicatifs des élèves et administrateurs. |
| `organismes` | Organismes responsables, OBC ou DECC. |
| `antennes_regionales` | Antennes régionales OBC. |
| `examens_valides` | Examens validés permettant de générer les documents. |
| `documents` | Documents scolaires suivis par l’application. |
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

*Document mis a jour le 02/06/2026 — Version 2.1*

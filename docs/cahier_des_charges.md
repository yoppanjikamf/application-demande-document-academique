# CAHIER DES CHARGES

## Application web de gestion des retraits de documents scolaires — OBC / DECC

**Diplômes, relevés de notes et duplicatas**

**Cameroun — 2026 | Version 3.0**

---

## TABLE DES MATIÈRES

| N° | Section | Contenu dans ce document |
|----|---------|--------------------------|
| **I** | Introduction | §1 Contexte & problématique, §2 Objectifs, §3 Périmètre |
| **II** | Définitions des concepts | §4 Définitions des concepts |
| **III** | Besoins fonctionnels & non fonctionnels | §5 Besoins fonctionnels, §6 Besoins non fonctionnels, §3.4 Règles métier |
| **IV** | Acteurs (bénéficiaires & utilisateurs) | §7 Acteurs |
| **V** | Architecture visée | §8 Architecture visée |
| **VI** | Ressources | §9 Ressources |
| **VII** | Planification | §10 Planification |
| **VIII** | Budget | §11 Budget |
| **IX** | Clauses juridiques | §12 Clauses juridiques |
| **X** | Conclusion | §13 Conclusion |
| — | Annexes | §14 Contraintes, §15 Glossaire technique, §16 État d'implémentation |

---

# I. INTRODUCTION

## 1. CONTEXTE & PROBLÉMATIQUE

### 1.1 — Contexte et origine du projet

Au Cameroun, la délivrance et le retrait des documents scolaires, notamment les diplômes, relevés de notes, attestations et duplicatas, demeurent encore fortement dépendants de procédures physiques et manuelles. Les élèves, anciens élèves et diplômés doivent souvent se déplacer plusieurs fois vers les centres d’examen, les antennes régionales ou les services administratifs pour vérifier la disponibilité d’un document, déposer une demande, obtenir des informations de retrait ou récupérer physiquement le document attendu.

Cette organisation entraîne des pertes de temps, des frais de transport, des files d’attente et un manque de visibilité sur l’état réel des demandes. Du côté de l’administration, la gestion manuelle des dossiers augmente la charge de travail, favorise les erreurs de saisie, complique la traçabilité et rend difficile le pilotage statistique des retraits. La transformation numérique offre donc une opportunité concrète de moderniser ce processus tout en sécurisant les données et en améliorant l’expérience des usagers.

Le présent projet consiste à concevoir une application web de gestion des retraits de documents scolaires pour le cas OBC / DECC. L’application permet aux élèves de consulter leurs documents, demander certains documents, suivre les statuts, recevoir des notifications, effectuer un paiement lorsque nécessaire et planifier un rendez-vous de retrait. Elle permet également aux administrateurs de gérer les élèves, les documents, les rendez-vous, les retraits, les notifications, les reçus, les imports CSV et les statistiques.

### 1.2 — Problématique

> ❝ ***Comment concevoir et développer une application web permettant de réduire les déplacements, les files d'attente et les délais de traitement dans le retrait des documents scolaires au Cameroun, afin de faire gagner du temps aux élèves et aux services OBC / DECC, tout en garantissant un suivi fiable et sécurisé des demandes ?*** ❞

### 1.3 — Problèmes identifiés

| Acteur | Problèmes rencontrés |
|--------|----------------------|
| Élèves | Déplacements multiples pour connaître la disponibilité des documents, manque de visibilité sur l’état d’avancement, files d’attente, délais de traitement élevés, coûts de transport, difficulté à obtenir les instructions exactes de retrait et absence de rappel fiable. |
| Administration | Gestion manuelle des dossiers, absence de système centralisé de suivi, charge administrative importante, risques d’erreurs humaines, risques de fraude, difficulté à tracer les retraits physiques et absence de tableaux de bord fiables. |

### 1.4 — Public cible

- Élèves et anciens élèves.
- Diplômés souhaitant récupérer un diplôme, un relevé ou un duplicata.
- Administrateurs OBC.
- Administrateurs DECC.
- Agents centres d'examen.
- Agents d'antennes regionales OBC / DECC.
- Services de délivrance des documents scolaires.
- Encadreurs, tuteurs et responsables chargés de valider le projet.

---

## 2. OBJECTIFS DU PROJET

### 2.1 — Objectif général

L’objectif général du projet est de concevoir et développer une application web sécurisée permettant la consultation, la demande, le suivi et le retrait physique des documents scolaires, tout en offrant à l’administration OBC / DECC un back-office centralisé pour gérer les élèves, les documents, les statuts, les rendez-vous, les retraits, les paiements, les reçus et les notifications.

### 2.2 — Objectifs spécifiques

| N° | Objectif |
|----|----------|
| OBJ-01 | Permettre aux élèves de consulter en temps réel la disponibilité de leurs documents scolaires. |
| OBJ-02 | Permettre aux élèves de demander un relevé de notes ou un duplicata lorsque les règles métier l’autorisent. |
| OBJ-03 | Gérer le paiement des demandes payantes, notamment les duplicatas, avec génération de reçu. |
| OBJ-04 | Envoyer des notifications applicatives et des emails lors des événements importants. |
| OBJ-05 | Simplifier la gestion administrative grâce à un back-office OBC / DECC. |
| OBJ-06 | Assurer la traçabilité complète des retraits physiques : qui retire, quel document, quand, où et sous quel statut. |
| OBJ-07 | Permettre à l’élève de planifier un rendez-vous de retrait lorsque le document nécessite un passage en centre d’examen ou en antenne régionale. |
| OBJ-08 | Appliquer les règles de routage entre OBC, DECC, centres d’examen et antennes régionales. |
| OBJ-09 | Garantir la sécurité, la confidentialité et la cohérence des données personnelles des élèves. |
| OBJ-10 | Fournir des statistiques administratives sur les documents, rendez-vous, paiements et retraits. |

---

## 3. PÉRIMÈTRE DU PROJET

### 3.1 — Inclus dans le projet

- Authentification avec Supabase Auth.
- Profils utilisateurs synchronisés dans Prisma.
- Gestion des rôles `ELEVE`, `ADMINISTRATEUR` et `AGENT_CENTRE_EXAMEN`.
- Activation d’un compte élève à partir d’un matricule déjà présent en base.
- Connexion par matricule, email et mot de passe.
- Déconnexion sécurisée.
- Modification du profil utilisateur.
- Consultation des documents scolaires de l’élève.
- Consultation du détail d’un document et des instructions de retrait.
- Demande de relevé de notes.
- Demande de duplicata avec diplôme cible, session, centre d’examen, motif et mode de paiement.
- Paiement applicatif simplifié pour les duplicatas avec barème différencié selon le document source.
- Préparation d’une API de paiement réelle pour un futur branchement Mobile Money ou carte bancaire.
- Génération et consultation de reçus.
- Notifications applicatives en base de données.
- Envoi d’emails via Nodemailer.
- Journalisation des emails envoyés ou échoués dans `mail_logs`.
- Back-office administrateur.
- Page d'accueil publique (landing) et consultation rapide par matricule.
- Import CSV en deux flux : élèves / examens / documents (`PAS_DISPONIBLE`) et disponibilisation (`DISPONIBLE`).
- Gestion des statuts de documents.
- Gestion des rendez-vous côté élève et côté administration.
- Annulation de rendez-vous par l’élève ou l’administration.
- Enregistrement des retraits physiques.
- Historique des retraits.
- Tableau de bord administratif.
- Quota journalier global de rendez-vous.
- Créneaux horaires actifs.
- Gestion des jours fériés et blocage des week-ends.
- Routage métier des documents entre OBC, DECC, centres d’examen et antennes régionales.
- Gestion des organismes `OBC` et `DECC`.
- Gestion des antennes régionales OBC et DECC.
- Gestion des agents centres d'examen.
- Gestion des examens validés par élève.

### 3.2 — Hors périmètre (exclus)

- Téléchargement numérique sécurisé des documents scolaires au format PDF.
- Vérification des documents par QR code pour les employeurs (tiers) — distinct du QR de consultation élève sur la landing.
- Intégration complète avec un ERP institutionnel existant.
- Passerelle Mobile Money réelle avec OTP, signature fournisseur et callback certifié, prévue pour une phase de production.
- Notifications push natives navigateur ou mobile.
- Paiement externe totalement certifie par un prestataire.
- Stockage objet durable des justificatifs de duplicata dans un bucket dédié (le MVP enregistre le nom du fichier dans les instructions du document).
- Mode hors ligne.
- Rôle séparé `SERVICE_DELIVRANCE`, actuellement intégré au rôle `ADMINISTRATEUR`.

### 3.3 — Acteurs et parties prenantes

> Le détail des acteurs, bénéficiaires et utilisateurs est développé au **§7 (section IV)**.

### 3.4 — Règles métier conservées

| Élément | Règle métier |
|---------|--------------|
| BEPC | Les documents du BEPC sont gérés par la DECC. |
| Probatoire | Le Probatoire est géré par l’OBC, mais ne donne pas lieu à un diplôme original. |
| BEPC original | L'original du BEPC se retire au centre d'examen avec un rendez-vous `PLANIFIE`. |
| BEPC relevé | Le relevé du BEPC se retire au centre d'examen avec un rendez-vous `PLANIFIE`. |
| BEPC duplicata | Le duplicata du BEPC se retire à l'antenne régionale DECC compétente après paiement, validation administrative et rendez-vous `PLANIFIE`. |
| Probatoire duplicata | Le duplicata du relevé Probatoire se retire à l'antenne régionale OBC compétente après paiement, validation administrative et rendez-vous `PLANIFIE`. |
| Probatoire | Le Probatoire est géré par l’OBC, ne donne pas lieu à un diplôme original et produit uniquement un relevé retiré au centre d'examen avec rendez-vous `PLANIFIE`. |
| Baccalauréat original | Le diplôme original du Baccalauréat est orienté vers une antenne régionale OBC et nécessite un rendez-vous. L'agent centre d'examen ne le voit pas. |
| Baccalauréat relevé | Le relevé du Baccalauréat se retire au centre d’examen avec un rendez-vous `PLANIFIE`. |
| Baccalauréat duplicata | Le duplicata du Baccalauréat se retire à l'antenne régionale OBC compétente après paiement, validation administrative et rendez-vous `PLANIFIE`. |
| Duplicata | Tous les duplicatas (BEPC, Probatoire, Baccalauréat) se retirent en antenne régionale. Le parcours est : formulaire + justificatifs + paiement → validation admin → `DISPONIBLE` → notification → rendez-vous → retrait confirmé par l'administrateur d'antenne. |
| Duplicata de relevé | Le duplicata d’un relevé de notes coûte 10 000 FCFA. |
| Duplicata d’original | Le duplicata d’un diplôme original coûte 15 000 FCFA. |
| Rendez-vous centre d'examen | L'élève planifie le rendez-vous depuis l'organisme concerné ; le rendez-vous est immédiatement transmis à l'agent du centre d'examen. |
| Agent centre d'examen | L'agent ne crée pas, ne planifie pas et n'annule pas les rendez-vous ; il confirme seulement le retrait physique effectué au centre d'examen. Il ne voit ni les duplicatas ni le diplôme original du Baccalauréat. |
| Statut document | Les statuts sont `PAS_DISPONIBLE`, `DISPONIBLE` et `RETIRE`. L'administrateur gère `PAS_DISPONIBLE` et `DISPONIBLE` pour tous les documents de son périmètre. Le passage à `RETIRE` est réservé aux retraits en antenne régionale ; pour les retraits au centre d'examen, seul l'agent confirme le `RETIRE`. |
| Statut rendez-vous | Les statuts sont `PLANIFIE`, `CONFIRME`, `ANNULE` et `HONORE`. |
| Statut paiement | Les statuts sont `EN_ATTENTE` et `EFFECTUE`. |
| Statut notification | Les statuts sont `ENVOYEE`, `RECUE` et `LUE`. |
| Consultation publique | Toute personne peut saisir un matricule sur `/consultation` ; seuls les élèves **déjà en base et compte activé** (`authUserId`) voient leurs statuts. Aucune création d'élève ni de document depuis cette page. |
| Import CSV élèves | Format OBC : Probatoire / Baccalauréat. Format DECC : BEPC uniquement. Pas de duplicata, pas de diplôme original Probatoire. Mot de passe **non** importé (activation via `/auth/register`). |
| Import CSV disponibilisation | Une ligne = un document à passer en `DISPONIBLE` ; l'élève doit exister en base. Colonnes : matricule, diplôme, type de document, session. |
| Matricule élève démo | Format seed : `DEMO2026` + 3 chiffres (ex. `DEMO2026002`). Fichiers démo : `docs/csv-demo/{region}/{obc|decc}/`. |

---

# II. DÉFINITIONS DES CONCEPTS

Cette section fixe le vocabulaire métier utilisé dans tout le document.

| Concept | Définition |
|---------|------------|
| **Document scolaire** | Diplôme original, relevé de notes ou duplicata lié à un examen validé (BEPC, Probatoire, Baccalauréat). |
| **Disponibilisation** | Action administrative qui fait passer un document de `PAS_DISPONIBLE` à `DISPONIBLE`, signalant qu'il peut être retiré selon les règles de routage. |
| **Consultation rapide** | Service public sur `/consultation` : l'élève saisit son matricule et voit les statuts, sans connexion complète au dashboard. |
| **QR code de consultation** | Code sur la landing page encodant l'URL de consultation publique ; distinct d'un futur QR de vérification pour employeurs. |
| **Activation de compte** | Création du mot de passe Supabase Auth à partir d'un matricule et d'un email déjà enregistrés par l'administration. |
| **OBC** | Office du Baccalauréat du Cameroun — organisme responsable du Probatoire et du Baccalauréat. |
| **DECC** | Organisme responsable des documents liés au BEPC dans le périmètre du projet. |
| **Antenne régionale** | Structure OBC ou DECC d'une région ; lieu de retrait pour certains documents (ex. duplicatas, Bac original). |
| **Centre d'examen** | Lieu de composition de l'élève ; lieu de retrait pour BEPC original/relevé, relevés Probatoire et Bac selon les règles. |
| **Rendez-vous (RDV)** | Créneau réservé par l'élève pour retirer physiquement un document disponible. |
| **Duplicata** | Copie officielle d'un document perdu ou détérioré ; parcours payant avec justificatifs et validation admin. |
| **Import élèves (CSV)** | Fichier admin créant ou mettant à jour élèves, examens et documents en statut initial `PAS_DISPONIBLE`. |
| **Import disponibilisation (CSV)** | Fichier admin passant des documents existants au statut `DISPONIBLE`. |
| **Matricule** | Identifiant unique de l'élève (ex. `DEMO2026002`) ; clé d'activation et de consultation. |
| **MVP** | Version minimale utilisable couvrant le parcours principal sans toutes les intégrations de production. |

---

# III. BESOINS FONCTIONNELS & NON FONCTIONNELS

> Les **exigences métier** détaillées (règles OBC/DECC, CSV, consultation) sont au **§3.4**. Les besoins ci-dessous en découlent.

## 5. BESOINS FONCTIONNELS

> Légende : 🔴 Obligatoire — 🟡 Important — 🟢 Optionnel

### 4.1 — Module Authentification & Gestion des accès

| ID | Fonctionnalité | Description détaillée | Priorité |
|----|----------------|----------------------|----------|
| F-01 | Inscription / activation | Activer un compte élève à partir d’un matricule et d’un email déjà présents dans la base Prisma, puis créer ou mettre à jour le compte Supabase Auth. | 🔴 |
| F-02 | Connexion / Déconnexion | Authentifier l’utilisateur avec matricule, email et mot de passe, ouvrir une session Supabase Auth et permettre la déconnexion. | 🔴 |
| F-03 | Gestion des rôles | Différencier les droits des rôles `ELEVE`, `ADMINISTRATEUR` et `AGENT_CENTRE_EXAMEN`, avec redirection vers `/dashboard`, `/admin` ou `/centre-examen`. | 🔴 |
| F-04 | Récupération du mot de passe | Prévoir un flux de réinitialisation par email sécurisé pour les comptes utilisateurs. | 🟡 |
| F-05 | Profil utilisateur | Permettre à l’utilisateur de modifier ses informations personnelles : nom, prénom, date de naissance pour l’élève, service pour l’administrateur. | 🟡 |

### 4.2 — Module Consultation des Documents scolaires

| ID | Fonctionnalité | Description détaillée | Priorité |
|----|----------------|----------------------|----------|
| F-06 | Espace Mes Documents | Afficher la liste des documents scolaires de l’élève connecté avec type, diplôme, statut, lieu de retrait et rendez-vous actif éventuel. | 🔴 |
| F-07 | Statut de disponibilité | Afficher clairement si un document est non disponible, disponible ou retiré. | 🔴 |
| F-08 | Instructions de retrait | Afficher l’adresse, le lieu, les pièces requises, les conditions de retrait et l’obligation éventuelle de rendez-vous. | 🔴 |
| F-09 | Demande de relevé de notes | Permettre à l’élève de créer ou suivre une demande de relevé selon l’examen validé. | 🟡 |
| F-10 | Demande de duplicata | Permettre une demande motivée de duplicata avec diplôme cible, session, centre d’examen, justificatif et paiement. | 🔴 |
| F-11 | Ajout au calendrier | Prévoir un export calendrier ou un rappel afin de ne pas manquer la date du retrait. | 🟡 |

> La **consultation rapide publique** (page `/consultation`, QR code sur la landing) est décrite au **§ 4.2 bis**.

### 4.2 bis — Module Consultation rapide publique (landing et QR code)

Ce module permet à un élève **déjà enregistré et ayant activé son compte** de vérifier rapidement l’état de ses documents **sans se connecter** au tableau de bord complet. Il répond au besoin de visibilité avant ou après activation, depuis un téléphone notamment.

| ID | Fonctionnalité | Description détaillée | Priorité |
|----|----------------|----------------------|----------|
| F-35 | Page d'accueil publique (landing) | Présenter le portail DR-DOCSCOL, les parcours OBC/DECC et un accès visible à la consultation rapide. Interface bilingue FR / EN. | 🔴 |
| F-36 | Consultation rapide par matricule | Page publique `/consultation` : saisie du matricule seul, affichage des statuts (`PAS_DISPONIBLE`, `DISPONIBLE`, `RETIRE`) et libellés des documents. **Aucune** création d'élève ni de document depuis cette page. | 🔴 |
| F-37 | QR code de consultation | Section « Consultation rapide » sur la landing avec QR code encodant l'URL `/consultation` du site public (`NEXT_PUBLIC_SITE_URL` en production). Le scan depuis un téléphone ouvre la même page que le lien « Ouvrir la consultation ». | 🔴 |
| F-38 | Contrôle d'accès consultation | Consultation autorisée uniquement si le matricule existe en base **et** que le compte élève est activé (`authUserId` renseigné). Sinon : message invitant à activer le compte via `/auth/register`. | 🔴 |
| F-39 | Limites de la consultation rapide | Pas d'instructions de retrait détaillées, pas de prise de rendez-vous, pas de paiement, pas de demande de duplicata depuis la consultation publique (réservé à l'espace connecté `/dashboard`). | 🔴 |

**Hors périmètre associé :** vérification des documents par QR code pour un **employeur** ou un **tiers** (authentification du document, lecture seule par un non-élève) — prévu en évolution future, distinct du QR élève sur la landing.

### 4.3 — Module Notifications

| ID | Fonctionnalité | Description détaillée | Priorité |
|----|----------------|----------------------|----------|
| F-12 | Notification de disponibilité | Créer une notification applicative et envoyer un email lorsque le statut d’un document passe à `DISPONIBLE`. | 🔴 |
| F-13 | Notification de rendez-vous | Informer par notification et email que le rendez-vous est planifié, avec document, date, heure, lieu et pièces à présenter. | 🔴 |
| F-14 | Notification de duplicata | Confirmer l’enregistrement d’une demande de duplicata par notification et email. | 🟡 |
| F-15 | Notification de retrait | Envoyer un accusé de retrait lorsque le document est marqué `RETIRE`. | 🟡 |
| F-16 | Historique des notifications | Permettre à l’élève de consulter les notifications reçues dans son tableau de bord. | 🟢 |
| F-17 | Rappel automatique | Prévoir un rappel automatique si un document disponible n’est pas retiré après un délai défini, notamment 30 jours. | 🟡 |

### 4.4 — Module Administration (Back-office)

| ID | Fonctionnalité | Description détaillée | Priorité |
|----|----------------|----------------------|----------|
| F-18 | Tableau de bord administratif | Afficher les statistiques principales : documents, rendez-vous, retraits, délais et volumes. | 🟡 |
| F-19 | Import CSV | Importer en masse des élèves, examens validés et documents (import élèves), puis disponibiliser des documents existants (import disponibilisation). Fichiers séparés OBC / DECC. | 🔴 |
| F-20 | Gestion des élèves | Lister, rechercher et consulter les élèves dans le back-office. | 🔴 |
| F-21 | Gestion des documents | Lister, filtrer et consulter les documents relevant du périmètre de l’administrateur. | 🔴 |
| F-22 | Mise à jour des statuts | Modifier la disponibilité d’un document (`PAS_DISPONIBLE` / `DISPONIBLE`) et déclencher les notifications associées. Marquer `RETIRE` uniquement pour les retraits en antenne régionale. | 🔴 |
| F-23 | Historique des retraits | Consulter les retraits déjà honorés avec l’élève, l’administrateur, le document, le lieu et la date. | 🔴 |
| F-24 | Gestion des rôles | Modifier le rôle d’un utilisateur depuis une route administrative dédiée. | 🟡 |

### 4.5 — Module Rendez-vous & Paiements

| ID | Fonctionnalité | Description détaillée | Priorité |
|----|----------------|----------------------|----------|
| F-25 | Consultation des créneaux | Afficher les créneaux disponibles selon la date, le quota journalier, les rendez-vous existants, les week-ends et les jours fériés. | 🔴 |
| F-26 | Réservation de rendez-vous | Créer un rendez-vous pour un document disponible lorsque le routage impose un retrait en centre d’examen ou en antenne régionale. | 🔴 |
| F-27 | Annulation de rendez-vous élève | Permettre à l’élève d’annuler un rendez-vous actif. | 🟡 |
| F-28 | Suivi administratif des rendez-vous | Permettre à l’administration de consulter les rendez-vous et d’enregistrer les retraits relevant de son antenne, sans remplacer la confirmation centre d’examen. | 🟡 |
| F-29 | Enregistrement du retrait physique | Marquer un document comme `RETIRE` et passer le rendez-vous associé au statut `HONORE`. En antenne régionale : action administrateur. Au centre d'examen : confirmation par l'agent centre d'examen uniquement. | 🔴 |
| F-30 | Configuration du quota RDV | Définir le quota journalier global de rendez-vous et exploiter les créneaux horaires actifs. | 🟡 |
| F-31 | Initiation de paiement | Créer un paiement pour une demande de duplicata avec montant automatique : 10 000 FCFA pour un relevé et 15 000 FCFA pour un original. | 🔴 |
| F-32 | Confirmation de paiement | Mettre à jour le statut du paiement via webhook interne ou action applicative, avec contrôle du montant attendu. | 🔴 |
| F-33 | Génération de reçu | Générer un reçu de paiement avec numéro, montant, mode de paiement et commentaire. | 🔴 |
| F-34 | API réelle de paiement | Prévoir une intégration réelle Orange Money / MTN Money ou carte bancaire avec OTP, référence transactionnelle, statut d’échec, signature fournisseur et callback certifié. | 🟡 |

### 4.6 — Récapitulatif des fonctionnalités

| Module | 🔴 Obligatoires | 🟡 Importants | 🟢 Optionnels |
|--------|-----------------|----------------|----------------|
| Authentification & Gestion des accès | 3 | 2 | 0 |
| Consultation des Documents scolaires (connecté) | 4 | 2 | 0 |
| Consultation rapide publique (landing / QR) | 5 | 0 | 0 |
| Notifications | 2 | 3 | 1 |
| Administration (Back-office) | 5 | 2 | 0 |
| Rendez-vous & Paiements | 6 | 4 | 0 |
| **TOTAL** | **25** | **13** | **1** |

---

## 6. BESOINS NON FONCTIONNELS

| Catégorie | Exigence | Critère de satisfaction |
|-----------|----------|------------------------|
| ⚡ Performance | Temps de réponse | Les pages principales doivent viser un chargement inférieur à 3 secondes et les routes API courantes doivent viser moins de 500 ms hors latence réseau. |
| ⚡ Performance | Capacité de charge | L’application doit pouvoir supporter un usage simultané raisonnable, avec une cible de 200 utilisateurs simultanés sans dégradation majeure. |
| 🔒 Sécurité | Authentification | L’authentification est gérée par Supabase Auth ; aucun mot de passe n’est stocké dans Prisma. |
| 🔒 Sécurité | Autorisation | Les accès sont contrôlés par rôle et par périmètre organisme / antenne régionale. |
| 🔒 Sécurité | Données personnelles | Les données personnelles doivent être limitées aux utilisateurs autorisés et la conformité RGPD doit être formalisée. |
| 🔒 Sécurité | Injections SQL | L’accès aux données passe par Prisma ORM afin d’éviter l’interpolation SQL directe de données utilisateur. |
| 🔒 Sécurité | Protection XSS | Les sorties affichées dans l’interface doivent être échappées par React et l’application doit être servie en HTTPS en production. |
| 📱 Accessibilité | Responsive design | Les interfaces doivent être utilisables sur mobile, tablette et desktop, sans débordement horizontal. |
| 📱 Accessibilité | Compatibilité | L’application doit fonctionner sur les versions récentes de Chrome, Firefox, Edge et Safari. |
| 📱 Accessibilité | Langue | L’interface et la documentation métier sont en français. |
| 🛠️ Maintenabilité | Architecture | Le code est organisé autour de Next.js App Router, Route Handlers, Server Actions, Prisma et services `lib/*`. |
| 🛠️ Maintenabilité | Validation | Les entrées critiques doivent être validées avec Zod ou une validation équivalente. |
| 🛠️ Maintenabilité | Versioning | Les modifications doivent être suivies dans Git avec des messages de commit clairs. |
| 📊 Fiabilité | Disponibilité | Le déploiement cible Vercel + Supabase Cloud doit assurer une disponibilité adaptée à un service administratif. |
| 📊 Fiabilité | Gestion des erreurs | Les erreurs doivent être capturées, affichées clairement à l’utilisateur et journalisées côté serveur lorsque nécessaire. |
| 📊 Fiabilité | Emails | Les envois d’emails doivent être journalisés dans `mail_logs` avec succès ou erreur. |

---

# IV. ACTEURS (BÉNÉFICIAIRES & UTILISATEURS)

## 7. ACTEURS DU SYSTÈME

### 7.1 — Bénéficiaires du projet

| Bénéficiaire | Gain attendu |
|--------------|--------------|
| Élèves et diplômés | Moins de déplacements inutiles, visibilité sur la disponibilité des documents, prise de RDV en ligne. |
| Administration OBC / DECC | Centralisation des dossiers, imports CSV, traçabilité des retraits, réduction des erreurs manuelles. |
| Agents centres d'examen | Liste claire des retraits à confirmer au centre, sans gérer les duplicatas ni le Bac original. |
| Institutions (OBC, DECC) | Image de modernisation, statistiques et audit des opérations. |

### 7.2 — Utilisateurs du système

| Acteur / Rôle | Type | Responsabilités principales |
|----------------|------|----------------------------|
| Élève / Diplômé | Utilisateur final | Activer son compte, consulter ses documents, demander relevé/duplicata, payer, réserver un RDV, consulter les notifications. |
| Administrateur OBC | Interne | Gérer élèves et documents Probatoire/Bac de son antenne ; imports CSV ; disponibilisation ; retraits en antenne. |
| Administrateur DECC | Interne | Gérer élèves et documents BEPC de son antenne ; imports CSV ; validation duplicatas BEPC. |
| Agent centre d'examen | Interne | Voir les RDV de retrait au centre et confirmer le retrait physique (BEPC, relevés, Probatoire, Bac relevé). |
| Système (jobs / webhooks) | Technique | Rappels, confirmations de paiement internes, envoi d'emails, journalisation. |
| Développeur / Stagiaire | Réalisateur | Conception, développement, tests, documentation, déploiement. |
| Tuteur / Encadreur | Commanditaire | Validation des livrables, suivi académique, orientation des priorités. |

### 7.3 — Matrice acteur / fonctionnalité (synthèse)

| Fonctionnalité | Élève | Admin | Agent CE | Public |
|----------------|-------|-------|----------|--------|
| Consultation rapide (matricule) | — | — | — | Oui (compte activé) |
| Dashboard documents | Oui | — | — | — |
| Import CSV | — | Oui | — | — |
| Disponibilisation | — | Oui | — | — |
| Prise de RDV | Oui | Consultation | — | — |
| Confirmation retrait centre | — | — | Oui | — |
| Retrait antenne | — | Oui | — | — |

---

# V. ARCHITECTURE VISÉE

L'architecture cible est une **application web full-stack monolithique** déployée en cloud, avec séparation logique des rôles et routage métier OBC/DECC, sans serveur backend distinct.

## 8. ARCHITECTURE TECHNIQUE

### 8.1 — Vue d'ensemble (architecture visée)

L'architecture visée est une **application web en couches**, avec séparation logique des rôles et routage métier OBC/DECC. Le schéma logique (sans technologies) est le même que dans le **cahier de conception, figure 2.1**.

![Figure 8.1 — Architecture générale logique (cahier de conception)](diagrammes-images/architecture-generale-solution.png)

**Principes :** un seul système DR-DOCSCOL ; MVC ; logique métier centralisée ; données sensibles protégées ; accès par rôle (élève, admin, agent).

> Les **technologies retenues** (framework, base, authentification, hébergement) sont détaillées au **§8.2** et dans le cahier de conception chapitre 4.

### 8.2 — Stack technique choisie

| Couche | Technologie | Justification du choix |
|--------|-------------|------------------------|
| Frontend | Next.js App Router + React | Permet de construire des interfaces modernes, sécurisées et adaptées aux pages publiques, dashboard élève et back-office admin. |
| Style / UI | Tailwind CSS | Facilite la création d’interfaces cohérentes, responsives et maintenables. |
| Backend | API Routes Next.js + Server Actions | Centralise la logique serveur dans le même projet sans backend séparé. |
| Base de données | Supabase (PostgreSQL) avec Prisma | PostgreSQL fournit un modèle relationnel robuste ; Prisma sécurise et structure l’accès aux données. |
| Authentification | JWT / sessions via Supabase Auth | Supabase Auth gère les comptes, sessions, mots de passe et identifiants d’authentification. |
| Emails | Nodemailer | Permet d’envoyer des notifications métier depuis le serveur applicatif. |
| Validation | Zod | Permet de valider les formulaires et entrées API. |
| Versioning | Git + GitHub | Assure le suivi des modifications, l’historique et la collaboration. |
| Hébergement | Vercel + Supabase Cloud | Vercel est adapté au déploiement Next.js et Supabase fournit la base PostgreSQL et l’authentification. |

### 8.3 — Architecture logique (Pattern MVC)

| MODÈLE (Model) | VUE (View) | CONTRÔLEUR (Controller) |
|----------------|-----------|--------------------------|
| Le modèle est représenté par `prisma/schema.prisma`, Prisma Client et les entités métier : `User`, `DocumentAcademique`, `RendezVous`, `Paiement`, `Recu`, `Notification`, `Organisme`, `AntenneRegionale`, `ExamenValide`, etc. | La vue est représentée par les pages et composants Next.js : `app/dashboard/*`, `app/admin/*`, `app/auth/*`, `app/account/*`. | Le contrôle est assuré par les Route Handlers `app/api/*`, les Server Actions `app/*/actions.ts` et les services métier dans `lib/*`. |

### 8.4 — Contraintes techniques du projet

| Type de contrainte | Description |
|--------------------|-------------|
| Technique | Le projet repose sur Next.js, Supabase Auth, PostgreSQL, Prisma, Nodemailer et Tailwind CSS. |
| Temporelle | Le développement doit respecter les délais de soutenance et les échéances académiques. |
| Équipe | Le projet est réalisé dans un contexte de stage ou de projet académique, avec validation par un encadreur. |
| Connectivité | L’application dépend d’une connexion Internet, même si un mode hors ligne partiel reste envisageable plus tard. |
| Institutionnelle | Les règles de retrait doivent rester conformes aux procédures OBC / DECC. |
| Légale | Les données personnelles doivent être protégées et la conformité RGPD doit être formalisée. |

### 8.5 — Organisation du code

| Zone | Rôle |
|------|------|
| `app/auth/*` | Pages et actions d’authentification. |
| `app/dashboard/*` | Interface élève : documents, rendez-vous, paiements, notifications. |
| `app/admin/*` | Back-office administrateur : documents, élèves, import, retraits, rendez-vous, statistiques. |
| `app/` (racine) | Page d'accueil publique (`/`), consultation publique (`/consultation`). |
| `app/account/*` | Consultation et modification du profil. |
| `app/api/*` | Routes HTTP pour auth, documents, paiements, notifications, retraits et statistiques. |
| `lib/auth.ts` | Récupération de l'utilisateur connecté et contrôle de rôle. |
| `lib/public-consultation.ts` | Consultation publique par matricule (compte élève activé). |
| `lib/admin-student-import.ts` | Import CSV élèves et documents initiaux. |
| `lib/document-availability-import.ts` | Import CSV de disponibilisation. |
| `lib/api-utils.ts` | Réponses JSON, erreurs API, pagination et protection des routes internes. |
| `lib/appointment-service.ts` | Créneaux, quotas, jours fériés, titres de documents et lieux de retrait. |
| `lib/document-routing.ts` | Règles OBC / DECC, antennes régionales, routage et périmètre admin. |
| `lib/mail-service.ts` | Notifications email, création de notifications et journalisation des emails. |
| `prisma/schema.prisma` | Schéma relationnel de référence. |
| `scripts/*` | Seeds administrateur, élève test et données de diplômes. |
| `docs/csv-demo/` | Jeux de données CSV de démonstration par région et organisme (OBC / DECC). |

### 8.6 — Modèle de données actuel

| Entité | Rôle dans le système |
|--------|----------------------|
| `User` | Utilisateur applicatif, élève ou administrateur, relié à Supabase Auth par `authUserId`. |
| `Organisme` | Organisme responsable, actuellement OBC ou DECC. |
| `AntenneRegionale` | Antenne régionale OBC ou DECC selon l'organisme responsable et la région de composition. |
| `ExamenValide` | Examen obtenu par un élève et servant de base aux documents demandables. |
| `DocumentAcademique` | Document scolaire consultable ou demandable. |
| `RendezVous` | Réservation de retrait ou trace d’un retrait physique honoré. |
| `DisponibiliteRdv` | Ancien modèle de disponibilité dédiée encore présent dans le schéma. |
| `Notification` | Notification applicative liée à un utilisateur. |
| `MailLog` | Journal des emails envoyés ou échoués. |
| `Duplicata` | Demande de duplicata. |
| `Paiement` | Paiement associé à un duplicata et éventuellement à un document scolaire. |
| `Recu` | Reçu de paiement généré par l’application. |
| `ParametreRendezVous` | Paramètres globaux de rendez-vous, notamment quota journalier et lieu OBC. |
| `CreneauHoraire` | Plage horaire active pour les rendez-vous. |
| `JourFerie` | Date bloquée dans le calendrier des rendez-vous. |

### 8.7 — Modélisation UML (cas d'utilisation et séquences phares)

Le cahier des charges exige une traçabilité entre **besoins fonctionnels** (§5), **cas d'utilisation** et **interactions runtime**. La modélisation retenue comprend :

| Artefact | Contenu | Emplacement |
| --- | --- | --- |
| Cas d'utilisation par acteur | Élève, Admin OBC/DECC, Agent centre, vue générale | `diagrammes-images/cas-utilisation-*.png` (sources draw.io : `diagramme cas utilisation/`) |
| Séquences phares | Flux critiques : auth, consultation, demandes, imports, RDV, retrait | `diagrammes-images/sequences/` |
| **Diagrammes d'activité** | **4 flux métier phares (rendu vectoriel soigné)** | **`diagrammes-images/activites/`** |
| Détail textuel et figures | Déroulement, participants, justification métier | **Cahier de conception §3.7 et §3.8** |
| Synthèse métier (contexte, acteurs, UC) | Sans duplication des diagrammes dynamiques | **Cahier d'analyse §1 à §6** |

**Séquences phares attendues en soutenance**

| Acteur | Cas couverts (exemples) | Références |
| --- | --- | --- |
| Élève | Authentifier, QR, Mes documents, demande relevé, duplicata+paiement, RDV | SEQ-ELEVE-01 à 03, 05 à 07, 09, 10 |
| Admin | Auth, import élèves, import dispo, MAJ statut, valider duplicata, quota | SEQ-ADMIN-01, 02, 06, 08, 10, 11 |
| Agent | Auth, consulter RDV, confirmer retrait | SEQ-AGENT-01 à 03 |

Les anciens diagrammes `sequence-*-v3-soutenance.png` (SEQ-01…SEQ-10) sont **remplacés** par cette modélisation par acteur, alignée sur le code source (`app/*/actions.ts`, `app/api/*`, `lib/*`).

---

# VI. RESSOURCES

## 9. RESSOURCES MATÉRIELLES, LOGICIELLES & HUMAINES

### 9.1 — Ressources matérielles

| Ressource | Usage | Remarque |
|-----------|-------|----------|
| Poste de développement | Codage, tests locaux, démonstrations | Ordinateur portable (185 000 FCFA) — voir §11 |
| Serveur d'hébergement (Vercel) | Exécution de l'application Next.js en production et preview | Cloud managé, tier gratuit (§11) |
| Base de données (Supabase) | PostgreSQL, Auth, Storage | Hébergement cloud, tier gratuit (§11) |
| Téléphone mobile | Tests responsive, scan QR code, consultation rapide | Smartphone Android (95 000 FCFA) — voir §11 |
| Connexion Internet | Téléchargements, déploiement, tests en ligne | Forfait data 40 000 FCFA — voir §11 |

### 9.2 — Ressources logicielles

| Ressource | Rôle |
|-----------|------|
| Node.js 20+ | Runtime de développement et build |
| Next.js 15, React, TypeScript | Framework frontend / full-stack |
| Tailwind CSS | Interface utilisateur |
| Prisma | ORM et migrations |
| Supabase (Auth, PostgreSQL, Storage) | Authentification et persistance |
| Nodemailer + SMTP (Gmail ou autre) | Envoi d'emails transactionnels |
| Git + GitHub | Versionnement et sauvegarde du code |
| Vercel CLI | Déploiement |
| Cursor / VS Code | Environnement de développement |

### 9.3 — Ressources humaines

| Rôle | Contribution |
|------|--------------|
| Stagiaire / développeur | Analyse, conception, implémentation, tests, documentation, déploiement |
| Encadreur académique | Validation du cahier des charges, suivi, préparation soutenance |
| Utilisateurs pilotes (optionnel) | Admin OBC/DECC et agent centre pour retours sur la démo |
| Jury / évaluateurs | Évaluation finale du projet |

---

# VII. PLANIFICATION

## 10. PLANIFICATION DU PROJET

| Phase | Période indicative | Livrables principaux |
|-------|-------------------|----------------------|
| 1. Analyse & cahier des charges | Fév. – Mars 2026 | Problématique, objectifs, acteurs, besoins |
| 2. Conception | Mars – Avr. 2026 | Diagrammes UML, diagramme de classes, architecture MVC, maquettes |
| 3. Implémentation cœur métier | Avr. – Mai 2026 | Auth, documents, routage OBC/DECC, admin |
| 4. Parcours avancés | Mai 2026 | RDV, paiements simulés, imports CSV, agent centre |
| 5. Finition & déploiement | Mai – Juin 2026 | Landing, consultation QR, i18n, Vercel, tests |
| 6. Documentation & soutenance | Juin 2026 | Cahier des charges, dossier, démo, présentation |

**Jalon critique :** démonstration fonctionnelle sur URL publique (`application-demande-document-academ.vercel.app`) avant la soutenance.

---

# VIII. BUDGET

## 11. BUDGET PRÉVISIONNEL

Estimation du **projet académique / MVP** (montants en FCFA, juin 2026 — contexte camerounais) :

| Poste | Coût (FCFA) | Période / fréquence | Commentaire |
|-------|-------------|---------------------|-------------|
| Hébergement Vercel (Hobby) | 0 | Projet | Offre gratuite — déploiement démo et previews |
| Base Supabase (Free) | 0 | Projet | PostgreSQL, Auth — tier gratuit suffisant pour le MVP |
| Connexion Internet | 40 000 | Projet | Forfait data utilisé pour le développement, les tests et le déploiement |
| Ordinateur portable | 185 000 | Acquisition | PC entrée de gamme (8 Go RAM) — développement et tests locaux |
| Smartphone | 95 000 | Acquisition | Téléphone Android — tests responsive et scan du QR code consultation |
| Logiciels (Node.js, Git, VS Code, Prisma, etc.) | 0 | — | Stack open source ; aucune licence payante |
| Nom de domaine personnalisé | 0 | — | Non utilisé (sous-domaine Vercel `*.vercel.app`) |
| Ressources humaines (stagiaire) | 0 | — | Projet académique — travail non rémunéré |
| Encadrement académique | 0 | — | Suivi encadreur — hors budget financier |
| SMS / Mobile Money réel | 0 | — | Hors périmètre MVP (phase ultérieure) |
| **Total général** | **320 000** | — | Somme des débours matériels et connexion |

Les postes cloud (Vercel, Supabase) et logiciels libres ne génèrent pas de coût direct dans cette phase de démonstration.

---

# IX. CLAUSES JURIDIQUES

## 12. CLAUSES JURIDIQUES & PROTECTION DES DONNÉES

### 12.1 — Données personnelles

L'application traite des données à caractère personnel : identité des élèves (nom, prénom, email, matricule, date de naissance), historique de documents et de retraits. Le traitement doit respecter les principes de **licéité**, **finalité**, **minimisation** et **sécurité**, en cohérence avec le cadre camerounais et les bonnes pratiques inspirées du RGPD.

### 12.2 — Responsabilités

- L'**administration** (OBC/DECC) reste responsable de la exactitude des données importées et de la disponibilisation des documents.
- Le **développeur** fournit un outil conforme au cahier des charges ; la mise en production institutionnelle nécessite une validation formelle des services compétents.
- L'**élève** est responsable de la confidentialité de ses identifiants de connexion.

### 12.3 — Sécurité et accès

- Mots de passe gérés par Supabase Auth (hachage, pas de stockage en clair dans Prisma).
- Accès restreint par rôle et par périmètre régional / organisme.
- Consultation publique limitée aux seuls statuts, sans exposition des données administratives sensibles.
- Journalisation des emails (`mail_logs`) et des actions admin (audit).

### 12.4 — Propriété intellectuelle

Le code source, la documentation et les diagrammes réalisés dans le cadre du projet académique appartiennent au porteur du projet, sous réserve des éventuelles clauses de l'établissement d'accueil et du stage.

### 12.5 — Limitation de responsabilité (MVP)

La version MVP est fournie à des fins de **démonstration et d'évaluation académique**. Elle ne remplace pas, tant que les intégrations de production (paiement réel, SLA, support) ne sont pas finalisées, un système officiel de gestion institutionnelle.

---

# X. CONCLUSION

## 13. CONCLUSION

Le projet **DR-DOCSCOL** répond à un besoin réel de modernisation des retraits de documents scolaires au Cameroun, en respectant le découpage institutionnel **OBC / DECC**. Le cahier des charges définit un périmètre MVP réaliste : consultation et suivi pour l'élève, back-office pour l'administration, confirmation des retraits au centre d'examen, imports CSV et consultation rapide par matricule avec QR code.

**Les objectifs principaux sont atteints** dans la version livrée : authentification, routage métier, statuts de documents, rendez-vous, notifications, déploiement cloud et documentation de soutenance.

**Les limites assumées** du MVP sont : paiement Mobile Money non branché à un opérateur réel, évolution possible du stockage des justificatifs en production, et absence de vérification employeur par QR.

**Perspectives :** intégration d'un prestataire de paiement, renforcement de la haute disponibilité Postgres, traduction/rectification de diplôme, et déploiement institutionnel pilote dans une antenne régionale.

---

# ANNEXES

## 14. CONTRAINTES DU PROJET

| Type de contrainte | Description |
|--------------------|-------------|
| Fonctionnelle | Le système doit respecter les règles OBC / DECC : BEPC vers DECC, Baccalauréat original vers antenne régionale OBC, Probatoire sans diplôme original. |
| Fonctionnelle | Un document ne peut être retiré que lorsqu’il est disponible et correctement rattaché à l’élève. |
| Fonctionnelle | Un rendez-vous ne peut être créé que si le document nécessite réellement un rendez-vous et si le quota le permet. Pour un retrait en centre d’examen, il est créé au statut `PLANIFIE` puis transmis à l’agent du centre. |
| Fonctionnelle | Un élève ne doit pas avoir deux rendez-vous actifs pour le même document. |
| Technique | Les sessions et mots de passe sont gérés par Supabase Auth, tandis que Prisma conserve le profil métier. |
| Technique | Le mot de passe ne doit jamais être stocké dans le modèle Prisma `User`. |
| Technique | Les routes internes doivent être protégées par `INTERNAL_API_SECRET`. |
| Sécurité | Les administrateurs doivent être limités à leur organisme et à leur antenne régionale. |
| Sécurité | Les informations techniques sensibles ne doivent pas être exposées à l’utilisateur final. |
| Paiement | Le paiement Mobile Money réel reste hors périmètre immédiat du MVP ; le cahier des charges prévoit toutefois une API de paiement réelle à brancher en phase de production. |
| Documentation | Diagrammes dans `diagrammes-images/` : cas d'utilisation par acteur (`cas-utilisation-*.drawio.png`), séquences (`sequences/`), activités (`activites/`), **diagramme de classes** (Figure 5.1 — `diagramme-classes-simplifie.png`, cahier de conception §5). **Cahier d'analyse** : synthèse métier. **Cahier de conception** : UML détaillé, MVC, architecture (§3.7, §3.8, ch. 4–10). |
| Données | **Import élèves** : `eleve_matricule`, `eleve_email`, `eleve_nom`, `eleve_prenom`, `eleve_date_naissance`, `diplome_type`, `annee_session`, `centre_examen`, `region_composition`, `document_type`. **Import disponibilisation** : `eleve_matricule`, `diplome_type`, `document_type`, `annee_session`. Le mot de passe et les rendez-vous ne sont pas importés via CSV. |

---

## 15. GLOSSAIRE TECHNIQUE

> Voir aussi les **définitions métier** au **§4 (section II)**.

| Terme | Définition |
|-------|-----------|
| OBC | Office du Baccalauréat du Cameroun. |
| DECC | Direction ou Délégation des Examens, Concours et de la Certification, utilisée ici pour représenter l’organisme responsable des documents du BEPC. |
| JWT | JSON Web Token, format de jeton utilisé pour transporter des informations d’authentification. |
| SSR | Server Side Rendering, rendu côté serveur d’une page web. |
| RDV | Rendez-vous. |
| MVP | Minimum Viable Product, première version utilisable du produit. |
| API | Application Programming Interface, interface permettant à des modules logiciels de communiquer. |
| CRUD | Create, Read, Update, Delete : opérations de base sur les données. |
| ORM | Object Relational Mapping, couche d’accès aux données reliant le code aux tables SQL. |
| Prisma | ORM TypeScript utilisé pour accéder à PostgreSQL. |
| Supabase Auth | Service d’authentification utilisé pour gérer les comptes, mots de passe et sessions. |
| PostgreSQL | Système de gestion de base de données relationnelle. |
| Nodemailer | Bibliothèque Node.js utilisée pour envoyer des emails. |
| SMTP | Simple Mail Transfer Protocol, protocole d’envoi d’emails. |
| CSV | Comma-Separated Values, format de fichier tabulaire utilisé pour importer des données. |
| `DEMO202600x` | Matricule élève de démonstration (ex. `DEMO2026002`), créé par `seed:soutenance-eleves` ou import CSV. |
| OBC_SETTINGS_ID | Identifiant global utilisé pour les paramètres de rendez-vous. |
| `ELEVE` | Rôle applicatif d’un élève ou diplômé. |
| `ADMINISTRATEUR` | Rôle applicatif d’un agent administratif OBC / DECC. |
| `AGENT_CENTRE_EXAMEN` | Rôle applicatif d’un agent rattache a un centre d'examen et charge de confirmer certains retraits physiques. |
| `SERVICE_DELIVRANCE` | Rôle envisagé mais non implémenté séparément dans le MVP actuel. |
| `PAS_DISPONIBLE` | Statut indiquant qu’un document n’est pas encore disponible. |
| `DISPONIBLE` | Statut indiquant qu’un document est prêt pour retrait. |
| `RETIRE` | Statut indiquant qu’un document a été retiré physiquement. |
| `PLANIFIE` | Statut initial d’un rendez-vous pris par l’élève et transmis au service concerné. |
| `CONFIRME` | Statut historique encore accepté par compatibilité, mais le flux courant crée les rendez-vous au statut `PLANIFIE`. |
| `ANNULE` | Statut d’un rendez-vous annulé. |
| `HONORE` | Statut d’un rendez-vous correspondant à un retrait effectué. |
| `EN_ATTENTE` | Statut d’un paiement créé mais non encore confirmé. |
| `EFFECTUE` | Statut d’un paiement confirmé. |
| Mobile Money | Service de paiement mobile, notamment Orange Money ou MTN Mobile Money. |
| MailLog | Journal applicatif des emails envoyés ou échoués. |
| Reçu | Document ou trace de paiement généré après une opération payante. |
| Antenne régionale | Service régional OBC ou DECC responsable de certains retraits selon le diplôme, le type de document et la région de composition. |
| Centre d’examen | Établissement ou lieu où l’élève a composé et où certains documents peuvent être retirés. |

---

## 16. ÉTAT D'IMPLÉMENTATION (juin 2026)

Le coeur fonctionnel de l'application est implemente.

### Fonctionnalites couvertes

- Authentification Supabase Auth.
- Activation des comptes eleves (matricule + email deja en base).
- Connexion differenciee eleve, admin OBC, admin DECC et agent centre d'examen.
- Page d'accueil publique et consultation rapide par matricule (`/consultation`, QR code landing).
- Routage OBC / DECC par diplome et region.
- Gestion des documents, statuts, rendez-vous, paiements simules, recus, notifications et audit logs.
- Import CSV en deux flux (eleves + disponibilisation), fichiers demo dans `docs/csv-demo/`.
- Comptes de test regionaux OBC, DECC et centres d'examen.
- 5 eleves demo soutenance (`DEMO2026001`–`005`) via `npm run seed:soutenance-eleves` ; export liste dans `docs/test-data-soutenance-eleves.csv`.
- Interface bilingue FR / EN sur la landing et la consultation publique.

### Points restants avant production

- Stabiliser la connexion Prisma/Postgres Supabase.
- Brancher un vrai prestataire de paiement (Mobile Money / carte).
- Ajouter les demandes de traduction de diplôme.
- Ajouter les demandes de rectification de diplôme.
- Stocker les justificatifs de duplicata dans un stockage fichier (Supabase Storage).
- Verification employeur par QR code (tiers).
- Regenerer les documents Word et images UML si une version non-Markdown doit etre remise.

Voir aussi `ETAT_FINAL_PROJET.md`, `docs/csv-demo/README.md` et `docs/demo/KIT_DEMO_COMPLET.md`.

---

*Document généré le 27/05/2026, mis à jour le 19/06/2026 — Version 3.0*

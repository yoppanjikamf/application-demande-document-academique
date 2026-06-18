# CAHIER D'ANALYSE

## Application Web DR-DOCSCOL
### Gestion des retraits de documents scolaires — OBC / DECC

**Projet :** Application de demande document académique  
**Application :** DR-DOCSCOL (Document Retrieval — Documents Scolaires)  
**Contexte :** Cameroun — OBC et DECC  
**Version :** 1.0 — Juin 2026  
**Document associé :** Cahier de conception (`docs/cahier_conception.md`)

---

## TABLE DES MATIÈRES

1. Introduction et objet du cahier d'analyse
2. Contexte et problématique
3. Analyse de l'existant
4. Acteurs, parties prenantes et périmètre
5. Analyse des besoins fonctionnels
6. Analyse des besoins non fonctionnels
7. Contraintes, hypothèses et règles métier identifiées
8. Analyse des enjeux et des risques
9. Synthèse de l'analyse et recommandations
10. Glossaire et références

---

## 1. INTRODUCTION ET OBJET DU CAHIER D'ANALYSE

### 1.1 — Objet

Le présent **cahier d'analyse** décrit l'étude préalable à la réalisation de l'application **DR-DOCSCOL**. Il répond aux questions suivantes :

- Quel est le contexte et la problématique ?
- Comment fonctionne la situation actuelle (« sans portail ») ?
- Quels sont les besoins des acteurs ?
- Quelles contraintes et règles métier encadrent la solution ?
- Quels enjeux et risques doivent être pris en compte ?

Ce document **ne décrit pas** l'architecture technique ni les choix de conception détaillés : ceux-ci figurent dans le **cahier de conception** distinct.

### 1.2 — Méthode d'analyse

L'analyse s'appuie sur :

- le cahier des charges fonctionnel v2.1 (`docs/cahier_des_charges_mis_a_jour.md`) ;
- les entretiens implicites avec le domaine OBC/DECC (règles de retrait, antennes, centres) ;
- l'observation des dysfonctionnements du processus manuel ;
- la validation progressive par l'implémentation du dépôt source.

### 1.3 — Périmètre analysé

| Élément | Description |
| --- | --- |
| Diplômes | BEPC, Probatoire, Baccalauréat, ESG |
| Documents | Original, relevé de notes, duplicata |
| Organismes | OBC, DECC |
| Lieux | Centres d'examen, antennes régionales (10 régions) |
| Usagers | Élèves, admins OBC/DECC, agents centre d'examen |

---

## 2. CONTEXTE ET PROBLÉMATIQUE

### 2.1 — Contexte institutionnel

Au Cameroun, la délivrance et le retrait des documents scolaires demeurent fortement dépendants de procédures physiques. Les usagers se rendent aux centres d'examen ou aux antennes régionales sans certitude sur la disponibilité de leurs dossiers.

| Organisme | Responsabilité principale |
| --- | --- |
| **OBC** | Probatoire, Baccalauréat |
| **DECC** | BEPC |

Chaque organisme dispose d'**antennes régionales** couvrant les dix régions administratives du Cameroun.

### 2.2 — Problématique générale

> ***Comment permettre aux élèves et diplômés camerounais de suivre et retirer leurs documents scolaires de manière sécurisée et traçable, tout en allégeant la charge administrative des services OBC / DECC ?***

### 2.3 — Questions d'analyse

| N° | Question |
| --- | --- |
| QA-01 | Comment réduire les déplacements inutiles liés à l'incertitude sur la disponibilité ? |
| QA-02 | Comment organiser le retrait physique sans files d'attente excessives ? |
| QA-03 | Comment garantir le respect des règles OBC/DECC (lieu, acteur, type de document) ? |
| QA-04 | Comment tracer qui retire quoi, quand et où ? |
| QA-05 | Comment intégrer les duplicatas payants et leurs justificatifs ? |

---

## 3. ANALYSE DE L'EXISTANT

### 3.1 — Processus actuel (situation « sans portail »)

```
Élève → déplacement centre/antenne → guichet → attente → renseignement manuel
      → éventuel second déplacement → retrait ou nouvelle attente
Administration → registres / fichiers → saisie manuelle → faible visibilité globale
```

### 3.2 — Constats par acteur

| Acteur | Problèmes identifiés |
| --- | --- |
| Élève / diplômé | Déplacements multiples, longues files d'attente, absence de visibilité sur le statut, frais de transport, instructions de retrait imprécises |
| Administration OBC/DECC | Gestion manuelle, charge de travail élevée, erreurs de saisie, traçabilité difficile, absence de tableaux de bord |
| Agent centre d'examen | Accueil non planifié, confirmation de retrait sur registre papier |
| Organisme | Risques d'erreurs, difficulté de pilotage statistique, fraude potentielle |

### 3.3 — Lacunes fonctionnelles de l'existant

| Lacune | Impact |
| --- | --- |
| Pas de consultation en ligne | Déplacements « à l'aveugle » |
| Pas de notification | L'élève ignore quand son document est prêt |
| Pas de rendez-vous | Congestion aux guichets |
| Pas de paiement tracé (duplicata) | Opacité sur les recettes et les dossiers |
| Pas d'audit centralisé | Difficulté de contrôle et de responsabilisation |

### 3.4 — Opportunité de digitalisation

La digitalisation permet de :

- informer l'usager **avant** le déplacement ;
- planifier les retraits par **créneaux** ;
- appliquer automatiquement le **routage** OBC/DECC ;
- conserver une **trace** de chaque action sensible.

---

## 4. ACTEURS, PARTIES PRENANTES ET PÉRIMÈTRE

### 4.1 — Cartographie des acteurs

| Acteur | Rôle dans le processus | Besoin principal |
| --- | --- | --- |
| Élève | Demandeur et bénéficiaire du document | Savoir où en est sa demande |
| Visiteur (sans compte) | Usager en phase de renseignement | Consulter statuts par matricule |
| Admin OBC | Gestion documents et élèves OBC | Outils de disponibilisation et suivi |
| Admin DECC | Gestion documents et élèves DECC | Idem, périmètre DECC |
| Agent centre | Accueil et confirmation retrait | Liste RDV du centre |
| Système | Notifications, audit | Automatisation fiable |

### 4.2 — Périmètre inclus dans l'analyse

- Consultation et suivi des documents scolaires.
- Demandes de relevé et de duplicata.
- Paiement applicatif des duplicatas (MVP).
- Rendez-vous de retrait.
- Back-office admin et espace agent.
- Imports CSV (élèves et disponibilisation).
- Consultation publique par matricule.

### 4.3 — Hors périmètre (exclus)

| Exclusion | Justification |
| --- | --- |
| Téléchargement PDF sécurisé du diplôme | Non demandé dans le périmètre MVP |
| Vérification employeur par QR | Évolution future |
| Traduction / rectification de diplôme | Hors scope actuel |
| Paiement Mobile Money réel en production | Analysé mais non branché (MVP simulé) |

---

## 5. ANALYSE DES BESOINS FONCTIONNELS

### 5.1 — Besoins exprimés

| ID | Besoin | Acteur | Priorité |
| --- | --- | --- | --- |
| BF-01 | Consulter la disponibilité d'un document | Élève, visiteur | Critique |
| BF-02 | Activer un compte à partir d'un matricule connu | Élève | Critique |
| BF-03 | Demander un relevé de notes | Élève | Haute |
| BF-04 | Demander un duplicata | Élève | Haute |
| BF-05 | Payer un duplicata et obtenir un reçu | Élève | Haute |
| BF-06 | Prendre rendez-vous de retrait | Élève | Haute |
| BF-07 | Recevoir notifications (app + email) | Élève | Moyenne |
| BF-08 | Enregistrer de nouveaux élèves (CSV) | Admin | Critique |
| BF-09 | Disponibiliser documents (liste OBC) | Admin | Critique |
| BF-10 | Gérer statuts document | Admin | Critique |
| BF-11 | Valider dossier duplicata | Admin | Haute |
| BF-12 | Confirmer retrait physique | Agent / Admin | Critique |
| BF-13 | Consulter journaux d'audit | Admin | Moyenne |
| BF-14 | Consulter statistiques | Admin | Moyenne |

### 5.2 — Besoins par processus métier

#### Processus 1 — Enregistrement et activation

1. L'administration enregistre l'élève (manuel ou Import B).
2. Les documents sont créés en statut **Pas disponible**.
3. L'élève active son compte avec matricule + email déjà en base.

#### Processus 2 — Disponibilisation

1. L'OBC/DECC publie une liste de documents prêts (Import A ou action manuelle).
2. Chaque ligne met **un** document à **Disponible**.
3. L'élève est notifié automatiquement.

#### Processus 3 — Demande et paiement (duplicata)

1. L'élève soumet une demande avec pièces justificatives.
2. L'admin analyse et valide le dossier.
3. Paiement puis disponibilisation en antenne régionale.

#### Processus 4 — Retrait physique

1. L'élève consulte les instructions (centre ou antenne selon routage).
2. Rendez-vous si nécessaire.
3. Confirmation sur place → statut **Retiré**.

### 5.3 — Matrice besoin / solution retenue

| Besoin | Solution analysée et retenue |
| --- | --- |
| BF-01 | Espace élève + page `/consultation` (matricule seul) |
| BF-08 | Import B CSV — statut initial toujours Pas disponible |
| BF-09 | Import A CSV — une ligne = un document à Disponible |
| BF-12 | Agent (centre) ou admin (antenne) selon routage |

---

## 6. ANALYSE DES BESOINS NON FONCTIONNELS

| ID | Catégorie | Exigence | Critère de satisfaction |
| --- | --- | --- | --- |
| BNF-01 | Sécurité | Authentification robuste | Supabase Auth, sessions sécurisées |
| BNF-02 | Sécurité | Contrôle d'accès par rôle | Middleware + guards serveur |
| BNF-03 | Disponibilité | Service accessible en ligne | Hébergement cloud (Vercel) |
| BNF-04 | Performance | Temps de réponse acceptable | Pages SSR/Server Components |
| BNF-05 | Ergonomie | Usage mobile | Interface responsive |
| BNF-06 | Traçabilité | Journalisation des actions | AuditLog, MailLog |
| BNF-07 | Maintenabilité | Code typé et modulaire | TypeScript, Prisma, services `lib/` |
| BNF-08 | Confidentialité | Données personnelles protégées | Pas de création d'élève via consultation publique |
| BNF-09 | Exploitabilité | Imports batch admin | CSV avec retours d'erreur par ligne |

---

## 7. CONTRAINTES, HYPOTHÈSES ET RÈGLES MÉTIER IDENTIFIÉES

### 7.1 — Contraintes réglementaires et métier

| Contrainte | Description |
| --- | --- |
| C-01 | Le Probatoire ne donne pas lieu à un diplôme original |
| C-02 | Tous les duplicatas se retirent en antenne régionale |
| C-03 | L'original du Bac se retire en antenne ; le relevé au centre |
| C-04 | Le BEPC relève de la DECC ; Probatoire et Bac de l'OBC |
| C-05 | Un élève doit exister en base avant activation ou disponibilisation |
| C-06 | L'Import A ne traite pas les duplicatas |
| C-07 | Le retrait centre est confirmé par l'agent, pas par l'admin |

### 7.2 — Hypothèses de travail

| Hypothèse | Justification |
| --- | --- |
| H-01 | Matricule et email sont pré-enregistrés par l'administration | Contrôle de l'identité à l'activation |
| H-02 | La disponibilisation est pilotée par listes OBC/DECC | Processus métier existant conservé |
| H-03 | Le retrait reste physique | Pas de dématérialisation du document papier |
| H-04 | Dix régions couvrent le territoire | Modèle antennes régionales |
| H-05 | Paiement réel différé | MVP avec simulation, API prête pour branchement |

### 7.3 — Règles de routage identifiées (synthèse)

| Document | Organisme | Lieu de retrait |
| --- | --- | --- |
| BEPC original / relevé | DECC | Centre d'examen |
| BEPC duplicata | DECC | Antenne régionale |
| Probatoire relevé | OBC | Centre d'examen |
| Probatoire duplicata | OBC | Antenne régionale |
| Bac relevé | OBC | Centre d'examen |
| Bac original / duplicata | OBC | Antenne régionale |

---

## 8. ANALYSE DES ENJEUX ET DES RISQUES

### 8.1 — Enjeux stratégiques

| Enjeu | Description |
| --- | --- |
| E-01 | Réduction des files d'attente et des déplacements inutiles |
| E-02 | Transparence pour l'usager |
| E-03 | Modernisation de l'administration OBC/DECC |
| E-04 | Traçabilité et lutte contre la fraude |
| E-05 | Acceptabilité par les agents et admins sur le terrain |

### 8.2 — Analyse des risques

| Risque | Probabilité | Impact | Mesure d'atténuation analysée |
| --- | --- | --- | --- |
| R-01 | Résistance au changement | Moyenne | Formation, interfaces claires |
| R-02 | Erreur d'import CSV | Moyenne | Validation ligne par ligne, messages d'erreur |
| R-03 | Fuite de données | Faible | Auth, rate limiting consultation publique |
| R-04 | Indisponibilité base | Faible | Supabase managé, monitoring |
| R-05 | Paiement non sécurisé (MVP) | Élevée | Limitation MVP, branchement prestataire prévu |
| R-06 | Règles métier mal appliquées | Moyenne | Service central `document-routing.ts` |

---

## 9. SYNTHÈSE DE L'ANALYSE ET RECOMMANDATIONS

### 9.1 — Synthèse

L'analyse confirme un **besoin fort** de portail unifié pour :

- la **visibilité** (consultation statuts, notifications) ;
- l'**organisation** (rendez-vous, routage centre/antenne) ;
- la **traçabilité** (audit, confirmation retrait) ;
- l'**automatisation admin** (imports CSV distincts élèves / disponibilisation).

La solution retenue doit respecter strictement le **découpage OBC/DECC** et ne pas créer d'élève via la consultation publique.

### 9.2 — Recommandations issues de l'analyse

| N° | Recommandation |
| --- | --- |
| REC-01 | Séparer Import B (élèves) et Import A (disponibilisation) |
| REC-02 | Proposer une consultation publique limitée (matricule, statuts uniquement) |
| REC-03 | Centraliser le routage documentaire dans un service unique |
| REC-04 | Prévoir notifications à chaque disponibilisation |
| REC-05 | Journaliser toutes les actions sensibles |
| REC-06 | Prévoir une évolution vers paiement Mobile Money réel |
| REC-07 | Concevoir l'interface mobile-first pour les élèves |

### 9.3 — Lien avec le cahier de conception

Les recommandations ci-dessus sont traduites en **choix de conception** dans le document `docs/cahier_conception.md` (architecture, modèle de données, API, interfaces, déploiement).

---

## 10. GLOSSAIRE ET RÉFÉRENCES

### 10.1 — Glossaire

| Terme | Définition |
| --- | --- |
| OBC | Office du Baccalauréat du Cameroun |
| DECC | Direction des Examens, des Concours et de la Certification |
| Antenne régionale | Structure de retrait par région |
| Centre d'examen | Lieu de composition et de retrait pour certains documents |
| Disponibilisation | Passage d'un document au statut Disponible |
| Import A | Import CSV de disponibilisation (liste OBC) |
| Import B | Import CSV de nouveaux élèves |
| Duplicata | Copie certifiée d'un document perdu ou détérioré |

### 10.2 — Références

| Document | Chemin |
| --- | --- |
| Cahier des charges v2.1 | `docs/cahier_des_charges_mis_a_jour.md` |
| Cahier de conception | `docs/cahier_conception.md` |
| État final du projet | `docs/ETAT_FINAL_PROJET.md` |
| Connexions de test | `docs/connexions-tests-completes.md` |

---

**Fin du cahier d'analyse — DR-DOCSCOL v1.0**

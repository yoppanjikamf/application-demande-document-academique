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
5. Cas d'utilisation *(syntaxe générale + synthèse par acteur)*
6. Synthèse de l'analyse
7. Glossaire

---

## 1. INTRODUCTION ET OBJET DU CAHIER D'ANALYSE

### 1.1 — Objet

Le présent **cahier d'analyse** décrit l'étude préalable à la réalisation de l'application **DR-DOCSCOL**. Il répond aux questions suivantes :

- Quel est le contexte et la problématique ?
- Comment fonctionne la situation actuelle (« sans portail ») ?
- Qui sont les acteurs et quel est le périmètre retenu ?
- Quels cas d'utilisation couvre la solution, en résumé ?

Ce document est une **synthèse métier volontairement courte**. Il **ne reprend pas** les besoins détaillés (BF/BNF), les contraintes, le routage, les enjeux, l'architecture ni les diagrammes dynamiques : ceux-ci figurent dans le **cahier des charges** (expression du besoin) et le **cahier de conception** (traduction technique complète).

### 1.2 — Méthode d'analyse

L'analyse s'appuie sur :

- le cahier des charges v3.0 (`docs/cahier_des_charges.md`) ;
- les règles métier OBC/DECC (retrait, antennes, centres) ;
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

## 5. CAS D'UTILISATION *(SYNTAXE GÉNÉRALE + SYNTHÈSE PAR ACTEUR)*

### 5.0 — Syntaxe de modélisation retenue

La modélisation UML des cas d'utilisation suit **trois niveaux**, dans cet ordre :

| Niveau | Artefact | Rôle |
| --- | --- | --- |
| **1 — Vue d'ensemble** | **Diagramme général** des cas d'utilisation | Regroupe les **trois acteurs** (élève, admin OBC/DECC, agent centre) et l'ensemble des cas |
| **2 — Package / acteur** | **Diagramme de cas d'utilisation par package** | Zoom sur un acteur : PKG-ÉLÈVE, PKG-ADMIN ou PKG-AGENT |
| **3 — Module** | **Fiche descriptive → diagramme d'activité → diagramme de séquence** | Pour **3 à 4 modules phares** par package, détail d'un cas précis |

> **Règle de présentation** — Chaque figure (diagramme ou capture) est introduite par un **titre** (`Figure N — …`) placé **immédiatement au-dessus** de l'image ; le **texte ou le tableau explicatif** reprend **directement en dessous**, sans page blanche intercalée.

Le présent cahier d'analyse couvre les **niveaux 1 et 2** (figures 5.0 à 5.3). Le **niveau 3** (fiches, activités, séquences par module) est développé intégralement dans le **cahier de conception** (§3.0 bis, §3.2 à §3.4).

### 5.1 — Niveau 1 : diagramme général (trois acteurs)

**Figure 5.0 — Diagramme général des cas d'utilisation DR-DOCSCOL**

![Figure 5.0 — Diagramme général des cas d'utilisation DR-DOCSCOL (analyse)](diagrammes-images/cas-utilisation-general.png)

| Acteur | Cas principaux (vue générale) |
| --- | --- |
| Élève | consulter-via-QRcode, authentifier, effectuer-demande-retrait, prendre-rdv, annuler-rdv |
| Administrateur OBC / DECC | authentifier, METTRE-A-JOUR, EFFECTUER-IMPORT, DEFINIR-QUOTA-JOURNALIER, CONSULTER-JOURNAL-AUDIT |
| Agent centre d'examen | authentifier, consulter-les-rdv, confirmer-les-retraits-effectuer |

### 5.2 — Niveau 2 : package Élève (PKG-ELEVE / PKG-PUBLIC)

**Figure 5.1 — Diagramme de cas d'utilisation — package Élève**

![Figure 5.1 — Cas d'utilisation Élève (analyse)](diagrammes-images/cas-utilisation-eleve.drawio.png)

| Cas | Rôle dans le diagramme |
| --- | --- |
| authentifier | Point d'entrée ; inclut consulter-via-QRcode |
| effectuer-demande-retrait | Demande de retrait ; inclut authentifier ; généralise original-diplome, releve, duplicata |
| verifier-disponibilite | Extension optionnelle de effectuer-demande-retrait |
| duplicata | Inclut remplir-formulaire et effectuer-payement (qui inclut telecharger-recu) |
| prendre-rdv | Prise de rendez-vous de retrait ; annuler-rdv en extension |

**Modules phares documentés en conception (niveau 3)** — consultation publique & auth (§3.2.1–3.2.3), Mes documents (§3.2.4), demande relevé/diplôme (§3.2.5), duplicata & paiement (§3.2.6), rendez-vous (§3.2.7).

### 5.3 — Niveau 2 : package Administrateur OBC / DECC (PKG-ADMIN)

**Figure 5.2 — Diagramme de cas d'utilisation — package Administrateur OBC / DECC**

![Figure 5.2 — Cas d'utilisation Admin OBC/DECC (analyse)](diagrammes-images/cas-utilisation-admin-obc-decc.drawio.png)

| Cas | Rôle dans le diagramme |
| --- | --- |
| authentifier | Point d'entrée ; inclut METTRE-A-JOUR |
| METTRE-A-JOUR | Généralise original-diplome, releve, duplicata |
| duplicata | Inclut TRAITER-LA-DEMANDE → valider ou rejeter |
| EFFECTUER-IMPORT | Généralise import-disponibilisation et import-ajout-élève |
| DEFINIR-QUOTA-JOURNALIER | Inclut définir les jours fériés |
| CONSULTER-JOURNAL-AUDIT | Consultation du journal d'audit |

**Modules phares documentés en conception (niveau 3)** — imports CSV (§3.3.2–3.3.3), mise à jour statuts (§3.3.4), validation duplicata (§3.3.5), quota RDV (§3.3.6).

### 5.4 — Niveau 2 : package Agent centre d'examen (PKG-AGENT)

**Figure 5.3 — Diagramme de cas d'utilisation — package Agent centre d'examen**

![Figure 5.3 — Cas d'utilisation Agent centre (analyse)](diagrammes-images/cas-utilisation-agent-centre.drawio.png)

| Cas | Rôle dans le diagramme |
| --- | --- |
| authentifier | Point d'entrée ; inclut consulter-les-rdv |
| consulter-les-rdv | Consultation des rendez-vous transmis au centre |
| confirmer-les-retraits-effectuer | Extension : confirmation du retrait physique |

**Modules phares documentés en conception (niveau 3)** — authentification agent (§3.4.1), consultation RDV et confirmation retrait (§3.4.2).

> **Compléments UML et techniques** — voir `docs/cahier_conception.md` : §2.1 contexte, §2.4 packages, §3.0 UC général, §3.2–3.4 fiches / activités / séquences par package, **ch. 4 diagramme de classes (Figure 4.1)**.  
> **Besoins, contraintes, routage, enjeux** — voir `docs/cahier_des_charges.md` et chapitres 3 à 7 du cahier de conception.

---

## 6. SYNTHÈSE DE L'ANALYSE

L'étude de l'existant met en évidence un **besoin fort** de portail unifié pour :

- **Informer** l'usager avant tout déplacement (consultation par matricule, notifications) ;
- **Organiser** les retraits (rendez-vous, routage centre / antenne OBC/DECC) ;
- **Tracer** les opérations sensibles (disponibilisation, validation duplicata, confirmation de retrait) ;
- **Alléger** le travail administratif (imports CSV, back-office, espace agent).

La solution **DR-DOCSCOL** retenue répond à cette problématique en respectant le découpage institutionnel **OBC / DECC** et en séparant clairement les rôles élève, administrateur et agent centre. Le détail des besoins, règles métier, architecture, modèle de données et choix techniques est documenté dans le **cahier des charges** et le **cahier de conception**, sans duplication dans le présent document.

---

## 7. GLOSSAIRE

| Terme | Définition |
| --- | --- |
| OBC | Office du Baccalauréat du Cameroun |
| DECC | Direction des Examens, des Concours et de la Certification |
| Antenne régionale | Structure de retrait par région |
| Centre d'examen | Lieu de composition et de retrait pour certains documents |
| Disponibilisation | Passage d'un document au statut Disponible |
| Import A | Import CSV de disponibilisation (liste OBC/DECC) |
| Import B | Import CSV de nouveaux élèves |
| Duplicata | Copie certifiée d'un document perdu ou détérioré |
| DR-DOCSCOL | Application web de gestion des retraits de documents scolaires |

---

**Fin du cahier d'analyse — DR-DOCSCOL v1.0**

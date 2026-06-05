# Charte graphique & palette couleurs — DR-DOCSCOL

Application de gestion des demandes et retraits de documents scolaires (diplômes, relevés, duplicatas) — cas OBC / DECC.

Parties prenantes : **Élève / ancien élève**, **Administration (OBC / DECC)**, **Agent de centre d'examen**.

> Palette en vigueur : **Ardoise & Ambre**.

---

## 1. Philosophie de la palette

L'application est un **outil institutionnel** destiné à un large public. La priorité est donnée à la **lisibilité des informations** (statuts de documents, rendez-vous, paiements) et à une image **sobre, neutre et professionnelle**, tout en restant moderne et accessible.

La palette combine trois familles de couleurs :

| Famille | Rôle symbolique | Émotion transmise |
|---------|-----------------|-------------------|
| **Ardoise** (gris-bleuté neutre) | Couleur maîtresse, structure de l'interface | Sobriété, neutralité, sérieux, clarté |
| **Ambre** (accent chaud) | Action, mise en avant, réussite / diplôme | Énergie, chaleur, accomplissement |
| **Bleu info** (académique) | Information, accent élève | Confiance, calme, apprentissage |

L'**ardoise** porte l'essentiel de l'interface (en-têtes, textes, boutons primaires) et laisse respirer le contenu ; l'**ambre** guide l'œil vers les actions et les notifications ; le **bleu** sert l'information et l'accent élève. Les couleurs vives sont réservées aux **statuts** pour rester immédiatement compréhensibles.

---

## 2. Couleurs principales (valeurs hexadécimales)

### Ardoise (couleur principale) — `obc`
| Token | Hex | Usage |
|-------|-----|-------|
| `obc-900` | `#0f172a` | Fonds sombres (hero, CTA), texte fort |
| `obc-800` | `#1e293b` | En-têtes, boutons primaires |
| `obc-700` | `#334155` | Accent administration, titres |
| `obc-600` | `#475569` | Liens, icônes |
| `obc-500` | `#64748b` | Texte tertiaire, boutons secondaires |
| `obc-400` | `#94a3b8` | Accents clairs, focus ring |
| `obc-300` | `#cbd5e1` | Bordures de boutons |
| `obc-200` | `#e2e8f0` | Bordures douces |
| `obc-100` | `#f1f5f9` | Fonds de pastilles |
| `obc-50`  | `#f8fafc` | Fonds de sections |

### Bleu info / accent élève — `edu`
| Token | Hex | Usage |
|-------|-----|-------|
| `edu-900` | `#1e3a8a` | Texte accent foncé |
| `edu-700` | `#1d4ed8` | Icônes accent |
| `edu-600` | `#2563eb` | Accent élève (boutons, icônes) |
| `edu-500` | `#3b82f6` | Accent élève principal |
| `edu-100` | `#dbeafe` | Fonds d'icônes |
| `edu-50`  | `#eff6ff` | Fonds doux élève |

### Ambre (accent) — `gold`
| Token | Hex | Usage |
|-------|-----|-------|
| `gold-500` | `#f59e0b` | Accent agent, détails, surbrillances |
| `gold-400` | `#fbbf24` | Surbrillances, pampille du logo |
| `gold-300` | `#fcd34d` | Boutons secondaires (survol) |
| `gold-100` | `#fef3c7` | Fonds doux agent, boutons secondaires |

---

## 3. Couleurs par acteur (accents de rôle)

Chaque partie prenante reçoit une couleur d'accent dédiée, exposée via les tokens Tailwind `role-*`.

| Acteur | Couleur | Hex | Émotion / intention | Tokens |
|--------|---------|-----|---------------------|--------|
| **Élève** | Bleu info | `#2563eb` | Confiance, apprentissage, avenir — on accompagne et on rassure le jeune usager | `role-eleve`, `role-eleve-soft` |
| **Administration (OBC/DECC)** | Ardoise | `#334155` | Autorité, officiel, stabilité, sérieux — l'institution garante des documents | `role-admin`, `role-admin-soft` |
| **Agent centre d'examen** | Ambre | `#b45309` | Accueil, action concrète, validation du retrait, chaleur du contact sur place | `role-agent`, `role-agent-soft` |

Sur la page d'accueil, ces accents apparaissent sur les cartes « Accès par profil » (icône + bordure au survol).

---

## 4. Couleurs de statut (documents & rendez-vous)

Les couleurs de statut sont volontairement **conservées et distinctes** de la palette principale, pour rester universellement compréhensibles.

| Statut | Hex | Signification |
|--------|-----|---------------|
| Disponible | `#16a34a` | Document prêt — vert positif |
| En attente | `#d97706` | Action / paiement requis — ambre d'alerte douce |
| Planifié | `#2563eb` | Rendez-vous programmé — bleu informatif |
| Retiré | `#6b7280` | Terminé / archivé — gris neutre |
| Annulé | `#dc2626` | Annulation — rouge |

---

## 5. Neutres & surfaces

| Token | Hex | Usage |
|-------|-----|-------|
| `surface-0` | `#ffffff` | Cartes, fonds principaux |
| `surface-1` | `#f8fafc` | Fonds de sections alternées |
| `surface-2` | `#f1f5f9` | Zones enfoncées |
| `border-token` | `#e2e8f0` | Bordures |
| `text-1` | `#0f172a` | Texte principal |
| `text-2` | `#334155` | Texte secondaire |
| `text-3` | `#64748b` | Texte tertiaire / descriptions |
| `text-muted` | `#94a3b8` | Légendes, mentions |

---

## 6. Rendu visuel (ce qui a été appliqué)

- **Images de fond humaines** : photo de diplômés camerounais (toques, diplômes) dans le hero ; documents officiels sur une table dans la bande d'appel à l'action ; groupe d'élèves joyeux derrière les témoignages ; une image adaptée par rôle sur les cartes « Accès par profil ».
- **Avant / après** : la section « Problème & solution » illustre la file d'attente (sans portail) face au parcours en ligne apaisé (avec DR-DOCSCOL).
- **Logo** : emblème éducation (toque de diplômé, pampille dorée) — `components/ui/DocScolLogo.tsx`.
- **Carrousels automatiques** : les cartes « Fonctionnalités » et « Témoignages » défilent en continu de droite à gauche, en pause au survol (`components/ui/marquee-carousel.tsx`).
- **Accents par acteur** : cartes d'accès colorées selon le rôle (bleu / ardoise / ambre).
- **Responsive** : navigation mobile (menus repliables), grilles et tableaux qui s'empilent sur téléphone et tablette.

---

## 7. Où c'est défini dans le code

| Élément | Fichier |
|---------|---------|
| Variables CSS (palette, rôles, animation) | `styles/globals.css` |
| Exposition Tailwind (`edu-*`, `role-*`) | `tailwind.config.js` |
| Logo | `components/ui/DocScolLogo.tsx` |
| Carrousel auto | `components/ui/marquee-carousel.tsx` |
| Page d'accueil | `components/landing/landing-page.tsx` |
| Images | `public/images/landing/`, `public/images/photos/` |

> Pour changer de palette, il suffit de remplacer les **valeurs** des variables dans `styles/globals.css` : la mise en page (formes, espacements, composants) reste inchangée.

---

## 8. Émotions recherchées par zone

| Zone | Couleurs dominantes | Émotion visée |
|------|--------------------|----------------|
| Hero | Ardoise profonde + photo diplômés + ambre | Fierté, aspiration, « j'y arrive » |
| Fonctionnalités | Blanc + ardoise + bleu info | Clarté, fiabilité |
| Problème / solution | Rouge doux vs ardoise | Contraste rassurant |
| Accès par profil | Bleu / ardoise / ambre par rôle | Appartenance, repère immédiat |
| Témoignages | Ardoise + ambre | Confiance sociale, chaleur |
| CTA final | Ardoise profonde + documents officiels | Décision sereine, passage à l'action |

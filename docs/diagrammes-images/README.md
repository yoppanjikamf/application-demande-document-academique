# Images UML generees

Ces images ont ete regenerees le 04/06/2026 a partir des sources actuelles du dossier `docs/diagrammes-mermaid/` et des regles metier validees.

Note: le diagramme de cas d'utilisation et les diagrammes MCD / MLD / classes conformes sont produits en SVG personnalise pour respecter la notation fournie en modele de reference.

Chaque diagramme existe en deux formats :

- `.png` : pratique pour insertion directe dans Word/LibreOffice.
- `.svg` : vectoriel, plus net au zoom et recommande pour les grands diagrammes.

## Diagrammes generes

| Image | Contenu |
|-------|---------|
| `diagramme-cas-utilisation-v2.png` / `.svg` | Cas d'utilisation complet OBC / DECC, en disposition verticale |
| `diagramme-classes-v2.svg` | Diagramme de classes **detaille** : 20 tables Prisma, tous attributs et liaisons |
| `diagramme-classes-soutenance.png` / `.svg` | Diagramme de classes **principal** : structure en croix + 9 entites metier essentielles (a utiliser en soutenance) |

Regeneration diagrammes conformes (MCD, MLD, classes detaille) : `npm run diagrams:conform`
| `diagramme-mcd-v2.svg` | MCD conforme avec entites rectangulaires, associations en ovales et cardinalites |
| `diagramme-mld-v2.svg` | MLD conforme avec tables, cles PK/FK et relations directes |
| `diagramme-mcd-mld-v2.svg` | Planche synthetique MCD / MLD conforme |
| `sequence-01-inscription-v2.png` / `.svg` | Inscription et activation du compte |
| `sequence-02-connexion-v2.png` / `.svg` | Connexion et deconnexion |
| `sequence-03-consultation-documents-v2.png` / `.svg` | Consultation des documents scolaires |
| `sequence-04-notification-disponibilite-v2.png` / `.svg` | Notification de disponibilite |
| `sequence-05-duplicata-paiement-v2.png` / `.svg` | Demande de duplicata et paiement |
| `sequence-06-rendez-vous-v2.png` / `.svg` | Reservation et annulation de rendez-vous |
| `sequence-07-statut-document-v2.png` / `.svg` | Mise a jour du statut d'un document |
| `sequence-08-retrait-physique-v2.png` / `.svg` | Retrait physique d'un document |

## Version v3 soutenance (nouvelle structure)

Sources Mermaid : `docs/diagrammes-mermaid/sequence-*-v3-soutenance.mmd`

Structure : **Acteur → Systeme → Base de donnees** + `alt` Donnees valides / invalides (comme le modele de soutenance).

| Fichier | Contenu |
|---------|---------|
| `sequence-01-inscription-v3-soutenance.png` / `.svg` | Activation compte |
| `sequence-02-connexion-v3-soutenance.png` / `.svg` | Connexion |
| `sequence-03-consultation-documents-v3-soutenance.png` / `.svg` | Consultation documents |
| `sequence-04-notification-disponibilite-v3-soutenance.png` / `.svg` | Notification disponibilite |
| `sequence-05-duplicata-paiement-v3-soutenance.png` / `.svg` | Duplicata et paiement |
| `sequence-06-rendez-vous-v3-soutenance.png` / `.svg` | Rendez-vous eleve |
| `sequence-07-statut-document-v3-soutenance.png` / `.svg` | Statut document admin |
| `sequence-08-retrait-physique-v3-soutenance.png` / `.svg` | Retrait physique |
| `sequence-09-ajout-eleve-admin-v3-soutenance.png` / `.svg` | Ajout eleves admin |
| `sequence-10-demande-document-v3-soutenance.png` / `.svg` | Demande releve / diplome |

Regeneration : `npm run diagrams:export-v3` (Kroki, reseau requis).

Les images `*-v2.*` restent disponibles. Voir `docs/diagrammes-mermaid/README.md` pour les autres commandes.

Les fichiers sources Mermaid sont dans `docs/diagrammes-mermaid/`. Les diagrammes conformes au modele de reference sont volontairement retravailles en SVG pour respecter la notation attendue.

# Documentation du projet DR-DOCSCOL

Ce dossier contient la documentation fonctionnelle et technique de l'application de gestion des demandes et retraits de documents academiques.

Derniere mise a jour globale: 02/06/2026.

## Etat du projet

Le projet est pret pour une soutenance ou une demonstration encadree. Le coeur fonctionnel OBC / DECC / eleves / agents centre d'examen est en place.

Il reste trois points a finaliser avant une mise en production reelle:

- stabiliser la connexion Prisma vers Postgres Supabase / Supavisor;
- brancher un prestataire de paiement reel;
- stocker les justificatifs de duplicata dans un stockage fichier, par exemple Supabase Storage.

Voir `ETAT_FINAL_PROJET.md` pour le verdict detaille.

## Fichiers principaux a utiliser

| Fichier | Role |
| --- | --- |
| `ETAT_FINAL_PROJET.md` | Audit final du projet, points termines et restes a faire |
| `cahier_des_charges_mis_a_jour.md` | Cahier des charges aligne avec le code actuel |
| `guide_api_mis_a_jour.md` | Guide API + statut des routes implementees |
| `GUIDE_TEST_FONCTIONNEL.md` | Guide de test fonctionnel aligne avec les parcours actuels |
| `diagrammes_uml_mis_a_jour.md` | Documentation UML, notes de coherence et references vers les diagrammes conformes |
| `documents-word/` | Versions Word regenerees depuis les Markdown actuels |
| `diagrammes-images/` | Images PNG/SVG finales, dont MCD, MLD et classes detailles conformes au modele fourni |
| `diagrammes-mermaid/` | Sources `.mmd` conservees pour les diagrammes Mermaid restants |
| `tableurs-excel/` | Versions Excel des jeux de donnees CSV |
| `CHANGELOG_UML.md` | Historique des modifications UML/documentation |
| `configuration-gmail-nodemailer.md` | Configuration SMTP Gmail et usage dans l'application |
| `test-data-eleves.csv` | Jeu de donnees CSV compatible avec l'import admin |
| `test-data-1000-eleves.csv` | Jeu complet pour seed de 1000 eleves |
| `connexions-tests-completes.md` | Identifiants et pages de connexion pour tous les profils |
| `routes-implementees.md` | Inventaire des pages, routes API et Server Actions |

## Organisation finale

Les anciennes versions et les doublons ont ete retires du dossier `docs/`.

- Les Markdown a la racine sont les sources de verite.
- Les documents Word sont uniquement dans `documents-word/`.
- Les diagrammes images sont uniquement dans `diagrammes-images/`.
- Les sources Mermaid sont uniquement dans `diagrammes-mermaid/`; les MCD, MLD et classes conformes sont generes par `scripts/generate-conform-diagrams.mjs`.
- Les fichiers Excel generes depuis les CSV sont dans `tableurs-excel/`.

## Points importants du projet actuel

- Le projet utilise Next.js App Router, Supabase Auth, Prisma et PostgreSQL.
- Les roles reels sont `ELEVE`, `ADMINISTRATEUR` et `AGENT_CENTRE_EXAMEN`.
- Les mots de passe ne sont pas stockes dans Prisma.
- Les documents sont routes selon l'organisme, le diplome, le type de document et la region de composition.
- Le BEPC est route vers la DECC.
- Le BEPC original et le releve BEPC se retirent au centre d'examen avec rendez-vous `PLANIFIE`.
- Le duplicata BEPC se retire a l'antenne regionale DECC.
- Le Probatoire ne donne pas lieu a un diplome original et produit uniquement un releve retire au centre d'examen avec rendez-vous `PLANIFIE`.
- Le releve du Baccalaureat se retire au centre d'examen avec rendez-vous `PLANIFIE`.
- Le Baccalaureat original est route vers une antenne regionale OBC et necessite un rendez-vous.
- Les admins OBC et DECC sont scopes par organisme et antenne regionale.
- Les agents centres d'examen voient les rendez-vous transmis et confirment uniquement les retraits physiques de leur region.
- Les notifications du MVP sont en base + email, pas encore push.
- Le paiement Mobile Money / carte bancaire reel reste a finaliser ; le MVP gere le paiement applicatif du duplicata avec recu.
- Les pieces justificatives sont exigees dans le formulaire, mais leur stockage fichier complet reste a brancher.

## Attention sur les fichiers Word et images

Les `.md` restent la source de verite la plus recente. Les fichiers `.docx`, images UML et exports Mermaid ont ete regeneres depuis l'etat projet du 02/06/2026.

# Documentation du projet DR-DOCSCOL

Ce dossier contient la documentation fonctionnelle et technique de l'application de gestion des demandes et retraits de documents academiques.

## Fichiers principaux a utiliser

| Fichier | Role |
| --- | --- |
| `cahier_des_charges_mis_a_jour.md` | Cahier des charges aligne avec le code actuel |
| `cahier_des_charges.docx` | Version Word regeneree depuis le cahier des charges mis a jour |
| `guide_api_mis_a_jour.md` | Guide API + statut des routes implementees |
| `Guide_API_NextJS_OBC_Retraits_Documents.docx` | Version Word regeneree depuis le guide API mis a jour |
| `diagrammes_uml_mis_a_jour.md` | Sources Mermaid des cas d'utilisation, classes, MCD/MLD et sequences |
| `diagrammes-images/` | Images PNG/SVG regenerees depuis les diagrammes UML mis a jour |
| `diagrammes-mermaid/` | Sources `.mmd` utilisees pour regenerer les images |
| `CHANGELOG_UML.md` | Historique des modifications UML/documentation |
| `configuration-gmail-nodemailer.md` | Configuration SMTP Gmail et usage dans l'application |
| `test-data-eleves.csv` | Jeu de donnees CSV compatible avec l'import admin |

## Fichiers historiques

Les fichiers images suivants sont conserves comme traces initiales, mais ils ne doivent plus etre consideres comme la version la plus fiable :

- `diagramme classe.jpeg`
- `diagramme cas d utilisation.jpeg`
- `MCD PROJET ET MLD.drawio.png`
- `Capture d’écran du 2026-05-18 *.png`
- `uml-update-2026-05-18*.md`

Les versions sources mises a jour sont dans les fichiers Markdown listes plus haut. Les deux `.docx` principaux ont ete regeneres a partir de ces sources.

## Points importants du projet actuel

- Le projet utilise Next.js App Router, Supabase Auth, Prisma et PostgreSQL.
- Les roles reels sont `ELEVE` et `ADMINISTRATEUR`.
- Les mots de passe ne sont pas stockes dans Prisma.
- Les documents sont routes selon l'organisme, le diplome, le type de document et la region de composition.
- Le BEPC est route vers la DECC.
- Le Baccalaureat original est route vers une antenne regionale OBC et necessite un rendez-vous.
- Le Probatoire ne donne pas lieu a un diplome original.
- Les notifications du MVP sont en base + email, pas encore push.
- Le paiement Mobile Money reel reste a finaliser ; le MVP gere surtout le paiement applicatif du duplicata avec reçu.

## Dossier template dashboard

Le dossier `docs/free-nextjs-admin-dashboard-main` est une copie de template. Il ne documente pas le metier de DR-DOCSCOL. Il peut servir de reference UI, mais il ne doit pas etre confondu avec la documentation fonctionnelle.

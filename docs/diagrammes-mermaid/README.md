# Diagrammes Mermaid

Ce dossier contient les sources actuelles des diagrammes UML du projet, alignees avec le code et les regles metier validees le 02/06/2026.

Les images finales sont generees dans `docs/diagrammes-images/` au format PNG et SVG.

Regle importante de retrait :

- BEPC original et releve : retrait au centre d'examen avec rendez-vous `PLANIFIE`.
- BEPC duplicata : retrait a l'antenne regionale DECC.
- Probatoire : uniquement releve, retrait au centre d'examen avec rendez-vous `PLANIFIE`.
- Baccalaureat releve : retrait au centre d'examen avec rendez-vous `PLANIFIE`.
- Baccalaureat original : retrait a l'antenne regionale OBC.
- L'agent centre d'examen ne planifie pas et ne modifie pas les rendez-vous ; il confirme seulement que le retrait physique a ete effectue.

## Version v2 (detail technique)

Diagrammes detailles avec plusieurs composants (API, Supabase, services internes).

- `sequence-01-inscription-v2.mmd` … `sequence-08-retrait-physique-v2.mmd`

## Version v3 soutenance (structure conforme)

Structure imposee a la soutenance : **Acteur → Systeme DR-DOCSCOL → Base de donnees**, avec :

1. action initiale de l acteur ;
2. affichage du formulaire par le systeme ;
3. saisie des details ;
4. bloc `alt` **Donnees valides** / **Donnees invalides**.

| Fichier source | Cas metier |
|---------------|------------|
| `sequence-01-inscription-v3-soutenance.mmd` | Activation du compte eleve |
| `sequence-02-connexion-v3-soutenance.mmd` | Connexion multi-role |
| `sequence-03-consultation-documents-v3-soutenance.mmd` | Consultation Mes documents |
| `sequence-04-notification-disponibilite-v3-soutenance.mmd` | Admin : document disponible + notification |
| `sequence-05-duplicata-paiement-v3-soutenance.mmd` | Demande de duplicata et paiement |
| `sequence-06-rendez-vous-v3-soutenance.mmd` | Reservation de RDV par l eleve |
| `sequence-07-statut-document-v3-soutenance.mmd` | Admin : changement de statut |
| `sequence-08-retrait-physique-v3-soutenance.mmd` | Agent : confirmation du retrait |
| `sequence-09-ajout-eleve-admin-v3-soutenance.mmd` | Admin : ajout manuel ou import CSV |
| `sequence-10-demande-document-v3-soutenance.mmd` | Eleve : demande releve ou diplome original |

Les fichiers `*-v2.mmd` sont conserves sans modification.

Regeneration recommandee (PNG + SVG, via Kroki) :

```bash
npm run diagrams:export-v3
```

Alternative locale (plus lente, Puppeteer) :

```bash
npx @mermaid-js/mermaid-cli -p docs/diagrammes-mermaid/puppeteer-config.json \
  -w 2000 -H 1400 -s 2 \
  -i docs/diagrammes-mermaid/sequence-01-inscription-v3-soutenance.mmd \
  -o docs/diagrammes-images/sequence-01-inscription-v3-soutenance.png
```

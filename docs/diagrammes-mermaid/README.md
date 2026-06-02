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

Commande de regeneration utilisee :

```bash
node /chemin/vers/@mermaid-js/mermaid-cli/src/cli.js \
  -p docs/diagrammes-mermaid/puppeteer-config.json \
  -w 2400 -H 1800 -s 2 \
  -i docs/diagrammes-mermaid/diagramme-cas-utilisation-v2.mmd \
  -o docs/diagrammes-images/diagramme-cas-utilisation-v2.png
```

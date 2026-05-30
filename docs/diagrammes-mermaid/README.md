# Sources Mermaid

Ce dossier contient les sources `.mmd` extraites de `docs/diagrammes_uml_mis_a_jour.md`.

Elles servent a regenerer les images du dossier `docs/diagrammes-images/`.

Commande utilisee :

```bash
npx -y @mermaid-js/mermaid-cli@latest -i source.mmd -o image.png -b white -s 2
```

Pour generer une version vectorielle :

```bash
npx -y @mermaid-js/mermaid-cli@latest -i source.mmd -o image.svg -b white
```

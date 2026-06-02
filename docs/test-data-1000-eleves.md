# Donnees de test - 1000 eleves

Seed genere pour les tests DR-DOCSCOL.

Derniere verification documentaire: 02/06/2026.

- Eleves crees en base: 1000
- Eleves avec au moins un document: 990
- Eleves sans document: 10
- Documents scolaires crees: 1905
- Regions couvertes: Adamaoua, Centre, Est, Extreme-Nord, Littoral, Nord, Nord-Ouest, Ouest, Sud, Sud-Ouest

## Comptes reels pour activation

Ces comptes existent dans la table `users` avec `authUserId = null`. Chaque eleve cree son mot de passe depuis `/auth/register`.

| Matricule | Email                       | Nom            |
| --------- | --------------------------- | -------------- |
| ELEVE0001 | faissayoppanjikam@gmail.com | Aicha ABANDA   |
| ELEVE0002 | fayellefouedjio@gmail.com   | Aissatou ABEGA |
| ELEVE0003 | yasminengaballa@gmail.com   | Akim ABENA     |
| ELEVE0004 | francialengambia@gmail.com  | Alain ACHIRI   |
| ELEVE0005 | yoppanjikamf@gmail.com      | Aminatou AKOA  |

## Fichier CSV

`docs/test-data-1000-eleves.csv`

## Commande

```bash
npm run seed:1000-eleves
```

## Notes de perimetre

- Les eleves n'ont pas de mot de passe seed par defaut: ils doivent activer leur compte via `/auth/register`.
- Les documents BEPC sont routes vers DECC.
- Les documents Baccalaureat et Probatoire sont routes vers OBC.
- Les eleves avec 0 document servent a tester l'etat vide du dashboard.
- Pour tester les connexions completes, voir `connexions-tests-completes.md`.

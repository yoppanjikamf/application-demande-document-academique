# Admins regionaux de test

Ces comptes sont rattaches a l'organisme OBC. Chaque administrateur est lie a une seule antenne regionale via `antenneRegionaleId`.

Le filtrage est applique dans l'application avec `getAdminDocumentScope(admin)` : un admin OBC ne voit que les documents, rendez-vous, paiements et eleves rattaches a son antenne regionale.

| Region       | Email                          | Mot de passe          | Matricule           | Antenne              |
| ------------ | ------------------------------ | --------------------- | ------------------- | -------------------- |
| Adamaoua     | admin.adamaoua@example.com     | AdminAdamaoua2026!    | ADM-01-ADAMAOUA     | antenne-adamaoua     |
| Centre       | admin.centre@example.com       | AdminCentre2026!      | ADM-02-CENTRE       | antenne-centre       |
| Est          | admin.est@example.com          | AdminEst2026!         | ADM-03-EST          | antenne-est          |
| Extreme-Nord | admin.extreme-nord@example.com | AdminExtremeNord2026! | ADM-04-EXTREME-NORD | antenne-extreme-nord |
| Littoral     | admin.littoral@example.com     | AdminLittoral2026!    | ADM-05-LITTORAL     | antenne-littoral     |
| Nord         | admin.nord@example.com         | AdminNord2026!        | ADM-06-NORD         | antenne-nord         |
| Nord-Ouest   | admin.nord-ouest@example.com   | AdminNordOuest2026!   | ADM-07-NORD-OUEST   | antenne-nord-ouest   |
| Ouest        | admin.ouest@example.com        | AdminOuest2026!       | ADM-08-OUEST        | antenne-ouest        |
| Sud          | admin.sud@example.com          | AdminSud2026!         | ADM-09-SUD          | antenne-sud          |
| Sud-Ouest    | admin.sud-ouest@example.com    | AdminSudOuest2026!    | ADM-10-SUD-OUEST    | antenne-sud-ouest    |

## Commande

```bash
npm run seed:regional-admins
```

## Notes de test

- Les comptes sont idempotents : relancer la commande remet les memes mots de passe et les memes rattachements regionaux.
- Pour verifier l'isolation, connecte-toi avec deux admins de regions differentes puis compare les pages `/admin`, `/admin/students`, `/admin/documents`, `/admin/appointments` et `/admin/payments`.
- Les demandes BEPC sont rattachees a DECC. Utilise les comptes DECC regionaux pour les tester.

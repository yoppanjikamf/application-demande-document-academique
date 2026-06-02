# Admins DECC regionaux de test

Ces comptes sont rattaches a l'organisme DECC. Chaque administrateur DECC gere uniquement les demandes BEPC de sa region.

Derniere verification documentaire: 02/06/2026.

| Region       | Email                               | Mot de passe         | Matricule            | Antenne                   |
| ------------ | ----------------------------------- | -------------------- | -------------------- | ------------------------- |
| Adamaoua     | admin.decc.adamaoua@example.com     | DeccAdamaoua2026!    | DECC-01-ADAMAOUA     | antenne-decc-adamaoua     |
| Centre       | admin.decc.centre@example.com       | DeccCentre2026!      | DECC-02-CENTRE       | antenne-decc-centre       |
| Est          | admin.decc.est@example.com          | DeccEst2026!         | DECC-03-EST          | antenne-decc-est          |
| Extreme-Nord | admin.decc.extreme-nord@example.com | DeccExtremeNord2026! | DECC-04-EXTREME-NORD | antenne-decc-extreme-nord |
| Littoral     | admin.decc.littoral@example.com     | DeccLittoral2026!    | DECC-05-LITTORAL     | antenne-decc-littoral     |
| Nord         | admin.decc.nord@example.com         | DeccNord2026!        | DECC-06-NORD         | antenne-decc-nord         |
| Nord-Ouest   | admin.decc.nord-ouest@example.com   | DeccNordOuest2026!   | DECC-07-NORD-OUEST   | antenne-decc-nord-ouest   |
| Ouest        | admin.decc.ouest@example.com        | DeccOuest2026!       | DECC-08-OUEST        | antenne-decc-ouest        |
| Sud          | admin.decc.sud@example.com          | DeccSud2026!         | DECC-09-SUD          | antenne-decc-sud          |
| Sud-Ouest    | admin.decc.sud-ouest@example.com    | DeccSudOuest2026!    | DECC-10-SUD-OUEST    | antenne-decc-sud-ouest    |

## Connexion

Utilise la page `/auth/login/decc`. Un admin OBC est bloque sur cette page, meme avec un bon mot de passe.

Champs a saisir pour Adamaoua:

- Matricule: `DECC-01-ADAMAOUA`
- Email: `admin.decc.adamaoua@example.com`
- Mot de passe: `DeccAdamaoua2026!`

Le compte Adamaoua existe dans Supabase Auth avec:

- role: `ADMINISTRATEUR`
- organismeId: `org-decc`
- antenneRegionaleId: `antenne-decc-adamaoua`

Si la connexion renvoie une erreur serveur alors que le mot de passe est correct, verifier d'abord la connexion Prisma/Postgres Supabase. Une panne ou un timeout du pooler Postgres peut bloquer la connexion applicative meme si Supabase Auth accepte les identifiants.

## Commande

```bash
npm run seed:decc-admins
```

## Perimetre fonctionnel

- Les admins DECC voient les documents BEPC de leur region.
- Les demandes BEPC sont routees vers `org-decc`.
- Les duplicatas BEPC sont rattaches a l'antenne DECC regionale.
- Les pages OBC-only (`/admin/appointments`, `/admin/rdv-disponibilites`) redirigent un admin DECC vers `/admin`.

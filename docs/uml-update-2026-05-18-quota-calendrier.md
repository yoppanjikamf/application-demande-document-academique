# Mise a jour UML - 18/05/2026 (Quota calendrier)

## Resume
- Quota journalier par admin pour les retraits.
- Calendrier eleve avec jours bloques si quota atteint.
- Creneaux fixes de 30 minutes, lundi a vendredi.

## Impact schema
- Ajout de `User.maxRdvParJour`.

## Flux a refleter
- Admin: definition du quota journalier.
- Eleve: selection d'un jour libre puis d'un horaire fixe.

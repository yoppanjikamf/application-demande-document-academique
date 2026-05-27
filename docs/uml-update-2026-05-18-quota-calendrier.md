# Mise a jour UML - 18/05/2026 (Quota calendrier)

## Resume initial

- Quota journalier par admin pour les retraits.
- Calendrier eleve avec jours bloques si quota atteint.
- Creneaux fixes, lundi a vendredi.

## Etat apres synchronisation du 27/05/2026

La logique actuelle est plus precise que la note initiale :

- `User.maxRdvParJour` existe encore dans le schema.
- La logique principale utilise `ParametreRendezVous.quotaJournalier`.
- Les horaires configurables sont representes par `CreneauHoraire`.
- Les jours bloques sont representes par `JourFerie` et par la detection week-end.

## Flux calendrier a representer

1. L'eleve selectionne une date.
2. Le systeme refuse samedi et dimanche.
3. Le systeme refuse les jours feries annuels ou ponctuels.
4. Le systeme charge le quota journalier.
5. Le systeme compte les RDV `PLANIFIE` et `CONFIRME` du jour.
6. Le systeme repartit la capacite entre les creneaux actifs.
7. L'eleve choisit un creneau disponible.
8. Le systeme cree un RDV `CONFIRME`.

## Points a ne pas oublier

- Le calendrier n'est pas universel pour tous les documents : il s'applique seulement aux documents dont le retrait necessite un rendez-vous.
- La regle de routage est definie dans `lib/document-routing.ts`.
- Les creneaux affiches viennent de `lib/appointment-service.ts`.

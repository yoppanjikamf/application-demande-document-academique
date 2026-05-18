# Mise a jour UML - 18/05/2026 (Eleves + RDV)

## Resume
- Ajout des creneaux de disponibilite pour les rendez-vous de retrait.
- Ajout des pages eleves pour lister les documents et gerer les retraits.
- Ajout de l'import CSV admin pour creer un jeu de donnees.

## Impact schema
- Nouveau modele `DisponibiliteRdv`.
- Liaison optionnelle entre `RendezVous` et `DisponibiliteRdv`.

## Flux a refleter
- Admin: creation de creneaux libres.
- Eleve: reservation d'un creneau et annulation.
- Import CSV: creation des eleves, documents et RDV.

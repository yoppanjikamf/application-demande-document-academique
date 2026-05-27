# Mise a jour UML - 18/05/2026 (Eleves + RDV)

## Resume initial

- Ajout des creneaux de disponibilite pour les rendez-vous de retrait.
- Ajout des pages eleves pour lister les documents et gerer les retraits.
- Ajout de l'import CSV admin pour creer un jeu de donnees.

## Etat apres synchronisation du 27/05/2026

Le flux RDV a evolue. Le modele `DisponibiliteRdv` existe encore, mais la logique principale de disponibilite repose maintenant sur :

- `ParametreRendezVous` pour le quota journalier global ;
- `CreneauHoraire` pour les plages horaires actives ;
- `JourFerie` pour bloquer des dates ;
- `RendezVous` pour les reservations et les retraits honores.

## Regles RDV a refleter dans les diagrammes

- Un RDV est cree seulement pour un document `DISPONIBLE`.
- Un RDV est requis seulement si le routage du document l'impose.
- Le diplome original du Baccalaureat se retire en antenne regionale OBC et necessite un RDV.
- Les releves et certains documents se retirent directement au centre d'examen sans RDV.
- Les week-ends et jours feries sont bloques.
- Un jour est bloque lorsque le quota journalier est atteint.
- Un eleve ne peut pas avoir deux RDV actifs pour le meme document.
- Les statuts RDV sont `PLANIFIE`, `CONFIRME`, `ANNULE`, `HONORE`.

## Import CSV a refleter

L'import doit maintenant mentionner les colonnes :

- `diplome_type`
- `centre_examen`
- `region_composition`
- `document_type`
- `document_statut`
- `rdv_statut`

Voir `docs/test-data-eleves.csv`.

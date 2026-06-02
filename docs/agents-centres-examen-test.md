# Agents Centres d'Examen de test

Ces comptes sont rattaches au role `AGENT_CENTRE_EXAMEN`. Chaque agent est lie a un seul centre d'examen et ne voit que les rendez-vous de retrait confirmes pour sa region.

| Region       | Centre d'examen              | Email                                 | Mot de passe     | Matricule                |
| ------------ | ---------------------------- | ------------------------------------- | ---------------- | ------------------------ |
| Adamaoua     | Centre d'examen Adamaoua     | agent.centre.adamaoua@example.com     | AgentCentre2026! | AGENT-CE-01-ADAMAOUA     |
| Centre       | Centre d'examen Centre       | agent.centre.centre@example.com       | AgentCentre2026! | AGENT-CE-02-CENTRE       |
| Est          | Centre d'examen Est          | agent.centre.est@example.com          | AgentCentre2026! | AGENT-CE-03-EST          |
| Extreme-Nord | Centre d'examen Extreme-Nord | agent.centre.extreme-nord@example.com | AgentCentre2026! | AGENT-CE-04-EXTREME-NORD |
| Littoral     | Centre d'examen Littoral     | agent.centre.littoral@example.com     | AgentCentre2026! | AGENT-CE-05-LITTORAL     |
| Nord         | Centre d'examen Nord         | agent.centre.nord@example.com         | AgentCentre2026! | AGENT-CE-06-NORD         |
| Nord-Ouest   | Centre d'examen Nord-Ouest   | agent.centre.nord-ouest@example.com   | AgentCentre2026! | AGENT-CE-07-NORD-OUEST   |
| Ouest        | Centre d'examen Ouest        | agent.centre.ouest@example.com        | AgentCentre2026! | AGENT-CE-08-OUEST        |
| Sud          | Centre d'examen Sud          | agent.centre.sud@example.com          | AgentCentre2026! | AGENT-CE-09-SUD          |
| Sud-Ouest    | Centre d'examen Sud-Ouest    | agent.centre.sud-ouest@example.com    | AgentCentre2026! | AGENT-CE-10-SUD-OUEST    |

## Connexion

Utilise la page `/auth/login/centre-examen`.

## Commande

```bash
npm run seed:centre-agents
```

## Perimetre de test

- L'agent voit uniquement les rendez-vous de son centre.
- L'agent ne voit pas les documents numerises et ne peut pas les telecharger.
- L'agent ne peut ni creer, ni annuler, ni supprimer une demande.
- L'agent peut seulement confirmer le retrait d'un rendez-vous confirme.
- Les retraits deja confirmes restent consultables pendant 30 jours dans l'onglet `Deja traites`, puis disparaissent de cette liste sans etre supprimes de l'historique.

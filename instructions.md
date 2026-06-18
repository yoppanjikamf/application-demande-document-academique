# Instructions développeur

Ce fichier est un raccourci. La documentation à jour est dans [`docs/README.md`](docs/README.md).

## Rôles (Prisma)

- `ELEVE` — espace `/dashboard`
- `ADMINISTRATEUR` — espace `/admin` (scope OBC ou DECC + antenne régionale)
- `AGENT_CENTRE_EXAMEN` — espace `/centre-examen`

Les mots de passe sont gérés par **Supabase Auth**, pas par Prisma.

## Points d'entrée code

| Domaine | Emplacement |
|---------|-------------|
| Routage métier OBC/DECC | `lib/document-routing.ts` |
| Consultation publique | `lib/public-consultation.ts`, `/consultation` |
| Parcours élève | `app/dashboard/`, `app/dashboard/actions.ts` |
| Admin + imports CSV | `app/admin/`, `lib/admin-student-import.ts` |
| Centre d'examen | `app/centre-examen/`, `lib/centre-examen-service.ts` |

## Seeds démo soutenance

```bash
npm run seed:soutenance-eleves
```

Puis imports admin via les CSV dans `docs/` (voir `docs/demo/KIT_DEMO_COMPLET.md`).

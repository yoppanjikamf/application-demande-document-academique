# Mise a jour UML - 18/05/2026

## Resume initial

- Ajout du flux de connexion admin avec creation/validation automatique Supabase Auth.
- Mise a jour du profil utilisateur via une page de modification dediee.

## Etat apres synchronisation du 27/05/2026

Cette note reste valide, mais elle est maintenant completee par :

- `docs/CHANGELOG_UML.md`
- `docs/cahier_des_charges_mis_a_jour.md`
- `docs/guide_api_mis_a_jour.md`
- `docs/diagrammes_uml_mis_a_jour.md`

## Corrections a appliquer aux UML

- `User` doit contenir `authUserId`, car le compte Supabase Auth est separe du profil Prisma.
- Le mot de passe ne doit pas apparaitre dans la table `User`; il est gere par Supabase Auth.
- Les roles actuels sont `ELEVE` et `ADMINISTRATEUR`.
- Le profil admin porte `nomService`, `organismeId` et `antenneRegionaleId`.
- Le profil eleve porte `dateNaissance`.

## Flux a representer

1. L'utilisateur saisit matricule, email et mot de passe.
2. Le systeme verifie le matricule dans Prisma.
3. Supabase Auth authentifie la session.
4. Prisma met a jour `derniereConnexion`.
5. L'utilisateur est redirige vers `/dashboard` ou `/admin` selon son role.

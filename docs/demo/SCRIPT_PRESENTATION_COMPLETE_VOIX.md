# Script de présentation complète — voix off + démo à l'écran

**Durée visée :** 12 à 18 minutes (selon ton débit)  
**URL :** https://application-demande-document-academ.vercel.app  
**Avant d'enregistrer :** ouvre l'URL 2 minutes à l'avance (réveille le serveur), puis `npm run reset:imports` si tu veux repartir de zéro.

---

## Comptes à utiliser (région Centre)

| Rôle | Identifiant | Mot de passe |
|------|-------------|--------------|
| Élève Faïssa | Matricule `DEMO2026002` | `DemoSoutenance2026!` *(créé à l'activation)* |
| Email élève | `faissayoppanjikam@gmail.com` | — |
| Admin OBC | `ADM-02-CENTRE` | `AdminCentre2026!` |
| Admin DECC | `DECC-02-CENTRE` | `DeccCentre2026!` |
| Agent centre | `AGENT-CE-02-CENTRE` | `AgentCentre2026!` |

---

# PARTIE 1 — Landing page (≈ 5 min)

## 0. Introduction (10 s)

> « Bonjour. Je vais vous présenter **DR-DOCSCOL**, le portail de gestion des demandes et retraits de documents scolaires pour l'OBC et la DECC au Cameroun. Nous allons commencer par la page d'accueil, puis enchaîner sur le parcours complet de chaque acteur. »

**[ACTION]** Page d'accueil ouverte. Langue **FR** (bouton langue en haut à droite si besoin).

---

## 1. Hero — Accueil `#accueil` (45 s)

**[ACTION]** Haut de page. Laisse le titre et les visuels visibles quelques secondes.

> « Voici la page d'accueil de **DR-DOCSCOL**. Le message central est clair : *« Vos documents scolaires, enfin simples à retirer »*.  
> Le portail réunit trois mondes : les **élèves**, les **administrations OBC et DECC**, et les **centres d'examen**.  
> On peut **activer un compte élève** directement ici, ou **se connecter** si le compte existe déjà.  
> En bas du hero, on voit les examens couverts : **BEPC, Probatoire, Baccalauréat, ESG**, la **prise de rendez-vous en ligne** et les **notifications à chaque étape**. »

**[ACTION]** Survole les deux boutons sans cliquer encore : « Activer mon compte élève » et « J'ai déjà un compte ».

---

## 2. Problème & solution `#probleme` (40 s)

**[ACTION]** Clique « Découvrir la solution » ou scroll / menu **Fonctionnalités** → remonte si besoin, ou navigue via le scroll.

> « Cette section pose le **problème concret** : files d'attente, allers-retours, absence de visibilité sur la disponibilité des documents, charge administrative manuelle, duplicatas mal suivis.  
> À droite, **avec DR-DOCSCOL** : chaque demande a un **statut visible**, des **créneaux de retrait** au bon endroit, un **paiement tracé** pour les duplicatas, et **agents et admins** sur les mêmes informations. »

---

## 3. Fonctionnalités `#fonctionnalites` (50 s)

**[ACTION]** Menu → **Fonctionnalités**. Laisse défiler le carrousel.

> « Ici, six fonctionnalités clés, présentées en langage simple :  
> — le **statut des documents en temps réel** ;  
> — le **retrait sur rendez-vous** au centre ou à l'antenne ;  
> — les **notifications** au bon moment ;  
> — un **accès sécurisé** par matricule ;  
> — **OBC et DECC réunis** sur un seul portail ;  
> — et la **confirmation du retrait sur place** par l'agent du centre.  
> Chaque carte répond à un besoin réel du terrain, pas à une contrainte technique. »

---

## 4. Pourquoi DR-DOCSCOL `#pourquoi` (30 s)

**[ACTION]** Scroll lentement.

> « Cette partie résume **pourquoi** la solution existe : moins de déplacements inutiles, moins d'attente au guichet, un parcours conforme aux règles officielles du BEPC, du Probatoire, du Baccalauréat et de l'ESG.  
> On voit aussi que **trois profils** utilisent la plateforme, avec un **suivi en ligne disponible 24 h sur 24**. »

---

## 5. Aperçu tableau de bord `#apercu` (35 s)

**[ACTION]** Montre la maquette à gauche et la liste à droite.

> « Avant même de se connecter, l'élève voit un **aperçu** de son futur espace : liste des documents avec statut, lieu de retrait, prise de rendez-vous, historique des notifications et des reçus de paiement.  
> L'interface est volontairement **sobre et lisible**, accessible depuis n'importe quel navigateur récent. »

---

## 6. Consultation rapide `#consultation` (45 s)

**[ACTION]** Section **Consultation** (menu ou scroll). Montre le QR code et le bouton.

> « La **consultation rapide** permet à un élève **déjà activé** de vérifier ses documents avec son **matricule**, ou via le **QR code** affiché ici.  
> Important : cette consultation est réservée aux comptes **déjà activés**. Si le compte n'existe pas encore, il faut d'abord passer par l'**activation**.  
> C'est exactement le cas dans notre démo : nous n'avons pas encore activé le compte, donc nous commencerons par là — mais je vous montre d'abord cette entrée pour que vous sachiez qu'elle existe. »

**[ACTION]** Clique « Ouvrir la consultation » → saisis `DEMO2026002` → montre le résultat (documents « Pas disponible » ou message si compte non activé) → retour accueil.

---

## 7. Comment ça marche — 4 étapes `#etapes` (40 s)

**[ACTION]** Menu → **Étapes**.

> « Le parcours élève tient en **quatre étapes** :  
> **1.** Activer le compte avec matricule et e-mail ;  
> **2.** Soumettre la demande — relevé, original ou duplicata ;  
> **3.** Suivre l'avancement et payer si besoin ;  
> **4.** Retirer sur rendez-vous au centre ou à l'antenne.  
> Les équipes admin et centre interviennent **aux bons moments** du flux. »

---

## 8. Accès par profil `#acces` (50 s)

**[ACTION]** Menu → **Accès**. Montre les 4 cartes une par une.

> « Ici, **quatre portes d'entrée** selon le rôle :  
> — **Espace élève** : activation ou connexion ;  
> — **Administration OBC** : Probatoire, Baccalauréat, relevés ;  
> — **Administration DECC** : BEPC ;  
> — **Centre d'examen** : l'agent confirme les retraits physiques.  
> On voit bien que **chaque acteur a son espace dédié**. Dans notre scénario, le compte élève n'est **pas encore activé** : nous allons donc commencer par **« Activer mon compte »**, et non par la connexion.  
> Je vous montre quand même les pages de connexion admin pour que vous voyiez qu'elles existent — sans nous y connecter tout de suite. »

**[ACTION]** Clique brièvement sur « Connexion OBC » → montre la page → retour. Idem DECC et Agent si tu veux (2 s chacune).

---

## 9. Témoignages `#temoignages` (20 s)

**[ACTION]** Scroll rapide.

> « Cette section présente des **retours indicatifs** d'élèves, d'administrations et de centres d'examen — pour illustrer les bénéfices : simplicité, rapidité, transparence. »

---

## 10. FAQ `#faq` (90 s)

**[ACTION]** Menu → **FAQ**. Ouvre **chaque question** une par une (bouton « Voir toutes les questions » si besoin).

> **Q1 — Qui peut utiliser DR-DOCSCOL ?**  
> « Les élèves enregistrés, les administrateurs OBC/DECC et les agents habilités des centres d'examen. »

> **Q2 — Comment activer mon compte ?**  
> « Via « Activer mon compte » : matricule, e-mail et mot de passe. Les informations doivent correspondre à celles déjà connues de l'organisme. »

> **Q3 — Quelle page pour l'admin ?**  
> « Connexion OBC pour le Baccalauréat et le Probatoire ; Connexion DECC pour le BEPC. La page élève ne donne **pas** accès à l'admin. »

> **Q4 — Quels documents ?**  
> « Relevés, diplômes originaux, duplicatas — selon le parcours et l'organisme. »

> **Q5 — Où se passe le retrait ?**  
> « Au centre d'examen pour la plupart des relevés et du BEPC ; à l'antenne régionale quand la règle métier l'exige. »

> **Q6 — Paiement en ligne ?**  
> « Principalement pour les **duplicatas**. Les montants sont indiqués dans l'espace élève. Dans ce MVP, le paiement est **simulé** — l'architecture prévoit un branchement Mobile Money en phase 2. »

> **Q7 — Comment suis-je informé ?**  
> « Par les **notifications in-app** et, si configuré, par **e-mail** aux étapes importantes. »

---

## 11. Appel final + pied de page (25 s)

**[ACTION]** Scroll bandeau « Prêt à obtenir vos documents… » puis footer.

> « Le bandeau final invite à **commencer maintenant** ou à **se connecter**.  
> Le pied de page rappelle les liens utiles, les organismes **OBC** et **DECC**, et la mission du portail.  
> Voilà pour la **landing page complète**. Passons maintenant à la **démonstration fonctionnelle**. »

---

# PARTIE 2 — Activation et parcours élève (≈ 4 min)

## 12. Activation du compte élève (60 s)

**[ACTION]** Clique **Activer mon compte élève** ou `/auth/register`.

> « Nous activons le compte de l'élève de démonstration **Faïssa**, matricule **DEMO2026002**, e-mail **faissayoppanjikam@gmail.com**.  
> Je choisis un mot de passe sécurisé et je valide.  
> L'activation lie le matricule déjà présent en base de données à un compte Supabase Auth : c'est la **première connexion réelle** de l'élève. »

**[ACTION]** Remplis le formulaire → valide → arrives sur le dashboard.

> « Compte activé. L'élève accède à son **tableau de bord personnel**. »

*(Option montage : capture l'e-mail d'activation si reçu.)*

---

## 13. Dashboard et documents (90 s)

**[ACTION]** Parcours : Dashboard → **Mes documents**.

> « Voici l'**espace élève**. On voit le profil, les raccourcis et les notifications.  
> Dans **Mes documents**, Faïssa a plusieurs dossiers : un relevé **BEPC**, un relevé **Probatoire**, etc.  
> Après la remise à zéro, tous les documents sont en **« Pas disponible »** : c'est normal — l'administration n'a pas encore validé la disponibilisation.  
> L'élève peut **soumettre une demande** pour signaler qu'il souhaite retirer un document. »

**[ACTION]** Soumets une demande de relevé Probatoire (ou BEPC selon ce que tu veux montrer côté admin).

> « La demande est enregistrée. L'administrateur la verra de son côté. »

**[ACTION]** Montre rapidement : **Rendez-vous**, **Notifications**, **Paiements** (vides ou en attente).

---

# PARTIE 3 — Administrateurs (≈ 4 min)

## 14. Admin OBC — connexion et vue d'ensemble (60 s)

**[ACTION]** Déconnexion élève → `/auth/login/obc` → `ADM-02-CENTRE` / `AdminCentre2026!`

> « Je me connecte en tant qu'**administrateur OBC**, région **Centre**.  
> L'OBC gère le **Probatoire**, le **Baccalauréat** et les relevés associés — **pas le BEPC**, qui relève de la DECC.  
> Le tableau de bord admin montre les statistiques, les demandes en attente et l'activité récente. »

**[ACTION]** Visite : Documents, Élèves, Paiements, Audit (aperçu rapide de chaque menu).

---

## 15. Admin OBC — traiter la demande (45 s)

**[ACTION]** **Documents** → trouve la demande de Faïssa → passe le statut à **Disponible**.

> « L'administrateur voit la demande de l'élève et **disponibilise** le document.  
> Une **notification** est créée côté élève — et un e-mail part si le SMTP est configuré.  
> C'est le cœur du workflow : de « Pas disponible » à « Disponible ». »

---

## 16. Imports CSV — OBC (90 s)

**[ACTION]** **Élèves** → section imports.

> « L'admin peut aussi traiter des **lots** via CSV.  
> Deux types d'import :  
> — **Disponibilisation** : matricules déjà en base, on passe des documents à « Disponible » ;  
> — **Ajout d'élèves** : nouveaux matricules pas encore en base.  
> Les fichiers de démo sont dans `docs/imports/centre/obc/`. Je téléverse le CSV de disponibilisation… »

**[ACTION]** Import `import-disponibilisation.csv` → montre le résumé (X documents disponibilisés).

> « L'import traite ligne par ligne et affiche les erreurs éventuelles sans bloquer tout le fichier.  
> On peut aussi **ajouter un élève manuellement** depuis le formulaire — utile pour les cas isolés. »

**[ACTION]** *(Optionnel)* Import ajout élèves ou ajout manuel d'un élève test.

---

## 17. Admin DECC — BEPC (60 s)

**[ACTION]** Déconnexion → `/auth/login/decc` → `DECC-02-CENTRE` / `DeccCentre2026!`

> « Côté **DECC**, même logique mais pour le **BEPC** uniquement.  
> Faïssa a un relevé BEPC : c'est la **DECC** qui le disponibilise, pas l'OBC.  
> C'est pourquoi nous avons **deux CSV séparés** : OBC et DECC. »

**[ACTION]** Disponibilise le BEPC (manuel ou import `docs/imports/centre/decc/import-disponibilisation.csv`).

---

# PARTIE 4 — Retour élève, RDV, duplicata, agent (≈ 4 min)

## 18. Élève — notifications et RDV (75 s)

**[ACTION]** Reconnexion élève `DEMO2026002`.

> « L'élève se reconnecte. Dans **Notifications**, il voit que son document est **disponible**.  
> Dans **Mes documents**, le statut a changé. Il peut maintenant **prendre rendez-vous** pour le retrait au centre d'examen. »

**[ACTION]** Prends un créneau disponible → confirme le RDV.

> « Le créneau est réservé. L'agent du centre verra ce rendez-vous dans sa liste **À venir**. »

---

## 19. Duplicata et paiement simulé (90 s) *(optionnel mais recommandé)*

**[ACTION]** Demande de **duplicata** sur un document éligible.

> « Pour un **duplicata**, l'élève remplit le formulaire, dépose **quatre pièces justificatives** — déclaration de perte, CNI, demande au DG, décharge du bordereau — puis effectue le **paiement simulé**.  
> Dans ce MVP, le paiement est **immédiat et simulé** : un reçu est généré, mais il n'y a pas encore d'API Orange Money ou MTN en production.  
> L'admin OBC ou DECC **valide ensuite les pièces** avant de disponibiliser le duplicata. »

**[ACTION]** Montre paiement → reçu → validation admin si tu as le temps.

---

## 20. Agent centre — confirmer le retrait (60 s)

**[ACTION]** Déconnexion → `/auth/login/centre-examen` → `AGENT-CE-02-CENTRE` / `AgentCentre2026!`

> « Le jour du rendez-vous, l'**agent du centre d'examen** ouvre son espace.  
> Il voit les rendez-vous **à venir**, identifie l'élève Faïssa, et clique **Confirmer le retrait** une fois le document remis physiquement. »

**[ACTION]** Confirme le retrait.

> « Le statut passe à **Retiré**. L'élève est notifié — et peut recevoir un **accusé par e-mail**.  
> La chaîne complète est bouclée : demande → disponibilisation → RDV → retrait confirmé. »

---

## 21. Consultation rapide — après activation (30 s)

**[ACTION]** Déconnexion → `/consultation` → matricule `DEMO2026002`.

> « Enfin, la **consultation rapide** sans connexion : avec le matricule, on vérifie le statut des documents — utile pour un contrôle rapide depuis un téléphone ou le QR code de la landing. »

---

# PARTIE 5 — Conclusion (30 s)

**[ACTION]** Retour landing page.

> « Pour conclure : **DR-DOCSCOL** centralise le parcours des documents scolaires pour l'OBC, la DECC, les élèves et les centres d'examen.  
> La landing informe et oriente ; chaque acteur a son espace ; les imports CSV permettent le traitement en masse ; le retrait est **tracé et confirmé** sur place.  
> Les limites connues de ce MVP : **paiement simulé**, et **e-mails** conditionnés à la configuration SMTP.  
> Merci pour votre attention. Je suis disponible pour vos questions. »

---

## Conseils enregistrement OBS

1. **Parle lentement** — laisse 2–3 secondes après chaque clic.
2. **Zoom navigateur** à 100–110 % pour la lisibilité.
3. Si une page charge longtemps : « Le serveur se réveille, c'est normal sur l'hébergement gratuit » — ne coupe pas tout de suite.
4. **Découpe en plusieurs fichiers** si tu préfères : Partie 1 landing seule, Partie 2 acteurs séparée.
5. Fichiers CSV prêts : `docs/imports/centre/obc/` et `docs/imports/centre/decc/`.

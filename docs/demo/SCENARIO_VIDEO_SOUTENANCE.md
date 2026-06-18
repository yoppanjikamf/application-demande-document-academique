# Scénario vidéo de démonstration — DR-DOCSCOL (15–20 min)

**Public :** validation académique / soutenance  
**Format attendu :** enregistrement écran (MP4) + voix off ou sous-titres  
**URL de démo :** `https://application-demande-document-academ.vercel.app` (ou `http://localhost:3000` en local)

---

## Matricule élève de la démo

| Vous avez écrit | Matricule correct dans le projet |
| --- | --- |
| `DEM0202600` | **`DEMO2026002`** (Faïssa NJIKAM) |

Email associé : `faissayoppanjikam@gmail.com`  
Mot de passe élève : celui que **vous** créez lors de l’activation (`/auth/register`).

---

## Préparation AVANT l’enregistrement (30 min)

### 1. Base de données (production Vercel ou local)

```bash
npm run seed:regional-admins
npm run seed:decc-admins
npm run seed:centre-agents
npm run seed:soutenance-eleves
```

Puis **Import B** (admin) — fichier `docs/import-documents-eleves-demo-existants.csv`  
→ crée les fiches documents **Pas disponible** pour DEMO2026001–005.

**Ne pas** lancer Import A tout de suite : vous le ferez **à l’écran** pendant la vidéo (étape 5–6).

### 2. Comptes utilisés dans la vidéo

| Rôle | Page | Email | Mot de passe |
| --- | --- | --- | --- |
| Élève | `/auth/register` puis `/auth/login` | `faissayoppanjikam@gmail.com` | *(à définir à l’activation)* |
| Admin OBC | `/auth/login/obc` | `admin.centre@example.com` | `AdminCentre2026!` |
| Agent centre | `/auth/login/centre-examen` | `agent.centre.centre@example.com` | `AgentCentre2026!` |

Matricules admin / agent : `ADM-02-CENTRE`, `AGENT-CE-02-CENTRE`.

### 3. Document cible pour la fin de parcours (RDV + retrait)

Pour **DEMO2026002**, l’Import A du fichier `docs/import-disponibilisation-session-2024.csv` contient :

```csv
DEMO2026002,PROBATOIRE,RELEVE_NOTES,2021
```

→ Le **relevé Probatoire** passera **Disponible** (retrait au **centre d’examen** — idéal pour l’agent).

### 4. Outils d’enregistrement recommandés

| Outil | Usage |
| --- | --- |
| **OBS Studio** (gratuit) | MP4 1920×1080, 30 fps |
| **Loom** | Lien partageable + webcam optionnelle |
| **Micro** | Voix off claire (éviter le bruit ambiant) |

Fermer notifications OS, mode « Ne pas déranger », onglets inutiles.

---

## Déroulé chronométré (≈ 17 min)

### Partie 1 — Accueil & consultation publique (≈ 3 min)

| Temps | Action écran | Voix off (à lire ou sous-titrer) |
| --- | --- | --- |
| 0:00 | Ouvrir `/` — landing DR-DOCSCOL, hero, scroll rapide | « DR-DOCSCOL est le portail unifié OBC / DECC pour les demandes et retraits de documents scolaires au Cameroun. » |
| 0:45 | Cliquer **Consultation** ou `/consultation` | « Un élève peut vérifier la disponibilité de ses documents **sans compte**, avec son matricule. » |
| 1:00 | Saisir **`DEMO2026002`** → **Consulter** | « Nous consultons le matricule DEMO2026002. » |
| 1:20 | Montrer la liste (BEPC, Probatoire, Bac) + statuts | « Le système affiche les documents liés aux examens composés : ici « Demande non effectuée » ou « Pas disponible » selon l’état du dossier. » |
| 2:30 | Mentionner boutons Activer / Se connecter | « Pour demander un document ou prendre rendez-vous, l’élève active ensuite son compte personnel. » |

---

### Partie 2 — Activation & espace élève (≈ 4 min)

| Temps | Action écran | Voix off |
| --- | --- | --- |
| 3:00 | `/auth/register` — matricule **DEMO2026002**, email, mot de passe | « L’activation lie le matricule déjà connu de l’administration à un compte sécurisé Supabase. » |
| 3:45 | Connexion `/auth/login` | « L’élève accède à son tableau de bord. » |
| 4:00 | `/dashboard/documents` — onglet **Probatoire** (ou BEPC) | « Il voit ses examens composés et, pour chaque document, un statut et un bouton Détails. » |
| 4:30 | **Détails** → **Faire une demande** (relevé Probatoire ou BEPC) | « Il enregistre sa demande auprès de l’organisme compétent. Le statut devient « Pas disponible » : la demande est prise en compte. » |
| 6:30 | (Option) `/dashboard/notifications` | « Les notifications in-app l’informeront des changements importants. » |

---

### Partie 3 — Administration (≈ 5 min)

| Temps | Action écran | Voix off |
| --- | --- | --- |
| 7:00 | Déconnexion → `/auth/login/obc` — **ADM-02-CENTRE** | « L’administrateur OBC régional Centre se connecte sur un espace dédié, limité à sa région. » |
| 7:30 | `/admin/students` | « Depuis la gestion des élèves, l’admin peut importer des dossiers en masse. » |
| 7:45 | **Import B** — rappeler `import-documents-eleves-demo-existants.csv` *(si base déjà importée : expliquer que c’est fait)* | « L’Import B crée les fiches documents en statut initial Pas disponible. » |
| 8:30 | **Import A** — coller `docs/import-disponibilisation-session-2024.csv` (section Disponibiliser) | « L’Import A disponibilise document par document. Pour Faïssa, le relevé Probatoire 2021 passe à Disponible. » |
| 9:30 | `/admin/documents` — filtrer **Disponible**, montrer DEMO2026002 | « L’administrateur voit l’ensemble des documents de son périmètre et peut aussi changer un statut manuellement. » |
| 10:30 | (Si SMTP actif) mentionner email ; sinon notifications en base | « Une notification est créée pour l’élève ; un e-mail part si la messagerie est configurée. » |

**Alternative étape 6** (sans Import A à l’écran) : sur `/admin/documents`, passer manuellement un document de **Pas disponible** → **Disponible** pour DEMO2026002.

---

### Partie 4 — Rendez-vous élève (≈ 3 min)

| Temps | Action écran | Voix off |
| --- | --- | --- |
| 11:00 | Reconnexion élève → `/dashboard/documents` — **Probatoire** — relevé **Disponible** | « Après disponibilisation, l’élève voit le statut Disponible sur son relevé Probatoire. » |
| 11:30 | **Détails** → **Prendre rendez-vous** — choisir date / créneau | « Le relevé se retire au centre d’examen : l’élève réserve un créneau selon le quota administratif. » |
| 12:30 | `/dashboard/rendez-vous` — confirmer le RDV planifié | « Le rendez-vous est enregistré et transmis au centre concerné. » |

---

### Partie 5 — Agent centre & clôture (≈ 3 min)

| Temps | Action écran | Voix off |
| --- | --- | --- |
| 13:00 | `/auth/login/centre-examen` — **AGENT-CE-02-CENTRE** | « L’agent du centre d’examen ne gère que les retraits physiques de sa région. » |
| 13:30 | `/centre-examen` — onglet **Aujourd’hui** ou **À venir** | « Il voit le rendez-vous de Faïssa pour le retrait du relevé. » |
| 14:00 | **Confirmer le retrait** | « Le jour J, il valide que le document a bien été remis : le statut passe à Retiré et le rendez-vous à Honoré. » |
| 14:30 | (Option) Reconsultation `/consultation` avec DEMO2026002 | « En consultation publique, le statut retiré est visible sans connexion. » |
| 15:00 | Retour landing — conclusion | « DR-DOCSCOL couvre le parcours complet : consultation, demande, disponibilisation, rendez-vous et retrait confirmé, pour OBC, DECC et les centres d’examen. Merci. » |

---

## Check-list le jour J

- [ ] Import B déjà appliqué (documents Pas disponible)
- [ ] Compte élève activé ou prêt à activer à l’écran
- [ ] Import A **non** appliqué avant l’étape admin (sauf si vous montrez seulement le changement manuel)
- [ ] Fichier CSV `import-disponibilisation-session-2024.csv` ouvert dans un éditeur
- [ ] Créneaux RDV disponibles (admin OBC : `/admin/rdv-disponibilites` si besoin)
- [ ] Enregistrement testé (son + micro)

---

## Fichier sous-titres (extrait SRT — à compléter)

```srt
1
00:00:00,000 --> 00:00:08,000
DR-DOCSCOL : portail unifié pour les documents scolaires OBC et DECC.

2
00:00:08,000 --> 00:00:15,000
Consultation publique par matricule, sans création de compte.

3
00:00:15,000 --> 00:00:22,000
Matricule DEMO2026002 : liste des documents et statuts.
```

*(Générer le SRT complet avec [subtitle edit](https://www.nikse.dk/subtitleedit) ou l’export Loom.)*

---

## Ce que l’équipe technique ne peut pas faire à votre place

- Enregistrer la vidéo MP4 ou héberger un lien Loom (à faire par vous ou un camarade).
- Garantir SMTP / paiement réel en production (hors scope MVP).

**Délai réaliste pour vous :** 1 session de préparation (30 min) + 1–2 prises d’enregistrement (20 min) + montage léger (30 min) → **vidéo livrable sous 1 à 2 jours**.

---

## Référence rapide des fichiers CSV

| Fichier | Rôle |
| --- | --- |
| `docs/import-documents-eleves-demo-existants.csv` | Import B — documents DEMO |
| `docs/import-disponibilisation-session-2024.csv` | Import A — disponibilisation |

Guide détaillé : `docs/demo/KIT_DEMO_COMPLET.md`

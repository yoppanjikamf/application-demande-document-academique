# Checklist démo soutenance — 3 à 5 minutes

**Sans voix à l’écran** : tu commentes en live dans OBS pendant que tu suis cette liste.

## Avant l’enregistrement

```bash
npm run dev          # terminal 1
npm run demo:prepare # terminal 2 — remet Faïssa prête pour la démo
```

Comptes **région Centre** :

| Rôle | Matricule | Mot de passe |
|------|-----------|--------------|
| Élève Faïssa | DEMO2026002 | DemoScreens2026! |
| Admin OBC | ADM-02-CENTRE | AdminCentre2026! |
| Admin DECC | DECC-02-CENTRE | DeccCentre2026! |
| Agent centre | AGENT-CE-02-CENTRE | AgentCentre2026! |

---

## Ordre des clics (~3 min rapide / ~5 min confort)

| # | Qui | Page | Action | ~s |
|---|-----|------|--------|-----|
| 1 | — | `/` | Landing, scroll rapide | 15 |
| 2 | — | `/` | Bouton **EN** puis **FR** (bilingue) | 8 |
| 3 | — | `/auth/login` + OBC + DECC + agent | Montrer les 4 connexions | 12 |
| 4 | Élève | `/auth/login` | Connexion Faïssa | 10 |
| 5 | Élève | `/dashboard` | Tableau de bord | 8 |
| 6 | Élève | `/dashboard/documents` | **Faire une demande** (relevé) | 12 |
| 7 | Élève | `/dashboard/notifications` | Notification demande | 5 |
| 8 | Admin OBC | `/auth/login/obc` | Connexion | 8 |
| 9 | Admin OBC | `/admin` | Tableau de bord | 8 |
| 10 | Admin OBC | `/admin/documents` | Trouver Faïssa → **Disponible** → Modifier | 15 |
| 11 | Admin DECC | `/auth/login/decc` | Dashboard + documents (aperçu BEPC) | 12 |
| 12 | Élève | `/dashboard/documents` | Document **Disponible** | 8 |
| 13 | Élève | même page | **Rendez-vous** → date → créneau → Confirmer | 20 |
| 14 | Élève | `/dashboard/rendez-vous` | RDV planifié | 8 |
| 15 | Agent | `/auth/login/centre-examen` | Connexion | 8 |
| 16 | Agent | `/centre-examen` | Onglet **À venir** → RDV Faïssa | 10 |
| 17 | Agent | même page | **Confirmer retrait** → Confirmer | 12 |
| 18 | Élève | `/dashboard/documents` | Statut **Retiré** | 8 |
| 19 | — | `/` | Conclusion landing | 5 |

**Total : ~3 min 30 (rapide) à ~5 min (avec commentaires)**

---

## Enregistrement automatique (sans OBS)

```bash
npm run demo:soutenance
```

Vidéo générée : `~/Vidéos/demo-soutenance-d-scolcam.webm`

Ajuster la vitesse :

```bash
DEMO_PAUSE_MS=700 npm run demo:record   # ~3 min
DEMO_PAUSE_MS=1400 npm run demo:record  # ~5 min
```

---

## Plan séparé (montage)

- **Activation compte** `/auth/register` + capture **email** reçu (hors démo live de 3 min)

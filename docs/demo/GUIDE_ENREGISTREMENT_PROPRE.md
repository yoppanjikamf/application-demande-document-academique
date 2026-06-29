# Enregistrer la démo PROPRE (sans erreurs) — guide

## Pourquoi l'ancienne vidéo avait des erreurs ?

1. **Vercel en veille** — au réveil, la base Postgres met parfois 5–15 s à répondre → page blanche ou « Une erreur est survenue ».
2. **Le script allait trop vite** — il filmait pendant le chargement ou pendant l'erreur.
3. **Connexions admin instables** — Supabase Auth OK, mais Prisma timeout → « un problème est survenu » à la connexion.
4. **Agent invisible** — sans RDV en base, l'agent voit une liste vide ; le script passait en 2 secondes.

L'**email Gmail** quand l'agent confirme le retrait est **normal** : c'est `notifyDocumentRetired` qui prévient l'élève.

---

## Meilleure méthode : OBS + toi (recommandé pour la soutenance)

1. Ouvre [https://application-demande-document-academ.vercel.app](https://application-demande-document-academ.vercel.app) **2 minutes avant** (réveille le serveur).
2. Terminal : `npm run demo:video:prepare`
3. Enregistre avec **OBS** en suivant l'ordre ci-dessous (ta voix par-dessus).
4. Capture **Gmail** séparément quand l'agent confirme le retrait.

### Ordre OBS (~8–12 min)

| # | Qui | URL | Action |
|---|-----|-----|--------|
| 1 | — | `/` | Landing, FR/EN, consultation |
| 2 | Élève | `/auth/login` | Connexion Faïssa |
| 3 | Élève | `/dashboard/documents` | Documents + demande |
| 4 | Admin OBC | `/auth/login/obc` | Dashboard + disponibiliser |
| 5 | Élève | documents | RDV créneau |
| 6 | **Agent** | `/auth/login/centre-examen` | **À venir → Confirmer retrait** |
| 7 | Élève | documents | Statut **Retiré** |
| 8 | — | Gmail | Capture email retrait |

### Comptes

| Rôle | Matricule | Mot de passe |
|------|-----------|--------------|
| Élève | DEMO2026002 | DemoScreens2026! |
| Admin OBC | ADM-02-CENTRE | AdminCentre2026! |
| Agent | AGENT-CE-02-CENTRE | AgentCentre2026! |

---

## Vidéo automatique (alternative)

```bash
npm run demo:video
```

Produit `~/Vidéos/demo-soutenance-propre.webm` — parcours court, avec warmup et attente des pages.

### Format MP4 (montage facile)

Les `.webm` s'ouvrent dans **VLC** (gratuit) ou se convertissent :

```bash
# Si ffmpeg installé :
ffmpeg -i ~/Vidéos/demo-soutenance-propre.webm -c:v libx264 -c:a aac ~/Vidéos/demo-soutenance-propre.mp4
```

Sinon : importe le `.webm` dans **OpenShot**, **DaVinci Resolve** ou **Shotcut** — ils acceptent le webm directement.

---

## Si erreur admin persiste en live

Attends **10 secondes**, clique **Réessayer**, ou rafraîchis. C'est un timeout Postgres temporaire sur Vercel, pas un bug de l'application.

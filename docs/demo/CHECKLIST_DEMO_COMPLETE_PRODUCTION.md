# Démo complète production — tous les cas (~10–15 min)

**URL :** [https://application-demande-document-academ.vercel.app](https://application-demande-document-academ.vercel.app)

## Avant l'enregistrement

```bash
npm run demo:complete:prepare
```

Remet la base à zéro (élèves désactivés, documents « Pas disponible », CSV régénérés).

## Enregistrement automatique (sans voix)

```bash
npm run demo:complete
# ou
DEMO_BASE_URL=https://application-demande-document-academ.vercel.app npm run demo:complete:record
```

**Sortie :** `~/Vidéos/demo-complete-d-scolcam.webm`

## Parcours enregistré (16 actes)

| # | Acte |
|---|------|
| 1 | Landing DR-DOCSCOL complet + FR/EN |
| 2 | Consultation rapide (matricule, avant activation) |
| 3 | **Activation** compte Faïssa (`/auth/register`) |
| 4 | Tous les écrans élève (dashboard, docs BEPC/Prob/Bac, RDV, notifs, paiements) |
| 5 | Demandes relevé + diplôme |
| 6 | Admin OBC — tous les écrans |
| 7 | Admin DECC — tous les écrans |
| 8 | Admin OBC — voir demande élève → **Disponible** |
| 9 | Import disponibilisation + import ajout élèves + **ajout manuel** |
| 10 | Admin DECC — import disponibilisation BEPC |
| 11 | Élève — notifications + **prise de RDV** (créneau) |
| 12 | Élève — **duplicata** (4 pièces + paiement simulé) |
| 13 | Admin OBC — validation pièces + dossier duplicata |
| 14 | Élève — notifications + consultation (après activation) |
| 15 | Agent centre — RDV à venir → **Confirmer retrait** |
| 16 | Élève document retiré + landing |

## Comptes (région Centre)

| Rôle | Matricule | Mot de passe |
|------|-----------|--------------|
| Élève Faïssa | DEMO2026002 | DemoSoutenance2026! (créé à l'activation) |
| Admin OBC | ADM-02-CENTRE | AdminCentre2026! |
| Admin DECC | DECC-02-CENTRE | DeccCentre2026! |
| Agent | AGENT-CE-02-CENTRE | AgentCentre2026! |

## Montage séparé (toi)

- Capture **email** reçu à l'activation (`faissayoppanjikam@gmail.com`)
- Ta **voix** en commentaire par-dessus la vidéo OBS ou le montage

## Ajuster la durée

```bash
DEMO_PAUSE_MS=900 npm run demo:complete:record   # plus rapide
DEMO_PAUSE_MS=1800 npm run demo:complete:record  # plus lent (~15 min)
```

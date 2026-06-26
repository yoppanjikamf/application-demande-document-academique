# Diagrammes de séquence par cas d'utilisation

Sources cas d'utilisation (draw.io → `diagrammes-images/`) :
- Élève : `diagramme cas utilisation/cas utilisation eleve .drawio.png` → `cas-utilisation-eleve.drawio.png`
- Admin OBC/DECC : `diagramme cas utilisation/vivi.drawio.png` → `cas-utilisation-admin-obc-decc.drawio.png`
- Agent centre : `diagramme cas utilisation/agent centre.drawio.png` → `cas-utilisation-agent-centre.drawio.png`
- Vue générale : `diagramme cas utilisation/Image collée.png` → `cas-utilisation-general.png`

## Élève

- **Élève — Authentifier** → `sequences/eleve/seq-eleve-01-authentifier.mmd`
- **Élève — Consulter via QR code (consultation publique)** → `sequences/eleve/seq-eleve-02-consulter-via-qrcode.mmd`
- **Élève — Vérifier disponibilité document** → `sequences/eleve/seq-eleve-03-verifier-disponibilite.mmd`
- **Élève — Demande retrait original diplôme** → `sequences/eleve/seq-eleve-04-demande-original-diplome.mmd`
- **Élève — Demande retrait relevé de notes** → `sequences/eleve/seq-eleve-05-demande-releve.mmd`
- **Élève — Demande duplicata (remplir formulaire + pièces)** → `sequences/eleve/seq-eleve-06-demande-duplicata-formulaire.mmd`
- **Élève — Effectuer paiement duplicata** → `sequences/eleve/seq-eleve-07-effectuer-paiement.mmd`
- **Élève — Télécharger reçu de paiement** → `sequences/eleve/seq-eleve-08-telecharger-recu.mmd`
- **Élève — Prendre rendez-vous de retrait** → `sequences/eleve/seq-eleve-09-prendre-rdv.mmd`
- **Élève — Annuler rendez-vous** → `sequences/eleve/seq-eleve-10-annuler-rdv.mmd`

## Admin OBC/DECC

- **Admin OBC/DECC — Authentifier** → `sequences/admin/seq-admin-01-authentifier.mmd`
- **Admin — Définir quota journalier RDV** → `sequences/admin/seq-admin-02-definir-quota-journalier.mmd`
- **Admin — Définir jours fériés** → `sequences/admin/seq-admin-03-definir-jours-feries.mmd`
- **Admin — Consulter journal audit** → `sequences/admin/seq-admin-04-consulter-journal-audit.mmd`
- **Admin — Mettre à jour statut original diplôme** → `sequences/admin/seq-admin-05-mettre-a-jour-original-diplome.mmd`
- **Admin — Mettre à jour statut relevé de notes** → `sequences/admin/seq-admin-06-mettre-a-jour-releve.mmd`
- **Admin — Traiter demande duplicata (analyse pièces)** → `sequences/admin/seq-admin-07-traiter-demande-duplicata.mmd`
- **Admin — Valider demande duplicata** → `sequences/admin/seq-admin-08-valider-demande-duplicata.mmd`
- **Admin — Rejeter demande duplicata** → `sequences/admin/seq-admin-09-rejeter-demande-duplicata.mmd`
- **Admin — Import disponibilisation (CSV)** → `sequences/admin/seq-admin-10-import-disponibilisation.mmd`
- **Admin — Import ajout élève (CSV)** → `sequences/admin/seq-admin-11-import-ajout-eleve.mmd`

## Agent centre d'examen

- **Agent centre — Authentifier** → `sequences/agent/seq-agent-01-authentifier.mmd`
- **Agent centre — Consulter les RDV transmis** → `sequences/agent/seq-agent-02-consulter-les-rdv.mmd`
- **Agent centre — Confirmer retrait effectué** → `sequences/agent/seq-agent-03-confirmer-retrait-effectue.mmd`

## Export images

```bash
npm run diagrams:sequences-acteurs
```
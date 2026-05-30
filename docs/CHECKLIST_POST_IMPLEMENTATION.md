# Checklist Post-Implémentation - Routes et Audit Logs

**Date:** 27 mai 2026  
**Status:** Prêt pour tests  
**Routes:** 7 nouvelles + 3 avec audit logs intégrés  

---

## 🗂️ AVANT DE TESTER

### Configuration Base de Données
- [ ] Supabase DB accessible
- [ ] Variables d'environnement chargées:
  - [ ] `DATABASE_URL` défini
  - [ ] `DIRECT_URL` défini (pour Prisma)
  - [ ] `INTERNAL_API_SECRET` défini
  - [ ] `NEXT_PUBLIC_APP_URL` défini

### Configuration Supabase Auth
- [ ] Email verification activé (ou désactivé si dev)
- [ ] Password reset email template testé
- [ ] Supabase client créé et fonctionnel
- [ ] Sessions persistantes

### Configuration Nodemailer
- [ ] SMTP Gmail fonctionnel
- [ ] Credentials correctes dans `.env.local`
- [ ] Test d'envoi email réussi

### Migration Prisma
- [ ] Connexion DB vérifiée
- [ ] Migration exécutée: `npx prisma migrate dev`
- [ ] Schema regénéré: `npx prisma generate`
- [ ] Audit de schéma: `npx prisma studio` accessible

---

## 📁 FICHIERS À VÉRIFIER

### Routes Créées (7)
- [ ] `app/api/auth/password/forgot/route.ts` existe
- [ ] `app/api/auth/password/reset/route.ts` existe
- [ ] `app/api/students/me/documents/[documentId]/calendar-event/route.ts` existe
- [ ] `app/api/students/me/payments/[paymentId]/cancel/route.ts` existe
- [ ] `app/api/internal/notifications/reminder-30days/route.ts` existe
- [ ] `app/api/admin/payments/route.ts` existe
- [ ] `app/api/admin/audit-logs/route.ts` existe

### Fichiers Modifiés
- [ ] `prisma/schema.prisma` contient modèle AuditLog
- [ ] `lib/validations.ts` contient schemas password
- [ ] `app/api/admin/documents/[documentId]/status/route.ts` avec audit log
- [ ] `app/admin/actions.ts` avec audit logs (2x)
- [ ] `app/auth/actions.ts` avec audit log LOGIN

### Documentation Créée
- [ ] `docs/GUIDE_TEST_7_ROUTES.md` existe
- [ ] `docs/RESUME_IMPLEMENTATION.md` existe
- [ ] `docs/CURL_TEST_EXAMPLES.md` existe
- [ ] `scripts/test-7-routes.sh` existe

---

## 🧪 ÉTAPE 1: Tests Basiques

### Health Check
```bash
curl http://localhost:3000/api/health
```
- [ ] Réponse 200
- [ ] Server accessible

### Syntaxe TypeScript
```bash
npm run type-check
```
- [ ] 0 erreurs
- [ ] Types corrects

### Build Next.js
```bash
npm run build
```
- [ ] Build réussie
- [ ] Pas de warnings critiques

---

## 🔐 ÉTAPE 2: Tests Authentification

### Route: POST /api/auth/password/forgot
- [ ] ✅ Email valide → 200 OK
- [ ] ✅ Email inexistant → 200 OK (secret)
- [ ] ✅ Email invalide → 400 Bad Request
- [ ] ✅ Email vide → 400 Bad Request
- [ ] ✅ Log d'audit créé (PASSWORD_RESET_REQUESTED)
- [ ] ✅ Email tracé dans mail_logs

### Route: POST /api/auth/password/reset
- [ ] ✅ Token valide → 200 OK
- [ ] ✅ Token invalide → 400 Bad Request
- [ ] ✅ Mots de passe non matchants → 400 Bad Request
- [ ] ✅ Mot de passe trop court → 400 Bad Request
- [ ] ✅ Log d'audit créé (PASSWORD_RESET_COMPLETED)
- [ ] ✅ Nouveau mot de passe fonctionnel

---

## 📅 ÉTAPE 3: Tests Documents/Rendez-vous

### Route: POST /api/students/me/documents/:documentId/calendar-event
- [ ] ✅ Authentification requise (401 si non auth)
- [ ] ✅ Élève seulement (403 si admin)
- [ ] ✅ Document inexistant → 404
- [ ] ✅ Document sans RDV → 422
- [ ] ✅ Document avec RDV → 200 + fichier .ics
- [ ] ✅ Fichier .ics valide (importable calendrier)
- [ ] ✅ Format iCalendar RFC 5545 correct
- [ ] ✅ Headers Content-Type corrects

---

## 💳 ÉTAPE 4: Tests Paiements

### Route: PATCH /api/students/me/payments/:paymentId/cancel
- [ ] ✅ Authentification requise (401)
- [ ] ✅ Élève seulement (403)
- [ ] ✅ Paiement inexistant → 404
- [ ] ✅ Paiement d'un autre élève → 403
- [ ] ✅ Paiement EN_ATTENTE → 200 + statut ANNULE
- [ ] ✅ Paiement EFFECTUE → 409 (ne peut pas annuler)
- [ ] ✅ Paiement ANNULE → 409 (déjà annulé)
- [ ] ✅ Log d'audit créé (PAYMENT_CANCELLED)
- [ ] ✅ Notification créée
- [ ] ✅ Email envoyé (mail_logs)
- [ ] ✅ Statut updated_at mis à jour

---

## 🔔 ÉTAPE 5: Tests Notifications Internes

### Route: POST /api/internal/notifications/reminder-30days
- [ ] ✅ Secret manquant → 503
- [ ] ✅ Secret invalide → 401
- [ ] ✅ Secret valide → 202 Accepted
- [ ] ✅ Aucun RDV 30j → 202 avec count 0
- [ ] ✅ RDV trouvés → notifications créées
- [ ] ✅ Emails envoyés (mail_logs)
- [ ] ✅ Logs d'audit créés (APPOINTMENT_REMINDER_SENT)
- [ ] ✅ Message personnalisé par RDV
- [ ] ✅ Stats breakdown correctes

### Configuration Cron (Optionnel)
- [ ] Route interne testée manuellement
- [ ] Peut être appelée par cron job
- [ ] Peut être appelée par job scheduler (Vercel Crons)

---

## 👨‍💼 ÉTAPE 6: Tests Admin Dashboard

### Route: GET /api/admin/payments
- [ ] ✅ Authentification requise (401)
- [ ] ✅ Rôle ADMINISTRATEUR requis (403)
- [ ] ✅ Sans filtres → 200 + liste complète
- [ ] ✅ Filtre statut EN_ATTENTE → correctement filtré
- [ ] ✅ Filtre statut EFFECTUE → correctement filtré
- [ ] ✅ Recherche matricule → résultats corrects
- [ ] ✅ Recherche email → résultats corrects
- [ ] ✅ Pagination page=1 limit=10 → 10 résultats
- [ ] ✅ Pagination dépasse total → pas d'erreur
- [ ] ✅ Scope admin (OBC/DECC/Antenne) appliqué
- [ ] ✅ Reçus inclus si exists
- [ ] ✅ typeSource correct (DUPLICATA ou DOCUMENT_ACADEMIQUE)

### Route: GET /api/admin/audit-logs
- [ ] ✅ Authentification requise (401)
- [ ] ✅ Rôle ADMINISTRATEUR requis (403)
- [ ] ✅ Sans filtres → 200 + liste complète
- [ ] ✅ Filtre action=LOGIN → résultats corrects
- [ ] ✅ Filtre action=DOCUMENT_STATUS_CHANGED → résultats corrects
- [ ] ✅ Filtre resource=USER → résultats corrects
- [ ] ✅ Filtre resource=DOCUMENT → résultats corrects
- [ ] ✅ Filtre userId → logs de cet user seulement
- [ ] ✅ Recherche matricule → résultats corrects
- [ ] ✅ Recherche email → résultats corrects
- [ ] ✅ Pagination fonctionne
- [ ] ✅ Stats breakdown correctes
- [ ] ✅ Details JSON parsées correctement
- [ ] ✅ User info rattachée

---

## 🔍 ÉTAPE 7: Tests Intégration (Scénarios Complets)

### Scénario 1: Flux Complet Password
1. [ ] ✅ Élève se connecte
2. [ ] ✅ Log d'audit LOGIN créé
3. [ ] ✅ Élève oublie mot de passe
4. [ ] ✅ POST /api/auth/password/forgot → 200
5. [ ] ✅ Email reçu avec lien
6. [ ] ✅ Log d'audit PASSWORD_RESET_REQUESTED créé
7. [ ] ✅ Extraire token du lien
8. [ ] ✅ POST /api/auth/password/reset → 200
9. [ ] ✅ Log d'audit PASSWORD_RESET_COMPLETED créé
10. [ ] ✅ Ancien mot de passe ne marche plus
11. [ ] ✅ Nouveau mot de passe marche
12. [ ] ✅ Admin voit les 3 logs d'audit

### Scénario 2: Flux Document + Calendrier
1. [ ] ✅ Élève consulte document
2. [ ] ✅ Document a RDV planifié
3. [ ] ✅ POST /api/students/me/documents/:id/calendar-event → .ics
4. [ ] ✅ Fichier .ics valide et importable
5. [ ] ✅ Admin change statut → DISPONIBLE
6. [ ] ✅ Log d'audit DOCUMENT_STATUS_CHANGED créé
7. [ ] ✅ Notification créée
8. [ ] ✅ Email envoyé

### Scénario 3: Flux Paiement Complet
1. [ ] ✅ Élève demande duplicata
2. [ ] ✅ Paiement créé (EN_ATTENTE)
3. [ ] ✅ Admin voit paiement dans GET /api/admin/payments
4. [ ] ✅ Élève annule paiement
5. [ ] ✅ Statut → ANNULE
6. [ ] ✅ Log d'audit PAYMENT_CANCELLED créé
7. [ ] ✅ Notification créée
8. [ ] ✅ Email envoyé
9. [ ] ✅ Admin voit changement dans audit logs

### Scénario 4: Rappels 30 jours
1. [ ] ✅ Créer RDV pour +30 jours
2. [ ] ✅ Appeler POST /api/internal/notifications/reminder-30days
3. [ ] ✅ Notifications créées
4. [ ] ✅ Emails envoyés
5. [ ] ✅ Logs d'audit créés
6. [ ] ✅ Admin voit logs dans GET /api/admin/audit-logs

---

## 📊 ÉTAPE 8: Tests Performance et Sécurité

### Performance
- [ ] ✅ Audit logs/payments GET → < 500ms (sans data énorme)
- [ ] ✅ Pagination 1000 items → fonctionne
- [ ] ✅ Recherche multi-champs → acceptable
- [ ] ✅ Calendar export → < 100ms

### Sécurité
- [ ] ✅ Pas de SQL injection (Prisma)
- [ ] ✅ Pas de XSS (JSON responses)
- [ ] ✅ Scope admin appliqué (RBAC)
- [ ] ✅ Propriété des ressources vérifiée
- [ ] ✅ Secret interne non exposé en logs
- [ ] ✅ Passwords hashés par Supabase
- [ ] ✅ Sessions expirent

### Validation d'Entrée
- [ ] ✅ Zod schemas appliqués
- [ ] ✅ Messages d'erreur génériques (pas d'info sensible)
- [ ] ✅ Tailles limites (emails, textes)
- [ ] ✅ Types corrects (enums, dates, etc.)

---

## 🐛 ÉTAPE 9: Tests Edge Cases et Erreurs

### Edge Cases
- [ ] ✅ Utilisateur supprimé (orphan audit logs)
- [ ] ✅ Paiement orphelin (élève supprimé)
- [ ] ✅ Double clic paiement cancel (idempotent)
- [ ] ✅ Recherche avec caractères spéciaux
- [ ] ✅ Pagination beyond total items
- [ ] ✅ Très long message (JSON field)

### Gestion d'Erreurs
- [ ] ✅ DB connection lost → 500 or retry
- [ ] ✅ Supabase down → 503
- [ ] ✅ SMTP down → email fails silently + logged
- [ ] ✅ Prisma model mismatch → type errors caught
- [ ] ✅ Invalid JSON → 400

---

## 📋 ÉTAPE 10: Documentation et Monitoring

### Documentation
- [ ] ✅ Lire GUIDE_TEST_7_ROUTES.md
- [ ] ✅ Lire CURL_TEST_EXAMPLES.md
- [ ] ✅ Lire RESUME_IMPLEMENTATION.md
- [ ] ✅ Guide API mis à jour
- [ ] ✅ Commentaires dans le code

### Logging
- [ ] ✅ Console logs informatifs
- [ ] ✅ Erreurs loggées correctement
- [ ] ✅ Audit logs dans la DB
- [ ] ✅ Email logs tracés

### Monitoring (Optionnel)
- [ ] ⚠️ Sentry/Rollbar configuré (si en prod)
- [ ] ⚠️ Datadog APM configuré (si en prod)
- [ ] ⚠️ Logs centralisés (si en prod)
- [ ] ⚠️ Alertes configurées (si en prod)

---

## ✅ TESTS TERMINÉS - Prochaines Étapes

### Si Tous Les Tests Passent
1. [ ] Merger les changements
2. [ ] Déployer en staging
3. [ ] Redémarrer cron jobs
4. [ ] Valider en staging
5. [ ] Déployer en production
6. [ ] Monitoring actif

### Si Des Tests Échouent
1. [ ] Documenter l'erreur
2. [ ] Vérifier logs console
3. [ ] Déboguer avec Prisma Studio
4. [ ] Vérifier variables d'env
5. [ ] Consulter GUIDE_TEST_7_ROUTES.md section troubleshooting
6. [ ] Rétester après correction

---

## 📞 Support et Documentation

**Documentation:**
- [Guide Test Complet](GUIDE_TEST_7_ROUTES.md)
- [Exemples cURL](CURL_TEST_EXAMPLES.md)
- [Résumé Implementation](RESUME_IMPLEMENTATION.md)
- [Guide API](guide_api_mis_a_jour.md)
- [Cahier des Charges](cahier_des_charges_mis_a_jour.md)

**Prérequis:**
- Node.js 18+
- PostgreSQL/Supabase
- Nodemailer configuré
- INTERNAL_API_SECRET défini

**Contact:**
Pour tout problème, vérifier:
1. Logs console Next.js
2. Prisma Studio
3. Supabase Dashboard
4. PostgreSQL logs
5. Mail service logs

---

**Status:** ✅ READY FOR TESTING  
**Date:** 27 mai 2026  
**Routes:** 7 nouvelles  
**Audit Logs:** 7 types tracés  
**Documentation:** Complète  

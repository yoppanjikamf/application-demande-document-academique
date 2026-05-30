# Guide de Test des 7 Routes Nouvelles

**Date:** 27 mai 2026  
**Routes testées:** 7 routes API + 3 routes avec audit logs

---

## 📋 Prérequis

- Base de données Supabase accessible
- Migration Prisma executée : `npx prisma migrate dev --name add_audit_log_and_payment_cancel`
- Serveur Next.js en cours d'exécution: `npm run dev`
- Variables d'environnement configurées:
  - `INTERNAL_API_SECRET` pour les routes internes
  - `NEXT_PUBLIC_APP_URL` pour les reset password links
  - `DATABASE_URL` et `DIRECT_URL`

---

## 🔐 **Route 1 & 2: Password Reset (Authentification)**

### 1️⃣ POST `/api/auth/password/forgot`

**Description:** Demander un reset de mot de passe

**Test avec cURL:**

```bash
curl -X POST http://localhost:3000/api/auth/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email": "eleve@test.com"}'
```

**Réponse attendue (200):**

```json
{
  "ok": true,
  "message": "Si l'email existe, un lien de reset a été envoyé."
}
```

**Vérifications:**

- ✅ Email reçu dans mail_logs avec statut "ENVOYE"
- ✅ Log d'audit créé avec action "PASSWORD_RESET_REQUESTED"
- ✅ La réponse est identique quelle que soit l'existence de l'email (sécurité)

---

### 2️⃣ POST `/api/auth/password/reset`

**Description:** Finaliser le reset après ouverture du lien Supabase de récupération.

**Parcours recommandé :**

- Demander le lien via `/auth/password/forgot`
- Ouvrir le lien reçu par email
- Le callback Supabase crée une session recovery puis redirige vers `/auth/password/reset`
- Soumettre le nouveau mot de passe depuis la page

**Test avec cURL uniquement si la session recovery est déjà présente dans les cookies :**

```bash
curl -X POST http://localhost:3000/api/auth/password/reset \
  -H "Content-Type: application/json" \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER" \
  -d '{
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'
```

**Réponse attendue (200):**

```json
{
  "ok": true,
  "message": "Mot de passe réinitialisé avec succès. Connectez-vous avec votre nouveau mot de passe."
}
```

**Vérifications:**

- ✅ Mot de passe mis à jour dans Supabase Auth
- ✅ Log d'audit créé avec action "PASSWORD_RESET_COMPLETED"
- ✅ Ancienne connexion invalide, nouvelle connexion fonctionne

---

## 📅 **Route 3: Calendar Export (Documents)**

### 3️⃣ POST `/api/students/me/documents/:documentId/calendar-event`

**Description:** Exporter un rendez-vous en fichier `.ics` (iCalendar)

**Préalable:**

- Élève connecté
- Document avec rendez-vous planifié (statut PLANIFIE ou CONFIRME)

**Test avec cURL:**

```bash
curl -X POST http://localhost:3000/api/students/me/documents/DOC_ID_HERE/calendar-event \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER" \
  -o rendez-vous.ics
```

**Réponse attendue (200 + fichier .ics):**

- Header: `Content-Type: text/calendar; charset=utf-8`
- Header: `Content-Disposition: attachment; filename="rendez-vous-DOC_ID.ics"`

**Contenu fichier .ics:**

```
BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//OBC DECC//Application Gestion Documents//FR
BEGIN:VEVENT
UID:...
SUMMARY:Retrait - Baccalauréat - ORIGINAL
DTSTART:20260627T140000Z
DTEND:20260627T150000Z
LOCATION:Centre de retrait
ATTENDEE:...
END:VEVENT
END:VCALENDAR
```

**Vérifications:**

- ✅ Fichier téléchargeable (.ics valide)
- ✅ Importable dans Google Calendar, Outlook, Apple Calendar
- ✅ Format iCalendar RFC 5545 correct
- ✅ Erreur 404 si document inexistant
- ✅ Erreur 422 si aucun rendez-vous planifié

---

## 💳 **Route 4: Payment Cancellation (Paiements)**

### 4️⃣ PATCH `/api/students/me/payments/:paymentId/cancel`

**Description:** Annuler un paiement en attente

**Préalable:**

- Élève connecté
- Paiement en statut "EN_ATTENTE"

**Test avec cURL:**

```bash
curl -X PATCH http://localhost:3000/api/students/me/payments/PAYMENT_ID_HERE/cancel \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER" \
  -H "Content-Type: application/json"
```

**Réponse attendue (200):**

```json
{
  "payment": {
    "id": "...",
    "statut": "ANNULE",
    "modePaiment": "ORANGEMONEY",
    "createdAt": "...",
    "updatedAt": "..."
  },
  "message": "Paiement annulé avec succès."
}
```

**Vérifications:**

- ✅ Statut paiement changé de EN_ATTENTE → ANNULE
- ✅ Log d'audit créé avec action "PAYMENT_CANCELLED"
- ✅ Notification créée en base
- ✅ Email envoyé à l'élève (dans mail_logs)
- ✅ Erreur 403 si paiement d'un autre élève
- ✅ Erreur 409 si déjà annulé/effectué

---

## 🔔 **Route 5: 30-Day Reminder Notifications (Internal)**

### 5️⃣ POST `/api/internal/notifications/reminder-30days`

**Description:** Envoyer des rappels pour documents disponibles depuis au moins 30 jours et non retirés (cron job)

**Sécurité:** Requête interne uniquement (secret requis)

**Test avec cURL:**

```bash
curl -X POST http://localhost:3000/api/internal/notifications/reminder-30days \
  -H "x-internal-secret: YOUR_INTERNAL_API_SECRET" \
  -H "Content-Type: application/json"
```

**Alternative avec Bearer:**

```bash
curl -X POST http://localhost:3000/api/internal/notifications/reminder-30days \
  -H "Authorization: Bearer YOUR_INTERNAL_API_SECRET" \
  -H "Content-Type: application/json"
```

**Réponse attendue (202 Accepted):**

```json
{
  "ok": true,
  "message": "Rappels envoyés: 2 succès, 0 échecs.",
  "results": {
    "success": 2,
    "failed": 0
  }
}
```

**Vérifications:**

- ✅ Notifications créées pour chaque document disponible depuis 30 jours
- ✅ Emails envoyés (voir mail_logs)
- ✅ Logs d'audit créés avec action "DOCUMENT_WITHDRAWAL_REMINDER_30DAYS_SENT"
- ✅ Erreur 401 si secret invalide/manquant
- ✅ Erreur 503 si secret non configuré

**Configuration pour cron job:**

```bash
# Ajouter au crontab (tous les jours à 9h)
0 9 * * * curl -X POST https://your-app.com/api/internal/notifications/reminder-30days \
  -H "x-internal-secret: YOUR_SECRET"
```

---

## 💰 **Route 6: Admin Payments List (Administration)**

### 6️⃣ GET `/api/admin/payments`

**Description:** Dashboard paiements pour les administrateurs

**Préalabe:** Admin connecté

**Test avec cURL - Sans filtres:**

```bash
curl http://localhost:3000/api/admin/payments \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

**Test avec filtres:**

```bash
# Filtrer par statut
curl 'http://localhost:3000/api/admin/payments?statut=EN_ATTENTE' \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"

# Recherche texte
curl 'http://localhost:3000/api/admin/payments?q=matricule123' \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"

# Pagination
curl 'http://localhost:3000/api/admin/payments?page=1&limit=10' \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

**Réponse attendue (200):**

```json
{
  "payments": [
    {
      "id": "...",
      "statut": "EN_ATTENTE",
      "modePaiement": "ORANGEMONEY",
      "createdAt": "2026-05-27T...",
      "updatedAt": "2026-05-27T...",
      "eleve": {
        "id": "...",
        "matricule": "ABC123",
        "email": "eleve@test.com",
        "nom": "Dupont",
        "prenom": "Jean"
      },
      "documentTitle": "Baccalauréat - DUPLICATA",
      "typeSource": "DUPLICATA",
      "recu": null
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 42
  }
}
```

**Vérifications:**

- ✅ Pagination fonctionne
- ✅ Filtres par statut appliqués
- ✅ Recherche texte multi-champs
- ✅ Admin voit seulement ses paiements (scope OBC/DECC/Antenne)
- ✅ Reçus inclus si paiement effectué
- ✅ Erreur 403 si élève tente accès

---

## 📊 **Route 7: Admin Audit Logs (Sécurité)**

### 7️⃣ GET `/api/admin/audit-logs`

**Description:** Journalisation complète des actions sensibles

**Préalable:** Admin connecté

**Test avec cURL - Sans filtres:**

```bash
curl http://localhost:3000/api/admin/audit-logs \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

**Test avec filtres:**

```bash
# Filtrer par action
curl 'http://localhost:3000/api/admin/audit-logs?action=LOGIN' \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"

# Filtrer par resource
curl 'http://localhost:3000/api/admin/audit-logs?resource=DOCUMENT' \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"

# Filtrer par utilisateur
curl 'http://localhost:3000/api/admin/audit-logs?userId=USER_ID' \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"

# Recherche texte
curl 'http://localhost:3000/api/admin/audit-logs?q=ABC123' \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

**Réponse attendue (200):**

```json
{
  "auditLogs": [
    {
      "id": "...",
      "action": "LOGIN",
      "resource": "USER",
      "resourceId": "USER_ID",
      "details": {
        "email": "admin@test.com",
        "role": "ADMINISTRATEUR",
        "timestamp": "2026-05-27T14:30:00.000Z"
      },
      "ipAddress": null,
      "createdAt": "2026-05-27T14:30:00.000Z",
      "user": {
        "id": "...",
        "matricule": "ADMIN001",
        "email": "admin@test.com",
        "nom": "Admin",
        "prenom": "Super",
        "role": "ADMINISTRATEUR"
      }
    },
    {
      "id": "...",
      "action": "DOCUMENT_STATUS_CHANGED",
      "resource": "DOCUMENT",
      "resourceId": "DOC_ID",
      "details": {
        "documentId": "DOC_ID",
        "eleveMatricule": "ABC123",
        "previousStatus": "PAS_DISPONIBLE",
        "newStatus": "DISPONIBLE",
        "documentType": "ORIGINAL",
        "diplomeType": "BACCALAUREAT"
      },
      "ipAddress": null,
      "createdAt": "2026-05-27T13:45:00.000Z",
      "user": { ... }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 156
  },
  "stats": {
    "totalActions": 156,
    "actionBreakdown": [
      { "action": "LOGIN", "count": 87 },
      { "action": "DOCUMENT_STATUS_CHANGED", "count": 42 },
      { "action": "QUOTA_CHANGED", "count": 5 },
      { "action": "PASSWORD_RESET_REQUESTED", "count": 3 },
      { "action": "PAYMENT_CANCELLED", "count": 2 }
    ]
  }
}
```

**Vérifications:**

- ✅ Tous les logs d'audit visibles
- ✅ Filtres par action appliqués
- ✅ Statistiques breakdown correctes
- ✅ Details JSON parsées correctement
- ✅ Recherche texte multi-champs
- ✅ Pagination fonctionne
- ✅ Erreur 403 si élève tente accès

---

## 🎯 **Étapes de Test Complètes (Scénario Intégré)**

### Scénario 1: Flux de connexion avec audit

1. ✅ Se connecter comme élève
2. ✅ Vérifier log d'audit LOGIN en tant qu'admin
3. ✅ Oublier mot de passe → POST /api/auth/password/forgot
4. ✅ Recevoir email avec lien reset
5. ✅ Ouvrir le lien et laisser le callback créer la session recovery
6. ✅ Reset password → page `/auth/password/reset`
7. ✅ Vérifier logs d'audit PASSWORD_RESET_REQUESTED et PASSWORD_RESET_COMPLETED
8. ✅ Se connecter avec nouveau mot de passe

### Scénario 2: Flux document + rendez-vous

1. ✅ Élève consulte document avec RDV planifié
2. ✅ Export calendrier → POST /api/students/me/documents/DOC_ID/calendar-event
3. ✅ Télécharger fichier .ics
4. ✅ Importer dans Google Calendar
5. ✅ Admin change statut document → DISPONIBLE
6. ✅ Vérifier log d'audit DOCUMENT_STATUS_CHANGED
7. ✅ Vérifier email notificiation envoyé

### Scénario 3: Flux paiement

1. ✅ Élève demande duplicata avec paiement
2. ✅ Paiement créé en EN_ATTENTE
3. ✅ Admin consulte → GET /api/admin/payments
4. ✅ Élève annule paiement → PATCH /api/students/me/payments/PAYMENT_ID/cancel
5. ✅ Vérifier statut ANNULE
6. ✅ Vérifier log d'audit PAYMENT_CANCELLED
7. ✅ Vérifier email notification

### Scénario 4: Rappels documents disponibles 30 jours

1. ✅ Mettre un document en statut DISPONIBLE depuis au moins 30 jours
2. ✅ Exécuter POST /api/internal/notifications/reminder-30days
3. ✅ Vérifier notifications créées en base
4. ✅ Vérifier emails envoyés
5. ✅ Vérifier logs d'audit DOCUMENT_WITHDRAWAL_REMINDER_30DAYS_SENT

### Scénario 5: Admin audit trail

1. ✅ Admin exécute plusieurs actions (changement quota, statut doc)
2. ✅ Admin consulte GET /api/admin/audit-logs
3. ✅ Filtrer par action
4. ✅ Rechercher par matricule
5. ✅ Vérifier stats breakdown

---

## 📝 **Checklist de Validation**

### Routes d'authentification ✅

- [ ] `/api/auth/password/forgot` - Email envoyé
- [ ] `/api/auth/password/reset` - Mot de passe changé

### Routes d'élève ✅

- [ ] `/api/students/me/documents/:documentId/calendar-event` - Fichier .ics généré
- [ ] `/api/students/me/payments/:paymentId/cancel` - Paiement annulé

### Routes internes ✅

- [ ] `/api/internal/notifications/reminder-30days` - Rappels envoyés

### Routes admin ✅

- [ ] `/api/admin/payments` - Liste paiements avec filtres
- [ ] `/api/admin/audit-logs` - Journalisation complète

### Audit logs intégrés ✅

- [ ] `LOGIN` - Lors de connexion
- [ ] `DOCUMENT_STATUS_CHANGED` - Lors changement statut
- [ ] `QUOTA_CHANGED` - Lors maj quota RDV
- [ ] `PAYMENT_CANCELLED` - Lors annulation paiement
- [ ] `PASSWORD_RESET_REQUESTED` - Lors demande reset
- [ ] `PASSWORD_RESET_COMPLETED` - Lors finalisation reset
- [ ] `DOCUMENT_WITHDRAWAL_REMINDER_30DAYS_SENT` - Lors rappel retrait document 30j

---

## 🐛 Dépannage Courant

| Erreur                      | Cause                 | Solution                                  |
| --------------------------- | --------------------- | ----------------------------------------- |
| P1001: Can't reach database | DB Supabase down      | Vérifier DATABASE_URL et connexion réseau |
| 401 Unauthorized            | Session expiree       | Se reconnecter                            |
| 403 Forbidden               | Rôle insuffisant      | Utiliser bon rôle (ELEVE/ADMINISTRATEUR)  |
| 503 Service Unavailable     | Secret manquant       | Vérifier INTERNAL_API_SECRET              |
| Audit log non créé          | Prisma error non géré | Vérifier logs console, check migration    |
| Email non envoyé            | Nodemailer config     | Vérifier SMTP credentials                 |

---

## 📞 Support

En cas de problème, vérifier:

1. ✅ Logs de la console Next.js
2. ✅ Prisma Studio: `npx prisma studio`
3. ✅ Supabase Dashboard pour logs Auth
4. ✅ Base de données PostgreSQL directement
5. ✅ Variables d'environnement configurées

# Exemples cURL DR-DOCSCOL

Derniere mise a jour: 02/06/2026.

Ces exemples servent de base. Les routes protegees utilisent la session Supabase stockee en cookies dans l'application; pour les tester avec cURL, recuperer les cookies de session ou passer par l'interface.

## Health

```bash
curl http://localhost:3000/api/health
```

## Auth

### Login admin DECC

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "matricule": "DECC-01-ADAMAOUA",
    "email": "admin.decc.adamaoua@example.com",
    "password": "DeccAdamaoua2026!",
    "loginOrganisme": "DECC"
  }'
```

### Login admin OBC

```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "matricule": "ADM-02-CENTRE",
    "email": "admin.centre@example.com",
    "password": "AdminCentre2026!",
    "loginOrganisme": "OBC"
  }'
```

### Demande reset password

```bash
curl -X POST http://localhost:3000/api/auth/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"eleve@example.com"}'
```

## Eleve

### Liste des documents

```bash
curl http://localhost:3000/api/students/me/documents \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

### Instructions de retrait

```bash
curl http://localhost:3000/api/students/me/documents/DOCUMENT_ID/instructions \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

### Prendre rendez-vous

```bash
curl -X POST http://localhost:3000/api/students/me/documents/DOCUMENT_ID/appointments \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER" \
  -H "Content-Type: application/json" \
  -d '{
    "dateRdv": "2026-06-05",
    "heureRdv": "08:00-10:00",
    "commentaire": "Reservation eleve"
  }'
```

### Export calendrier

```bash
curl -X POST http://localhost:3000/api/students/me/documents/DOCUMENT_ID/calendar-event \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER" \
  --output rendez-vous.ics
```

### Annuler un paiement en attente

```bash
curl -X PATCH http://localhost:3000/api/students/me/payments/PAYMENT_ID/cancel \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

### Voir un recu

```bash
curl http://localhost:3000/api/students/me/payments/PAYMENT_ID/receipt \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

## Admin

### Documents admin

```bash
curl http://localhost:3000/api/admin/documents \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

### Changer statut document

```bash
curl -X PATCH http://localhost:3000/api/admin/documents/DOCUMENT_ID/status \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER" \
  -H "Content-Type: application/json" \
  -d '{"statut":"DISPONIBLE"}'
```

### Paiements admin

```bash
curl http://localhost:3000/api/admin/payments \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

### Audit logs

```bash
curl http://localhost:3000/api/admin/audit-logs \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

### Retrait physique admin

```bash
curl -X POST http://localhost:3000/api/admin/withdrawals \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER" \
  -H "Content-Type: application/json" \
  -d '{
    "documentId": "DOCUMENT_ID",
    "commentaire": "Retrait confirme au guichet"
  }'
```

## Agent centre d'examen

### Liste des rendez-vous

```bash
curl "http://localhost:3000/api/centre-examen/appointments?filter=today" \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

### Confirmer retrait

```bash
curl -X PATCH http://localhost:3000/api/centre-examen/appointments/APPOINTMENT_ID/confirm-withdrawal \
  -H "Cookie: YOUR_SUPABASE_COOKIE_HEADER"
```

## Routes internes

### Rappel 30 jours

```bash
curl -X POST http://localhost:3000/api/internal/notifications/reminder-30days \
  -H "Authorization: Bearer YOUR_INTERNAL_SECRET"
```

### Webhook paiement

```bash
curl -X POST http://localhost:3000/api/payments/webhook \
  -H "Authorization: Bearer YOUR_INTERNAL_SECRET" \
  -H "Content-Type: application/json" \
  -d '{
    "paymentId": "PAYMENT_ID",
    "statut": "EFFECTUE",
    "numeroRecu": "REC-TEST-001",
    "montant": 25000,
    "commentaire": "Paiement de test"
  }'
```

## Diagnostic DB

```bash
set -a; source .env; set +a
psql "$DATABASE_URL" -c 'select now();'
```

Si ce test timeout, corriger la connexion Postgres avant de tester les routes protegees.

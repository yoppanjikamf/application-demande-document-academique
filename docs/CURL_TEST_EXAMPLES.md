# Commandes cURL pour Tester les 7 Routes
# À adapter avec vos tokens et IDs réels

## ==================== ROUTE 1: Password Forgot ====================

# Demander un reset de mot de passe (pas besoin de token)
curl -X POST http://localhost:3000/api/auth/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"eleve@obc-decc.cm"}'

# Réponse attendue: 200
# {"ok":true,"message":"Si l'email existe, un lien de reset a été envoyé."}


## ==================== ROUTE 2: Password Reset ====================

# Remplacer YOUR_TOKEN par le token reçu dans l'email Supabase
curl -X POST http://localhost:3000/api/auth/password/reset \
  -H "Content-Type: application/json" \
  -d '{
    "token": "YOUR_SUPABASE_RECOVERY_TOKEN_HERE",
    "newPassword": "NewPassword123!",
    "confirmPassword": "NewPassword123!"
  }'

# Réponse attendue: 200
# {"ok":true,"message":"Mot de passe réinitialisé avec succès..."}


## ==================== ROUTE 3: Calendar Export ====================

# Remplacer SESSION_TOKEN par votre session token
# Remplacer DOC_ID par un vrai ID de document
curl -X POST http://localhost:3000/api/students/me/documents/DOC_ID/calendar-event \
  -H "Authorization: Bearer SESSION_TOKEN" \
  --output rendez-vous.ics

# Réponse attendue: 200 + fichier .ics
# Content-Type: text/calendar; charset=utf-8


## ==================== ROUTE 4: Payment Cancel ====================

# Remplacer SESSION_TOKEN par votre session token
# Remplacer PAYMENT_ID par un vrai ID de paiement
curl -X PATCH http://localhost:3000/api/students/me/payments/PAYMENT_ID/cancel \
  -H "Authorization: Bearer SESSION_TOKEN" \
  -H "Content-Type: application/json"

# Réponse attendue: 200
# {
#   "payment": {
#     "id": "...",
#     "statut": "ANNULE",
#     "modePaiment": "ORANGEMONEY",
#     ...
#   },
#   "message": "Paiement annulé avec succès."
# }


## ==================== ROUTE 5: 30-Day Reminder (Internal) ====================

# Remplacer YOUR_INTERNAL_SECRET par INTERNAL_API_SECRET
# Cette route doit être appelée par une tâche cron

# Version 1: Avec header x-internal-secret
curl -X POST http://localhost:3000/api/internal/notifications/reminder-30days \
  -H "x-internal-secret: YOUR_INTERNAL_SECRET" \
  -H "Content-Type: application/json"

# Version 2: Avec Bearer token
curl -X POST http://localhost:3000/api/internal/notifications/reminder-30days \
  -H "Authorization: Bearer YOUR_INTERNAL_SECRET" \
  -H "Content-Type: application/json"

# Réponse attendue: 202 Accepted
# {
#   "ok": true,
#   "message": "Rappels envoyés: 5 succès, 0 échecs.",
#   "results": {
#     "success": 5,
#     "failed": 0
#   }
# }


## ==================== ROUTE 6: Admin Payments ====================

# Remplacer ADMIN_SESSION_TOKEN par votre session admin

# 6a. Lister tous les paiements
curl -X GET http://localhost:3000/api/admin/payments \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# 6b. Filtrer par statut
curl -X GET 'http://localhost:3000/api/admin/payments?statut=EN_ATTENTE' \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# 6c. Rechercher par matricule
curl -X GET 'http://localhost:3000/api/admin/payments?q=ABC123' \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# 6d. Pagination
curl -X GET 'http://localhost:3000/api/admin/payments?page=1&limit=10' \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# 6e. Combiné: statut + recherche + pagination
curl -X GET 'http://localhost:3000/api/admin/payments?statut=EFFECTUE&q=Jean&page=1&limit=5' \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# Réponse attendue: 200
# {
#   "payments": [
#     {
#       "id": "...",
#       "statut": "EN_ATTENTE",
#       "modePaiement": "ORANGEMONEY",
#       "createdAt": "...",
#       "eleve": { ... },
#       "documentTitle": "Baccalauréat - DUPLICATA",
#       "typeSource": "DUPLICATA",
#       "recu": null
#     }
#   ],
#   "pagination": {
#     "page": 1,
#     "limit": 10,
#     "total": 42
#   }
# }


## ==================== ROUTE 7: Admin Audit Logs ====================

# Remplacer ADMIN_SESSION_TOKEN par votre session admin

# 7a. Lister tous les logs d'audit
curl -X GET http://localhost:3000/api/admin/audit-logs \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# 7b. Filtrer par action
curl -X GET 'http://localhost:3000/api/admin/audit-logs?action=LOGIN' \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# 7c. Filtrer par resource
curl -X GET 'http://localhost:3000/api/admin/audit-logs?resource=DOCUMENT' \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# 7d. Filtrer par utilisateur
curl -X GET 'http://localhost:3000/api/admin/audit-logs?userId=USER_ID' \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# 7e. Recherche textuelle
curl -X GET 'http://localhost:3000/api/admin/audit-logs?q=ABC123' \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# 7f. Combiné: filtres + recherche + pagination
curl -X GET 'http://localhost:3000/api/admin/audit-logs?action=DOCUMENT_STATUS_CHANGED&q=ABC&page=1&limit=20' \
  -H "Authorization: Bearer ADMIN_SESSION_TOKEN"

# Réponse attendue: 200
# {
#   "auditLogs": [
#     {
#       "id": "...",
#       "action": "LOGIN",
#       "resource": "USER",
#       "resourceId": "...",
#       "details": { ... },
#       "ipAddress": null,
#       "createdAt": "...",
#       "user": { ... }
#     }
#   ],
#   "pagination": { ... },
#   "stats": {
#     "totalActions": 156,
#     "actionBreakdown": [
#       { "action": "LOGIN", "count": 87 },
#       ...
#     ]
#   }
# }


## ==================== GESTION DES TOKENS ====================

# Pour obtenir SESSION_TOKEN en dev:
# 1. Se connecter via l'UI: http://localhost:3000/auth/login
# 2. Vérifier le cookie 'auth-token' dans devtools
# 3. Ou appeler POST /api/auth/login directement

curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "matricule": "ABC123",
    "email": "eleve@obc-decc.cm",
    "password": "password123"
  }'

# Pour obtenir ADMIN_SESSION_TOKEN:
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "matricule": "ADMIN001",
    "email": "admin@obc-decc.cm",
    "password": "adminpass123"
  }'


## ==================== GESTION DES ERREURS ====================

# Erreur 400: Donnees invalides
curl -X POST http://localhost:3000/api/auth/password/forgot \
  -H "Content-Type: application/json" \
  -d '{"email":"invalid-email"}'
# {"error":"Donnees invalides."}

# Erreur 401: Non authentifié
curl -X PATCH http://localhost:3000/api/students/me/payments/ID/cancel
# {"error":"Acces refuse."}

# Erreur 403: Acces refusé (élève accède à route admin)
curl -X GET http://localhost:3000/api/admin/payments \
  -H "Authorization: Bearer ELEVE_SESSION_TOKEN"
# {"error":"Acces refuse."}

# Erreur 404: Ressource introuvable
curl -X PATCH http://localhost:3000/api/students/me/payments/INVALID_ID/cancel \
  -H "Authorization: Bearer ELEVE_SESSION_TOKEN"
# {"error":"Paiement introuvable."}

# Erreur 409: Conflit metier
curl -X PATCH http://localhost:3000/api/students/me/payments/ALREADY_PAID_ID/cancel \
  -H "Authorization: Bearer ELEVE_SESSION_TOKEN"
# {"error":"Seuls les paiements en attente peuvent être annulés."}

# Erreur 422: Regle metier non respectée
curl -X POST http://localhost:3000/api/students/me/documents/DOC_ID/calendar-event \
  -H "Authorization: Bearer ELEVE_SESSION_TOKEN"
# {"error":"Aucun rendez-vous planifié pour ce document..."}

# Erreur 503: Configuration manquante
curl -X POST http://localhost:3000/api/internal/notifications/reminder-30days \
  -H "x-internal-secret: INVALID"
# {"error":"Configuration Supabase manquante."}


## ==================== ASTUCES ET OPTIMISATIONS ====================

# Sauvegarder la réponse dans un fichier
curl -X GET http://localhost:3000/api/admin/audit-logs \
  -H "Authorization: Bearer TOKEN" \
  > audit_logs.json

# Pretty-print JSON avec jq
curl -s http://localhost:3000/api/admin/payments \
  -H "Authorization: Bearer TOKEN" | jq '.'

# Extraire un champ spécifique
curl -s http://localhost:3000/api/admin/payments \
  -H "Authorization: Bearer TOKEN" | jq '.payments[0].eleve'

# Compter les résultats
curl -s http://localhost:3000/api/admin/payments \
  -H "Authorization: Bearer TOKEN" | jq '.pagination.total'

# Tester avec envoi de fichier (si nécessaire)
curl -X POST http://localhost:3000/api/admin/students/import \
  -H "Authorization: Bearer ADMIN_TOKEN" \
  -F "file=@import.csv"

# Tester timeout
curl --connect-timeout 5 http://localhost:3000/api/health

# Tester avec proxy
curl -x http://localhost:8080 http://localhost:3000/api/health

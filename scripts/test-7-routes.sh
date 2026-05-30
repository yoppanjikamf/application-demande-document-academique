#!/bin/bash
# Script de test des 7 routes - À exécuter avec permission: chmod +x

set -e

# Configuration
API_URL="${API_URL:-http://localhost:3000}"
ADMIN_COOKIE="${ADMIN_COOKIE:-}"  # Copier les cookies d'une session admin connectée
ELEVE_COOKIE="${ELEVE_COOKIE:-}"  # Copier les cookies d'une session élève connectée
INTERNAL_SECRET="${INTERNAL_SECRET:-}"  # Même valeur que INTERNAL_API_SECRET

# Couleurs
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions helper
print_header() {
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}═══════════════════════════════════════${NC}"
}

print_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

print_error() {
    echo -e "${RED}❌ $1${NC}"
}

print_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

test_route() {
    local method=$1
    local route=$2
    local cookie=$3
    local data=$4
    local expected_status=$5
    
    echo -e "\n${YELLOW}Testing:${NC} $method $route"
    
    if [ -z "$cookie" ]; then
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            ${data:+-d "$data"} \
            "$API_URL$route")
    else
        response=$(curl -s -w "\n%{http_code}" -X "$method" \
            -H "Content-Type: application/json" \
            -H "Cookie: $cookie" \
            ${data:+-d "$data"} \
            "$API_URL$route")
    fi
    
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    
    if [ "$http_code" == "$expected_status" ]; then
        print_success "HTTP $http_code (expected $expected_status)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "HTTP $http_code (expected $expected_status)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
        return 1
    fi
}

# ===== TESTS =====

print_header "TEST 1: POST /api/auth/password/forgot"
test_route POST "/api/auth/password/forgot" "" \
    '{"email":"test@example.com"}' 200

print_header "TEST 2: POST /api/auth/password/reset"
print_warning "Note: test complet à faire depuis le lien email, qui crée une session recovery Supabase"
# test_route POST "/api/auth/password/reset" "" \
#     '{"newPassword":"NewPass123!","confirmPassword":"NewPass123!"}' 200

print_header "TEST 3: POST /api/students/me/documents/:documentId/calendar-event"
if [ -z "$ELEVE_COOKIE" ]; then
    print_error "ELEVE_COOKIE not set. Skipping..."
else
    test_route POST "/api/students/me/documents/DOC_ID_HERE/calendar-event" "$ELEVE_COOKIE" "" 404
fi

print_header "TEST 4: PATCH /api/students/me/payments/:paymentId/cancel"
if [ -z "$ELEVE_COOKIE" ]; then
    print_error "ELEVE_COOKIE not set. Skipping..."
else
    test_route PATCH "/api/students/me/payments/PAYMENT_ID_HERE/cancel" "$ELEVE_COOKIE" "" 404
fi

print_header "TEST 5: POST /api/internal/notifications/reminder-30days"
if [ -z "$INTERNAL_SECRET" ]; then
    print_error "INTERNAL_SECRET not set. Skipping..."
else
    response=$(curl -s -w "\n%{http_code}" -X POST \
        -H "Content-Type: application/json" \
        -H "x-internal-secret: $INTERNAL_SECRET" \
        "$API_URL/api/internal/notifications/reminder-30days")
    http_code=$(echo "$response" | tail -n 1)
    body=$(echo "$response" | sed '$d')
    if [ "$http_code" == "200" ] || [ "$http_code" == "202" ]; then
        print_success "HTTP $http_code (expected 200 or 202)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    else
        print_error "HTTP $http_code (expected 200 or 202)"
        echo "$body" | jq '.' 2>/dev/null || echo "$body"
    fi
fi

print_header "TEST 6: GET /api/admin/payments"
if [ -z "$ADMIN_COOKIE" ]; then
    print_error "ADMIN_COOKIE not set. Skipping..."
else
    test_route GET "/api/admin/payments" "$ADMIN_COOKIE" "" 200
fi

print_header "TEST 7: GET /api/admin/audit-logs"
if [ -z "$ADMIN_COOKIE" ]; then
    print_error "ADMIN_COOKIE not set. Skipping..."
else
    test_route GET "/api/admin/audit-logs" "$ADMIN_COOKIE" "" 200
fi

print_header "RÉSUMÉ DES TESTS"
print_success "Script de test complété"
print_warning "Cookies à renseigner manuellement pour tests complets"

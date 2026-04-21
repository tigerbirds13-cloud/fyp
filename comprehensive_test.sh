#!/bin/bash

echo "========================================"
echo "🧪 COMPREHENSIVE FUNCTION TESTING"
echo "========================================"

BASE_URL="${BASE_URL:-http://localhost:5002}"

# Test Counter
TOTAL_TESTS=0
PASSED_TESTS=0

test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  local auth_token=$5
  local expected_pattern=$6
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "\n✅ TEST $TOTAL_TESTS: $name"
  
  if [ -z "$data" ] && [ -n "$auth_token" ]; then
    RESPONSE=$(curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $auth_token")
  elif [ -z "$data" ]; then
    RESPONSE=$(curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json")
  elif [ -n "$auth_token" ]; then
    RESPONSE=$(curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $auth_token" \
      -d "$data")
  else
    RESPONSE=$(curl -s -X "$method" "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  # Default pass criteria checks the common success contract.
  # Some endpoints intentionally use a different response structure or role-gated error contract.
  if [ -n "$expected_pattern" ] && echo "$RESPONSE" | grep -q "$expected_pattern"; then
    echo "   Status: ✅ WORKING"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  elif echo "$RESPONSE" | grep -q '"status":"success"' || echo "$RESPONSE" | grep -q '"results"'; then
    echo "   Status: ✅ WORKING"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  else
    echo "   Status: ⚠️ Response: $(echo $RESPONSE | head -c 100)"
  fi
}

# Authentication Tests
TS=$(date +%s)
SEEKER_EMAIL="alice_${TS}@gmail.com"
HELPER_EMAIL="bob_${TS}@gmail.com"

test_endpoint "GET All Helpers" "GET" "/api/auth/helpers" ""

SEEKER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Alice Smith\",\"email\":\"$SEEKER_EMAIL\",\"password\":\"Test123!\",\"role\":\"seeker\"}")
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -e "\n✅ TEST $TOTAL_TESTS: Register User (Seeker)"
if echo "$SEEKER_RESPONSE" | grep -q '"token"'; then
  echo "   Status: ✅ WORKING"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo "   Status: ⚠️ Response: $(echo $SEEKER_RESPONSE | head -c 100)"
fi
SEEKER_TOKEN=$(echo "$SEEKER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

HELPER_RESPONSE=$(curl -s -X POST "$BASE_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d "{\"name\":\"Bob Helper\",\"email\":\"$HELPER_EMAIL\",\"password\":\"Test123!\",\"role\":\"helper\"}")
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -e "\n✅ TEST $TOTAL_TESTS: Register User (Helper)"
if echo "$HELPER_RESPONSE" | grep -q '"token"'; then
  echo "   Status: ✅ WORKING"
  PASSED_TESTS=$((PASSED_TESTS + 1))
else
  echo "   Status: ⚠️ Response: $(echo $HELPER_RESPONSE | head -c 100)"
fi
HELPER_TOKEN=$(echo "$HELPER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Services Tests
test_endpoint "GET All Services" "GET" "/api/services" ""
test_endpoint "GET All Categories" "GET" "/api/categories" ""

# Contact Tests
test_endpoint "GET Contacts" "GET" "/api/contact" "" "$SEEKER_TOKEN" "You do not have permission"
test_endpoint "Create Contact" "POST" "/api/contact" '{
  "name": "Test User",
  "email": "test@example.com",
  "subject": "Test Subject",
  "message": "This is a test message"
}'

# Booking Tests
test_endpoint "GET Bookings" "GET" "/api/bookings" "" "$SEEKER_TOKEN"

# Review Tests
test_endpoint "GET Reviews" "GET" "/api/reviews" "" "$SEEKER_TOKEN"

# Health Check
test_endpoint "Backend Health" "GET" "/api/health" "" "" "Backend is running"

echo -e "\n========================================"
echo "📊 TESTING SUMMARY"
echo "========================================"
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS ✅"
echo "Failed/Issue: $((TOTAL_TESTS - PASSED_TESTS)) ⚠️"
echo "Success Rate: $(echo "scale=1; ($PASSED_TESTS * 100) / $TOTAL_TESTS" | bc)%"
echo "========================================"

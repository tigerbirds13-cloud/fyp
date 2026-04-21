#!/bin/bash

# Quick Khalti Payment Test - Minimal Approach

API_URL="http://localhost:5002"

echo "=== Quick Khalti Payment Test ==="
echo ""

# Test 1: Get Public Key
echo "1. Testing Public Key Endpoint..."
curl -s -X GET "$API_URL/api/payments/public-key" | jq '.'
echo ""

# Test 2: Test Health Check
echo "2. Testing Backend Health..."
curl -s -X GET "$API_URL/api/health" | jq '.'
echo ""

# Test 3: List all bookings (to find existing ones)
echo "3. Creating test user and getting token..."
LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seeker_khalti@test.com",
    "password": "Test@1234"
  }')

TOKEN=$(echo "$LOGIN" | jq -r '.token // .data.token' 2>/dev/null)
echo "Token: ${TOKEN:0:20}..."

if [ ! -z "$TOKEN" ] && [ "$TOKEN" != "null" ]; then
  echo ""
  echo "4. Getting existing bookings..."
  curl -s -X GET "$API_URL/api/bookings" \
    -H "Authorization: Bearer $TOKEN" | jq '.'
fi

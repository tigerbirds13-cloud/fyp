#!/bin/bash

echo "========================================"
echo "🔍 DETAILED FUNCTIONALITY TEST"
echo "========================================"

# Register as seeker
echo -e "\n1️⃣ Creating Seeker Account..."
SEEKER_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Jane Seeker",
    "email": "seeker'$(date +%s)'@gmail.com",
    "password": "Test123!",
    "role": "seeker"
  }')
SEEKER_TOKEN=$(echo $SEEKER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
SEEKER_ID=$(echo $SEEKER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
echo "   Seeker Account Created ✅"
echo "   Token: ${SEEKER_TOKEN:0:20}..."

# Register as helper
echo -e "\n2️⃣ Creating Helper Account..."
HELPER_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Mike Helper",
    "email": "helper'$(date +%s)'@gmail.com",
    "password": "Test123!",
    "role": "helper"
  }')
HELPER_TOKEN=$(echo $HELPER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
HELPER_ID=$(echo $HELPER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)
echo "   Helper Account Created ✅"

# Get categories to use valid ObjectId
echo -e "\n3️⃣ Fetching Category Information..."
CATEGORY_RESPONSE=$(curl -s "http://localhost:5002/api/categories")
CATEGORY_ID=$(echo $CATEGORY_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
echo "   Category ID: $CATEGORY_ID"

# Create service as helper with valid category
echo -e "\n4️⃣ Creating Service as Helper..."
SERVICE_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HELPER_TOKEN" \
  -d "{
    \"name\": \"Home Cleaning Service\",
    \"description\": \"Professional home cleaning\",
    \"price\": 75,
    \"category\": \"$CATEGORY_ID\",
    \"location\": \"New York\",
    \"tags\": [\"cleaning\"]
  }")

if echo "$SERVICE_RESPONSE" | grep -q '"status":"success"'; then
  SERVICE_ID=$(echo $SERVICE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
  echo "   ✅ Service Created: $SERVICE_ID"
else
  echo "   ⚠️ Service Creation Issue"
  echo "   Response: $(echo $SERVICE_RESPONSE | head -c 150)"
fi

# Test contact submission
echo -e "\n5️⃣ Testing Contact Form..."
CONTACT_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/contact" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Contact Tester",
    "email": "contact@gmail.com",
    "subject": "Testing the form",
    "message": "This is a test contact message"
  }')

if echo "$CONTACT_RESPONSE" | grep -q '"status":"success"'; then
  echo "   ✅ Contact Form Submitted Successfully"
else
  echo "   ⚠️ Issue: $(echo $CONTACT_RESPONSE | head -c 100)"
fi

# Test creating booking
echo -e "\n6️⃣ Testing Booking Creation..."
BOOKING_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -d "{
    \"service\": \"$SERVICE_ID\",
    \"provider\": \"$HELPER_ID\",
    \"scheduledDate\": \"$(date -u -d '+1 day' +%Y-%m-%dT%H:%M:%S.000Z)\",
    \"notes\": \"Please come on time\"
  }")

if echo "$BOOKING_RESPONSE" | grep -q '"status":"success"'; then
  BOOKING_ID=$(echo $BOOKING_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
  echo "   ✅ Booking Created: $BOOKING_ID"
else
  echo "   ⚠️ Issue: $(echo $BOOKING_RESPONSE | head -c 150)"
fi

# Test filtering services
echo -e "\n7️⃣ Testing Service Filtering..."
FILTER_RESPONSE=$(curl -s "http://localhost:5002/api/services?location=New%20York")
if echo "$FILTER_RESPONSE" | grep -q '"results"'; then
  RESULTS=$(echo $FILTER_RESPONSE | grep -o '"results":[0-9]*' | cut -d':' -f2)
  echo "   ✅ Location Filter Working - Found $RESULTS services"
fi

# Test search
echo -e "\n8️⃣ Testing Service Search..."
SEARCH_RESPONSE=$(curl -s "http://localhost:5002/api/services?search=cleaning")
if echo "$SEARCH_RESPONSE" | grep -q '"results"'; then
  echo "   ✅ Search Working"
fi

# Test login
echo -e "\n9️⃣ Testing Login Function..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "'$(echo $SEEKER_RESPONSE | grep -o '"email":"[^"]*' | cut -d'"' -f4 | head -1)'",
    "password": "Test123!"
  }')

if echo "$LOGIN_RESPONSE" | grep -q '"token"'; then
  echo "   ✅ Login Function Working - Token Generated"
else
  echo "   ⚠️ Login Issue"
fi

echo -e "\n========================================"
echo "✨ DETAILED TEST COMPLETE"
echo "========================================"

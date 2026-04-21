#!/bin/bash

echo "========================================"
echo "📅 BOOKING FUNCTIONALITY TEST (Fixed)"
echo "========================================"

# Register as seeker
SEEKER_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BookingSeeker",
    "email": "bseeker'$(date +%s)'@gmail.com",
    "password": "Test123!",
    "role": "seeker"
  }')
SEEKER_TOKEN=$(echo $SEEKER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Register as helper
HELPER_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "BookingHelper",
    "email": "bhelper'$(date +%s)'@gmail.com",
    "password": "Test123!",
    "role": "helper"
  }')
HELPER_TOKEN=$(echo $HELPER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)

# Get category
CATEGORY_RESPONSE=$(curl -s "http://localhost:5002/api/categories")
CATEGORY_ID=$(echo $CATEGORY_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)

# Create service
SERVICE_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HELPER_TOKEN" \
  -d "{
    \"name\": \"Electrical Service\",
    \"description\": \"Electrical repairs\",
    \"price\": 120,
    \"category\": \"$CATEGORY_ID\",
    \"location\": \"Manhattan\",
    \"tags\": [\"electrical\"]
  }")
SERVICE_ID=$(echo $SERVICE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)

echo "Service ID: $SERVICE_ID"

# Create booking with corrected parameter names
FUTURE_DATE=$(date -u -v+1d +%Y-%m-%dT%H:%M:%S.000Z)
echo "📝 Creating Booking..."

BOOKING_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -d "{
    \"serviceId\": \"$SERVICE_ID\",
    \"scheduledDate\": \"$FUTURE_DATE\",
    \"location\": \"Manhattan\",
    \"notes\": \"Please arrive between 2-4 PM\"
  }")

echo "Response: $BOOKING_RESPONSE" | head -c 200

if echo "$BOOKING_RESPONSE" | grep -q '"status":"success"'; then
  BOOKING_ID=$(echo $BOOKING_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
  echo -e "\n✅ BOOKING CREATED: $BOOKING_ID"
else
  echo -e "\n❌ Booking Failed"
fi

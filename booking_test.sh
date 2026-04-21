#!/bin/bash

echo "========================================"
echo "📅 BOOKING FUNCTIONALITY TEST"
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
HELPER_ID=$(echo $HELPER_RESPONSE | grep -o '"id":"[^"]*' | cut -d'"' -f4 | head -1)

# Get category
CATEGORY_RESPONSE=$(curl -s "http://localhost:5002/api/categories")
CATEGORY_ID=$(echo $CATEGORY_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)

# Create service
SERVICE_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/services" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $HELPER_TOKEN" \
  -d "{
    \"name\": \"Plumbing Service\",
    \"description\": \"Professional plumbing\",
    \"price\": 100,
    \"category\": \"$CATEGORY_ID\",
    \"location\": \"Brooklyn\",
    \"tags\": [\"plumbing\"]
  }")
SERVICE_ID=$(echo $SERVICE_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)

# Create booking with corrected date format
FUTURE_DATE=$(date -u -v+1d +%Y-%m-%dT%H:%M:%S.000Z)
echo "📝 Creating Booking with date: $FUTURE_DATE"

BOOKING_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/bookings" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -d "{
    \"service\": \"$SERVICE_ID\",
    \"provider\": \"$HELPER_ID\",
    \"scheduledDate\": \"$FUTURE_DATE\",
    \"location\": \"Brooklyn\",
    \"notes\": \"Please arrive between 2-4 PM\"
  }")

if echo "$BOOKING_RESPONSE" | grep -q '"status":"success"'; then
  BOOKING_ID=$(echo $BOOKING_RESPONSE | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)
  echo "✅ Booking Created Successfully: $BOOKING_ID"
  
  # Get booking details
  echo -e "\n📖 Fetching Booking Details..."
  GET_BOOKING=$(curl -s -X GET "http://localhost:5002/api/bookings/$BOOKING_ID" \
    -H "Authorization: Bearer $SEEKER_TOKEN")
  
  if echo "$GET_BOOKING" | grep -q '"status":"success"'; then
    echo "✅ Booking Details Retrieved Successfully"
  fi
  
  # Test status update as helper
  echo -e "\n🔄 Testing Booking Status Update (as Helper)..."
  STATUS_UPDATE=$(curl -s -X PATCH "http://localhost:5002/api/bookings/$BOOKING_ID/status" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer $HELPER_TOKEN" \
    -d '{"status": "accepted"}')
  
  if echo "$STATUS_UPDATE" | grep -q '"status":"success"'; then
    echo "✅ Booking Status Updated to Accepted"
  fi
else
  echo "❌ Booking Creation Failed"
  echo "Response: $BOOKING_RESPONSE"
fi

echo -e "\n========================================"
echo "✨ BOOKING TEST COMPLETE"
echo "========================================"

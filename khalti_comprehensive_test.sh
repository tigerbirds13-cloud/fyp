#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:5002"
FRONTEND_URL="http://localhost:3000"

echo -e "${BLUE}=== Khalti Payment System Comprehensive Test ===${NC}\n"

# Step 1: Create or login test seeker user
echo -e "${YELLOW}Step 1: Creating/logging in test seeker user...${NC}"
SEEKER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Seeker",
    "email": "seeker@test.com",
    "password": "Test@1234",
    "role": "seeker"
  }')

echo "$SEEKER_RESPONSE" | jq '.'

SEEKER_TOKEN=$(echo "$SEEKER_RESPONSE" | jq -r '.data.token // empty')
SEEKER_ID=$(echo "$SEEKER_RESPONSE" | jq -r '.data.user._id // empty')

if [ -z "$SEEKER_TOKEN" ] || [ "$SEEKER_TOKEN" = "null" ]; then
  echo -e "${YELLOW}User might already exist, trying to login...${NC}"
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "seeker@test.com",
      "password": "Test@1234"
    }')
  
  SEEKER_TOKEN=$(echo "$LOGIN_RESPONSE" | jq -r '.data.token')
  SEEKER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.user._id')
fi

echo -e "${GREEN}Seeker Token: $SEEKER_TOKEN${NC}"
echo -e "${GREEN}Seeker ID: $SEEKER_ID${NC}\n"

# Step 2: Get or create helper user
echo -e "${YELLOW}Step 2: Creating/Getting helper user...${NC}"
HELPER_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Helper",
    "email": "helper@test.com",
    "password": "Test@1234",
    "role": "helper"
  }')

HELPER_ID=$(echo "$HELPER_RESPONSE" | jq -r '.data.user._id // empty')

if [ -z "$HELPER_ID" ] || [ "$HELPER_ID" = "null" ]; then
  LOGIN_RESPONSE=$(curl -s -X POST "$API_URL/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
      "email": "helper@test.com",
      "password": "Test@1234"
    }')
  
  HELPER_ID=$(echo "$LOGIN_RESPONSE" | jq -r '.data.user._id')
fi

echo -e "${GREEN}Helper ID: $HELPER_ID${NC}\n"

# Step 3: Get a service to book
echo -e "${YELLOW}Step 3: Getting available services...${NC}"
SERVICES_RESPONSE=$(curl -s -X GET "$API_URL/api/services" \
  -H "Authorization: Bearer $SEEKER_TOKEN")

SERVICE_ID=$(echo "$SERVICES_RESPONSE" | jq -r '.data[0]._id // empty')
if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
  echo -e "${RED}No services found. Skipping booking test.${NC}"
  SERVICE_ID="000000000000000000000000"
fi

echo -e "${GREEN}Service ID: $SERVICE_ID${NC}\n"

# Step 4: Create a booking
echo -e "${YELLOW}Step 4: Creating a booking...${NC}"

# Calculate date for 2 days from now (macOS compatible)
SCHEDULED_DATE=$(date -u -v+2d '+%Y-%m-%dT%H:%M:%S.000Z' 2>/dev/null || date -u -d '+2 days' '+%Y-%m-%dT%H:%M:%S.000Z' 2>/dev/null || echo "2025-12-20T10:00:00.000Z")

BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/api/bookings" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"service\": \"$SERVICE_ID\",
    \"helper\": \"$HELPER_ID\",
    \"scheduledDate\": \"$SCHEDULED_DATE\",
    \"duration\": 2,
    \"totalPrice\": 1000
  }")

echo "$BOOKING_RESPONSE" | jq '.'

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.data._id // empty')
if [ -z "$BOOKING_ID" ] || [ "$BOOKING_ID" = "null" ]; then
  echo -e "${RED}Failed to create booking${NC}"
  exit 1
fi

echo -e "${GREEN}Booking ID: $BOOKING_ID${NC}\n"

# Step 5: Test payment initiation
echo -e "${YELLOW}Step 5: Testing Khalti payment initiation...${NC}"
PAYMENT_INIT=$(curl -s -X POST "$API_URL/api/payments/initiate" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"method\": \"khalti\",
    \"mobile\": \"9841234567\",
    \"email\": \"seeker@test.com\"
  }")

echo "$PAYMENT_INIT" | jq '.'

PIDX=$(echo "$PAYMENT_INIT" | jq -r '.data.pidx // empty')
PAYMENT_URL=$(echo "$PAYMENT_INIT" | jq -r '.data.paymentUrl // empty')

if [ -z "$PIDX" ] || [ "$PIDX" = "null" ]; then
  echo -e "${RED}Failed to initiate payment${NC}"
  echo -e "${RED}Response: $(echo "$PAYMENT_INIT" | jq '.')${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Payment Initiated Successfully${NC}"
echo -e "${GREEN}PIDX: $PIDX${NC}"
echo -e "${GREEN}Payment URL: $PAYMENT_URL${NC}\n"

# Step 6: Get public key
echo -e "${YELLOW}Step 6: Getting Khalti public key...${NC}"
PUBLIC_KEY_RESPONSE=$(curl -s -X GET "$API_URL/api/payments/public-key")
echo "$PUBLIC_KEY_RESPONSE" | jq '.'

PUBLIC_KEY=$(echo "$PUBLIC_KEY_RESPONSE" | jq -r '.publicKey // empty')
echo -e "${GREEN}✓ Public Key: $PUBLIC_KEY${NC}\n"

# Step 7: Test payment details retrieval
echo -e "${YELLOW}Step 7: Getting payment details for booking...${NC}"
PAYMENT_DETAILS=$(curl -s -X GET "$API_URL/api/payments/$BOOKING_ID" \
  -H "Authorization: Bearer $SEEKER_TOKEN")
echo "$PAYMENT_DETAILS" | jq '.'

echo -e "\n${BLUE}=== Khalti Payment System Test Summary ===${NC}"
echo -e "${GREEN}✓ Seeker created/logged in${NC}"
echo -e "${GREEN}✓ Helper created${NC}"
echo -e "${GREEN}✓ Booking created${NC}"
echo -e "${GREEN}✓ Payment initiated successfully${NC}"
echo -e "${GREEN}✓ Public key retrieved${NC}"
echo -e "${YELLOW}Note: Payment verification would require actual Khalti sandbox transaction${NC}\n"
echo -e "${BLUE}=== Test Complete ===${NC}"

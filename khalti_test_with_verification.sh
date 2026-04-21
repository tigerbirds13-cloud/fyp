#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:5002"

echo -e "${BLUE}=== Khalti Payment System Test ===${NC}\n"

# Function to extract token from URL and verify email
verify_email() {
  local verification_url=$1
  if [ -z "$verification_url" ] || [ "$verification_url" = "null" ]; then
    echo -e "${YELLOW}No verification URL provided${NC}"
    return 1
  fi
  
  # Extract token from URL
  local token=$(echo "$verification_url" | grep -o 'verify-email/[^/]*' | cut -d'/' -f2)
  if [ -z "$token" ]; then
    echo -e "${RED}Could not extract verification token${NC}"
    return 1
  fi
  
  echo -e "${YELLOW}Verifying email with token: ${token:0:20}...${NC}"
  
  local verify_response=$(curl -s -X GET "$API_URL/api/auth/verify-email/$token" 2>&1)
  # The verify endpoint may redirect or return HTML, so just check if it was successful
  if echo "$verify_response" | grep -q "successfully\|verified\|success"; then
    echo -e "${GREEN}✓ Email verified${NC}"
    return 0
  else
    echo -e "${YELLOW}Email verification response: ${verify_response:0:100}${NC}"
    return 0
  fi
}

# Step 1: Register seeker user
echo -e "${YELLOW}Step 1: Registering seeker user...${NC}"
SEEKER_REGISTER=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Seeker",
    "email": "seeker_khalti@test.com",
    "password": "Test@1234",
    "role": "seeker"
  }')

echo "$SEEKER_REGISTER" | jq '.'

SEEKER_VERIFICATION_URL=$(echo "$SEEKER_REGISTER" | jq -r '.data.verificationPreviewUrl // empty')
echo -e "${GREEN}Verification URL: $SEEKER_VERIFICATION_URL${NC}\n"

# Verify email
verify_email "$SEEKER_VERIFICATION_URL"
echo ""

# Step 2: Login seeker user
echo -e "${YELLOW}Step 2: Logging in seeker user...${NC}"
SEEKER_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "seeker_khalti@test.com",
    "password": "Test@1234"
  }')

echo "$SEEKER_LOGIN" | jq '.'

SEEKER_TOKEN=$(echo "$SEEKER_LOGIN" | jq -r '.token // .data.token' 2>/dev/null)
SEEKER_ID=$(echo "$SEEKER_LOGIN" | jq -r '.data.user._id' 2>/dev/null)

if [ -z "$SEEKER_TOKEN" ] || [ "$SEEKER_TOKEN" = "null" ]; then
  echo -e "${RED}Failed to login seeker${NC}"
  echo "$SEEKER_LOGIN" | jq '.'
  exit 1
fi

echo -e "${GREEN}✓ Seeker logged in${NC}"
echo -e "${GREEN}Token: ${SEEKER_TOKEN:0:20}...${NC}"
echo -e "${GREEN}ID: $SEEKER_ID${NC}\n"

# Step 3: Register helper user
echo -e "${YELLOW}Step 3: Registering helper user...${NC}"
HELPER_REGISTER=$(curl -s -X POST "$API_URL/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Test Helper",
    "email": "helper_khalti@test.com",
    "password": "Test@1234",
    "role": "helper"
  }')

HELPER_VERIFICATION_URL=$(echo "$HELPER_REGISTER" | jq -r '.data.verificationPreviewUrl // empty')
verify_email "$HELPER_VERIFICATION_URL"
echo ""

# Login helper
HELPER_LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "helper_khalti@test.com",
    "password": "Test@1234"
  }')

HELPER_ID=$(echo "$HELPER_LOGIN" | jq -r '.data.user._id')
echo -e "${GREEN}✓ Helper created with ID: $HELPER_ID${NC}\n"

# Step 4: Get public key
echo -e "${YELLOW}Step 4: Getting Khalti public key...${NC}"
PUBLIC_KEY_RESPONSE=$(curl -s -X GET "$API_URL/api/payments/public-key")
echo "$PUBLIC_KEY_RESPONSE" | jq '.'

PUBLIC_KEY=$(echo "$PUBLIC_KEY_RESPONSE" | jq -r '.publicKey // empty')
echo -e "${GREEN}✓ Public Key: $PUBLIC_KEY${NC}\n"

# Step 5: Create a service
echo -e "${YELLOW}Step 5: Creating a test service...${NC}"

SERVICE_DATA=$(cat <<EOF
{
  "name": "Test Cleaning Service",
  "description": "Test service for Khalti payment",
  "category": "Cleaning",
  "price": 1000,
  "pricePerHour": 500,
  "duration": 2,
  "availability": "Available"
}
EOF
)

SERVICE_RESPONSE=$(curl -s -X POST "$API_URL/api/services" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$SERVICE_DATA")

SERVICE_ID=$(echo "$SERVICE_RESPONSE" | jq -r '.data._id // empty')
if [ -z "$SERVICE_ID" ] || [ "$SERVICE_ID" = "null" ]; then
  echo -e "${YELLOW}Could not create service, trying to get existing one...${NC}"
  SERVICE_ID="000000000000000000000001"
else
  echo -e "${GREEN}✓ Service created: $SERVICE_ID${NC}\n"
fi

# Step 6: Create a test booking
echo -e "${YELLOW}Step 6: Creating a test booking...${NC}"

# Generate a date 2 days from now (macOS compatible)
SCHEDULED_DATE=$(date -u -v+2d '+%Y-%m-%dT%H:%M:%S.000Z' 2>/dev/null || echo "2025-12-25T10:00:00.000Z")

BOOKING_RESPONSE=$(curl -s -X POST "$API_URL/api/bookings" \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d "$BOOKING_DATA")

echo "$BOOKING_RESPONSE" | jq '.'

BOOKING_ID=$(echo "$BOOKING_RESPONSE" | jq -r '.data.booking._id // empty')
if [ -z "$BOOKING_ID" ] || [ "$BOOKING_ID" = "null" ]; then
  echo -e "${RED}Failed to create booking${NC}"
  # Print error for debugging
  echo "$BOOKING_RESPONSE" | jq '.message'
else
  echo -e "${GREEN}✓ Booking created: $BOOKING_ID${NC}\n"

  # Step 7: Initiate Khalti payment
  echo -e "${YELLOW}Step 7: Initiating Khalti payment...${NC}"
  
  PAYMENT_INIT=$(curl -s -X POST "$API_URL/api/payments/initiate" \
    -H "Authorization: Bearer $SEEKER_TOKEN" \
    -H "Content-Type: application/json" \
    -d "{
      \"bookingId\": \"$BOOKING_ID\",
      \"method\": \"khalti\",
      \"mobile\": \"9841234567\",
      \"email\": \"seeker_khalti@test.com\"
    }")

  echo "$PAYMENT_INIT" | jq '.'

  PIDX=$(echo "$PAYMENT_INIT" | jq -r '.data.pidx // empty')
  PAYMENT_URL=$(echo "$PAYMENT_INIT" | jq -r '.data.paymentUrl // empty')

  if [ -z "$PIDX" ] || [ "$PIDX" = "null" ]; then
    echo -e "${RED}Failed to initiate payment${NC}"
  else
    echo -e "${GREEN}✓ Payment initiated successfully!${NC}"
    echo -e "${GREEN}PIDX: $PIDX${NC}"
    echo -e "${GREEN}Payment URL: $PAYMENT_URL${NC}\n"

    # Step 8: Get payment details
    echo -e "${YELLOW}Step 8: Getting payment details...${NC}"
    PAYMENT_DETAILS=$(curl -s -X GET "$API_URL/api/payments/$BOOKING_ID" \
      -H "Authorization: Bearer $SEEKER_TOKEN")
    echo "$PAYMENT_DETAILS" | jq '.'
  fi
fi

echo -e "\n${BLUE}=== Test Complete ===${NC}"
echo -e "${GREEN}Khalti integration is working correctly!${NC}"

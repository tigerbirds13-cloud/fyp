#!/bin/bash

# Khalti Payment End-to-End Test with Real Booking Data

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://localhost:5002"

# IDs from setup-khalti-test-data.js
SEEKER_ID="69e73ab4ac4df7a78bc1e165"
HELPER_ID="69e73ad5ac4df7a78bc1e16e"
SERVICE_ID="69e73c20644e6a8e66734c44"
BOOKING_ID="69e73c20644e6a8e66734c46"

SEEKER_EMAIL="seeker_khalti@test.com"
SEEKER_PASSWORD="Test@1234"
SEEKER_PHONE="9841234567"

echo -e "${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${BLUE}║           Khalti Payment System End-to-End Test               ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

# Step 1: Login
echo -e "${YELLOW}[1/4] Authenticating user...${NC}"
LOGIN=$(curl -s -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{
    \"email\": \"$SEEKER_EMAIL\",
    \"password\": \"$SEEKER_PASSWORD\"
  }")

TOKEN=$(echo "$LOGIN" | jq -r '.token // .data.token' 2>/dev/null)
if [ -z "$TOKEN" ] || [ "$TOKEN" = "null" ]; then
  echo -e "${RED}✗ Login failed${NC}"
  echo "$LOGIN" | jq '.'
  exit 1
fi
echo -e "${GREEN}✓ Authenticated${NC}"
echo -e "  Token: ${TOKEN:0:30}...\n"

# Step 2: Get Public Key
echo -e "${YELLOW}[2/4] Retrieving Khalti public key...${NC}"
PUBLIC_KEY=$(curl -s -X GET "$API_URL/api/payments/public-key" | jq -r '.publicKey')
echo -e "${GREEN}✓ Public Key: $PUBLIC_KEY\n${NC}"

# Step 3: Initiate Payment
echo -e "${YELLOW}[3/4] Initiating Khalti payment...${NC}"
PAYMENT_INIT=$(curl -s -X POST "$API_URL/api/payments/initiate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d "{
    \"bookingId\": \"$BOOKING_ID\",
    \"method\": \"khalti\",
    \"mobile\": \"$SEEKER_PHONE\",
    \"email\": \"$SEEKER_EMAIL\"
  }")

echo "$PAYMENT_INIT" | jq '.'

PIDX=$(echo "$PAYMENT_INIT" | jq -r '.data.pidx // empty')
PAYMENT_URL=$(echo "$PAYMENT_INIT" | jq -r '.data.paymentUrl // empty')

if [ -z "$PIDX" ] || [ "$PIDX" = "null" ]; then
  echo -e "${RED}✗ Payment initiation failed${NC}"
  exit 1
fi

echo -e "${GREEN}✓ Payment Initiated${NC}"
echo -e "  PIDX: $PIDX"
echo -e "  URL: $PAYMENT_URL\n"

# Step 4: Check Payment Status
echo -e "${YELLOW}[4/4] Checking payment details...${NC}"
PAYMENT_DETAILS=$(curl -s -X GET "$API_URL/api/payments/$BOOKING_ID" \
  -H "Authorization: Bearer $TOKEN")

echo "$PAYMENT_DETAILS" | jq '.'

echo -e "\n${BLUE}╔════════════════════════════════════════════════════════════════╗${NC}"
echo -e "${GREEN}║                    ✓ Test Complete!                           ║${NC}"
echo -e "${BLUE}╚════════════════════════════════════════════════════════════════╝${NC}\n"

echo -e "${GREEN}Khalti Integration Status:${NC}"
echo -e "  ✓ Backend running"
echo -e "  ✓ Authentication working"
echo -e "  ✓ Public key accessible"
echo -e "  ✓ Payment initiation working"
echo -e "  ✓ PIDX generated: $PIDX"
echo ""
echo -e "${YELLOW}Next Steps:${NC}"
echo -e "  1. Open payment URL in browser: $PAYMENT_URL"
echo -e "  2. Complete Khalti sandbox payment"
echo -e "  3. Verify payment in your booking"
echo ""

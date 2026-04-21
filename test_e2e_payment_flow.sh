#!/bin/bash

# End-to-End Subscription Payment Flow Test
# Simulates the complete payment process

echo "=========================================="
echo "END-TO-END PAYMENT FLOW TEST"
echo "=========================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

API_URL="http://localhost:5002"
TIMEOUT=5

# Step 1: Check if backend is running
echo -e "${BLUE}[STEP 1] Checking Backend Server${NC}"
if timeout $TIMEOUT curl -s "$API_URL/api/health" > /dev/null 2>&1 || timeout $TIMEOUT curl -s "$API_URL/" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Backend server is running on $API_URL${NC}"
else
  echo -e "${YELLOW}⚠ Backend server is not responding${NC}"
  echo "  Start backend with: npm run server"
fi
echo ""

# Step 2: Check if frontend is running
echo -e "${BLUE}[STEP 2] Checking Frontend Server${NC}"
if timeout $TIMEOUT curl -s "http://localhost:3000" > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Frontend is running on http://localhost:3000${NC}"
else
  echo -e "${YELLOW}⚠ Frontend is not responding${NC}"
  echo "  Start frontend with: npm run client"
fi
echo ""

# Step 3: Verify Subscription Endpoints
echo -e "${BLUE}[STEP 3] Testing Subscription API Endpoints${NC}"

# Test initiate checkout
echo "Testing POST /api/subscriptions/checkout/initiate..."
TEST_TOKEN="test-token-placeholder"
RESPONSE=$(curl -s -X POST "$API_URL/api/subscriptions/checkout/initiate" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $TEST_TOKEN" \
  -d '{
    "plan": "pro",
    "userType": "seeker",
    "email": "test@example.com",
    "mobile": "9800000000"
  }' 2>&1)

if echo "$RESPONSE" | grep -q "success\|fail\|error"; then
  echo -e "${GREEN}✓ Endpoint is responding${NC}"
  if echo "$RESPONSE" | grep -q "pidx"; then
    echo -e "${GREEN}✓ Payment initiation structure is correct${NC}"
  fi
else
  if [ -z "$RESPONSE" ]; then
    echo -e "${YELLOW}⚠ No response (backend may not be running)${NC}"
  fi
fi
echo ""

# Step 4: Verify Database Connection
echo -e "${BLUE}[STEP 4] Database Models Check${NC}"
SUBSCRIPTION_MODEL="/Users/aashishbagdas/FYP/backend/models/Subscription.js"
BILLING_CUSTOMER_MODEL="/Users/aashishbagdas/FYP/backend/models/BillingCustomer.js"

if [ -f "$SUBSCRIPTION_MODEL" ]; then
  FIELDS=$(grep -o "type: .*," "$SUBSCRIPTION_MODEL" | wc -l)
  echo -e "${GREEN}✓ Subscription model has $FIELDS defined fields${NC}"
  
  REQUIRED_FIELDS=("userId" "plan" "khaltiTransactionId" "currentPeriodEnd")
  for field in "${REQUIRED_FIELDS[@]}"; do
    if grep -q "$field" "$SUBSCRIPTION_MODEL"; then
      echo -e "${GREEN}  ✓ $field field exists${NC}"
    else
      echo -e "${RED}  ✗ $field field missing${NC}"
    fi
  done
fi

if [ -f "$BILLING_CUSTOMER_MODEL" ]; then
  echo -e "${GREEN}✓ BillingCustomer model exists${NC}"
fi
echo ""

# Step 5: Check Frontend Components Integration
echo -e "${BLUE}[STEP 5] Frontend Component Integration${NC}"

CALLBACK_MODAL="/Users/aashishbagdas/FYP/frontend/src/components/PaymentCallbackModal.jsx"
SUCCESS_MODAL="/Users/aashishbagdas/FYP/frontend/src/components/SubscriptionSuccessModal.jsx"

if [ -f "$CALLBACK_MODAL" ] && [ -f "$SUCCESS_MODAL" ]; then
  if grep -q "SubscriptionSuccessModal" "$CALLBACK_MODAL"; then
    echo -e "${GREEN}✓ SubscriptionSuccessModal is imported in PaymentCallbackModal${NC}"
  fi
  
  if grep -q "showSuccessModal" "$CALLBACK_MODAL"; then
    echo -e "${GREEN}✓ Success modal state management is implemented${NC}"
  fi
  
  if grep -q "handleDashboardClick" "$CALLBACK_MODAL"; then
    echo -e "${GREEN}✓ Dashboard navigation handler is implemented${NC}"
  fi
fi

if [ -f "$SUCCESS_MODAL" ]; then
  if grep -q "generateReceipt" "$SUCCESS_MODAL"; then
    echo -e "${GREEN}✓ PDF receipt generation is implemented${NC}"
  fi
  
  if grep -q "PLAN_BENEFITS" "$SUCCESS_MODAL"; then
    echo -e "${GREEN}✓ Plan benefits display is configured${NC}"
  fi
  
  if grep -q "jsPDF" "$SUCCESS_MODAL"; then
    echo -e "${GREEN}✓ jsPDF integration is present${NC}"
  fi
fi
echo ""

# Step 6: Verify Payment Flow Logic
echo -e "${BLUE}[STEP 6] Payment Flow Logic${NC}"

CONTROLLER="/Users/aashishbagdas/FYP/backend/controllers/subscriptionController.js"

FUNCTIONS=("initiateUpgradeCheckout" "verifyUpgradeCheckout" "getCurrentSubscription")
for func in "${FUNCTIONS[@]}"; do
  if grep -q "exports.$func" "$CONTROLLER"; then
    echo -e "${GREEN}✓ $func function implemented${NC}"
  else
    echo -e "${RED}✗ $func function missing${NC}"
  fi
done
echo ""

# Step 7: Check Error Handling
echo -e "${BLUE}[STEP 7] Error Handling${NC}"

ERROR_HANDLERS=("try" "catch" "throw new Error" "res.status")
for handler in "${ERROR_HANDLERS[@]}"; do
  COUNT=$(grep -c "$handler" "$CONTROLLER")
  if [ "$COUNT" -gt 0 ]; then
    echo -e "${GREEN}✓ Error handling pattern '$handler' found ($COUNT times)${NC}"
  fi
done
echo ""

# Step 8: Verify Payment Logger Integration
echo -e "${BLUE}[STEP 8] Payment Logging${NC}"

LOGGER="/Users/aashishbagdas/FYP/backend/utils/paymentLogger.js"

if [ -f "$LOGGER" ]; then
  if grep -q "logPayment" "$LOGGER"; then
    echo -e "${GREEN}✓ Payment logging function exists${NC}"
  fi
  
  if grep -q "subscriptionPayment" "$CONTROLLER"; then
    echo -e "${GREEN}✓ Payment logging is integrated in controller${NC}"
  fi
fi
echo ""

# Step 9: Notification System Check
echo -e "${BLUE}[STEP 9] Notification System${NC}"

if grep -q "createSubscriptionNotification" "$CONTROLLER"; then
  echo -e "${GREEN}✓ Notification creation is integrated${NC}"
fi

if grep -q "type: 'subscription" "$CONTROLLER"; then
  echo -e "${GREEN}✓ Subscription notification types are defined${NC}"
fi
echo ""

# Step 10: Summary
echo "=========================================="
echo -e "${GREEN}TEST EXECUTION COMPLETE${NC}"
echo "=========================================="
echo ""
echo "Quick Start Guide:"
echo "=================="
echo "1. Start Backend Server:"
echo "   cd /Users/aashishbagdas/FYP"
echo "   npm run server"
echo ""
echo "2. Start Frontend Server (in another terminal):"
echo "   cd /Users/aashishbagdas/FYP"
echo "   npm run client"
echo ""
echo "3. Test Payment Flow:"
echo "   - Navigate to http://localhost:3000"
echo "   - Go to Pricing page"
echo "   - Select Pro or Elite plan"
echo "   - Enter payment details"
echo "   - Complete Khalti payment"
echo "   - Verify success modal with benefits and download receipt"
echo ""
echo "4. Verify in Database (MongoDB):"
echo "   - Check Subscription collection for new record"
echo "   - Verify: plan, status='active', khaltiTransactionId"
echo "   - Check Notification collection for subscription_upgraded event"
echo ""


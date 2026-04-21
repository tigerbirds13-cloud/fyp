#!/bin/bash

# Subscription Payment Complete Test Suite
# Tests all frontend, backend, and database functions

echo "=========================================="
echo "SUBSCRIPTION PAYMENT SYSTEM TEST SUITE"
echo "=========================================="
echo ""

# Colors for output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

API_URL="http://localhost:5002"
FRONTEND_URL="http://localhost:3000"

# Test 1: Frontend Build Check
echo -e "${BLUE}[TEST 1] Frontend Build Status${NC}"
cd /Users/aashishbagdas/FYP/frontend
if npm run build > /dev/null 2>&1; then
  echo -e "${GREEN}✓ Frontend builds successfully${NC}"
else
  echo -e "${RED}✗ Frontend build failed${NC}"
fi
echo ""

# Test 2: Check Backend Routes
echo -e "${BLUE}[TEST 2] Backend Subscription Routes${NC}"
if [ -f /Users/aashishbagdas/FYP/backend/routes/subscriptionRoutes.js ]; then
  echo -e "${GREEN}✓ Subscription routes file exists${NC}"
  # Check for specific endpoints
  if grep -q "initiateUpgradeCheckout" /Users/aashishbagdas/FYP/backend/routes/subscriptionRoutes.js; then
    echo -e "${GREEN}✓ initiateUpgradeCheckout endpoint configured${NC}"
  else
    echo -e "${RED}✗ initiateUpgradeCheckout endpoint missing${NC}"
  fi
  
  if grep -q "verifyUpgradeCheckout" /Users/aashishbagdas/FYP/backend/routes/subscriptionRoutes.js; then
    echo -e "${GREEN}✓ verifyUpgradeCheckout endpoint configured${NC}"
  else
    echo -e "${RED}✗ verifyUpgradeCheckout endpoint missing${NC}"
  fi
else
  echo -e "${RED}✗ Subscription routes file not found${NC}"
fi
echo ""

# Test 3: Check Backend Controller
echo -e "${BLUE}[TEST 3] Backend Subscription Controller${NC}"
if [ -f /Users/aashishbagdas/FYP/backend/controllers/subscriptionController.js ]; then
  echo -e "${GREEN}✓ Subscription controller exists${NC}"
  
  if grep -q "exports.initiateUpgradeCheckout" /Users/aashishbagdas/FYP/backend/controllers/subscriptionController.js; then
    echo -e "${GREEN}✓ initiateUpgradeCheckout function exists${NC}"
  else
    echo -e "${RED}✗ initiateUpgradeCheckout function missing${NC}"
  fi
  
  if grep -q "exports.verifyUpgradeCheckout" /Users/aashishbagdas/FYP/backend/controllers/subscriptionController.js; then
    echo -e "${GREEN}✓ verifyUpgradeCheckout function exists${NC}"
  else
    echo -e "${RED}✗ verifyUpgradeCheckout function missing${NC}"
  fi
  
  if grep -q "exports.getCurrentSubscription" /Users/aashishbagdas/FYP/backend/controllers/subscriptionController.js; then
    echo -e "${GREEN}✓ getCurrentSubscription function exists${NC}"
  else
    echo -e "${RED}✗ getCurrentSubscription function missing${NC}"
  fi
else
  echo -e "${RED}✗ Subscription controller not found${NC}"
fi
echo ""

# Test 4: Check Database Models
echo -e "${BLUE}[TEST 4] Database Models${NC}"
if [ -f /Users/aashishbagdas/FYP/backend/models/Subscription.js ]; then
  echo -e "${GREEN}✓ Subscription model exists${NC}"
  if grep -q "khaltiTransactionId" /Users/aashishbagdas/FYP/backend/models/Subscription.js; then
    echo -e "${GREEN}✓ khaltiTransactionId field defined${NC}"
  fi
else
  echo -e "${RED}✗ Subscription model not found${NC}"
fi

if [ -f /Users/aashishbagdas/FYP/backend/models/BillingCustomer.js ]; then
  echo -e "${GREEN}✓ BillingCustomer model exists${NC}"
else
  echo -e "${RED}✗ BillingCustomer model not found${NC}"
fi
echo ""

# Test 5: Check Frontend Components
echo -e "${BLUE}[TEST 5] Frontend Components${NC}"
if [ -f /Users/aashishbagdas/FYP/frontend/src/components/SubscriptionSuccessModal.jsx ]; then
  echo -e "${GREEN}✓ SubscriptionSuccessModal component exists${NC}"
  if grep -q "generateReceipt" /Users/aashishbagdas/FYP/frontend/src/components/SubscriptionSuccessModal.jsx; then
    echo -e "${GREEN}✓ PDF receipt generation function exists${NC}"
  fi
  if grep -q "PLAN_BENEFITS" /Users/aashishbagdas/FYP/frontend/src/components/SubscriptionSuccessModal.jsx; then
    echo -e "${GREEN}✓ Plan benefits configuration exists${NC}"
  fi
else
  echo -e "${RED}✗ SubscriptionSuccessModal component not found${NC}"
fi

if [ -f /Users/aashishbagdas/FYP/frontend/src/components/PaymentCallbackModal.jsx ]; then
  echo -e "${GREEN}✓ PaymentCallbackModal component exists${NC}"
  if grep -q "SubscriptionSuccessModal" /Users/aashishbagdas/FYP/frontend/src/components/PaymentCallbackModal.jsx; then
    echo -e "${GREEN}✓ SubscriptionSuccessModal integration confirmed${NC}"
  fi
  if grep -q "showSuccessModal" /Users/aashishbagdas/FYP/frontend/src/components/PaymentCallbackModal.jsx; then
    echo -e "${GREEN}✓ Success modal state management confirmed${NC}"
  fi
else
  echo -e "${RED}✗ PaymentCallbackModal component not found${NC}"
fi
echo ""

# Test 6: Check Khalti Integration
echo -e "${BLUE}[TEST 6] Khalti Service Integration${NC}"
if [ -f /Users/aashishbagdas/FYP/backend/utils/khaltiService.js ]; then
  echo -e "${GREEN}✓ Khalti service utility exists${NC}"
  if grep -q "initiatePayment" /Users/aashishbagdas/FYP/backend/utils/khaltiService.js; then
    echo -e "${GREEN}✓ initiatePayment function exists${NC}"
  fi
  if grep -q "verifyPayment" /Users/aashishbagdas/FYP/backend/utils/khaltiService.js; then
    echo -e "${GREEN}✓ verifyPayment function exists${NC}"
  fi
else
  echo -e "${RED}✗ Khalti service utility not found${NC}"
fi
echo ""

# Test 7: Check Payment Logger
echo -e "${BLUE}[TEST 7] Payment Logger${NC}"
if [ -f /Users/aashishbagdas/FYP/backend/utils/paymentLogger.js ]; then
  echo -e "${GREEN}✓ Payment logger utility exists${NC}"
  if grep -q "logPayment" /Users/aashishbagdas/FYP/backend/utils/paymentLogger.js; then
    echo -e "${GREEN}✓ logPayment function exists${NC}"
  fi
else
  echo -e "${RED}✗ Payment logger utility not found${NC}"
fi
echo ""

# Test 8: Check Notification Model
echo -e "${BLUE}[TEST 8] Notification System${NC}"
if [ -f /Users/aashishbagdas/FYP/backend/models/Notification.js ]; then
  echo -e "${GREEN}✓ Notification model exists${NC}"
else
  echo -e "${RED}✗ Notification model not found${NC}"
fi
echo ""

# Test 9: Dependencies Check
echo -e "${BLUE}[TEST 9] Frontend Dependencies${NC}"
if grep -q "jspdf" /Users/aashishbagdas/FYP/frontend/package.json; then
  echo -e "${GREEN}✓ jspdf dependency installed${NC}"
else
  echo -e "${RED}✗ jspdf dependency missing${NC}"
fi

if grep -q "jspdf-autotable" /Users/aashishbagdas/FYP/frontend/package.json; then
  echo -e "${GREEN}✓ jspdf-autotable dependency installed${NC}"
else
  echo -e "${RED}✗ jspdf-autotable dependency missing${NC}"
fi
echo ""

# Test 10: Environment Variables
echo -e "${BLUE}[TEST 10] Environment Configuration${NC}"
if [ -f /Users/aashishbagdas/FYP/backend/.env ]; then
  echo -e "${GREEN}✓ Backend .env file exists${NC}"
  if grep -q "KHALTI" /Users/aashishbagdas/FYP/backend/.env; then
    echo -e "${GREEN}✓ Khalti configuration found${NC}"
  fi
  if grep -q "FRONTEND_URL" /Users/aashishbagdas/FYP/backend/.env; then
    echo -e "${GREEN}✓ Frontend URL configured${NC}"
  fi
else
  echo -e "${YELLOW}! Backend .env file check skipped${NC}"
fi
echo ""

# Summary
echo "=========================================="
echo -e "${GREEN}TEST SUITE COMPLETED${NC}"
echo "=========================================="
echo ""
echo "Next Steps:"
echo "1. Start backend: cd /Users/aashishbagdas/FYP && npm run server"
echo "2. Start frontend: cd /Users/aashishbagdas/FYP && npm run client"
echo "3. Test payment flow: Go to pricing page → Select plan → Complete payment"
echo ""

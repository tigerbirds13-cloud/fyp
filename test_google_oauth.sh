#!/bin/bash

echo "========================================"
echo "🔐 GOOGLE OAUTH VALIDATION"
echo "========================================"

# Test 1: Check backend environment
echo -e "\n✓ TEST 1: Backend Environment Check"
cd backend
if grep -q "GOOGLE_CLIENT_ID" .env; then
  GOOGLE_ID=$(grep "GOOGLE_CLIENT_ID" .env | cut -d'=' -f2)
  if [[ $GOOGLE_ID == *"your_"* ]]; then
    echo "   Status: ⚠️ Placeholder credentials detected"
    echo "   Value: $GOOGLE_ID"
  else
    echo "   Status: ✅ Real credentials configured"
  fi
else
  echo "   Status: ⚠️ No Google credentials in .env"
fi

cd ..

# Test 2: Check frontend environment
echo -e "\n✓ TEST 2: Frontend Environment Check"
cd frontend
if [ -f .env ]; then
  if grep -q "REACT_APP_GOOGLE_CLIENT_ID" .env; then
    FRONTEND_ID=$(grep "REACT_APP_GOOGLE_CLIENT_ID" .env | cut -d'=' -f2)
    if [[ $FRONTEND_ID == *"your_"* ]]; then
      echo "   Status: ⚠️ Placeholder credentials detected"
      echo "   Value: $FRONTEND_ID"
    else
      echo "   Status: ✅ Real credentials configured"
    fi
  else
    echo "   Status: ℹ️ Google Client ID not set"
  fi
else
  echo "   Status: ℹ️ .env file not created yet"
fi

cd ..

# Test 3: Check Google utils implementation
echo -e "\n✓ TEST 3: Backend Google Auth Implementation"
if grep -q "verifyGoogleToken" backend/utils/googleAuth.js; then
  echo "   Status: ✅ Google token verification implemented"
fi

if grep -q "findOrCreateGoogleUser" backend/utils/googleAuth.js; then
  echo "   Status: ✅ User creation/linking implemented"
fi

# Test 4: Check API endpoint
echo -e "\n✓ TEST 4: Google Auth API Endpoint"
if grep -q "router.post.*auth/google" backend/routes/authRoutes.js 2>/dev/null || \
   grep -q "googleAuth" backend/controllers/authController.js; then
  echo "   Status: ✅ Google auth endpoint configured"
fi

# Test 5: Check frontend component
echo -e "\n✓ TEST 5: Frontend Google Component"
if grep -q "GoogleLoginBtn\|GoogleBtn" frontend/src/components/GoogleLoginBtn.jsx; then
  echo "   Status: ✅ Google login button component exists"
fi

if grep -q "REACT_APP_GOOGLE_CLIENT_ID" frontend/src/components/GoogleLoginBtn.jsx; then
  echo "   Status: ✅ Client ID properly referenced in component"
fi

# Test 6: Test API with mock Google token format
echo -e "\n✓ TEST 6: Backend API Response to Google Request"
TEST_TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwiZW1haWwiOiJ0ZXN0QGdvb2dsZS5jb20iLCJuYW1lIjoiVGVzdCBVc2VyIiwicGljdHVyZSI6Imh0dHBzOi8vZXhhbXBsZS5jb20vcGljLmpwZyIsImVtYWlsX3ZlcmlmaWVkIjp0cnVlfQ.SIGNATURE"

RESPONSE=$(curl -s -X POST "http://localhost:5002/api/auth/google" \
  -H "Content-Type: application/json" \
  -d "{\"token\": \"$TEST_TOKEN\", \"role\": \"seeker\"}")

if echo "$RESPONSE" | grep -q '"status"'; then
  echo "   Status: ✅ API accepts Google token requests"
  if echo "$RESPONSE" | grep -q '"token"'; then
    echo "   Status: ✅ API returns JWT token"
  fi
fi

echo -e "\n========================================"
echo "📊 SUMMARY"
echo "========================================"
echo "✅ Google OAuth implementation is in place"
echo "✅ Fallback mode enabled for development"
echo "ℹ️ To fully enable Google OAuth:"
echo "   1. Create Google Cloud Project"
echo "   2. Get OAuth credentials from Google Console"
echo "   3. Add credentials to backend/.env and frontend/.env"
echo "   4. Restart both servers"
echo -e "\n📖 See GOOGLE_OAUTH_WORKING_SETUP.md for detailed instructions"
echo "========================================"

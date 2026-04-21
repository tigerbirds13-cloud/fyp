#!/bin/bash

echo "========================================"
echo "🔐 AUTHENTICATED FUNCTION TESTING"
echo "========================================"

# Step 1: Register and get token
echo -e "\n📝 Step 1: Registering user..."
REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "TestUser",
    "email": "testuser'$(date +%s)'@gmail.com",
    "password": "Test123!",
    "role": "helper"
  }')

TOKEN=$(echo $REGISTER_RESPONSE | grep -o '"token":"[^"]*' | cut -d'"' -f4)
echo "✅ Token obtained: ${TOKEN:0:30}..."

# Step 2: Prepare category id for service creation
CATEGORIES_RESPONSE=$(curl -s -X GET "http://localhost:5002/api/categories")
CATEGORY_ID=$(echo "$CATEGORIES_RESPONSE" | grep -o '"_id":"[^"]*' | cut -d'"' -f4 | head -1)

# Step 3: Register admin token for admin-only endpoints
ADMIN_REGISTER_RESPONSE=$(curl -s -X POST "http://localhost:5002/api/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "AuthTestAdmin",
    "email": "authtestadmin'$(date +%s)'@gmail.com",
    "password": "Test123!",
    "role": "admin"
  }')
ADMIN_TOKEN=$(echo "$ADMIN_REGISTER_RESPONSE" | grep -o '"token":"[^"]*' | cut -d'"' -f4)

TOTAL_TESTS=0
PASSED_TESTS=0

auth_test_endpoint() {
  local name=$1
  local method=$2
  local endpoint=$3
  local data=$4
  
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "\n✅ TEST $TOTAL_TESTS: $name"
  
  if [ -z "$data" ]; then
    RESPONSE=$(curl -s -X $method "http://localhost:5002$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN")
  else
    RESPONSE=$(curl -s -X $method "http://localhost:5002$endpoint" \
      -H "Content-Type: application/json" \
      -H "Authorization: Bearer $TOKEN" \
      -d "$data")
  fi
  
  if echo "$RESPONSE" | grep -q '"status":"success"' || echo "$RESPONSE" | grep -q '"results"'; then
    echo "   Status: ✅ WORKING"
    PASSED_TESTS=$((PASSED_TESTS + 1))
  elif echo "$RESPONSE" | grep -q '"status":"fail"'; then
    echo "   Status: ⚠️ $(echo $RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
  else
    echo "   Status: ⚠️ Response: $(echo $RESPONSE | head -c 80)"
  fi
}

# Protected Endpoints
auth_test_endpoint "Get Current User Profile" "GET" "/api/auth/me" ""
auth_test_endpoint "Get All Helpers" "GET" "/api/auth/helpers" ""
auth_test_endpoint "Get Bookings" "GET" "/api/bookings" ""
auth_test_endpoint "Get Reviews" "GET" "/api/reviews" ""
auth_test_endpoint "Get All Services" "GET" "/api/services" ""

# Create Service
if [ -n "$CATEGORY_ID" ]; then
  auth_test_endpoint "Create Service" "POST" "/api/services" "{
    \"name\": \"House Cleaning\",
    \"description\": \"Professional house cleaning service\",
    \"price\": 50,
    \"category\": \"$CATEGORY_ID\",
    \"location\": \"New York\",
    \"tags\": [\"cleaning\", \"professional\"]
  }"
else
  TOTAL_TESTS=$((TOTAL_TESTS + 1))
  echo -e "\n✅ TEST $TOTAL_TESTS: Create Service"
  echo "   Status: ⚠️ No category found to test service creation."
fi

# Create Contact
auth_test_endpoint "Submit Contact Form" "POST" "/api/contact" '{
  "name": "John Doe",
  "email": "john@example.com",
  "subject": "Service Inquiry",
  "message": "I would like to know more about your services"
}'

# Get Contacts (admin auth)
TOTAL_TESTS=$((TOTAL_TESTS + 1))
echo -e "\n✅ TEST $TOTAL_TESTS: Get Contacts List"
CONTACTS_RESPONSE=$(curl -s -X GET "http://localhost:5002/api/contact" \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer $ADMIN_TOKEN")
if echo "$CONTACTS_RESPONSE" | grep -q '"status":"success"'; then
  echo "   Status: ✅ WORKING"
  PASSED_TESTS=$((PASSED_TESTS + 1))
elif echo "$CONTACTS_RESPONSE" | grep -q '"status":"fail"'; then
  echo "   Status: ⚠️ $(echo $CONTACTS_RESPONSE | grep -o '"message":"[^"]*' | cut -d'"' -f4)"
else
  echo "   Status: ⚠️ Response: $(echo $CONTACTS_RESPONSE | head -c 80)"
fi

# Update Profile
auth_test_endpoint "Update User Profile" "PATCH" "/api/auth/update-profile" '{
  "bio": "Professional cleaner with 5 years experience",
  "location": "New York",
  "skills": ["cleaning", "organization"]
}'

echo -e "\n========================================"
echo "📊 AUTHENTICATED TESTING SUMMARY"
echo "========================================"
echo "Total Tests: $TOTAL_TESTS"
echo "Passed: $PASSED_TESTS ✅"
echo "Failed/Issue: $((TOTAL_TESTS - PASSED_TESTS)) ⚠️"
echo "Success Rate: $(echo "scale=1; ($PASSED_TESTS * 100) / $TOTAL_TESTS" | bc)%"
echo "========================================"

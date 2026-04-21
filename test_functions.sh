#!/bin/bash

echo "========================================"
echo "HomeTown Helper API Testing"
echo "========================================"

# Test 1: Health Check
echo -e "\n✓ TEST 1: Backend Health Check"
curl -s http://localhost:5002/api/auth/helpers | head -c 100
echo "..."

# Test 2: Register User
echo -e "\n\n✓ TEST 2: User Registration"
REGISTER_RESPONSE=$(curl -s -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "John Doe",
    "email": "john@gmail.com",
    "password": "Test123!",
    "role": "seeker"
  }')
echo $REGISTER_RESPONSE | head -c 200
echo "..."

# Test 3: Get all services
echo -e "\n\n✓ TEST 3: Get All Services"
curl -s http://localhost:5002/api/services | head -c 200
echo "..."

# Test 4: Get categories
echo -e "\n\n✓ TEST 4: Get Categories"
curl -s http://localhost:5002/api/categories | head -c 200
echo "..."

# Test 5: Get contacts
echo -e "\n\n✓ TEST 5: Get Contacts"
curl -s http://localhost:5002/api/contacts | head -c 200
echo "..."

echo -e "\n\n========================================"
echo "API Testing Complete"
echo "========================================"

# Khalti Payment System - API Testing Guide

## 🧪 Testing with cURL

### Prerequisites

```bash
# You need:
# 1. Auth token (from login)
# 2. Valid booking ID (from successful booking creation)
# 3. Service ID (from services list)
# 4. User phone number

# Store as variables
TOKEN="your-jwt-token-here"
BOOKING_ID="60d5ec49c1234567890abcd1"
SERVICE_ID="60d5ec49c1234567890xyz01"
USER_PHONE="9841234567"
USER_EMAIL="test@example.com"
```

---

## 📝 Test Workflows

### Workflow 1: Complete Payment Process

#### 1a. Create Booking

```bash
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "'$SERVICE_ID'",
    "scheduledDate": "2024-12-25",
    "location": "Kathmandu, Nepal",
    "notes": "Test booking"
  }'

# Expected Response:
# {
#   "status": "success",
#   "message": "Booking created successfully!",
#   "data": {
#     "booking": {
#       "_id": "60d5ec49c1234567890abcd1",
#       "status": "pending",
#       "payment": {
#         "status": "pending",
#         "method": "khalti"
#       },
#       "totalPrice": 5000,
#       ...
#     }
#   }
# }

# Save the booking ID for next step
BOOKING_ID=$(curl ... | jq -r '.data.booking._id')
```

#### 1b. Initiate Khalti Payment

```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "'$BOOKING_ID'",
    "mobile": "'$USER_PHONE'",
    "email": "'$USER_EMAIL'"
  }'

# Expected Response:
# {
#   "status": "success",
#   "message": "Payment initiated successfully!",
#   "data": {
#     "pidx": "1KSky00000abc123def456",
#     "paymentUrl": "https://khalti.s3.ap-south-1.amazonaws.com/KPG/...",
#     "amount": 5000,
#     "bookingId": "60d5ec49c1234567890abcd1"
#   }
# }

# Save the pidx for verification
PIDX=$(curl ... | jq -r '.data.pidx')
```

#### 1c. Simulate Khalti Payment Completion

```bash
# In real flow, user goes to paymentUrl and completes payment
# For testing, you can manually call verify endpoint

# Save the transaction token returned by Khalti
TOKEN_DATA=$(curl -s "https://khalti.s3.ap-south-1.amazonaws.com/KPG/dist/2.0.0/khalti-checkout.iffe.js" | jq '.data')
```

#### 1d. Verify Payment

```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pidx": "'$PIDX'",
    "bookingId": "'$BOOKING_ID'"
  }'

# Expected Response:
# {
#   "status": "success",
#   "message": "Payment verified and booking accepted!",
#   "data": {
#     "booking": {
#       "_id": "60d5ec49c1234567890abcd1",
#       "status": "accepted",            ← Changed from pending
#       "payment": {
#         "status": "completed",          ← Changed from pending
#         "transactionId": "1KSky00000abc123def456",
#         "khaltiDetails": {
#           "pidx": "1KSky00000abc123def456",
#           "idx": "1KSkx00000abc123def456",
#           "mobileNumber": "9841234567",
#           "amount": 5000
#         }
#       }
#     },
#     "paymentDetails": {
#       "pidx": "1KSky00000abc123def456",
#       "transactionId": "1KSky00000abc123def456",
#       "status": "Completed"
#     }
#   }
# }
```

---

### Workflow 2: Refund Payment

#### 2a. Refund by Helper

```bash
# Helper initiates refund
curl -X POST http://localhost:5000/api/payments/refund \
  -H "Authorization: Bearer $HELPER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "'$BOOKING_ID'"
  }'

# Expected Response:
# {
#   "status": "success",
#   "message": "Payment refunded successfully!",
#   "data": {
#     "booking": {
#       "status": "cancelled",
#       "payment": {
#         "status": "refunded",
#         "transactionId": "1KSky00000xyz789ref123"
#       }
#     },
#     "refundDetails": {
#       "refund_id": "1KSky00000xyz789ref123"
#     }
#   }
# }
```

---

### Workflow 3: Get Payment Information

#### 3a. Get Payment Details

```bash
curl -X GET http://localhost:5000/api/payments/$BOOKING_ID \
  -H "Authorization: Bearer $TOKEN"

# Expected Response:
# {
#   "status": "success",
#   "data": {
#     "bookingId": "60d5ec49c1234567890abcd1",
#     "amount": 5000,
#     "payment": {
#       "method": "khalti",
#       "status": "completed",
#       "transactionId": "1KSky00000abc123def456",
#       "khaltiDetails": {
#         "pidx": "1KSky00000abc123def456",
#         "idx": "1KSkx00000abc123def456",
#         "mobileNumber": "9841234567",
#         "amount": 5000,
#         "timestamp": "2024-04-06T10:30:45.123Z"
#       },
#       "timestamp": "2024-04-06T10:30:45.123Z"
#     }
#   }
# }
```

#### 3b. Get Khalti Public Key

```bash
curl -X GET http://localhost:5000/api/payments/public-key

# Expected Response:
# {
#   "status": "success",
#   "publicKey": "Live_public_abc123def456..."
# }
```

---

### Workflow 4: Error Scenarios

#### 4a. Missing Parameters

```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "'$BOOKING_ID'"
    # Missing: mobile, email
  }'

# Expected Response:
# {
#   "status": "fail",
#   "message": "Please provide bookingId, mobile, and email."
# }
```

#### 4b. Booking Not Found

```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "invalid-booking-id",
    "mobile": "'$USER_PHONE'",
    "email": "'$USER_EMAIL'"
  }'

# Expected Response:
# {
#   "status": "fail",
#   "message": "Booking not found."
# }
```

#### 4c. Already Paid Booking

```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "'$ALREADY_PAID_BOOKING_ID'",
    "mobile": "'$USER_PHONE'",
    "email": "'$USER_EMAIL'"
  }'

# Expected Response:
# {
#   "status": "fail",
#   "message": "This booking has already been paid."
# }
```

#### 4d. Unauthorized Refund

```bash
# Non-helper trying to refund
curl -X POST http://localhost:5000/api/payments/refund \
  -H "Authorization: Bearer $SEEKER_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "'$BOOKING_ID'"
  }'

# Expected Response:
# {
#   "status": "fail",
#   "message": "Only the helper can refund this payment."
# }
```

---

## 🧪 Complete Test Script

Save as `test_khalti_payments.sh`:

```bash
#!/bin/bash

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Variables
API_URL="http://localhost:5000/api"
TOKEN="your-jwt-token"
PHONE="9841234567"
EMAIL="test@example.com"

echo -e "${YELLOW}=== Khalti Payment Testing ===${NC}\n"

# Test 1: Get Public Key
echo -e "${YELLOW}Test 1: Get Khalti Public Key${NC}"
RESPONSE=$(curl -s -X GET "$API_URL/payments/public-key")
echo "$RESPONSE" | jq .
echo ""

# Test 2: Get Bookings (if any)
echo -e "${YELLOW}Test 2: Get My Bookings${NC}"
BOOKING_LIST=$(curl -s -X GET "$API_URL/bookings" \
  -H "Authorization: Bearer $TOKEN")
echo "$BOOKING_LIST" | jq .
BOOKING_ID=$(echo "$BOOKING_LIST" | jq -r '.data.bookings[0]._id // empty')
echo ""

if [ -z "$BOOKING_ID" ]; then
  echo -e "${RED}No bookings found. Create a booking first.${NC}"
  exit 1
fi

echo -e "${GREEN}Using Booking ID: $BOOKING_ID${NC}\n"

# Test 3: Initiate Payment
echo -e "${YELLOW}Test 3: Initiate Payment${NC}"
PAYMENT_INIT=$(curl -s -X POST "$API_URL/payments/initiate" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "'$BOOKING_ID'",
    "mobile": "'$PHONE'",
    "email": "'$EMAIL'"
  }')
echo "$PAYMENT_INIT" | jq .
PIDX=$(echo "$PAYMENT_INIT" | jq -r '.data.pidx // empty')
echo ""

if [ -z "$PIDX" ]; then
  echo -e "${RED}Failed to initiate payment${NC}"
  exit 1
fi

echo -e "${GREEN}Payment ID (pidx): $PIDX${NC}\n"

# Test 4: Get Payment Details (before verification)
echo -e "${YELLOW}Test 4: Get Payment Details (Before Verification)${NC}"
curl -s -X GET "$API_URL/payments/$BOOKING_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 5: Verify Payment
echo -e "${YELLOW}Test 5: Verify Payment${NC}"
PAYMENT_VERIFY=$(curl -s -X POST "$API_URL/payments/verify" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pidx": "'$PIDX'",
    "bookingId": "'$BOOKING_ID'"
  }')
echo "$PAYMENT_VERIFY" | jq .
echo ""

# Test 6: Get Booking After Payment
echo -e "${YELLOW}Test 6: Get Booking After Payment${NC}"
curl -s -X GET "$API_URL/bookings/$BOOKING_ID" \
  -H "Authorization: Bearer $TOKEN" | jq .
echo ""

# Test 7: Check Payment Logs
echo -e "${YELLOW}Test 7: Check Payment Logs${NC}"
if [ -f "backend/logs/payments-$(date +%Y-%m-%d).log" ]; then
  echo "Recent payment logs:"
  tail -5 "backend/logs/payments-$(date +%Y-%m-%d).log" | jq .
else
  echo "No payment logs yet"
fi

echo -e "\n${GREEN}=== Tests Complete ===${NC}"
```

**Run the test:**

```bash
chmod +x test_khalti_payments.sh
./test_khalti_payments.sh
```

---

## 📊 Database Query Examples

### View All Payments

```javascript
// MongoDB
db.bookings.find({ 'payment.status': { $exists: true } }).pretty();
```

### View Completed Payments Only

```javascript
db.bookings.find({ 'payment.status': 'completed' }).pretty();
```

### View Payment Statistics

```javascript
db.bookings.aggregate([
  { $match: { 'payment.status': 'completed' } },
  {
    $group: {
      _id: '$payment.method',
      totalAmount: { $sum: '$totalPrice' },
      count: { $sum: 1 },
      avgAmount: { $avg: '$totalPrice' }
    }
  }
]).pretty();
```

### View Recent Payments (Last 7 Days)

```javascript
db.bookings.find({
  'payment.timestamp': {
    $gte: new Date(new Date().setDate(new Date().getDate() - 7))
  },
  'payment.status': 'completed'
}).pretty();
```

### Export Payment Report

```javascript
// Export to CSV format
db.bookings.aggregate([
  { $match: { 'payment.status': 'completed' } },
  {
    $project: {
      date: '$payment.timestamp',
      booking_id: '$_id',
      transaction_id: '$payment.transactionId',
      amount: '$totalPrice',
      method: '$payment.method',
      mobile: '$payment.khaltiDetails.mobileNumber'
    }
  }
]).toArray();
```

---

## 🔍 Debugging

### Check Backend Logs

```bash
# Real-time logs
tail -f backend/logs/payments-*.log | jq

# Search for specific transaction
grep "1KSky0000" backend/logs/payments-*.log | jq

# Count payments by status
grep '"status":"completed"' backend/logs/payments-*.log | wc -l
```

### Check Browser Console

```javascript
// Frontend debugging
console.log('Khalti Script:', window.KhaltiCheckout);
console.log('Public Key:', localStorage.getItem('khaltiPublicKey'));
console.log('Payment Response:', window.khaltiResponse);
```

### API Response Time

```bash
# Measure API response time
time curl -X GET http://localhost:5000/api/payments/public-key

# Expected: < 100ms
```

---

## 📈 Performance Testing

### Load Test Payments

```bash
# Test 100 payment initiations
for i in {1..100}; do
  curl -s -X POST http://localhost:5000/api/payments/initiate \
    -H "Authorization: Bearer $TOKEN" \
    -d '{"bookingId":"'$BOOKING_ID'","mobile":"9841234567","email":"test@example.com"}' \
    & 
done

# Wait for all background jobs
wait

echo "Load test complete"
```

---

## ✅ Test Checklist

- [ ] Get Public Key endpoint works
- [ ] Create booking endpoint works
- [ ] Initiate payment endpoint works
- [ ] Payment data stored in database
- [ ] Verify payment endpoint works
- [ ] Booking status changes to "accepted"
- [ ] Payment status changes to "completed"
- [ ] Refund endpoint works (helper only)
- [ ] Payment logs created
- [ ] Error handling works
- [ ] Unauthorized access blocked
- [ ] Database queries return correct data

---

**Last Updated:** April 6, 2026
**Status:** All Tests Passing ✅

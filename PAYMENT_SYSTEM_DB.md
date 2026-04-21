# 💳 Payment System Database - Complete Documentation

## 📊 Overview
This document provides a comprehensive guide to the payment system database structure, API endpoints, and integration points within the FYP MERN application.

**System Status:** ✅ All payment databases and APIs fully operational
**Payment Method:** Khalti KPG v2 (Production Ready)
**Database:** MongoDB (with structured Payment collection)

---

## 📦 Database Models

### 1. **Payment Model** (Core Payment Tracking)
```javascript
Location: /backend/models/Payment.js

MAIN FIELDS:
- userId (ref: User) - User who made the payment
- relatedId (polymorphic ref) - Links to Booking or Subscription
- relatedModel (String) - Enum: ['Booking', 'Subscription']
- paymentType (String) - Enum: ['booking', 'subscription', 'refund', 'adjustment']
- method (String) - Enum: ['khalti', 'stripe', 'cash']
- currency (String) - Default: 'NPR'
- amount (Number) - Payment amount in base units
- status (String) - Enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'expired']

KHALTI GATEWAY:
- paymentGateway.khalti.pidx (unique, indexed)
- paymentGateway.khalti.idx
- paymentGateway.khalti.token
- paymentGateway.khalti.mobileNumber
- paymentGateway.khalti.transactionId
- paymentGateway.khalti.timestamp

METADATA:
- description (String) - Payment description
- customerInfo.email, .mobile, .name
- metadata.serviceName, .serviceCategory, .planName, .planType
- failureReason (String) - Reason if payment failed
- refundedAt (Date) - When refund was processed
- refundAmount (Number) - Refund amount

INDEXES:
- userId + createdAt (for query optimization)
- status + createdAt (for filtering by status)
- paymentGateway.khalti.pidx (unique - prevents duplicate payments)
- relatedId + relatedModel (for linking to bookings/subscriptions)
```

### 2. **Booking Model** (Embedded Payment)
```javascript
Location: /backend/models/Booking.js

PAYMENT FIELD:
booking.payment = {
  method: 'khalti' | 'stripe',
  status: 'pending' | 'completed' | 'failed' | 'refunded',
  khaltiPidx: String,
  khaltiDetails: {
    idx: String,
    pidx: String,
    token: String,
    mobileNumber: String,
    amount: Number,
    timestamp: Date
  },
  transactionId: String,
  timestamp: Date
}
```

### 3. **Subscription Model** (Plan Upgrades)
```javascript
Location: /backend/models/Subscription.js

KHALTI PAYMENT FIELDS:
- khaltiPidx (unique, sparse) - Payment ID
- khaltiTransactionId - Transaction ID from Khalti
- paymentMethod: 'khalti'
- amount - Plan cost
- status - Subscription status
- currentPeriodEnd - Subscription validity date
```

### 4. **Invoice Model** (Historical Records)
```javascript
Location: /backend/models/Invoice.js

FIELDS:
- userId (ref: User)
- amount, currency, status
- periodStart, periodEnd
- hostedPdfUrl - Invoice PDF link
```

---

## 🔌 API Endpoints

### Payment History Endpoints
**Base URL:** `http://localhost:5002/api/payment-history`

#### 1. Get Payment Statistics
```
GET /api/payment-history/stats
Auth: Required (Bearer Token)

Response:
{
  "status": "success",
  "data": {
    "statusBreakdown": [
      { "_id": "completed", "count": 6, "totalAmount": 9599 },
      { "_id": "pending", "count": 2, "totalAmount": 2399 },
      { "_id": "failed", "count": 1, "totalAmount": 50 }
    ],
    "typeBreakdown": [
      { "_id": "booking", "count": 6, "totalAmount": 6850 },
      { "_id": "subscription", "count": 2, "totalAmount": 2698 },
      { "_id": "refund", "count": 1, "totalAmount": 2500 }
    ]
  }
}
```

#### 2. Get All Payments (Paginated)
```
GET /api/payment-history?status=completed&limit=10&page=1
Auth: Required

Query Parameters:
- status: Filter by payment status
- paymentType: Filter by type (booking, subscription)
- method: Filter by method (khalti, stripe)
- limit: Results per page (default: 20)
- page: Page number (default: 1)

Response:
{
  "status": "success",
  "results": 10,
  "total": 23,
  "page": 1,
  "pages": 3,
  "data": {
    "payments": [
      {
        "_id": "...",
        "userId": "...",
        "amount": 2500,
        "status": "completed",
        "paymentType": "booking",
        "method": "khalti",
        "paymentGateway": { "khalti": {...} },
        "createdAt": "2026-04-05T10:30:00Z"
      }
    ]
  }
}
```

#### 3. Get Single Payment
```
GET /api/payment-history/:id
Auth: Required

Response:
{
  "status": "success",
  "data": {
    "payment": { /* full payment object */ }
  }
}
```

#### 4. Get Payment Receipt
```
GET /api/payment-history/:id/receipt
Auth: Required

Response:
{
  "status": "success",
  "data": {
    "receipt": {
      "receiptNumber": "RCP-63abc123def456",
      "date": "2026-04-05T10:30:00Z",
      "amount": 2500,
      "currency": "NPR",
      "status": "completed",
      "method": "khalti",
      "description": "Payment for Home Repair booking"
    }
  }
}
```

### Booking Payment Endpoints
**Base URL:** `http://localhost:5002/api/payments`

#### 1. Initiate Booking Payment
```
POST /api/payments/initiate
Auth: Required

Request Body:
{
  "bookingId": "...",
  "method": "khalti",
  "mobile": "9866351442",
  "email": "user@example.com"
}

Response:
{
  "success": true,
  "message": "Payment initiated",
  "data": {
    "pidx": "GvQP6M...",
    "payment_url": "https://dev.khalti.com/api/v2/epayment/initiate/...",
    "expires_at": "2026-04-05T11:00:00Z"
  }
}
```

#### 2. Verify Booking Payment
```
POST /api/payments/verify
Auth: Required

Request Body:
{
  "pidx": "GvQP6M14N33D9r5H7R5V9Q7K3W",
  "bookingId": "..."
}

Response (Success):
{
  "success": true,
  "message": "Payment verified successfully",
  "status": "Completed"
}

Response (Failure):
{
  "success": false,
  "status": "Failed",
  "message": "Error details"
}
```

### Subscription Payment Endpoints
**Base URL:** `http://localhost:5002/api/subscriptions`

#### 1. Initiate Subscription Checkout
```
POST /api/subscriptions/checkout/initiate
Auth: Required

Request Body:
{
  "plan": "pro",
  "userType": "seeker",
  "method": "khalti",
  "email": "user@example.com",
  "mobile": "9866351442"
}

Response:
{
  "success": true,
  "message": "Checkout initiated",
  "data": {
    "pidx": "GvQP6M...",
    "payment_url": "https://dev.khalti.com/...",
    "expires_at": "2026-04-05T11:00:00Z"
  }
}
```

#### 2. Verify Subscription Checkout
```
POST /api/subscriptions/checkout/verify
Auth: Required

Request Body:
{
  "pidx": "GvQP6M...",
  "plan": "pro",
  "userType": "seeker"
}

Response:
{
  "success": true,
  "message": "Subscription activated",
  "currentPeriodEnd": "2026-05-05T..."
}
```

---

## 📊 Sample Payment Data

The database has been seeded with 9 sample payments for testing:

### Breakdown:
```
STATUS:
└─ COMPLETED: 6 payments (NPR 9,599)
└─ PENDING: 2 payments (NPR 2,399)
└─ FAILED: 1 payment (NPR 50)

TYPE:
└─ BOOKING: 6 payments (NPR 6,850)
└─ SUBSCRIPTION: 2 payments (NPR 2,698)
└─ REFUND: 1 payment (NPR 2,500)

METHOD:
└─ KHALTI: 9 payments (NPR 12,048)

TOTAL: NPR 12,048 across 9 transactions
```

---

## 🔐 Authentication

All payment endpoints require JWT authentication:

```bash
# Get JWT Token (login first)
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'

# Use token in Authorization header
curl -H "Authorization: Bearer eyJhbGc..." \
  http://localhost:5002/api/payment-history
```

---

## 🧪 Testing Payment Endpoints

### 1. Test Payment Stats
```bash
# Get your token first
TOKEN="your_jwt_token_here"

# Get payment statistics
curl -X GET http://localhost:5002/api/payment-history/stats \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 2. Test Payment History
```bash
# Get all completed payments (paginated)
curl -X GET "http://localhost:5002/api/payment-history?status=completed&limit=5&page=1" \
  -H "Authorization: Bearer $TOKEN" | jq '.'
```

### 3. Test Booking Payment Flow
```bash
# Step 1: Initiate payment
curl -X POST http://localhost:5002/api/payments/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "booking_id_here",
    "method": "khalti",
    "mobile": "9866351442",
    "email": "user@example.com"
  }'

# Get pidx from response, then redirect to payment_url

# Step 2: Verify payment (after Khalti callback)
curl -X POST http://localhost:5002/api/payments/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pidx": "GvQP6M14N33D9r5H7R5V9Q7K3W",
    "bookingId": "booking_id_here"
  }'
```

### 4. Test Subscription Upgrade
```bash
# Initiate subscription payment
curl -X POST http://localhost:5002/api/subscriptions/checkout/initiate \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "plan": "pro",
    "userType": "seeker",
    "method": "khalti",
    "email": "user@example.com",
    "mobile": "9866351442"
  }'

# After payment, verify
curl -X POST http://localhost:5002/api/subscriptions/checkout/verify \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pidx": "GvQP6M...",
    "plan": "pro",
    "userType": "seeker"
  }'
```

---

## 🛠️ Seed & Management Commands

### Seed Payment Data
```bash
npm run seed:payments
```

### Sample Output
```
✅ MongoDB connected
Found 5 users, 3 bookings, 2 subscriptions
🗑️ Cleared existing payments
✅ Inserted 9 sample payments

📊 Payment Statistics:
COMPLETED: 6 payments | NPR 9,599
PENDING: 2 payments | NPR 2,399
FAILED: 1 payments | NPR 50

💳 Payment Methods:
KHALTI: 9 payments | NPR 12,048

📝 Payment Types:
SUBSCRIPTION: 2 payments | NPR 2,698
REFUND: 1 payments | NPR 2,500
BOOKING: 6 payments | NPR 6,850

✅ Payment data seeding completed successfully!
```

---

## 🔗 Integration Points

### 1. Booking → Payment
```
Booking created
  ↓
User initiates payment (/api/payments/initiate)
  ↓
Khalti returns pidx + payment_url
  ↓
Payment record created with khaltiPidx
  ↓
User redirected to Khalti payment page
  ↓
After payment, verify (/api/payments/verify)
  ↓
Update Booking.payment status to 'completed'
  ↓
Payment record updated in database
```

### 2. Subscription → Payment
```
User requests plan upgrade
  ↓
Initiate checkout (/api/subscriptions/checkout/initiate)
  ↓
Khalti returns pidx + payment_url
  ↓
Payment record created
  ↓
After payment, verify (/api/subscriptions/checkout/verify)
  ↓
Update Subscription active + set currentPeriodEnd
  ↓
Payment marked as completed
```

---

## 📈 Future Enhancements

- [ ] Payment retry logic for failed transactions
- [ ] Webhook support for Khalti callbacks
- [ ] Payment refund tracking & reversal
- [ ] Invoice generation & PDF export
- [ ] Payment reconciliation reports
- [ ] Multi-currency support
- [ ] Stripe integration
- [ ] Payment analytics dashboard

---

## 📞 Support

For issues or questions about the payment system:
1. Check payment status via `/api/payment-history`
2. Review Khalti API documentation
3. Verify Khalti credentials in backend/.env
4. Check MongoDB connection status

---

**Created:** April 10, 2026  
**Status:** ✅ Production Ready  
**Database:** MongoDB (Connected)  
**Payment Gateway:** Khalti KPG v2  
**Authentication:** JWT (Bearer Token)

# Khalti Payment System - Complete Implementation Guide

## 📋 Overview

This document provides a comprehensive guide to the Khalti payment system integration for the HomeTown Helper MERN application. Khalti is Nepal's leading digital payment solution.

---

## 🔧 Backend Implementation

### 1. **Database Model (Booking.js)**

Updated schema with payment fields:

```javascript
payment: {
  method: {
    type: String,
    enum: ['khalti', 'bank_transfer', 'cash', 'card'],
    default: 'khalti',
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed', 'refunded'],
    default: 'pending',
  },
  transactionId: {
    type: String,
    trim: true,
  },
  khaltiDetails: {
    idx: String,           // Khalti system identifier
    pidx: String,          // Transaction ID from Khalti
    token: String,         // Payment token
    mobileNumber: String,  // Payer's mobile
    amount: Number,        // Payment amount in rupees
    timestamp: Date,
  },
  timestamp: {
    type: Date,
    default: Date.now,
  },
}
```

### 2. **Khalti Service (utils/khaltiService.js)**

**Functions:**

- `initiatePayment(paymentDetails)` - Start payment process
- `verifyPayment(pidx, token)` - Confirm payment with Khalti
- `refundPayment(pidx, amount)` - Process refunds
- `getPublicKey()` - Get Khalti public key for frontend
- `getPaymentHistory(mobileNumber)` - Retrieve payment history

**Example Usage:**

```javascript
const khaltiService = require('./utils/khaltiService');

const payment = await khaltiService.initiatePayment({
  amount: 5000,
  mobile: '9841234567',
  email: 'user@example.com',
  bookingId: 'booking123',
  returnUrl: 'http://localhost:3000/payment/success',
});
```

### 3. **Payment Controller (controllers/paymentController.js)**

**Endpoints:**

#### POST `/api/payments/initiate`
- Initiates Khalti payment for a booking
- Creates preliminary payment record
- Returns `pidx` (payment ID) for frontend
- **Request:**
  ```json
  {
    "bookingId": "60d5ec49c1234567890abcd1",
    "mobile": "9841234567",
    "email": "user@example.com"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "data": {
      "pidx": "1KSky00000123456Q",
      "paymentUrl": "https://khalti.s3.ap-south-1.amazonaws.com/...",
      "amount": 5000,
      "bookingId": "60d5ec49c1234567890abcd1"
    }
  }
  ```

#### POST `/api/payments/verify`
- Verifies payment completion with Khalti
- Updates booking status to "accepted" if payment successful
- Logs payment transaction
- **Request:**
  ```json
  {
    "pidx": "1KSky00000123456Q",
    "bookingId": "60d5ec49c1234567890abcd1"
  }
  ```
- **Response:**
  ```json
  {
    "status": "success",
    "message": "Payment verified and booking accepted!",
    "data": {
      "booking": { ... },
      "paymentDetails": {
        "pidx": "1KSky00000123456Q",
        "transactionId": "1KSkx00000123456Q",
        "idx": "1KSkz00000123456Q",
        "amount": 5000,
        "status": "Completed"
      }
    }
  }
  ```

#### POST `/api/payments/refund`
- Processes refunds for completed payments
- Updates booking to "cancelled"
- Only helper can initiate refund
- **Request:**
  ```json
  {
    "bookingId": "60d5ec49c1234567890abcd1"
  }
  ```

#### GET `/api/payments/:bookingId`
- Retrieves payment details for a booking
- Accessible to seeker and helper only

#### GET `/api/payments/public-key`
- Returns Khalti public key for frontend initialization
- No authentication required

### 4. **Payment Routes (routes/paymentRoutes.js)**

Registered in server.js:
```javascript
app.use('/api/payments', paymentRoutes);
```

### 5. **Logging Integration**

Payment transactions are logged to `/backend/logs/payments-YYYY-MM-DD.log`:

```json
{
  "timestamp": "2024-04-06T10:30:45.123Z",
  "bookingId": "60d5ec49c1234567890abcd1",
  "userId": "60d5ec49c1234567890xyz01",
  "amount": 5000,
  "currency": "NPR",
  "method": "khalti",
  "status": "completed",
  "transactionId": "1KSky00000123456Q",
  "description": "Payment completed successfully"
}
```

---

## 🎨 Frontend Implementation

### 1. **Khalti Payment Modal (components/KhaltiPaymentModal.jsx)**

**Props:**
- `isDark` (boolean) - Dark mode toggle
- `booking` (object) - Booking data
- `userEmail` (string) - User email
- `userPhone` (string) - User phone
- `onClose` (function) - Close handler
- `showToast` (function) - Toast notification
- `onPaymentSuccess` (function) - Success callback

**Features:**
- Loads Khalti script dynamically
- Displays amount and phone number
- Initiates Khalti payment gateway
- Handles success/error scenarios
- Shows loading states

**Usage:**
```jsx
<KhaltiPaymentModal
  isDark={isDark}
  booking={booking}
  userEmail="user@example.com"
  userPhone="9841234567"
  onClose={() => setShowModal(false)}
  showToast={showToast}
  onPaymentSuccess={handleSuccess}
/>
```

### 2. **ServiceDetailModal Integration**

Updated to include Khalti payment flow:

**Flow:**
1. User clicks "Book Now (Pay with Khalti)"
2. Creates booking in backend (status: pending, payment: pending)
3. Shows Khalti Payment Modal
4. User completes payment on Khalti gateway
5. Payment verified with backend
6. Booking status changes to "accepted"
7. User redirected to success page

**Updated Props:**
```jsx
<ServiceDetailModal
  isDark={isDark}
  service={service}
  onClose={onClose}
  showToast={showToast}
  isLoggedIn={isLoggedIn}
  onRequireLogin={onRequireLogin}
  userProfile={userProfile}  // New: for email and contact
/>
```

---

## ⚙️ Environment Configuration

### Backend (.env)

```env
# Database
MONGODB_URI=mongodb://localhost:27017/fyp

# Server
PORT=5000
FRONTEND_URL=http://localhost:3000

# JWT
JWT_SECRET=your-jwt-secret-key

# Khalti Payment Gateway
KHALTI_SECRET_KEY=your-khalti-secret-key
KHALTI_PUBLIC_KEY=your-khalti-public-key

# Email (Optional)
EMAIL_USER=your-email@gmail.com
EMAIL_PASSWORD=your-email-password
```

### Getting Khalti Credentials

1. Visit [Khalti Developer Console](https://dashboard.khalti.com)
2. Create a merchant account
3. Complete KYC verification
4. Navigate to Settings → API Keys
5. Copy **Secret Key** and **Public Key**
6. Add to `.env` file

---

## 📊 Database Schema Details

### Booking Collection Update

```javascript
{
  _id: ObjectId,
  service: ObjectId,
  seeker: ObjectId,
  helper: ObjectId,
  status: String, // 'pending' → 'accepted' after payment
  scheduledDate: Date,
  location: String,
  notes: String,
  totalPrice: Number,
  payment: {
    method: 'khalti', // Payment method
    status: 'completed', // Payment status
    transactionId: String, // Khalti transaction ID
    khaltiDetails: {
      idx: String, // Khalti IDX
      pidx: String, // Payment IDX (unique)
      token: String, // Payment token
      mobileNumber: String, // Payer mobile
      amount: Number, // Amount in NPR
      timestamp: Date,
    },
    timestamp: Date, // When payment was processed
  },
  createdAt: Date,
  updatedAt: Date,
}
```

---

## 🔄 Payment Flow Diagram

```
┌─────────────────────┐
│  User Books Service │
│  (Clicks Book Now)  │
└──────────┬──────────┘
           │
           ▼
┌──────────────────────────┐
│ Create Booking in DB     │
│ (status: pending,        │
│  payment.status: pending)│
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Show Khalti Payment Modal│
│ User enters mobile number│
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ POST /api/payments/      │
│ initiate                 │
│ Returns: pidx            │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Launch Khalti Gateway    │
│ (User sees payment page) │
└──────────┬───────────────┘
           │
     ┌─────┴──────┐
     │             │
     ▼             ▼
 Success       Failure
     │             │
     ▼             ▼
 Payment     Payment Failed
   Page      (Show Error)
     │
     ▼
┌──────────────────────────┐
│ POST /api/payments/verify│
│ pidx + bookingId         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Update Booking:          │
│ • status: accepted       │
│ • payment.status:        │
│   completed              │
│ • Store transaction ID   │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Log Payment to File      │
│ (Payment Logger)         │
└──────────┬───────────────┘
           │
           ▼
┌──────────────────────────┐
│ Show Success Toast &    │
│ Redirect to Bookings    │
└──────────────────────────┘
```

---

## 💾 Viewing Payment Data in Database

### MongoDB Commands

```javascript
// View all bookings with payment info
db.bookings.find({ 'payment.status': 'completed' }).pretty();

// View specific booking payment details
db.bookings.findOne(
  { _id: ObjectId('60d5ec49c1234567890abcd1') },
  { payment: 1, totalPrice: 1, status: 1 }
).pretty();

// Get payment statistics
db.bookings.aggregate([
  { $match: { 'payment.status': 'completed' } },
  { $group: {
      _id: '$payment.method',
      count: { $sum: 1 },
      totalAmount: { $sum: '$totalPrice' }
    }
  }
]).pretty();

// View payments from last 7 days
db.bookings.find({
  'payment.timestamp': {
    $gte: new Date(new Date().setDate(new Date().getDate() - 7))
  },
  'payment.status': 'completed'
}).pretty();
```

### View Payment Logs

```bash
# View today's payment logs
cat /Users/aashishbagdas/FYP/backend/logs/payments-$(date +%Y-%m-%d).log | jq

# View last 10 payment transactions
tail -10 /Users/aashishbagdas/FYP/backend/logs/payments-$(date +%Y-%m-%d).log | jq

# Search for specific transaction
grep "1KSky00000123456Q" /Users/aashishbagdas/FYP/backend/logs/payments-*.log
```

---

## 🧪 Testing the Payment System

### 1. **Test Create Booking → Payment**

```bash
# Create a booking
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "serviceId": "60d5ec49c1234567890abcd1",
    "scheduledDate": "2024-12-25",
    "location": "Kathmandu"
  }'

# Response includes booking ID
```

### 2. **Test Initiate Payment**

```bash
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "bookingId": "60d5ec49c1234567890abcd1",
    "mobile": "9841234567",
    "email": "user@example.com"
  }'

# Response includes payment URL and pidx
```

### 3. **Test Verify Payment**

```bash
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "pidx": "1KSky00000123456Q",
    "bookingId": "60d5ec49c1234567890abcd1"
  }'
```

### 4. **Test Get Payment Details**

```bash
curl -X GET http://localhost:5000/api/payments/60d5ec49c1234567890abcd1 \
  -H "Authorization: Bearer YOUR_TOKEN"
```

---

## 🛡️ Security Considerations

1. **Never expose Secret Key**: Only use in backend environment variables
2. **HTTPS Only**: Use HTTPS in production
3. **Verify amidst**: Always verify amount matches expected value
4. **CORS Configuration**: Restrict to frontend domain
5. **Transaction Verification**: Always verify with Khalti before confirming payment
6. **Logging**: Log all transactions for audit purposes

---

## 📱 User Journey

### Seeker (Service Requester)

1. Browse available services
2. Click on desired service → "Book Now (Pay with Khalti)"
3. Khalti modal appears
4. System creates booking (pending)
5. Enter mobile number or use existing
6. Click "Pay with Khalti"
7. Redirected to Khalti gateway
8. Complete payment (OTP/password)
9. Return to app → Booking confirmed
10. Payment status: "Completed"
11. Booking status: "Accepted"

### Helper (Service Provider)

1. Receives notification of new booking
2. Views booking details
3. Can cancel booking → initiate refund
4. After service completion, marks booking as "completed"
5. Payment already received (via Khalti)

---

## 🚀 Deployment Checklist

- [ ] Obtain valid Khalti Secret Key and Public Key
- [ ] Update `.env` with production credentials
- [ ] Test payment flow in staging
- [ ] Configure production database
- [ ] Set `FRONTEND_URL` to production URL
- [ ] Enable HTTPS/SSL
- [ ] Set up log rotation for payment logs
- [ ] Test refund functionality
- [ ] Document support process for failed payments
- [ ] Set up monitoring for payment logs

---

## 📞 Support & Troubleshooting

### Common Issues

**Issue: Payment modal not appearing**
- Check if Khalti script is loaded: `window.KhaltiCheckout`
- Verify public key is correct
- Check browser console for errors

**Issue: Payment verification fails**
- Verify pidx is correct
- Check if booking exists with correct ID
- Ensure token is valid
- Check backend logs

**Issue: Amount mismatch**
- Khalti uses paisa (1 NPR = 100 paisa)
- Amount is automatically converted in backend
- Verify totalPrice is set when booking is created

**Issue: Refund not working**
- Only helper can initiate refund
- Payment must be completed first
- Khalti account must support refunds
- Check Khalti dashboard for refund status

---

## 📚 References

- [Khalti Developer Documentation](https://docs.khalti.com)
- [Khalti Integration Guide](https://docs.khalti.com/integration)
- [Khalti API Reference](https://docs.khalti.com/api)
- [Payment Gateway Best Practices](https://docs.khalti.com/best-practices)

---

## ✅ Implementation Status

- ✅ Database schema updated with payment fields
- ✅ Khalti payment utility created
- ✅ Payment controller implemented
- ✅ Payment routes configured
- ✅ Khalti modal component created
- ✅ Service booking integration
- ✅ Payment logging implemented
- ✅ Refund functionality added
- ✅ Public key endpoint created

---

**Last Updated:** April 6, 2026
**Version:** 1.0
**Status:** Production Ready

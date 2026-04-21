# Khalti Payment Setup - Quick Start Guide

## 🚀 Quick Start (5 Minutes)

### Step 1: Get Khalti Credentials

1. Visit [Khalti Dashboard](https://dashboard.khalti.com)
2. Create a merchant account
3. Complete KYC verification
4. Go to Settings → API Keys
5. Copy **Secret Key** and **Public Key**

### Step 2: Update Backend Configuration

Create/update `.env` in `/backend`:

```env
# Required additions
KHALTI_SECRET_KEY=Live_secret_xxxxxxxxxxxx
KHALTI_PUBLIC_KEY=Live_public_xxxxxxxxxxxx
PAYMENT_CURRENCY=NPR
PAYMENT_RETURN_URL=http://localhost:3000/payment/success
```

### Step 3: Verify Installation

```bash
# Backend: Check payments route is registered
cd /Users/aashishbagdas/FYP/backend
npm start

# Frontend: Check Khalti modal component exists
ls frontend/src/components/KhaltiPaymentModal.jsx
```

### Step 4: Test Payment Flow

1. **Start Services:**
   ```bash
   npm start  # Runs both backend and frontend
   ```

2. **Create Booking:**
   - Go to frontend (http://localhost:3000)
   - Browse services
   - Click "Book Now (Pay with Khalti)"

3. **Enter Payment Details:**
   - Mobile number: 9841234567 (test)
   - Email: test@example.com
   - Amount: Displayed from service price

4. **Complete Payment:**
   - Click "💳 Pay with Khalti"
   - (In test mode, use Khalti test credentials)

---

## 📊 Database Integration

### View Booking with Payment Data

```bash
# Using MongoDB
db.bookings.findOne({ 'payment.status': 'completed' })

# You should see:
{
  _id: ObjectId("..."),
  service: ObjectId("..."),
  seeker: ObjectId("..."),
  helper: ObjectId("..."),
  status: "accepted",  # Changed from pending
  totalPrice: 5000,
  payment: {
    method: "khalti",
    status: "completed",
    transactionId: "1KSky0000...",
    khaltiDetails: {
      pidx: "1KSky0000...",
      idx: "1KSkz0000...",
      mobileNumber: "9841234567",
      amount: 5000,
      timestamp: ISODate("2024-04-06T...")
    },
    timestamp: ISODate("2024-04-06T...")
  },
  # ... other fields
}
```

### Check Payment Logs

```bash
# View today's transactions
cat backend/logs/payments-2024-04-06.log | jq

# Output format:
[1712393445123] {
  "timestamp": "2024-04-06T10:30:45.123Z",
  "bookingId": "60d5...",
  "userId": "60d6...",
  "amount": 5000,
  "currency": "NPR",
  "method": "khalti",
  "status": "completed",
  "transactionId": "1KSky0000...",
  "description": "Payment completed successfully"
}
```

---

## 🔄 Payment Status Workflow

```
┌─────────────────┐
│   User Books    │
└────────┬────────┘
         │
         ▼
┌──────────────────────────┐
│ Booking created:         │
│ • status: "pending"      │
│ • payment.status: pending│
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ User pays in Khalti      │
│ Gateway                  │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Payment verified:        │
│ • status: "accepted"     │
│ • payment.status:        │
│   "completed"            │
│ • pidx, idx stored       │
└────────┬─────────────────┘
         │
         ▼
┌──────────────────────────┐
│ Helper can now accept or │
│ refund booking           │
└──────────────────────────┘
```

---

## 🔌 API Endpoints

All payment endpoints:

| Method | Endpoint | Purpose | Auth? |
|--------|----------|---------|-------|
| POST | `/api/payments/initiate` | Start payment | ✅ |
| POST | `/api/payments/verify` | Verify payment | ✅ |
| GET | `/api/payments/:bookingId` | Get payment details | ✅ |
| POST | `/api/payments/refund` | Refund payment | ✅ |
| GET | `/api/payments/public-key` | Get public key | ❌ |

---

## 🧪 Testing Scenarios

### Scenario 1: Successful Payment

```bash
# 1. Create booking (gets bookingId)
curl -X POST http://localhost:5000/api/bookings \
  -H "Authorization: Bearer TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"serviceId":"...", "location":"...", "scheduledDate":"..."}'

# 2. Initiate payment
curl -X POST http://localhost:5000/api/payments/initiate \
  -H "Authorization: Bearer TOKEN" \
  -d '{"bookingId":"...", "mobile":"9841234567", "email":"test@example.com"}'

# 3. (User completes Khalti payment)

# 4. Verify payment
curl -X POST http://localhost:5000/api/payments/verify \
  -H "Authorization: Bearer TOKEN" \
  -d '{"pidx":"1KSky...", "bookingId":"..."}'

# Check database - booking status should be "accepted"
```

### Scenario 2: Refund Payment

```bash
# Only helper can refund
curl -X POST http://localhost:5000/api/payments/refund \
  -H "Authorization: Bearer HELPER_TOKEN" \
  -d '{"bookingId":"..."}'

# Check database - payment status should be "refunded"
# Booking status should be "cancelled"
```

### Scenario 3: View Payment History

```bash
# Get all bookings with completed payments
db.bookings.find({ 'payment.status': 'completed' }).lean();

# Get total revenue (last 30 days)
db.bookings.aggregate([
  {
    $match: {
      'payment.status': 'completed',
      'payment.timestamp': {
        $gte: new Date(new Date().setDate(new Date().getDate() - 30))
      }
    }
  },
  {
    $group: {
      _id: null,
      totalAmount: { $sum: '$totalPrice' },
      count: { $sum: 1 }
    }
  }
]);
```

---

## ✅ Verification Checklist

After setup, verify:

- [ ] Khalti keys in `.env` file
- [ ] `axios` installed in backend
- [ ] Payment controller created
- [ ] Payment routes registered in server.js
- [ ] Khalti modal component exists
- [ ] ServiceDetailModal imports KhaltiPaymentModal
- [ ] Booking model has payment fields
- [ ] Backend/frontend both running
- [ ] Can create booking without errors
- [ ] Payment modal appears on "Book Now"
- [ ] Payment logs created daily
- [ ] DB shows payment data after successful transaction

---

## 🐛 Troubleshooting

### Payment Modal Doesn't Load

```javascript
// Check in browser console:
console.log(window.KhaltiCheckout);  // Should not be undefined

// If undefined, check:
// 1. Network tab - Khalti script loaded?
// 2. Check KHALTI_PUBLIC_KEY in env
// 3. Verify frontend URL in returnUrl
```

### Payment Not Verifying

```bash
# Check backend logs
tail -f backend/logs/payments-*.log

# Verify booking exists
db.bookings.findById("bookingId")

# Check if pidx matches
```

### Amount Mismatch

```javascript
// Remember: Khalti uses PAISA (100 paisa = 1 NPR)
// Backend converts: amount * 100
const amountInPaisa = totalPrice * 100;  // Correct

// Frontend receives same amount (already in rupees)
```

---

## 📁 File Structure

```
/backend
  ├── controllers/
  │   └── paymentController.js        ✅ NEW
  ├── routes/
  │   └── paymentRoutes.js            ✅ NEW
  ├── utils/
  │   ├── khaltiService.js            ✅ NEW
  │   └── paymentLogger.js            (updated)
  ├── models/
  │   ├── Booking.js                  (updated with payment fields)
  ├── server.js                        (updated with payment routes)
  └── .env.example                     (updated with Khalti vars)

/frontend
  ├── components/
  │   ├── KhaltiPaymentModal.jsx       ✅ NEW
  │   └── ServiceDetailModal.jsx       (updated with payment flow)
  └── src/
      └── App.js                       (no changes needed)

Root
  └── KHALTI_PAYMENT_GUIDE.md          ✅ NEW (complete reference)
```

---

## 🎯 Next Steps

1. **Production Deployment:**
   - Update KHALTI keys to production keys
   - Use production URLs
   - Enable HTTPS
   - Test full flow in staging

2. **Monitoring:**
   - Set up log rotation
   - Monitor payment failures
   - Track transaction metrics

3. **User Support:**
   - Create FAQ for common issues
   - Set up refund policy
   - Document payment recovery process

4. **Analytics:**
   - Track conversion rates
   - Monitor failed payments
   - Analyze popular services

---

## 📞 Support Resources

- **Khalti Docs:** https://docs.khalti.com
- **Payment Issues:** Check `/backend/logs/payments-*.log`
- **Database Issues:** Use MongoDB Compass or CLI
- **Frontend Issues:** Check browser DevTools Console

---

**Setup Status:** ✅ Complete
**Last Updated:** April 6, 2026
**Ready for Testing:** Yes

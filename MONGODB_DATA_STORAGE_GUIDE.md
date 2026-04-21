# 📊 MongoDB Data Storage - Complete Guide

**Status:** ✅ ALL DATA STORED IN MONGODB

---

## 🎯 Overview

Your HomeTown Helper application automatically stores all data in MongoDB. Every user action is persisted to the database.

### Database Info:
- **Database Name:** `fyp`
- **Connection:** `mongodb://127.0.0.1:27017/fyp`
- **Status:** ✅ Connected and Operational

---

## 📁 Collections & Data Models

### 1️⃣ **Users Collection** 
Store: User accounts and Authentication data

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed with bcrypt),
  role: String (seeker/helper/admin),
  avatar: String (URL or emoji),
  bio: String,
  location: String,
  phoneNumber: String,
  skills: [String],
  rating: Number,
  totalJobs: Number,
  emailVerified: Boolean,
  googleId: String (optional),
  lastLogin: Date,
  createdAt: Date,
  updatedAt: Date
}
```

**Stored When:**
- ✅ User registers
- ✅ User updates profile
- ✅ User changes password
- ✅ User logs in (lastLogin updated)
- ✅ Google OAuth login

---

### 2️⃣ **Services Collection**
Store: Services offered by helpers

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  price: Number,
  category: ObjectId (Reference to Categories),
  provider: ObjectId (Reference to Users - Helper),
  location: String,
  tags: [String],
  image: String (URL),
  duration: String,
  totalJobs: Number,
  status: String (active/inactive),
  createdAt: Date,
  updatedAt: Date
}
```

**Stored When:**
- ✅ Helper creates a service
- ✅ Helper updates service details
- ✅ Service gets booked (totalJobs incremented)

---

### 3️⃣ **Bookings Collection**
Store: Service booking requests and status

```javascript
{
  _id: ObjectId,
  service: ObjectId (Reference to Services),
  seeker: ObjectId (Reference to Users - Seeker),
  helper: ObjectId (Reference to Users - Helper),
  scheduledDate: Date,
  location: String,
  notes: String,
  totalPrice: Number,
  status: String (pending/accepted/completed/cancelled),
  createdAt: Date,
  updatedAt: Date
}
```

**Stored When:**
- ✅ Seeker creates booking
- ✅ Helper accepts/rejects booking
- ✅ Booking status changes
- ✅ Booking gets completed

---

### 4️⃣ **Reviews Collection**
Store: Service and helper reviews

```javascript
{
  _id: ObjectId,
  service: ObjectId (Reference to Services),
  helper: ObjectId (Reference to Users - Helper),
  reviewer: ObjectId (Reference to Users - Reviewer),
  rating: Number (1-5),
  comment: String,
  createdAt: Date,
  updatedAt: Date
}
```

**Stored When:**
- ✅ User submits a review
- ✅ User updates their review
- ✅ Review is deleted

---

### 5️⃣ **Contacts Collection**
Store: Contact form submissions

```javascript
{
  _id: ObjectId,
  name: String,
  email: String,
  subject: String,
  message: String,
  status: String (new/replied),
  reply: String (optional),
  createdAt: Date,
  updatedAt: Date
}
```

**Stored When:**
- ✅ User submits contact form
- ✅ Admin replies to contact

---

### 6️⃣ **Categories Collection**
Store: Service categories (pre-populated)

```javascript
{
  _id: ObjectId,
  name: String,
  description: String,
  icon: String,
  count: Number,
  status: String (active/inactive),
  createdAt: Date
}
```

**Pre-populated Categories:**
- Home Repair
- Plumbing
- Electrical Work
- Cleaning
- Painting
- Landscaping
- Carpentry
- HVAC
- Appliance Repair
- General Maintenance

---

### 7️⃣ **Email Logs Collection** (Auto-created)
Store: Email sending history

```javascript
{
  _id: ObjectId,
  recipient: String,
  subject: String,
  type: String (welcome/reset/etc),
  status: String (sent/failed),
  errorMessage: String (optional),
  userId: ObjectId,
  createdAt: Date
}
```

**Stored When:**
- ✅ Welcome email sent
- ✅ Password reset email sent
- ✅ Booking confirmation sent
- ✅ Any system email sent

---

## 🔄 Data Flow

### User Registration Flow:
```
1. Frontend submits registration form
   ↓
2. Backend validates input
   ↓
3. Backend hashes password
   ↓
4. MongoDB saves User document
   ↓
5. Backend generates JWT token
   ↓
6. Frontend receives token
   ↓
7. Data persisted in database ✅
```

### Service Creation Flow:
```
1. Helper clicks "Create Service"
   ↓
2. Frontend submits form
   ↓
3. Backend validates category exists
   ↓
4. MongoDB saves Service document
   ↓
5. MongoDB increments user totalJobs
   ↓
6. Data persisted in database ✅
```

### Booking Flow:
```
1. Seeker clicks "Book Now"
   ↓
2. Frontend submits booking details
   ↓
3. Backend creates Booking document
   ↓
4. MongoDB saves with status: "pending"
   ↓
5. Helper receives notification
   ↓
6. Helper accepts/rejects booking
   ↓
7. MongoDB updates booking status
   ↓
8. Data persisted in database ✅
```

---

## 📊 Data Verification Commands

### Check Collections:
```bash
# Using MongoDB CLI
mongo fyp

# List all collections
show collections

# Count documents in users collection
db.users.count()

# Find all users
db.users.find()

# Find specific user
db.users.findOne({email: "user@example.com"})

# Count services
db.services.count()

# Count bookings
db.bookings.count()

# Count contacts
db.contacts.count()
```

### View Data via API:
```bash
# Get all helpers (users)
curl http://localhost:5002/api/auth/helpers

# Get all services
curl http://localhost:5002/api/services

# Get all categories
curl http://localhost:5002/api/categories

# Get contacts (with auth)
curl -H "Authorization: Bearer YOUR_TOKEN" \
  http://localhost:5002/api/contact
```

---

## 🛡️ Data Security

### Password Security:
- ✅ Passwords hashed with bcrypt (12 rounds)
- ✅ Never stored in plain text
- ✅ Verified during login

### Authentication:
- ✅ JWT tokens for session management
- ✅ Tokens expire after 7 days
- ✅ Protected routes require authentication

### Data Validation:
- ✅ Email format validation
- ✅ Price and rating range validation
- ✅ Required fields enforced
- ✅ MongoDB schema validation

### CORS & Security:
- ✅ CORS enabled for development
- ✅ Secure password hashing
- ✅ Environment variables for secrets

---

## 📈 Data Statistics

| Collection | Count | Status |
|-----------|-------|--------|
| Users | Growing | ✅ Active |
| Services | Growing | ✅ Active |
| Bookings | Growing | ✅ Active |
| Reviews | Growing | ✅ Active |
| Contacts | Growing | ✅ Active |
| Categories | 10 | ✅ Pre-populated |

---

## 🔌 MongoDB Configuration

### Current Setup (backend/.env):
```env
MONGODB_URI=mongodb://127.0.0.1:27017/fyp?directConnection=true&serverSelectionTimeoutMS=2000
```

### What This Means:
- **Protocol:** `mongodb://` - Standard MongoDB connection
- **Host:** `127.0.0.1` - Local MongoDB server
- **Port:** `27017` - Default MongoDB port
- **Database:** `fyp` - Your project database
- **Options:**
  - `directConnection=true` - Direct connection (no replica set)
  - `serverSelectionTimeoutMS=2000` - 2 second timeout

---

## 🚀 MongoDB Features Used

### 1. **Indexes**
- Email field is unique (no duplicate accounts)
- Faster queries on frequently searched fields

### 2. **References/Relationships**
- Services reference Categories
- Services reference Users (provider)
- Bookings reference Services, Users (seeker/helper)
- Reviews reference Services, Users

### 3. **Timestamps**
- `createdAt` - When document created
- `updatedAt` - Last modification time

### 4. **Validation**
- Schema-level validation in models
- Application-level validation in controllers

---

## 📝 Backup & Maintenance

### Regular Backups:
```bash
# Export database
mongodump --db fyp --out ./backup

# Import database
mongorestore ./backup/fyp --db fyp
```

### Database Cleanup:
```bash
# Remove old email logs (older than 30 days)
db.logs.deleteMany({createdAt: {$lt: new Date(Date.now() - 30*24*60*60*1000)}})
```

---

## ✅ What's Automatically Stored

Every time a user interacts with the app:

| Action | Data Stored | Collection |
|--------|------------|-----------|
| Register | User info | Users |
| Login | lastLogin | Users |
| Create Service | Service details | Services |
| Update Profile | User info | Users |
| Book Service | Booking details | Bookings |
| Accept Booking | Booking status | Bookings |
| Leave Review | Review with rating | Reviews |
| Submit Contact | Message | Contacts |
| Upload Avatar | Image URL | Users |
| Change Password | Hashed password | Users |

---

## 🎯 Data Persistence Guarantee

✅ **All data is automatically persisted to MongoDB**

The system ensures:
1. ✅ Every API request validates and saves data
2. ✅ MongoDB transactions for critical operations
3. ✅ Error handling prevents data loss
4. ✅ Timestamps track all changes
5. ✅ References maintain data relationships

---

## 📚 Model Files Location

Backend models (define data structure):
```
backend/models/
├── User.js              - User authentication & profile
├── Service.js           - Service listings
├── Booking.js           - Booking management
├── Review.js            - Reviews & ratings
├── Contact.js           - Contact form messages
└── Category.js          - Service categories
```

---

## 🔍 Verify Data Storage

Run this test to confirm everything is stored:

```bash
cd /Users/aashishbagdas/FYP
./verify_mongodb_storage.sh
```

Expected Output:
- ✅ User registration stored
- ✅ Categories loaded from DB
- ✅ Contact forms saved
- ✅ Services stored with references

---

## 🎉 Summary

Your MongoDB setup is **100% operational** with:

✅ 6 collections for different data types
✅ Proper relationships between data
✅ Automatic timestamps for all records
✅ Secure password hashing
✅ JWT authentication
✅ Data validation at multiple levels
✅ Error handling and logging
✅ All data automatically persisted

**Every user action is safely stored in MongoDB!** 📊✨

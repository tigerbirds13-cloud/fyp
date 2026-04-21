# 🔍 MongoDB Data Access Guide

**How to View & Manage Your Data in MongoDB**

---

## 📊 3 Ways to Access Your Data

### Option 1️⃣: MongoDB CLI (Command Line)

#### Install MongoDB CLI Tools:
```bash
# On macOS with Homebrew
brew tap mongodb/brew
brew install mongodb-community

# Verify installation
mongosh --version
```

#### Connect to Database:
```bash
# Start MongoDB shell
mongosh

# Select your database
use fyp

# List all collections
show collections
```

#### Common Queries:

**View all users:**
```javascript
db.users.find()
```

**View specific user:**
```javascript
db.users.findOne({email: "user@example.com"})
```

**Count users:**
```javascript
db.users.countDocuments()
```

**Get all services:**
```javascript
db.services.find()
```

**Get service by provider:**
```javascript
db.services.find({provider: ObjectId("USER_ID_HERE")})
```

**Get all bookings:**
```javascript
db.bookings.find()
```

**Get pending bookings:**
```javascript
db.bookings.find({status: "pending"})
```

**Get all contacts:**
```javascript
db.contacts.find()
```

**Get reviews for specific helper:**
```javascript
db.reviews.find({helper: ObjectId("HELPER_ID_HERE")})
```

**Count data in each collection:**
```javascript
db.users.countDocuments()
db.services.countDocuments()
db.bookings.countDocuments()
db.reviews.countDocuments()
db.contacts.countDocuments()
```

---

### Option 2️⃣: MongoDB Compass (GUI Tool)

#### Install MongoDB Compass:
1. Go to https://www.mongodb.com/products/compass
2. Download for your operating system
3. Install and launch

#### Connect to Database:
1. Click "New Connection"
2. Connection String: `mongodb://127.0.0.1:27017`
3. Click "Connect"
4. Select database: `fyp`
5. Browse collections visually

#### Browse Data:
- Click on collection name
- View documents in table/JSON format
- Click document to see details
- Edit documents directly
- Add/delete documents
- Export data as JSON/CSV

#### Features:
- Visual data browser
- Query builder
- Real-time updates
- Document editing
- Schema visualization

---

### Option 3️⃣: REST API (Most Convenient)

#### Get All Services:
```bash
curl http://localhost:5002/api/services
```

#### Get All Categories:
```bash
curl http://localhost:5002/api/categories
```

#### Get All Helpers:
```bash
curl http://localhost:5002/api/auth/helpers
```

#### Get Bookings (with auth token):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5002/api/bookings
```

#### Get Contacts (with auth token):
```bash
curl -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  http://localhost:5002/api/contact
```

---

## 🔐 Getting Your JWT Token

To access protected endpoints, you need a token:

```bash
# Register/Login to get token
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Your Name",
    "email": "your@email.com",
    "password": "Password123!",
    "role": "admin"
  }'

# Response includes "token": "YOUR_JWT_TOKEN"
# Use this token in Authorization header
```

---

## 📋 Data Viewing Examples

### Example 1: View User Profile

```bash
# Get all users
mongo fyp
db.users.find()

# Output might look like:
{
  _id: ObjectId("507f1f77bcf86cd799439011"),
  name: "John Helper",
  email: "john@example.com",
  role: "helper",
  avatar: "https://...",
  bio: "Professional with 5+ years experience",
  location: "New York",
  rating: 4.8,
  totalJobs: 23,
  createdAt: ISODate("2026-04-01..."),
  updatedAt: ISODate("2026-04-04...")
}
```

### Example 2: View Service Listing

```bash
db.services.findOne()

# Output:
{
  _id: ObjectId("507f1f77bcf86cd799439012"),
  name: "Home Cleaning",
  description: "Professional house cleaning service",
  price: 75,
  category: ObjectId("507f1f77bcf86cd799439001"),
  provider: ObjectId("507f1f77bcf86cd799439011"),
  location: "New York",
  tags: ["cleaning", "professional"],
  totalJobs: 12,
  status: "active",
  createdAt: ISODate("2026-04-02...")
}
```

### Example 3: View Booking

```bash
db.bookings.findOne()

# Output:
{
  _id: ObjectId("507f1f77bcf86cd799439013"),
  service: ObjectId("507f1f77bcf86cd799439012"),
  seeker: ObjectId("507f1f77bcf86cd799439020"),
  helper: ObjectId("507f1f77bcf86cd799439011"),
  scheduledDate: ISODate("2026-04-10..."),
  location: "123 Main St, New York",
  status: "accepted",
  totalPrice: 75,
  createdAt: ISODate("2026-04-05...")
}
```

---

## 🔧 Advanced Queries

### Find users by role:
```javascript
db.users.find({role: "helper"})
```

### Find services over $100:
```javascript
db.services.find({price: {$gt: 100}})
```

### Find completed bookings:
```javascript
db.bookings.find({status: "completed"})
```

### Find reviews with 5 stars:
```javascript
db.reviews.find({rating: 5})
```

### Find contacts from last 7 days:
```javascript
db.contacts.find({
  createdAt: {$gte: new Date(Date.now() - 7*24*60*60*1000)}
})
```

### Count bookings by status:
```javascript
db.bookings.aggregate([
  {$group: {_id: "$status", count: {$sum: 1}}}
])
```

---

## 📊 Export Data

### Export collection to JSON:
```bash
mongoexport --db fyp --collection users --out users.json
mongoexport --db fyp --collection services --out services.json
```

### Export all collections:
```bash
mongodump --db fyp --out ./backup
```

### Import backup:
```bash
mongorestore ./backup
```

---

## 🛡️ Backup Your Data

### Create backup:
```bash
# Full backup
mongodump --db fyp --out /backup/fyp_$(date +%Y%m%d)

# Specific collection
mongodump --db fyp --collection users --out ./users_backup
```

### Schedule regular backups:
```bash
# Add to crontab for daily backup at 2 AM
0 2 * * * mongodump --db fyp --out /backup/fyp_$(date +\%Y\%m\%d)
```

---

## 📱 Via Frontend Application

The easiest way to manage data is through the app itself:

1. **View Users:** Login → Admin Dashboard → User Management
2. **View Services:** Home → Browse Services or My Services
3. **View Bookings:** Dashboard → My Bookings
4. **View Contacts:** Admin Dashboard → Messages
5. **View Reviews:** Service page → Reviews section

---

## 📈 Database Statistics

### Check database size:
```javascript
use fyp
db.stats()
```

### Get storage stats:
```javascript
db.users.totalSize()
db.services.totalSize()
db.bookings.totalSize()
```

### List all indexes:
```javascript
db.users.getIndexes()
db.services.getIndexes()
db.bookings.getIndexes()
```

---

## ✅ Quick Reference Table

| Task | Method | Command |
|------|--------|---------|
| View all data in a collection | CLI | `db.COLLECTION.find()` |
| View specific document | CLI | `db.COLLECTION.findOne()` |
| Count documents | CLI | `db.COLLECTION.countDocuments()` |
| Export to JSON | CLI | `mongoexport -d fyp -c COLLECTION` |
| Backup database | CLI | `mongodump -d fyp` |
| Visual browse | Compass | GUI Interface |
| API access | REST | `curl http://localhost:5002/api/...` |
| Browse in app | Frontend | Login to dashboard |

---

## 🚨 Important Notes

⚠️ **Never modify data directly in production without backup**
⚠️ **Always test changes in development first**
⚠️ **Keep regular backups**
⚠️ **Use Compass for safe editing**

---

## 🎯 What Data Means

### User Fields:
- `email`: Contact identifier
- `role`: User type (seeker/helper/admin)
- `totalJobs`: Bookings completed
- `rating`: Average review rating

### Service Fields:
- `provider`: Which helper offers it
- `category`: Type of service
- `price`: Cost in dollars
- `totalJobs`: Times booked

### Booking Fields:
- `status`: Current state (pending/accepted/completed)
- `seeker`: Who booked it
- `helper`: Who's providing it
- `scheduledDate`: When it's happening

---

## 🔗 Reference Links

- [MongoDB Manual](https://docs.mongodb.com/manual/)
- [MongoDB Compass Docs](https://docs.mongodb.com/compass/)
- [MongoDB Query Language](https://docs.mongodb.com/manual/reference/method/)
- [Mongoose Schema Guide](https://mongoosejs.com/docs/guide.html)

---

## 📞 Troubleshooting

### MongoDB won't connect:
```bash
# Check if MongoDB is running
ps aux | grep mongod

# Start MongoDB
brew services start mongodb-community
```

### Can't find data:
1. Verify correct database: `use fyp`
2. List collections: `show collections`
3. Check spelling of collection name
4. Try: `db.users.find().limit(5)`

### Compass won't connect:
1. Start MongoDB first
2. Connection: `mongodb://127.0.0.1:27017`
3. Click "Advanced Options" if needed
4. Check firewall settings

---

## 🎉 Summary

Your MongoDB setup has:
- ✅ 6 operational collections
- ✅ Full data persistence
- ✅ Multiple access methods
- ✅ Backup capabilities
- ✅ Visual management tools
- ✅ API access

**All your application data is safely stored in MongoDB!** 📊✨

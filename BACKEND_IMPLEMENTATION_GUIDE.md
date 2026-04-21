# Backend Implementation Guide

## Summary of Changes

### ✅ Completed Backend Implementation

This document summarizes all the backend functionality that has been implemented to support the frontend features.

---

## 📋 What Was Done

### 1. **Fixed Server Configuration**
- ✅ Updated `server.js` to register all routes
- Routes registered: auth, services, categories, contact, bookings, reviews

### 2. **Enhanced Models**

#### User Model
- Added: `location`, `skills`, `avatar`, `rating`, `totalJobs`, `phoneNumber`, `bio`
- Better support for helper profiles

#### Service Model  
- Added: `location`, `tags`, `totalJobs`, `image`, `duration`
- Better filtering and search capabilities

#### New: Booking Model
- Tracks service bookings between seekers and helpers
- Status: pending, accepted, completed, cancelled
- Fields: service, seeker, helper, scheduledDate, location, notes, price

#### New: Review Model
- Allows seekers to review helpers
- Stores: rating (1-5), comments, references to service and booking
- Automatically calculates helper average rating

### 3. **Created New Controllers**

#### BookingController
- `createBooking` - Seeker books a service
- `getMyBookings` - Get all user's bookings
- `getBooking` - Get single booking details
- `updateBookingStatus` - Helper accepts/completes bookings
- `cancelBooking` - Cancel a booking

#### ReviewController
- `createReview` - Leave a review for a service
- `getServiceReviews` - Get all reviews for a service
- `getHelperReviews` - Get all reviews for a helper
- `updateReview` - Edit your review
- `deleteReview` - Delete your review
- Auto-calculates helper rating based on reviews

### 4. **Enhanced Controllers**

#### AuthController - Added Methods
- `updateProfile` - Update user profile (name, location, skills, etc.)
- `changePassword` - Change password with current password verification
- `getAllHelpers` - Get list of all helpers
- `getHelperProfile` - Get specific helper's profile

#### ServiceController - Enhanced
- `getAllServices` - Now supports filtering by category, location, search
- `getServicesByLocation` - Filter by location
- `getServicesByCategory` - Filter by category
- `getServicesByProvider` - Get services by a specific helper
- Better error handling and validation

### 5. **Created Routes**

#### Booking Routes (`/api/bookings`)
- POST - Create booking
- GET - Get my bookings
- GET :id - Get single booking
- PATCH :id/status - Update status
- DELETE :id - Cancel booking

#### Review Routes (`/api/reviews`)
- POST - Create review
- GET /service/:serviceId - Get service reviews
- GET /helper/:helperId - Get helper reviews
- GET :id - Get single review
- PATCH :id - Update review
- DELETE :id - Delete review

#### Enhanced Auth Routes
- GET /helpers - Get all helpers
- GET /helpers/:id - Get helper profile
- PATCH /update-profile - Update profile
- PATCH /change-password - Change password

#### Enhanced Service Routes
- GET /location/:location - Filter by location
- GET /category/:categoryId - Filter by category  
- GET /provider/:providerId - Get services by provider

---

## 🚀 How to Run

### 1. Setup Environment Variables
Create a `.env` file in the `backend` directory:
```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fyp
JWT_SECRET=your_secret_key_here
JWT_EXPIRES_IN=7d
NODE_ENV=development
```

### 2. Install Dependencies (if not already done)
```bash
cd backend
npm install
```

### 3. Start MongoDB
Make sure MongoDB is running on your system. You can use:
- MongoDB Community Edition installed locally
- MongoDB Atlas (cloud) by updating MONGODB_URI

### 4. Start the Backend Server
```bash
npm run server
# or
npm start
```

The server should start on `http://localhost:5000`

To verify it's running:
```bash
curl http://localhost:5000/api/health
# Should return: { "message": "Backend is running" }
```

---

## 📚 API Endpoints Overview

### Authentication
- POST `/api/auth/register` - Register new user
- POST `/api/auth/login` - Login
- GET `/api/auth/me` - Get current user (protected)
- PATCH `/api/auth/update-profile` - Update profile (protected)
- PATCH `/api/auth/change-password` - Change password (protected)
- GET `/api/auth/helpers` - Get all helpers
- GET `/api/auth/helpers/:id` - Get helper profile

### Services
- GET `/api/services` - Get services (with filters: category, location, search)
- GET `/api/services/:id` - Get single service
- POST `/api/services` - Create service (helper only, protected)
- PATCH `/api/services/:id` - Update service (owner only, protected)
- DELETE `/api/services/:id` - Delete service (owner only, protected)
- GET `/api/services/location/:location` - Filter by location
- GET `/api/services/category/:categoryId` - Filter by category
- GET `/api/services/provider/:providerId` - Get services by provider

### Bookings
- POST `/api/bookings` - Create booking (protected)
- GET `/api/bookings` - Get my bookings (protected)
- GET `/api/bookings/:id` - Get single booking (protected)
- PATCH `/api/bookings/:id/status` - Update status (helper only, protected)
- DELETE `/api/bookings/:id` - Cancel booking (protected)

### Reviews
- POST `/api/reviews` - Create review (protected)
- GET `/api/reviews/service/:serviceId` - Get service reviews
- GET `/api/reviews/helper/:helperId` - Get helper reviews
- GET `/api/reviews/:id` - Get single review
- PATCH `/api/reviews/:id` - Update review (protected)
- DELETE `/api/reviews/:id` - Delete review (protected)

### Categories
- GET `/api/categories` - Get all categories
- POST `/api/categories` - Create category (admin only, protected)

### Contact
- POST `/api/contact` - Submit contact form
- GET `/api/contact` - Get all messages (admin only, protected)
- PATCH `/api/contact/:id/read` - Mark as read (admin only, protected)

---

## 🔐 Authentication

All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <token>
```

Tokens are obtained from:
- `/api/auth/register` - Returns token after registration
- `/api/auth/login` - Returns token after login

---

## 👥 User Roles

- **seeker**: Can search services, create bookings, and leave reviews
- **helper**: Can create/update services and manage bookings
- **admin**: Can manage categories and view contact messages

---

## 📖 Full API Documentation

See [API_DOCUMENTATION.md](./API_DOCUMENTATION.md) for complete API reference with examples.

---

## ✨ Key Features Implemented

1. **User Management**
   - Registration with role selection
   - Profile updates with skills and location
   - Password change functionality
   - Helper profile browsing

2. **Service Management**
   - Create, read, update, delete services
   - Filter by location, category, search
   - Provider profile integration
   - Tags and skills for services

3. **Booking System**
   - Seeker books services
   - Helper accepts/completes bookings
   - Booking status tracking
   - Location and scheduling

4. **Review System**
   - Leave reviews and ratings
   - Auto-calculated helper ratings
   - View service and helper reviews
   - Edit/delete own reviews

5. **Contact Management**
   - Submit contact forms
   - Admin views all inquiries
   - Mark messages as read

---

## 🐛 Troubleshooting

### MongoDB Connection Issues
- Make sure MongoDB is running
- Check MONGODB_URI in .env file
- For MongoDB Atlas, ensure your IP is whitelisted

### CORS Errors
- The backend is configured to accept requests from all origins
- If issues persist, check the CORS middleware in server.js

### Invalid Token
- Make sure you're including the "Bearer " prefix
- Tokens expire in 7 days by default
- Re-login to get a new token

### Port Already in Use
- Change PORT in .env file
- Or kill the process using port 5000

---

## 📝 Next Steps for Frontend Integration

1. Update frontend API calls to use these endpoints
2. Store JWT token in localStorage/sessionStorage
3. Include token in all protected endpoint calls
4. Handle authentication errors and redirect to login
5. Display booking and review information in UI

---

## 📞 Support

For issues or questions, refer to:
- API_DOCUMENTATION.md for endpoint details
- Database schema comments in model files
- Controller function documentation

Good luck! 🎉

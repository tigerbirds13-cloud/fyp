# 📐 HomeTownHelper - Architecture & Technical Structure SRS

## Software Requirements Specification - Complete System Architecture

**Project Name:** HomeTownHelper  
**Type:** Full-Stack MERN Application  
**Date:** April 21, 2026  
**Version:** 1.0.0  
**Status:** Production Ready

---

## Table of Contents

1. [System Overview](#1-system-overview)
2. [Architecture Design](#2-architecture-design)
3. [Technology Stack](#3-technology-stack)
4. [Project Structure](#4-project-structure)
5. [Frontend Architecture](#5-frontend-architecture)
6. [Backend Architecture](#6-backend-architecture)
7. [Database Architecture](#7-database-architecture)
8. [API Architecture](#8-api-architecture)
9. [Authentication & Security](#9-authentication--security)
10. [Data Flow](#10-data-flow)
11. [Module Dependencies](#11-module-dependencies)
12. [Deployment Architecture](#12-deployment-architecture)

---

## 1. System Overview

### 1.1 Project Description

HomeTownHelper is a MERN (MongoDB, Express, React, Node.js) full-stack web application connecting service seekers with service providers for home-based services (cleaning, repairs, tutoring, etc.) in Nepal with integrated payment processing via Khalti.

### 1.2 System Scope

```
┌─────────────────────────────────────────────────────────┐
│          HomeTownHelper MERN Application                │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────┐    ┌──────────────┐                 │
│  │   Frontend   │◄───►│   Backend    │                 │
│  │   React 18   │    │  Express.js  │                 │
│  │  Port: 3000  │    │  Port: 5002  │                 │
│  └──────────────┘    └──────────────┘                 │
│         │                    │                          │
│         └────────┬───────────┘                          │
│                  │                                      │
│         ┌────────▼─────────┐                            │
│         │    MongoDB       │                            │
│         │    Database      │                            │
│         └──────────────────┘                            │
│                                                          │
│         ┌──────────────────────────┐                    │
│         │  Third-Party Services    │                    │
│         ├──────────────────────────┤                    │
│         │ • Khalti (Payment)       │                    │
│         │ • Gmail (Email)          │                    │
│         │ • Google OAuth 2.0       │                    │
│         └──────────────────────────┘                    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### 1.3 Key Features

- **User Management:** Authentication, registration, profile management
- **Service Booking:** Create, manage, and track service bookings
- **Subscription System:** Pro/Elite plans with Khalti payment
- **Payment Processing:** Integrated Khalti gateway for NPR transactions
- **Notifications:** Real-time user notifications
- **Search & Filter:** Advanced search for services
- **Ratings & Reviews:** User feedback system
- **Email Verification:** Gmail-based email confirmation
- **OAuth Integration:** Google OAuth 2.0 login

---

## 2. Architecture Design

### 2.1 Overall Architecture Pattern

```
┌─────────────────────────────────────────────────────────────┐
│                  CLIENT LAYER (Frontend)                    │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  React Components  │  Redux/Context  │  React Router │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ HTTP/REST API
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              API LAYER (Backend)                            │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Express Middleware  │  Route Handlers               │  │
│  │  Authentication      │  Controllers                  │  │
│  │  Error Handling      │  Validation                   │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Database Query
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           BUSINESS LOGIC LAYER (Controllers)                │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Service Controllers  │  Data Validation            │  │
│  │  Business Rules       │  Error Handling             │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ Mongoose ODM
                            ▼
┌─────────────────────────────────────────────────────────────┐
│           DATA ACCESS LAYER (Models)                        │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Schema Definitions  │  Validation                  │  │
│  │  Database Indexing   │  References                  │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
                            │
                            │ MongoDB Protocol
                            ▼
┌─────────────────────────────────────────────────────────────┐
│            DATABASE LAYER (MongoDB)                         │
│  ┌───────────────────────────────────────────────────────┐  │
│  │  Collections  │  Indexes  │  Aggregation            │  │
│  └───────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────┘
```

### 2.2 Architectural Patterns Used

| Pattern            | Implementation                                | Purpose                |
| ------------------ | --------------------------------------------- | ---------------------- |
| MVC                | React Components, Express Controllers, Models | Separation of Concerns |
| REST API           | Express Routes                                | API Communication      |
| Middleware         | Authentication, Validation, Error Handling    | Cross-cutting Concerns |
| Context API        | React Context Provider                        | State Management       |
| Services Pattern   | khaltiService, emailService                   | Encapsulation          |
| Repository Pattern | Database Models (Mongoose)                    | Data Access            |
| Factory Pattern    | User, Booking creation                        | Object Creation        |

---

## 3. Technology Stack

### 3.1 Frontend Stack

```
Framework:        React 18.2.0
Build Tool:       Create React App
State Management: React Context API
Routing:          React Router DOM 6.x
HTTP Client:      Axios 1.4.0
UI/Styling:       CSS Modules, Tailwind CSS
PDF Generation:   jsPDF, jspdf-autotable
Icons:            React Icons
Node Version:     v16.x / v18.x
NPM:              v8.x / v9.x
```

### 3.2 Backend Stack

```
Runtime:          Node.js (v16.x / v18.x)
Framework:        Express.js 4.x
Database:         MongoDB 5.x / 6.x
ODM:              Mongoose 7.x
Authentication:   JWT (JSON Web Tokens)
Email:            Nodemailer
Password Hash:    bcryptjs
Environment:      dotenv
Logging:          Custom logging system
Payment Gateway:  Khalti Payment API
```

### 3.3 Database Stack

```
Database:         MongoDB (Cloud/Local)
Connection:       Mongoose ODM
Version:          5.x or later
Storage Engine:   WiredTiger
Indexing:         Custom indexes on key fields
Backup:           MongoDB native backup
```

### 3.4 Third-Party Integrations

| Service       | Purpose            | Status        |
| ------------- | ------------------ | ------------- |
| Khalti        | Payment Processing | ✅ Integrated |
| Gmail         | Email Verification | ✅ Integrated |
| Google OAuth  | Social Login       | ✅ Integrated |
| MongoDB Atlas | Cloud Database     | ✅ Integrated |

---

## 4. Project Structure

### 4.1 Root Directory Structure

```
/FYP (Project Root)
├── backend/
│   ├── controllers/
│   ├── models/
│   ├── routes/
│   ├── middleware/
│   ├── utils/
│   ├── uploads/
│   ├── logs/
│   ├── server.js
│   ├── package.json
│   └── .env
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── context/
│   │   ├── styles/
│   │   ├── App.js
│   │   └── index.js
│   ├── package.json
│   └── .env
│
├── package.json (root)
├── .env (root)
└── [Documentation Files]
```

### 4.2 Backend Folder Structure (Detailed)

```
backend/
│
├── controllers/
│   ├── authController.js      (Authentication logic)
│   ├── userController.js      (User management)
│   ├── bookingController.js   (Booking operations)
│   ├── jobController.js       (Job/Service management)
│   ├── categoryController.js  (Categories)
│   ├── contactController.js   (Contact messages)
│   ├── subscriptionController.js  (Subscription logic)
│   ├── profileController.js   (User profile)
│   ├── reviewController.js    (Reviews & ratings)
│   ├── notificationController.js  (Notifications)
│   └── adminController.js     (Admin functions)
│
├── models/
│   ├── User.js                (User schema)
│   ├── Booking.js             (Booking schema)
│   ├── Job.js                 (Job/Service schema)
│   ├── Category.js            (Category schema)
│   ├── Contact.js             (Contact message schema)
│   ├── Subscription.js        (Subscription schema)
│   ├── Review.js              (Review schema)
│   ├── BillingCustomer.js     (Billing info schema)
│   ├── Notification.js        (Notification schema)
│   └── PaymentLog.js          (Payment logging schema)
│
├── routes/
│   ├── authRoutes.js          (Auth endpoints)
│   ├── userRoutes.js          (User endpoints)
│   ├── bookingRoutes.js       (Booking endpoints)
│   ├── jobRoutes.js           (Job endpoints)
│   ├── categoryRoutes.js      (Category endpoints)
│   ├── contactRoutes.js       (Contact endpoints)
│   ├── subscriptionRoutes.js  (Subscription endpoints)
│   ├── profileRoutes.js       (Profile endpoints)
│   ├── reviewRoutes.js        (Review endpoints)
│   ├── notificationRoutes.js  (Notification endpoints)
│   └── adminRoutes.js         (Admin endpoints)
│
├── middleware/
│   ├── auth.js                (Authentication middleware)
│   ├── errorHandler.js        (Error handling)
│   ├── validation.js          (Input validation)
│   ├── cors.js                (CORS configuration)
│   ├── rateLimiter.js         (Rate limiting)
│   └── logger.js              (Logging middleware)
│
├── utils/
│   ├── khaltiService.js       (Khalti integration)
│   ├── emailService.js        (Email sending)
│   ├── paymentLogger.js       (Payment logging)
│   ├── validators.js          (Validation functions)
│   ├── errorFormatter.js      (Error formatting)
│   └── helpers.js             (Utility functions)
│
├── uploads/                   (User uploads directory)
│   └── [profile images, documents]
│
├── logs/                      (Application logs)
│   ├── error.log
│   ├── access.log
│   └── payment.log
│
├── server.js                  (Main server entry point)
├── package.json               (Dependencies)
├── .env                       (Environment variables)
└── .gitignore
```

### 4.3 Frontend Folder Structure (Detailed)

```
frontend/src/
│
├── components/
│   ├── Auth/
│   │   ├── LoginForm.jsx
│   │   ├── SignupForm.jsx
│   │   └── GoogleLoginBtn.jsx
│   │
│   ├── Navigation/
│   │   ├── Navbar.jsx
│   │   ├── Sidebar.jsx
│   │   └── Footer.jsx
│   │
│   ├── Services/
│   │   ├── ServiceCard.jsx
│   │   ├── ServiceList.jsx
│   │   ├── ServiceDetail.jsx
│   │   └── PricingPage.jsx
│   │
│   ├── Booking/
│   │   ├── BookingForm.jsx
│   │   ├── BookingCard.jsx
│   │   ├── BookingList.jsx
│   │   └── PaymentCallbackModal.jsx
│   │
│   ├── Profile/
│   │   ├── ProfilePage.jsx
│   │   ├── EditProfile.jsx
│   │   └── UserSettings.jsx
│   │
│   ├── Subscription/
│   │   ├── SubscriptionModal.jsx
│   │   └── SubscriptionSuccessModal.jsx
│   │
│   ├── Dashboard/
│   │   ├── DashboardHome.jsx
│   │   ├── DashboardSidebar.jsx
│   │   ├── UserDashboard.jsx
│   │   └── HelperDashboard.jsx
│   │
│   ├── Common/
│   │   ├── Loader.jsx
│   │   ├── ErrorMessage.jsx
│   │   ├── SuccessMessage.jsx
│   │   └── Modal.jsx
│   │
│   └── Home/
│       ├── Hero.jsx
│       ├── Features.jsx
│       └── HomeTownHelper.jsx (Main home component)
│
├── pages/
│   ├── Home.jsx
│   ├── Login.jsx
│   ├── Signup.jsx
│   ├── Dashboard.jsx
│   ├── Services.jsx
│   ├── Booking.jsx
│   ├── Profile.jsx
│   ├── NotFound.jsx
│   └── Admin.jsx
│
├── context/
│   ├── AuthContext.jsx        (Authentication state)
│   ├── UserContext.jsx        (User state)
│   ├── BookingContext.jsx     (Booking state)
│   ├── NotificationContext.jsx (Notification state)
│   └── ThemeContext.jsx       (Theme/UI state)
│
├── styles/
│   ├── App.css
│   ├── components.css
│   ├── pages.css
│   ├── variables.css
│   └── responsive.css
│
├── utils/
│   ├── api.js                 (API client)
│   ├── validation.js          (Frontend validation)
│   ├── formatters.js          (Data formatting)
│   └── constants.js           (Constants)
│
├── App.jsx                    (Main App component)
├── App.css
├── index.js                   (React DOM render)
├── index.css
└── .env                       (Frontend environment)

public/
├── index.html
├── favicon.ico
└── [static assets]
```

---

## 5. Frontend Architecture

### 5.1 Frontend Component Hierarchy

```
App
├── Router Setup
├── AuthContext Provider
│   ├── Home Page
│   │   ├── Hero Component
│   │   ├── Features Component
│   │   └── Services Preview
│   │
│   ├── Auth Pages (Login/Signup)
│   │   ├── LoginForm
│   │   ├── SignupForm
│   │   └── GoogleLoginBtn
│   │
│   ├── Dashboard (Protected)
│   │   ├── UserDashboard
│   │   │   ├── My Bookings
│   │   │   └── Profile
│   │   │
│   │   └── HelperDashboard
│   │       ├── My Jobs
│   │       └── Earnings
│   │
│   ├── Services Page
│   │   ├── Search/Filter
│   │   ├── ServiceCard (List)
│   │   └── ServiceDetail
│   │
│   ├── Booking Flow
│   │   ├── BookingForm
│   │   ├── PaymentModal
│   │   ├── PaymentCallbackModal
│   │   └── SubscriptionSuccessModal
│   │
│   ├── Profile Page
│   │   ├── View Profile
│   │   ├── Edit Profile
│   │   └── Settings
│   │
│   └── Navigation
│       ├── Navbar
│       ├── Sidebar
│       └── Footer
```

### 5.2 State Management

```
AuthContext
├── user (current logged-in user)
├── isAuthenticated (boolean)
├── token (JWT token)
├── login(email, password)
├── logout()
└── register(userData)

UserContext
├── userProfile (detailed profile)
├── userType (seeker/helper)
├── getProfile()
└── updateProfile(data)

BookingContext
├── bookings (list of bookings)
├── currentBooking (active booking)
├── getBookings()
├── createBooking(data)
└── updateBooking(id, data)

NotificationContext
├── notifications (list)
├── unreadCount (number)
├── getNotifications()
└── markAsRead(id)
```

### 5.3 Frontend Data Flow

```
User Interaction
    ↓
React Component (Event Handler)
    ↓
Context API / State Update
    ↓
API Call (axios)
    ↓
Backend Route Handler
    ↓
Backend Controller
    ↓
Database Operation
    ↓
Response to Frontend
    ↓
Context Update
    ↓
Component Re-render
    ↓
UI Display Updated
```

---

## 6. Backend Architecture

### 6.1 Request Processing Pipeline

```
HTTP Request
    ↓
Express Server
    ↓
Middleware Chain:
├── bodyParser (Parse JSON)
├── cors (Handle CORS)
├── logger (Log request)
├── rateLimiter (Rate limiting)
└── auth (Authentication)
    ↓
Route Handler
    ↓
Controller Function
    ├── Input Validation
    ├── Authorization Check
    ├── Business Logic
    ├── Model Operations
    └── Response Formatting
    ↓
Error Handler (if error)
    ├── Error Logging
    ├── Error Formatting
    └── Error Response
    ↓
HTTP Response
```

### 6.2 Controller Architecture

```
Controllers/
├── authController.js
│   ├── register()        - New user registration
│   ├── login()           - User login
│   ├── logout()          - User logout
│   ├── refreshToken()    - Token refresh
│   ├── googleAuth()      - Google OAuth
│   └── verifyEmail()     - Email verification
│
├── bookingController.js
│   ├── createBooking()   - Create new booking
│   ├── getBookings()     - Fetch user bookings
│   ├── updateBooking()   - Update booking status
│   ├── cancelBooking()   - Cancel booking
│   └── completeBooking() - Mark complete
│
├── subscriptionController.js
│   ├── initiateUpgradeCheckout()   - Start payment
│   ├── verifyUpgradeCheckout()     - Verify payment
│   └── getCurrentSubscription()    - Get user subscription
│
├── jobController.js
│   ├── createJob()       - Create service listing
│   ├── getJobs()         - List jobs
│   ├── getJobDetail()    - Get single job
│   ├── updateJob()       - Update job
│   └── deleteJob()       - Remove job
│
└── [other controllers...]
```

### 6.3 Middleware Stack

```
Server Initialization
    ↓
┌─ Express App Setup
│  ├── bodyParser()
│  ├── urlencoded()
│  └── static files
│   ↓
│  ┌─ CORS Middleware
│  │   └── Allow cross-origin requests
│   ↓
│  ┌─ Logger Middleware
│  │   └── Log all requests
│   ↓
│  ┌─ Rate Limiter
│  │   └── Prevent abuse
│   ↓
│  ┌─ Route Handlers
│  │  ├── Auth Routes
│  │  │  └─ authMiddleware (check JWT)
│  │  ├── Booking Routes
│  │  │  └─ authMiddleware
│  │  ├── Subscription Routes
│  │  │  └─ authMiddleware
│  │  └── Public Routes
│   ↓
│  ┌─ Error Handler
│  │   └── Global error handling
│   ↓
└─ Server Running
```

### 6.4 Service Layer

```
utils/
├── khaltiService.js
│   ├── initiatePayment()
│   ├── verifyPayment()
│   └── handlePaymentWebhook()
│
├── emailService.js
│   ├── sendVerificationEmail()
│   ├── sendBookingConfirmation()
│   ├── sendPaymentReceipt()
│   └── sendNotificationEmail()
│
├── paymentLogger.js
│   ├── logPaymentAttempt()
│   ├── logPaymentSuccess()
│   ├── logPaymentFailure()
│   └── getPaymentHistory()
│
└── validators.js
    ├── validateEmail()
    ├── validatePhone()
    ├── validateBooking()
    └── validatePayment()
```

---

## 7. Database Architecture

### 7.1 MongoDB Collections & Schema

#### User Collection

```
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  email: String (unique),
  phone: String,
  password: String (hashed),
  role: Enum ["seeker", "helper", "admin"],
  profilePhoto: String (URL),
  address: {
    street: String,
    city: String,
    district: String,
    province: String,
    zipCode: String
  },
  bio: String,
  skills: [String],
  rating: Number,
  reviews: [{
    reviewer: ObjectId (ref: User),
    rating: Number,
    comment: String,
    date: Date
  }],
  isVerified: Boolean,
  verificationToken: String,
  googleId: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Booking Collection

```
{
  _id: ObjectId,
  seeker: ObjectId (ref: User),
  helper: ObjectId (ref: User),
  job: ObjectId (ref: Job),
  category: ObjectId (ref: Category),
  status: Enum ["pending", "accepted", "in-progress", "completed", "cancelled"],
  scheduledDate: Date,
  scheduledTime: String,
  location: {
    address: String,
    city: String,
    coordinates: { latitude, longitude }
  },
  description: String,
  estimatedCost: Number,
  actualCost: Number,
  paymentStatus: Enum ["pending", "completed", "failed"],
  paymentMethod: String,
  khaltiTransactionId: String,
  notes: String,
  rating: Number,
  feedback: String,
  createdAt: Date,
  updatedAt: Date
}
```

#### Subscription Collection

```
{
  _id: ObjectId,
  userId: ObjectId (ref: User, unique),
  plan: Enum ["pro", "elite"],
  userType: Enum ["seeker", "helper"],
  status: Enum ["active", "pending", "cancelled"],
  amount: Number,
  currency: String,
  paymentMethod: String,
  khaltiPidx: String (unique),
  khaltiTransactionId: String,
  currentPeriodEnd: Date,
  benefits: [String],
  createdAt: Date,
  updatedAt: Date
}
```

#### Job Collection

```
{
  _id: ObjectId,
  helper: ObjectId (ref: User),
  category: ObjectId (ref: Category),
  title: String,
  description: String,
  skills: [String],
  hourlyRate: Number,
  dayRate: Number,
  availability: [{
    day: String,
    startTime: String,
    endTime: String
  }],
  location: {
    city: String,
    district: String
  },
  rating: Number,
  reviews: [{
    reviewer: ObjectId,
    rating: Number,
    comment: String,
    date: Date
  }],
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

#### Additional Collections

```
Category
├── _id: ObjectId
├── name: String
├── description: String
├── icon: String
└── subcategories: [String]

Notification
├── _id: ObjectId
├── recipient: ObjectId (ref: User)
├── actor: ObjectId (ref: User)
├── type: String
├── title: String
├── message: String
├── read: Boolean
├── createdAt: Date
└── updatedAt: Date

Contact
├── _id: ObjectId
├── name: String
├── email: String
├── phone: String
├── subject: String
├── message: String
├── status: Enum ["new", "read", "resolved"]
└── createdAt: Date
```

### 7.2 Database Indexing Strategy

```
User Collection Indexes:
├── { email: 1 } (unique)
├── { phone: 1 }
├── { role: 1 }
└── { createdAt: -1 }

Booking Collection Indexes:
├── { seeker: 1 }
├── { helper: 1 }
├── { status: 1 }
├── { scheduledDate: 1 }
└── { createdAt: -1 }

Subscription Collection Indexes:
├── { userId: 1 } (unique)
├── { khaltiPidx: 1 } (unique)
├── { status: 1 }
└── { createdAt: -1 }

Job Collection Indexes:
├── { helper: 1 }
├── { category: 1 }
├── { isActive: 1 }
└── { createdAt: -1 }
```

### 7.3 Data Relationships

```
User
├── 1 ──→ Many : Bookings (as seeker)
├── 1 ──→ Many : Bookings (as helper)
├── 1 ──→ Many : Jobs (as helper)
├── 1 ──→ 1    : Subscription
├── 1 ──→ Many : Notifications
├── 1 ──→ Many : Reviews (received)
└── 1 ──→ Many : Reviews (given)

Booking
├── Many ──→ 1 : User (seeker)
├── Many ──→ 1 : User (helper)
├── Many ──→ 1 : Job
└── Many ──→ 1 : Category

Job
├── Many ──→ 1 : User (helper)
├── Many ──→ 1 : Category
└── 1 ──→ Many : Bookings
```

---

## 8. API Architecture

### 8.1 API Base Structure

```
Base URL: http://localhost:5002/api

Authentication Endpoints:
├── POST   /auth/register          - User registration
├── POST   /auth/login             - User login
├── POST   /auth/logout            - User logout
├── POST   /auth/refresh-token     - Refresh JWT
├── POST   /auth/google            - Google OAuth
├── POST   /auth/verify-email      - Email verification
└── GET    /auth/me                - Get current user

User Endpoints:
├── GET    /users/:id              - Get user profile
├── PUT    /users/:id              - Update user
├── GET    /users/:id/bookings     - Get user bookings
├── GET    /users/:id/jobs         - Get user jobs
└── DELETE /users/:id              - Delete user

Booking Endpoints:
├── POST   /bookings               - Create booking
├── GET    /bookings               - List bookings
├── GET    /bookings/:id           - Get booking detail
├── PUT    /bookings/:id           - Update booking
├── DELETE /bookings/:id           - Cancel booking
└── POST   /bookings/:id/complete  - Mark complete

Job Endpoints:
├── POST   /jobs                   - Create job
├── GET    /jobs                   - List jobs
├── GET    /jobs/:id               - Get job detail
├── PUT    /jobs/:id               - Update job
└── DELETE /jobs/:id               - Delete job

Subscription Endpoints:
├── POST   /subscriptions/checkout/initiate    - Start payment
├── POST   /subscriptions/checkout/verify      - Verify payment
└── GET    /subscriptions/current              - Get subscription

Payment Endpoints:
├── POST   /payments/create-order  - Create payment order
├── POST   /payments/verify        - Verify payment
└── GET    /payments/history       - Payment history

Notification Endpoints:
├── GET    /notifications          - Get notifications
├── POST   /notifications/:id/read - Mark as read
└── DELETE /notifications/:id      - Delete notification

Admin Endpoints:
├── GET    /admin/users            - All users
├── GET    /admin/bookings         - All bookings
├── GET    /admin/payments         - Payment reports
└── POST   /admin/stats            - System statistics
```

### 8.2 Request/Response Format

#### Standard Request

```json
{
  "headers": {
    "Content-Type": "application/json",
    "Authorization": "Bearer <JWT_TOKEN>"
  },
  "body": {
    "email": "user@example.com",
    "password": "hashedPassword",
    ...fields
  }
}
```

#### Standard Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    ...response data
  },
  "timestamp": "2026-04-21T10:30:00Z"
}
```

#### Standard Error Response

```json
{
  "success": false,
  "message": "Error message",
  "error": "error_code",
  "timestamp": "2026-04-21T10:30:00Z"
}
```

### 8.3 HTTP Status Codes

| Code | Usage        |
| ---- | ------------ |
| 200  | Success      |
| 201  | Created      |
| 400  | Bad Request  |
| 401  | Unauthorized |
| 403  | Forbidden    |
| 404  | Not Found    |
| 409  | Conflict     |
| 500  | Server Error |

---

## 9. Authentication & Security

### 9.1 Authentication Flow

```
Frontend User Login
    ↓
POST /api/auth/login (email, password)
    ↓
Backend: Verify credentials
    ├── Find user by email
    ├── Compare password with hash
    └── If valid: Generate JWT
    ↓
Return: { token, user, expiresIn }
    ↓
Frontend: Store token in localStorage/context
    ↓
Subsequent Requests:
    ├── Include Authorization: Bearer <token>
    ├── Backend: Verify token middleware
    ├── Extract user from token
    └── Process request
    ↓
Token Expiry:
    ├── Frontend detects expiry
    ├── POST /api/auth/refresh-token
    ├── Backend: Issues new token
    └── Frontend: Update token
```

### 9.2 Authorization Strategy

```
Public Routes (No Auth):
├── GET /jobs                    - List jobs
├── GET /categories              - List categories
├── POST /auth/register          - Registration
├── POST /auth/login             - Login
└── GET /contact                 - Contact form

Protected Routes (Auth Required):
├── GET /users/:id               - User profile
├── POST /bookings               - Create booking
├── GET /bookings                - User bookings
├── PUT /users/:id               - Update profile
└── POST /bookings/:id/complete  - Complete booking

Admin Routes (Admin Only):
├── GET /admin/users             - All users
├── GET /admin/bookings          - All bookings
├── POST /admin/stats            - Statistics
└── DELETE /admin/users/:id      - Delete user

Helper Routes (Helper Only):
├── POST /jobs                   - Create job
├── GET /jobs/my-jobs            - Helper jobs
├── PUT /bookings/:id/accept     - Accept booking
└── POST /bookings/:id/update    - Update booking
```

### 9.3 Security Measures

| Security Feature         | Implementation            | Status       |
| ------------------------ | ------------------------- | ------------ |
| Password Hashing         | bcryptjs (10 rounds)      | ✅ Active    |
| JWT Tokens               | HS256 algorithm           | ✅ Active    |
| CORS                     | Configured origins        | ✅ Active    |
| Input Validation         | Schema validation         | ✅ Active    |
| Rate Limiting            | Per IP limiting           | ✅ Active    |
| HTTPS Ready              | SSL/TLS compatible        | ✅ Ready     |
| SQL Injection Prevention | Mongoose ODM              | ✅ Protected |
| XSS Prevention           | Input sanitization        | ✅ Protected |
| CSRF Token               | (Optional implementation) | ⏳ Planned   |

---

## 10. Data Flow

### 10.1 User Registration Flow

```
Frontend: User fills registration form
    ↓
POST /api/auth/register
├── Email validation
├── Password strength check
├── Phone format validation
└── Role selection (seeker/helper)
    ↓
Backend Controller:
├── Check email uniqueness
├── Hash password (bcrypt)
├── Create user document
├── Generate verification token
├── Send verification email
└── Return user with token
    ↓
Frontend: Store token
    ↓
User receives email
    ↓
Frontend: Click verification link
    ↓
POST /api/auth/verify-email
├── Verify token
├── Mark user as verified
└── Return success
    ↓
✅ Registration Complete
```

### 10.2 Booking Flow

```
Frontend: User searches services
    ↓
GET /api/jobs (with filters)
    ↓
Backend: Query database with filters
    ↓
Return: Jobs list
    ↓
Frontend: Display jobs
    ↓
User: Click booking button
    ↓
Frontend: Show booking form
    ↓
User: Fill details and submit
    ↓
POST /api/bookings
├── Validate booking data
├── Check helper availability
├── Create booking record (pending)
├── Send notification to helper
└── Return booking data
    ↓
Frontend: Show confirmation
    ↓
Helper: Receives notification
    ↓
Helper: Accepts/Rejects booking
    ↓
PUT /api/bookings/:id
├── Update booking status
├── Send notification to seeker
└── Return updated booking
    ↓
✅ Booking Established
```

### 10.3 Payment Flow (Subscription)

```
Frontend: User selects plan
    ↓
Display: Plan details and price
    ↓
User: Click upgrade button
    ↓
Frontend: Show payment form
    ↓
User: Enter payment details
    ↓
POST /api/subscriptions/checkout/initiate
├── Validate user
├── Validate plan
├── Call khaltiService.initiatePayment()
├── Create pending subscription
└── Return payment URL
    ↓
Frontend: Redirect to Khalti
    ↓
User: Completes payment on Khalti
    ↓
Khalti: Redirects to callback
    ↓
POST /api/subscriptions/checkout/verify
├── Verify payment with Khalti
├── Validate amount
├── Check PIDX uniqueness
├── Update subscription (active)
├── Create notification
└── Return subscription data
    ↓
Frontend: Show success modal
    ↓
User: Download receipt or go to dashboard
    ↓
✅ Payment Complete
```

---

## 11. Module Dependencies

### 11.1 Backend Dependencies

```
Production Dependencies:
├── express (4.x)                 - Web framework
├── mongoose (7.x)                - MongoDB ODM
├── dotenv                        - Environment variables
├── bcryptjs                      - Password hashing
├── jsonwebtoken                  - JWT creation/verification
├── nodemailer                    - Email sending
├── axios                         - HTTP client
├── cors                          - CORS handling
├── body-parser                   - Request parsing
├── multer                        - File upload
├── express-validator             - Input validation
├── express-rate-limit           - Rate limiting
├── winston                       - Logging
└── joi                           - Schema validation

Development Dependencies:
├── nodemon                       - Auto-restart
├── dotenv-cli                    - CLI env management
└── jest / mocha                  - Testing frameworks
```

### 11.2 Frontend Dependencies

```
Production Dependencies:
├── react (18.x)                  - UI framework
├── react-router-dom (6.x)        - Routing
├── axios                         - HTTP client
├── react-icons                   - Icon library
├── jspdf                         - PDF generation
├── jspdf-autotable              - PDF tables
└── tailwindcss                   - Styling

Development Dependencies:
├── react-scripts                 - Build scripts
├── eslint                        - Linting
├── prettier                      - Code formatting
└── @testing-library/react        - Testing
```

### 11.3 Dependency Graph

```
App (Frontend)
├── React 18
├── React Router
│   ├── Routes
│   └── Navigation
├── Axios
│   └── API Calls
├── Context API
│   ├── AuthContext
│   ├── UserContext
│   ├── BookingContext
│   └── NotificationContext
└── UI Libraries
    ├── React Icons
    ├── Tailwind CSS
    └── jsPDF

Server (Backend)
├── Express
│   ├── Routes
│   ├── Controllers
│   ├── Middleware
│   └── Error Handlers
├── Mongoose
│   ├── Models
│   ├── Schemas
│   └── Validation
├── Authentication
│   ├── JWT
│   └── bcryptjs
├── External Services
│   ├── Khalti
│   ├── Gmail
│   ├── Google OAuth
│   └── MongoDB Atlas
└── Utilities
    ├── Logger
    ├── Validators
    └── Formatters
```

---

## 12. Deployment Architecture

### 12.1 Development Environment

```
Local Machine:
├── Frontend: http://localhost:3000
│   └── React Dev Server (npm start)
├── Backend: http://localhost:5002
│   └── Node.js Server (npm run server)
└── Database: Local MongoDB or Atlas
    └── Connection string in .env

Development Tools:
├── VSCode (Editor)
├── Git (Version control)
├── Postman (API testing)
├── MongoDB Compass (Database management)
└── Chrome DevTools (Browser debugging)
```

### 12.2 Production Deployment Architecture

```
┌─────────────────────────────────────────────────────────┐
│                  CDN (Static Assets)                    │
│  ┌───────────────────────────────────────────────────┐  │
│  │  React Build (Optimized Bundle)                  │  │
│  │  ├── HTML/CSS/JS files                           │  │
│  │  ├── Image assets                                │  │
│  │  └── Static resources                            │  │
│  └───────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────┘
              ▲                          │
              │ (Static content)         │ (HTTP/HTTPS)
              │                          ▼
        ┌─────┴──────────────────────────────────┐
        │                                        │
┌───────▼────────────┐              ┌──────────▼────────┐
│  Load Balancer     │              │  API Gateway      │
│  (HTTPS)           │              │  (Rate limiting)  │
└───────┬────────────┘              └──────────┬────────┘
        │                                      │
        ▼                                      ▼
┌───────────────────────────────────────────────────────┐
│         Kubernetes Cluster / Docker Containers        │
│  ┌─────────────────────────────────────────────────┐  │
│  │  Express API Server Instances                  │  │
│  │  ├── Server 1 (Port 5002)                      │  │
│  │  ├── Server 2 (Port 5002)                      │  │
│  │  └── Server N (Port 5002)                      │  │
│  │  (Auto-scaling based on load)                  │  │
│  └─────────────────────────────────────────────────┘  │
│         ▲                    │                        │
│         │ (Job queue)        │ (Payment data)         │
│         │                    │                        │
│  ┌──────┴────────────────────┴────────────────────┐   │
│  │  Service Mesh / Internal Communication        │   │
│  └──────────────────────────────────────────────┘   │
└───────────────────────────────────────────────────────┘
                    │              │
                    ▼              ▼
        ┌──────────────────┐  ┌────────────────────┐
        │  MongoDB Atlas   │  │  Backup / Logs     │
        │  (Cloud DB)      │  │  (Cloud Storage)   │
        │  Replicas        │  │                    │
        └──────────────────┘  └────────────────────┘
                    │
                    ▼
        ┌──────────────────────────────┐
        │  Third-Party Services        │
        ├──────────────────────────────┤
        │ • Khalti (Payment)           │
        │ • Gmail (Email)              │
        │ • Google OAuth               │
        │ • Monitoring (DataDog, etc)  │
        └──────────────────────────────┘
```

### 12.3 Deployment Checklist

```
Pre-Deployment:
□ All tests passing
□ Code reviewed
□ Environment variables configured
□ Database backups created
□ Security audit passed
□ Performance tested

Deployment Steps:
□ Build React app (npm run build)
□ Build Docker image
□ Push to registry
□ Update Kubernetes manifests
□ Deploy to staging
□ Run smoke tests
□ Deploy to production
□ Monitor logs and metrics

Post-Deployment:
□ Verify all endpoints working
□ Check database connection
□ Verify third-party integrations
□ Monitor error rates
□ Check API response times
□ Verify user access
```

---

## 13. Error Handling & Logging

### 13.1 Error Handling Strategy

```
Try-Catch Blocks
    ↓
Error Categorization:
├── Validation Errors (400)
│   └── Invalid input format
├── Authentication Errors (401)
│   └── Missing/Invalid token
├── Authorization Errors (403)
│   └── Insufficient permissions
├── Not Found Errors (404)
│   └── Resource not found
├── Conflict Errors (409)
│   └── Duplicate entry
└── Server Errors (500)
    └── Unexpected errors
    ↓
Error Logging:
├── Log to file
├── Log to console (dev)
├── Send to monitoring service
└── Alert team (critical)
    ↓
Error Response:
├── Formatted error message
├── Error code
├── HTTP status
└── Timestamp
```

### 13.2 Logging Levels

```
ERROR   - Critical failures
WARN    - Warnings/deprecated features
INFO    - General information
DEBUG   - Detailed debugging info
TRACE   - Very detailed tracing

Log Format:
[TIMESTAMP] [LEVEL] [MODULE] - Message
[2026-04-21 10:30:00] [INFO] [AuthController] - User registered: user@example.com
```

---

## 14. Performance Considerations

### 14.1 Frontend Optimization

- Code splitting with React.lazy()
- Component memoization (React.memo)
- Debouncing/throttling event handlers
- Image optimization and lazy loading
- CSS bundling and minification
- API response caching

### 14.2 Backend Optimization

- Database query indexing
- Connection pooling
- Response compression (gzip)
- Caching strategies (Redis optional)
- Batch operations
- Load balancing

### 14.3 Database Optimization

- Index frequently queried fields
- Query optimization
- Connection pooling
- Backup strategies
- Monitoring and alerts

---

## 15. Scalability Strategy

### 15.1 Horizontal Scaling

```
Multiple API server instances
├── Load balancer distributes traffic
├── Stateless design enables scaling
├── Session/token-based auth
└── Shared database connection
```

### 15.2 Vertical Scaling

```
Increase server resources:
├── CPU/Memory upgrade
├── Database optimization
└── Cache layer addition
```

---

## 16. Monitoring & Maintenance

### 16.1 Monitoring Metrics

- API response time
- Error rates
- Database query time
- Server CPU/Memory usage
- User engagement metrics
- Payment transaction success rate

### 16.2 Backup Strategy

- Daily database backups
- Code repository backups
- Configuration file backups
- Retention: 30 days

---

## 17. Future Enhancements

- [ ] Real-time notifications (WebSocket)
- [ ] Advanced analytics dashboard
- [ ] AI-based recommendation system
- [ ] Mobile app (React Native)
- [ ] Payment method diversification
- [ ] Multi-language support
- [ ] Advanced caching (Redis)
- [ ] Microservices architecture

---

## Document Status

**Version:** 1.0.0 Complete  
**Last Updated:** April 21, 2026  
**Status:** ✅ Production Ready  
**Maintainer:** Development Team

---

**End of Architecture & Technical Structure SRS**

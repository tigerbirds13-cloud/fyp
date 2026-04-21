# HomeTown Helper - Backend API Documentation

This document outlines all the backend API endpoints available for the HomeTown Helper MERN application.

## Base URL

```
http://localhost:5002/api
```

## Authentication

Most endpoints require authentication via JWT token. Include the token in the Authorization header:

```
Authorization: Bearer <your_jwt_token>
```

---

## 1. Authentication Routes (`/auth`)

### Register User

- **POST** `/auth/register`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "password": "password123",
    "role": "seeker" // or "helper"
  }
  ```
- **Response:** Returns user object and JWT token

### Login User

- **POST** `/auth/login`
- **Body:**
  ```json
  {
    "email": "john@example.com",
    "password": "password123"
  }
  ```
- **Response:** Returns user object and JWT token

### Get Current User (Protected)

- **GET** `/auth/me`
- **Headers:** Requires Authorization
- **Response:** Returns current user's profile

### Update Profile (Protected)

- **PATCH** `/auth/update-profile`
- **Headers:** Requires Authorization
- **Body:**
  ```json
  {
    "name": "John Doe Updated",
    "location": "Kathmandu, Nepal",
    "skills": ["plumbing", "painting"],
    "avatar": "👨",
    "phoneNumber": "+977-9841234567",
    "bio": "I am a skilled plumber with 10 years of experience"
  }
  ```
- **Response:** Returns updated user profile

### Change Password (Protected)

- **PATCH** `/auth/change-password`
- **Headers:** Requires Authorization
- **Body:**
  ```json
  {
    "currentPassword": "oldpassword",
    "newPassword": "newpassword123"
  }
  ```
- **Response:** Returns user with new token

### Get All Helpers

- **GET** `/auth/helpers`
- **Query Parameters:** None
- **Response:** Returns list of all helpers

### Get Helper Profile

- **GET** `/auth/helpers/:id`
- **Parameters:** Helper ID
- **Response:** Returns specific helper's profile

---

## 2. Services Routes (`/services`)

### Get All Services (with filtering)

- **GET** `/services`
- **Query Parameters:**
  - `category`: Filter by category ID
  - `location`: Filter by location
  - `search`: Search by name, description, or tags
- **Example:** `/services?search=plumbing&location=Kathmandu`
- **Response:** Returns array of services

### Get Services by Location

- **GET** `/services/location/:location`
- **Parameters:** Location name (e.g., "Kathmandu")
- **Response:** Returns services in that location

### Get Services by Category

- **GET** `/services/category/:categoryId`
- **Parameters:** Category ID
- **Response:** Returns services in that category

### Get Services by Provider

- **GET** `/services/provider/:providerId`
- **Parameters:** Provider (Helper) ID
- **Response:** Returns all services by a specific helper

### Get Single Service

- **GET** `/services/:id`
- **Parameters:** Service ID
- **Response:** Returns service details with provider info

### Create Service (Protected - Helper only)

- **POST** `/services`
- **Headers:** Requires Authorization (helper role)
- **Body:**
  ```json
  {
    "name": "Plumbing Repair",
    "description": "Professional plumbing services for residential needs",
    "price": 500,
    "category": "categoryId",
    "location": "Kathmandu, Nepal",
    "tags": ["plumbing", "repair", "residential"],
    "duration": "2 hours"
  }
  ```
- **Response:** Returns created service

### Update Service (Protected - Owner only)

- **PATCH** `/services/:id`
- **Headers:** Requires Authorization (owner of service)
- **Body:** Same fields as create service
- **Response:** Returns updated service

### Delete Service (Protected - Owner only)

- **DELETE** `/services/:id`
- **Headers:** Requires Authorization (owner of service)
- **Response:** Success message

---

## 3. Categories Routes (`/categories`)

### Get All Categories

- **GET** `/categories`
- **Response:** Returns array of all service categories

### Create Category (Protected - Admin only)

- **POST** `/categories`
- **Headers:** Requires Authorization (admin role)
- **Body:**
  ```json
  {
    "name": "New Category",
    "count": "50+",
    "icon": "svg_path_or_emoji"
  }
  ```
- **Response:** Returns created category

---

## 4. Bookings Routes (`/bookings`)

### Create Booking (Protected - Seeker)

- **POST** `/bookings`
- **Headers:** Requires Authorization (seeker role)
- **Body:**
  ```json
  {
    "serviceId": "serviceId",
    "scheduledDate": "2024-04-15T10:00:00Z",
    "location": "Kathmandu, Nepal",
    "notes": "Please bring all necessary tools"
  }
  ```
- **Response:** Returns created booking

### Get My Bookings (Protected)

- **GET** `/bookings`
- **Headers:** Requires Authorization
- **Response:** Returns all bookings for current user (as seeker or helper)

### Get Single Booking (Protected)

- **GET** `/bookings/:id`
- **Headers:** Requires Authorization
- **Parameters:** Booking ID
- **Response:** Returns booking details

### Update Booking Status (Protected - Helper only)

- **PATCH** `/bookings/:id/status`
- **Headers:** Requires Authorization (helper role)
- **Body:**
  ```json
  {
    "status": "accepted" // pending, accepted, completed, cancelled
  }
  ```
- **Response:** Returns updated booking

### Cancel Booking (Protected)

- **DELETE** `/bookings/:id`
- **Headers:** Requires Authorization
- **Parameters:** Booking ID
- **Response:** Success message

---

## 5. Reviews Routes (`/reviews`)

### Get Reviews for Service

- **GET** `/reviews/service/:serviceId`
- **Parameters:** Service ID
- **Response:** Returns all reviews for that service

### Get Reviews for Helper

- **GET** `/reviews/helper/:helperId`
- **Parameters:** Helper ID
- **Response:** Returns all reviews for that helper

### Get Single Review

- **GET** `/reviews/:id`
- **Parameters:** Review ID
- **Response:** Returns review details

### Create Review (Protected - Seeker)

- **POST** `/reviews`
- **Headers:** Requires Authorization (seeker role)
- **Body:**
  ```json
  {
    "serviceId": "serviceId",
    "helperId": "helperId",
    "bookingId": "bookingId",
    "rating": 5,
    "comment": "Excellent service, highly recommended!"
  }
  ```
- **Response:** Returns created review

### Update Review (Protected - Reviewer only)

- **PATCH** `/reviews/:id`
- **Headers:** Requires Authorization (review creator)
- **Body:**
  ```json
  {
    "rating": 4,
    "comment": "Updated comment"
  }
  ```
- **Response:** Returns updated review

### Delete Review (Protected - Reviewer only)

- **DELETE** `/reviews/:id`
- **Headers:** Requires Authorization (review creator)
- **Parameters:** Review ID
- **Response:** Success message

---

## 6. Contact Routes (`/contact`)

### Submit Contact Form

- **POST** `/contact`
- **Body:**
  ```json
  {
    "name": "John Doe",
    "email": "john@example.com",
    "subject": "Need help with plumbing",
    "message": "I need a plumber for my apartment"
  }
  ```
- **Response:** Success message with saved contact info

### Get All Messages (Protected - Admin only)

- **GET** `/contact`
- **Headers:** Requires Authorization (admin role)
- **Response:** Returns all contact messages

### Mark Message as Read (Protected - Admin only)

- **PATCH** `/contact/:id/read`
- **Headers:** Requires Authorization (admin role)
- **Parameters:** Message ID
- **Response:** Returns updated message

---

## Response Format

All responses follow this format:

**Success Response:**

```json
{
  "status": "success",
  "message": "Operation successful",
  "data": {
    // response data
  }
}
```

**Error Response:**

```json
{
  "status": "fail",
  "message": "Error description"
}
```

---

## Status Codes

- **200 OK**: Request successful
- **201 Created**: Resource created successfully
- **204 No Content**: Successful deletion
- **400 Bad Request**: Invalid request data
- **401 Unauthorized**: Missing or invalid authentication
- **403 Forbidden**: Insufficient permissions
- **404 Not Found**: Resource not found
- **500 Internal Server Error**: Server error

---

## User Roles

- **seeker**: Can search, book services, and leave reviews
- **helper**: Can create/manage services and accept bookings
- **admin**: Can manage categories and view all contact messages

---

## Database Models

### User

- name, email, password, role
- location, skills, avatar, rating, totalJobs
- phoneNumber, bio
- createdAt

### Service

- name, description, price, provider
- category, location, tags
- rating, totalJobs, image, duration
- createdAt

### Category

- name, count, icon

### Booking

- service, seeker, helper, status
- scheduledDate, location, notes, totalPrice
- createdAt, updatedAt

### Review

- service, reviewer, helper, rating, comment
- booking (reference), createdAt

### Contact

- name, email, subject, message
- status (read/unread), createdAt

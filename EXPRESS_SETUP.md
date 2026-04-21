# Express.js Setup & Configuration Guide

## Overview
This HomeTown Helper MERN application uses **Express.js** as the backend framework with Node.js. Express handles all HTTP requests, routing, middleware, and server management.

---

## Installation

Express is already installed in the project. Check [backend/package.json](backend/package.json):

```bash
npm install express
```

**Current Version:** `^4.18.2` (or later)

---

## Project Structure

```
backend/
├── server.js                 # Main Express app configuration
├── middleware/
│   └── authMiddleware.js     # Authentication middleware
├── routes/                   # Express route handlers
│   ├── authRoutes.js
│   ├── serviceRoutes.js
│   ├── categoryRoutes.js
│   ├── contactRoutes.js
│   ├── bookingRoutes.js
│   └── reviewRoutes.js
├── controllers/              # Business logic for routes
│   ├── authController.js
│   ├── serviceController.js
│   ├── categoryController.js
│   ├── contactController.js
│   ├── bookingController.js
│   └── reviewController.js
├── models/                   # MongoDB schemas
│   ├── User.js
│   ├── Service.js
│   ├── Category.js
│   ├── Contact.js
│   ├── Booking.js
│   └── Review.js
└── package.json
```

---

## Core Express Setup ([backend/server.js](backend/server.js))

### 1. Initialize Express App

```javascript
const express = require('express');
const app = express();
```

### 2. Middleware Configuration

```javascript
// CORS - Enable cross-origin requests from frontend
app.use(cors());

// Body Parser - Parse incoming JSON and form data
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
```

### 3. Database Connection

```javascript
const mongoURI = process.env.MONGODB_URI || 'mongodb://localhost:27017/fyp';
mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('MongoDB connected'))
.catch(err => console.log(err));
```

### 4. API Routes Registration

```javascript
// Health Check Endpoint
app.get('/api/health', (req, res) => {
  res.json({ message: 'Backend is running' });
});

// Route Mounting
app.use('/api/auth', authRoutes);
app.use('/api/services', serviceRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/reviews', reviewRoutes);
```

### 5. Server Startup

```javascript
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
```

---

## Routing Pattern

### Creating a Route File

Example: [backend/routes/serviceRoutes.js](backend/routes/serviceRoutes.js)

```javascript
const express = require('express');
const router = express.Router();
const { 
  getAllServices, 
  createService, 
  updateService, 
  deleteService 
} = require('../controllers/serviceController');
const { protect } = require('../middleware/authMiddleware');

// Public Routes
router.get('/', getAllServices);

// Protected Routes (require authentication)
router.post('/', protect, createService);
router.patch('/:id', protect, updateService);
router.delete('/:id', protect, deleteService);

module.exports = router;
```

### Route Registration in server.js

```javascript
app.use('/api/services', serviceRoutes);
```

**Result:** Routes become accessible at:
- `GET /api/services` - Get all services
- `POST /api/services` - Create service
- `PATCH /api/services/:id` - Update service
- `DELETE /api/services/:id` - Delete service

---

## Middleware

### CORS Middleware
```javascript
app.use(cors());
```
- Allows requests from frontend (http://localhost:3000)
- Needed for cross-origin requests

### Body Parser Middleware
```javascript
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
```
- Parses incoming request bodies
- Converts JSON strings to JavaScript objects

### Authentication Middleware ([backend/middleware/authMiddleware.js](backend/middleware/authMiddleware.js))
```javascript
const protect = (req, res, next) => {
  // Verify JWT token
  // Attach user to req.user
  // Call next() to proceed
};

app.use(protect); // Apply to specific routes
```

---

## API Endpoints

### All Available Routes

| Method | Endpoint | Protected | Description |
|--------|----------|-----------|-------------|
| POST | `/api/auth/register` | ❌ | Register new user |
| POST | `/api/auth/login` | ❌ | Login user |
| GET | `/api/auth/me` | ✅ | Get current user |
| PATCH | `/api/auth/update-profile` | ✅ | Update profile |
| GET | `/api/services` | ❌ | Get all services |
| POST | `/api/services` | ✅ | Create service |
| GET | `/api/categories` | ❌ | Get all categories |
| POST | `/api/bookings` | ✅ | Create booking |
| GET | `/api/reviews` | ❌ | Get reviews |
| POST | `/api/contact` | ❌ | Submit contact form |

---

## Environment Variables

Create `.env` file in the `backend/` directory:

```env
PORT=5000
MONGODB_URI=mongodb://localhost:27017/fyp
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
NODE_ENV=development
```

---

## Running the Server

### Start Backend Only
```bash
cd backend
npm start
# or
npm run server
```

### Start Frontend Only
```bash
cd frontend
npm start
# or
npm run client
```

### Start Both (from root)
```bash
npm start
```

---

## Common Express Methods

### HTTP Methods

```javascript
// GET - Retrieve data
router.get('/path', handler);

// POST - Create new data
router.post('/path', handler);

// PATCH - Update existing data
router.patch('/path/:id', handler);

// DELETE - Remove data
router.delete('/path/:id', handler);

// PUT - Replace entire resource
router.put('/path/:id', handler);
```

### Request/Response Objects

```javascript
app.get('/api/example', (req, res) => {
  // Request properties
  req.params      // URL parameters (e.g., :id)
  req.query       // Query string (e.g., ?search=test)
  req.body        // POST/PATCH body data
  req.headers     // HTTP headers
  req.user        // Authenticated user (from middleware)

  // Response methods
  res.json()      // Send JSON response
  res.status()    // Set HTTP status
  res.send()      // Send text response
  res.redirect()  // Redirect to URL
});
```

---

## Example: Complete Route Handler

```javascript
// GET /api/services?search=plumbing&location=Kathmandu
router.get('/', async (req, res) => {
  try {
    const { search, location } = req.query;
    
    let filter = {};
    if (search) filter.name = { $regex: search, $options: 'i' };
    if (location) filter.location = location;

    const services = await Service.find(filter)
      .populate('provider', 'name avatar phoneNumber')
      .populate('category', 'name');

    res.status(200).json({
      success: true,
      count: services.length,
      data: services
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
});
```

---

## Error Handling

```javascript
app.use((err, req, res, next) => {
  const status = err.status || 500;
  const message = err.message || 'Internal Server Error';
  
  res.status(status).json({
    success: false,
    status,
    message
  });
});
```

---

## Testing the API

### Using cURL
```bash
# GET request
curl http://localhost:5000/api/services

# POST request
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password123"}'
```

### Using Postman
1. Import API collection
2. Set base URL: `http://localhost:5000/api`
3. Add authentication token to headers
4. Test each endpoint

---

## Useful Links

- [Express.js Official Docs](https://expressjs.com/)
- [Express Routing](https://expressjs.com/en/guide/routing.html)
- [Express Middleware](https://expressjs.com/en/guide/using-middleware.html)
- [API Documentation](API_DOCUMENTATION.md)

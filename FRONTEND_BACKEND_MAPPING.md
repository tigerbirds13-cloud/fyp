# Frontend to Backend API Mapping

This document shows how each frontend feature maps to the backend API endpoints.

---

## 🔐 Authentication Features

### LoginPage.jsx
**Frontend Functions:**
- Submit login form with email & password
- Validate inputs
- Show success message
- Redirect on success

**Backend API:**
```
POST /api/auth/login
Required: email, password
Returns: user object + JWT token
```

**Frontend Implementation:**
```javascript
const submit = async () => {
  const response = await fetch('http://localhost:5000/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ email: f.email, password: f.password })
  });
  const data = await response.json();
  if (data.status === 'success') {
    localStorage.setItem('token', data.token);
    // Redirect to home
  }
};
```

---

### RegisterPage.jsx
**Frontend Functions:**
- Register new user with role selection
- Validate password confirmation
- Select seeker or helper role
- Show validation errors

**Backend APIs:**
```
POST /api/auth/register
Required: name, email, password, role
Returns: user object + JWT token
```

**Frontend Implementation:**
```javascript
const submit = async () => {
  const response = await fetch('http://localhost:5000/api/auth/register', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: f.name,
      email: f.email,
      password: f.password,
      role: isHelper ? 'helper' : 'seeker'
    })
  });
  const data = await response.json();
  if (data.status === 'success') {
    localStorage.setItem('token', data.token);
    // Redirect to home
  }
};
```

---

## 🏠 Home Page Features

### Navbar.jsx
**Frontend Functions:**
- Show user profile
- Show logged-in status
- Logout functionality

**Backend APIs:**
```
GET /api/auth/me (with token)
Returns: current user object
```

**Frontend Implementation:**
```javascript
useEffect(() => {
  const token = localStorage.getItem('token');
  if (token) {
    fetch('http://localhost:5000/api/auth/me', {
      headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(r => r.json())
    .then(data => setUser(data.data.user));
  }
}, []);
```

---

### SearchSection.jsx
**Frontend Functions:**
- Search services by keyword
- Filter by location
- Filter by category
- Display search results count

**Backend APIs:**
```
GET /api/services?search=<keyword>&location=<location>&category=<categoryId>
Returns: filtered services array
```

**Frontend Implementation:**
```javascript
const showToast = (message) => {
  // Search implementation
  fetch(`http://localhost:5000/api/services?search=${search}&location=${locFilter}`, {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => {
    // Update servicesFilter
  });
};
```

---

### CategorySection.jsx
**Frontend Functions:**
- Display all service categories (10 items per page)
- Pagination (previous/next)
- Category selection
- Show count of helpers per category

**Backend APIs:**
```
GET /api/categories
Returns: all categories with counts
```

**Frontend Implementation:**
```javascript
useEffect(() => {
  fetch('http://localhost:5000/api/categories')
  .then(r => r.json())
  .then(data => {
    setCategoriesData(data.data.categories);
  });
}, []);

// When category clicked
const onCategorySelect = (catName) => {
  fetch(`http://localhost:5000/api/services/category/${categoryId}`)
  .then(r => r.json())
  .then(data => {
    // Update filtered services
  });
};
```

---

### ServicesGrid.jsx
**Frontend Functions:**
- Display services in grid layout
- Show helper avatar, name, role
- Show location and rating
- Show tags for each service
- "Book Now" button
- 3 different view tabs

**Backend APIs:**
```
GET /api/services (with filters)
Returns: services with provider info

POST /api/bookings (to create booking)
Required: serviceId, scheduledDate, location, notes
```

**Frontend Implementation:**
```javascript
// Get services
useEffect(() => {
  fetch('http://localhost:5000/api/services?category=...&location=...&search=...')
  .then(r => r.json())
  .then(data => {
    setFiltered(data.data.services);
  });
}, [activeTab, search, locFilter]);

// Book service
const bookService = async (serviceId) => {
  const response = await fetch('http://localhost:5000/api/bookings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      serviceId: serviceId,
      scheduledDate: new Date(),
      location: currentLocation,
      notes: ''
    })
  });
  const data = await response.json();
  showToast('Booking created successfully!');
};
```

---

### ContactSection.jsx
**Frontend Functions:**
- Display contact information
- Contact form with validation
- Submit form
- Show success/error messages
- Social media links

**Backend APIs:**
```
POST /api/contact
Required: name, email, subject, message
Returns: success message
```

**Frontend Implementation:**
```javascript
const sendContact = async () => {
  const response = await fetch('http://localhost:5000/api/contact', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      name: contactForm.name,
      email: contactForm.email,
      subject: contactForm.subject,
      message: contactForm.message
    })
  });
  const data = await response.json();
  if (data.status === 'success') {
    showToast('Message sent successfully!');
  }
};
```

---

## 👥 Helper Profile Features

**Frontend Functions:**
- View helper's full profile
- See all services by helper
- View helper's reviews and rating
- See helper's skills and location

**Backend APIs:**
```
GET /api/auth/helpers/:id
Returns: helper profile

GET /api/services/provider/:providerId
Returns: all services by helper

GET /api/reviews/helper/:helperId
Returns: all reviews for helper
```

**Frontend Implementation:**
```javascript
useEffect(() => {
  const helperId = '...'; // from URL or props
  
  // Get helper profile
  fetch(`http://localhost:5000/api/auth/helpers/${helperId}`)
  .then(r => r.json())
  .then(data => setHelper(data.data.helper));
  
  // Get helper services
  fetch(`http://localhost:5000/api/services/provider/${helperId}`)
  .then(r => r.json())
  .then(data => setServices(data.data.services));
  
  // Get helper reviews
  fetch(`http://localhost:5000/api/reviews/helper/${helperId}`)
  .then(r => r.json())
  .then(data => setReviews(data.data.reviews));
}, [helperId]);
```

---

## 📋 Booking Features

**Frontend Functions (To be added):**
- View my bookings
- Create new booking
- Track booking status
- Cancel booking

**Backend APIs:**
```
GET /api/bookings (get all user's bookings)
POST /api/bookings (create new booking)
GET /api/bookings/:id (get booking details)
PATCH /api/bookings/:id/status (update status)
DELETE /api/bookings/:id (cancel booking)
```

**Frontend Implementation:**
```javascript
// Get my bookings
useEffect(() => {
  fetch('http://localhost:5000/api/bookings', {
    headers: { 'Authorization': `Bearer ${token}` }
  })
  .then(r => r.json())
  .then(data => setBookings(data.data.bookings));
}, []);

// Update booking status (helper)
const updateStatus = async (bookingId, status) => {
  const response = await fetch(`http://localhost:5000/api/bookings/${bookingId}/status`, {
    method: 'PATCH',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({ status: status })
  });
  const data = await response.json();
  // Update bookings list
};
```

---

## ⭐ Review Features

**Frontend Functions (To be added):**
- View reviews for a service
- View reviews for a helper
- Leave a review after booking
- Edit own review
- Delete own review

**Backend APIs:**
```
GET /api/reviews/service/:serviceId (get service reviews)
GET /api/reviews/helper/:helperId (get helper reviews)
POST /api/reviews (create review)
PATCH /api/reviews/:id (update review)
DELETE /api/reviews/:id (delete review)
```

**Frontend Implementation:**
```javascript
// Get service reviews
useEffect(() => {
  fetch(`http://localhost:5000/api/reviews/service/${serviceId}`)
  .then(r => r.json())
  .then(data => setReviews(data.data.reviews));
}, [serviceId]);

// Leave review
const submitReview = async (rating, comment) => {
  const response = await fetch('http://localhost:5000/api/reviews', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      serviceId: serviceId,
      helperId: helperId,
      bookingId: bookingId,
      rating: rating,
      comment: comment
    })
  });
  const data = await response.json();
  // Show success message
};
```

---

## 🛠️ Helper Features (Service Management)

**Frontend Functions (To be added):**
- Create new service
- View my services
- Edit service
- Delete service
- View booking requests

**Backend APIs:**
```
POST /api/services (create service)
GET /api/services/provider/:providerId (get my services)
PATCH /api/services/:id (update service)
DELETE /api/services/:id (delete service)
GET /api/bookings (get booking requests)
```

**Frontend Implementation:**
```javascript
// Create service
const createService = async (formData) => {
  const response = await fetch('http://localhost:5000/api/services', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    },
    body: JSON.stringify({
      name: formData.name,
      description: formData.description,
      price: formData.price,
      category: formData.categoryId,
      location: formData.location,
      tags: formData.tags,
      duration: formData.duration
    })
  });
  const data = await response.json();
  // Show success message
};
```

---

## 📱 Complete API Integration Checklist

**Authentication:**
- [ ] Login integration
- [ ] Register integration
- [ ] Profile retrieval
- [ ] Profile update
- [ ] Password change
- [ ] Logout (clear token)

**Services:**
- [ ] Get all services
- [ ] Search services
- [ ] Filter by category
- [ ] Filter by location
- [ ] Get service details
- [ ] Create service
- [ ] Update service
- [ ] Delete service
- [ ] Get helper services

**Bookings:**
- [ ] Create booking
- [ ] View my bookings
- [ ] View booking details
- [ ] Update booking status
- [ ] Cancel booking

**Reviews:**
- [ ] Get service reviews
- [ ] Get helper reviews
- [ ] Create review
- [ ] Update review
- [ ] Delete review

**Other:**
- [ ] Get categories
- [ ] Submit contact form
- [ ] Get helper profile
- [ ] Get all helpers

---

## 🔑 Important Notes

1. **Token Management:**
   - Store token in localStorage after login
   - Include token in Authorization header for protected endpoints
   - Clear token on logout

2. **Error Handling:**
   - Check `status` field in response (success/fail)
   - Handle 401 (unauthorized) - redirect to login
   - Handle 403 (forbidden) - show permission error
   - Handle 400 (bad request) - show validation errors

3. **Loading States:**
   - Show loading spinner while fetching
   - Disable buttons during submission
   - Show error messages clearly

4. **Real-time Updates:**
   - Refresh data after creating/updating
   - Update local state immediately
   - Show success toasts

5. **User Experience:**
   - Validate inputs before submission
   - Show clear error messages
   - Provide feedback on all actions
   - Handle edge cases

---

**Status:** Ready for Frontend Integration  
**Last Updated:** April 1, 2026

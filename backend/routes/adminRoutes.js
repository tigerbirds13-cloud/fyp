const express = require('express');
const adminController = require('../controllers/adminController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

const router = express.Router();

// Protect all admin routes - only admin users can access
router.use(protect, restrictTo('admin'));

// ============ DASHBOARD ============
router.get('/dashboard', adminController.getDashboardStats);

// ============ USER MANAGEMENT ============
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.patch('/users/:id', adminController.updateUser);
router.patch('/users/:id/disable', adminController.disableUser);
router.patch('/users/:id/enable', adminController.enableUser);
router.delete('/users/:id', adminController.deleteUser);

// ============ SERVICE MANAGEMENT ============
router.get('/services', adminController.getAllServices);
router.get('/services/:id', adminController.getServiceDetails);
router.patch('/services/:id', adminController.updateService);
router.delete('/services/:id', adminController.deleteService);

// ============ BOOKING MANAGEMENT ============
router.get('/bookings', adminController.getAllBookings);
router.get('/bookings/:id', adminController.getBookingDetails);
router.patch('/bookings/:id/status', adminController.updateBookingStatus);
router.delete('/bookings/:id', adminController.deleteBooking);

// ============ REVIEW MANAGEMENT ============
router.get('/reviews', adminController.getAllReviews);
router.delete('/reviews/:id', adminController.deleteReview);

// ============ CONTACT MANAGEMENT ============
router.get('/contacts', adminController.getAllContacts);
router.delete('/contacts/:id', adminController.deleteContact);

// ============ CATEGORY MANAGEMENT ============
router.get('/categories', adminController.getAllCategories);
router.post('/categories', adminController.createCategory);
router.patch('/categories/:id', adminController.updateCategory);
router.delete('/categories/:id', adminController.deleteCategory);

// ============ REPORTS & MODERATION ============
router.get('/reports', adminController.getAllReports);
router.patch('/reports/:id/resolve', adminController.resolveReport);

// ============ SYSTEM ============
router.get('/system-health', adminController.getSystemHealth);

module.exports = router;
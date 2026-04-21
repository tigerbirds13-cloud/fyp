const express = require('express');
const router = express.Router();
const {
  getAllServices,
  getService,
  getServicesByLocation,
  getServicesByCategory,
  getServicesByProvider,
  createService,
  updateService,
  deleteService,
} = require('../controllers/serviceController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

// Public routes
router.get('/', getAllServices);
router.get('/location/:location', getServicesByLocation);
router.get('/category/:categoryId', getServicesByCategory);
router.get('/provider/:providerId', getServicesByProvider);
router.get('/:id', getService);

// Protected routes (helper only)
router.post('/', protect, restrictTo('helper'), createService);
router.patch('/:id', protect, restrictTo('helper'), updateService);
router.delete('/:id', protect, restrictTo('helper'), deleteService);

module.exports = router;

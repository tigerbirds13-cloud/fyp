const express = require('express');
const router = express.Router();
const {
  getMyReviews,
  createReview,
  getServiceReviews,
  getHelperReviews,
  getReview,
  updateReview,
  deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.get('/service/:serviceId', getServiceReviews);
router.get('/helper/:helperId', getHelperReviews);
router.get('/:id', getReview);

// Protected routes
router.use(protect);
router.get('/', getMyReviews);
router.post('/', createReview);
router.patch('/:id', updateReview);
router.delete('/:id', deleteReview);

module.exports = router;

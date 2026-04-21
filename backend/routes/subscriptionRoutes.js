const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  initiateUpgradeCheckout,
  verifyUpgradeCheckout,
  getCurrentSubscription,
} = require('../controllers/subscriptionController');

const router = express.Router();

router.use(protect);
router.get('/current', getCurrentSubscription);
router.post('/checkout/initiate', initiateUpgradeCheckout);
router.post('/checkout/verify', verifyUpgradeCheckout);

module.exports = router;
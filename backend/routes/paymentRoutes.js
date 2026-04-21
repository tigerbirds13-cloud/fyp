const express = require("express");
const router = express.Router();
const {
  initiatePayment,
  verifyPayment,
  getPaymentDetails,
  refundPayment,
  getPublicKey,
} = require("../controllers/paymentController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication except getPublicKey
router.get("/public-key", getPublicKey);

// Protected routes
router.use(protect);
router.post("/initiate", initiatePayment);
router.post("/verify", verifyPayment);
router.post("/refund", refundPayment);
router.get("/:bookingId", getPaymentDetails);

// Khalti-specific routes (aliases for backward compatibility)
router.post("/khalti/initiate", initiatePayment);
router.post("/khalti/verify", verifyPayment);

module.exports = router;

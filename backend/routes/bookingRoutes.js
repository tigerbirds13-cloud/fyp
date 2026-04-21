const express = require("express");
const router = express.Router();
const {
  createBooking,
  getMyBookings,
  getBooking,
  getAcceptedHelperProfile,
  updateBookingStatus,
  confirmBooking,
  cancelBooking,
  sendBookingMessage,
} = require("../controllers/bookingController");
const { protect } = require("../middleware/authMiddleware");

// All routes require authentication
router.use(protect);

router.post("/", createBooking);
router.get("/", getMyBookings);
router.get("/:id/helper-profile", getAcceptedHelperProfile);
router.get("/:id", getBooking);
router.patch("/:id/status", updateBookingStatus);
router.patch("/:id/confirm", confirmBooking);
router.post("/:id/message", sendBookingMessage);
router.delete("/:id", cancelBooking);

module.exports = router;

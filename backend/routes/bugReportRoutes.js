const express = require("express");
const router = express.Router();
const {
  submitBugReport,
  getBugReport,
  getUserBugReports,
  getAllBugReports,
  updateBugReport,
  deleteBugReport,
  getBugStats,
} = require("../controllers/bugReportController");
const { protect, restrictTo } = require("../middleware/authMiddleware");
const { contactFormLimiter } = require("../middleware/rateLimitMiddleware");

// Public routes
router.post("/", contactFormLimiter, submitBugReport); // Anyone can submit
router.get("/:ticketNumber", getBugReport); // Anyone can check status

// Protected routes (logged-in users)
router.get("/user/my-reports", protect, getUserBugReports);

// Admin routes
router.get("/", protect, restrictTo("admin"), getAllBugReports);
router.patch("/:ticketNumber", protect, restrictTo("admin"), updateBugReport);
router.delete("/:ticketNumber", protect, restrictTo("admin"), deleteBugReport);
router.get("/dashboard/stats", protect, restrictTo("admin"), getBugStats);

module.exports = router;

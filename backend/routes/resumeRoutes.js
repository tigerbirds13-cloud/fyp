const express = require("express");
const router = express.Router();
const { protect } = require("../middleware/authMiddleware");
const upload = require("../middleware/uploadMiddleware");
const resumeController = require("../controllers/resumeController");

// All routes require authentication
router.use(protect);

// Upload resume
router.post("/upload", upload.single("resume"), resumeController.uploadResume);

// Get all resumes for current user
router.get("/", resumeController.getResumes);

// Get primary resume
router.get("/primary/get", resumeController.getPrimaryResume);

// Get single resume
router.get("/:id", resumeController.getResume);

// Download resume
router.get("/:id/download", resumeController.downloadResume);

// Update resume
router.patch("/:id", resumeController.updateResume);

// Set as primary
router.patch("/:id/set-primary", resumeController.setPrimaryResume);

// Delete resume
router.delete("/:id", resumeController.deleteResume);

module.exports = router;

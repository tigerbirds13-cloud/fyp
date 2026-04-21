const express = require('express');
const jobController = require('../controllers/jobController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

// Public routes
router.get('/', jobController.getAllJobs);
router.get('/category/:categoryId', jobController.getJobsByCategory);
router.get('/:id', jobController.getJob);

// Protected routes (require authentication)
router.use(protect);

// Job management routes (Helper/Provider only)
router.post('/', jobController.createJob);
router.put('/:id', jobController.updateJob);
router.delete('/:id', jobController.deleteJob);

// Job applications
router.post('/:id/apply', jobController.applyForJob);

// Provider-only routes
router.get('/provider/:userId', jobController.getJobsByProvider);
router.get('/:id/applicants', jobController.getJobApplicants);
router.put('/:id/applicants/:applicantId', jobController.updateApplicantStatus);

module.exports = router;
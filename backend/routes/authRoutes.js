const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword,
  getAllHelpers,
  getHelperProfile,
  forgotPassword,
  resetPassword,
  verifyEmail,
  resendVerificationEmail,
  googleAuth,
  getGoogleConfig,
} = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

// Public routes
router.post('/register', register);
router.post('/login', login);
router.post('/google', googleAuth);
router.get('/google-config', getGoogleConfig);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password/:token', resetPassword);
router.get('/verify-email/:token', verifyEmail);
router.post('/resend-verification', resendVerificationEmail);
router.get('/helpers', getAllHelpers);
router.get('/helpers/:id', getHelperProfile);

// Protected routes
router.get('/me', protect, getMe);
router.patch('/update-profile', protect, updateProfile);
router.patch('/change-password', protect, changePassword);

module.exports = router;

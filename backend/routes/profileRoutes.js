const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  getProfile,
  updateProfile,
  uploadAvatar,
  uploadCover,
  changeEmailRequest,
  verifyEmailChange,
  previewPublicProfile,
} = require('../controllers/profileController');

router.use(protect);
router.get('/', getProfile);
router.put('/', updateProfile);
router.post('/avatar', uploadAvatar);
router.post('/cover', uploadCover);
router.post('/change-email', changeEmailRequest);
router.post('/verify-email', verifyEmailChange);
router.get('/preview', previewPublicProfile);

module.exports = router;

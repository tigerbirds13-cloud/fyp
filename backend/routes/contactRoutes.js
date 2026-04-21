const express = require('express');
const router = express.Router();
const { submitContact, getAllMessages, markAsRead } = require('../controllers/contactController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.post('/', submitContact);
router.get('/', protect, restrictTo('admin'), getAllMessages);
router.patch('/:id/read', protect, restrictTo('admin'), markAsRead);

module.exports = router;

const express = require('express');
const router = express.Router();
const { getAllCategories, createCategory } = require('../controllers/categoryController');
const { protect, restrictTo } = require('../middleware/authMiddleware');

router.get('/', getAllCategories);
router.post('/', protect, restrictTo('admin'), createCategory);

module.exports = router;

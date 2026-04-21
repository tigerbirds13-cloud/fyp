// Payment and Email Logging Routes
const express = require('express');
const router = express.Router();
const { protect, restrictTo } = require('../middleware/authMiddleware');
const { getPaymentLogs, getEmailLogs, getPaymentStats } = require('../utils/paymentLogger');

// GET /api/logs/payments - Get payment logs (admin only)
router.get('/payments', protect, restrictTo('admin'), (req, res) => {
  try {
    const days = req.query.days || 7;
    const payments = getPaymentLogs(days);
    const stats = getPaymentStats(days);

    res.status(200).json({
      status: 'success',
      payments,
      stats
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

// GET /api/logs/emails - Get email logs (admin only)
router.get('/emails', protect, restrictTo('admin'), (req, res) => {
  try {
    const days = req.query.days || 7;
    const emails = getEmailLogs(days);

    res.status(200).json({
      status: 'success',
      emails
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
});

module.exports = router;

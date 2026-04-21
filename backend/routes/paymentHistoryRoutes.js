const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const Payment = require('../models/Payment');

const router = express.Router();

// Get payment statistics for current user
router.get('/stats', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const mongoose = require('mongoose');
    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Status breakdown
    const statusStats = await Payment.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    // Payment type breakdown
    const typeStats = await Payment.aggregate([
      { $match: { userId: userObjectId } },
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    res.status(200).json({
      status: 'success',
      data: {
        statusBreakdown: statusStats,
        typeBreakdown: typeStats,
      },
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
});

// Get all payments for current user
router.get('/', protect, async (req, res) => {
  try {
    const userId = req.user.id;
    const { status, paymentType, method, limit = 20, page = 1 } = req.query;

    const filters = { userId };
    if (status) filters.status = status;
    if (paymentType) filters.paymentType = paymentType;
    if (method) filters.method = method;

    const skip = (page - 1) * limit;

    const payments = await Payment.find(filters)
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip)
      .populate('relatedId');

    const total = await Payment.countDocuments(filters);

    res.status(200).json({
      status: 'success',
      results: payments.length,
      total,
      page: Number(page),
      pages: Math.ceil(total / limit),
      data: { payments },
    });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
});

// Get single payment by ID
router.get('/:id', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id).populate('relatedId');

    if (!payment) {
      return res.status(404).json({ status: 'fail', message: 'Payment not found' });
    }

    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Unauthorized' });
    }

    res.status(200).json({ status: 'success', data: { payment } });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
});

// Get payment receipt
router.get('/:id/receipt', protect, async (req, res) => {
  try {
    const payment = await Payment.findById(req.params.id);

    if (!payment) {
      return res.status(404).json({ status: 'fail', message: 'Payment not found' });
    }

    if (payment.userId.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'Unauthorized' });
    }

    const receipt = {
      receiptNumber: `RCP-${payment._id}`,
      date: payment.createdAt,
      amount: payment.amount,
      currency: payment.currency,
      status: payment.status,
      method: payment.method,
      description: payment.description,
    };

    res.status(200).json({ status: 'success', data: { receipt } });
  } catch (error) {
    res.status(500).json({ status: 'fail', message: error.message });
  }
});

module.exports = router;

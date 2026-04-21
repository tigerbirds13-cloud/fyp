const Booking = require('../models/Booking');
const khaltiService = require('../utils/khaltiService');
const { logPayment } = require('../utils/paymentLogger');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const SUPPORTED_PAYMENT_METHODS = ['khalti'];

const normalizeAmount = (amount) => Number(Number(amount).toFixed(2));
const toKhaltiAmount = (amount) => Math.round(normalizeAmount(amount) * 100);
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizePhone = (value) => String(value || '').replace(/[^0-9]/g, '');
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidNepalMobile = (value) => /^98\d{8}$/.test(value);

const khaltiStatusResponse = {
  pending: { statusCode: 202, message: 'Payment is pending in Khalti. Please try verification again shortly.' },
  initiated: { statusCode: 202, message: 'Payment is initiated but not yet completed.' },
  refunded: { statusCode: 409, message: 'Payment was refunded in Khalti.' },
  expired: { statusCode: 410, message: 'Payment session has expired. Please initiate a new payment.' },
  canceled: { statusCode: 409, message: 'Payment was canceled by the user.' },
  unknown: { statusCode: 400, message: 'Payment is not completed yet.' },
};

const populateBookingForResponse = (bookingId) => {
  return Booking.findById(bookingId)
    .populate('service')
    .populate('seeker', 'name email')
    .populate('helper', 'name email');
};

const getOwnedBooking = async (bookingId, userId) => {
  const booking = await Booking.findById(bookingId);

  if (!booking) {
    return {
      error: {
        statusCode: 404,
        body: {
          status: 'fail',
          message: 'Booking not found.',
        },
      },
    };
  }

  if (booking.seeker.toString() !== userId) {
    return {
      error: {
        statusCode: 403,
        body: {
          status: 'fail',
          message: 'Only the booking creator can make payment.',
        },
      },
    };
  }

  return { booking };
};

const logPaymentAttempt = ({ booking, userId, method, status, transactionId, description }) => {
  logPayment({
    bookingId: booking._id,
    userId,
    amount: booking.totalPrice,
    currency: 'NPR',
    method,
    status,
    transactionId,
    description,
  });
};

// POST /api/payments/initiate - Initiate payment
exports.initiatePayment = async (req, res) => {
  try {
    const { bookingId } = req.body;
    const mobile = normalizePhone(req.body.mobile);
    const email = normalizeEmail(req.body.email);
    const method = String(req.body.method || 'khalti').toLowerCase();

    if (!bookingId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide bookingId.',
      });
    }

    if (!SUPPORTED_PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Only Khalti payments are supported.',
      });
    }

    if (!mobile || !email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide mobile and email for Khalti payments.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid email address for Khalti payments.',
      });
    }

    if (!isValidNepalMobile(mobile)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid Nepal mobile number (98XXXXXXXX) for Khalti payments.',
      });
    }

    const bookingResult = await getOwnedBooking(bookingId, req.user.id);
    if (bookingResult.error) {
      return res.status(bookingResult.error.statusCode).json(bookingResult.error.body);
    }

    const { booking } = bookingResult;

    if (booking.payment && booking.payment.status === 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'This booking has already been paid.',
      });
    }

    booking.payment = booking.payment || {};
    booking.payment.method = method;
    booking.payment.status = 'pending';
    booking.payment.transactionId = undefined;
    booking.payment.timestamp = new Date();
    booking.payment.khaltiDetails = undefined;

    const paymentResponse = await khaltiService.initiatePayment({
      amount: booking.totalPrice,
      mobile,
      email,
      customerName: req.user.name,
      bookingId: booking._id.toString(),
      purchaseOrderName: `Booking Payment - ${booking._id}`,
      amountBreakdown: [
        { label: 'Booking Total', amount: booking.totalPrice },
      ],
      productDetails: [
        {
          identity: booking._id.toString(),
          name: `Service Booking ${booking._id}`,
          totalPrice: booking.totalPrice,
          quantity: 1,
          unitPrice: booking.totalPrice,
        },
      ],
      returnUrl: `${FRONTEND_URL}/?paymentMethod=khalti&bookingId=${booking._id}`,
    });

    if (!paymentResponse.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Failed to initiate payment: ' + paymentResponse.error,
      });
    }

    booking.payment.khaltiPidx = paymentResponse.pidx;
    booking.payment.khaltiDetails = {
      pidx: paymentResponse.pidx,
      mobileNumber: mobile,
      amount: normalizeAmount(booking.totalPrice),
      timestamp: new Date(),
    };

    await booking.save();

    logPaymentAttempt({
      booking,
      userId: req.user.id,
      method: 'khalti',
      status: 'initiated',
      transactionId: paymentResponse.pidx,
      description: 'Khalti payment initiated',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Payment initiated successfully!',
      data: {
        gateway: 'khalti',
        pidx: paymentResponse.pidx,
        paymentUrl: paymentResponse.url,
        bookingId: booking._id,
        amount: normalizeAmount(booking.totalPrice),
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/payments/verify - Verify payment
exports.verifyPayment = async (req, res) => {
  try {
    const { bookingId, pidx } = req.body;
    const method = String(req.body.method || 'khalti').toLowerCase();

    if (!bookingId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide bookingId.',
      });
    }

    if (!SUPPORTED_PAYMENT_METHODS.includes(method)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Only Khalti payments are supported.',
      });
    }

    if (!pidx) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide pidx and bookingId.',
      });
    }

    const bookingResult = await getOwnedBooking(bookingId, req.user.id);
    if (bookingResult.error) {
      return res.status(bookingResult.error.statusCode).json(bookingResult.error.body);
    }

    const { booking } = bookingResult;

    if (booking.payment?.status === 'completed') {
      return res.status(409).json({
        status: 'fail',
        message: 'Payment already processed for this booking.',
      });
    }

    if (booking.payment?.khaltiPidx !== pidx) {
      return res.status(400).json({
        status: 'fail',
        message: 'Payment identifier mismatch for this booking.',
      });
    }

    const existingPaymentWithPidx = await Booking.findOne({
      _id: { $ne: bookingId },
      'payment.khaltiPidx': pidx,
    }).select('_id');

    if (existingPaymentWithPidx) {
      return res.status(409).json({
        status: 'fail',
        message: 'Fraud alert: Khalti payment identifier reuse detected.',
      });
    }

    const verificationResponse = await khaltiService.verifyPayment(pidx);

    if (!verificationResponse.success) {
      logPaymentAttempt({
        booking,
        userId: req.user.id,
        method: 'khalti',
        status: 'failed',
        transactionId: pidx,
        description: 'Payment verification failed: ' + verificationResponse.error,
      });

      return res.status(400).json({
        status: 'fail',
        message: 'Payment verification failed: ' + verificationResponse.error,
      });
    }

    if (!verificationResponse.verified) {
      const normalizedStatus = verificationResponse.data?.normalizedStatus || 'unknown';
      const statusMeta = khaltiStatusResponse[normalizedStatus] || khaltiStatusResponse.unknown;
      return res.status(statusMeta.statusCode).json({
        status: 'fail',
        message: `${statusMeta.message} Current status: ${verificationResponse.data?.status || 'Unknown'}`,
        data: {
          paymentStatus: verificationResponse.data?.status || 'Unknown',
          normalizedStatus,
          pidx,
        },
      });
    }

    const verifiedAmount = Number(verificationResponse.data.totalAmount);
    const expectedAmount = toKhaltiAmount(booking.totalPrice);

    if (verifiedAmount !== expectedAmount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Payment amount mismatch detected.',
      });
    }

    const updateResult = await Booking.updateOne(
      {
        _id: bookingId,
        seeker: req.user.id,
        'payment.status': { $ne: 'completed' },
        'payment.khaltiPidx': pidx,
      },
      {
        $set: {
          'payment.status': 'completed',
          'payment.transactionId': verificationResponse.data.transactionId,
          'payment.timestamp': new Date(),
          'payment.khaltiDetails.pidx': verificationResponse.data.pidx,
          'payment.khaltiDetails.idx': verificationResponse.data.transactionId,
          'payment.khaltiDetails.amount': normalizeAmount(booking.totalPrice),
          'payment.khaltiDetails.timestamp': new Date(),
          status: 'accepted',
          updatedAt: new Date(),
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(409).json({
        status: 'fail',
        message: 'Payment was already processed by another request.',
      });
    }

    const updatedBooking = await populateBookingForResponse(bookingId);

    logPaymentAttempt({
      booking,
      userId: req.user.id,
      method: 'khalti',
      status: 'completed',
      transactionId: verificationResponse.data.transactionId,
      description: 'Payment completed successfully',
    });

    return res.status(200).json({
      status: 'success',
      message: 'Payment verified and booking accepted!',
      data: {
        booking: updatedBooking,
        paymentDetails: verificationResponse.data,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/payments/:bookingId - Get payment details for a booking
exports.getPaymentDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found.',
      });
    }

    if (
      booking.seeker.toString() !== req.user.id &&
      booking.helper.toString() !== req.user.id
    ) {
      return res.status(403).json({
        status: 'fail',
        message: 'Not authorized to view this payment.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: {
        bookingId: booking._id,
        amount: booking.totalPrice,
        payment: booking.payment,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/payments/refund - Refund a payment
exports.refundPayment = async (req, res) => {
  try {
    const { bookingId } = req.body;

    if (!bookingId) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide bookingId.',
      });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({
        status: 'fail',
        message: 'Booking not found.',
      });
    }

    if (booking.helper.toString() !== req.user.id) {
      return res.status(403).json({
        status: 'fail',
        message: 'Only the helper can refund this payment.',
      });
    }

    if (!booking.payment || booking.payment.status !== 'completed') {
      return res.status(400).json({
        status: 'fail',
        message: 'No completed payment to refund.',
      });
    }

    if (booking.payment.method !== 'khalti') {
      return res.status(400).json({
        status: 'fail',
        message: 'Refunds are currently supported only for Khalti payments.',
      });
    }

    if (!booking.payment.khaltiDetails?.pidx) {
      return res.status(400).json({
        status: 'fail',
        message: 'Payment information is incomplete.',
      });
    }

    const refundResponse = await khaltiService.refundPayment(
      booking.payment.khaltiDetails.pidx,
      booking.totalPrice
    );

    if (!refundResponse.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Refund failed: ' + refundResponse.error,
      });
    }

    booking.payment.status = 'refunded';
    booking.payment.transactionId = refundResponse.refundId;
    booking.status = 'cancelled';
    await booking.save();

    logPaymentAttempt({
      booking,
      userId: req.user.id,
      method: 'khalti',
      status: 'refunded',
      transactionId: refundResponse.refundId,
      description: 'Payment refunded',
    });

    res.status(200).json({
      status: 'success',
      message: 'Payment refunded successfully!',
      data: {
        booking,
        refundDetails: refundResponse.data,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/payments/public-key - Get Khalti public key for frontend
exports.getPublicKey = async (req, res) => {
  try {
    res.status(200).json({
      status: 'success',
      publicKey: khaltiService.getPublicKey(),
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

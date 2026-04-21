const Subscription = require('../models/Subscription');
const BillingCustomer = require('../models/BillingCustomer');
const khaltiService = require('../utils/khaltiService');
const Notification = require('../models/Notification');
const { logPayment } = require('../utils/paymentLogger');

const FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';
const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
const normalizePhone = (value) => String(value || '').replace(/[^0-9]/g, '');
const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
const isValidNepalMobile = (value) => /^98\d{8}$/.test(value);

const khaltiStatusResponse = {
  pending: { statusCode: 202, message: 'Payment is pending in Khalti. Please try verification again shortly.' },
  initiated: { statusCode: 202, message: 'Payment is initiated but not yet completed.' },
  refunded: { statusCode: 409, message: 'Payment was refunded in Khalti.' },
  expired: { statusCode: 410, message: 'Payment session has expired. Please initiate a new checkout.' },
  canceled: { statusCode: 409, message: 'Payment was canceled by the user.' },
  unknown: { statusCode: 400, message: 'Payment is not completed yet.' },
};

const PLAN_CATALOG = {
  seeker: {
    pro: { label: 'Pro', amount: 699 },
    elite: { label: 'Elite', amount: 1499 },
  },
  helper: {
    pro: { label: 'Pro', amount: 999 },
    elite: { label: 'Elite', amount: 1999 },
  },
};

const getPlanDetails = (userType, plan) => {
  const normalizedUserType = String(userType || '').toLowerCase();
  const normalizedPlan = String(plan || '').toLowerCase();
  return PLAN_CATALOG[normalizedUserType]?.[normalizedPlan] || null;
};

const logSubscriptionPayment = ({ userId, amount, method = 'khalti', status, transactionId, description }) => {
  logPayment({
    bookingId: null,
    userId,
    amount,
    currency: 'NPR',
    method,
    status,
    transactionId,
    description,
  });
};

const createSubscriptionNotification = async ({ recipient, actor, type, title, message }) => {
  if (!recipient) return;
  await Notification.create({ recipient, actor, type, title, message });
};

exports.initiateUpgradeCheckout = async (req, res) => {
  try {
    const { plan, userType } = req.body;
    const email = normalizeEmail(req.body.email);
    const mobile = normalizePhone(req.body.mobile);
    const method = String(req.body.method || 'khalti').toLowerCase();
    const normalizedUserType = String(userType || '').toLowerCase();
    const normalizedPlan = String(plan || '').toLowerCase();
    const planDetails = getPlanDetails(normalizedUserType, normalizedPlan);

    if (method !== 'khalti') {
      return res.status(400).json({
        status: 'fail',
        message: 'Only Khalti subscription payments are supported.',
      });
    }

    if (!planDetails) {
      return res.status(400).json({
        status: 'fail',
        message: 'Unsupported subscription plan.',
      });
    }

    if (req.user.role !== normalizedUserType) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only upgrade the plan for your own account role.',
      });
    }

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email is required for checkout.',
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid email address for checkout.',
      });
    }

    if (method === 'khalti' && !mobile) {
      return res.status(400).json({
        status: 'fail',
        message: 'Mobile number is required for Khalti checkout.',
      });
    }

    if (method === 'khalti' && !isValidNepalMobile(mobile)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid Nepal mobile number (98XXXXXXXX) for Khalti checkout.',
      });
    }

    const existingSubscription = await Subscription.findOne({ userId: req.user.id });
    if (
      existingSubscription &&
      existingSubscription.plan === normalizedPlan &&
      existingSubscription.status === 'active'
    ) {
      return res.status(400).json({
        status: 'fail',
        message: `Your ${planDetails.label} plan is already active.`,
      });
    }

    const paymentResponse = await khaltiService.initiatePayment({
      amount: planDetails.amount,
      mobile,
      email,
      customerName: req.user.name,
      bookingId: `subscription-${req.user.id}-${normalizedPlan}`,
      purchaseOrderName: `${planDetails.label} Subscription`,
      amountBreakdown: [
        { label: `${planDetails.label} Plan`, amount: planDetails.amount },
      ],
      productDetails: [
        {
          identity: `subscription-${normalizedPlan}`,
          name: `${planDetails.label} Subscription`,
          totalPrice: planDetails.amount,
          quantity: 1,
          unitPrice: planDetails.amount,
        },
      ],
      returnUrl: `${FRONTEND_URL}/?paymentMethod=khalti&paymentContext=subscription&plan=${normalizedPlan}&userType=${normalizedUserType}`,
    });

    if (!paymentResponse.success) {
      return res.status(400).json({
        status: 'fail',
        message: 'Failed to initiate Khalti checkout: ' + paymentResponse.error,
      });
    }

    const subscription = await Subscription.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          userType: normalizedUserType,
          pendingPlan: normalizedPlan,
          status: 'pending',
          amount: planDetails.amount,
          currency: 'NPR',
          paymentMethod: method,
          khaltiPidx: paymentResponse.pidx,
        },
        $setOnInsert: {
          plan: 'free',
        },
      },
      {
        new: true,
        upsert: true,
        runValidators: true,
      }
    );

    await BillingCustomer.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          billingEmail: email,
        },
      },
      {
        new: true,
        upsert: true,
      }
    );

    logSubscriptionPayment({
      userId: req.user.id,
      amount: planDetails.amount,
      method,
      status: 'initiated',
      transactionId: paymentResponse.pidx,
      description: `Khalti subscription checkout initiated for ${planDetails.label}`,
    });

    await createSubscriptionNotification({
      recipient: req.user.id,
      actor: req.user.id,
      type: 'subscription_checkout_initiated',
      title: 'Subscription payment started',
      message: `Khalti checkout started for ${planDetails.label} plan. Complete payment to activate your subscription.`,
    });

    return res.status(200).json({
      status: 'success',
      data: {
        gateway: 'khalti',
        pidx: paymentResponse.pidx,
        paymentUrl: paymentResponse.url,
        plan: subscription.pendingPlan,
        amount: planDetails.amount,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.verifyUpgradeCheckout = async (req, res) => {
  try {
    const { pidx, plan, userType } = req.body;
    const method = String(req.body.method || 'khalti').toLowerCase();
    const normalizedUserType = String(userType || '').toLowerCase();
    const normalizedPlan = String(plan || '').toLowerCase();
    const planDetails = getPlanDetails(normalizedUserType, normalizedPlan);

    if (method !== 'khalti') {
      return res.status(400).json({
        status: 'fail',
        message: 'Only Khalti subscription payments are supported.',
      });
    }

    if (!pidx || !planDetails) {
      return res.status(400).json({
        status: 'fail',
        message: 'Required payment verification fields are missing.',
      });
    }

    if (req.user.role !== normalizedUserType) {
      return res.status(403).json({
        status: 'fail',
        message: 'You can only verify upgrades for your own account role.',
      });
    }

    const lookupFilter = { userId: req.user.id, khaltiPidx: pidx };

    const subscription = await Subscription.findOne(lookupFilter);
    if (!subscription) {
      return res.status(404).json({
        status: 'fail',
        message: 'Pending subscription checkout not found.',
      });
    }
    let verificationResponse;
    let transactionId;

    const reusedPidx = await Subscription.findOne({
      _id: { $ne: subscription._id },
      khaltiPidx: pidx,
    }).select('_id');

    if (reusedPidx) {
      return res.status(409).json({
        status: 'fail',
        message: 'Fraud alert: Khalti payment identifier reuse detected.',
      });
    }

    verificationResponse = await khaltiService.verifyPayment(pidx);
    if (!verificationResponse.success) {
      logSubscriptionPayment({
        userId: req.user.id,
        amount: planDetails.amount,
        method,
        status: 'failed',
        transactionId: pidx,
        description: 'Subscription payment verification failed: ' + verificationResponse.error,
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
    const expectedAmount = Math.round(planDetails.amount * 100);

    if (verifiedAmount !== expectedAmount) {
      return res.status(400).json({
        status: 'fail',
        message: 'Payment amount mismatch detected.',
      });
    }

    transactionId = verificationResponse.data.transactionId;

    const updateResult = await Subscription.updateOne(
      {
        _id: subscription._id,
        userId: req.user.id,
        status: 'pending',
        khaltiPidx: pidx,
      },
      {
        $set: {
          plan: normalizedPlan,
          userType: normalizedUserType,
          status: 'active',
          amount: planDetails.amount,
          currency: 'NPR',
          paymentMethod: method,
          khaltiTransactionId: verificationResponse.data.transactionId,
          currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
        },
        $unset: {
          pendingPlan: 1,
        },
      }
    );

    if (updateResult.modifiedCount === 0) {
      return res.status(409).json({
        status: 'fail',
        message: 'Subscription payment was already processed by another request.',
      });
    }

    const updatedSubscription = await Subscription.findById(subscription._id);

    logSubscriptionPayment({
      userId: req.user.id,
      amount: planDetails.amount,
      method,
      status: 'completed',
      transactionId,
      description: `Khalti subscription upgraded to ${planDetails.label}`,
    });

    await createSubscriptionNotification({
      recipient: req.user.id,
      actor: req.user.id,
      type: 'subscription_upgraded',
      title: 'Subscription activated',
      message: `Your ${planDetails.label} plan is now active via Khalti.`,
    });

    return res.status(200).json({
      status: 'success',
      message: `Your ${planDetails.label} plan is now active.`,
      data: {
        subscription: updatedSubscription,
        paymentDetails: verificationResponse.data,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getCurrentSubscription = async (req, res) => {
  try {
    const subscription = await Subscription.findOne({ userId: req.user.id });
    return res.status(200).json({
      status: 'success',
      data: {
        subscription,
      },
    });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};
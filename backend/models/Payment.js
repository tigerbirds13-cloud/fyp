const mongoose = require('mongoose');

const paymentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  relatedId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'relatedModel',
  },
  relatedModel: {
    type: String,
    enum: ['Booking', 'Subscription'],
    required: true,
  },
  paymentType: {
    type: String,
    enum: ['booking', 'subscription', 'refund', 'adjustment'],
    required: true,
  },
  method: {
    type: String,
    enum: ['khalti', 'stripe', 'cash'],
    default: 'khalti',
  },
  currency: {
    type: String,
    default: 'NPR',
  },
  amount: {
    type: Number,
    required: true,
  },
  status: {
    type: String,
    enum: ['pending', 'processing', 'completed', 'failed', 'refunded', 'expired'],
    default: 'pending',
  },
  paymentGateway: {
    khalti: {
      pidx: {
        type: String,
        unique: true,
        sparse: true,
      },
      idx: String,
      token: String,
      mobileNumber: String,
      transactionId: String,
      timestamp: Date,
    },
    stripe: {
      paymentIntentId: String,
      chargeId: String,
      receiptUrl: String,
    },
  },

  description: String,
  notes: String,
  
  customerInfo: {
    email: String,
    mobile: String,
    name: String,
  },

  metadata: {
    serviceName: String,
    serviceCategory: String,
    planName: String,
    planType: String,
  },

  failureReason: String,
  refundedAt: Date,
  refundAmount: Number,

  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

// Index for fast queries
paymentSchema.index({ userId: 1, createdAt: -1 });
paymentSchema.index({ status: 1, createdAt: -1 });
paymentSchema.index({ 'paymentGateway.khalti.pidx': 1 });
paymentSchema.index({ relatedId: 1, relatedModel: 1 });

module.exports = mongoose.model('Payment', paymentSchema);

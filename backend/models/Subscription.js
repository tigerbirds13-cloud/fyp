const mongoose = require('mongoose');

const subscriptionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  stripeSubscriptionId: String,
  plan: {
    type: String,
    default: 'free',
  },
  pendingPlan: String,
  userType: {
    type: String,
    enum: ['seeker', 'helper'],
  },
  currency: {
    type: String,
    default: 'NPR',
  },
  amount: {
    type: Number,
    default: 0,
  },
  paymentMethod: {
    type: String,
    enum: ['khalti'],
  },
  khaltiPidx: String,
  khaltiTransactionId: String,
  status: {
    type: String,
    enum: ['pending', 'active', 'past_due', 'canceled', 'trialing', 'unpaid', 'expired'],
    default: 'active',
  },
  currentPeriodEnd: Date,
}, { timestamps: true });

subscriptionSchema.index(
  { khaltiPidx: 1 },
  {
    unique: true,
    sparse: true,
    partialFilterExpression: { khaltiPidx: { $type: 'string' } },
  }
);

module.exports = mongoose.model('Subscription', subscriptionSchema);

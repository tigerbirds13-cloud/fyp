const mongoose = require('mongoose');

const billingCustomerSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  stripeCustomerId: String,
  taxId: String,
  billingEmail: String,
}, { timestamps: true });

module.exports = mongoose.model('BillingCustomer', billingCustomerSchema);

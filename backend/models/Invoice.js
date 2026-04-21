const mongoose = require('mongoose');

const invoiceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  stripeInvoiceId: String,
  number: String,
  amount: Number,
  currency: {
    type: String,
    default: 'NPR',
  },
  status: {
    type: String,
    enum: ['paid', 'open', 'void', 'draft'],
    default: 'open',
  },
  hostedPdfUrl: String,
  periodStart: Date,
  periodEnd: Date,
}, { timestamps: true });

module.exports = mongoose.model('Invoice', invoiceSchema);

const mongoose = require('mongoose');

const mfaFactorSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  type: {
    type: String,
    enum: ['totp', 'webauthn'],
    required: true,
  },
  secret: {
    type: String,
    trim: true,
  },
  credentialId: {
    type: String,
    trim: true,
  },
  enabledAt: {
    type: Date,
    default: Date.now,
  },
}, { timestamps: true });

module.exports = mongoose.model('MfaFactor', mfaFactorSchema);

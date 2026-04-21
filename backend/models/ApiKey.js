const mongoose = require('mongoose');

const apiKeySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  name: {
    type: String,
    trim: true,
    required: true,
  },
  prefix: {
    type: String,
    required: true,
  },
  hash: {
    type: String,
    required: true,
    select: false,
  },
  lastUsedAt: {
    type: Date,
    default: null,
  },
  revokedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

apiKeySchema.index({ userId: 1, prefix: 1 }, { unique: true });

module.exports = mongoose.model('ApiKey', apiKeySchema);

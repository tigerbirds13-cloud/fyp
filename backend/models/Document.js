const mongoose = require('mongoose');

const documentSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  key: {
    type: String,
    required: true,
  },
  filename: {
    type: String,
    required: true,
  },
  mime: {
    type: String,
    required: true,
  },
  size: {
    type: Number,
    required: true,
  },
  version: {
    type: Number,
    default: 1,
  },
  tags: {
    type: [String],
    default: [],
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  deletedAt: {
    type: Date,
    default: null,
  },
}, { timestamps: true });

documentSchema.index({ userId: 1, filename: 1, version: 1 });

module.exports = mongoose.model('Document', documentSchema);

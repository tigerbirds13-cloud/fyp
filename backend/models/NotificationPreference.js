const mongoose = require('mongoose');

const notificationPreferenceSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  channel: {
    type: String,
    enum: ['email', 'in_app', 'sms'],
    required: true,
  },
  topic: {
    type: String,
    required: true,
  },
  enabled: {
    type: Boolean,
    default: true,
  },
  frequency: {
    type: String,
    enum: ['immediate', 'daily', 'weekly', 'none'],
    default: 'immediate',
  },
}, { timestamps: true });

notificationPreferenceSchema.index({ userId: 1, channel: 1, topic: 1 }, { unique: true });

module.exports = mongoose.model('NotificationPreference', notificationPreferenceSchema);

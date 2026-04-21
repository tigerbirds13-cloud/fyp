const mongoose = require('mongoose');

const profileSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  avatarKey: {
    type: String,
    default: null,
  },
  coverKey: {
    type: String,
    default: null,
  },
  headline: {
    type: String,
    trim: true,
    default: '',
  },
  bio: {
    type: String,
    trim: true,
    default: '',
  },
  timezone: {
    type: String,
    trim: true,
    default: 'UTC',
  },
  locale: {
    type: String,
    trim: true,
    default: 'en',
  },
  address: {
    line1: String,
    line2: String,
    city: String,
    region: String,
    postcode: String,
    country: String,
  },
  publicProfile: {
    visible: {
      type: Boolean,
      default: false,
    },
    handle: {
      type: String,
      trim: true,
      lowercase: true,
      sparse: true,
    },
  },
  statistics: {
    opportunitiesApplied: { type: Number, default: 0 },
    opportunitiesWon: { type: Number, default: 0 },
    opportunitiesCurrent: { type: Number, default: 0 },
  },
}, { timestamps: true });

module.exports = mongoose.model('Profile', profileSchema);

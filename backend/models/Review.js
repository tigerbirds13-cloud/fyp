const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema({
  service: {
    type: mongoose.Schema.ObjectId,
    ref: 'Service',
    required: [true, 'Review must have a service'],
  },
  reviewer: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must have a reviewer'],
  },
  helper: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Review must reference a helper'],
  },
  rating: {
    type: Number,
    required: [true, 'Please provide a rating'],
    min: [1, 'Rating must be at least 1.0'],
    max: [5, 'Rating must be at most 5.0'],
  },
  comment: {
    type: String,
    required: [true, 'Please provide a comment'],
    trim: true,
  },
  booking: {
    type: mongoose.Schema.ObjectId,
    ref: 'Booking',
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isReported: {
    type: Boolean,
    default: false,
  },
});

module.exports = mongoose.model('Review', reviewSchema);

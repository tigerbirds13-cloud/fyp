const mongoose = require('mongoose');

const serviceSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a service name'],
    trim: true,
  },
  description: {
    type: String,
    required: [true, 'Please provide a description'],
  },
  price: {
    type: Number,
    required: [true, 'Please provide a price'],
  },
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Service must have a provider'],
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Service must belong to a category'],
  },
  location: {
    type: String,
    trim: true,
  },
  tags: {
    type: [String],
    default: [],
  },
  rating: {
    type: Number,
    default: 4.5,
    min: [1, 'Rating must be at least 1.0'],
    max: [5, 'Rating must be at most 5.0'],
  },
  totalJobs: {
    type: Number,
    default: 0,
  },
  image: {
    type: String,
    default: 'https://via.placeholder.com/300',
  },
  duration: {
    type: String,
    default: '1 hour',
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

module.exports = mongoose.model('Service', serviceSchema);

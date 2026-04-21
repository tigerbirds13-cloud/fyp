const mongoose = require('mongoose');

const categorySchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a category name'],
    unique: true,
    trim: true,
  },
  count: {
    type: String,
    default: '0+',
  },
  icon: {
    type: String,
    required: true,
  },
});

module.exports = mongoose.model('Category', categorySchema);

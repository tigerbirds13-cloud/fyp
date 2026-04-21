const mongoose = require('mongoose');

const companySchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true,
  },
  name: {
    type: String,
    trim: true,
    default: '',
  },
  role: {
    type: String,
    trim: true,
    default: '',
  },
  website: {
    type: String,
    trim: true,
    default: '',
  },
  industry: {
    type: String,
    trim: true,
    default: '',
  },
  teamSize: {
    type: String,
    trim: true,
    default: '',
  },
  about: {
    type: String,
    trim: true,
    default: '',
  },
  social: {
    linkedIn: String,
    x: String,
    website: String,
  },
  logoKey: {
    type: String,
    default: null,
  },
}, { timestamps: true });

module.exports = mongoose.model('Company', companySchema);

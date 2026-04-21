const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Job title is required'],
    trim: true,
    maxlength: [100, 'Job title cannot exceed 100 characters']
  },
  description: {
    type: String,
    required: [true, 'Job description is required'],
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  category: {
    type: mongoose.Schema.ObjectId,
    ref: 'Category',
    required: [true, 'Job category is required']
  },
  location: {
    type: String,
    required: [true, 'Job location is required'],
    trim: true
  },
  workType: {
    type: String,
    enum: ['On-site', 'Remote', 'Hybrid'],
    default: 'On-site'
  },
  jobType: {
    type: String,
    enum: ['Full-time', 'Part-time', 'Contract', 'Temporary', 'Internship'],
    default: 'Full-time'
  },
  pay: {
    type: String,
    required: [true, 'Pay information is required']
  },
  requirements: [{
    type: String,
    trim: true
  }],
  benefits: [{
    type: String,
    trim: true
  }],
  tags: [{
    type: String,
    trim: true
  }],
  provider: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    required: [true, 'Job provider is required']
  },
  status: {
    type: String,
    enum: ['Active', 'Expired', 'Filled', 'Paused'],
    default: 'Active'
  },
  applicants: [{
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User'
    },
    appliedAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['Pending', 'Shortlisted', 'Rejected', 'Hired'],
      default: 'Pending'
    }
  }],
  urgent: {
    type: Boolean,
    default: false
  },
  featured: {
    type: Boolean,
    default: false
  },
  views: {
    type: Number,
    default: 0
  },
  applicationDeadline: {
    type: Date
  },
  contactEmail: {
    type: String,
    trim: true,
    lowercase: true
  },
  contactPhone: {
    type: String,
    trim: true
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better performance
jobSchema.index({ title: 'text', description: 'text', tags: 'text' });
jobSchema.index({ category: 1, location: 1, status: 1 });
jobSchema.index({ provider: 1 });
jobSchema.index({ createdAt: -1 });

// Virtual for application count
jobSchema.virtual('applicationCount').get(function() {
  return this.applicants.length;
});

// Virtual for days since posted
jobSchema.virtual('daysPosted').get(function() {
  const now = new Date();
  const posted = this.createdAt;
  const diffTime = Math.abs(now - posted);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return diffDays;
});

// Pre-save middleware to set contact info from provider if not provided
jobSchema.pre('save', async function(next) {
  if (!this.contactEmail || !this.contactPhone) {
    const User = mongoose.model('User');
    const provider = await User.findById(this.provider);
    if (provider) {
      if (!this.contactEmail) this.contactEmail = provider.email;
      if (!this.contactPhone) this.contactPhone = provider.phoneNumber;
    }
  }
  next();
});

module.exports = mongoose.model('Job', jobSchema);
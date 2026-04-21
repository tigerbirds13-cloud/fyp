const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const crypto = require('crypto');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Please provide a name'],
    trim: true,
  },
  email: {
    type: String,
    required: [true, 'Please provide an email'],
    unique: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: [true, 'Please provide a password'],
    minlength: 6,
    select: false,
  },
  role: {
    type: String,
    enum: ['seeker', 'helper', 'admin'],
    default: 'seeker',
  },
  location: {
    type: String,
    trim: true,
  },
  skills: {
    type: [String],
    default: [],
  },
  avatar: {
    type: String,
    default: '👤',
  },
  rating: {
    type: Number,
    default: 5.0,
    min: [1, 'Rating must be at least 1.0'],
    max: [5, 'Rating must be at most 5.0'],
  },
  totalJobs: {
    type: Number,
    default: 0,
  },
  phoneNumber: {
    type: String,
    trim: true,
  },
  firstName: {
    type: String,
    trim: true,
  },
  lastName: {
    type: String,
    trim: true,
  },
  timezone: {
    type: String,
    trim: true,
    default: 'UTC',
  },
  locale: {
    type: String,
    trim: true,
    default: 'en-US',
  },
  address: {
    line1: String,
    line2: String,
    city: String,
    region: String,
    postcode: String,
    country: String,
  },
  companyName: {
    type: String,
    trim: true,
  },
  roleTitle: {
    type: String,
    trim: true,
  },
  website: {
    type: String,
    trim: true,
  },
  industry: {
    type: String,
    trim: true,
  },
  teamSize: {
    type: String,
    trim: true,
  },
  logo: {
    type: String,
    trim: true,
  },
  about: {
    type: String,
    trim: true,
  },
  socialLinks: {
    linkedIn: String,
    twitter: String,
    website: String,
  },
  coverKey: {
    type: String,
    trim: true,
  },
  publicProfileVisible: {
    type: Boolean,
    default: false,
  },
  publicProfileSlug: {
    type: String,
    trim: true,
    lowercase: true,
    sparse: true,
  },
  pendingEmail: {
    type: String,
    trim: true,
    lowercase: true,
  },
  emailVerificationToken: {
    type: String,
    select: false,
  },
  emailVerificationExpires: {
    type: Date,
    select: false,
  },
  bio: {
    type: String,
    trim: true,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  isDisabled: {
    type: Boolean,
    default: false,
  },
  passwordResetToken: {
    type: String,
    select: false,
  },
  passwordResetExpires: {
    type: Date,
    select: false,
  },
  lastLogin: {
    type: Date,
  },
  emailVerified: {
    type: Boolean,
    default: false,
  },
  googleId: {
    type: String,
    unique: true,
    sparse: true,
  },
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Method to compare passwords
userSchema.methods.correctPassword = async function (candidatePassword, userPassword) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

// Method to generate password reset token
userSchema.methods.createPasswordResetToken = function () {
  const resetToken = crypto.randomBytes(32).toString('hex');
  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(resetToken)
    .digest('hex');

  this.passwordResetExpires = Date.now() + 10 * 60 * 1000; // 10 minutes

  return resetToken;
};

// Method to generate email verification token
userSchema.methods.createEmailVerificationToken = function () {
  const verificationToken = crypto.randomBytes(32).toString('hex');

  this.emailVerificationToken = crypto
    .createHash('sha256')
    .update(verificationToken)
    .digest('hex');

  this.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

  return verificationToken;
};

module.exports = mongoose.model('User', userSchema);

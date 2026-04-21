const jwt = require('jsonwebtoken');
const User = require('../models/User');
const crypto = require('crypto');
const {
  hasConfiguredEmailCredentials,
  sendEmailVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
} = require('../utils/emailService');
const { logEmail } = require('../utils/paymentLogger');
const {
  verifyGoogleToken,
  findOrCreateGoogleUser,
  getGoogleAuthConfig,
} = require('../utils/googleAuth');

const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '7d',
  });
};

const normalizeEmail = (value) => String(value || '').trim().toLowerCase();

const getAdminEmails = () => {
  const fromList = String(process.env.ADMIN_EMAILS || '')
    .split(',')
    .map(normalizeEmail)
    .filter(Boolean);
  const single = normalizeEmail(process.env.ADMIN_GMAIL || process.env.ADMIN_EMAIL || '');
  return new Set(single ? [...fromList, single] : fromList);
};

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';

const buildVerificationRedirectUrl = (status) => {
  return `${getFrontendUrl()}/?emailVerification=${encodeURIComponent(status)}`;
};

const getBackendBaseUrl = () => {
  if (process.env.BACKEND_URL) return process.env.BACKEND_URL;
  const port = process.env.PORT || 5000;
  return `http://localhost:${port}`;
};

const isLocalPreviewEnabled = () => process.env.NODE_ENV !== 'production';

const sendVerificationEmailForUser = async (user) => {
  const verificationToken = user.createEmailVerificationToken();
  await user.save({ validateBeforeSave: false });

  const verificationUrl = `${getBackendBaseUrl()}/api/auth/verify-email/${verificationToken}`;
  const emailResult = await sendEmailVerificationEmail(user.email, user.name, verificationUrl);

  return {
    ...emailResult,
    verificationUrl,
  };
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: 'success',
    token,
    data: { user },
  });
};

// POST /api/auth/register
exports.register = async (req, res) => {
  try {
    const { name, password, role } = req.body;
    const email = normalizeEmail(req.body?.email);

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, email, password, and role.',
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: 'fail',
        message: 'Email already in use.',
      });
    }

    const newUser = await User.create({ name, email, password, role });
    const emailResult = await sendVerificationEmailForUser(newUser);

    logEmail({
      recipient: email,
      subject: 'Verify your HomeTown Helper email',
      type: 'verification',
      status: emailResult.success ? 'sent' : 'failed',
      userId: newUser._id,
      error: emailResult.error,
    });

    res.status(201).json({
      status: 'success',
      message: 'Account created. Please verify your email before signing in.',
      data: {
        email,
        emailVerified: false,
        emailDeliveryConfigured: hasConfiguredEmailCredentials(),
        verificationPreviewUrl:
          isLocalPreviewEnabled() && emailResult.preview ? emailResult.verificationUrl : undefined,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/auth/login
exports.login = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const { password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide email and password.',
      });
    }

    const user = await User.findOne({ email }).select('+password');
    if (!user || !(await user.correctPassword(password, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Incorrect email or password.',
      });
    }

    if (!user.emailVerified) {
      return res.status(403).json({
        status: 'fail',
        code: 'EMAIL_NOT_VERIFIED',
        message: 'Please verify your email before signing in.',
        data: {
          email: user.email,
        },
      });
    }

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/auth/me  (protected)
exports.getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    res.status(200).json({ status: 'success', data: { user } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/auth/update-profile (protected)
exports.updateProfile = async (req, res) => {
  try {
    const { name, location, skills, avatar, phoneNumber, bio } = req.body;

    const updateData = {};
    if (name) updateData.name = name;
    if (location) updateData.location = location;
    if (skills) updateData.skills = skills;
    if (avatar) updateData.avatar = avatar;
    if (phoneNumber) updateData.phoneNumber = phoneNumber;
    if (bio) updateData.bio = bio;

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      status: 'success',
      message: 'Profile updated successfully!',
      data: { user },
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// PATCH /api/auth/change-password (protected)
exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide current password and new password.',
      });
    }

    const user = await User.findById(req.user.id).select('+password');

    if (!(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({
        status: 'fail',
        message: 'Current password is incorrect.',
      });
    }

    user.password = newPassword;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/auth/helpers - Get all helpers
exports.getAllHelpers = async (req, res) => {
  try {
    const helpers = await User.find({ role: 'helper' }).select('-password');
    res.status(200).json({
      status: 'success',
      results: helpers.length,
      data: { helpers },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/auth/helpers/:id - Get helper profile
exports.getHelperProfile = async (req, res) => {
  try {
    const helper = await User.findById(req.params.id).select('-password');

    if (!helper || helper.role !== 'helper') {
      return res.status(404).json({
        status: 'fail',
        message: 'Helper not found.',
      });
    }

    res.status(200).json({
      status: 'success',
      data: { helper },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/auth/forgot-password
exports.forgotPassword = async (req, res) => {
  try {
    const email = req.body?.email?.trim()?.toLowerCase();
    const genericMessage = 'If an account exists for that email, a password reset link has been sent.';

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an email address.',
      });
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a valid email address.',
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      // Do not disclose whether an account exists for this email.
      return res.status(200).json({
        status: 'success',
        message: genericMessage,
      });
    }

    // Generate reset token
    const resetToken = user.createPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/reset-password/${resetToken}`;

    // Send email
    const emailResult = await sendResetPasswordEmail(email, resetToken, resetUrl);

    // Log email
    logEmail({
      recipient: email,
      subject: 'Password Reset Request',
      type: 'reset',
      status: emailResult.success ? 'sent' : 'failed',
      userId: user._id,
      error: emailResult.error
    });

    res.status(200).json({
      status: 'success',
      message: genericMessage,
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// POST /api/auth/reset-password/:token
exports.resetPassword = async (req, res) => {
  try {
    const { password, passwordConfirm } = req.body;
    const { token } = req.params;

    if (!token) {
      return res.status(400).json({
        status: 'fail',
        message: 'Reset token is required.',
      });
    }

    if (!password || !passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide password and password confirmation.',
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        status: 'fail',
        message: 'Password must be at least 6 characters long.',
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: 'fail',
        message: 'Passwords do not match.',
      });
    }

    // Hash the token
    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');

    // Find user with matching token and check expiration
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({
        status: 'fail',
        message: 'Token is invalid or has expired.',
      });
    }

    // Update password and clear reset token
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    sendToken(user, 200, res);
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// GET /api/auth/verify-email/:token
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    if (!token) {
      return res.redirect(buildVerificationRedirectUrl('invalid'));
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    }).select('+emailVerificationToken +emailVerificationExpires');

    if (!user) {
      return res.redirect(buildVerificationRedirectUrl('invalid'));
    }

    user.emailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    try {
      await sendWelcomeEmail(user.email, user.name);
      logEmail({
        recipient: user.email,
        subject: 'Welcome to HomeTown Helper',
        type: 'welcome',
        status: 'sent',
        userId: user._id,
      });
    } catch (emailErr) {
      logEmail({
        recipient: user.email,
        subject: 'Welcome to HomeTown Helper',
        type: 'welcome',
        status: 'failed',
        userId: user._id,
        error: emailErr.message,
      });
    }

    return res.redirect(buildVerificationRedirectUrl('success'));
  } catch (err) {
    return res.redirect(buildVerificationRedirectUrl('error'));
  }
};

// POST /api/auth/resend-verification
exports.resendVerificationEmail = async (req, res) => {
  try {
    const email = normalizeEmail(req.body?.email);
    const genericMessage = 'If that account exists and is not yet verified, a new verification email has been sent.';

    if (!email) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide an email address.',
      });
    }

    const user = await User.findOne({ email });
    if (!user || user.emailVerified) {
      return res.status(200).json({
        status: 'success',
        message: genericMessage,
      });
    }

    const emailResult = await sendVerificationEmailForUser(user);

    logEmail({
      recipient: email,
      subject: 'Verify your HomeTown Helper email',
      type: 'verification',
      status: emailResult.success ? 'sent' : 'failed',
      userId: user._id,
      error: emailResult.error,
    });

    return res.status(200).json({
      status: 'success',
      message: genericMessage,
      data: {
        emailDeliveryConfigured: hasConfiguredEmailCredentials(),
        verificationPreviewUrl:
          isLocalPreviewEnabled() && emailResult.preview ? emailResult.verificationUrl : undefined,
      },
    });
  } catch (err) {
    return res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

// POST /api/auth/google
exports.googleAuth = async (req, res) => {
  try {
    const { token, role } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide Google token.',
      });
    }

    // Verify Google token
    const verifyResult = await verifyGoogleToken(token);
    if (!verifyResult.success) {
      return res.status(verifyResult.statusCode || 401).json({
        status: 'fail',
        message: verifyResult.error || 'Invalid Google token.',
        code: verifyResult.code,
      });
    }

    // Find or create user
    let user = await findOrCreateGoogleUser(verifyResult.data);

    // Capture isNew BEFORE any subsequent saves reset Mongoose's internal state
    const isNewUser = !!user.isNew;

    const adminEmails = getAdminEmails();
    const googleEmail = normalizeEmail(verifyResult?.data?.email || user?.email);
    const isAdminGoogleAccount = adminEmails.has(googleEmail);

    // Admin Gmails are always treated as admin.
    if (isAdminGoogleAccount && user.role !== 'admin') {
      user.role = 'admin';
      await user.save();
    }

    // Respect the selected role for non-admin Google sign-ins.
    if (!isAdminGoogleAccount && role && (role === 'seeker' || role === 'helper') && user.role !== role) {
      user.role = role;
      await user.save();
    }

    // Send welcome email if new user
    if (isNewUser) {
      try {
        await sendWelcomeEmail(user.email, user.name);
        logEmail({
          recipient: user.email,
          subject: 'Welcome to HomeTown Helper',
          type: 'welcome',
          status: 'sent',
          userId: user._id
        });
      } catch (emailErr) {
        console.warn('[googleAuth] Welcome email failed:', emailErr.message);
      }
    }

    sendToken(user, 200, res);
  } catch (err) {
    console.error('[googleAuth] Unexpected error:', err.message);
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};


// GET /api/auth/google-config
exports.getGoogleConfig = async (req, res) => {
  try {
    const googleAuthConfig = getGoogleAuthConfig();

    res.status(200).json({
      status: 'success',
      data: {
        configured: googleAuthConfig.configured,
        fallbackEnabled: googleAuthConfig.allowInsecureFallback,
        mode: googleAuthConfig.mode,
        clientId: googleAuthConfig.configured ? googleAuthConfig.clientId : '',
      },
    });
  } catch (err) {
    res.status(500).json({
      status: 'error',
      message: err.message,
    });
  }
};

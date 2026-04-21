const crypto = require('crypto');
const User = require('../models/User');
const Profile = require('../models/Profile');
const Company = require('../models/Company');
const Document = require('../models/Document');
const NotificationPreference = require('../models/NotificationPreference');
const Session = require('../models/Session');
const ApiKey = require('../models/ApiKey');
const AuditLog = require('../models/AuditLog');
const BillingCustomer = require('../models/BillingCustomer');
const PaymentMethod = require('../models/PaymentMethod');
const Invoice = require('../models/Invoice');
const Subscription = require('../models/Subscription');
const { isValidEmail, isValidE164, isValidUrl, isValidDocumentType, validateProfilePayload } = require('../utils/validation');
const { createSignedUpload } = require('../utils/storageService');
const { sendVerificationEmail } = require('../utils/emailService');

const buildProfileResponse = async (user) => {
  const profile = await Profile.findOne({ userId: user._id }) || {};
  const company = await Company.findOne({ userId: user._id }) || {};
  const notificationPreferences = await NotificationPreference.find({ userId: user._id });
  const subscription = await Subscription.findOne({ userId: user._id });
  const billingCustomer = await BillingCustomer.findOne({ userId: user._id });

  return {
    user: {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role,
      phone: user.phoneNumber,
      emailVerified: user.emailVerified,
      createdAt: user.createdAt,
    },
    profile,
    company,
    notificationPreferences,
    billing: {
      customer: billingCustomer,
      subscription,
    },
  };
};

exports.getProfile = async (req, res) => {
  try {
    const profile = await buildProfileResponse(req.user);
    return res.status(200).json({ status: 'success', data: profile });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const payload = req.body;
    const validationErrors = validateProfilePayload(payload);
    if (validationErrors.length) {
      return res.status(400).json({ status: 'fail', errors: validationErrors });
    }

    const userUpdates = {};
    if (payload.name) userUpdates.name = payload.name;
    if (payload.phone && isValidE164(payload.phone)) userUpdates.phoneNumber = payload.phone;

    if (Object.keys(userUpdates).length > 0) {
      await User.findByIdAndUpdate(req.user.id, userUpdates, { new: true, runValidators: true });
    }

    const profileData = {
      userId: req.user.id,
      headline: payload.headline || payload.headline === '' ? payload.headline : undefined,
      bio: payload.bio || payload.bio === '' ? payload.bio : undefined,
      timezone: payload.timezone || undefined,
      locale: payload.locale || undefined,
      address: payload.address || undefined,
      publicProfile: payload.publicProfile || undefined,
    };

    const updateArgs = Object.entries(profileData).reduce((acc, [key, value]) => {
      if (value !== undefined) acc[key] = value;
      return acc;
    }, {});

    const profile = await Profile.findOneAndUpdate({ userId: req.user.id }, updateArgs, {
      new: true,
      upsert: true,
      setDefaultsOnInsert: true,
    });

    AuditLog.create({
      userId: req.user.id,
      action: 'update_profile',
      targetType: 'Profile',
      targetId: profile._id.toString(),
      ip: req.ip,
      userAgent: req.headers['user-agent'],
      metadata: { fields: Object.keys(updateArgs) },
    });

    return res.status(200).json({ status: 'success', data: { profile } });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.requestAvatarUpload = async (req, res) => {
  try {
    const { filename, mimeType } = req.body;
    if (!filename || !mimeType) {
      return res.status(400).json({ status: 'fail', message: 'filename and mimeType are required.' });
    }

    if (!isValidDocumentType(mimeType)) {
      return res.status(400).json({ status: 'fail', message: 'Unsupported file type.' });
    }

    const signedData = createSignedUpload({ userId: req.user.id, filename, mimeType, type: 'avatar' });
    return res.status(200).json({ status: 'success', data: signedData });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.requestCoverUpload = async (req, res) => {
  try {
    const { filename, mimeType } = req.body;
    if (!filename || !mimeType) {
      return res.status(400).json({ status: 'fail', message: 'filename and mimeType are required.' });
    }

    if (!isValidDocumentType(mimeType)) {
      return res.status(400).json({ status: 'fail', message: 'Unsupported file type.' });
    }

    const signedData = createSignedUpload({ userId: req.user.id, filename, mimeType, type: 'cover' });
    return res.status(200).json({ status: 'success', data: signedData });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.listDocuments = async (req, res) => {
  try {
    const { q, tag, sort = '-createdAt' } = req.query;
    const filter = { userId: req.user.id, deletedAt: null };
    if (q) filter.filename = { $regex: q, $options: 'i' };
    if (tag) filter.tags = tag;

    const documents = await Document.find(filter).sort(sort).limit(100);
    return res.status(200).json({ status: 'success', results: documents.length, data: { documents } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createDocument = async (req, res) => {
  try {
    const { key, filename, mime, size, tags = [] } = req.body;
    if (!key || !filename || !mime || !size) {
      return res.status(400).json({ status: 'fail', message: 'Document metadata is required.' });
    }
    if (size > 20 * 1024 * 1024) {
      return res.status(400).json({ status: 'fail', message: 'File size exceeds 20MB.' });
    }
    if (!isValidDocumentType(mime)) {
      return res.status(400).json({ status: 'fail', message: 'Unsupported document type.' });
    }

    const existing = await Document.findOne({ userId: req.user.id, filename, deletedAt: null }).sort({ version: -1 });
    const version = existing ? existing.version + 1 : 1;
    const document = await Document.create({
      userId: req.user.id,
      key,
      filename,
      mime,
      size,
      version,
      tags,
      uploadedBy: req.user.id,
    });
    return res.status(201).json({ status: 'success', data: { document } });
  } catch (err) {
    return res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.softDeleteDocument = async (req, res) => {
  try {
    const document = await Document.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, deletedAt: null },
      { deletedAt: new Date() },
      { new: true }
    );
    if (!document) {
      return res.status(404).json({ status: 'fail', message: 'Document not found.' });
    }
    return res.status(200).json({ status: 'success', data: { document } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getNotificationPreferences = async (req, res) => {
  try {
    const preferences = await NotificationPreference.find({ userId: req.user.id });
    return res.status(200).json({ status: 'success', data: { preferences } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.updateNotificationPreferences = async (req, res) => {
  try {
    const { channel, topic, enabled, frequency } = req.body;
    if (!channel || !topic) {
      return res.status(400).json({ status: 'fail', message: 'Channel and topic are required.' });
    }
    const preference = await NotificationPreference.findOneAndUpdate(
      { userId: req.user.id, channel, topic },
      { enabled: enabled !== undefined ? enabled : true, frequency: frequency || 'immediate' },
      { new: true, upsert: true, setDefaultsOnInsert: true }
    );
    return res.status(200).json({ status: 'success', data: { preference } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.changeEmail = async (req, res) => {
  try {
    const { email } = req.body;
    if (!email || !isValidEmail(email)) {
      return res.status(400).json({ status: 'fail', message: 'A valid email address is required.' });
    }

    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ status: 'fail', message: 'Email is already in use.' });
    }

    const token = crypto.randomBytes(32).toString('hex');
    const tokenHash = crypto.createHash('sha256').update(token).digest('hex');
    req.user.emailChangeToken = tokenHash;
    req.user.emailChangeExpires = Date.now() + 24 * 60 * 60 * 1000;
    req.user.pendingEmail = email;
    await req.user.save({ validateBeforeSave: false });

    const verifyUrl = `${process.env.FRONTEND_URL || 'http://localhost:3000'}/verify-email/${token}`;
    await sendVerificationEmail(email, verifyUrl);

    return res.status(200).json({ status: 'success', message: 'Verification email sent to the new address. Email will update after confirmation.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.changePassword = async (req, res) => {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword) {
      return res.status(400).json({ status: 'fail', message: 'Current password and new password are required.' });
    }
    const user = await User.findById(req.user.id).select('+password');
    if (!user || !(await user.correctPassword(currentPassword, user.password))) {
      return res.status(401).json({ status: 'fail', message: 'Current password is incorrect.' });
    }
    user.password = newPassword;
    await user.save();
    return res.status(200).json({ status: 'success', message: 'Password updated successfully.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getSessions = async (req, res) => {
  try {
    const sessions = await Session.find({ userId: req.user.id, revokedAt: null }).sort('-updatedAt');
    return res.status(200).json({ status: 'success', data: { sessions } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.revokeSession = async (req, res) => {
  try {
    const session = await Session.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, revokedAt: null },
      { revokedAt: new Date() },
      { new: true }
    );
    if (!session) {
      return res.status(404).json({ status: 'fail', message: 'Session not found.' });
    }
    return res.status(200).json({ status: 'success', message: 'Session revoked.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.listApiKeys = async (req, res) => {
  try {
    const keys = await ApiKey.find({ userId: req.user.id, revokedAt: null }).select('name prefix createdAt lastUsedAt');
    return res.status(200).json({ status: 'success', data: { keys } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.createApiKey = async (req, res) => {
  try {
    const { name } = req.body;
    if (!name) {
      return res.status(400).json({ status: 'fail', message: 'API key name is required.' });
    }

    const rawKey = crypto.randomBytes(24).toString('hex');
    const prefix = rawKey.slice(0, 8);
    const hash = crypto.createHash('sha256').update(rawKey).digest('hex');

    const apiKey = await ApiKey.create({ userId: req.user.id, name, prefix, hash });
    return res.status(201).json({ status: 'success', data: { apiKey: { id: apiKey._id, name: apiKey.name, prefix: apiKey.prefix, createdAt: apiKey.createdAt }, secret: rawKey } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.revokeApiKey = async (req, res) => {
  try {
    const apiKey = await ApiKey.findOneAndUpdate(
      { _id: req.params.id, userId: req.user.id, revokedAt: null },
      { revokedAt: new Date() },
      { new: true }
    );
    if (!apiKey) {
      return res.status(404).json({ status: 'fail', message: 'API key not found.' });
    }
    return res.status(200).json({ status: 'success', message: 'API key revoked.' });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.getAuditLogs = async (req, res) => {
  try {
    const { action, from, to } = req.query;
    const filter = { userId: req.user.id };
    if (action) filter.action = action;
    if (from || to) filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);

    const logs = await AuditLog.find(filter).sort('-createdAt').limit(200);
    return res.status(200).json({ status: 'success', results: logs.length, data: { logs } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.previewPublicProfile = async (req, res) => {
  try {
    const profile = await Profile.findOne({ userId: req.user.id });
    if (!profile) {
      return res.status(404).json({ status: 'fail', message: 'Profile not found.' });
    }

    const result = {
      handle: profile.publicProfile?.handle || `u/${req.user._id}`,
      visible: profile.publicProfile?.visible || false,
      name: req.user.name,
      role: profile.headline,
      company: (await Company.findOne({ userId: req.user.id }))?.name || '',
      bio: profile.bio,
      stats: profile.statistics,
      social: (await Company.findOne({ userId: req.user.id }))?.social || {},
    };
    return res.status(200).json({ status: 'success', data: { profile: result } });
  } catch (err) {
    return res.status(500).json({ status: 'error', message: err.message });
  }
};

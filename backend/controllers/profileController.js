const crypto = require('crypto');
const User = require('../models/User');

exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -passwordResetToken -passwordResetExpires');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Profile not found.' });
    }

    res.status(200).json({ status: 'success', data: { profile: user } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.updateProfile = async (req, res) => {
  try {
    const allowedFields = [
      'name',
      'firstName',
      'lastName',
      'email',
      'phoneNumber',
      'timezone',
      'locale',
      'location',
      'skills',
      'bio',
      'address',
      'companyName',
      'roleTitle',
      'website',
      'industry',
      'teamSize',
      'about',
      'socialLinks',
      'avatar',
      'coverKey',
      'publicProfileVisible',
      'publicProfileSlug',
    ];

    const updateData = {};
    allowedFields.forEach((field) => {
      if (req.body[field] !== undefined) {
        updateData[field] = req.body[field];
      }
    });

    if (req.body.address && typeof req.body.address === 'object') {
      updateData.address = {
        ...req.user.address,
        ...req.body.address,
      };
    }

    if (req.body.socialLinks && typeof req.body.socialLinks === 'object') {
      updateData.socialLinks = {
        ...req.user.socialLinks,
        ...req.body.socialLinks,
      };
    }

    const user = await User.findByIdAndUpdate(req.user.id, updateData, {
      new: true,
      runValidators: true,
    }).select('-password -passwordResetToken -passwordResetExpires');

    res.status(200).json({ status: 'success', message: 'Profile updated successfully.', data: { profile: user } });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

exports.uploadAvatar = async (req, res) => {
  try {
    const { avatarUrl, avatarKey } = req.body;
    if (!avatarUrl && !avatarKey) {
      return res.status(400).json({ status: 'fail', message: 'Avatar data is required.' });
    }

    const update = avatarUrl ? { avatar: avatarUrl } : { avatar: avatarKey };
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');

    res.status(200).json({ status: 'success', data: { avatar: user.avatar } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.uploadCover = async (req, res) => {
  try {
    const { coverUrl, coverKey } = req.body;
    if (!coverUrl && !coverKey) {
      return res.status(400).json({ status: 'fail', message: 'Cover image data is required.' });
    }

    const update = coverUrl ? { coverKey: coverUrl } : { coverKey };
    const user = await User.findByIdAndUpdate(req.user.id, update, { new: true }).select('-password');

    res.status(200).json({ status: 'success', data: { coverKey: user.coverKey } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.changeEmailRequest = async (req, res) => {
  try {
    const { newEmail } = req.body;
    if (!newEmail) {
      return res.status(400).json({ status: 'fail', message: 'New email address is required.' });
    }

    const existingUser = await User.findOne({ email: newEmail });
    if (existingUser) {
      return res.status(400).json({ status: 'fail', message: 'Email already in use.' });
    }

    const token = crypto.randomBytes(24).toString('hex');
    req.user.pendingEmail = newEmail;
    req.user.emailVerificationToken = crypto.createHash('sha256').update(token).digest('hex');
    req.user.emailVerificationExpires = Date.now() + 24 * 60 * 60 * 1000;
    await req.user.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', message: 'Email change verification requested.', data: { verificationToken: token } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.verifyEmailChange = async (req, res) => {
  try {
    const { token } = req.body;
    if (!token) {
      return res.status(400).json({ status: 'fail', message: 'Verification token is required.' });
    }

    const hashedToken = crypto.createHash('sha256').update(token).digest('hex');
    const user = await User.findOne({
      _id: req.user.id,
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return res.status(400).json({ status: 'fail', message: 'Invalid or expired token.' });
    }

    user.email = user.pendingEmail;
    user.pendingEmail = undefined;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save({ validateBeforeSave: false });

    res.status(200).json({ status: 'success', message: 'Email verified and updated successfully.' });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

exports.previewPublicProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -passwordResetToken -passwordResetExpires');
    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'Profile not found.' });
    }

    res.status(200).json({ status: 'success', data: { publicProfile: {
      name: `${user.firstName || ''} ${user.lastName || user.name}`.trim(),
      roleTitle: user.roleTitle,
      companyName: user.companyName,
      about: user.about || user.bio,
      socialLinks: user.socialLinks,
      stats: {
        opportunities: user.totalJobs || 0,
        won: user.rating ? Math.round(user.rating * 10) : 0,
        current: 0,
      },
      publicProfileSlug: user.publicProfileSlug,
      publicProfileVisible: user.publicProfileVisible,
      avatar: user.avatar,
      coverKey: user.coverKey,
    } } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

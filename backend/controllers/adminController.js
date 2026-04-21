const User = require('../models/User');
const Service = require('../models/Service');
const Booking = require('../models/Booking');
const Category = require('../models/Category');
const Review = require('../models/Review');
const Contact = require('../models/Contact');

const buildProfileCompleteness = (user) => {
  const fields = [
    user.name,
    user.email,
    user.phoneNumber,
    user.location,
    user.bio,
    user.avatar,
    user.website,
    user.roleTitle,
  ];

  const score = fields.filter((value) => typeof value === 'string' ? value.trim().length > 0 : Boolean(value)).length;
  return Math.round((score / fields.length) * 100);
};

// ============ DASHBOARD ANALYTICS ============

// GET /api/admin/dashboard
exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalProviders = await User.countDocuments({ role: 'helper' });
    const totalSeekers = await User.countDocuments({ role: 'seeker' });
    const totalServices = await Service.countDocuments();
    const totalBookings = await Booking.countDocuments();
    const totalCategories = await Category.countDocuments();
    const totalReviews = await Review.countDocuments();

    // Revenue calculation (sum of all completed bookings)
    const revenue = await Booking.aggregate([
      { $match: { status: 'completed' } },
      { $group: { _id: null, total: { $sum: '$totalPrice' } } },
    ]);

    // Recent activities
    const recentUsers = await User.find()
      .sort({ createdAt: -1 })
      .limit(5)
      .select('name email role createdAt');

    const recentBookings = await Booking.find()
      .populate('seeker', 'name email')
      .populate('helper', 'name email')
      .populate('service', 'name price')
      .sort({ createdAt: -1 })
      .limit(5);

    res.status(200).json({
      status: 'success',
      data: {
        stats: {
          totalUsers,
          totalProviders,
          totalSeekers,
          totalServices,
          totalBookings,
          totalCategories,
          totalReviews,
          totalRevenue: revenue.length > 0 ? revenue[0].total : 0,
        },
        recentUsers,
        recentBookings,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ============ USER MANAGEMENT ============

// GET /api/admin/users
exports.getAllUsers = async (req, res) => {
  try {
    const { role, search } = req.query;
    let filter = {};

    if (role) filter.role = role;
    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ];
    }

    const users = await User.find(filter)
      .select('-password')
      .sort({ createdAt: -1 });

    const userIds = users.map((user) => user._id);

    const [serviceCounts, seekerBookingCounts, helperBookingCounts, reviewCounts] = await Promise.all([
      Service.aggregate([
        { $match: { provider: { $in: userIds } } },
        { $group: { _id: '$provider', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { seeker: { $in: userIds } } },
        { $group: { _id: '$seeker', count: { $sum: 1 } } },
      ]),
      Booking.aggregate([
        { $match: { helper: { $in: userIds } } },
        { $group: { _id: '$helper', count: { $sum: 1 } } },
      ]),
      Review.aggregate([
        { $match: { helper: { $in: userIds } } },
        { $group: { _id: '$helper', count: { $sum: 1 } } },
      ]),
    ]);

    const toCountMap = (rows) => rows.reduce((accumulator, row) => {
      accumulator[row._id.toString()] = row.count;
      return accumulator;
    }, {});

    const serviceCountMap = toCountMap(serviceCounts);
    const seekerBookingCountMap = toCountMap(seekerBookingCounts);
    const helperBookingCountMap = toCountMap(helperBookingCounts);
    const reviewCountMap = toCountMap(reviewCounts);

    const usersWithStats = users.map((user) => {
      const id = user._id.toString();
      return {
        ...user.toObject(),
        stats: {
          services: serviceCountMap[id] || 0,
          seekerBookings: seekerBookingCountMap[id] || 0,
          helperBookings: helperBookingCountMap[id] || 0,
          reviews: reviewCountMap[id] || 0,
        },
        profileCompleteness: buildProfileCompleteness(user),
      };
    });

    res.status(200).json({
      status: 'success',
      results: usersWithStats.length,
      data: { users: usersWithStats },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/admin/users/:id
exports.getUserDetails = async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    const [services, seekerBookings, helperBookings, reviewsReceived, reviewsGiven] = await Promise.all([
      Service.find({ provider: user._id })
        .populate('category', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Booking.find({ seeker: user._id })
        .populate('service', 'name price')
        .populate('helper', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      Booking.find({ helper: user._id })
        .populate('service', 'name price')
        .populate('seeker', 'name email')
        .sort({ createdAt: -1 })
        .limit(10),
      Review.find({ helper: user._id })
        .populate('reviewer', 'name email')
        .populate('service', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
      Review.find({ reviewer: user._id })
        .populate('helper', 'name email')
        .populate('service', 'name')
        .sort({ createdAt: -1 })
        .limit(10),
    ]);

    const stats = {
      services: await Service.countDocuments({ provider: user._id }),
      seekerBookings: await Booking.countDocuments({ seeker: user._id }),
      helperBookings: await Booking.countDocuments({ helper: user._id }),
      reviewsReceived: await Review.countDocuments({ helper: user._id }),
      reviewsGiven: await Review.countDocuments({ reviewer: user._id }),
      profileCompleteness: buildProfileCompleteness(user),
    };

    res.status(200).json({
      status: 'success',
      data: {
        user,
        services,
        seekerBookings,
        helperBookings,
        reviewsReceived,
        reviewsGiven,
        stats,
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/admin/users/:id
exports.updateUser = async (req, res) => {
  try {
    const allowedFields = ['name', 'email', 'role', 'location', 'phoneNumber', 'isDisabled'];
    const updates = {};

    allowedFields.forEach((field) => {
      if (Object.prototype.hasOwnProperty.call(req.body, field)) {
        updates[field] = req.body[field];
      }
    });

    if (updates.email && typeof updates.email === 'string') {
      updates.email = updates.email.trim().toLowerCase();
    }

    if (updates.name && typeof updates.name === 'string') {
      updates.name = updates.name.trim();
    }

    if (updates.role && req.user && req.user.id === req.params.id && updates.role !== 'admin') {
      return res.status(400).json({
        status: 'fail',
        message: 'You cannot remove your own admin role',
      });
    }

    if (updates.email) {
      const existing = await User.findOne({ email: updates.email, _id: { $ne: req.params.id } });
      if (existing) {
        return res.status(400).json({ status: 'fail', message: 'Email is already in use' });
      }
    }

    const user = await User.findByIdAndUpdate(req.params.id, updates, {
      new: true,
      runValidators: true,
      context: 'query',
    }).select('-password');

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'User updated successfully',
      data: { user },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/admin/users/:id/disable
exports.disableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Add isDisabled field
    user.isDisabled = true;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User disabled successfully',
      data: { user },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/admin/users/:id/enable
exports.enableUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    user.isDisabled = false;
    await user.save();

    res.status(200).json({
      status: 'success',
      message: 'User enabled successfully',
      data: { user },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/admin/users/:id
exports.deleteUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    if (!user) {
      return res.status(404).json({ status: 'fail', message: 'User not found' });
    }

    // Delete user's services
    await Service.deleteMany({ provider: user._id });

    // Delete user
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'User deleted successfully',
      data: null,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ============ SERVICE MANAGEMENT ============

// GET /api/admin/services
exports.getAllServices = async (req, res) => {
  try {
    const { status, provider, category } = req.query;
    let filter = {};

    if (status) filter.isReported = status === 'reported';
    if (provider) filter.provider = provider;
    if (category) filter.category = category;

    const services = await Service.find(filter)
      .populate('provider', 'name email role')
      .populate('category', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: services.length,
      data: { services },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/admin/services/:id
exports.getServiceDetails = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email role rating totalJobs')
      .populate('category', 'name');

    if (!service) {
      return res.status(404).json({ status: 'fail', message: 'Service not found' });
    }

    // Get reviews for this service
    const reviews = await Review.find({ service: service._id })
      .populate('reviewer', 'name avatar rating')
      .limit(10);

    res.status(200).json({
      status: 'success',
      data: { service, reviews },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/admin/services/:id
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('provider', 'name email')
      .populate('category', 'name');

    if (!service) {
      return res.status(404).json({ status: 'fail', message: 'Service not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Service updated successfully',
      data: { service },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/admin/services/:id
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);

    if (!service) {
      return res.status(404).json({ status: 'fail', message: 'Service not found' });
    }

    await Service.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Service deleted successfully',
      data: null,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ============ BOOKING MANAGEMENT ============

// GET /api/admin/bookings
exports.getAllBookings = async (req, res) => {
  try {
    const { status } = req.query;
    let filter = {};

    if (status) filter.status = status;

    const bookings = await Booking.find(filter)
      .populate('seeker', 'name email')
      .populate('service', 'name price')
      .populate('helper', 'name email')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: bookings.length,
      data: { bookings },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/admin/bookings/:id
exports.getBookingDetails = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id)
      .populate('seeker', 'name email phoneNumber location')
      .populate('helper', 'name email phoneNumber location')
      .populate('service', 'name price description');

    if (!booking) {
      return res.status(404).json({ status: 'fail', message: 'Booking not found' });
    }

    res.status(200).json({
      status: 'success',
      data: { booking },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/admin/bookings/:id/status
exports.updateBookingStatus = async (req, res) => {
  try {
    const { status } = req.body;

    if (!['pending', 'accepted', 'completed', 'cancelled', 'rejected'].includes(status)) {
      return res.status(400).json({
        status: 'fail',
        message: 'Invalid status. Must be: pending, accepted, completed, cancelled, or rejected',
      });
    }

    const booking = await Booking.findByIdAndUpdate(
      req.params.id,
      { status },
      { new: true, runValidators: true }
    )
      .populate('seeker', 'name email')
      .populate('helper', 'name email')
      .populate('service', 'name price');

    if (!booking) {
      return res.status(404).json({ status: 'fail', message: 'Booking not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Booking status updated successfully',
      data: { booking },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/admin/bookings/:id
exports.deleteBooking = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.id);

    if (!booking) {
      return res.status(404).json({ status: 'fail', message: 'Booking not found' });
    }

    booking.status = 'cancelled';
    booking.updatedAt = Date.now();
    await booking.save();

    res.status(200).json({
      status: 'success',
      message: 'Booking cancelled successfully',
      data: { booking },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ============ REVIEW MANAGEMENT ============

// GET /api/admin/reviews
exports.getAllReviews = async (req, res) => {
  try {
    const reviews = await Review.find()
      .populate('reviewer', 'name email')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: reviews.length,
      data: { reviews },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/admin/reviews/:id
exports.deleteReview = async (req, res) => {
  try {
    const review = await Review.findById(req.params.id);

    if (!review) {
      return res.status(404).json({ status: 'fail', message: 'Review not found' });
    }

    await Review.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Review deleted successfully',
      data: null,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ============ CONTACT MANAGEMENT ============

// GET /api/admin/contacts
exports.getAllContacts = async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: contacts.length,
      data: { contacts },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/admin/contacts/:id
exports.deleteContact = async (req, res) => {
  try {
    const contact = await Contact.findById(req.params.id);

    if (!contact) {
      return res.status(404).json({ status: 'fail', message: 'Message not found' });
    }

    await Contact.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Message deleted successfully',
      data: null,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ============ CATEGORY MANAGEMENT ============

// GET /api/admin/categories
exports.getAllCategories = async (req, res) => {
  try {
    const categories = await Category.find().sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: categories.length,
      data: { categories },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/admin/categories
exports.createCategory = async (req, res) => {
  try {
    const { name, icon, description } = req.body;

    if (!name) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide a category name',
      });
    }

    const category = await Category.create({
      name,
      icon: icon || '📁',
      description: description || '',
    });

    res.status(201).json({
      status: 'success',
      message: 'Category created successfully',
      data: { category },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/admin/categories/:id
exports.updateCategory = async (req, res) => {
  try {
    const category = await Category.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Category not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Category updated successfully',
      data: { category },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/admin/categories/:id
exports.deleteCategory = async (req, res) => {
  try {
    const category = await Category.findById(req.params.id);

    if (!category) {
      return res.status(404).json({ status: 'fail', message: 'Category not found' });
    }

    // Check if any services use this category
    const servicesCount = await Service.countDocuments({ category: category._id });
    if (servicesCount > 0) {
      return res.status(400).json({
        status: 'fail',
        message: `Cannot delete category. ${servicesCount} service(s) are using this category.`,
      });
    }

    await Category.findByIdAndDelete(req.params.id);

    res.status(200).json({
      status: 'success',
      message: 'Category deleted successfully',
      data: null,
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ============ REPORTS & MODERATION ============

// GET /api/admin/reports
exports.getAllReports = async (req, res) => {
  try {
    const reports = await Review.find({ isReported: true })
      .populate('reviewer', 'name email')
      .populate('service', 'name')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: reports.length,
      data: { reports },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PATCH /api/admin/reports/:id/resolve
exports.resolveReport = async (req, res) => {
  try {
    const review = await Review.findByIdAndUpdate(
      req.params.id,
      { isReported: false },
      { new: true }
    );

    if (!review) {
      return res.status(404).json({ status: 'fail', message: 'Report not found' });
    }

    res.status(200).json({
      status: 'success',
      message: 'Report resolved successfully',
      data: { review },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// ============ SYSTEM HEALTH ============

// GET /api/admin/system-health
exports.getSystemHealth = async (req, res) => {
  try {
    const dbConnected = require('mongoose').connection.readyState === 1;

    // Get system metrics
    const activeBookings = await Booking.countDocuments({ status: 'accepted' });
    const pendingBookings = await Booking.countDocuments({ status: 'pending' });
    const disabledUsers = await User.countDocuments({ isDisabled: true });

    res.status(200).json({
      status: 'success',
      data: {
        database: dbConnected ? 'connected' : 'disconnected',
        activeBookings,
        pendingBookings,
        disabledUsers,
        timestamp: new Date(),
      },
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

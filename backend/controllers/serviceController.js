const Service = require('../models/Service');
const Category = require('../models/Category');
const User = require('../models/User');
const Job = require('../models/Job');

const formatCount = (value) => `${value}+`;

const refreshCategoryCount = async (categoryId) => {
  if (!categoryId) return;
  const [serviceCount, jobCount] = await Promise.all([
    Service.countDocuments({ category: categoryId }),
    Job.countDocuments({ category: categoryId }),
  ]);
  await Category.findByIdAndUpdate(categoryId, { count: formatCount(serviceCount + jobCount) });
};

const refreshProviderTotalJobs = async (providerId) => {
  if (!providerId) return;
  const [serviceCount, jobCount] = await Promise.all([
    Service.countDocuments({ provider: providerId }),
    Job.countDocuments({ provider: providerId }),
  ]);
  await User.findByIdAndUpdate(providerId, { totalJobs: serviceCount + jobCount });
};

// GET /api/services?category=<id>&location=<location>&search=<keyword>
exports.getAllServices = async (req, res) => {
  try {
    const filter = {};
    const { category, location, search } = req.query;

    if (category && category !== 'All') filter.category = category;
    if (location && location !== 'All Locations') filter.location = location;

    if (search) {
      filter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
      ];
    }

    const services = await Service.find(filter)
      .populate('provider', 'name email role avatar rating totalJobs location')
      .populate('category', 'name icon')
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

// GET /api/services/by-location/:location
exports.getServicesByLocation = async (req, res) => {
  try {
    const { location } = req.params;
    const services = await Service.find({ location })
      .populate('provider', 'name email role avatar rating')
      .populate('category', 'name icon')
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

// GET /api/services/by-category/:categoryId
exports.getServicesByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;
    const services = await Service.find({ category: categoryId })
      .populate('provider', 'name email role avatar rating')
      .populate('category', 'name icon')
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

// GET /api/services/provider/:providerId - Get all services by a provider
exports.getServicesByProvider = async (req, res) => {
  try {
    const { providerId } = req.params;
    const services = await Service.find({ provider: providerId })
      .populate('provider', 'name email role avatar rating')
      .populate('category', 'name icon')
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

// GET /api/services/:id
exports.getService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id)
      .populate('provider', 'name email role avatar rating totalJobs location bio phoneNumber')
      .populate('category', 'name icon');

    if (!service) {
      return res.status(404).json({ status: 'fail', message: 'No service found with that ID.' });
    }

    res.status(200).json({ status: 'success', data: { service } });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/services  (helper only — protected)
exports.createService = async (req, res) => {
  try {
    const { name, description, price, category, location, tags, duration } = req.body;

    if (!name || !description || !price || !category) {
      return res.status(400).json({
        status: 'fail',
        message: 'Please provide name, description, price, and category.',
      });
    }

    const service = await Service.create({
      name,
      description,
      price,
      category,
      location: location || '',
      tags: tags || [],
      duration: duration || '1 hour',
      provider: req.user.id,
    });

    await Promise.all([
      refreshCategoryCount(category),
      refreshProviderTotalJobs(req.user.id),
    ]);

    await service.populate('provider', 'name email role avatar');
    await service.populate('category', 'name icon');

    res.status(201).json({ 
      status: 'success', 
      message: 'Service created successfully!',
      data: { service } 
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// PATCH /api/services/:id  (owner only — protected)
exports.updateService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ status: 'fail', message: 'No service found with that ID.' });
    }

    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'You can only update your own services.' });
    }

    const previousCategoryId = service.category ? service.category.toString() : null;
    const providerId = service.provider ? service.provider.toString() : null;

    const updated = await Service.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    })
      .populate('provider', 'name email role avatar')
      .populate('category', 'name icon');

    const updatedCategoryId = updated?.category?._id ? updated.category._id.toString() : previousCategoryId;

    await Promise.all([
      refreshCategoryCount(previousCategoryId),
      updatedCategoryId !== previousCategoryId ? refreshCategoryCount(updatedCategoryId) : Promise.resolve(),
      refreshProviderTotalJobs(providerId),
    ]);

    res.status(200).json({ 
      status: 'success',
      message: 'Service updated successfully!',
      data: { service: updated } 
    });
  } catch (err) {
    res.status(400).json({ status: 'fail', message: err.message });
  }
};

// DELETE /api/services/:id  (owner only — protected)
exports.deleteService = async (req, res) => {
  try {
    const service = await Service.findById(req.params.id);
    if (!service) {
      return res.status(404).json({ status: 'fail', message: 'No service found with that ID.' });
    }

    if (service.provider.toString() !== req.user.id) {
      return res.status(403).json({ status: 'fail', message: 'You can only delete your own services.' });
    }

    const categoryId = service.category ? service.category.toString() : null;
    const providerId = service.provider ? service.provider.toString() : null;

    await Service.findByIdAndDelete(req.params.id);

    await Promise.all([
      refreshCategoryCount(categoryId),
      refreshProviderTotalJobs(providerId),
    ]);

    res.status(200).json({ 
      status: 'success',
      message: 'Service deleted successfully!',
      data: null 
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

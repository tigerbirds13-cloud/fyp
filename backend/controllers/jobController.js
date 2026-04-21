const Job = require('../models/Job');
const User = require('../models/User');
const Category = require('../models/Category');
const Service = require('../models/Service');

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

// GET /api/jobs - Get all jobs with filtering (includes services)
exports.getAllJobs = async (req, res) => {
  try {
    const filter = {};
    const serviceFilter = {};
    const { category, location, search, status, workType, jobType, urgent } = req.query;

    // Build filter object for jobs
    if (category && category !== 'All') filter.category = category;
    if (location && location !== 'All Locations') filter.location = location;
    if (status && status !== 'All') filter.status = status;
    if (workType && workType !== 'All') filter.workType = workType;
    if (jobType && jobType !== 'All') filter.jobType = jobType;
    if (urgent === 'true') filter.urgent = true;

    // Build filter object for services (simplified)
    if (category && category !== 'All') serviceFilter.category = category;
    if (location && location !== 'All Locations') serviceFilter.location = location;

    // Text search for jobs
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } },
        { requirements: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Text search for services
    if (search) {
      serviceFilter.$or = [
        { name: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    // Fetch jobs and services in parallel
    const [jobs, services] = await Promise.all([
      Job.find(filter)
        .populate('provider', 'name email role avatar rating location companyName')
        .populate('category', 'name icon')
        .populate('applicants.user', 'name email avatar'),
      Service.find(serviceFilter)
        .populate('provider', 'name email role avatar rating location')
        .populate('category', 'name icon')
    ]);

    // Convert services to job-like format for unified display
    const servicesAsJobs = services.map(service => ({
      ...service.toObject(),
      _id: service._id,
      title: service.name,
      pay: `NPR ${service.price}`,
      jobType: 'Service',
      workType: 'On-site',
      source: 'service',
      createdAt: service.createdAt
    }));

    // Combine and sort by creation date, most recent first
    const combinedResults = [...jobs, ...servicesAsJobs].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      status: 'success',
      results: combinedResults.length,
      data: { jobs: combinedResults }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/jobs/:id - Get single job
exports.getJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('provider', 'name email role avatar rating location companyName phoneNumber')
      .populate('category', 'name icon')
      .populate('applicants.user', 'name email avatar');

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    // Increment view count
    job.views += 1;
    await job.save();

    res.status(200).json({
      status: 'success',
      data: { job }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/jobs - Create new job (Helper only)
exports.createJob = async (req, res) => {
  try {
    // Check if user is a helper
    if (req.user.role !== 'helper') {
      return res.status(403).json({
        status: 'error',
        message: 'Only local helpers can post jobs'
      });
    }

    const jobData = {
      ...req.body,
      provider: req.user._id
    };

    const job = await Job.create(jobData);

    await Promise.all([
      refreshCategoryCount(job.category),
      refreshProviderTotalJobs(req.user._id),
    ]);

    await job.populate('provider', 'name email role avatar rating location');
    await job.populate('category', 'name icon');

    res.status(201).json({
      status: 'success',
      data: { job }
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// PUT /api/jobs/:id - Update job (Provider only)
exports.updateJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    // Check if user is the provider
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only update your own jobs'
      });
    }

    const previousCategoryId = job.category ? job.category.toString() : null;
    const providerId = job.provider ? job.provider.toString() : null;

    const updatedJob = await Job.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true
    })
    .populate('provider', 'name email role avatar rating location')
    .populate('category', 'name icon');

    const updatedCategoryId = updatedJob?.category?._id ? updatedJob.category._id.toString() : previousCategoryId;

    await Promise.all([
      refreshCategoryCount(previousCategoryId),
      updatedCategoryId !== previousCategoryId ? refreshCategoryCount(updatedCategoryId) : Promise.resolve(),
      refreshProviderTotalJobs(providerId),
    ]);

    res.status(200).json({
      status: 'success',
      data: { job: updatedJob }
    });
  } catch (err) {
    res.status(400).json({ status: 'error', message: err.message });
  }
};

// DELETE /api/jobs/:id - Delete job (Provider only)
exports.deleteJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    // Check if user is the provider
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only delete your own jobs'
      });
    }

    const categoryId = job.category ? job.category.toString() : null;
    const providerId = job.provider ? job.provider.toString() : null;

    await Job.findByIdAndDelete(req.params.id);

    await Promise.all([
      refreshCategoryCount(categoryId),
      refreshProviderTotalJobs(providerId),
    ]);

    res.status(204).json({
      status: 'success',
      data: null
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/jobs/provider/:userId - Get jobs by provider
exports.getJobsByProvider = async (req, res) => {
  try {
    const jobs = await Job.find({ provider: req.params.userId })
      .populate('category', 'name icon')
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: 'success',
      results: jobs.length,
      data: { jobs }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// POST /api/jobs/:id/apply - Apply for a job
exports.applyForJob = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    // Check if job is active
    if (job.status !== 'Active') {
      return res.status(400).json({ status: 'error', message: 'This job is no longer accepting applications' });
    }

    // Check if user already applied
    const alreadyApplied = job.applicants.some(app =>
      app.user.toString() === req.user._id.toString()
    );

    if (alreadyApplied) {
      return res.status(400).json({ status: 'error', message: 'You have already applied for this job' });
    }

    // Add application
    job.applicants.push({
      user: req.user._id,
      appliedAt: new Date(),
      status: 'Pending'
    });

    await job.save();
    await job.populate('applicants.user', 'name email avatar');

    res.status(200).json({
      status: 'success',
      message: 'Application submitted successfully',
      data: { job }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/jobs/:id/applicants - Get job applicants (Provider only)
exports.getJobApplicants = async (req, res) => {
  try {
    const job = await Job.findById(req.params.id)
      .populate('applicants.user', 'name email avatar phoneNumber location skills')
      .populate('provider', 'name email');

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    // Check if user is the provider
    if (job.provider._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only view applicants for your own jobs'
      });
    }

    res.status(200).json({
      status: 'success',
      data: { applicants: job.applicants }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// PUT /api/jobs/:id/applicants/:applicantId - Update applicant status (Provider only)
exports.updateApplicantStatus = async (req, res) => {
  try {
    const { status } = req.body;
    const job = await Job.findById(req.params.id);

    if (!job) {
      return res.status(404).json({ status: 'error', message: 'Job not found' });
    }

    // Check if user is the provider
    if (job.provider.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        status: 'error',
        message: 'You can only manage applicants for your own jobs'
      });
    }

    // Find and update applicant
    const applicant = job.applicants.id(req.params.applicantId);
    if (!applicant) {
      return res.status(404).json({ status: 'error', message: 'Applicant not found' });
    }

    applicant.status = status;
    await job.save();

    res.status(200).json({
      status: 'success',
      message: `Applicant status updated to ${status}`,
      data: { applicant }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};

// GET /api/jobs/category/:categoryId - Get jobs and services by category
exports.getJobsByCategory = async (req, res) => {
  try {
    const { categoryId } = req.params;

    const [jobs, services] = await Promise.all([
      Job.find({ category: categoryId })
        .populate('provider', 'name email role avatar rating location companyName')
        .populate('category', 'name icon')
        .populate('applicants.user', 'name email avatar'),
      Service.find({ category: categoryId })
        .populate('provider', 'name email role avatar rating location')
        .populate('category', 'name icon')
    ]);

    // Convert services to job-like format for unified display
    const servicesAsJobs = services.map(service => ({
      ...service.toObject(),
      _id: service._id,
      title: service.name,
      pay: `NPR ${service.price}`,
      jobType: 'Service',
      workType: 'On-site',
      source: 'service',
      createdAt: service.createdAt
    }));

    // Combine and sort by creation date
    const combinedResults = [...jobs, ...servicesAsJobs].sort((a, b) => 
      new Date(b.createdAt) - new Date(a.createdAt)
    );

    res.status(200).json({
      status: 'success',
      results: combinedResults.length,
      data: { jobs: combinedResults }
    });
  } catch (err) {
    res.status(500).json({ status: 'error', message: err.message });
  }
};
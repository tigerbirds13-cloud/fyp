require('dotenv').config();
const mongoose = require('mongoose');

const User = require('./models/User');
const Category = require('./models/Category');
const Service = require('./models/Service');
const BillingCustomer = require('./models/BillingCustomer');
const Job = require('./models/Job');
const Review = require('./models/Review');
const Subscription = require('./models/Subscription');

const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fyp';

const sampleUsers = [
  {
    name: 'Demo Seeker',
    email: 'demo.seeker@hometownhelper.test',
    password: 'password123',
    role: 'seeker',
    location: 'Pokhara',
    phoneNumber: '9800000001',
  },
  {
    name: 'Demo Helper',
    email: 'demo.helper@hometownhelper.test',
    password: 'password123',
    role: 'helper',
    location: 'Kathmandu',
    phoneNumber: '9800000002',
    skills: ['Deep Cleaning', 'Kitchen Cleaning'],
  },
  {
    name: 'Demo Helper Pro',
    email: 'demo.helperpro@hometownhelper.test',
    password: 'password123',
    role: 'helper',
    location: 'Lalitpur',
    phoneNumber: '9800000003',
    skills: ['Electrical Repair', 'Appliance Setup'],
  },
];

const sampleCategories = [
  { name: 'Cleaning', icon: '🧹' },
  { name: 'Home Repair', icon: '🛠️' },
];

async function upsertUser(payload) {
  let user = await User.findOne({ email: payload.email }).select('+password');

  if (!user) {
    user = await User.create(payload);
    return { user, created: true };
  }

  const updates = {
    name: payload.name,
    role: payload.role,
    location: payload.location,
    phoneNumber: payload.phoneNumber,
    skills: payload.skills || [],
  };

  Object.assign(user, updates);
  await user.save();
  return { user, created: false };
}

async function upsertCategory(payload) {
  const category = await Category.findOneAndUpdate(
    { name: payload.name },
    { $set: { icon: payload.icon } },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return category;
}

async function upsertService(payload) {
  let service = await Service.findOne({ name: payload.name, provider: payload.provider });

  if (!service) {
    service = await Service.create(payload);
    return { service, created: true };
  }

  Object.assign(service, payload);
  await service.save();
  return { service, created: false };
}

async function upsertJob(payload) {
  let job = await Job.findOne({ title: payload.title, provider: payload.provider });

  if (!job) {
    job = await Job.create(payload);
    return { job, created: true };
  }

  Object.assign(job, payload);
  await job.save();
  return { job, created: false };
}

async function upsertReview(payload) {
  let review = await Review.findOne({ service: payload.service, reviewer: payload.reviewer });

  if (!review) {
    review = await Review.create(payload);
    return { review, created: true };
  }

  Object.assign(review, payload);
  await review.save();
  return { review, created: false };
}

async function upsertBillingCustomer(payload) {
  const customer = await BillingCustomer.findOneAndUpdate(
    { userId: payload.userId },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true }
  );

  return customer;
}

async function upsertSubscription(payload) {
  const subscription = await Subscription.findOneAndUpdate(
    { userId: payload.userId },
    { $set: payload },
    { new: true, upsert: true, setDefaultsOnInsert: true, runValidators: true }
  );

  return subscription;
}

async function main() {
  await mongoose.connect(mongoUri);

  const created = {
    users: 0,
    categories: 0,
    services: 0,
    jobs: 0,
    reviews: 0,
  };

  const [seekerResult, helperResult, helperProResult] = await Promise.all(sampleUsers.map(upsertUser));
  created.users += [seekerResult, helperResult, helperProResult].filter((entry) => entry.created).length;

  const [cleaningCategory, repairCategory] = await Promise.all(sampleCategories.map(upsertCategory));
  created.categories = sampleCategories.length;

  const serviceResults = await Promise.all([
    upsertService({
      name: 'Premium Home Cleaning',
      description: 'Deep home cleaning for kitchens, bedrooms, and shared spaces.',
      price: 1800,
      provider: helperResult.user._id,
      category: cleaningCategory._id,
      location: 'Kathmandu',
      tags: ['Deep Clean', 'Kitchen', 'Bathroom'],
      duration: '4 hours',
      totalJobs: 12,
      rating: 4.8,
    }),
    upsertService({
      name: 'Electrical Repair Visit',
      description: 'Repair of switches, sockets, and common household electrical issues.',
      price: 2500,
      provider: helperProResult.user._id,
      category: repairCategory._id,
      location: 'Lalitpur',
      tags: ['Wiring', 'Sockets', 'Repair'],
      duration: '2 hours',
      totalJobs: 8,
      rating: 4.7,
    }),
  ]);
  created.services += serviceResults.filter((entry) => entry.created).length;

  const jobResults = await Promise.all([
    upsertJob({
      title: 'Apartment Cleaner Needed',
      description: 'Need a reliable cleaner for a two-bedroom apartment twice a week.',
      category: cleaningCategory._id,
      location: 'Pokhara',
      workType: 'On-site',
      jobType: 'Part-time',
      pay: 'NPR 1500 per visit',
      requirements: ['Prior cleaning experience', 'Own cleaning kit preferred'],
      benefits: ['Long-term client', 'Flexible visit timing'],
      tags: ['Cleaning', 'Apartment'],
      provider: helperResult.user._id,
      status: 'Active',
      urgent: false,
      featured: true,
      contactEmail: helperResult.user.email,
      contactPhone: helperResult.user.phoneNumber,
    }),
    upsertJob({
      title: 'Urgent Electrician for Home Repairs',
      description: 'Looking for an electrician to inspect and repair faulty kitchen wiring this week.',
      category: repairCategory._id,
      location: 'Kathmandu',
      workType: 'On-site',
      jobType: 'Contract',
      pay: 'NPR 4000 per task',
      requirements: ['Certified electrician', 'Bring own tools'],
      benefits: ['Same-day payout'],
      tags: ['Electrician', 'Urgent'],
      provider: helperProResult.user._id,
      status: 'Active',
      urgent: true,
      featured: true,
      contactEmail: helperProResult.user.email,
      contactPhone: helperProResult.user.phoneNumber,
    }),
  ]);
  created.jobs += jobResults.filter((entry) => entry.created).length;

  const reviewResults = await Promise.all([
    upsertReview({
      service: serviceResults[0].service._id,
      reviewer: seekerResult.user._id,
      helper: helperResult.user._id,
      rating: 5,
      comment: 'Very thorough cleaning and arrived on time.',
    }),
    upsertReview({
      service: serviceResults[1].service._id,
      reviewer: seekerResult.user._id,
      helper: helperProResult.user._id,
      rating: 4,
      comment: 'Fixed the issue quickly and explained the repair clearly.',
    }),
  ]);
  created.reviews += reviewResults.filter((entry) => entry.created).length;

  await Promise.all([
    upsertBillingCustomer({
      userId: seekerResult.user._id,
      billingEmail: seekerResult.user.email,
      taxId: 'SEEKER-VAT-001',
      stripeCustomerId: 'cus_demo_seeker_001',
    }),
    upsertBillingCustomer({
      userId: helperResult.user._id,
      billingEmail: helperResult.user.email,
      taxId: 'HELPER-VAT-001',
      stripeCustomerId: 'cus_demo_helper_001',
    }),
  ]);

  await Promise.all([
    upsertSubscription({
      userId: seekerResult.user._id,
      stripeSubscriptionId: 'sub_demo_seeker_001',
      plan: 'pro',
      userType: 'seeker',
      currency: 'NPR',
      amount: 699,
      paymentMethod: 'khalti',
      khaltiPidx: 'seed-seeker-pidx',
      khaltiTransactionId: 'seed-seeker-txn',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }),
    upsertSubscription({
      userId: helperResult.user._id,
      stripeSubscriptionId: 'sub_demo_helper_001',
      plan: 'elite',
      userType: 'helper',
      currency: 'NPR',
      amount: 1999,
      paymentMethod: 'khalti',
      khaltiPidx: 'seed-helper-pidx',
      khaltiTransactionId: 'seed-helper-txn',
      status: 'active',
      currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
    }),
  ]);

  await User.findByIdAndUpdate(helperResult.user._id, { rating: 5, totalJobs: 2 });
  await User.findByIdAndUpdate(helperProResult.user._id, { rating: 4, totalJobs: 2 });
  await Category.findByIdAndUpdate(cleaningCategory._id, { count: '2+' });
  await Category.findByIdAndUpdate(repairCategory._id, { count: '2+' });

  console.log('Sample database data is ready.');
  console.log(`Users prepared: ${sampleUsers.length} (${created.users} newly created)`);
  console.log(`Categories prepared: ${sampleCategories.length}`);
  console.log(`Services prepared: ${serviceResults.length} (${created.services} newly created)`);
  console.log(`Jobs prepared: ${jobResults.length} (${created.jobs} newly created)`);
  console.log(`Reviews prepared: ${reviewResults.length} (${created.reviews} newly created)`);
  console.log('BillingCustomer prepared: 2');
  console.log('Subscription prepared: 2');
  console.log('Demo login password for seeded users: password123');
}

main()
  .then(async () => {
    await mongoose.disconnect();
    process.exit(0);
  })
  .catch(async (error) => {
    console.error('Failed to seed sample domain data:', error.message);
    await mongoose.disconnect().catch(() => {});
    process.exit(1);
  });
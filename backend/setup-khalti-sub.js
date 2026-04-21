const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');
const Subscription = require('./models/Subscription');

async function setup() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fyp?directConnection=true';
    await mongoose.connect(mongoUri);
    
    const user = await User.findOne({ email: 'khalti-test-seeker@example.com' });
    if (!user) {
      console.log('❌ User not found');
      process.exit(1);
    }
    
    let sub = await Subscription.findOne({ userId: user._id });
    if (!sub) {
      sub = await Subscription.create({
        userId: user._id,
        plan: 'pro',
        status: 'active',
        startDate: new Date(),
        endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000),
      });
      console.log('✅ Subscription created');
    } else {
      console.log('✅ Subscription already exists');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

setup();

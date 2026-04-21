const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function check() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fyp?directConnection=true';
    await mongoose.connect(mongoUri);
    
    const user = await User.findOne({ email: 'khalti-test-seeker@example.com' });
    if (user) {
      console.log('✅ User exists:');
      console.log('  Name:', user.name);
      console.log('  Email:', user.email);
      console.log('  Role:', user.role);
      console.log('  ID:', user._id);
    } else {
      console.log('❌ User not found');
      // List first 5 seeker users
      const seekers = await User.find({ role: 'seeker' }).limit(5);
      console.log('\nFirst 5 seekers:');
      seekers.forEach(s => console.log(`  - ${s.email}`));
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

check();

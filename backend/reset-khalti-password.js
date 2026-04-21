const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

const User = require('./models/User');

async function reset() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fyp?directConnection=true';
    await mongoose.connect(mongoUri);
    
    const password = 'Test@123456';
    const hashedPassword = await bcrypt.hash(password, 12);
    
    const result = await User.updateOne(
      { email: 'khalti-test-seeker@example.com' },
      { password: hashedPassword }
    );
    
    if (result.modifiedCount > 0) {
      console.log('✅ Password reset successfully');
      console.log('Email: khalti-test-seeker@example.com');
      console.log('Password: ' + password);
    } else {
      console.log('❌ No user updated');
    }
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

reset();

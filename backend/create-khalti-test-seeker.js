const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fyp?directConnection=true&serverSelectionTimeoutMS=2000';

(async () => {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✓ Connected to MongoDB');

    // Create test seeker
    const hashedPassword = await bcrypt.hash('TestKhalti@123', 12);
    
    const testSeeker = await User.create({
      name: 'Khalti Test Seeker',
      email: 'khalti-test-seeker@example.com',
      password: hashedPassword,
      role: 'seeker',
      phone: '9841234567',
      address: 'Test Address, Kathmandu',
      emailVerified: true,
    });

    console.log('✅ Test Seeker Created');
    console.log('  Email: khalti-test-seeker@example.com');
    console.log('  Password: TestKhalti@123');
    console.log('  ID:', testSeeker._id);

    // Create another test provider/helper
    const testHelper = await User.create({
      name: 'Khalti Test Helper',
      email: 'khalti-test-helper@example.com',
      password: hashedPassword,
      role: 'helper',
      phone: '9849876543',
      address: 'Helper Address, Kathmandu',
      emailVerified: true,
    });

    console.log('✅ Test Helper Created');
    console.log('  Email: khalti-test-helper@example.com');
    console.log('  Password: TestKhalti@123');
    console.log('  ID:', testHelper._id);

    await mongoose.connection.close();
    console.log('\n✓ Done');
  } catch (err) {
    console.error('❌ Error:', err.message);
    process.exit(1);
  }
})();

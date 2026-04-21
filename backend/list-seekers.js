const mongoose = require('mongoose');
require('dotenv').config();

const User = require('./models/User');

async function list() {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fyp?directConnection=true';
    await mongoose.connect(mongoUri);
    
    const seekers = await User.find({ role: 'seeker' }).limit(10);
    console.log('Seekers in database:');
    seekers.forEach((s, i) => {
      console.log(`${i + 1}. ${s.email} - ${s.name}`);
    });
    
    process.exit(0);
  } catch (err) {
    console.error('Error:', err.message);
    process.exit(1);
  }
}

list();

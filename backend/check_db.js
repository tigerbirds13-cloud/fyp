const mongoose = require('mongoose');
require('dotenv').config({ path: '/Users/aashishbagdas/FYP/backend/.env' });

async function checkDatabase() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✓ MongoDB Connected');
    
    const db = mongoose.connection.getClient().db();
    const collections = await db.listCollections().toArray();
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('DATABASE COLLECTIONS & DOCUMENT COUNTS');
    console.log('════════════════════════════════════════════════════════════\n');
    
    for (const coll of collections) {
      const collection = db.collection(coll.name);
      const count = await collection.countDocuments();
      console.log(`📊 ${coll.name}: ${count} documents`);
    }
    
    console.log('\n════════════════════════════════════════════════════════════');
    console.log('DATABASE STATISTICS');
    console.log('════════════════════════════════════════════════════════════\n');
    
    // Sample data from key collections
    const users = db.collection('users');
    const userCount = await users.countDocuments();
    const adminCount = await users.countDocuments({ role: 'admin' });
    const helperCount = await users.countDocuments({ role: 'helper' });
    const seekerCount = await users.countDocuments({ role: 'seeker' });
    
    console.log(`Users: ${userCount} total`);
    console.log(`  - Admins: ${adminCount}`);
    console.log(`  - Helpers: ${helperCount}`);
    console.log(`  - Seekers: ${seekerCount}`);
    
    const services = db.collection('services');
    const serviceCount = await services.countDocuments();
    console.log(`\nServices: ${serviceCount}`);
    
    const bookings = db.collection('bookings');
    const bookingCount = await bookings.countDocuments();
    const pendingBookings = await bookings.countDocuments({ status: 'pending' });
    const completedBookings = await bookings.countDocuments({ status: 'completed' });
    console.log(`\nBookings: ${bookingCount} total`);
    console.log(`  - Pending: ${pendingBookings}`);
    console.log(`  - Completed: ${completedBookings}`);
    
    const payments = db.collection('payments');
    const paymentCount = await payments.countDocuments();
    console.log(`\nPayments: ${paymentCount}`);
    
    const reviews = db.collection('reviews');
    const reviewCount = await reviews.countDocuments();
    console.log(`Reviews: ${reviewCount}`);
    
    const categories = db.collection('categories');
    const categoryCount = await categories.countDocuments();
    console.log(`Categories: ${categoryCount}`);
    
    await mongoose.disconnect();
  } catch (err) {
    console.error('✗ Error:', err.message);
    process.exit(1);
  }
}

checkDatabase();

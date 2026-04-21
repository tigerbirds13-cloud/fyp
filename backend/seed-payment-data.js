const mongoose = require('mongoose');
require('dotenv').config();

const Payment = require('./models/Payment');
const User = require('./models/User');
const Booking = require('./models/Booking');
const Subscription = require('./models/Subscription');

async function seedPayments() {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/fyp?directConnection=true&serverSelectionTimeoutMS=2000');
    console.log('✅ MongoDB connected');

    // Get sample users, bookings, and subscriptions
    const users = await User.find().limit(5);
    const bookings = await Booking.find().limit(3);
    const subscriptions = await Subscription.find().limit(2);

    if (users.length === 0) {
      console.log('⚠️ No users found. Please create users first.');
      return;
    }

    console.log(`Found ${users.length} users, ${bookings.length} bookings, ${subscriptions.length} subscriptions`);

    // Clear existing payments
    await Payment.deleteMany({});
    console.log('🗑️ Cleared existing payments');

    const samplePayments = [];

    // 1. Booking Payment - Completed
    if (bookings.length > 0) {
      samplePayments.push({
        userId: bookings[0].seeker,
        relatedId: bookings[0]._id,
        relatedModel: 'Booking',
        paymentType: 'booking',
        method: 'khalti',
        currency: 'NPR',
        amount: bookings[0].totalPrice,
        status: 'completed',
        paymentGateway: {
          khalti: {
            pidx: 'GvQP6M14N33D9r5H7R5V9Q7K3W' + Math.random().toString(36).substr(2, 9),
            idx: 'idx_' + Date.now(),
            token: 'khalti_token_' + Math.random().toString(36).substr(2, 20),
            mobileNumber: bookings[0].seeker.phoneNumber || '9866351442',
            transactionId: 'txn_' + Date.now(),
            timestamp: new Date(),
          },
        },
        description: `Payment for ${bookings[0].service?.name || 'Service'} booking`,
        customerInfo: {
          email: bookings[0].seeker.email,
          mobile: bookings[0].seeker.phoneNumber,
          name: bookings[0].seeker.name,
        },
        metadata: {
          serviceName: bookings[0].service?.name,
          serviceCategory: bookings[0].service?.category,
        },
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000), // 5 days ago
      });
    }

    // 2. Booking Payment - Pending
    if (bookings.length > 1) {
      samplePayments.push({
        userId: bookings[1].seeker,
        relatedId: bookings[1]._id,
        relatedModel: 'Booking',
        paymentType: 'booking',
        method: 'khalti',
        currency: 'NPR',
        amount: bookings[1].totalPrice,
        status: 'pending',
        paymentGateway: {
          khalti: {
            pidx: 'GvQP6M14N33D9r5H7R5V9Q7K3W' + Math.random().toString(36).substr(2, 9),
            mobileNumber: bookings[1].seeker.phoneNumber || '9866351442',
          },
        },
        description: `Payment for ${bookings[1].service?.name || 'Service'} booking (Awaiting Payment)`,
        customerInfo: {
          email: bookings[1].seeker.email,
          mobile: bookings[1].seeker.phoneNumber,
          name: bookings[1].seeker.name,
        },
        metadata: {
          serviceName: bookings[1].service?.name,
        },
      });
    }

    // 3. Booking Payment - Failed
    if (bookings.length > 2) {
      samplePayments.push({
        userId: bookings[2].seeker,
        relatedId: bookings[2]._id,
        relatedModel: 'Booking',
        paymentType: 'booking',
        method: 'khalti',
        currency: 'NPR',
        amount: bookings[2].totalPrice,
        status: 'failed',
        paymentGateway: {
          khalti: {
            pidx: 'GvQP6M14N33D9r5H7R5V9Q7K3W' + Math.random().toString(36).substr(2, 9),
            mobileNumber: bookings[2].seeker.phoneNumber || '9866351442',
          },
        },
        failureReason: 'Insufficient balance in account',
        description: `Payment failed for ${bookings[2].service?.name || 'Service'} booking`,
        customerInfo: {
          email: bookings[2].seeker.email,
          mobile: bookings[2].seeker.phoneNumber,
          name: bookings[2].seeker.name,
        },
      });
    }

    // 4. Subscription Payment - Completed (Pro Plan)
    if (subscriptions.length > 0 && users.length > 0) {
      samplePayments.push({
        userId: subscriptions[0].userId,
        relatedId: subscriptions[0]._id,
        relatedModel: 'Subscription',
        paymentType: 'subscription',
        method: 'khalti',
        currency: 'NPR',
        amount: subscriptions[0].amount,
        status: 'completed',
        paymentGateway: {
          khalti: {
            pidx: 'GvQP6M14N33D9r5H7R5V9Q7K3W' + Math.random().toString(36).substr(2, 9),
            idx: 'idx_' + Date.now(),
            token: 'khalti_token_' + Math.random().toString(36).substr(2, 20),
            mobileNumber: users[0].phoneNumber || '9866351442',
            transactionId: 'txn_' + Date.now(),
            timestamp: new Date(),
          },
        },
        description: `Subscription upgrade to ${subscriptions[0].plan} plan`,
        customerInfo: {
          email: users[0].email,
          mobile: users[0].phoneNumber,
          name: users[0].name,
        },
        metadata: {
          planName: subscriptions[0].plan,
          planType: subscriptions[0].userType,
        },
        createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // 30 days ago
      });
    }

    // 5. Subscription Payment - Pending
    if (subscriptions.length > 1 && users.length > 1) {
      samplePayments.push({
        userId: subscriptions[1].userId,
        relatedId: subscriptions[1]._id,
        relatedModel: 'Subscription',
        paymentType: 'subscription',
        method: 'khalti',
        currency: 'NPR',
        amount: subscriptions[1].amount,
        status: 'pending',
        paymentGateway: {
          khalti: {
            pidx: 'GvQP6M14N33D9r5H7R5V9Q7K3W' + Math.random().toString(36).substr(2, 9),
            mobileNumber: users[1].phoneNumber || '9866351442',
          },
        },
        description: `Subscription upgrade to ${subscriptions[1].plan} plan`,
        customerInfo: {
          email: users[1].email,
          mobile: users[1].phoneNumber,
          name: users[1].name,
        },
        metadata: {
          planName: subscriptions[1].plan,
          planType: subscriptions[1].userType,
        },
      });
    }

    // 6. Refund Payment
    if (users.length > 2 && bookings.length > 0) {
      samplePayments.push({
        userId: users[2]._id,
        relatedId: bookings[0]._id,
        relatedModel: 'Booking',
        paymentType: 'refund',
        method: 'khalti',
        currency: 'NPR',
        amount: 2500,
        status: 'completed',
        paymentGateway: {
          khalti: {
            pidx: 'GvQP6M14N33D9r5H7R5V9Q7K3W' + Math.random().toString(36).substr(2, 9),
            transactionId: 'refund_' + Date.now(),
          },
        },
        description: 'Refund issued for cancelled booking',
        refundedAt: new Date(),
        refundAmount: 2500,
        customerInfo: {
          email: users[2].email,
          mobile: users[2].phoneNumber,
          name: users[2].name,
        },
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000), // 10 days ago
      });
    }

    // 7. Multiple Payments for User (Payment History)
    if (users.length > 3) {
      for (let i = 0; i < 3; i++) {
        samplePayments.push({
          userId: users[3]._id,
          relatedModel: 'Booking',
          paymentType: 'booking',
          method: 'khalti',
          currency: 'NPR',
          amount: 1500 + i * 500,
          status: 'completed',
          paymentGateway: {
            khalti: {
              pidx: 'GvQP6M14N33D9r5H7R5V9Q7K3W' + Math.random().toString(36).substr(2, 9),
              transactionId: 'txn_history_' + i + '_' + Date.now(),
            },
          },
          description: `Service booking payment #${i + 1}`,
          customerInfo: {
            email: users[3].email,
            mobile: users[3].phoneNumber,
            name: users[3].name,
          },
          createdAt: new Date(Date.now() - (20 - i * 5) * 24 * 60 * 60 * 1000),
        });
      }
    }

    // Insert sample payments
    const insertedPayments = await Payment.insertMany(samplePayments);
    console.log(`✅ Inserted ${insertedPayments.length} sample payments`);

    // Display payment statistics
    const stats = await Payment.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    console.log('\n📊 Payment Statistics:');
    console.log('─'.repeat(50));
    stats.forEach((stat) => {
      console.log(`${stat._id.toUpperCase()}: ${stat.count} payments | NPR ${stat.totalAmount.toLocaleString()}`);
    });

    // Display payment methods
    const methodStats = await Payment.aggregate([
      {
        $group: {
          _id: '$method',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    console.log('\n💳 Payment Methods:');
    console.log('─'.repeat(50));
    methodStats.forEach((method) => {
      console.log(`${method._id.toUpperCase()}: ${method.count} payments | NPR ${method.totalAmount.toLocaleString()}`);
    });

    // Display payment types
    const typeStats = await Payment.aggregate([
      {
        $group: {
          _id: '$paymentType',
          count: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
        },
      },
    ]);

    console.log('\n📝 Payment Types:');
    console.log('─'.repeat(50));
    typeStats.forEach((type) => {
      console.log(`${type._id.toUpperCase()}: ${type.count} payments | NPR ${type.totalAmount.toLocaleString()}`);
    });

    console.log('\n✅ Payment data seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding payments:', error.message);
    process.exit(1);
  }
}

seedPayments();

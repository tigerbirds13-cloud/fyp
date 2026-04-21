const mongoose = require("mongoose");
require("dotenv").config({ path: "./.env" });

const Category = require("./models/Category");
const Service = require("./models/Service");
const User = require("./models/User");
const Booking = require("./models/Booking");

async function setupTestData() {
  try {
    console.log("Connecting to MongoDB...");
    await mongoose.connect(
      process.env.MONGODB_URI ||
        "mongodb://127.0.0.1:27017/fyp?directConnection=true",
    );
    console.log("✓ Connected to MongoDB");

    // Get or create seeker
    let seeker = await User.findOne({ email: "seeker_khalti@test.com" });
    if (!seeker) {
      seeker = await User.create({
        name: "Test Seeker",
        email: "seeker_khalti@test.com",
        password: "Test@1234",
        role: "seeker",
        emailVerified: true,
      });
      console.log("✓ Created seeker:", seeker._id);
    } else {
      console.log("✓ Using existing seeker:", seeker._id);
    }

    // Get or create helper
    let helper = await User.findOne({ email: "helper_khalti@test.com" });
    if (!helper) {
      helper = await User.create({
        name: "Test Helper",
        email: "helper_khalti@test.com",
        password: "Test@1234",
        role: "helper",
        emailVerified: true,
      });
      console.log("✓ Created helper:", helper._id);
    } else {
      console.log("✓ Using existing helper:", helper._id);
    }

    // Get or create category
    let category = await Category.findOne({ name: "Cleaning" });
    if (!category) {
      category = await Category.create({
        name: "Cleaning",
        icon: "🧹",
        count: "1+",
      });
      console.log("✓ Created category:", category._id);
    } else {
      console.log("✓ Using existing category:", category._id);
    }

    // Get or create service
    let service = await Service.findOne({
      name: "Test Cleaning Service",
      provider: helper._id,
    });
    if (!service) {
      service = await Service.create({
        name: "Test Cleaning Service",
        description:
          "Professional cleaning service for testing Khalti payments",
        price: 1000,
        category: category._id,
        provider: helper._id,
        location: "Kathmandu",
        tags: ["test", "khalti"],
        duration: "2 hours",
      });
      console.log("✓ Created service:", service._id);
    } else {
      console.log("✓ Using existing service:", service._id);
    }

    // Create booking
    const scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 2);

    const booking = await Booking.create({
      service: service._id,
      seeker: seeker._id,
      helper: helper._id,
      scheduledDate,
      location: "Kathmandu",
      notes: "Test booking for Khalti payment testing",
      totalPrice: 1000,
      status: "pending",
      payment: {
        method: "khalti",
        status: "pending",
      },
    });

    console.log("✓ Created booking:", booking._id);

    console.log("\n=== Test Data Setup Complete ===");
    console.log("Seeker ID:", seeker._id);
    console.log("Helper ID:", helper._id);
    console.log("Service ID:", service._id);
    console.log("Booking ID:", booking._id);
    console.log("\nYou can now test Khalti payment with this booking ID!");

    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

setupTestData();

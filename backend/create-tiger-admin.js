const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config();

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: {
    type: String,
    enum: ["seeker", "helper", "admin"],
    default: "seeker",
  },
  emailVerified: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

async function createAdminUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const adminEmail = "tigerbirds13@gmail.com";
    const adminPassword = "Tigerten@13";
    const adminName = "Tiger Admin";

    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: adminEmail });
    if (existingAdmin) {
      console.log("\n⚠️  Admin account already exists!");
      console.log(`  Email: ${adminEmail}`);
      await mongoose.disconnect();
      process.exit(0);
    }

    const newAdmin = await User.create({
      name: adminName,
      email: adminEmail,
      password: adminPassword,
      role: "admin",
      emailVerified: true, // Pre-verify admin account
    });

    console.log("\n✓ Admin account created successfully!");
    console.log("================================");
    console.log(`  Name:     ${adminName}`);
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${adminPassword}`);
    console.log(`  Role:     admin`);
    console.log("================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    if (err.code === 11000) {
      console.log("\n✗ Email already in use");
      await mongoose.disconnect();
      process.exit(1);
    } else {
      console.error("Error:", err.message);
      process.exit(1);
    }
  }
}

createAdminUser();

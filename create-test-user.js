const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
require("dotenv").config({ path: "./backend/.env" });

const userSchema = new mongoose.Schema({
  name: String,
  email: { type: String, unique: true, lowercase: true },
  password: { type: String, select: false },
  role: {
    type: String,
    enum: ["seeker", "helper", "admin"],
    default: "seeker",
  },
  createdAt: { type: Date, default: Date.now },
});

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

const User = mongoose.model("User", userSchema);

async function createTestUser() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const newUser = await User.create({
      name: "Test Helper",
      email: "helper@gmail.com",
      password: "password123",
      role: "helper",
    });

    console.log("\n✓ Test helper account created!");
    console.log("  Email: helper@gmail.com");
    console.log("  Password: password123");
    console.log("  Role: helper\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    if (err.code === 11000) {
      console.log("\n✓ Test account already exists");
      console.log("  Email: helper@gmail.com");
      console.log("  Password: password123\n");
      await mongoose.disconnect();
      process.exit(0);
    } else {
      console.error("Error:", err.message);
      process.exit(1);
    }
  }
}

createTestUser();

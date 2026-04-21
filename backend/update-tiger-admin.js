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

async function updateAdminPassword() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("Connected to MongoDB");

    const adminEmail = "tigerbirds13@gmail.com";
    const newPassword = "Tigerten@13";

    // Find and update user
    const user = await User.findOne({ email: adminEmail });
    if (!user) {
      console.log("\n✗ Admin user not found with email:", adminEmail);
      await mongoose.disconnect();
      process.exit(1);
    }

    user.password = newPassword;
    user.emailVerified = true;
    user.role = "admin";
    await user.save();

    console.log("\n✓ Admin password updated successfully!");
    console.log("================================");
    console.log(`  Email:    ${adminEmail}`);
    console.log(`  Password: ${newPassword}`);
    console.log(`  Role:     ${user.role}`);
    console.log(`  Verified: ✓`);
    console.log("================================\n");

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("Error:", err.message);
    process.exit(1);
  }
}

updateAdminPassword();

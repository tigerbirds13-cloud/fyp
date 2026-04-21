const mongoose = require("mongoose");
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

const User = mongoose.model("User", userSchema);

async function verifyAllEmails() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    console.log("════════════════════════════════════════════════════════════");
    console.log("EMAIL VERIFICATION FOR ALL USERS");
    console.log(
      "════════════════════════════════════════════════════════════\n",
    );

    // Get stats before
    const unverifiedBefore = await User.countDocuments({
      emailVerified: false,
    });
    const verifiedBefore = await User.countDocuments({ emailVerified: true });
    const totalUsers = await User.countDocuments();

    console.log("📊 BEFORE UPDATE:");
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Verified: ${verifiedBefore}`);
    console.log(`  Unverified: ${unverifiedBefore}`);

    // Update all unverified users
    if (unverifiedBefore > 0) {
      console.log(`\n⏳ Verifying ${unverifiedBefore} user emails...\n`);

      const result = await User.updateMany(
        { emailVerified: false },
        { emailVerified: true },
      );

      console.log(`✓ Updated ${result.modifiedCount} users\n`);
    } else {
      console.log("\n✓ All users already verified!\n");
    }

    // Get stats after
    const verifiedAfter = await User.countDocuments({ emailVerified: true });
    const unverifiedAfter = await User.countDocuments({ emailVerified: false });

    console.log("📊 AFTER UPDATE:");
    console.log(`  Total Users: ${totalUsers}`);
    console.log(`  Verified: ${verifiedAfter} ✓`);
    console.log(`  Unverified: ${unverifiedAfter}`);

    // Show sample verified users
    console.log("\n📋 SAMPLE VERIFIED USERS:");
    const sampleUsers = await User.find({ emailVerified: true })
      .select("name email role emailVerified")
      .limit(5);

    sampleUsers.forEach((user, index) => {
      console.log(
        `  ${index + 1}. ${user.name} (${user.email}) - ${user.role} - Verified: ✓`,
      );
    });

    console.log(
      "\n════════════════════════════════════════════════════════════",
    );
    console.log("✓ EMAIL VERIFICATION COMPLETE");
    console.log(
      "════════════════════════════════════════════════════════════\n",
    );

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error("✗ Error:", err.message);
    process.exit(1);
  }
}

verifyAllEmails();

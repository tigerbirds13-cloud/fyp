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

async function verifyGmailAccounts() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("✓ Connected to MongoDB\n");

    console.log("════════════════════════════════════════════════════════════");
    console.log("EMAIL VERIFICATION FOR @GMAIL.COM ACCOUNTS ONLY");
    console.log(
      "════════════════════════════════════════════════════════════\n",
    );

    // Find all gmail accounts
    const gmailUsers = await User.find({ email: { $regex: /@gmail\.com$/i } });
    console.log(`📊 GMAIL ACCOUNTS FOUND: ${gmailUsers.length}\n`);

    // Show before status
    console.log("BEFORE UPDATE:");
    gmailUsers.forEach((user, index) => {
      const status = user.emailVerified ? "✓ Verified" : "✗ Unverified";
      console.log(
        `  ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${status}`,
      );
    });

    // Update only unverified gmail accounts
    const unverifiedGmail = await User.countDocuments({
      email: { $regex: /@gmail\.com$/i },
      emailVerified: false,
    });

    console.log(
      `\n⏳ Updating ${unverifiedGmail} unverified Gmail accounts...\n`,
    );

    if (unverifiedGmail > 0) {
      const result = await User.updateMany(
        {
          email: { $regex: /@gmail\.com$/i },
          emailVerified: false,
        },
        { emailVerified: true },
      );

      console.log(`✓ Updated ${result.modifiedCount} Gmail accounts\n`);
    } else {
      console.log("✓ All Gmail accounts already verified!\n");
    }

    // Show after status
    const updatedGmailUsers = await User.find({
      email: { $regex: /@gmail\.com$/i },
    });
    console.log("AFTER UPDATE:");
    updatedGmailUsers.forEach((user, index) => {
      const status = user.emailVerified ? "✓ Verified" : "✗ Unverified";
      console.log(
        `  ${index + 1}. ${user.name} (${user.email}) - ${user.role} - ${status}`,
      );
    });

    // Statistics
    const verifiedGmail = await User.countDocuments({
      email: { $regex: /@gmail\.com$/i },
      emailVerified: true,
    });

    const unverifiedRemaining = await User.countDocuments({
      email: { $regex: /@gmail\.com$/i },
      emailVerified: false,
    });

    console.log(
      "\n════════════════════════════════════════════════════════════",
    );
    console.log("📊 FINAL STATISTICS");
    console.log("════════════════════════════════════════════════════════════");
    console.log(`  Total Gmail Accounts: ${updatedGmailUsers.length}`);
    console.log(`  Verified: ${verifiedGmail} ✓`);
    console.log(`  Unverified: ${unverifiedRemaining}`);
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

verifyGmailAccounts();

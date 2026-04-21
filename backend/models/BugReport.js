const mongoose = require("mongoose");

const bugReportSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false, // Anonymous bug reports allowed
    },
    email: {
      type: String,
      required: [true, "Email is required"],
    },
    title: {
      type: String,
      required: [true, "Bug title is required"],
      trim: true,
      maxlength: 200,
    },
    description: {
      type: String,
      required: [true, "Bug description is required"],
      trim: true,
    },
    stepsToReproduce: {
      type: String,
      trim: true,
      default: "",
    },
    expectedBehavior: {
      type: String,
      trim: true,
      default: "",
    },
    actualBehavior: {
      type: String,
      trim: true,
      default: "",
    },
    severity: {
      type: String,
      enum: ["low", "medium", "high", "critical"],
      default: "medium",
    },
    category: {
      type: String,
      enum: [
        "frontend",
        "backend",
        "payment",
        "auth",
        "booking",
        "profile",
        "other",
      ],
      default: "other",
    },
    browserInfo: {
      userAgent: String,
      browser: String,
      platform: String,
      screenResolution: String,
    },
    deviceInfo: {
      type: String,
      enum: ["desktop", "tablet", "mobile"],
      default: "desktop",
    },
    url: {
      type: String,
      trim: true,
    },
    attachments: {
      type: [String], // URLs to screenshots or files
      default: [],
    },
    status: {
      type: String,
      enum: [
        "new",
        "acknowledged",
        "in-progress",
        "fixed",
        "wontfix",
        "duplicate",
      ],
      default: "new",
    },
    priority: {
      type: String,
      enum: ["p0", "p1", "p2", "p3"],
      default: "p3",
    },
    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
    notes: {
      type: String,
      trim: true,
      default: "",
    },
    relatedIssueId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "BugReport",
      default: null, // Link to duplicate or related bugs
    },
    ticketNumber: {
      type: String,
      unique: true,
      sparse: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    resolvedAt: {
      type: Date,
      default: null,
    },
  },
  { timestamps: true },
);

// Generate ticket number before saving
bugReportSchema.pre("save", async function (next) {
  if (!this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    const timestamp = Date.now().toString().slice(-6);
    this.ticketNumber = `BUG-${timestamp}-${count + 1}`;
  }
  next();
});

// Index for queries
bugReportSchema.index({ userId: 1, createdAt: -1 });
bugReportSchema.index({ status: 1, severity: 1 });
bugReportSchema.index({ ticketNumber: 1 });
bugReportSchema.index({ email: 1 });

module.exports = mongoose.model("BugReport", bugReportSchema);

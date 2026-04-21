const BugReport = require("../models/BugReport");
const { logEmail } = require("../utils/paymentLogger");
const nodemailer = require("nodemailer");

// Configure email sending for bug reports
const sendBugReportNotification = async (bugReport) => {
  try {
    const devEmail =
      process.env.DEV_TEAM_EMAIL || "dev-team@hometownhelper.com";

    const emailContent = `
NEW BUG REPORT SUBMITTED

Ticket Number: ${bugReport.ticketNumber}
Severity: ${bugReport.severity.toUpperCase()}
Category: ${bugReport.category}
Status: ${bugReport.status}

Title: ${bugReport.title}

Description:
${bugReport.description}

Steps to Reproduce:
${bugReport.stepsToReproduce || "Not provided"}

Expected Behavior:
${bugReport.expectedBehavior || "Not provided"}

Actual Behavior:
${bugReport.actualBehavior || "Not provided"}

Browser/Device Info:
- Device: ${bugReport.deviceInfo}
- User Agent: ${bugReport.browserInfo?.userAgent || "N/A"}
- URL: ${bugReport.url || "N/A"}

Reporter Email: ${bugReport.email}
Reported By: ${bugReport.userId ? "Logged-in User" : "Anonymous"}

Link to Dashboard: https://admin.hometownhelper.com/bugs/${bugReport.ticketNumber}
    `;

    // Send to dev team (implement actual email sending as needed)
    console.log("Bug report notification:", emailContent);

    return { success: true };
  } catch (error) {
    console.error("Error sending bug report notification:", error);
    return { success: false, error: error.message };
  }
};

// POST /api/bugs - Submit a new bug report
exports.submitBugReport = async (req, res) => {
  try {
    const {
      title,
      description,
      stepsToReproduce,
      expectedBehavior,
      actualBehavior,
      severity,
      category,
      browserInfo,
      deviceInfo,
      url,
      email,
    } = req.body;

    // Validation
    if (!title || !description || !email) {
      return res.status(400).json({
        status: "fail",
        message: "Title, description, and email are required.",
      });
    }

    if (!["low", "medium", "high", "critical"].includes(severity)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid severity level.",
      });
    }

    // Create bug report
    const bugReport = await BugReport.create({
      userId: req.user?.id || null, // Logged-in user ID if available
      email,
      title,
      description,
      stepsToReproduce: stepsToReproduce || "",
      expectedBehavior: expectedBehavior || "",
      actualBehavior: actualBehavior || "",
      severity: severity || "medium",
      category: category || "other",
      browserInfo: browserInfo || {},
      deviceInfo: deviceInfo || "desktop",
      url: url || "",
    });

    // Send notification to dev team
    await sendBugReportNotification(bugReport);

    // Log the bug report
    console.log(`Bug report submitted: ${bugReport.ticketNumber}`);

    res.status(201).json({
      status: "success",
      message:
        "Bug report submitted successfully. Thank you for helping us improve!",
      data: {
        bugReport: {
          ticketNumber: bugReport.ticketNumber,
          title: bugReport.title,
          status: bugReport.status,
          createdAt: bugReport.createdAt,
        },
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// GET /api/bugs/:ticketNumber - Get bug report details (public)
exports.getBugReport = async (req, res) => {
  try {
    const { ticketNumber } = req.params;

    const bugReport = await BugReport.findOne({ ticketNumber }).select(
      "ticketNumber title status severity createdAt resolvedAt email",
    );

    if (!bugReport) {
      return res.status(404).json({
        status: "fail",
        message: "Bug report not found.",
      });
    }

    res.status(200).json({
      status: "success",
      data: { bugReport },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// GET /api/bugs/user/my-reports - Get user's own bug reports (protected)
exports.getUserBugReports = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        status: "fail",
        message: "Please log in to view your bug reports.",
      });
    }

    const bugReports = await BugReport.find({ userId: req.user.id })
      .select("ticketNumber title status severity createdAt resolvedAt")
      .sort({ createdAt: -1 });

    res.status(200).json({
      status: "success",
      results: bugReports.length,
      data: { bugReports },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// GET /api/bugs - Get all bug reports (admin only)
exports.getAllBugReports = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Only admins can view all bug reports.",
      });
    }

    const { status, severity, category, search } = req.query;
    let filter = {};

    if (status) filter.status = status;
    if (severity) filter.severity = severity;
    if (category) filter.category = category;
    if (search) {
      filter.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
        { ticketNumber: { $regex: search, $options: "i" } },
      ];
    }

    const bugReports = await BugReport.find(filter)
      .populate("userId", "name email")
      .populate("assignedTo", "name email")
      .sort({ createdAt: -1, severity: -1 });

    res.status(200).json({
      status: "success",
      results: bugReports.length,
      data: { bugReports },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// PATCH /api/bugs/:ticketNumber - Update bug report (admin only)
exports.updateBugReport = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Only admins can update bug reports.",
      });
    }

    const { ticketNumber } = req.params;
    const { status, priority, assignedTo, notes, resolvedAt } = req.body;

    const bugReport = await BugReport.findOneAndUpdate(
      { ticketNumber },
      {
        status: status || undefined,
        priority: priority || undefined,
        assignedTo: assignedTo || undefined,
        notes: notes || undefined,
        resolvedAt: resolvedAt || undefined,
        updatedAt: new Date(),
      },
      { new: true, runValidators: true },
    );

    if (!bugReport) {
      return res.status(404).json({
        status: "fail",
        message: "Bug report not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Bug report updated successfully.",
      data: { bugReport },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// DELETE /api/bugs/:ticketNumber - Delete bug report (admin only)
exports.deleteBugReport = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Only admins can delete bug reports.",
      });
    }

    const { ticketNumber } = req.params;

    const bugReport = await BugReport.findOneAndDelete({ ticketNumber });

    if (!bugReport) {
      return res.status(404).json({
        status: "fail",
        message: "Bug report not found.",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Bug report deleted successfully.",
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

// GET /api/bugs/dashboard/stats - Dashboard statistics (admin only)
exports.getBugStats = async (req, res) => {
  try {
    if (req.user?.role !== "admin") {
      return res.status(403).json({
        status: "fail",
        message: "Only admins can view stats.",
      });
    }

    const total = await BugReport.countDocuments();
    const byStatus = await BugReport.aggregate([
      { $group: { _id: "$status", count: { $sum: 1 } } },
    ]);
    const bySeverity = await BugReport.aggregate([
      { $group: { _id: "$severity", count: { $sum: 1 } } },
    ]);
    const new_reports = await BugReport.countDocuments({ status: "new" });
    const critical = await BugReport.countDocuments({ severity: "critical" });

    res.status(200).json({
      status: "success",
      data: {
        total,
        new: new_reports,
        critical,
        byStatus: Object.fromEntries(byStatus.map((s) => [s._id, s.count])),
        bySeverity: Object.fromEntries(bySeverity.map((s) => [s._id, s.count])),
      },
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: err.message,
    });
  }
};

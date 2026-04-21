# Compliance Implementation Guide

**Quick Start for Fixing Legal & Compliance Issues**

---

## Phase 1: Critical Fixes (Days 1-3)

### Step 1: Create Legal Documents

**1a. Create Privacy Policy Template**

```markdown
# Privacy Policy

**Last Updated:** [Date]

## 1. Information We Collect

- Account information: name, email, phone, address
- Payment information: processed by Khalti (we don't store cards)
- Location data: city, timezone
- Usage data: bookings, interactions, ratings
- Device information: IP address, browser type

## 2. How We Use Your Data

- Service delivery and account management
- Payment processing
- Communications (email notifications)
- Service improvement and analytics
- Legal compliance

## 3. Data Retention

- Active account data: retained while account is active
- Deleted accounts: retained for 90 days
- Transaction records: retained for 7 years (tax compliance)
- Email logs: retained for 1 year

## 4. Your Rights

You have the right to:

- Access your data
- Request corrections
- Request deletion (except legally required records)
- Withdraw consent
- Data portability

## 5. Third Parties

We share data with:

- Khalti (payment processor)
- Email service provider (SendGrid)
- Google (OAuth authentication)

## 6. Contact

Privacy Questions: privacy@hometown-helper.com

## 7. Changes to This Policy

We may update this policy. Changes are effective when posted.
```

**1b. Create Terms of Service Template**

```markdown
# Terms of Service

## 1. User Responsibilities

- Provide accurate information
- Maintain account security
- Don't use service illegally
- Don't harass other users

## 2. Service Limitations

- "AS IS" without warranties
- We reserve the right to modify/discontinue
- Liability limited to amount paid

## 3. Payment Terms

- Payments processed through Khalti
- Refunds per Khalti policy + our policy
- Prices subject to change with notice

## 4. Dispute Resolution

- Contact us first
- Binding arbitration (specify jurisdiction)

## 5. Termination

- We can terminate for violations
- You can delete your account anytime

## 6. Governing Law

- [Nepal/Your jurisdiction]
```

---

### Step 2: Add User Consent Tracking to Database

**Update User Model** (`backend/models/User.js`):

```javascript
// Add this to userSchema:
consents: {
  termsOfService: {
    accepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: Date,
    version: {
      type: String,
      default: '1.0',
    },
  },
  privacyPolicy: {
    accepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: Date,
    version: {
      type: String,
      default: '1.0',
    },
  },
  marketingEmails: {
    accepted: {
      type: Boolean,
      default: false,
    },
    acceptedAt: Date,
  },
},

// Track when user last saw policies
lastPoliciesAcceptedVersion: {
  type: String,
  default: '1.0',
},
```

---

### Step 3: Remove Sensitive Log Files

```bash
# Delete plain text log files
rm -rf /backend/logs/

# Update .gitignore to prevent recreation
echo "/backend/logs/" >> .gitignore
```

**Replace with secure logging** in controllers:

```javascript
// Instead of: fs.appendFileSync(logFile, logText);
// Use:

const AuditLog = require("../models/AuditLog");

const logSecurely = async (action, details) => {
  try {
    // Hash sensitive IDs
    const hashedUserId = crypto
      .createHash("sha256")
      .update(details.userId?.toString() || "")
      .digest("hex");

    await AuditLog.create({
      userId: details.userId, // Store actual ID for admin queries
      action,
      targetType: "Payment",
      targetId: null, // Don't store sensitive IDs
      metadata: {
        // Only store non-sensitive data
        status: details.status,
        method: details.method,
        // ❌ Never store: amount, transaction IDs, customer info
      },
    });
  } catch (error) {
    console.error("Audit log error:", error.message);
  }
};
```

---

### Step 4: Add Security Headers

**Update `server.js`:**

```javascript
// Add after middleware setup
app.use((req, res, next) => {
  // Prevent clickjacking
  res.setHeader("X-Frame-Options", "DENY");

  // Prevent MIME type sniffing
  res.setHeader("X-Content-Type-Options", "nosniff");

  // Enable browser XSS protection
  res.setHeader("X-XSS-Protection", "1; mode=block");

  // Referrer policy
  res.setHeader("Referrer-Policy", "strict-origin-when-cross-origin");

  // Content Security Policy (adjust as needed)
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self';",
  );

  next();
});
```

---

### Step 5: Update Registration to Require Consent

**Update `authController.js` - register function:**

```javascript
exports.register = async (req, res) => {
  try {
    const {
      name,
      password,
      role,
      agreeToTerms, // Add these
      agreeToPrivacy, // Add these
    } = req.body;
    const email = normalizeEmail(req.body?.email);

    // ✅ Validate consent
    if (!agreeToTerms || !agreeToPrivacy) {
      return res.status(400).json({
        status: "fail",
        message: "You must agree to Terms of Service and Privacy Policy",
      });
    }

    if (!name || !email || !password || !role) {
      return res.status(400).json({
        status: "fail",
        message: "Please provide name, email, password, and role.",
      });
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already in use.",
      });
    }

    const newUser = await User.create({
      name,
      email,
      password,
      role,
      // ✅ Store consent records
      consents: {
        termsOfService: {
          accepted: true,
          acceptedAt: new Date(),
          version: "1.0",
        },
        privacyPolicy: {
          accepted: true,
          acceptedAt: new Date(),
          version: "1.0",
        },
      },
      lastPoliciesAcceptedVersion: "1.0",
    });

    // Log consent
    await AuditLog.create({
      userId: newUser._id,
      action: "user_consents_accepted",
      targetType: "User",
      targetId: newUser._id,
      metadata: {
        termsOfService: true,
        privacyPolicy: true,
      },
    });

    // Send verification email
    const emailResult = await sendVerificationEmailForUser(newUser);
    // ... rest of registration
  } catch (err) {
    res.status(400).json({ status: "fail", message: err.message });
  }
};
```

---

## Phase 2: Important Fixes (Days 4-7)

### Step 6: Implement User Data Export

**Add new controller** `backend/controllers/complianceController.js`:

```javascript
const User = require("../models/User");
const Booking = require("../models/Booking");
const Payment = require("../models/Payment");
const Review = require("../models/Review");

exports.exportUserData = async (req, res) => {
  try {
    const userId = req.user.id;

    // Gather all user data
    const user = await User.findById(userId).select("-password");
    const bookings = await Booking.find({
      $or: [{ seeker: userId }, { helper: userId }],
    });
    const payments = await Payment.find({ userId });
    const reviews = await Review.find({
      $or: [{ reviewer: userId }, { reviewee: userId }],
    });

    // Create export object
    const exportData = {
      exportDate: new Date().toISOString(),
      user,
      bookings,
      payments: payments.map((p) => ({
        ...p.toObject(),
        // Mask sensitive payment data
        "paymentGateway.khalti.mobileNumber": "***MASKED***",
      })),
      reviews,
    };

    // Send as file download
    res.setHeader("Content-Type", "application/json");
    res.setHeader(
      "Content-Disposition",
      `attachment; filename="user-data-${userId}-${Date.now()}.json"`,
    );
    res.send(JSON.stringify(exportData, null, 2));

    // Log the export
    await AuditLog.create({
      userId,
      action: "user_data_export_requested",
      targetType: "User",
      targetId: userId,
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};

exports.requestAccountDeletion = async (req, res) => {
  try {
    const userId = req.user.id;

    // Soft delete - mark for deletion
    const user = await User.findByIdAndUpdate(
      userId,
      {
        isDisabled: true,
        deletionRequestedAt: new Date(),
        // Delete after 30 days will be handled by cron job
      },
      { new: true },
    );

    // Send confirmation email
    // ... send email with 30-day notice ...

    // Log deletion request
    await AuditLog.create({
      userId,
      action: "account_deletion_requested",
      targetType: "User",
      targetId: userId,
    });

    res.status(200).json({
      status: "success",
      message: "Account deletion scheduled for 30 days from now",
    });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
};
```

**Add routes** `backend/routes/complianceRoutes.js`:

```javascript
const express = require("express");
const complianceController = require("../controllers/complianceController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Require authentication
router.use(authMiddleware.protect);

// Data export
router.get("/my-data", complianceController.exportUserData);

// Account deletion
router.post("/delete-account", complianceController.requestAccountDeletion);

module.exports = router;
```

**Add to `server.js`:**

```javascript
const complianceRoutes = require("./routes/complianceRoutes");
app.use("/api/compliance", complianceRoutes);
```

---

### Step 7: Secure Session Management

**Update `authController.js`:**

```javascript
const sendTokenSecure = (user, statusCode, res) => {
  const token = signToken(user._id, "15m"); // Short lived
  const refreshToken = signToken(user._id, "7d"); // Longer lived

  user.password = undefined;

  // Set access token as HttpOnly cookie
  res.cookie("accessToken", token, {
    httpOnly: true, // ✅ Can't be accessed by JavaScript
    secure: process.env.NODE_ENV === "production", // ✅ HTTPS only
    sameSite: "Strict", // ✅ CSRF protection
    maxAge: 15 * 60 * 1000, // 15 minutes
    path: "/",
  });

  // Set refresh token as HttpOnly cookie
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    path: "/api/auth/refresh",
  });

  // Response doesn't include tokens (they're in cookies)
  res.status(statusCode).json({
    status: "success",
    data: { user },
  });
};

// Replace existing sendToken calls with sendTokenSecure
```

---

### Step 8: Implement Data Retention Cleanup

**Create `backend/jobs/dataRetention.js`:**

```javascript
const cron = require("node-cron");
const User = require("../models/User");
const EmailLog = require("../models/EmailLog");
const AuditLog = require("../models/AuditLog");

const startDataRetentionJobs = () => {
  // Delete email logs older than 1 year (daily at 2 AM)
  cron.schedule("0 2 * * *", async () => {
    try {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 1);

      const result = await EmailLog.deleteMany({ createdAt: { $lt: cutoff } });
      console.log(
        `Deleted ${result.deletedCount} email logs older than 1 year`,
      );
    } catch (error) {
      console.error("Data retention job error:", error);
    }
  });

  // Delete accounts marked for deletion after 30 days
  cron.schedule("0 3 * * *", async () => {
    try {
      const cutoff = new Date();
      cutoff.setDate(cutoff.getDate() - 30);

      const result = await User.deleteMany({
        isDisabled: true,
        deletionRequestedAt: { $lt: cutoff },
      });

      console.log(`Permanently deleted ${result.deletedCount} accounts`);
    } catch (error) {
      console.error("Account deletion job error:", error);
    }
  });

  // Keep audit logs for 3 years, then delete
  cron.schedule("0 4 * * *", async () => {
    try {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - 3);

      const result = await AuditLog.deleteMany({ createdAt: { $lt: cutoff } });
      console.log(
        `Deleted ${result.deletedCount} audit logs older than 3 years`,
      );
    } catch (error) {
      console.error("Audit log deletion error:", error);
    }
  });
};

module.exports = { startDataRetentionJobs };
```

**Start jobs in `server.js`:**

```javascript
const { startDataRetentionJobs } = require("./jobs/dataRetention");

// After MongoDB connection
mongoose.connect(mongoURI).then(() => {
  console.log("MongoDB connected");
  if (process.env.NODE_ENV === "production") {
    startDataRetentionJobs(); // Only in production
  }
});
```

---

## Phase 3: Documentation & Review (Days 8-10)

### Step 9: Create Data Breach Response Plan

**Create `INCIDENT_RESPONSE.md`:**

```markdown
# Data Breach Incident Response Plan

## Immediate Actions (First Hour)

1. [ ] Confirm breach occurred
2. [ ] Disable affected accounts
3. [ ] Notify security team
4. [ ] Preserve evidence
5. [ ] Assess scope (how many users, what data)

## Communication (First 24 Hours)

1. [ ] Notify affected users
2. [ ] Notify relevant authorities
3. [ ] Notify payment processors
4. [ ] Prepare public statement

## User Notification Template:

Subject: Important Security Notice - [Date]

Dear [User Name],

We've identified that your [data type] may have been compromised on [date].

**What happened:** [Description]
**What data was affected:** [List data types]
**What we're doing:** [Actions taken]
**What you should do:** [Instructions]

**Free credit monitoring:** [If applicable]

Contact us: security@hometown-helper.com

## Documentation

1. [ ] Document timeline
2. [ ] Document root cause
3. [ ] Document remediation steps
4. [ ] Keep records for 5+ years
```

---

### Step 10: Add API Documentation

**Update/Create `API_COMPLIANCE_GUIDE.md`:**

```markdown
# API Data Handling Guide

## Authentication Endpoints

- **POST /api/auth/register**
  - Data collected: name, email, password, role, consents
  - Data stored: encrypted password, verified email
  - Data retention: while account active + 90 days
  - PII? Yes (email, name)

- **POST /api/auth/login**
  - Data collected: email, password
  - Data stored: access tokens (in cookies)
  - Data retention: token expiration (15 minutes)
  - PII? No (tokens are encoded)

## Payment Endpoints

- **POST /api/payments/initiate**
  - Data collected: email, phone, booking ID
  - Data stored: in Payment record (hashed)
  - Data retention: 7 years (PCI compliance)
  - PII? Yes (email, phone)
  - Third-party: Khalti (payment processor)

## Data Access Endpoints

- **GET /api/compliance/my-data**
  - Returns: All user data in JSON
  - Requires: Authentication
  - Purpose: GDPR right to access

- **POST /api/compliance/delete-account**
  - Action: Marks account for deletion
  - Timeline: 30-day soft delete
  - Purpose: GDPR right to be forgotten
```

---

## Testing Checklist

Before launching, test:

- [ ] User can register with consent checkboxes
- [ ] User cannot register without checking consent boxes
- [ ] Consent data is saved in User model
- [ ] User can download their data (JSON)
- [ ] User can request account deletion
- [ ] Deleted accounts are soft-deleted immediately
- [ ] Deleted accounts are permanently deleted after 30 days
- [ ] Security headers are present in all responses
- [ ] HttpOnly cookies are set on login
- [ ] Old email logs are deleted automatically
- [ ] No plain text passwords in logs
- [ ] No payment data in plain text files
- [ ] Error messages don't expose stack traces in production

---

## Environment Variables Needed

Add to `.env`:

```env
# Compliance
DATA_ENCRYPTION_KEY=<32-byte hex string - use crypto.randomBytes(32).toString('hex')>
JWT_SECRET=<use crypto.randomBytes(32).toString('hex')>
DATA_RETENTION_DAYS_EMAIL_LOGS=365
DATA_RETENTION_DAYS_PAYMENT_RECORDS=2555  # 7 years
DATA_RETENTION_YEARS_AUDIT_LOGS=3
ACCOUNT_DELETION_DELAY_DAYS=30

# For production only
NODE_ENV=production
HTTPS_ONLY=true
```

---

## Implementation Timeline

| Phase   | Duration  | Focus                                         |
| ------- | --------- | --------------------------------------------- |
| Phase 1 | Days 1-3  | Legal docs, consent tracking, remove bad logs |
| Phase 2 | Days 4-7  | Data export, deletion, retention cleanup      |
| Phase 3 | Days 8-10 | Documentation, testing, launch prep           |
| Phase 4 | Ongoing   | Monitoring, updates, user support             |

---

## Questions to Ask Legal Counsel

1. Do we need PII encryption under Nepal law?
2. What's the legal basis for processing payment data?
3. How long must we retain transaction records?
4. What procedures needed for GDPR (if EU users)?
5. Any industry-specific regulations we must follow?
6. Is 30-day account deletion sufficient or too long?
7. Do we need explicit consent for marketing emails?

---

**Remember:** This is a starting point. Consult with legal professionals for your specific jurisdiction before launch.

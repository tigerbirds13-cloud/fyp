# Legal & Compliance Audit Report

**Date:** April 20, 2026  
**Application:** HomeTown Helper (MERN Stack)  
**Status:** ⚠️ CRITICAL ISSUES IDENTIFIED

---

## Executive Summary

This audit identifies **10 critical and high-priority compliance gaps** that must be addressed before production deployment, especially given the application's handling of:

- Personal identifiable information (PII)
- Payment processing (Khalti integration)
- User authentication & Google OAuth
- Geographic location data (Nepal)

### Compliance Frameworks Applicable

- **GDPR** (if EU users exist or data is stored in EU)
- **Local Nepal Privacy Laws**
- **PCI-DSS** (for payment handling)
- **Payment Card Industry Standards**

---

## 🔴 CRITICAL ISSUES (Must Fix Before Launch)

### 1. **Missing Privacy Policy & Terms of Service**

**Severity:** 🔴 CRITICAL  
**Impact:** Legal liability, potential user data misuse claims

**Current State:**

- ❌ No Privacy Policy document
- ❌ No Terms of Service document
- ❌ No Cookie Policy
- ❌ Users are not presented with these during registration

**Required Actions:**

```
✅ Create Privacy Policy covering:
   - What data is collected (name, email, phone, location, address, payment info)
   - How data is used (account management, payments, communications)
   - Data retention periods
   - Third-party sharing (payment processors, analytics)
   - User rights (access, deletion, portability)
   - Data breach notification procedures
   - Age restrictions (if applicable)

✅ Create Terms of Service covering:
   - User responsibilities
   - Service limitations & disclaimers
   - Liability limitations
   - Payment terms & refund policy
   - Dispute resolution
   - Termination rights

✅ Create Cookie Policy covering:
   - Cookies used (auth tokens, session management)
   - Purpose of each cookie
   - Duration
   - User consent mechanism
```

**Recommendation:** Generate these documents now. Consider using:

- Iubenda (generates policies)
- TermsFeed (customizable templates)
- Legal counsel review

---

### 2. **No Data Subject Rights Implementation (GDPR Article 15-20)**

**Severity:** 🔴 CRITICAL  
**Impact:** Non-compliance with GDPR/data protection laws

**Current State:**

- ❌ No endpoint for users to access their personal data (Right to Access)
- ❌ No "Download My Data" feature
- ❌ No user data export functionality
- ❌ No automated data deletion mechanism (Right to be Forgotten)
- ❌ Only admin can delete users (not user-initiated)

**Implementation Required:**

```javascript
// Endpoint needed: GET /api/profile/data-export
exports.exportUserData = async (req, res) => {
  // Return all user data in portable format (JSON/CSV)
  // Include: profile, bookings, payments, reviews, documents
};

// Endpoint needed: POST /api/profile/request-deletion
exports.requestAccountDeletion = async (req, res) => {
  // Mark account for deletion (soft delete with 30-day delay)
  // Send confirmation email
  // Permanent deletion after 30 days
  // Log deletion request in AuditLog
};

// Endpoint needed: GET /api/profile/data-processing
exports.getDataProcessingInfo = async (req, res) => {
  // Return what data is being processed and why
  // Return purpose of processing
};
```

**Additional Requirements:**

- [ ] Data retention policy (define how long data is kept)
- [ ] Implement right to data portability
- [ ] Implement right to rectification (correct wrong data)
- [ ] Implement withdrawal of consent mechanism

---

### 3. **Inadequate User Consent & Explicit Opt-In Missing**

**Severity:** 🔴 CRITICAL  
**Impact:** GDPR violation, invalid data processing

**Current State:**

```javascript
// Current registration flow (authController.js)
const newUser = await User.create({ name, email, password, role });
// ❌ No consent checkbox presented
// ❌ No explicit acceptance of Privacy Policy
// ❌ No opt-in for email communications
// ❌ No opt-in for data processing
```

**Required Actions:**

**Frontend Changes Needed:**

```
1. Add checkboxes to registration form:
   ☐ I agree to the Terms of Service
   ☐ I consent to Privacy Policy
   ☐ I consent to receive promotional emails (optional)
   ☐ I acknowledge data processing practices

2. Make these MANDATORY before signup

3. Log each consent explicitly
```

**Backend Schema Updates:**

```javascript
// Add to User model:
const userSchema = new mongoose.Schema({
  // ... existing fields ...

  // Compliance tracking
  consents: {
    termsOfService: {
      accepted: Boolean,
      acceptedAt: Date,
      version: String,
    },
    privacyPolicy: {
      accepted: Boolean,
      acceptedAt: Date,
      version: String,
    },
    marketingEmails: {
      accepted: Boolean,
      acceptedAt: Date,
      optedOutAt: Date,
    },
    dataProcessing: {
      accepted: Boolean,
      acceptedAt: Date,
      version: String,
    },
  },

  // Audit trail
  consentLog: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "ConsentLog",
    },
  ],
});
```

---

### 4. **Sensitive Data Logging & Exposure**

**Severity:** 🔴 CRITICAL  
**Impact:** Data breach risk, privacy violation

**Current State (paymentLogger.js):**

```javascript
const logPayment = (paymentDetails) => {
  const logEntry = {
    timestamp,
    bookingId: paymentDetails.bookingId,
    userId: paymentDetails.userId,
    amount: paymentDetails.amount,
    method: paymentDetails.method,
    transactionId: paymentDetails.transactionId,
    // ❌ PROBLEM: Logs are written to plain text files in /logs
    // ❌ Stored unencrypted on disk
    // ❌ No access controls
    // ❌ Indefinite retention
  };
  fs.appendFileSync(logFile, logText);
};
```

**Vulnerabilities:**

- 🔴 Payment logs stored as plain text files
- 🔴 No encryption at rest
- 🔴 Logs directory is in backend folder (may be exposed)
- 🔴 No log rotation or automatic deletion
- 🔴 No access controls on log files

**Required Actions:**

```javascript
// ✅ SOLUTION: Use secure logging with encryption

// 1. Create AuditLog schema (already exists)
// 2. Remove sensitive data from logs

const logPayment = (paymentDetails) => {
  // ✅ DO NOT LOG: full payment methods, tokens, card numbers
  // ✅ DO LOG: anonymized amounts, hashed transaction IDs, timestamps

  const safeLogEntry = {
    timestamp,
    bookingId: paymentDetails.bookingId,
    userId: crypto
      .createHash("sha256")
      .update(paymentDetails.userId.toString())
      .digest("hex"), // Hash user ID
    amountRange: getMaskedAmount(paymentDetails.amount), // Hide exact amount
    method: paymentDetails.method,
    status: paymentDetails.status,
    transactionIdHash: crypto
      .createHash("sha256")
      .update(paymentDetails.transactionId)
      .digest("hex"), // Hash transaction ID
  };

  // Save to MongoDB with encryption, not plain text files
  AuditLog.create(safeLogEntry);
};

// ✅ Implementation:
// 1. Delete plain text log files from production
// 2. Use MongoDB AuditLog exclusively
// 3. Encrypt sensitive fields in database
// 4. Implement log retention policy (e.g., 7 years for payments)
// 5. Restrict AuditLog access to admin only
```

**Remove Files:**

```bash
# Delete these insecure plain text logs:
❌ /backend/logs/payments-*.log
❌ /backend/logs/emails-*.log
```

---

### 5. **No Data Breach Notification Procedure**

**Severity:** 🔴 CRITICAL  
**Impact:** Legal non-compliance, regulatory fines

**Current State:**

- ❌ No incident response plan
- ❌ No breach notification template
- ❌ No timeline for notifying affected users
- ❌ No documentation of breaches

**Required Actions:**

Create a Data Breach Notification SOP:

```markdown
# Data Breach Response Procedure

## Timeline:

1. Immediately upon discovery: Assess scope
2. Within 24 hours: Notify data protection officer
3. Within 48 hours: Notify affected users
4. Within 72 hours: Report to relevant authorities

## Required Elements:

- What data was compromised
- How many users affected
- What measures are being taken
- How users can protect themselves
- Contact information for support

## Templates Needed:

1. Internal breach notification email
2. User breach notification email
3. Regulatory authority notification (if required)
4. Public statement (if widespread)

## Storage:

- Document all breaches in AuditLog
- Retain documentation for 5+ years
- Encrypt breach records
```

---

### 6. **Inadequate Payment Data Protection (PCI-DSS)**

**Severity:** 🔴 CRITICAL  
**Impact:** PCI-DSS violation, payment processor sanctions

**Current State (paymentController.js):**

```javascript
const normalizePhone = (value) => String(value || "").replace(/[^0-9]/g, "");
const normalizeEmail = (value) =>
  String(value || "")
    .trim()
    .toLowerCase();

// Issues:
// ❌ Phone numbers stored in plain text
// ❌ No tokenization of payment data
// ❌ Khalti handles payment processing, but data flow needs review
// ❌ Payment records contain sensitive customer info unencrypted
```

**PCI-DSS Requirements:**

```javascript
// ✅ SOLUTION 1: Never store full payment card data
// Khalti should handle tokenization (need to verify)

// ✅ SOLUTION 2: Encrypt sensitive customer data at rest
const paymentSchema = new mongoose.Schema({
  customerInfo: {
    email: {
      type: String,
      // ✅ ADD: encryption for PII
    },
    mobile: {
      type: String,
      // ✅ ADD: encryption, or don't store
      // Recommendation: Store only masked number (last 4 digits)
    },
    name: String, // ✅ Can store, but consider encryption
  },
  // ...
});

// ✅ SOLUTION 3: Implement field-level encryption
const crypto = require("crypto");

const encryptPII = (text) => {
  const cipher = crypto.createCipheriv(
    "aes-256-gcm",
    Buffer.from(process.env.ENCRYPTION_KEY, "hex"),
    Buffer.from(process.env.ENCRYPTION_IV, "hex"),
  );
  return cipher.update(text, "utf8", "hex") + cipher.final("hex");
};

// ✅ SOLUTION 4: Minimal data retention
// Don't keep payment records longer than necessary
// Implement automatic deletion of old payment records
```

**Action Items:**

- [ ] Verify Khalti does NOT send card data to your backend
- [ ] Encrypt customerInfo fields (email, phone, name)
- [ ] Only store masked payment methods (last 4 digits)
- [ ] Delete old payment records (define retention period)
- [ ] Document PCI-DSS compliance procedures
- [ ] Consider PCI-DSS certification (if required by payment processor)

---

### 7. **Inadequate Session Management & Token Security**

**Severity:** 🟡 HIGH  
**Impact:** Unauthorized access, session hijacking

**Current State (authController.js):**

```javascript
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || "7d", // ⚠️ 7 days is long
  });
};

const sendToken = (user, statusCode, res) => {
  const token = signToken(user._id);
  user.password = undefined;

  res.status(statusCode).json({
    status: "success",
    token, // ❌ Token sent in JSON response body
    data: { user },
  });
};
```

**Issues:**

- 🟡 JWT token sent in response body (vulnerable to XSS)
- 🟡 7-day expiration is too long
- 🟡 No refresh token mechanism
- 🟡 No secure cookie usage

**Required Actions:**

```javascript
// ✅ SOLUTION 1: Use HttpOnly, Secure cookies
const sendTokenSecure = (user, statusCode, res) => {
  const token = signToken(user._id);
  const refreshToken = signToken(user._id, "30d"); // Longer expiry

  // Set access token as HttpOnly cookie (not in response body)
  res.cookie("accessToken", token, {
    httpOnly: true, // ✅ Prevent JavaScript access
    secure: process.env.NODE_ENV === "production", // ✅ HTTPS only in prod
    sameSite: "Strict", // ✅ Prevent CSRF attacks
    maxAge: 15 * 60 * 1000, // ✅ 15 minutes (shorter)
    path: "/",
  });

  // Set refresh token (also HttpOnly)
  res.cookie("refreshToken", refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "Strict",
    maxAge: 30 * 24 * 60 * 60 * 1000, // 30 days
    path: "/api/auth/refresh",
  });

  res.status(statusCode).json({
    status: "success",
    data: { user },
    // ❌ NO token in response body
  });
};

// ✅ SOLUTION 2: Implement token refresh endpoint
exports.refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.cookies;
    if (!refreshToken) {
      return res
        .status(401)
        .json({ status: "fail", message: "No refresh token" });
    }

    const decoded = jwt.verify(refreshToken, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    const newAccessToken = signToken(user._id);

    res.cookie("accessToken", newAccessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    res.status(200).json({ status: "success" });
  } catch (err) {
    res.status(401).json({ status: "fail", message: "Invalid refresh token" });
  }
};
```

---

### 8. **No User Data Retention Policy**

**Severity:** 🟡 HIGH  
**Impact:** Regulatory non-compliance, storage bloat

**Current State:**

- ❌ Users' data stored indefinitely
- ❌ Deleted users' data not purged from backups
- ❌ No archival strategy
- ❌ No automatic data deletion schedules

**Recommended Retention Policy:**

```markdown
# Data Retention Schedule

| Data Type                        | Retention Period        | Reason                 |
| -------------------------------- | ----------------------- | ---------------------- |
| Active User Accounts             | While active + 90 days  | User recovery window   |
| Account Metadata                 | 7 years                 | Legal/tax requirements |
| Transaction Records              | 7 years                 | Tax/audit compliance   |
| Payment Records                  | 7 years                 | PCI-DSS requirement    |
| Email Logs                       | 1 year                  | Compliance/debugging   |
| Audit Logs                       | 3 years                 | Legal defense          |
| Support Tickets                  | 2 years                 | Service history        |
| User Content (reviews, messages) | 2 years                 | Service history        |
| Marketing Data                   | 1 year or until opt-out | Legal basis            |
| IP Logs                          | 90 days                 | Security               |

# Implementation:

✅ Create retention policy document
✅ Implement MongoDB TTL indexes for auto-deletion
✅ Schedule monthly job to delete expired data
✅ Document in Privacy Policy
✅ Notify users before deletion
```

**Implementation:**

```javascript
// Add TTL index to User model for deleted accounts
userSchema.index(
  { deletedAt: 1 },
  {
    expireAfterSeconds: 7776000, // 90 days
    partialFilterExpression: { deletedAt: { $exists: true } },
  },
);

// Create scheduled deletion job
const scheduleDataCleanup = () => {
  // Run daily
  cron.schedule("0 2 * * *", async () => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - 365); // 1 year for email logs

    await EmailLog.deleteMany({ createdAt: { $lt: cutoffDate } });
    console.log("Data cleanup completed");
  });
};
```

---

### 9. **Google OAuth Compliance Issues**

**Severity:** 🟡 HIGH  
**Impact:** User privacy violation, TOS violation with Google

**Current State (utils/googleAuth.js):**

```javascript
const allowInsecureFallback =
  isDev && parseEnvFlag(process.env.GOOGLE_AUTH_ALLOW_INSECURE_FALLBACK);

if (googleClient && !token.endsWith(".dev")) {
  // ✅ Good: Production verification enabled
} else if (allowInsecureFallback) {
  // ⚠️ ISSUE: Dev tokens skipped in development
  // This is OK for dev, but watch in production
}
```

**Issues & Requirements:**

- ⚠️ Only collect needed Google data (email, name, picture)
- ⚠️ Must have Privacy Policy explaining Google data usage
- ⚠️ Users must consent to Google OAuth before use
- ⚠️ Google data shared with 3rd parties needs consent

**Implementation Checklist:**

```markdown
# Google OAuth Compliance

✅ On frontend, before showing Google button:

- Display privacy notice
- Explain what data will be shared
- Require explicit consent

✅ Store consent record in ConsentLog

✅ Only request required scopes:

- profile (NOT optional scopes)
- email (NOT optional scopes)
- Avoid requesting calendar, photos, etc.

✅ Privacy Policy must state:

- "We use Google OAuth to authenticate"
- "We collect: email, name, picture"
- "Google OAuth data is subject to Google Privacy Policy"
- Link to Google's privacy policy

✅ Implement scope limitation in frontend:
```

```javascript
// Current scope definition (verify it's minimal)
const scopes = ["profile", "email"]; // ✅ Good

// If requesting additional scopes, remove them:
// ❌ DON'T request: calendar, contacts, drive, youtube, etc.
```

---

### 10. **No Accessibility Compliance (WCAG 2.1)**

**Severity:** 🟡 HIGH  
**Impact:** Legal liability, user exclusion, potential ADA violations (if in USA)

**Current State:**

- ⚠️ No accessibility audit performed
- ⚠️ Unknown WCAG 2.1 Level A/AA compliance status
- ⚠️ No alt text for images
- ⚠️ No keyboard navigation testing
- ⚠️ No screen reader testing

**Required Actions:**

```markdown
# WCAG 2.1 Compliance Checklist (Level A minimum)

Frontend (React):

- [ ] All images have alt text
- [ ] Color is not sole means of conveying info
- [ ] Keyboard navigation fully functional
- [ ] Focus indicators visible
- [ ] Form inputs have associated labels
- [ ] Error messages associated with fields
- [ ] Page structure uses proper heading hierarchy (h1, h2, h3)
- [ ] Links have descriptive text (not "click here")
- [ ] Videos have captions
- [ ] Sufficient color contrast (4.5:1 for text)
- [ ] Text is resizable without loss of functionality

Backend:

- [ ] API errors include descriptive messages
- [ ] All endpoints documented for accessibility

Testing Required:

- [ ] Axe DevTools scan
- [ ] WAVE scan
- [ ] Manual keyboard testing
- [ ] Screen reader testing (NVDA, JAWS)
```

---

## 🟡 HIGH PRIORITY ISSUES

### 11. **Missing Content Security Policy (CSP)**

**Severity:** 🟡 HIGH  
**Impact:** XSS vulnerabilities, third-party code injection

**Fix:**

```javascript
// Add to server.js
app.use((req, res, next) => {
  res.setHeader(
    "Content-Security-Policy",
    "default-src 'self'; script-src 'self' 'unsafe-inline' https://apis.google.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:",
  );
  next();
});
```

---

### 12. **No X-Frame-Options Header (Clickjacking)**

**Severity:** 🟡 HIGH  
**Impact:** Clickjacking attacks

**Fix:**

```javascript
// Add to server.js
app.use((req, res, next) => {
  res.setHeader("X-Frame-Options", "DENY");
  res.setHeader("X-Content-Type-Options", "nosniff");
  res.setHeader("X-XSS-Protection", "1; mode=block");
  next();
});
```

---

### 13. **Inadequate Input Validation**

**Severity:** 🟡 HIGH  
**Impact:** Injection attacks, data corruption

**Review Required:**

- Validate email formats
- Validate phone numbers (Nepal +977 format)
- Validate URLs (website, LinkedIn, Twitter)
- Validate numeric ranges (ratings, prices)
- Sanitize text inputs

**Status:** ✅ Partially done (validation.js exists)

---

## 🟢 MEDIUM PRIORITY ISSUES

### 14. **No Rate Limiting on API Endpoints**

**Severity:** 🟢 MEDIUM  
**Impact:** DDoS vulnerability, brute force attacks

**Recommendation:**

```javascript
const rateLimit = require("express-rate-limit");

const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
});

// Apply to sensitive endpoints:
app.use("/api/auth/", limiter);
app.use("/api/payments/", limiter);
```

---

### 15. **Insufficient Error Handling**

**Severity:** 🟢 MEDIUM  
**Impact:** Information disclosure, debugging difficulty

**Issue:** Stack traces may be exposed in production

**Fix:**

```javascript
// Error handling middleware (add to server.js)
app.use((err, req, res, next) => {
  const isDev = process.env.NODE_ENV === "development";

  res.status(err.statusCode || 500).json({
    status: "error",
    message: isDev ? err.message : "Internal Server Error",
    // ❌ Never expose stack trace in production
    ...(isDev && { stack: err.stack }),
  });
});
```

---

### 16. **No API Documentation of Data Handling**

**Severity:** 🟢 MEDIUM  
**Impact:** User confusion, compliance issues

**Recommendation:**

- Update API_DOCUMENTATION.md to include:
  - What data each endpoint collects
  - How data is stored
  - Data retention for each endpoint
  - Who can access the data

---

## 📋 COMPLIANCE CHECKLIST - Production Readiness

### Before Launch:

- [ ] **Privacy Policy created & published**
- [ ] **Terms of Service created & published**
- [ ] **Cookie Policy created & published**
- [ ] **User consent mechanism implemented** (checkboxes on signup)
- [ ] **Data subject rights implemented** (export, delete)
- [ ] **Payment data encryption implemented**
- [ ] **Sensitive log data removed** (no plain text logs with PII)
- [ ] **Session tokens secured** (HttpOnly cookies)
- [ ] **Data breach notification procedure documented**
- [ ] **Data retention policy defined**
- [ ] **Security headers added** (CSP, X-Frame-Options, etc.)
- [ ] **Audit logging implemented** (non-sensitive)
- [ ] **Rate limiting added**
- [ ] **Input validation reviewed**
- [ ] **Error handling secured** (no stack traces in prod)
- [ ] **WCAG 2.1 Level A accessibility audit completed**

---

## 🔐 Recommended Security Additions

### 1. Environment Variable Security

```bash
# .env file (never commit!)
JWT_SECRET=<32+ character random string>
ENCRYPTION_KEY=<32-byte hex string>
ENCRYPTION_IV=<16-byte hex string>
ADMIN_EMAILS=admin@example.com
NODE_ENV=production
```

### 2. HTTPS Enforcement

```javascript
// Redirect HTTP to HTTPS in production
app.use((req, res, next) => {
  if (
    process.env.NODE_ENV === "production" &&
    req.header("x-forwarded-proto") !== "https"
  ) {
    res.redirect(`https://${req.header("host")}${req.url}`);
  }
  next();
});
```

### 3. Helmet.js for Security Headers

```javascript
const helmet = require("helmet");
app.use(helmet()); // Adds multiple security headers
```

---

## 📞 Next Steps

### Immediate (Week 1):

1. Create Privacy Policy, Terms of Service, Cookie Policy
2. Implement user consent checkboxes
3. Remove plain text log files
4. Add security headers (CSP, X-Frame-Options)
5. Document data breach procedures

### Short Term (Week 2-3):

1. Implement data subject rights endpoints
2. Encrypt sensitive customer payment data
3. Implement secure session management (HttpOnly cookies)
4. Add rate limiting
5. Create data retention policy

### Medium Term (Week 4+):

1. WCAG 2.1 accessibility audit
2. PCI-DSS compliance documentation
3. Implement automatic data deletion jobs
4. Security penetration testing
5. Legal review by local attorney

---

## 📚 Useful Resources

- **GDPR**: https://gdpr-info.eu/
- **Privacy Policy Generator**: https://www.termsfeed.com/
- **OWASP Top 10**: https://owasp.org/www-project-top-ten/
- **PCI-DSS**: https://www.pcisecuritystandards.org/
- **WCAG 2.1**: https://www.w3.org/WAI/WCAG21/quickref/

---

**Report Generated:** April 20, 2026  
**Application:** HomeTown Helper v1.0  
**Reviewer:** Compliance Audit System

⚠️ **This audit is not a substitute for professional legal review. Consult with a lawyer specializing in technology and data protection law before launching.**

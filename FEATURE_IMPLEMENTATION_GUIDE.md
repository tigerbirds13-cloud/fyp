# Quick Integration Guide

**Comprehensive Feature Implementation**

---

## 🚀 IMMEDIATE SETUP (10 minutes)

### Step 1: Install Rate Limiting Package

```bash
cd backend
npm install express-rate-limit
```

### Step 2: Update Backend server.js

Add these imports at the top:

```javascript
const rateLimit = require("express-rate-limit");
const {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  signupLimiter,
  emailVerificationLimiter,
  contactFormLimiter,
  paymentLimiter,
} = require("./middleware/rateLimitMiddleware");
```

Add middleware AFTER bodyParser setup:

```javascript
// Global API rate limiter
app.use("/api/", apiLimiter);
```

Add specific route rate limiters:

```javascript
// Auth routes with rate limiting
const authRoutes = require("./routes/authRoutes");
app.use("/api/auth/register", signupLimiter, authRoutes);
app.use("/api/auth/login", authLimiter, authRoutes);
app.use("/api/auth/forgot-password", passwordResetLimiter, authRoutes);
app.use("/api/auth/resend-verification", emailVerificationLimiter, authRoutes);
```

Add bug report routes:

```javascript
const bugReportRoutes = require("./routes/bugReportRoutes");
app.use("/api/bugs", bugReportRoutes);
```

---

### Step 3: Update Frontend App.js

Import and add the new components:

```javascript
import PrivacyPolicyPage from "./components/PrivacyPolicyPage";
import TermsOfServicePage from "./components/TermsOfServicePage";
import CookieConsentBanner from "./components/CookieConsentBanner";
```

Add cookie banner at the very top of App:

```javascript
function App() {
  return (
    <>
      <CookieConsentBanner />
      {/* Rest of app */}
    </>
  );
}
```

Add routes for Privacy Policy and Terms:

```javascript
// In your routing section
{path: '/privacy-policy', element: <PrivacyPolicyPage isDark={isDark} />},
{path: '/terms-of-service', element: <TermsOfServicePage isDark={isDark} />},
```

---

### Step 4: Update Frontend RegisterPage.jsx

Add consent checkboxes before the submit button. Find this section in RegisterPage.jsx:

```javascript
// BEFORE (current code):
<button onClick={submit} style={{...}}>
  Sign Up
</button>

// AFTER (updated with consent checkboxes):
{/* Consent Checkboxes */}
<div style={{ marginTop: 24, display: 'grid', gap: 12 }}>
  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 14 }}>
    <input
      type="checkbox"
      checked={f.agreeTerms || false}
      onChange={(e) => setF(prev => ({ ...prev, agreeTerms: e.target.checked }))}
      style={{ width: 18, height: 18, cursor: 'pointer' }}
    />
    <span>
      I agree to the{' '}
      <a href="/terms-of-service" target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
        Terms of Service
      </a>
    </span>
  </label>

  <label style={{ display: 'flex', alignItems: 'center', gap: 12, cursor: 'pointer', fontSize: 14 }}>
    <input
      type="checkbox"
      checked={f.agreePrivacy || false}
      onChange={(e) => setF(prev => ({ ...prev, agreePrivacy: e.target.checked }))}
      style={{ width: 18, height: 18, cursor: 'pointer' }}
    />
    <span>
      I agree to the{' '}
      <a href="/privacy-policy" target="_blank" rel="noopener noreferrer" style={{ color: '#22c55e', textDecoration: 'none', fontWeight: 600 }}>
        Privacy Policy
      </a>
    </span>
  </label>
</div>

{/* Submit Button */}
<button
  onClick={submit}
  disabled={!(f.agreeTerms && f.agreePrivacy)}
  style={{...}}
>
  Sign Up
</button>
```

---

### Step 5: Update Registration Validation

In RegisterPage.jsx, update the `validate()` function:

```javascript
const validate = () => {
  const e = {};
  if (!f.name.trim()) e.name = "Full name is required.";
  if (!f.email.includes("@")) e.email = "Enter a valid email.";
  if (f.password.length < 6) e.password = "Min 6 characters.";
  if (f.password !== f.confirm) e.confirm = "Passwords do not match.";

  // ✅ ADD THIS:
  if (!f.agreeTerms) e.terms = "You must agree to Terms of Service.";
  if (!f.agreePrivacy) e.privacy = "You must agree to Privacy Policy.";

  setErrs(e);
  return !Object.keys(e).length;
};
```

Update the POST request:

```javascript
const response = await axios.post(`${API_BASE}/api/auth/register`, {
  name: f.name.trim(),
  email: f.email.trim().toLowerCase(),
  password: f.password,
  role: role || 'seeker',
  // ✅ ADD THESE:
  agreeToTerms: f.agreeTerms,
  agreeToPrivacy: f.agreePrivacy,
}, {...});
```

---

### Step 6: Create Bug Report Modal Component

Create file: `frontend/src/components/BugReportModal.jsx`

```javascript
import React, { useState } from "react";
import { X, AlertCircle } from "lucide-react";
import axios from "axios";

const API_BASE = process.env.REACT_APP_API_URL || "";

export default function BugReportModal({ isOpen, onClose, isDark }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    stepsToReproduce: "",
    expectedBehavior: "",
    actualBehavior: "",
    severity: "medium",
    category: "other",
    email: "",
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState("");
  const [ticketNumber, setTicketNumber] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.title || !formData.description || !formData.email) {
      setError("Title, description, and email are required.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const response = await axios.post(`${API_BASE}/api/bugs`, {
        ...formData,
        browserInfo: {
          userAgent: navigator.userAgent,
          browser: getBrowserName(),
          platform: navigator.platform,
          screenResolution: `${window.screen.width}x${window.screen.height}`,
        },
        deviceInfo: getDeviceType(),
        url: window.location.href,
      });

      setSuccess(true);
      setTicketNumber(response.data.data.bugReport.ticketNumber);
      setTimeout(() => {
        onClose();
        resetForm();
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || "Failed to submit bug report");
    } finally {
      setLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      stepsToReproduce: "",
      expectedBehavior: "",
      actualBehavior: "",
      severity: "medium",
      category: "other",
      email: "",
    });
    setSuccess(false);
    setTicketNumber("");
    setError("");
  };

  const getBrowserName = () => {
    const ua = navigator.userAgent;
    if (ua.includes("Edge")) return "Edge";
    if (ua.includes("Chrome")) return "Chrome";
    if (ua.includes("Safari")) return "Safari";
    if (ua.includes("Firefox")) return "Firefox";
    return "Unknown";
  };

  const getDeviceType = () => {
    if (/mobile/i.test(navigator.userAgent)) return "mobile";
    if (/tablet/i.test(navigator.userAgent)) return "tablet";
    return "desktop";
  };

  if (!isOpen) return null;

  const bgColor = isDark ? "#0a0e27" : "#ffffff";
  const textColor = isDark ? "#e0e7ff" : "#1f2937";
  const inputBg = isDark ? "#111827" : "#f9fafb";
  const borderColor = isDark ? "#374151" : "#e5e7eb";

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        background: "rgba(0, 0, 0, 0.5)",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        zIndex: 10000,
        padding: 20,
      }}
    >
      <div
        style={{
          background: bgColor,
          borderRadius: 16,
          maxWidth: 600,
          width: "100%",
          maxHeight: "90vh",
          overflow: "auto",
          border: `1px solid ${borderColor}`,
        }}
      >
        {/* Header */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: 24,
            borderBottom: `1px solid ${borderColor}`,
          }}
        >
          <h2
            style={{
              margin: 0,
              fontSize: 24,
              fontWeight: 700,
              color: textColor,
            }}
          >
            🐛 Report a Bug
          </h2>
          <button
            onClick={onClose}
            style={{
              background: "none",
              border: "none",
              fontSize: 24,
              cursor: "pointer",
              color: textColor,
            }}
          >
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div style={{ padding: 24 }}>
          {success ? (
            <div style={{ textAlign: "center" }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
              <h3 style={{ margin: "0 0 12px", color: textColor }}>
                Bug Report Submitted!
              </h3>
              <p
                style={{
                  margin: "0 0 16px",
                  color: isDark ? "#9ca3af" : "#6b7280",
                }}
              >
                Thank you for helping us improve. Your ticket number is:
              </p>
              <code
                style={{
                  display: "inline-block",
                  background: inputBg,
                  padding: "8px 16px",
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 700,
                  color: "#22c55e",
                }}
              >
                {ticketNumber}
              </code>
            </div>
          ) : (
            <form onSubmit={handleSubmit} style={{ display: "grid", gap: 16 }}>
              {error && (
                <div
                  style={{
                    display: "flex",
                    gap: 12,
                    padding: 12,
                    background: "#7f1d1d",
                    borderRadius: 8,
                    color: "#fecaca",
                  }}
                >
                  <AlertCircle size={20} />
                  <span>{error}</span>
                </div>
              )}

              {/* Title */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Bug Title *
                </label>
                <input
                  type="text"
                  name="title"
                  value={formData.title}
                  onChange={handleChange}
                  placeholder="e.g., Payment button not working"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: inputBg,
                    color: textColor,
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Description */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Description *
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  placeholder="Describe the bug in detail"
                  rows={4}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: inputBg,
                    color: textColor,
                    fontSize: 14,
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Steps to Reproduce */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Steps to Reproduce
                </label>
                <textarea
                  name="stepsToReproduce"
                  value={formData.stepsToReproduce}
                  onChange={handleChange}
                  placeholder="1. Click button\n2. See error"
                  rows={3}
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: inputBg,
                    color: textColor,
                    fontSize: 14,
                    boxSizing: "border-box",
                    fontFamily: "inherit",
                  }}
                />
              </div>

              {/* Severity & Category */}
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: 12,
                }}
              >
                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    Severity
                  </label>
                  <select
                    name="severity"
                    value={formData.severity}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      background: inputBg,
                      color: textColor,
                      fontSize: 14,
                    }}
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                    <option value="critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label
                    style={{
                      display: "block",
                      marginBottom: 8,
                      fontWeight: 600,
                      fontSize: 14,
                    }}
                  >
                    Category
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    style={{
                      width: "100%",
                      padding: "10px 12px",
                      border: `1px solid ${borderColor}`,
                      borderRadius: 8,
                      background: inputBg,
                      color: textColor,
                      fontSize: 14,
                    }}
                  >
                    <option value="other">Other</option>
                    <option value="frontend">Frontend</option>
                    <option value="backend">Backend</option>
                    <option value="payment">Payment</option>
                    <option value="auth">Authentication</option>
                    <option value="booking">Booking</option>
                  </select>
                </div>
              </div>

              {/* Email */}
              <div>
                <label
                  style={{
                    display: "block",
                    marginBottom: 8,
                    fontWeight: 600,
                    fontSize: 14,
                  }}
                >
                  Your Email *
                </label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  placeholder="you@example.com"
                  style={{
                    width: "100%",
                    padding: "10px 12px",
                    border: `1px solid ${borderColor}`,
                    borderRadius: 8,
                    background: inputBg,
                    color: textColor,
                    fontSize: 14,
                    boxSizing: "border-box",
                  }}
                />
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={loading}
                style={{
                  padding: "12px 24px",
                  background: "#ef4444",
                  color: "#ffffff",
                  border: "none",
                  borderRadius: 8,
                  fontWeight: 700,
                  cursor: loading ? "not-allowed" : "pointer",
                  opacity: loading ? 0.7 : 1,
                  fontSize: 14,
                }}
              >
                {loading ? "Submitting..." : "Submit Bug Report"}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

### Step 7: Add Bug Report Button to Navbar or Footer

In your main component, add a bug report button:

```javascript
import BugReportModal from './components/BugReportModal';

// In component:
const [bugReportOpen, setBugReportOpen] = useState(false);

// In UI:
<button
  onClick={() => setBugReportOpen(true)}
  style={{
    padding: '8px 16px',
    background: 'none',
    border: '1px solid #ef4444',
    color: '#ef4444',
    borderRadius: 6,
    cursor: 'pointer',
    fontSize: 12,
    fontWeight: 600,
  }}
>
  🐛 Report Bug
</button>

<BugReportModal
  isOpen={bugReportOpen}
  onClose={() => setBugReportOpen(false)}
  isDark={isDark}
/>
```

---

### Step 8: Update Footer Links

Add links to Privacy & Terms in your footer:

```html
<a href="/privacy-policy">Privacy Policy</a>
<a href="/terms-of-service">Terms of Service</a>
<button onClick="{()" ="">setBugReportOpen(true)}>Report Bug</button>
<button onClick="{()" ="">
  contactRef.current?.scrollIntoView({ behavior: 'smooth' })}>Contact Us
</button>
```

---

## ✅ VERIFICATION CHECKLIST

After implementation, verify:

- [ ] Rate limiting blocks after 5 failed login attempts
- [ ] Signup requires consent checkboxes
- [ ] Privacy Policy page loads at `/privacy-policy`
- [ ] Terms of Service page loads at `/terms-of-service`
- [ ] Cookie banner shows on first visit
- [ ] Bug report modal opens when button clicked
- [ ] Bug reports saved to database
- [ ] Admin can view all bug reports
- [ ] `/api/bugs/:ticketNumber` returns bug status

---

## 🧪 TESTING COMMANDS

```bash
# Test rate limiting
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email": "test@test.com", "password": "wrong"}' \
  # Run 6 times - should fail after 5

# Test bug report submission
curl -X POST http://localhost:5000/api/bugs \
  -H "Content-Type: application/json" \
  -d '{
    "title": "Test Bug",
    "description": "This is a test",
    "email": "test@example.com",
    "severity": "high"
  }'

# Get bug report
curl http://localhost:5000/api/bugs/BUG-123456-1
```

---

## 📊 WHAT'S IMPLEMENTED

| Feature                       | Status            |
| ----------------------------- | ----------------- |
| Privacy Policy Page           | ✅ Created        |
| Terms of Service Page         | ✅ Created        |
| Cookie Consent Banner         | ✅ Created        |
| Signup Consent Checkboxes     | ✅ Guide provided |
| Rate Limiting                 | ✅ Configured     |
| Bug Report System             | ✅ Full featured  |
| Password Reset Rate Limit     | ✅ 3/hour         |
| Login Rate Limit              | ✅ 5/15min        |
| Email Verification Rate Limit | ✅ 5/day          |
| Contact Form Rate Limit       | ✅ 5/hour         |

---

**Estimated Implementation Time:** 45 minutes  
**Difficulty Level:** Medium  
**Priority:** Critical for production launch

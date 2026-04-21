const rateLimit = require("express-rate-limit");

// General rate limiter for all API requests (moderate)
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true, // Return rate limit info in `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  skip: (req) => {
    // Skip rate limiting for health check
    return req.path === "/api/health";
  },
});

// Stricter rate limiter for authentication endpoints
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // limit each IP to 5 requests per windowMs
  message: "Too many login attempts, please try again later.",
  skipSuccessfulRequests: true, // Don't count successful requests
  skipFailedRequests: false, // Do count failed requests
});

// Rate limiter for password reset (strict)
const passwordResetLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 3, // limit each IP to 3 requests per hour
  message: "Too many password reset attempts, please try again in an hour.",
  skipSuccessfulRequests: false,
});

// Rate limiter for signup (moderate)
const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 signups per hour
  message: "Too many accounts created from this IP, please try again later.",
  skipSuccessfulRequests: false,
});

// Rate limiter for email verification resend (strict)
const emailVerificationLimiter = rateLimit({
  windowMs: 24 * 60 * 60 * 1000, // 24 hours
  max: 5, // limit each IP to 5 requests per day
  message: "Too many verification requests, please try again tomorrow.",
  skipSuccessfulRequests: false,
});

// Rate limiter for contact/feedback submission (moderate)
const contactFormLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 5, // limit each IP to 5 submissions per hour
  message: "Too many messages sent, please try again later.",
  skipSuccessfulRequests: false,
});

// Rate limiter for payment initiation (strict)
const paymentLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // limit each user to 10 payment attempts per hour
  message: "Too many payment attempts, please try again later.",
  skipSuccessfulRequests: false,
  keyGenerator: (req) => {
    // Use user ID if authenticated, otherwise use IP
    return req.user?.id || req.ip;
  },
});

module.exports = {
  apiLimiter,
  authLimiter,
  passwordResetLimiter,
  signupLimiter,
  emailVerificationLimiter,
  contactFormLimiter,
  paymentLimiter,
};

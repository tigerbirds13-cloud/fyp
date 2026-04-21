const { OAuth2Client } = require("google-auth-library");
const User = require("../models/User");

const isDev = process.env.NODE_ENV !== "production";
const normalizeEnvValue = (value) => String(value || "").trim();
const parseEnvFlag = (value) =>
  ["1", "true", "yes", "on"].includes(normalizeEnvValue(value).toLowerCase());

const isValidGoogleClientId = (value) => {
  const trimmed = normalizeEnvValue(value);
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower.includes("your_") || lower.includes("placeholder")) return false;
  return trimmed.endsWith(".apps.googleusercontent.com") && trimmed.length > 30;
};

const getGoogleAuthConfig = () => {
  const clientId = normalizeEnvValue(process.env.GOOGLE_CLIENT_ID);
  const clientSecret = normalizeEnvValue(process.env.GOOGLE_CLIENT_SECRET);
  const redirectUri = normalizeEnvValue(process.env.GOOGLE_REDIRECT_URI);
  const configured = isValidGoogleClientId(clientId);
  const allowInsecureFallback =
    isDev && parseEnvFlag(process.env.GOOGLE_AUTH_ALLOW_INSECURE_FALLBACK);

  return {
    clientId,
    clientSecret,
    redirectUri,
    configured,
    allowInsecureFallback,
    mode: configured
      ? "verified"
      : allowInsecureFallback
        ? "fallback"
        : "disabled",
  };
};

const googleAuthConfig = getGoogleAuthConfig();

const googleClient = googleAuthConfig.configured
  ? new OAuth2Client(
      googleAuthConfig.clientId,
      googleAuthConfig.clientSecret,
      googleAuthConfig.redirectUri,
    )
  : null;

if (googleAuthConfig.mode === "verified") {
  console.log("[GoogleAuth] Google token verification is enabled.");
} else if (googleAuthConfig.mode === "fallback") {
  console.warn(
    "[GoogleAuth] GOOGLE_AUTH_ALLOW_INSECURE_FALLBACK is enabled in development. Tokens will be decoded without signature verification.",
  );
} else {
  console.warn(
    "[GoogleAuth] Google auth is disabled. Set a valid GOOGLE_CLIENT_ID to enable verified token checks on the backend.",
  );
}

/**
 * Safely decode a base64-encoded JWT segment (handles base64url padding).
 */
const safeBase64Decode = (str) => {
  // Pad base64url string to standard base64
  const padded = str.replace(/-/g, "+").replace(/_/g, "/");
  const pad = padded.length % 4;
  const full = pad ? padded + "=".repeat(4 - pad) : padded;
  return Buffer.from(full, "base64").toString("utf-8");
};

/**
 * Verify Google ID token and return structured user data.
 */
const verifyGoogleToken = async (token) => {
  try {
    if (!token || typeof token !== "string") {
      return { success: false, error: "No token provided." };
    }

    // ─── Production path: use Google SDK to verify signature ───────────────
    if (googleClient && !token.endsWith(".dev")) {
      try {
        const ticket = await googleClient.verifyIdToken({
          idToken: token,
          audience: googleAuthConfig.clientId,
        });
        const payload = ticket.getPayload();
        return {
          success: true,
          data: {
            googleId: payload.sub,
            email: payload.email,
            name: payload.name,
            picture: payload.picture,
            emailVerified: payload.email_verified,
          },
        };
      } catch (sdkError) {
        console.error(
          "[GoogleAuth] SDK token verification failed:",
          sdkError.message,
        );
        return {
          success: false,
          error: "Google token verification failed: " + sdkError.message,
        };
      }
    }

    if (!googleAuthConfig.allowInsecureFallback) {
      if (googleClient && token.endsWith(".dev")) {
        return {
          success: false,
          error: "Dev tokens are disabled. Set GOOGLE_AUTH_ALLOW_INSECURE_FALLBACK=true in backend/.env to allow them.",
          code: "DEV_TOKEN_NOT_ALLOWED",
          statusCode: 400,
        };
      }
      return {
        success: false,
        error:
          "Google auth is not configured on the backend. Set GOOGLE_CLIENT_ID in backend/.env.",
        code: "GOOGLE_AUTH_NOT_CONFIGURED",
        statusCode: 503,
      };
    }

    // ─── Dev/fallback path: decode JWT payload without verifying signature ──
    const parts = token.split(".");
    if (parts.length !== 3) {
      return {
        success: false,
        error: "Invalid token format (expected 3-part JWT).",
      };
    }

    let decoded;
    try {
      decoded = JSON.parse(safeBase64Decode(parts[1]));
    } catch (parseErr) {
      return {
        success: false,
        error: "Failed to decode token payload: " + parseErr.message,
      };
    }

    if (!decoded.email) {
      return {
        success: false,
        error: "Token payload is missing required email field.",
      };
    }

    if (isDev) {
      console.log("[GoogleAuth] Dev mode — verified token for:", decoded.email);
    }

    return {
      success: true,
      data: {
        googleId: decoded.sub || `dev-${Date.now()}`,
        email: decoded.email,
        name: decoded.name || decoded.email.split("@")[0],
        picture: decoded.picture || null,
        emailVerified: decoded.email_verified !== false,
      },
    };
  } catch (error) {
    console.error(
      "[GoogleAuth] Unexpected error in verifyGoogleToken:",
      error.message,
    );
    return { success: false, error: error.message };
  }
};

/**
 * Find an existing user by Google ID or email, or create a new one.
 */
const findOrCreateGoogleUser = async (googleData) => {
  try {
    // 1) Try to find by Google ID
    let user = await User.findOne({ googleId: googleData.googleId });

    if (user) {
      user.lastLogin = new Date();
      if (
        googleData.picture &&
        (!user.avatar || !user.avatar.startsWith("http"))
      ) {
        user.avatar = googleData.picture;
      }
      await user.save();
      return user;
    }

    // 2) Try to link to existing email account
    const existingByEmail = await User.findOne({
      email: googleData.email.toLowerCase(),
    });

    if (existingByEmail) {
      existingByEmail.googleId = googleData.googleId;
      if (
        googleData.picture &&
        (!existingByEmail.avatar || !existingByEmail.avatar.startsWith("http"))
      ) {
        existingByEmail.avatar = googleData.picture;
      }
      existingByEmail.isEmailVerified = true;
      existingByEmail.lastLogin = new Date();
      await existingByEmail.save();
      return existingByEmail;
    }

    // 3) Create a new user if one doesn't exist
    const newUser = await User.create({
      name: googleData.name,
      email: googleData.email.toLowerCase(),
      googleId: googleData.googleId,
      avatar: googleData.picture,
      isEmailVerified: true,
      role: googleData.role || "seeker",
      password: Math.random().toString(36).slice(-12), // Generate a random placeholder password
      lastLogin: new Date(),
    });

    return newUser;
  } catch (error) {
    console.error(
      "[GoogleAuth] Error in findOrCreateGoogleUser:",
      error.message,
    );
    throw error;
  }
};

module.exports = {
  verifyGoogleToken,
  findOrCreateGoogleUser,
  googleAuthConfig,
};

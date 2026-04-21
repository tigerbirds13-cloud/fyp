const nodemailer = require('nodemailer');

const getFrontendUrl = () => process.env.FRONTEND_URL || 'http://localhost:3000';
const normalizeEnvValue = (value) => String(value || '').trim();
const emailUser = normalizeEnvValue(process.env.EMAIL_USER);
const emailPassword = normalizeEnvValue(process.env.EMAIL_PASSWORD);

const hasConfiguredEmailCredentials = () => {
  if (!emailUser || !emailPassword) return false;

  const invalidFragments = ['your-email', 'your_app_password', 'your-app-password', 'placeholder'];
  const lowerUser = emailUser.toLowerCase();
  const lowerPassword = emailPassword.toLowerCase();

  return !invalidFragments.some((fragment) => lowerUser.includes(fragment) || lowerPassword.includes(fragment));
};

const transporter = hasConfiguredEmailCredentials()
  ? nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: emailUser,
        pass: emailPassword,
      }
    })
  : null;

const buildPreviewResult = (type, email, previewUrl, name) => {
  const tag = `[Email:${type}]`;
  console.log(`${tag} Delivery skipped because Gmail is not configured.`);
  console.log(`${tag} Recipient: ${email}`);
  if (name) {
    console.log(`${tag} Name: ${name}`);
  }
  console.log(`${tag} Preview URL: ${previewUrl}`);

  return {
    success: true,
    preview: true,
    message: 'Email delivery skipped; preview URL logged for local testing.',
    previewUrl,
  };
};

// Send email verification email
const sendEmailVerificationEmail = async (email, name, verificationUrl) => {
  if (!transporter) {
    return buildPreviewResult('verification', email, verificationUrl, name);
  }

  try {
    const mailOptions = {
      from: emailUser || 'noreply@hometown.com',
      to: email,
      subject: 'Verify your HomeTown Helper email',
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; background: #f5f5f5; padding: 36px 16px;">
          <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);">
            <div style="background: #050505; padding: 28px 32px; text-align: left;">
              <div style="display: inline-flex; align-items: center; gap: 12px;">
                <div style="width: 42px; height: 42px; border-radius: 14px; background: linear-gradient(135deg, #f97316, #fb923c); color: #111827; font-weight: 900; font-size: 22px; line-height: 42px; text-align: center;">J</div>
                <span style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">HomeTown Helper</span>
              </div>
            </div>
            <div style="padding: 36px 32px 28px;">
              <h1 style="margin: 0 0 16px; color: #0f172a; font-size: 34px; line-height: 1.1; letter-spacing: -0.03em;">Verify your email</h1>
              <p style="margin: 0 0 14px; color: #334155; line-height: 1.8; font-size: 16px;">
                Hi ${name || 'there'}, thanks for creating your HomeTown Helper account.
              </p>
              <p style="margin: 0 0 26px; color: #334155; line-height: 1.8; font-size: 16px;">
                Please confirm this email address before signing in. This verification link expires in 24 hours.
              </p>
              <div style="text-align: center; margin: 32px 0;">
                <a href="${verificationUrl}" style="background: #f97316; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block;">
                  Verify Email
                </a>
              </div>
              <p style="margin: 0 0 12px; color: #334155; line-height: 1.8; font-size: 15px;">
                or copy and paste this URL into your browser:
                <a href="${verificationUrl}" style="display: block; margin-top: 8px; color: #3b82f6; word-break: break-all; text-decoration: none;">${verificationUrl}</a>
              </p>
              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;">
              <p style="margin: 0; color: #475569; line-height: 1.8; font-size: 15px;">Thanks,</p>
              <p style="margin: 4px 0 0; color: #0f172a; font-weight: 700; font-size: 15px;">The HomeTown Helper Team</p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Verification email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send reset password email
const sendResetPasswordEmail = async (email, resetToken, resetUrl) => {
  if (!transporter) {
    return buildPreviewResult('reset', email, resetUrl);
  }

  try {
    const mailOptions = {
      from: emailUser || 'noreply@hometown.com',
      to: email,
      subject: 'Reset Your HomeTown Helper Password',
      html: `
        <div style="font-family: 'DM Sans', Arial, sans-serif; background: #f5f5f5; padding: 36px 16px;">
          <div style="max-width: 620px; margin: 0 auto; background: #ffffff; border: 1px solid #e5e7eb; border-radius: 16px; overflow: hidden; box-shadow: 0 14px 40px rgba(15, 23, 42, 0.08);">
            <div style="background: #050505; padding: 28px 32px; text-align: left;">
              <div style="display: inline-flex; align-items: center; gap: 12px;">
                <div style="width: 42px; height: 42px; border-radius: 14px; background: linear-gradient(135deg, #f97316, #fb923c); color: #111827; font-weight: 900; font-size: 22px; line-height: 42px; text-align: center;">J</div>
                <span style="color: #ffffff; font-size: 22px; font-weight: 800; letter-spacing: -0.02em;">HomeTown Helper</span>
              </div>
            </div>

            <div style="padding: 36px 32px 28px;">
              <h1 style="margin: 0 0 16px; color: #0f172a; font-size: 36px; line-height: 1.1; letter-spacing: -0.03em;">Reset Your HomeTown Helper Password</h1>
              <p style="margin: 0 0 14px; color: #334155; line-height: 1.8; font-size: 16px;">
                We heard that you lost your HomeTown Helper password. Sorry about that.
              </p>
              <p style="margin: 0 0 26px; color: #334155; line-height: 1.8; font-size: 16px;">
                But don’t worry. Use the button below to reset your password. This reset link expires in 10 minutes for security reasons.
              </p>

              <div style="text-align: center; margin: 32px 0;">
                <a href="${resetUrl}" style="background: #f97316; color: #ffffff; padding: 14px 28px; border-radius: 8px; text-decoration: none; font-weight: 700; display: inline-block;">
                  Reset Your Password
                </a>
              </div>

              <p style="margin: 0 0 12px; color: #334155; line-height: 1.8; font-size: 15px;">
                or copy and paste this URL into your browser:
                <a href="${resetUrl}" style="display: block; margin-top: 8px; color: #3b82f6; word-break: break-all; text-decoration: none;">${resetUrl}</a>
              </p>

              <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 28px 0;">

              <p style="margin: 0; color: #475569; line-height: 1.8; font-size: 15px;">Thanks,</p>
              <p style="margin: 4px 0 0; color: #0f172a; font-weight: 700; font-size: 15px;">The HomeTown Helper Team</p>
            </div>

            <div style="padding: 0 32px 28px;">
              <p style="margin: 0; color: #94a3b8; font-size: 12px; line-height: 1.8;">
                You’re receiving this email because you requested a password reset for your HomeTown Helper account. If this wasn’t you, you can safely ignore this message.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Reset email sent successfully' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send welcome email
const sendWelcomeEmail = async (email, name) => {
  if (!transporter) {
    return buildPreviewResult('welcome', email, getFrontendUrl(), name);
  }

  try {
    const mailOptions = {
      from: emailUser || 'noreply@hometown.com',
      to: email,
      subject: '👋 Welcome to HomeTown Helper!',
      html: `
        <div style="font-family: 'DM Sans', Arial; background: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e; margin: 0; font-size: 28px;">HomeTown Helper</h1>
            </div>

            <h2 style="color: #333;">Welcome, ${name}! 🎉</h2>
            <p style="color: #555; line-height: 1.6;">
              Thank you for joining HomeTown Helper! Your account has been successfully created.
            </p>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <p style="color: #166534; margin: 0; font-weight: 600;">✓ Account Activated</p>
              <p style="color: #166534; font-size: 14px; margin: 5px 0;">You can now login and start exploring!</p>
            </div>

            <p style="color: #555; line-height: 1.6;">
              Get started by:<br>
              • Browse local services<br>
              • Book appointments<br>
              • Connect with service providers
            </p>

            <div style="text-align: center; margin: 30px 0;">
              <a href="${getFrontendUrl()}" style="background: #22c55e; color: white; padding: 12px 30px; border-radius: 6px; text-decoration: none; font-weight: 600; display: inline-block;">
                Get Started
              </a>
            </div>

            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">

            <div style="text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2026 HomeTown Helper. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Welcome email sent' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

// Send booking confirmation email
const sendBookingConfirmationEmail = async (email, bookingDetails) => {
  if (!transporter) {
    return buildPreviewResult('booking', email, getFrontendUrl());
  }

  try {
    const mailOptions = {
      from: emailUser || 'noreply@hometown.com',
      to: email,
      subject: '✅ Booking Confirmed - HomeTown Helper',
      html: `
        <div style="font-family: 'DM Sans', Arial; background: #f9f9f9; padding: 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; padding: 30px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            <div style="text-align: center; margin-bottom: 30px;">
              <h1 style="color: #22c55e; margin: 0; font-size: 28px;">HomeTown Helper</h1>
            </div>

            <h2 style="color: #333;">Booking Confirmed! ✓</h2>

            <div style="background: #f0fdf4; border-left: 4px solid #22c55e; padding: 15px; margin: 20px 0; border-radius: 6px;">
              <p style="color: #166534; margin: 0; font-weight: 600;">Booking ID: ${bookingDetails.bookingId}</p>
            </div>

            <div style="background: #f9f9f9; padding: 15px; border-radius: 6px; margin: 20px 0;">
              <p style="margin: 10px 0; color: #333;"><strong>Service:</strong> ${bookingDetails.serviceName}</p>
              <p style="margin: 10px 0; color: #333;"><strong>Provider:</strong> ${bookingDetails.providerName}</p>
              <p style="margin: 10px 0; color: #333;"><strong>Date:</strong> ${bookingDetails.date}</p>
              <p style="margin: 10px 0; color: #333;"><strong>Amount:</strong> Rs. ${bookingDetails.amount}</p>
            </div>

            <p style="color: #555; line-height: 1.6;">
              Your booking has been confirmed. The service provider will contact you shortly with more details.
            </p>

            <hr style="border: none; border-top: 1px solid #e5e5e5; margin: 20px 0;">

            <div style="text-align: center;">
              <p style="color: #999; font-size: 12px; margin: 0;">
                © 2026 HomeTown Helper. All rights reserved.
              </p>
            </div>
          </div>
        </div>
      `
    };

    await transporter.sendMail(mailOptions);
    return { success: true, message: 'Confirmation email sent' };
  } catch (error) {
    console.error('Email sending error:', error);
    return { success: false, error: error.message };
  }
};

module.exports = {
  hasConfiguredEmailCredentials,
  sendEmailVerificationEmail,
  sendResetPasswordEmail,
  sendWelcomeEmail,
  sendBookingConfirmationEmail
};

import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, Mail, ShieldCheck } from 'lucide-react';

function ForgotPasswordPage({ onBack }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const submitEmail = async () => {
    const normalizedEmail = email.trim().toLowerCase();
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!normalizedEmail) return setError("Please enter your email address.");
    if (!emailPattern.test(normalizedEmail)) return setError("Enter a valid email address.");

    setLoading(true);
    setError('');

    try {
      await axios.post('/api/auth/forgot-password', { email: normalizedEmail });
      setSuccess(true);
      setEmail('');
      setTimeout(() => {
        onBack();
      }, 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send reset email. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(249,115,22,0.12), transparent 26%), #050505', color: '#f8fafc', fontFamily: "'DM Sans', 'Syne', sans-serif", padding: '32px 20px' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');
        .forgot-shell { max-width: 1100px; margin: 0 auto; min-height: calc(100vh - 64px); display: grid; grid-template-columns: minmax(320px, 0.95fr) minmax(360px, 0.9fr); gap: 28px; align-items: center; }
        .forgot-panel, .forgot-card { border-radius: 30px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10,10,10,0.96); box-shadow: 0 28px 80px rgba(0,0,0,0.34); }
        .forgot-panel { padding: 32px; display: grid; gap: 24px; }
        .forgot-card { padding: 34px; }
        .forgot-back, .forgot-cta, .forgot-link { transition: transform 0.2s ease, opacity 0.2s ease, background 0.2s ease; }
        .forgot-back { width: fit-content; border-radius: 999px; border: 1px solid rgba(255,255,255,0.1); background: rgba(255,255,255,0.04); color: #f8fafc; display: inline-flex; align-items: center; gap: 10px; padding: 10px 16px; cursor: pointer; }
        .forgot-brand { display: flex; align-items: center; gap: 12px; }
        .forgot-brand-mark { width: 44px; height: 44px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg, #f97316, #fb923c); color: #111827; font-weight: 900; }
        .forgot-brand strong { display: block; font-size: 34px; letter-spacing: -0.04em; }
        .forgot-brand span { color: #94a3b8; font-size: 13px; }
        .forgot-copy h1 { margin: 0; font-size: 44px; line-height: 1.02; letter-spacing: -0.06em; }
        .forgot-copy p { margin: 14px 0 0; max-width: 520px; color: #cbd5e1; line-height: 1.8; font-size: 16px; }
        .forgot-benefits { display: grid; gap: 14px; }
        .forgot-benefit { display: flex; gap: 12px; align-items: flex-start; padding: 16px 18px; border-radius: 18px; background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.07); }
        .forgot-benefit strong { display: block; margin-bottom: 4px; }
        .forgot-benefit span { color: #94a3b8; font-size: 13px; line-height: 1.6; }
        .forgot-eyebrow { color: #fdba74; text-transform: uppercase; letter-spacing: 0.18em; font-size: 12px; margin-bottom: 14px; }
        .forgot-card h2 { margin: 0; font-size: 30px; letter-spacing: -0.04em; }
        .forgot-card p { color: #94a3b8; line-height: 1.7; }
        .forgot-form { display: grid; gap: 18px; margin-top: 24px; }
        .forgot-field { display: grid; gap: 8px; }
        .forgot-field span { font-size: 13px; font-weight: 700; }
        .forgot-input { display: flex; align-items: center; gap: 12px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.09); background: #090909; padding: 14px 16px; }
        .forgot-input input { width: 100%; border: none; outline: none; background: transparent; color: #f8fafc; font: inherit; }
        .forgot-cta { border: none; border-radius: 14px; background: #f97316; color: #111827; font: inherit; font-weight: 800; padding: 14px 18px; cursor: pointer; }
        .forgot-cta:disabled { opacity: 0.55; cursor: not-allowed; }
        .forgot-alert { border-radius: 16px; padding: 14px 16px; font-size: 14px; line-height: 1.6; }
        .forgot-alert.error { background: rgba(239,68,68,0.14); border: 1px solid rgba(239,68,68,0.22); color: #fecaca; }
        .forgot-alert.success { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.18); color: #bbf7d0; }
        .forgot-link { margin-top: 16px; color: #cbd5e1; font-size: 14px; }
        .forgot-link button { background: transparent; border: none; color: #fdba74; cursor: pointer; font: inherit; font-weight: 700; padding: 0; }
        .forgot-success { display: grid; gap: 18px; justify-items: start; }
        .forgot-success-badge { width: 58px; height: 58px; border-radius: 18px; display: grid; place-items: center; background: rgba(34,197,94,0.14); color: #4ade80; }
        .forgot-back:hover, .forgot-cta:hover { transform: translateY(-1px); }
        @media (max-width: 960px) {
          .forgot-shell { grid-template-columns: 1fr; }
          .forgot-copy h1 { font-size: 36px; }
        }
      `}</style>

      <div className="forgot-shell">
        <section className="forgot-panel">
          <button onClick={onBack} className="forgot-back"><ArrowLeft size={18} /> Back To Login</button>

          <div className="forgot-brand">
            <div className="forgot-brand-mark">J</div>
            <div>
              <strong>HomeTown Helper</strong>
              <span>Password recovery workspace</span>
            </div>
          </div>

          <div className="forgot-copy">
            <div className="forgot-eyebrow">Secure access recovery</div>
            <h1>Reset your password without leaving the hiring flow behind.</h1>
            <p>Enter the email tied to your account and HomeTown Helper will send a time-limited reset link. The follow-up screen and email now match the dark UI shown in your mockups.</p>
          </div>

          <div className="forgot-benefits">
            <div className="forgot-benefit">
              <Mail size={18} color="#fdba74" />
              <div>
                <strong>Reset link by email</strong>
                <span>We send a direct password reset link that expires after 10 minutes.</span>
              </div>
            </div>
            <div className="forgot-benefit">
              <ShieldCheck size={18} color="#fdba74" />
              <div>
                <strong>Protected recovery</strong>
                <span>Your existing sign-in flow stays intact while recovery uses the backend token validation already in place.</span>
              </div>
            </div>
          </div>
        </section>

        <section className="forgot-card">
          <div className="forgot-eyebrow">Forgot password</div>
          <h2>Reset Your HomeTown Helper Password</h2>
          <p>Use the email address associated with your account. We’ll send the reset link immediately.</p>

          {error ? <div className="forgot-alert error">{error}</div> : null}
          {success ? <div className="forgot-alert success">Reset email sent. Check your inbox for the password reset link.</div> : null}

          {!success ? (
            <div className="forgot-form">
              <label className="forgot-field">
                <span>Email Address</span>
                <div className="forgot-input">
                  <Mail size={18} color="#94a3b8" />
                  <input
                    value={email}
                    onChange={(event) => {
                      setEmail(event.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        submitEmail();
                      }
                    }}
                    type="email"
                    autoComplete="email"
                    inputMode="email"
                    spellCheck={false}
                    placeholder="you@company.com"
                  />
                </div>
              </label>

              <button onClick={submitEmail} disabled={loading} className="forgot-cta">
                {loading ? 'Sending Reset Link...' : 'Send Reset Link'}
              </button>
            </div>
          ) : (
            <div className="forgot-success" style={{ marginTop: 28 }}>
              <div className="forgot-success-badge"><CheckCircle2 size={28} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: 20, marginBottom: 10 }}>Check your email</strong>
                <p style={{ margin: 0 }}>The reset link expires in 10 minutes. After that, you can request a new one from this page.</p>
              </div>
            </div>
          )}

          <div className="forgot-link">
            Remember your password? <button onClick={onBack}>Sign in</button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default ForgotPasswordPage;

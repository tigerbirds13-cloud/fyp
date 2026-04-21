import React, { useState } from 'react';
import axios from 'axios';
import { ArrowLeft, CheckCircle2, Eye, EyeOff, LockKeyhole } from 'lucide-react';

function ResetPasswordPage({ token, onBack }) {
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [showP, setShowP] = useState(false);
  const [showPC, setShowPC] = useState(false);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  const submitPassword = async () => {
    if (!token) return setError('Reset token is missing. Please request a new reset link.');
    if (!password || !passwordConfirm) return setError("Please fill in all fields.");
    if (password.length < 6) return setError("Password must be at least 6 characters.");
    if (password !== passwordConfirm) return setError("Passwords do not match.");

    setLoading(true);
    setError('');

    try {
      const response = await axios.post(`/api/auth/reset-password/${token}`, {
        password,
        passwordConfirm
      });

      setSuccess(true);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('userRole', response.data.data.user.role);
      localStorage.setItem('userName', response.data.data.user.name);

      setTimeout(() => {
        window.location.href = '/';
      }, 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to reset password. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ minHeight: '100vh', background: 'radial-gradient(circle at top, rgba(249,115,22,0.12), transparent 24%), #050505', color: '#f8fafc', fontFamily: "'DM Sans', 'Syne', sans-serif", padding: '32px 20px', display: 'grid', placeItems: 'center' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;700&family=Syne:wght@700;800&display=swap');
        .reset-shell { width: 100%; max-width: 460px; }
        .reset-brand { display: flex; align-items: center; gap: 12px; justify-content: center; margin-bottom: 24px; }
        .reset-brand-mark { width: 40px; height: 40px; border-radius: 14px; display: grid; place-items: center; background: linear-gradient(135deg, #f97316, #fb923c); color: #111827; font-weight: 900; }
        .reset-brand strong { font-size: 34px; letter-spacing: -0.04em; }
        .reset-card { border-radius: 28px; border: 1px solid rgba(255,255,255,0.08); background: rgba(10,10,10,0.96); box-shadow: 0 28px 80px rgba(0,0,0,0.34); padding: 34px; }
        .reset-back, .reset-submit, .reset-toggle { transition: transform 0.2s ease, opacity 0.2s ease; }
        .reset-back { margin: 0 auto 18px; display: inline-flex; align-items: center; gap: 10px; background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08); color: #f8fafc; padding: 10px 16px; border-radius: 999px; cursor: pointer; }
        .reset-card h1 { margin: 0 0 8px; font-size: 30px; letter-spacing: -0.04em; text-align: center; }
        .reset-subtitle { margin: 0 0 22px; color: #94a3b8; text-align: center; line-height: 1.7; }
        .reset-form { display: grid; gap: 16px; }
        .reset-field { display: grid; gap: 8px; }
        .reset-field span { font-size: 13px; font-weight: 700; }
        .reset-input { display: flex; align-items: center; gap: 12px; border-radius: 16px; border: 1px solid rgba(255,255,255,0.08); background: #090909; padding: 14px 16px; }
        .reset-input input { width: 100%; border: none; outline: none; background: transparent; color: #f8fafc; font: inherit; }
        .reset-toggle { border: none; background: transparent; color: #94a3b8; cursor: pointer; display: grid; place-items: center; }
        .reset-rules { display: grid; gap: 8px; color: #94a3b8; font-size: 13px; margin: 4px 0 6px; }
        .reset-rules strong { color: #e5e7eb; }
        .reset-submit { width: 100%; border: none; border-radius: 14px; padding: 14px 18px; background: #f97316; color: #111827; font: inherit; font-weight: 800; cursor: pointer; }
        .reset-submit:disabled { opacity: 0.45; cursor: not-allowed; }
        .reset-alert { border-radius: 16px; padding: 14px 16px; font-size: 14px; line-height: 1.6; margin-bottom: 18px; }
        .reset-alert.error { background: rgba(239,68,68,0.14); border: 1px solid rgba(239,68,68,0.22); color: #fecaca; }
        .reset-alert.success { background: rgba(34,197,94,0.12); border: 1px solid rgba(34,197,94,0.18); color: #bbf7d0; }
        .reset-success { display: grid; gap: 18px; justify-items: center; text-align: center; padding: 12px 0 6px; }
        .reset-success-badge { width: 62px; height: 62px; border-radius: 20px; display: grid; place-items: center; background: rgba(34,197,94,0.14); color: #4ade80; }
        .reset-footer { margin-top: 18px; text-align: center; color: #94a3b8; font-size: 13px; }
        .reset-back:hover, .reset-submit:hover, .reset-toggle:hover { transform: translateY(-1px); }
      `}</style>

      <div className="reset-shell">
        <button onClick={onBack} className="reset-back"><ArrowLeft size={18} /> Back To Login</button>

        <div className="reset-brand">
          <div className="reset-brand-mark">J</div>
          <strong>HomeTown Helper</strong>
        </div>

        <div className="reset-card">
          <h1>Reset Your Password</h1>
          <p className="reset-subtitle">Create a new password for your account. This screen now follows the dark reset form style from your reference.</p>

          {error ? <div className="reset-alert error">{error}</div> : null}
          {success ? <div className="reset-alert success">Password reset successful. Logging you in and redirecting now.</div> : null}

          {!success ? (
            <div className="reset-form">
              <label className="reset-field">
                <span>Password</span>
                <div className="reset-input">
                  <LockKeyhole size={18} color="#94a3b8" />
                  <input
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      if (error) setError('');
                    }}
                    type={showP ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Enter new password"
                  />
                  <button type="button" className="reset-toggle" onClick={() => setShowP((value) => !value)}>{showP ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </label>

              <label className="reset-field">
                <span>Confirm Password</span>
                <div className="reset-input">
                  <LockKeyhole size={18} color="#94a3b8" />
                  <input
                    value={passwordConfirm}
                    onChange={(event) => {
                      setPasswordConfirm(event.target.value);
                      if (error) setError('');
                    }}
                    onKeyDown={(event) => {
                      if (event.key === 'Enter') {
                        event.preventDefault();
                        submitPassword();
                      }
                    }}
                    type={showPC ? 'text' : 'password'}
                    autoComplete="new-password"
                    placeholder="Confirm password"
                  />
                  <button type="button" className="reset-toggle" onClick={() => setShowPC((value) => !value)}>{showPC ? <EyeOff size={18} /> : <Eye size={18} />}</button>
                </div>
              </label>

              <div className="reset-rules">
                <div><strong>Rule:</strong> Minimum 6 characters.</div>
                <div><strong>Rule:</strong> Password and confirm password must match.</div>
              </div>

              <button onClick={submitPassword} disabled={loading} className="reset-submit">
                {loading ? 'Resetting Password...' : 'Reset Password'}
              </button>
            </div>
          ) : (
            <div className="reset-success">
              <div className="reset-success-badge"><CheckCircle2 size={28} /></div>
              <div>
                <strong style={{ display: 'block', fontSize: 20, marginBottom: 10 }}>Password Updated</strong>
                <div style={{ color: '#94a3b8', lineHeight: 1.7 }}>Your account is being signed in and redirected to the homepage.</div>
              </div>
            </div>
          )}

          <div className="reset-footer">Need another reset link? Return to login and request a new password reset email.</div>
        </div>
      </div>
    </div>
  );
}

export default ResetPasswordPage;

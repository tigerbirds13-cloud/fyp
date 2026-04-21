import React, { useState, useEffect, useCallback } from 'react';
import { GFONT, SHARED_CSS, BACK_BTN, H2, SUBP, GREEN_BTN, ORANGE_LINK, OrbitIllustration, FormField, Alert, OrDivider } from './CommonUI';
import { GoogleLoginBtn } from './GoogleLoginBtn';
import { useAuth } from '../context/AuthContext';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

function LoginPage({
  isDark,
  initialRole = 'seeker',
  autoGoogle = false,
  onBack,
  onGoRegister,
  onLoginSuccess,
  onForgotPassword,
  notice = '',
  initialEmail = '',
}) {
  const [f, setF] = useState({ email: '', password: '' });
  const [showP, setShowP] = useState(false);
  const [err, setErr] = useState('');
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState('');
  const [resendPreviewUrl, setResendPreviewUrl] = useState('');
  const [selectedRole, setSelectedRole] = useState('seeker');
  const [pendingVerificationEmail, setPendingVerificationEmail] = useState('');
  const { login } = useAuth();

  useEffect(() => {
    setSelectedRole(initialRole || 'seeker');
  }, [initialRole]);

  useEffect(() => {
    if (initialEmail) {
      setF((current) => ({ ...current, email: initialEmail }));
      setPendingVerificationEmail(initialEmail);
    }
  }, [initialEmail]);

  const handleGoogleSuccess = useCallback((data) => {
    const user = data?.data?.user;
    if (!user) return;

    setOk(true);
    const handled = onLoginSuccess?.(user);
    if (!handled) {
      setTimeout(() => {
        onBack();
      }, 1500);
    }
  }, [onBack, onLoginSuccess]);

  const bgColor = isDark ? "#000" : "#fff";
  const contrastBg = isDark ? "#0f172a" : "#fde8d8";
  const titleColor = isDark ? "#fff" : "#0f172a";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  const resendVerification = async () => {
    const email = String(pendingVerificationEmail || f.email || '').trim().toLowerCase();
    if (!email) {
      setErr('Enter your email first so we can resend the verification link.');
      return;
    }

    setResendLoading(true);
    setResendMessage('');
    setResendPreviewUrl('');
    setErr('');

    try {
      const response = await axios.post(`${API_BASE}/api/auth/resend-verification`, { email });
      setResendMessage(response.data?.message || 'Verification email sent. Please check your inbox.');
      setResendPreviewUrl(response.data?.data?.verificationPreviewUrl || '');
      setPendingVerificationEmail(email);
    } catch (error) {
      setErr(error.response?.data?.message || 'Unable to resend verification email right now.');
    } finally {
      setResendLoading(false);
    }
  };

  const submit = async () => {
    if (!f.email || !f.password) return setErr("Please fill in all fields.");
    if (!f.email.includes("@")) return setErr("Enter a valid email address.");

    setLoading(true);
    setErr('');

    try {
      const response = await axios.post(`${API_BASE}/api/auth/login`, {
        email: String(f.email || '').trim().toLowerCase(),
        password: f.password,
      });

      const token = response.data.token;
      const user = response.data.data.user;

      // Use AuthContext to persist login
      login(user, token, user.role);
      
      setOk(true);
      const handled = onLoginSuccess?.(user);
      if (!handled) {
        setTimeout(() => {
          onBack();
        }, 1500);
      }
    } catch (error) {
      const responseCode = error.response?.data?.code;
      const responseEmail = error.response?.data?.data?.email;
      if (responseCode === 'EMAIL_NOT_VERIFIED') {
        setPendingVerificationEmail(responseEmail || String(f.email || '').trim().toLowerCase());
      }
      setErr(error.response?.data?.message || 'Unable to login right now. Please check server connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', minHeight: '100vh', transition: "background 0.3s" }}>
      <style>{GFONT}{SHARED_CSS}</style>

      {/* LEFT */}
      <div style={{ flex: 1, background: bgColor, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '48px 40px', position: 'relative', borderRight: isDark ? "1px solid #1f2937" : "none" }}>
        <button onClick={onBack} style={{ ...BACK_BTN, color: isDark ? "#fff" : "#111", borderColor: isDark ? "#333" : "#e5e7eb" }}>← Back</button>
        <OrbitIllustration icon="🔑" icons={["✉️", "🛡", "🏘"]} />
        <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#22c55e', textAlign: 'center', margin: '0 0 10px' }}>Welcome Back!</h3>
        <p style={{ fontFamily: 'DM Sans', fontSize: 13.5, color: textColor, textAlign: 'center', maxWidth: 280, lineHeight: 1.6, margin: 0 }}>Sign in to connect with your local helpers or manage your bookings.</p>
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, background: contrastBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px' }}>
        <div style={{ width: '100%', maxWidth: 460 }}>
          <h2 style={{ ...H2, color: titleColor }}>Sign In</h2>
          <p style={{ ...SUBP, color: textColor }}>Enter your credentials to continue</p>
          {notice && <Alert type="success">{notice}</Alert>}
          {err && <Alert type="error">{err}</Alert>}
          {resendMessage && <Alert type="success">{resendMessage}</Alert>}
          {resendPreviewUrl ? (
            <Alert type="success">
              Email preview mode is active. Verify here:{' '}
              <a href={resendPreviewUrl} style={{ color: 'inherit', fontWeight: 700 }}>
                Open verification link
              </a>
            </Alert>
          ) : null}
          {ok && <Alert type="success">✓ Signed in! Redirecting…</Alert>}
          <FormField isDark={isDark} label="Email" value={f.email} onChange={v => setF(x => ({ ...x, email: v }))} placeholder="Your Email Address" type="email" />
          <FormField isDark={isDark} label="Password" value={f.password} onChange={v => setF(x => ({ ...x, password: v }))} placeholder="Password" type={showP ? "text" : "password"} toggle={() => setShowP(s => !s)} show={showP} />
          {pendingVerificationEmail ? (
            <div style={{ margin: '-2px 0 18px', padding: '12px 14px', borderRadius: 10, background: isDark ? '#132033' : '#eff6ff', border: `1px solid ${isDark ? '#1d4ed8' : '#bfdbfe'}` }}>
              <p style={{ margin: '0 0 10px', fontFamily: 'DM Sans', fontSize: 13, lineHeight: 1.6, color: isDark ? '#dbeafe' : '#1e3a8a' }}>
                Need a fresh verification link for <strong>{pendingVerificationEmail}</strong>?
              </p>
              <button
                onClick={resendVerification}
                disabled={resendLoading}
                style={{
                  background: '#ea580c',
                  color: '#fff',
                  border: 'none',
                  borderRadius: 999,
                  padding: '10px 14px',
                  fontFamily: 'DM Sans',
                  fontWeight: 700,
                  fontSize: 13,
                  cursor: resendLoading ? 'not-allowed' : 'pointer',
                  opacity: resendLoading ? 0.65 : 1
                }}
              >
                {resendLoading ? 'Sending...' : 'Resend verification email'}
              </button>
            </div>
          ) : null}
          
          <div style={{ marginBottom: 20 }}>
            <label style={{ fontSize: 13, fontWeight: 600, color: titleColor, display: 'block', marginBottom: 12 }}>Sign in as</label>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
              {['seeker', 'helper', 'admin'].map((role) => (
                <button
                  key={role}
                  onClick={() => setSelectedRole(role)}
                  style={{
                    padding: '12px 16px',
                    borderRadius: 12,
                    border: selectedRole === role ? '2px solid #2f6bff' : '1px solid #cbd5e1',
                    background: selectedRole === role ? '#eff6ff' : (isDark ? '#1f2937' : '#fff'),
                    color: selectedRole === role ? '#2f6bff' : titleColor,
                    fontWeight: selectedRole === role ? 700 : 500,
                    cursor: 'pointer',
                    textTransform: 'capitalize',
                    fontSize: 14,
                    transition: 'all 0.2s'
                  }}
                >
                  {role === 'seeker' ? '🔍 Help Seeker' : role === 'helper' ? '🛠️ Local Helper' : '🛡️ Admin'}
                </button>
              ))}
            </div>
          </div>
          
          <div style={{ textAlign: 'right', marginBottom: 20 }}><span onClick={() => onForgotPassword?.()} style={{ ...ORANGE_LINK, cursor: 'pointer' }}>Forgot Password?</span></div>
          <button onClick={submit} disabled={loading} style={{ ...GREEN_BTN, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
          <OrDivider isDark={isDark} />
          <GoogleLoginBtn
            isDark={isDark}
            role={selectedRole}
            devEmail={f.email}
            autoLaunch={autoGoogle}
            onSuccess={handleGoogleSuccess}
            onError={(googleErr) => setErr(googleErr)}
            loading={googleLoading}
            setLoading={setGoogleLoading}
          />
          <p style={{ textAlign: 'center', fontFamily: 'DM Sans', fontSize: 13, color: textColor, marginTop: 18 }}>
            Don't have an account? <span onClick={() => onGoRegister("seeker")} style={ORANGE_LINK}>Register</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;

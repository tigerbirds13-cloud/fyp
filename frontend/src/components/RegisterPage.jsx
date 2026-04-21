import React, { useState } from 'react';
import { GFONT, SHARED_CSS, BACK_BTN, H2, SUBP, GREEN_BTN, ORANGE_LINK, OrbitIllustration, FormField, Alert, OrDivider } from './CommonUI';
import { GoogleLoginBtn } from './GoogleLoginBtn';
import axios from 'axios';

const API_BASE = process.env.REACT_APP_API_URL || '';

function RegisterPage({ isDark, role, onBack, onSwitch, onRegistered }) {
  const [f, setF] = useState({ name: '', email: '', password: '', confirm: '' });
  const [showP, setShowP] = useState(false);
  const [showC, setShowC] = useState(false);
  const [errs, setErrs] = useState({});
  const [ok, setOk] = useState(false);
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [err, setErr] = useState('');
  const [previewUrl, setPreviewUrl] = useState('');
  const isHelper = role === 'helper';

  const bgColor = isDark ? "#000" : "#fff";
  const contrastBg = isDark ? "#0f172a" : "#fde8d8";
  const titleColor = isDark ? "#fff" : "#0f172a";
  const textColor = isDark ? "#94a3b8" : "#64748b";

  const validate = () => {
    const e = {};
    if (!f.name.trim()) e.name = "Full name is required.";
    if (!f.email.includes("@")) e.email = "Enter a valid email.";
    if (f.password.length < 6) e.password = "Min 6 characters.";
    if (f.password !== f.confirm) e.confirm = "Passwords do not match.";
    setErrs(e); return !Object.keys(e).length;
  };

  const clr = (k) => setErrs(e => ({ ...e, [k]: "" }));

  const submit = async () => {
    if (!validate()) return;

    setLoading(true);
    setErr('');
    setPreviewUrl('');

    try {
      const response = await axios.post(`${API_BASE}/api/auth/register`, {
        name: f.name.trim(),
        email: f.email.trim().toLowerCase(),
        password: f.password,
        role: role || 'seeker'
      }, {
        timeout: 10000,
      });

      if (response.data.status === 'success') {
        setOk(true);
        setPreviewUrl(response.data?.data?.verificationPreviewUrl || '');
        setTimeout(() => {
          onRegistered?.(
            response.data?.data?.email || f.email.trim().toLowerCase(),
            response.data?.data?.verificationPreviewUrl || ''
          );
        }, 1500);
      }
    } catch (error) {
      if (!error.response) {
        setErr('Cannot reach server. Please start backend and try again.');
      } else {
        setErr(error.response?.data?.message || 'Registration failed. Please try again.');
      }
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
        <OrbitIllustration isDark={isDark} icon={isHelper ? "🛠" : "🙋"} icons={["✉️", "📍", "🔍"]} />
        <h3 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 20, color: '#22c55e', textAlign: 'center', margin: '0 0 10px' }}>{isHelper ? "Share Your Skills Locally" : "Find Trusted Help Nearby"}</h3>
        <p style={{ fontFamily: 'DM Sans', fontSize: 13.5, color: textColor, textAlign: 'center', maxWidth: 280, lineHeight: 1.6, margin: 0 }}>{isHelper ? "Offer your skills and earn from your community." : "Discover reliable helpers for everyday tasks."}</p>
      </div>

      {/* RIGHT */}
      <div style={{ flex: 1, background: contrastBg, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '48px 56px' }}>
        <div style={{ width: '100%', maxWidth: 480 }}>
          <h2 style={{ ...H2, color: titleColor }}>Get Started!</h2>
          <p style={{ ...SUBP, color: textColor }}>Please register your details to continue</p>
          {err && <Alert type="error">{err}</Alert>}
          {ok && <Alert type="success">Verification link sent. Check your email, then sign in.</Alert>}
          {previewUrl ? (
            <Alert type="success">
              Email preview mode is active. Verify here:{' '}
              <a href={previewUrl} style={{ color: 'inherit', fontWeight: 700 }}>
                Open verification link
              </a>
            </Alert>
          ) : null}
          <FormField isDark={isDark} label="Full Name" value={f.name} onChange={v => { setF(x => ({ ...x, name: v })); clr("name") }} placeholder="Your Full Name" error={errs.name} hint="This is your public display name." />
          <FormField isDark={isDark} label="Email" value={f.email} onChange={v => { setF(x => ({ ...x, email: v })); clr("email") }} placeholder="Your Email Address" type="email" error={errs.email} />
          <FormField isDark={isDark} label="Password" value={f.password} onChange={v => { setF(x => ({ ...x, password: v })); clr("password") }} placeholder="Password" type={showP ? "text" : "password"} toggle={() => setShowP(s => !s)} show={showP} error={errs.password} />
          <FormField isDark={isDark} label="Confirm Password" value={f.confirm} onChange={v => { setF(x => ({ ...x, confirm: v })); clr("confirm") }} placeholder="Confirm Password" type={showC ? "text" : "password"} toggle={() => setShowC(s => !s)} show={showC} error={errs.confirm} />
          <button onClick={submit} disabled={loading} style={{ ...GREEN_BTN, background: '#ea580c', marginBottom: 12, opacity: loading ? 0.6 : 1, cursor: loading ? 'not-allowed' : 'pointer' }}>{loading ? 'Creating Account...' : 'Create Account'}</button>
          <p style={{ textAlign: 'right', fontFamily: 'DM Sans', fontSize: 13, color: isDark ? "#e5e7eb" : '#374151', marginBottom: 18 }}>
            Switch To <span onClick={() => onSwitch(isHelper ? "seeker" : "helper")} style={ORANGE_LINK}>{isHelper ? "Register as Help Seeker" : "Register as Local Helper"}</span>
          </p>
          <OrDivider isDark={isDark} />
          <GoogleLoginBtn
            isDark={isDark}
            role={role || 'seeker'}
            devEmail={f.email}
            devName={f.name}
            onSuccess={() => {
              setOk(true);
              setTimeout(() => {
                onBack();
              }, 1200);
            }}
            onError={(googleErr) => setErr(googleErr)}
            loading={googleLoading}
            setLoading={setGoogleLoading}
          />
          <p style={{ textAlign: 'center', fontFamily: 'DM Sans', fontSize: 13, color: textColor, marginTop: 18 }}>
            Already have an account? <span onClick={onBack} style={ORANGE_LINK}>Sign In</span>
          </p>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;

import React from 'react';

const isValidGoogleClientId = (value) => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower.includes('your_') || lower.includes('placeholder')) return false;
  return /^\d{8,}-[a-z0-9-]{20,}\.apps\.googleusercontent\.com$/i.test(trimmed);
};

export const GFONT = `@import url('https://fonts.googleapis.com/css2?family=Syne:wght@700;800&family=DM+Sans:wght@400;500;600&display=swap');`;

export const SHARED_CSS = `
  @keyframes orbit{from{transform:rotate(0deg) translateX(125px) rotate(0deg)}to{transform:rotate(360deg) translateX(125px) rotate(-360deg)}}
  @keyframes orbit2{from{transform:rotate(120deg) translateX(105px) rotate(-120deg)}to{transform:rotate(480deg) translateX(105px) rotate(-480deg)}}
  @keyframes orbit3{from{transform:rotate(240deg) translateX(140px) rotate(-240deg)}to{transform:rotate(600deg) translateX(140px) rotate(-600deg)}}
  .o1{animation:orbit 7s linear infinite}.o2{animation:orbit2 9s linear infinite}.o3{animation:orbit3 11s linear infinite}
`;

export const BACK_BTN = { position: 'absolute', top: 24, left: 24, background: 'transparent', border: '1.5px solid #e5e7eb', borderRadius: 999, padding: '8px 16px', fontFamily: 'DM Sans', fontWeight: 600, fontSize: 13, color: '#374151', cursor: 'pointer', transition: 'all 0.2s' };
export const H2 = { fontFamily: 'Syne', fontWeight: 800, fontSize: 27, color: '#111', margin: '0 0 6px' };
export const SUBP = { fontFamily: 'DM Sans', fontSize: 14, color: '#6b7280', margin: '0 0 26px' };
export const GREEN_BTN = { width: '100%', background: '#22c55e', color: '#fff', border: 'none', borderRadius: 10, padding: '13px 0', fontFamily: 'Syne', fontWeight: 700, fontSize: 15, cursor: 'pointer', marginBottom: 14 };
export const ORANGE_LINK = { color: '#ea580c', fontWeight: 600, cursor: 'pointer' };

export function OrbitIllustration({ icon, icons, isDark }) {
  return (
    <div style={{ position: 'relative', width: 280, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 28 }}>
      <div style={{ width: 240, height: 240, borderRadius: '50%', border: `1.5px solid ${isDark ? "#1f2937" : "#e2e8f0"}`, position: 'absolute' }} />
      <div style={{ width: 160, height: 160, borderRadius: '50%', border: `1.5px solid ${isDark ? "#1f2937" : "#e2e8f0"}`, position: 'absolute' }} />
      <div style={{ width: 64, height: 64, borderRadius: '50%', background: isDark ? "#14532d" : "#f0fdf4", display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, zIndex: 2 }}>{icon}</div>
      {icons.map((ic, i) => (
        <div key={i} className={['o1', 'o2', 'o3'][i]} style={{ position: 'absolute', top: '50%', left: '50%', marginTop: -20, marginLeft: -20 }}>
          <div style={{ width: 40, height: 40, borderRadius: '50%', background: i === 2 ? (isDark ? "#22c55e" : "#dcfce7") : "#22c55e", display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 17 }}>{ic}</div>
        </div>
      ))}
    </div>
  );
}

export function FormField({ isDark, label, value, onChange, placeholder, type = 'text', toggle, show, error, hint }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: 'block', fontFamily: 'Syne', fontWeight: 700, fontSize: 13.5, color: isDark ? "#e5e7eb" : '#1a1a1a', marginBottom: 6 }}>{label}</label>
      <div style={{ position: 'relative' }}>
        <input type={type} placeholder={placeholder} value={value} onChange={e => onChange(e.target.value)}
          style={{ width: '100%', boxSizing: 'border-box', padding: '12px 42px 12px 14px', border: `1.5px solid ${error ? '#f87171' : (isDark ? '#334155' : '#e5e7eb')}`, borderRadius: 10, fontFamily: 'DM Sans', fontSize: 14, color: isDark ? '#fff' : '#111', background: isDark ? '#1e293b' : '#fff', outline: 'none', transition: 'all 0.2s' }} />
        {toggle && <span onClick={toggle} style={{ position: 'absolute', right: 13, top: '50%', transform: 'translateY(-50%)', cursor: 'pointer', fontSize: 15, color: isDark ? '#94a3b8' : '#9ca3af' }}>{show ? '🙈' : '👁'}</span>}
      </div>
      {error && <p style={{ color: '#ef4444', fontFamily: 'DM Sans', fontSize: 12, margin: '4px 0 0' }}>{error}</p>}
      {hint && !error && <p style={{ color: isDark ? '#64748b' : '#9ca3af', fontFamily: 'DM Sans', fontSize: 12, margin: '4px 0 0' }}>{hint}</p>}
    </div>
  );
}

export function Alert({ type, children }) {
  const bg = type === 'error' ? '#fee2e2' : '#dcfce7';
  const cl = type === 'error' ? '#b91c1c' : '#15803d';
  return <div style={{ background: bg, color: cl, fontFamily: 'DM Sans', fontSize: 13, padding: '10px 14px', borderRadius: 8, marginBottom: 16 }}>{children}</div>;
}

export function OrDivider({ isDark }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
      <div style={{ flex: 1, height: 1, background: isDark ? '#334155' : '#d1d5db' }} /><span style={{ fontFamily: 'DM Sans', fontSize: 13, color: isDark ? '#64748b' : '#9ca3af' }}>or</span><div style={{ flex: 1, height: 1, background: isDark ? '#334155' : '#d1d5db' }} />
    </div>
  );
}

export function GoogleBtn({ isDark, onSuccess, onError, loading }) {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';
  const hasValidClientId = isValidGoogleClientId(clientId);

  return (
    <>
      {hasValidClientId && (
        <div id="g_id_onload" data-client_id={clientId} data-callback="handleGoogleResponse" style={{ display: 'none' }}></div>
      )}
      <button
        style={{
          width: '100%',
          background: isDark ? '#1e293b' : '#f9fafb',
          color: isDark ? '#f9fafb' : '#111',
          border: `1.5px solid ${isDark ? "#334155" : "#e5e5e5"}`,
          borderRadius: 10,
          padding: '12px 0',
          fontFamily: 'DM Sans',
          fontWeight: 600,
          fontSize: 14,
          cursor: loading ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
          transition: 'all 0.2s',
          opacity: loading ? 0.6 : 1
        }}
        disabled={loading}
      >
        <svg width="17" height="17" viewBox="0 0 24 24">
          <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
          <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
          <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
          <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
        </svg>
        {loading ? 'Signing in...' : 'Sign in with Google'}
      </button>
    </>
  );
}

import React, { useState, useEffect, useCallback, useRef } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

const API_BASE = process.env.REACT_APP_API_URL || '';

/**
 * Check if a Google Client ID looks real (production) vs placeholder/missing.
 * We intentionally allow placeholder IDs to pass so the button is always rendered;
 * the real validation happens at SDK initialization time.
 */
const isRealGoogleClientId = (value) => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower.includes('your_') || lower.includes('placeholder')) return false;
  // Full real client ID must have a long numeric prefix
  return /^\d{8,}-[a-z0-9-]{20,}\.apps\.googleusercontent\.com$/i.test(trimmed);
};

const isValidEmail = (v) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || '').trim());

const base64UrlEncode = (str) =>
  btoa(str).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

/** Builds a dev-mode JWT (no signature verification on backend in dev). */
const createDevGoogleToken = ({ email, name }) => {
  const now = Math.floor(Date.now() / 1000);
  const normalizedEmail = String(email || '').trim().toLowerCase();
  const finalEmail = isValidEmail(normalizedEmail) ? normalizedEmail : 'dev.user@gmail.com';
  const finalName = String(name || '').trim() || finalEmail.split('@')[0];

  const header = { alg: 'none', typ: 'JWT' };
  const payload = {
    iss: 'https://accounts.google.com',
    aud: 'dev-local-client',
    sub: `dev-${Date.now()}`,
    email: finalEmail,
    email_verified: true,
    name: finalName,
    picture: null,
    iat: now,
    exp: now + 3600,
  };

  return `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(JSON.stringify(payload))}.dev`;
};

/** Google logo SVG */
const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true">
    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z" />
    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
  </svg>
);

/**
 * GoogleLoginBtn — renders a "Continue with Google" button.
 *
 * In production (real GOOGLE_CLIENT_ID): uses Google Identity Services SDK.
 * In development (placeholder client ID): uses a dev-mode JWT fallback.
 */
export function GoogleLoginBtn({
  isDark,
  role = 'seeker',
  autoLaunch = false,
  onSuccess,
  onError,
  loading,
  setLoading,
  devEmail = '',
  devName = '',
}) {
  const [sdkReady, setSdkReady] = useState(false);
  const [sdkInitialized, setSdkInitialized] = useState(false);
  const [resolvedClientId, setResolvedClientId] = useState('');
  const [isDevMode, setIsDevMode] = useState(false);
  const [autoTriggered, setAutoTriggered] = useState(false);
  const googleBtnRef = useRef(null);
  const { login } = useAuth();

  /** Send token to backend and log user in. */
  const authenticateWithBackend = useCallback(
    async (tokenValue) => {
      setLoading?.(true);
      try {
        const res = await axios.post(`${API_BASE}/api/auth/google`, {
          token: tokenValue,
          role,
        });

        if (res.data.status === 'success') {
          const userData = res.data.data.user;
          login(userData, res.data.token, userData.role);
          onSuccess?.(res.data);
        } else {
          throw new Error(res.data.message || 'Google login failed');
        }
      } catch (err) {
        const msg = err.response?.data?.message || err.message || 'Google login failed';
        console.error('[GoogleLoginBtn] Auth error:', msg);
        onError?.(msg);
      } finally {
        setLoading?.(false);
      }
    },
    [login, onSuccess, onError, role, setLoading]
  );

  /** Callback invoked by Google SDK after user selects their account. */
  const handleGoogleSDKResponse = useCallback(
    async (response) => {
      await authenticateWithBackend(response.credential);
    },
    [authenticateWithBackend]
  );

  /** Used in dev mode or when SDK is unavailable. */
  const handleDevFallback = useCallback(async () => {
    const devToken = createDevGoogleToken({ email: devEmail, name: devName });
    await authenticateWithBackend(devToken);
  }, [authenticateWithBackend, devEmail, devName]);

  /** Resolve the Google Client ID (env first, then backend config endpoint). */
  const resolveClientId = useCallback(async () => {
    const envId = (process.env.REACT_APP_GOOGLE_CLIENT_ID || '').trim();
    if (isRealGoogleClientId(envId)) return envId;

    try {
      const res = await axios.get(`${API_BASE}/api/auth/google-config`);
      const backendId = (res.data?.data?.clientId || '').trim();
      if (isRealGoogleClientId(backendId)) return backendId;
    } catch (e) {
      console.warn('[GoogleLoginBtn] Could not fetch google-config from backend:', e?.message);
    }

    return '';
  }, []);

  /** Initialize the Google Identity Services SDK. */
  const initGoogleSDK = useCallback(
    async (clientId) => {
      if (!window.google?.accounts?.id) return;
      try {
        window.google.accounts.id.initialize({
          client_id: clientId,
          callback: handleGoogleSDKResponse,
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        // Render the built-in button inside our container
        if (googleBtnRef.current) {
          googleBtnRef.current.innerHTML = '';
          window.google.accounts.id.renderButton(googleBtnRef.current, {
            theme: isDark ? 'filled_black' : 'outline',
            size: 'large',
            text: 'continue_with',
            locale: 'en',
            width: googleBtnRef.current.offsetWidth || 380,
          });
        }

        setSdkInitialized(true);
      } catch (err) {
        console.error('[GoogleLoginBtn] SDK init failed:', err.message);
      }
    },
    [handleGoogleSDKResponse, isDark]
  );

  /** Load the Google GSI script and initialize on load. */
  useEffect(() => {
    let cleanup;

    const setup = async () => {
      const clientId = await resolveClientId();
      setResolvedClientId(clientId);

      if (!clientId) {
        // No real client ID — use dev mode
        setIsDevMode(true);
        setSdkReady(true);
        return;
      }

      if (window.google?.accounts?.id) {
        setSdkReady(true);
        await initGoogleSDK(clientId);
        return;
      }

      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = async () => {
        setSdkReady(true);
        await initGoogleSDK(clientId);
      };
      script.onerror = () => {
        console.warn('[GoogleLoginBtn] Failed to load Google SDK — switching to dev fallback.');
        setIsDevMode(true);
        setSdkReady(true);
      };
      document.body.appendChild(script);
      cleanup = () => document.body.contains(script) && document.body.removeChild(script);
    };

    setup();
    return () => cleanup?.();
  }, [initGoogleSDK, resolveClientId]);

  /** Auto-launch flow if requested. */
  useEffect(() => {
    if (!autoLaunch || autoTriggered || loading || !sdkReady) return;
    setAutoTriggered(true);
    if (isDevMode) {
      handleDevFallback();
    } else if (window.google?.accounts?.id?.prompt) {
      window.google.accounts.id.prompt();
    }
  }, [autoLaunch, autoTriggered, handleDevFallback, isDark, isDevMode, loading, sdkReady]);

  const btnBase = {
    width: '100%',
    background: isDark ? '#1e293b' : '#ffffff',
    color: isDark ? '#f1f5f9' : '#1f2937',
    border: `1.5px solid ${isDark ? '#334155' : '#d1d5db'}`,
    borderRadius: 10,
    padding: '11px 0',
    fontFamily: 'DM Sans, sans-serif',
    fontWeight: 600,
    fontSize: 14,
    letterSpacing: '0.01em',
    cursor: loading ? 'not-allowed' : 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    transition: 'all 0.2s ease',
    opacity: loading ? 0.6 : 1,
    boxShadow: isDark
      ? '0 1px 4px rgba(0,0,0,0.4)'
      : '0 1px 3px rgba(0,0,0,0.08)',
  };

  // ── Dev mode: show our styled button (calls dev fallback) ──────────────────
  if (isDevMode) {
    return (
      <button
        type="button"
        id="google-login-btn-dev"
        onClick={handleDevFallback}
        disabled={loading}
        title="Continue with Google (Development Mode)"
        style={btnBase}
      >
        <GoogleIcon />
        {loading ? 'Signing in…' : 'Continue with Google'}
      </button>
    );
  }

  // ── SDK ready but not yet initialized (shouldn't last long) ───────────────
  if (!sdkInitialized) {
    return (
      <button
        type="button"
        id="google-login-btn-loading"
        disabled
        style={{ ...btnBase, opacity: 0.5, cursor: 'default' }}
      >
        <GoogleIcon />
        Loading Google…
      </button>
    );
  }

  // ── Production: show Google's own rendered button in our wrapper ───────────
  return (
    <div style={{ width: '100%' }}>
      {/* Google SDK renders its own button inside this div */}
      <div
        ref={googleBtnRef}
        id="google-login-btn-sdk"
        style={{ width: '100%', minHeight: 44 }}
      />
    </div>
  );
}

export default GoogleLoginBtn;

import React from 'react';
import { GoogleOAuthProvider } from '@react-oauth/google';

const isValidGoogleClientId = (value) => {
  if (!value || typeof value !== 'string') return false;
  const trimmed = value.trim();
  if (!trimmed) return false;
  const lower = trimmed.toLowerCase();
  if (lower.includes('your_') || lower.includes('placeholder')) return false;
  return /^\d{8,}-[a-z0-9-]{20,}\.apps\.googleusercontent\.com$/i.test(trimmed);
};

const GoogleAuthProvider = ({ children }) => {
  const clientId = process.env.REACT_APP_GOOGLE_CLIENT_ID || '';

  if (!isValidGoogleClientId(clientId)) {
    return children;
  }

  return (
    <GoogleOAuthProvider clientId={clientId}>
      {children}
    </GoogleOAuthProvider>
  );
};

export default GoogleAuthProvider;

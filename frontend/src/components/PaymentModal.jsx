import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useAuth } from '../context/AuthContext';

export default function PaymentModal({ isDark, plan, userType, onClose, showToast }) {
  const { user, isLoggedIn } = useAuth();
  const [billingInfo, setBillingInfo] = useState({
    email: '',
    phone: '',
    address: '',
    city: '',
    zip: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);

  const modalBg = isDark ? '#111' : '#fff';
  const modalBorder = isDark ? '#1f2937' : '#e5e7eb';
  const titleColor = isDark ? '#f9fafb' : '#0f172a';
  const textColor = isDark ? '#e5e7eb' : '#374151';
  const subColor = isDark ? '#9ca3af' : '#64748b';
  const inputBg = isDark ? '#1a1a1a' : '#f9fafb';
  const inputBorder = isDark ? '#374151' : '#d1d5db';
  const khaltiColor = '#5b2c87';
  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';
  const roleLabel = userType === 'seeker' ? 'service seeker' : 'local helper';

  const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
  const normalizePhone = (value) => String(value || '').replace(/[^0-9]/g, '');
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidNepalMobile = (value) => /^98\d{8}$/.test(value);

  useEffect(() => {
    setBillingInfo((current) => ({
      ...current,
      email: current.email || user?.email || '',
      phone: current.phone || user?.phoneNumber || user?.phone || '',
    }));
  }, [user?.email, user?.phone, user?.phoneNumber]);

  const handlePayment = async () => {
    const email = normalizeEmail(billingInfo.email);
    const mobile = normalizePhone(billingInfo.phone);

    if (!isLoggedIn) {
      showToast('Please sign in before upgrading your plan.');
      return;
    }

    if (!email) {
      showToast('Please provide your email before continuing to Khalti.');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address.');
      return;
    }

    if (!mobile) {
      showToast('Please provide your mobile number before continuing to Khalti.');
      return;
    }

    if (!isValidNepalMobile(mobile)) {
      showToast('Please enter a valid Nepal mobile number (e.g. 98XXXXXXXX).');
      return;
    }

    setIsProcessing(true);

    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/subscriptions/checkout/initiate`,
        {
          plan: plan.name,
          userType,
          method: 'khalti',
          email,
          mobile,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        window.location.href = response.data.data.paymentUrl;
        return;
      }

      throw new Error(response.data.message || 'Unable to start Khalti checkout.');
    } catch (error) {
      setIsProcessing(false);
      showToast(error.response?.data?.message || error.message || 'Unable to start Khalti checkout.');
    }
  };

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed',
        inset: 0,
        background: isDark ? 'rgba(0,0,0,0.72)' : 'rgba(0,0,0,0.4)',
        backdropFilter: 'blur(6px)',
        zIndex: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'all 0.3s',
      }}
    >
      <div
        className="modal-anim"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: modalBg,
          border: `1px solid ${modalBorder}`,
          borderRadius: 20,
          padding: '32px 28px',
          width: 560,
          maxWidth: '95vw',
          maxHeight: '90vh',
          overflow: 'auto',
          position: 'relative',
          boxShadow: isDark ? 'none' : '0 20px 40px rgba(0,0,0,0.1)',
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: '50%',
            border: `1.5px solid ${khaltiColor}`,
            background: 'transparent',
            color: khaltiColor,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: 24 }}>
          <h2 style={{ color: titleColor, fontFamily: 'Syne', fontWeight: 700, fontSize: 24, margin: '0 0 8px' }}>
            Upgrade to {plan.name}
          </h2>
          <p style={{ color: subColor, fontFamily: 'DM Sans', fontSize: 14, margin: 0 }}>
            {plan.desc} This upgrade will be applied to your {roleLabel} account.
          </p>
          <div style={{ display: 'flex', alignItems: 'baseline', gap: 6, marginTop: 12 }}>
            <span style={{ color: titleColor, fontFamily: 'Syne', fontWeight: 800, fontSize: 28 }}>{plan.price}</span>
            <span style={{ color: subColor, fontFamily: 'DM Sans', fontSize: 16 }}>{plan.period}</span>
          </div>
        </div>

        <div
          style={{
            marginBottom: 24,
            textAlign: 'center',
            padding: '32px 20px',
            background: inputBg,
            borderRadius: 12,
            border: `1px solid ${inputBorder}`,
          }}
        >
          <div style={{ fontSize: 48, marginBottom: 16, color: khaltiColor }}>ⓚ</div>
          <p style={{ color: textColor, fontFamily: 'DM Sans', fontSize: 16, margin: '0 0 10px' }}>
            You will continue through Khalti to activate your {plan.name} plan as a {roleLabel}.
          </p>
          <p style={{ color: subColor, fontFamily: 'DM Sans', fontSize: 14, margin: 0 }}>
            Khalti hosted checkout with server-side verification.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3 style={{ color: titleColor, fontFamily: 'Syne', fontWeight: 600, fontSize: 18, margin: '0 0 16px' }}>
            Billing Information
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: textColor, fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Email Address
              </label>
              <input
                type="email"
                placeholder="john@example.com"
                value={billingInfo.email}
                onChange={(e) => setBillingInfo({ ...billingInfo, email: e.target.value })}
                style={{
                  width: '100%',
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontFamily: 'DM Sans',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ display: 'block', color: textColor, fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600, marginBottom: 6 }}>
                Mobile Number
              </label>
              <input
                type="text"
                placeholder="98XXXXXXXX"
                value={billingInfo.phone}
                onChange={(e) => setBillingInfo({ ...billingInfo, phone: e.target.value.replace(/[^0-9+\s-]/g, '') })}
                style={{
                  width: '100%',
                  background: inputBg,
                  color: textColor,
                  border: `1px solid ${inputBorder}`,
                  borderRadius: 8,
                  padding: '12px 16px',
                  fontFamily: 'DM Sans',
                  fontSize: 14,
                  outline: 'none',
                }}
              />
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24, padding: 20, background: inputBg, borderRadius: 12, border: `1px solid ${inputBorder}` }}>
          <h4 style={{ color: titleColor, fontFamily: 'Syne', fontWeight: 600, fontSize: 16, margin: '0 0 12px' }}>Order Summary</h4>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
            <span style={{ color: textColor, fontFamily: 'DM Sans', fontSize: 14 }}>{plan.name} Plan ({roleLabel})</span>
            <span style={{ color: textColor, fontFamily: 'DM Sans', fontSize: 14, fontWeight: 600 }}>{plan.price}{plan.period}</span>
          </div>
          <div style={{ borderTop: `1px solid ${inputBorder}`, paddingTop: 8, marginTop: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ color: titleColor, fontFamily: 'DM Sans', fontSize: 16, fontWeight: 600 }}>Total</span>
              <span style={{ color: titleColor, fontFamily: 'Syne', fontSize: 18, fontWeight: 700 }}>{plan.price}{plan.period}</span>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'transparent',
              color: subColor,
              border: `1px solid ${inputBorder}`,
              borderRadius: 10,
              padding: '14px 0',
              fontFamily: 'Syne',
              fontWeight: 600,
              fontSize: 15,
              cursor: 'pointer',
            }}
          >
            Cancel
          </button>
          <button
            onClick={handlePayment}
            disabled={isProcessing}
            style={{
              flex: 1,
              background: isProcessing ? '#6b7280' : khaltiColor,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '14px 0',
              fontFamily: 'Syne',
              fontWeight: 700,
              fontSize: 15,
              cursor: isProcessing ? 'not-allowed' : 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
            }}
          >
            {isProcessing ? (
              <>
                <div style={{ width: 16, height: 16, border: '2px solid #fff', borderTop: '2px solid transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
                Processing...
              </>
            ) : (
              'Continue with Khalti'
            )}
          </button>
        </div>

        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    </div>
  );
}

import React, { useState } from 'react';
import axios from 'axios';

const KhaltiPaymentModal = ({ isDark, booking, userEmail, userPhone, onClose, showToast, onPaymentSuccess }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [paymentInitiated, setPaymentInitiated] = useState(false);

  const apiBaseUrl = process.env.REACT_APP_API_URL || 'http://localhost:5002';

  const modalBg = isDark ? "#111" : "#fff";
  const modalBorder = isDark ? "#1f2937" : "#e5e7eb";
  const titleColor = isDark ? "#f9fafb" : "#0f172a";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const subColor = isDark ? "#9ca3af" : "#64748b";
  const khaltiColor = "#5b2c87"; // Official Khalti color
  const accentColor = khaltiColor;

  const normalizeEmail = (value) => String(value || '').trim().toLowerCase();
  const normalizePhone = (value) => String(value || '').replace(/[^0-9]/g, '');
  const isValidEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  const isValidNepalMobile = (value) => /^98\d{8}$/.test(value);

  const handleInitiatePayment = async () => {
    const email = normalizeEmail(userEmail);
    const mobile = normalizePhone(userPhone);

    if (!mobile) {
      showToast('Please provide mobile number for Khalti payment');
      return;
    }

    if (!isValidNepalMobile(mobile)) {
      showToast('Please enter a valid Nepal mobile number (98XXXXXXXX).');
      return;
    }

    if (!email) {
      showToast('Please provide email for Khalti payment');
      return;
    }

    if (!isValidEmail(email)) {
      showToast('Please enter a valid email address for Khalti payment.');
      return;
    }

    setIsLoading(true);
    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/payments/initiate`,
        {
          bookingId: booking._id,
          method: 'khalti',
          mobile,
          email,
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
            'Content-Type': 'application/json',
          },
        }
      );

      if (response.data.status === 'success') {
        setPaymentInitiated(true);
        window.location.href = response.data.data.paymentUrl;
        return;
      } else {
        showToast('Failed to initiate payment: ' + response.data.message);
        setIsLoading(false);
      }
    } catch (err) {
      console.error('Payment initiation error:', err);
      showToast('Error initiating payment: ' + (err.response?.data?.message || err.message));
      setIsLoading(false);
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
          width: 500,
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
            border: `1.5px solid ${accentColor}`,
            background: 'transparent',
            color: accentColor,
            cursor: 'pointer',
            fontSize: 16,
          }}
        >
          ✕
        </button>

        <div style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
            <div
              style={{
                width: 50,
                height: 50,
                borderRadius: '50%',
                background: accentColor + '22',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontWeight: 800,
                fontSize: 24,
                color: accentColor,
              }}
            >
              ⓚ
            </div>
            <div>
              <h2
                style={{
                  color: titleColor,
                  fontFamily: 'Syne',
                  fontWeight: 700,
                  fontSize: 24,
                  margin: 0,
                }}
              >
                Khalti Payment
              </h2>
              <p
                style={{
                  color: textColor,
                  fontFamily: 'DM Sans',
                  fontSize: 13,
                  margin: '4px 0 0 0',
                }}
              >
                Secure Khalti checkout
              </p>
            </div>
          </div>

          <div
            style={{
              background: accentColor + '08',
              border: `1px solid ${accentColor}33`,
              borderRadius: 12,
              padding: 16,
              marginTop: 16,
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ color: subColor, fontFamily: 'DM Sans', fontSize: 14 }}>
                Booking Amount:
              </span>
              <span
                style={{
                  color: titleColor,
                  fontFamily: 'Syne',
                  fontWeight: 700,
                  fontSize: 16,
                }}
              >
                NPR {booking?.totalPrice?.toLocaleString()}
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: subColor, fontFamily: 'DM Sans', fontSize: 14 }}>
                Gateway:
              </span>
              <span
                style={{
                  color: titleColor,
                  fontFamily: 'DM Sans',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                Khalti
              </span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 12 }}>
              <span style={{ color: subColor, fontFamily: 'DM Sans', fontSize: 14 }}>
                Phone:
              </span>
              <span
                style={{
                  color: titleColor,
                  fontFamily: 'DM Sans',
                  fontWeight: 600,
                  fontSize: 14,
                }}
              >
                {normalizePhone(userPhone) || 'Not provided'}
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <p
            style={{
              color: subColor,
              fontFamily: 'DM Sans',
              fontSize: 13,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            Khalti will redirect you to its hosted payment page and the backend will verify the pidx before confirming the booking.
          </p>
        </div>

        {paymentInitiated && (
          <div
            style={{
              background: accentColor + '11',
              border: `1px solid ${accentColor}`,
              borderRadius: 10,
              padding: 12,
              marginBottom: 20,
              display: 'flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            <span style={{ fontSize: 18 }}>🔄</span>
            <span
              style={{
                color: accentColor,
                fontFamily: 'DM Sans',
                fontSize: 13,
                fontWeight: 600,
              }}
            >
              Launching Khalti payment gateway...
            </span>
          </div>
        )}

        <div style={{ display: 'flex', gap: 12 }}>
          <button
            onClick={handleInitiatePayment}
            disabled={isLoading || paymentInitiated}
            style={{
              flex: 1,
              background: accentColor,
              color: '#fff',
              border: 'none',
              borderRadius: 10,
              padding: '14px 0',
              fontFamily: 'Syne',
              fontWeight: 700,
              fontSize: 15,
              cursor: isLoading || paymentInitiated ? 'not-allowed' : 'pointer',
              opacity: isLoading || paymentInitiated ? 0.7 : 1,
              transition: 'all 0.3s',
            }}
          >
            {isLoading
              ? '⏳ Processing...'
              : paymentInitiated
              ? '💳 Redirecting...'
              : '💳 Pay with Khalti'}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: 'transparent',
              color: subColor,
              border: `1px solid ${modalBorder}`,
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
        </div>

        <div
          style={{
            marginTop: 20,
            padding: '12px 16px',
            background: isDark ? '#1a1a1a' : '#f9fafb',
            borderRadius: 10,
            border: `1px solid ${modalBorder}`,
          }}
        >
          <p
            style={{
              color: subColor,
              fontFamily: 'DM Sans',
              fontSize: 12,
              margin: 0,
              lineHeight: 1.5,
            }}
          >
            <strong>🔒 Secure:</strong> Booking confirmation happens only after the backend verifies the
            gateway transaction ID and paid amount. Raw card credentials are never stored here.
          </p>
        </div>
      </div>
    </div>
  );
};

export default KhaltiPaymentModal;

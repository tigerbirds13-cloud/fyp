import React, { useEffect, useState } from "react";
import axios from "axios";
import SubscriptionSuccessModal from "./SubscriptionSuccessModal";

/**
 * PaymentCallbackModal
 *
 * Shown when Khalti redirects the user back to the app after payment.
 * Reads pidx, status, and purchase_order_id from URL query params,
 * calls the backend lookup/verify API, and displays the result.
 */
const PaymentCallbackModal = ({ isDark, callbackParams, onClose }) => {
  const [verifyStatus, setVerifyStatus] = useState("loading"); // 'loading' | 'success' | 'failed'
  const [message, setMessage] = useState("Verifying your payment...");
  const [subscriptionData, setSubscriptionData] = useState(null);
  const [showSuccessModal, setShowSuccessModal] = useState(false);
  const apiBaseUrl = process.env.REACT_APP_API_URL || "http://localhost:5002";

  const modalBg = isDark ? "#111" : "#fff";
  const modalBorder = isDark ? "#1f2937" : "#e5e7eb";
  const titleColor = isDark ? "#f9fafb" : "#0f172a";
  const subColor = isDark ? "#9ca3af" : "#64748b";
  const khaltiColor = "#5b2c87";
  const successColor = "#16a34a";
  const errorColor = "#dc2626";
  const gatewayColor = khaltiColor;
  const paymentContext = callbackParams.context || "booking";
  const callbackRoleLabel =
    callbackParams.userType === "seeker"
      ? "service seeker"
      : callbackParams.userType === "helper"
        ? "local helper"
        : "account";

  useEffect(() => {
    const verify = async () => {
      const { pidx, status, purchase_order_id, plan, userType } =
        callbackParams;

      if (status === "User canceled") {
        setVerifyStatus("failed");
        setMessage("Payment was canceled. No charges were made.");
        return;
      }

      if (status === "Expired" || status === "failed") {
        setVerifyStatus("failed");
        setMessage("Payment link expired. Please try again.");
        return;
      }

      try {
        const token = localStorage.getItem("token");
        const requestBody =
          paymentContext === "subscription"
            ? {
                pidx,
                plan,
                userType,
              }
            : {
                method: "khalti",
                pidx,
                bookingId: purchase_order_id,
              };

        const resolvedBookingId =
          paymentContext === "subscription" ? plan : purchase_order_id;

        if (!resolvedBookingId || !pidx) {
          setVerifyStatus("failed");
          setMessage(
            "Invalid payment callback. Required parameters are missing.",
          );
          return;
        }
        const response = await axios.post(
          paymentContext === "subscription"
            ? `${apiBaseUrl}/api/subscriptions/checkout/verify`
            : `${apiBaseUrl}/api/payments/verify`,
          requestBody,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          },
        );

        if (response.data.status === "success") {
          setVerifyStatus("success");

          if (paymentContext === "subscription") {
            // Store subscription data for success modal
            setSubscriptionData({
              plan: callbackParams.plan,
              userType: callbackParams.userType,
              transactionId:
                response.data.data?.paymentDetails?.transactionId ||
                callbackParams.pidx,
            });
            // Show subscription success modal
            setShowSuccessModal(true);
          }

          setMessage(
            paymentContext === "subscription"
              ? response.data.message ||
                  `Payment successful! Your ${callbackRoleLabel} subscription is now active.`
              : "Payment successful! Your booking has been confirmed.",
          );
        } else {
          setVerifyStatus("failed");
          setMessage(response.data.message || "Payment verification failed.");
        }
      } catch (err) {
        setVerifyStatus("failed");
        setMessage(
          err.response?.data?.message ||
            "Payment verification failed. Please contact support.",
        );
      }
    };

    verify();
  }, [apiBaseUrl, callbackParams, callbackRoleLabel, paymentContext]);

  const statusIcon =
    verifyStatus === "loading" ? "⏳" : verifyStatus === "success" ? "✓" : "✕";
  const statusColor =
    verifyStatus === "loading"
      ? gatewayColor
      : verifyStatus === "success"
        ? successColor
        : errorColor;

  const handleDashboardClick = () => {
    setShowSuccessModal(false);
    onClose();
    // Redirect to dashboard after a brief delay
    setTimeout(() => {
      window.location.href = "/dashboard";
    }, 300);
  };

  // Show subscription success modal for successful subscription payments
  if (
    showSuccessModal &&
    subscriptionData &&
    paymentContext === "subscription"
  ) {
    return (
      <SubscriptionSuccessModal
        isDark={isDark}
        subscriptionData={subscriptionData}
        userType={subscriptionData.userType}
        plan={subscriptionData.plan}
        onDashboardClick={handleDashboardClick}
        onClose={() => {
          setShowSuccessModal(false);
          onClose();
        }}
      />
    );
  }

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
        zIndex: 300,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
      }}
    >
      <div
        style={{
          background: modalBg,
          border: `1px solid ${modalBorder}`,
          borderRadius: 20,
          padding: "40px 32px",
          width: 420,
          maxWidth: "90vw",
          textAlign: "center",
          boxShadow: isDark ? "none" : "0 20px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Status icon */}
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: statusColor + "18",
            border: `2px solid ${statusColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 28,
            color: statusColor,
            margin: "0 auto 20px",
          }}
        >
          {statusIcon}
        </div>

        <h2
          style={{
            color: titleColor,
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 22,
            margin: "0 0 12px",
          }}
        >
          {verifyStatus === "loading"
            ? "Verifying Khalti Payment"
            : verifyStatus === "success"
              ? paymentContext === "subscription"
                ? "Subscription Confirmed"
                : "Payment Confirmed"
              : "Payment Failed"}
        </h2>

        <p
          style={{
            color: subColor,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            lineHeight: 1.6,
            margin: "0 0 8px",
          }}
        >
          {message}
        </p>

        {callbackParams.transaction_id && verifyStatus === "success" && (
          <p
            style={{
              color: subColor,
              fontFamily: "DM Sans, sans-serif",
              fontSize: 12,
              margin: "4px 0 0",
            }}
          >
            Transaction ID:{" "}
            <strong style={{ color: titleColor }}>
              {callbackParams.transaction_id || callbackParams.pidx}
            </strong>
          </p>
        )}

        {verifyStatus !== "loading" && (
          <button
            onClick={onClose}
            style={{
              marginTop: 28,
              background:
                verifyStatus === "success" ? successColor : khaltiColor,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 32px",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            {verifyStatus === "success"
              ? paymentContext === "subscription"
                ? "Close"
                : "View Booking"
              : "Close"}
          </button>
        )}
      </div>
    </div>
  );
};

export default PaymentCallbackModal;

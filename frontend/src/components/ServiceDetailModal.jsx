import React, { useState } from "react";
import axios from "axios";
import KhaltiPaymentModal from "./KhaltiPaymentModal";

export default function ServiceDetailModal({
  isDark,
  service,
  onClose,
  showToast,
  isLoggedIn,
  onRequireLogin,
  userProfile,
}) {
  const [showKhaltiModal, setShowKhaltiModal] = useState(false);
  const [bookingData, setBookingData] = useState(null);
  const [isCreatingBooking, setIsCreatingBooking] = useState(false);

  if (!service) return null;

  const handleBookingRequest = async () => {
    if (!isLoggedIn && onRequireLogin && !onRequireLogin()) {
      return;
    }

    // Create booking first, then show payment modal
    setIsCreatingBooking(true);
    try {
      const response = await axios.post(
        "/api/bookings",
        {
          serviceId: service._id || service.id,
          scheduledDate: new Date().toISOString(),
          location: userProfile?.location || "TBD",
          notes: "Booking created through service request",
        },
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem("token")}`,
            "Content-Type": "application/json",
          },
        },
      );

      if (response.data.status === "success") {
        setBookingData(response.data.data.booking);
        setShowKhaltiModal(true);
        showToast("💳 Proceed to payment to confirm your booking");
      } else {
        showToast("Failed to create booking: " + response.data.message);
      }
    } catch (err) {
      console.error("Booking creation error:", err);
      showToast(
        "Error creating booking: " +
          (err.response?.data?.message || err.message),
      );
    } finally {
      setIsCreatingBooking(false);
    }
  };

  const handlePaymentSuccess = (confirmedBooking) => {
    showToast("✓ Payment successful! Your booking is confirmed!");
    setShowKhaltiModal(false);
    setTimeout(() => {
      onClose();
    }, 1500);
  };

  const modalBg = isDark ? "#111" : "#fff";
  const modalBorder = isDark ? "#1f2937" : "#e5e7eb";
  const titleColor = isDark ? "#f9fafb" : "#0f172a";
  const textColor = isDark ? "#e5e7eb" : "#374151";
  const subColor = isDark ? "#9ca3af" : "#64748b";
  const cardBg = isDark ? "#1a1a1a" : "#f9fafb";
  const cardBorder = isDark ? "#1f2937" : "#e5e7eb";

  return (
    <div
      onClick={onClose}
      style={{
        position: "fixed",
        inset: 0,
        background: isDark ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.4)",
        backdropFilter: "blur(6px)",
        zIndex: 200,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        transition: "all 0.3s",
      }}
    >
      <div
        className="modal-anim"
        onClick={(e) => e.stopPropagation()}
        style={{
          background: modalBg,
          border: `1px solid ${modalBorder}`,
          borderRadius: 20,
          padding: "32px 28px",
          width: 600,
          maxWidth: "95vw",
          maxHeight: "90vh",
          overflow: "auto",
          position: "relative",
          boxShadow: isDark ? "none" : "0 20px 40px rgba(0,0,0,0.1)",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            width: 32,
            height: 32,
            borderRadius: "50%",
            border: "1.5px solid #22c55e",
            background: "transparent",
            color: "#22c55e",
            cursor: "pointer",
            fontSize: 16,
          }}
        >
          ✕
        </button>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 16,
            marginBottom: 24,
          }}
        >
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: "50%",
              background: service.color + "22",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: 18,
              color: service.color,
              flexShrink: 0,
            }}
          >
            {service.avatar}
          </div>
          <div>
            <h2
              style={{
                color: titleColor,
                fontFamily: "Syne",
                fontWeight: 700,
                fontSize: 24,
                margin: 0,
              }}
            >
              {service.name}
            </h2>
            <p
              style={{
                color: "#16a34a",
                fontFamily: "DM Sans",
                fontSize: 16,
                fontWeight: 600,
                margin: 4,
              }}
            >
              {service.role}
            </p>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span
                style={{ color: subColor, fontFamily: "DM Sans", fontSize: 14 }}
              >
                📍 {service.location}
              </span>
              <span
                style={{
                  color: "#f59e0b",
                  fontFamily: "DM Sans",
                  fontSize: 14,
                }}
              >
                ★ {service.rating} · {service.jobs} jobs
              </span>
            </div>
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              color: titleColor,
              fontFamily: "Syne",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 12,
            }}
          >
            Services Offered
          </h3>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            {service.tags.map((tag) => (
              <span
                key={tag}
                style={{
                  background: isDark ? "#14532d33" : "#f0fdf4",
                  color: isDark ? "#22c55e" : "#15803d",
                  border: `1px solid ${isDark ? "#22c55e33" : "#bbf7d0"}`,
                  borderRadius: 999,
                  padding: "4px 12px",
                  fontFamily: "DM Sans",
                  fontSize: 13,
                }}
              >
                ◦ {tag}
              </span>
            ))}
          </div>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              color: titleColor,
              fontFamily: "Syne",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 12,
            }}
          >
            About
          </h3>
          <p
            style={{
              color: textColor,
              fontFamily: "DM Sans",
              fontSize: 15,
              lineHeight: 1.6,
              margin: 0,
            }}
          >
            {service.name} is a skilled {service.role.toLowerCase()} based in{" "}
            {service.location}. With {service.rating} stars from {service.jobs}{" "}
            completed jobs, they provide reliable and professional services in
            their area of expertise. Contact them to discuss your specific needs
            and get a personalized quote.
          </p>
        </div>

        <div style={{ marginBottom: 24 }}>
          <h3
            style={{
              color: titleColor,
              fontFamily: "Syne",
              fontWeight: 600,
              fontSize: 18,
              marginBottom: 12,
            }}
          >
            Contact Information
          </h3>
          <div
            style={{
              background: cardBg,
              border: `1px solid ${cardBorder}`,
              borderRadius: 12,
              padding: 16,
            }}
          >
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>📧</span>
              <span
                style={{
                  color: textColor,
                  fontFamily: "DM Sans",
                  fontSize: 14,
                }}
              >
                Email: {service.name.toLowerCase().replace(" ", ".")}
                @hometownhelper.com
              </span>
            </div>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: 12,
                marginBottom: 8,
              }}
            >
              <span style={{ fontSize: 18 }}>📱</span>
              <span
                style={{
                  color: textColor,
                  fontFamily: "DM Sans",
                  fontSize: 14,
                }}
              >
                Phone: Available upon booking request
              </span>
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <span style={{ fontSize: 18 }}>📍</span>
              <span
                style={{
                  color: textColor,
                  fontFamily: "DM Sans",
                  fontSize: 14,
                }}
              >
                Location: {service.location}
              </span>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", gap: 12 }}>
          <button
            onClick={handleBookingRequest}
            disabled={isCreatingBooking}
            style={{
              flex: 1,
              background: "#22c55e",
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "12px 0",
              fontFamily: "Syne",
              fontWeight: 700,
              fontSize: 15,
              cursor: isCreatingBooking ? "not-allowed" : "pointer",
              opacity: isCreatingBooking ? 0.7 : 1,
            }}
          >
            {isCreatingBooking ? "⏳ Processing..." : "💳 Book Now and Pay"}
          </button>
          <button
            onClick={onClose}
            style={{
              flex: 1,
              background: "transparent",
              color: subColor,
              border: `1px solid ${cardBorder}`,
              borderRadius: 10,
              padding: "12px 0",
              fontFamily: "Syne",
              fontWeight: 600,
              fontSize: 15,
              cursor: "pointer",
            }}
          >
            Close
          </button>
        </div>

        {/* Khalti Payment Modal */}
        {showKhaltiModal && bookingData && (
          <KhaltiPaymentModal
            isDark={isDark}
            booking={bookingData}
            userEmail={userProfile?.email}
            userPhone={userProfile?.contact}
            onClose={() => setShowKhaltiModal(false)}
            showToast={showToast}
            onPaymentSuccess={handlePaymentSuccess}
          />
        )}
      </div>
    </div>
  );
}

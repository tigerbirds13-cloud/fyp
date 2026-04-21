import React, { useState, useEffect } from "react";
import { X } from "lucide-react";

export default function CookieConsentBanner() {
  const [showBanner, setShowBanner] = useState(false);
  const [showDetails, setShowDetails] = useState(false);
  const [preferences, setPreferences] = useState({
    necessary: true, // Always required
    analytics: false,
    marketing: false,
  });

  useEffect(() => {
    // Check if user has already made a choice
    const saved = localStorage.getItem("cookieConsent");
    if (!saved) {
      setShowBanner(true);
    } else {
      // Apply saved preferences
      try {
        const prefs = JSON.parse(saved);
        setPreferences(prefs);
      } catch (err) {
        console.error("Error parsing cookie preferences:", err);
      }
    }
  }, []);

  const handleAcceptAll = () => {
    const allAccepted = {
      necessary: true,
      analytics: true,
      marketing: true,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(allAccepted));
    setPreferences(allAccepted);
    setShowBanner(false);
  };

  const handleRejectAll = () => {
    const minimal = {
      necessary: true,
      analytics: false,
      marketing: false,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(minimal));
    setPreferences(minimal);
    setShowBanner(false);
  };

  const handleSavePreferences = () => {
    const prefs = {
      ...preferences,
      timestamp: new Date().toISOString(),
    };
    localStorage.setItem("cookieConsent", JSON.stringify(prefs));
    setShowBanner(false);
  };

  const handleToggle = (key) => {
    if (key !== "necessary") {
      // Can't toggle necessary cookies
      setPreferences((prev) => ({ ...prev, [key]: !prev[key] }));
    }
  };

  if (!showBanner) return null;

  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background:
          "linear-gradient(135deg, rgba(15, 23, 42, 0.98), rgba(30, 41, 59, 0.98))",
        backdropFilter: "blur(10px)",
        borderTop: "1px solid rgba(255, 255, 255, 0.1)",
        padding: "24px 32px",
        zIndex: 9999,
        boxShadow: "0 -8px 32px rgba(0, 0, 0, 0.3)",
        fontFamily: "'DM Sans', sans-serif",
        color: "#e0e7ff",
        animation: "slideUp 0.4s ease-out",
      }}
    >
      <style>{`
        @keyframes slideUp {
          from {
            transform: translateY(100%);
            opacity: 0;
          }
          to {
            transform: translateY(0);
            opacity: 1;
          }
        }
      `}</style>

      <div
        style={{
          maxWidth: 1400,
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "auto 1fr",
          gap: 24,
          alignItems: "center",
        }}
      >
        {/* Content */}
        <div
          style={{ gridColumn: "1 / -1", marginBottom: showDetails ? 20 : 0 }}
        >
          <div style={{ display: "flex", alignItems: "flex-start", gap: 16 }}>
            <div
              style={{
                fontSize: 24,
                marginTop: 4,
              }}
            >
              🍪
            </div>
            <div style={{ flex: 1 }}>
              <h3
                style={{
                  margin: "0 0 8px",
                  fontSize: 18,
                  fontWeight: 700,
                  color: "#ffffff",
                }}
              >
                We Use Cookies
              </h3>
              <p
                style={{
                  margin: 0,
                  fontSize: 14,
                  color: "#cbd5e1",
                  lineHeight: 1.6,
                }}
              >
                We use cookies to enhance your experience, analyze traffic, and
                for marketing purposes. Your privacy matters to us.{" "}
                <button
                  onClick={() => setShowDetails(!showDetails)}
                  style={{
                    background: "none",
                    border: "none",
                    color: "#60a5fa",
                    cursor: "pointer",
                    textDecoration: "underline",
                    fontSize: 14,
                    fontWeight: 600,
                    padding: 0,
                    fontFamily: "inherit",
                  }}
                >
                  {showDetails ? "Hide details" : "Learn more"}
                </button>
              </p>
            </div>

            {/* Close button */}
            <button
              onClick={handleRejectAll}
              style={{
                background: "none",
                border: "none",
                color: "#94a3b8",
                cursor: "pointer",
                padding: 8,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                transition: "color 0.2s",
              }}
              onMouseOver={(e) => (e.target.style.color = "#cbd5e1")}
              onMouseOut={(e) => (e.target.style.color = "#94a3b8")}
              title="Reject all cookies"
            >
              <X size={20} />
            </button>
          </div>
        </div>

        {/* Details Section */}
        {showDetails && (
          <div
            style={{
              gridColumn: "1 / -1",
              padding: "20px",
              background: "rgba(0, 0, 0, 0.2)",
              borderRadius: 12,
              border: "1px solid rgba(255, 255, 255, 0.1)",
              marginBottom: 20,
            }}
          >
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
                gap: 16,
              }}
            >
              {/* Necessary */}
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <input
                  type="checkbox"
                  checked={preferences.necessary}
                  disabled
                  style={{ marginTop: 3, cursor: "not-allowed" }}
                />
                <div>
                  <label
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#ffffff",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Necessary Cookies ✓
                  </label>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    Required for site function, security, and auth
                  </p>
                </div>
              </div>

              {/* Analytics */}
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <input
                  type="checkbox"
                  checked={preferences.analytics}
                  onChange={() => handleToggle("analytics")}
                  style={{ marginTop: 3, cursor: "pointer" }}
                />
                <div>
                  <label
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#ffffff",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Analytics Cookies
                  </label>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    Help us understand how you use the site
                  </p>
                </div>
              </div>

              {/* Marketing */}
              <div
                style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
              >
                <input
                  type="checkbox"
                  checked={preferences.marketing}
                  onChange={() => handleToggle("marketing")}
                  style={{ marginTop: 3, cursor: "pointer" }}
                />
                <div>
                  <label
                    style={{
                      fontSize: 14,
                      fontWeight: 600,
                      color: "#ffffff",
                      display: "block",
                      marginBottom: 4,
                    }}
                  >
                    Marketing Cookies
                  </label>
                  <p style={{ margin: 0, fontSize: 12, color: "#94a3b8" }}>
                    For personalized ads and retargeting
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons */}
        <div
          style={{
            gridColumn: "1 / -1",
            display: "flex",
            gap: 12,
            alignItems: "center",
            flexWrap: "wrap",
            justifyContent: "flex-end",
          }}
        >
          <a
            href="/privacy-policy"
            style={{
              fontSize: 13,
              color: "#60a5fa",
              textDecoration: "none",
              fontWeight: 500,
              transition: "color 0.2s",
            }}
            onMouseOver={(e) => (e.target.style.color = "#93c5fd")}
            onMouseOut={(e) => (e.target.style.color = "#60a5fa")}
          >
            Privacy Policy
          </a>

          {showDetails && (
            <button
              onClick={handleSavePreferences}
              style={{
                padding: "10px 20px",
                background: "rgba(255, 255, 255, 0.1)",
                border: "1px solid rgba(255, 255, 255, 0.2)",
                borderRadius: 6,
                color: "#e0e7ff",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "all 0.2s",
              }}
              onMouseOver={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.15)";
              }}
              onMouseOut={(e) => {
                e.target.style.background = "rgba(255, 255, 255, 0.1)";
              }}
            >
              Save Preferences
            </button>
          )}

          <button
            onClick={handleRejectAll}
            style={{
              padding: "10px 20px",
              background: "rgba(255, 255, 255, 0.1)",
              border: "1px solid rgba(255, 255, 255, 0.2)",
              borderRadius: 6,
              color: "#e0e7ff",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.15)";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "rgba(255, 255, 255, 0.1)";
            }}
          >
            Reject All
          </button>

          <button
            onClick={handleAcceptAll}
            style={{
              padding: "10px 24px",
              background: "linear-gradient(135deg, #22c55e, #16a34a)",
              border: "none",
              borderRadius: 6,
              color: "#ffffff",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
            }}
            onMouseOver={(e) => {
              e.target.style.transform = "translateY(-2px)";
            }}
            onMouseOut={(e) => {
              e.target.style.transform = "translateY(0)";
            }}
          >
            Accept All
          </button>
        </div>
      </div>
    </div>
  );
}

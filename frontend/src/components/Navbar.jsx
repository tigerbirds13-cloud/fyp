import React from "react";

export default function Navbar({
  isDark,
  setIsDark,
  scrollTo,
  refs,
  goLogin,
  setModal,
  onServicesClick,
  onProfile,
  isLoggedIn,
  onLogout,
}) {
  const textColor = isDark ? "#ccc" : "#4b5563";

  return (
    <nav
      style={{
        background: isDark ? "#0a0a0a" : "#fff",
        borderBottom: `1px solid ${isDark ? "#1a1a1a" : "#e5e7eb"}`,
        padding: "0 2.5rem",
        display: "flex",
        alignItems: "center",
        justifyContent: "space-between",
        height: 62,
        position: "sticky",
        top: 0,
        zIndex: 100,
        transition: "background 0.3s, border-color 0.3s",
      }}
    >
      <div
        onClick={() => scrollTo(refs.hero)}
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          cursor: "pointer",
        }}
      >
        <div
          style={{
            width: 36,
            height: 36,
            borderRadius: "50%",
            background: "linear-gradient(135deg,#22c55e,#16a34a)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          🏘
        </div>
        <span
          style={{
            color: isDark ? "#fff" : "#111",
            fontFamily: "Syne",
            fontWeight: 800,
            fontSize: 18,
            letterSpacing: "-0.5px",
          }}
        >
          HomeTown<span style={{ color: "#22c55e" }}>Helper</span>
        </span>
      </div>

      <div style={{ display: "flex", gap: 28, alignItems: "center" }}>
        {[
          ["Home", "hero"],
          ["Categories", "findHelp"],
          ["Jobs", "services"],
          ["Pricing", "pricing"],
          ["Contact", "contact"],
        ].map(([l, k]) => (
          <span
            key={l}
            onClick={l === "Jobs" ? onServicesClick : () => scrollTo(refs[k])}
            className="nav-lnk"
            style={{
              color: textColor,
              fontFamily: "DM Sans",
              fontSize: 14,
              cursor: "pointer",
              transition: "color 0.2s",
            }}
          >
            {l}
          </span>
        ))}
      </div>

      <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
        {/* THEME TOGGLE */}
        <button
          onClick={() => setIsDark(!isDark)}
          style={{
            background: isDark ? "#1a1a1a" : "#f3f4f6",
            border: `1px solid ${isDark ? "#333" : "#e5e7eb"}`,
            borderRadius: "50%",
            width: 38,
            height: 38,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            cursor: "pointer",
            transition: "all 0.3s",
          }}
        >
          {isDark ? (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#fbbf24"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <circle cx="12" cy="12" r="5" />
              <line x1="12" y1="1" x2="12" y2="3" />
              <line x1="12" y1="21" x2="12" y2="23" />
              <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
              <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
              <line x1="1" y1="12" x2="3" y2="12" />
              <line x1="21" y1="12" x2="23" y2="12" />
              <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
              <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
            </svg>
          ) : (
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="#4b5563"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
            </svg>
          )}
        </button>

        <div
          style={{
            width: 1,
            height: 24,
            background: isDark ? "#333" : "#e5e7eb",
          }}
        />

        {onProfile && (
          <button
            onClick={onProfile}
            style={{
              color: isDark ? "#fff" : "#111",
              background: "transparent",
              border: "none",
              fontFamily: "DM Sans",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "color 0.2s",
            }}
          >
            Profile
          </button>
        )}

        {isLoggedIn ? (
          <button
            onClick={onLogout}
            style={{
              color: isDark ? "#fff" : "#111",
              background: "transparent",
              border: "none",
              fontFamily: "DM Sans",
              fontWeight: 600,
              fontSize: 14,
              cursor: "pointer",
              transition: "color 0.2s",
            }}
          >
            Logout
          </button>
        ) : (
          <>
            <button
              onClick={() => goLogin && goLogin("seeker")}
              style={{
                color: isDark ? "#fff" : "#111",
                background: "transparent",
                border: "none",
                fontFamily: "DM Sans",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                transition: "color 0.2s",
              }}
            >
              Login
            </button>
            <button
              onClick={() => setModal && setModal(true)}
              style={{
                background: "#22c55e",
                color: "#fff",
                border: "none",
                borderRadius: 999,
                padding: "8px 22px",
                fontFamily: "DM Sans",
                fontWeight: 600,
                fontSize: 14,
                cursor: "pointer",
                boxShadow: "0 4px 12px rgba(34,197,94,0.2)",
                transition: "all 0.2s",
              }}
            >
              Start For Free →
            </button>
          </>
        )}
      </div>
    </nav>
  );
}

import React from 'react';

export default function RoleSelectionModal({ isDark, setModal, goRegister, goLogin }) {
  const modalBg = isDark ? "#111" : "#fff";
  const modalBorder = isDark ? "#1f2937" : "#e5e7eb";
  const titleColor = isDark ? "#f9fafb" : "#0f172a";
  const cardBg = isDark ? "#1a1a1a" : "#f9fafb";
  const cardBorder = isDark ? "#1f2937" : "#e5e7eb";
  const subColor = isDark ? "#9ca3af" : "#64748b";

  return (
    <div onClick={() => setModal(false)} style={{ position: "fixed", inset: 0, background: isDark ? "rgba(0,0,0,0.72)" : "rgba(0,0,0,0.4)", backdropFilter: "blur(6px)", zIndex: 200, display: "flex", alignItems: "center", justifyContent: "center", transition: "all 0.3s" }}>
      <div className="modal-anim" onClick={e => e.stopPropagation()} style={{ background: modalBg, border: `1px solid ${modalBorder}`, borderRadius: 20, padding: "32px 28px", width: 540, maxWidth: "95vw", position: "relative", boxShadow: isDark ? "none" : "0 20px 40px rgba(0,0,0,0.1)" }}>
        <button onClick={() => setModal(false)} style={{ position: "absolute", top: 16, right: 16, width: 32, height: 32, borderRadius: "50%", border: "1.5px solid #22c55e", background: "transparent", color: "#22c55e", cursor: "pointer", fontSize: 16 }}>✕</button>
        <h2 style={{ color: titleColor, fontFamily: "Syne", fontWeight: 700, fontSize: 22, marginBottom: 24 }}>Join As</h2>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16, marginBottom: 24 }}>
          {[{ icon: "🙋", title: "Help Seeker", sub: "Find Help / Book Services", role: "seeker" }, { icon: "🛠", title: "Local Helper", sub: "Offer Skills / Earn Money", role: "helper" }].map(opt => (
            <div key={opt.role} className="role-card" style={{ background: cardBg, border: `1.5px solid ${cardBorder}`, borderRadius: 14, padding: "24px 20px", transition: "all 0.2s" }}>
              <div style={{ fontSize: 28, marginBottom: 12 }}>{opt.icon}</div>
              <div style={{ color: titleColor, fontFamily: "Syne", fontWeight: 700, fontSize: 16, marginBottom: 4 }}>{opt.title}</div>
              <div style={{ color: subColor, fontFamily: "DM Sans", fontSize: 13 }}>{opt.sub}</div>
              <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
                <button
                  onClick={() => goRegister(opt.role)}
                  style={{
                    border: "none",
                    borderRadius: 999,
                    padding: "8px 14px",
                    background: "#22c55e",
                    color: "#fff",
                    fontFamily: "DM Sans",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer"
                  }}
                >
                  Register
                </button>
                <button
                  onClick={() => goLogin(opt.role)}
                  style={{
                    border: `1px solid ${cardBorder}`,
                    borderRadius: 999,
                    padding: "8px 14px",
                    background: "transparent",
                    color: titleColor,
                    fontFamily: "DM Sans",
                    fontWeight: 600,
                    fontSize: 12,
                    cursor: "pointer"
                  }}
                >
                  Login
                </button>
              </div>
            </div>
          ))}
        </div>
        <p style={{ color: subColor, fontFamily: "DM Sans", fontSize: 14, textAlign: "right" }}>
          Quick access for Help Seeker: <span onClick={() => goLogin("seeker")} style={{ color: "#22c55e", cursor: "pointer", fontWeight: 600 }}>Sign In as Help Seeker</span>
        </p>
      </div>
    </div>
  );
}

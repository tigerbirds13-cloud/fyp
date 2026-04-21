import React from 'react';

export default function FooterSection({ isDark, scrollTo, refs, showToast, goRegister, onServicesClick, onOpenPage }) {
  const bgColor = isDark ? "#0a0a0a" : "#fff";
  const borderColor = isDark ? "#1a1a1a" : "#e5e7eb";
  const titleColor = isDark ? "#fff" : "#111";
  const textColor = isDark ? "#6b7280" : "#4b5563";
  const linkColor = isDark ? "#9ca3af" : "#6b7280";

  return (
    <footer style={{ background: bgColor, borderTop: `1px solid ${borderColor}`, padding: "64px 80px 0", transition: "background 0.3s, border-color 0.3s" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr 1fr 1fr", gap: 40, paddingBottom: 56 }}>
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            <div onClick={() => scrollTo(refs.hero)} style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
              <div style={{ width: 42, height: 42, borderRadius: "50%", background: "linear-gradient(135deg,#22c55e,#16a34a)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20 }}>🏘</div>
              <span style={{ fontFamily: "Syne", fontWeight: 800, fontSize: 17, color: titleColor }}>HomeTown<span style={{ color: "#22c55e" }}>Helper</span></span>
            </div>
            <p style={{ fontFamily: "DM Sans", fontSize: 14, color: textColor, margin: 0 }}>Find, Help & Succeed</p>
            <p style={{ fontFamily: "DM Sans", fontSize: 14, color: textColor, margin: 0 }}>Made by <span style={{ color: titleColor, fontWeight: 700 }}>Aashish Bagdas</span></p>
          </div>
          {[
            { title: "Product", links: [["Features", () => onOpenPage('features')], ["Services", onServicesClick], ["Pricing", () => scrollTo(refs.pricing)], ["Testimonials", () => showToast("Testimonials coming soon!")]] },
            { title: "Social Links", links: [["Facebook", () => showToast("Opening Facebook…")], ["Instagram", () => showToast("Opening Instagram…")], ["Github", () => showToast("Opening Github…")], ["LinkedIn", () => showToast("Opening LinkedIn…")]] },
            { title: "Join Now", links: [["Help Seeker", () => goRegister("seeker")], ["Local Helper", () => goRegister("helper")]] },
            { title: "Company", links: [["About Us", () => onOpenPage('about')], ["Privacy Policy", () => onOpenPage('privacy')], ["Terms & Conditions", () => onOpenPage('terms')]] },
          ].map(col => (
            <div key={col.title}>
              <p style={{ fontFamily: 'Syne', fontWeight: 600, fontSize: 15, color: titleColor, margin: '0 0 20px' }}>{col.title}</p>
              {col.links.map(([label, fn]) => (
                <span key={label} onClick={fn} className="foot-lnk" style={{ display: "block", fontFamily: "DM Sans", fontSize: 14, color: linkColor, marginBottom: 13, cursor: "pointer", transition: "color 0.2s" }}>{label}</span>
              ))}
            </div>
          ))}
        </div>
        <div style={{ borderTop: `1px solid ${isDark ? "#1f2937" : "#e5e7eb"}`, padding: "20px 0", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <p style={{ fontFamily: "DM Sans", fontSize: 13, color: isDark ? "#4b5563" : "#94a3b8", margin: 0 }}>© 2025 HomeTownHelper. All rights reserved.</p>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            {["Privacy Policy", "Terms", "Contact"].map((l, i, arr) => (
              <span key={l} style={{ display: "flex", alignItems: "center", gap: 16 }}>
                <span onClick={() => l === "Contact" ? scrollTo(refs.contact) : onOpenPage(l === "Terms" ? 'terms' : 'privacy')} className="foot-lnk" style={{ fontFamily: "DM Sans", fontSize: 13, color: isDark ? "#4b5563" : "#94a3b8", cursor: "pointer" }}>{l}</span>
                {i < arr.length - 1 && <span style={{ color: isDark ? "#2d2d2d" : "#e5e7eb" }}>·</span>}
              </span>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}

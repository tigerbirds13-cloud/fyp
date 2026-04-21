import React from 'react';

export default function HeroSection({ isDark, heroRef, setModal }) {
  const bgColor = isDark 
    ? "radial-gradient(ellipse 70% 60% at 50% 40%, #14532d55 0%, #000 70%)" 
    : "radial-gradient(ellipse 70% 60% at 50% 40%, #22c55e11 0%, #fff 70%)";
  const circleColor = isDark ? "#22c55e22" : "#22c55e11";
  const titleColor = isDark ? "#e5e7eb" : "#0f172a";
  const pColor = isDark ? "#9ca3af" : "#475569";
  const btnColor = isDark ? "#fff" : "#111";
  const btnTxt = isDark ? "#111" : "#fff";

  return (
    <section ref={heroRef} style={{ position: "relative", minHeight: "91vh", background: bgColor, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden", transition: "background 0.3s" }}>
      <div style={{ position: "absolute", inset: 0, backgroundImage: `radial-gradient(circle, ${circleColor} 1px, transparent 1px)`, backgroundSize: "28px 28px", pointerEvents: "none" }} />
      {[["pill-tl", "22%", null, "5%", null, "✦ Full-Time"], ["pill-tr", "22%", null, null, "5%", "Remote ✦"], ["pill-bl", null, "22%", "7%", null, "✦ Freelance"], ["pill-br", null, "22%", null, "7%", "Part-Time ✦"]].map(([cls, top, bot, left, right, label]) => (
        <div key={label} className={cls} style={{ position: "absolute", ...(top && { top }), ...(bot && { bottom: bot }), ...(left && { left }), ...(right && { right }), background: "#22c55e", color: "#fff", borderRadius: 999, padding: "7px 16px", fontFamily: "DM Sans", fontWeight: 600, fontSize: 13, boxShadow: "0 4px 12px rgba(34,197,94,0.3)" }}>{label}</div>
      ))}
      <div style={{ textAlign: "center", maxWidth: 760, padding: "0 2rem", position: "relative", zIndex: 2 }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: isDark ? "#111" : "#f1fdf4", border: `1px solid ${isDark ? "#22c55e33" : "#22c55e22"}`, borderRadius: 999, padding: "5px 16px", marginBottom: 32 }}>
          <span style={{ background: "#22c55e", color: "#fff", borderRadius: 999, padding: "2px 10px", fontSize: 11, fontFamily: "DM Sans", fontWeight: 700 }}>New</span>
          <span style={{ color: isDark ? "#aaa" : "#16a34a", fontSize: 13, fontFamily: "DM Sans" }}>Discover AI-Powered Hiring and Resume Tools</span>
        </div>
        <h1 style={{ fontFamily: "Syne", fontWeight: 800, fontSize: "clamp(2.2rem,5vw,3.7rem)", lineHeight: 1.12, margin: "0 0 20px", color: titleColor, transition: "color 0.3s" }}>
          Powering Better <span style={{ color: "#22c55e" }}>Job Discovery</span> and <span style={{ color: "#22c55e" }}>Hiring</span> Worldwide
        </h1>
        <p style={{ color: pColor, fontFamily: "DM Sans", fontSize: 16, lineHeight: 1.7, margin: "0 auto 36px", maxWidth: 560, transition: "color 0.3s" }}>
          HomeTown Helper helps job seekers build resumes, find matching jobs, and track applications while employers manage postings, applicants, and company teams from one platform.
        </p>
        <button onClick={() => setModal(true)} style={{ background: btnColor, color: btnTxt, border: "none", borderRadius: 999, padding: "14px 40px", fontFamily: "Syne", fontWeight: 700, fontSize: 16, cursor: "pointer", transition: "all 0.3s" }}>
          Get Started Free →
        </button>
        <p style={{ color: isDark ? "#6b7280" : "#94a3b8", fontFamily: "DM Sans", fontSize: 12.5, marginTop: 16 }}>🕐 Free to Join &nbsp;•&nbsp; 💳 No Credit Card Required</p>
      </div>
    </section>
  );
}

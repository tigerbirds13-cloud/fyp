import React, { useState } from 'react';
import PaymentModal from './PaymentModal';

const PRICING = {
  seeker: [
    { name: "Free", desc: "Basic access to find local helpers", price: "", period: "", cta: "Start For Free", highlight: false, features: [{ t: "Browse helper profiles", on: true }, { t: "Up to 3 bookings/month", on: false }, { t: "Live chat with helpers", on: false }, { t: "Priority booking slots", on: false }, { t: "Reviews & ratings", on: false }] },
    { name: "Pro", desc: "For households needing regular help", price: "NPR 699", period: "/month", cta: "Upgrade to Pro", highlight: false, features: [{ t: "Browse helper profiles", on: true }, { t: "Up to 3 bookings/month", on: true }, { t: "Live chat with helpers", on: true }, { t: "Priority booking slots", on: false }, { t: "Reviews & ratings", on: false }] },
    { name: "Elite", desc: "Unlimited access for busy households", price: "NPR 1499", period: "/month", cta: "Upgrade to Elite", highlight: true, features: [{ t: "Browse helper profiles", on: true }, { t: "Unlimited bookings", on: true }, { t: "Live chat with helpers", on: true }, { t: "Priority booking slots", on: true }, { t: "Reviews & ratings", on: true }] },
  ],
  helper: [
    { name: "Free", desc: "Start offering your skills locally", price: "", period: "", cta: "Start For Free", highlight: false, features: [{ t: "Create helper profile", on: true }, { t: "Up to 5 job requests/month", on: false }, { t: "Visibility badge", on: false }, { t: "Verified status", on: false }, { t: "Featured in search", on: false }] },
    { name: "Pro", desc: "Grow your local client base", price: "NPR 999", period: "/month", cta: "Upgrade to Pro", highlight: false, features: [{ t: "Create helper profile", on: true }, { t: "Up to 5 job requests/month", on: true }, { t: "Visibility badge", on: true }, { t: "Verified status", on: false }, { t: "Featured in search", on: false }] },
    { name: "Elite", desc: "For professional helpers & small businesses", price: "NPR 1999", period: "/month", cta: "Upgrade to Elite", highlight: true, features: [{ t: "Create helper profile", on: true }, { t: "Unlimited job requests", on: true }, { t: "Visibility badge", on: true }, { t: "Verified status", on: true }, { t: "Featured in search", on: true }] },
  ],
};

function PricingPage({ isDark, pricingTab, setPTab, goRegister }) {
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);

  const bgColor = isDark 
    ? "radial-gradient(ellipse 80% 60% at 50% 30%, #14532d33 0%, #000 65%)" 
    : "radial-gradient(ellipse 80% 60% at 50% 30%, #22c55e11 0%, #fff 65%)";
  const textColor = isDark ? "#f9fafb" : "#0f172a";
  const pColor = isDark ? "#9ca3af" : "#475569";
  const cardBg = isDark ? "#111" : "#fff";
  const cardBorder = isDark ? "#1f2937" : "#e2e8f0";

  const handleUpgrade = (plan) => {
    if (plan.name === 'Free') {
      goRegister(pricingTab);
    } else {
      setSelectedPlan(plan);
      setShowPaymentModal(true);
    }
  };

  const showToast = (message) => {
    // Simple toast implementation - you can enhance this
    alert(message);
  };

  return (
    <section style={{ background: bgColor, padding: '80px 2rem 88px', position: 'relative', overflow: 'hidden', transition: "background 0.3s" }}>
      <div style={{ position: 'absolute', inset: 0, backgroundImage: `radial-gradient(circle, ${isDark ? "#22c55e18" : "#22c55e0a"} 1px, transparent 1px)`, backgroundSize: '28px 28px', pointerEvents: 'none' }} />
      <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 2 }}>
        <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.8rem, 4vw, 2.8rem)', color: textColor, textAlign: 'center', marginBottom: 12, transition: "color 0.3s" }}>Upgrade to Pro or Elite</h2>
        <p style={{ color: pColor, fontFamily: 'DM Sans', fontSize: 15.5, textAlign: 'center', marginBottom: 36, transition: "color 0.3s" }}>Get started and unlock more local connections.</p>
        <div style={{ display: 'flex', justifyContent: 'center', marginBottom: 48 }}>
          <div style={{ background: isDark ? '#111' : '#f3f4f6', border: `1px solid ${cardBorder}`, borderRadius: 999, padding: 4, display: 'inline-flex', gap: 4 }}>
            {["seeker", "helper"].map(t => (
              <button key={t} onClick={() => setPTab(t)} style={{ background: pricingTab === t ? (isDark ? "#fff" : "#22c55e") : "transparent", color: pricingTab === t ? (isDark ? "#111" : "#fff") : pColor, border: 'none', borderRadius: 999, padding: '8px 26px', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer', transition: "all 0.2s" }}>
                {t === "seeker" ? "Service Seeker" : "Local Helper"}
              </button>
            ))}
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit,minmax(280px,1fr))', gap: 20 }}>
          {PRICING[pricingTab].map(plan => (
            <div key={plan.name} className="price-card" style={{ background: cardBg, border: plan.highlight ? "2px solid #22c55e" : `1px solid ${cardBorder}`, borderRadius: 18, padding: '28px 26px 24px', display: 'flex', flexDirection: 'column', transition: "all 0.3s", boxShadow: isDark ? "none" : "0 4px 20px rgba(0,0,0,0.04)" }}>
              {plan.highlight && <span style={{ background: '#22c55e22', color: '#22c55e', fontFamily: 'DM Sans', fontSize: 12, fontWeight: 600, padding: '3px 12px', borderRadius: 999, width: 'fit-content', marginBottom: 12 }}>Most Popular</span>}
              <div style={{ color: isDark ? "#e5e7eb" : "#0f172a", fontFamily: 'Syne', fontWeight: 700, fontSize: 20, marginBottom: 4 }}>{plan.name}</div>
              <div style={{ color: pColor, fontFamily: 'DM Sans', fontSize: 13.5, lineHeight: 1.5, marginBottom: 16 }}>{plan.desc}</div>
              {plan.price && (
                <div style={{ display: 'flex', alignItems: 'baseline', gap: 3, marginBottom: 20 }}>
                  <span style={{ color: textColor, fontFamily: 'Syne', fontWeight: 800, fontSize: 36 }}>{plan.price}</span>
                  <span style={{ color: pColor, fontFamily: 'DM Sans', fontSize: 14 }}>{plan.period}</span>
                </div>
              )}
              <div style={{ borderTop: `1px solid ${cardBorder}`, paddingTop: 20, marginBottom: 24, flex: 1 }}>
                {plan.features.map((f, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 13 }}>
                    <span style={{ color: f.on ? "#22c55e" : (isDark ? "#374151" : "#d1d5db"), fontSize: 15, flexShrink: 0 }}>{f.on ? "✓" : "✕"}</span>
                    <span style={{ color: f.on ? (isDark ? "#e5e7eb" : "#374151") : (isDark ? "#4b5563" : "#9ca3af"), fontFamily: 'DM Sans', fontSize: 14, textDecoration: f.on ? "none" : "line-through" }}>{f.t}</span>
                  </div>
                ))}
              </div>
              <button onClick={() => handleUpgrade(plan)} style={{ background: plan.highlight ? "#22c55e" : (isDark ? "#1a1a1a" : "transparent"), color: plan.highlight ? "#fff" : (isDark ? "#e5e7eb" : "#4b5563"), border: plan.highlight ? "none" : `1px solid ${isDark ? "#374151" : "#d1d5db"}`, borderRadius: 10, padding: '13px 0', fontFamily: 'Syne', fontWeight: 700, fontSize: 14, cursor: 'pointer', width: '100%', transition: "all 0.2s" }}>{plan.cta}</button>
            </div>
          ))}
        </div>
      </div>

      {showPaymentModal && selectedPlan && (
        <PaymentModal
          isDark={isDark}
          plan={selectedPlan}
          userType={pricingTab}
          onClose={() => setShowPaymentModal(false)}
          showToast={showToast}
        />
      )}
    </section>
  );
}

export default PricingPage;

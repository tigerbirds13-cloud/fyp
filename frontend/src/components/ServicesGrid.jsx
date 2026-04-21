import React, { useState } from 'react';

export default function ServicesGrid({ isDark, servicesRef, filtered, activeTab, setActiveTab, showToast, isLoggedIn, onRequireLogin, setSearch, setActiveCat, setLocFilter, selectedService, setSelectedService }) {
  const bgColor = isDark ? "#000" : "#f1f5f9";
  const tabActiveColor = "#22c55e";
  const tabInactiveColor = isDark ? "#64748b" : "#64748b";
  const cardBg = isDark ? "#111" : "#fff";
  const cardBorder = isDark ? "#1f2937" : "#e2e8f0";

  const [expandedCards, setExpandedCards] = useState(new Set());

  const toggleCardExpansion = (serviceId) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(serviceId)) {
      newExpanded.delete(serviceId);
    } else {
      newExpanded.add(serviceId);
    }
    setExpandedCards(newExpanded);
  };

  const handleConfirmBooking = (service) => {
    if (!isLoggedIn && onRequireLogin && !onRequireLogin()) {
      return;
    }
    const actionText = service.isService ? 'Booking request sent' : 'Application submitted';
    const itemType = service.isService ? 'service' : 'job';
    showToast(`${actionText} to ${service.name}! Help seeker and ${itemType} poster can message after confirmation. ✓`);
  };

  return (
    <section ref={servicesRef} style={{ background: bgColor, padding: "0 2rem 72px", transition: "background 0.3s" }}>
      <div style={{ maxWidth: 1200, margin: "0 auto" }}>
        <div style={{ display: "flex", borderBottom: `1.5px solid ${isDark ? "#1f2937" : "#e2e8f0"}`, marginBottom: 32 }}>
          {["Services By Helper", "Services By Category", "Services By Location"].map((tab, i) => {
            const active = activeTab === i;
            return (
              <button 
                key={tab} 
                className="tab-btn" 
                onClick={() => setActiveTab(i)} 
                style={{ background: "none", border: "none", borderBottom: active ? `2.5px solid ${tabActiveColor}` : "2.5px solid transparent", marginBottom: -1.5, padding: "14px 28px", fontFamily: "Syne", fontWeight: active ? 700 : 500, fontSize: 14, color: active ? tabActiveColor : tabInactiveColor, cursor: "pointer", transition: "all 0.2s" }}
              >
                {tab}
              </button>
            );
          })}
        </div>
        {filtered.length === 0
          ? <div style={{ textAlign: "center", padding: "48px", color: isDark ? "#4b5563" : "#94a3b8", fontFamily: "DM Sans", fontSize: 15 }}>No helpers found. Try a different search or filter. <span onClick={() => { setSearch(""); setActiveCat("All"); setLocFilter("All Locations"); }} style={{ color: "#22c55e", cursor: "pointer", fontWeight: 600 }}>Clear filters</span></div>
          : <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill,minmax(250px,1fr))", gap: 16 }}>
            {filtered.map(s => (
              <div key={s.id} className="svc-card" style={{ background: cardBg, border: `1.5px solid ${cardBorder}`, borderRadius: 14, padding: "18px", cursor: "pointer", transition: "all 0.3s" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 10 }}>
                  <div style={{ width: 44, height: 44, borderRadius: "50%", background: s.color + "22", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "Syne", fontWeight: 700, fontSize: 13, color: s.color, flexShrink: 0 }}>{s.avatar}</div>
                  <div>
                    <div style={{ color: isDark ? "#f3f4f6" : "#0f172a", fontFamily: "Syne", fontWeight: 700, fontSize: 14 }}>{s.name}</div>
                    <div style={{ color: "#16a34a", fontFamily: "DM Sans", fontSize: 12.5, fontWeight: 600 }}>{s.role}</div>
                  </div>
                </div>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <span style={{ fontFamily: "DM Sans", fontSize: 12, color: isDark ? "#94a3b8" : "#64748b" }}>📍 {s.location}</span>
                  <span style={{ fontFamily: "DM Sans", fontSize: 12, color: "#f59e0b" }}>★ {s.rating} · {s.jobs} jobs</span>
                </div>
                <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 12 }}>
                  {s.isService && <span style={{ background: "#22c55e33", color: "#22c55e", border: "1px solid #22c55e33", borderRadius: 999, padding: "2px 8px", fontFamily: "DM Sans", fontSize: 11.5 }}>◦ Service</span>}
                  {!s.isService && <span style={{ background: "#3b82f633", color: "#3b82f6", border: "1px solid #3b82f633", borderRadius: 999, padding: "2px 8px", fontFamily: "DM Sans", fontSize: 11.5 }}>◦ Job</span>}
                  {s.tags.map(t => <span key={t} style={{ background: isDark ? "#14532d33" : "#f0fdf4", color: isDark ? "#22c55e" : "#15803d", border: `1px solid ${isDark ? "#22c55e33" : "#bbf7d0"}`, borderRadius: 999, padding: "2px 10px", fontFamily: "DM Sans", fontSize: 11.5 }}>◦ {t}</span>)}
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button className="detail-btn" onClick={() => setSelectedService(s)} style={{ flex: 1, background: "transparent", color: isDark ? "#94a3b8" : "#64748b", border: `1px solid ${isDark ? "#374151" : "#d1d5db"}`, borderRadius: 8, padding: "9px 0", fontFamily: "Syne", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>View Detail</button>
                  <button className="book-btn" onClick={() => toggleCardExpansion(s.id)} style={{ flex: 1, background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontFamily: "Syne", fontWeight: 700, fontSize: 13, cursor: "pointer" }}>
                    {expandedCards.has(s.id) ? "Hide Details" : (s.isService ? "Book Now" : "Apply Now")}
                  </button>
                </div>

                {expandedCards.has(s.id) && (
                  <div style={{ marginTop: 16, padding: 16, background: isDark ? "#1a1a1a" : "#f8fafc", borderRadius: 12, border: `1px solid ${isDark ? "#2a2a2a" : "#e2e8f0"}` }}>
                    <h4 style={{ color: isDark ? "#f3f4f6" : "#0f172a", fontFamily: "Syne", fontWeight: 700, fontSize: 16, margin: "0 0 12px" }}>{s.isService ? "Service Details" : "Job Posting Details"}</h4>
                    
                    <div style={{ display: "flex", flexDirection: "column", gap: 12, marginBottom: 16 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: isDark ? "#9ca3af" : "#64748b", fontFamily: "DM Sans", fontSize: 14 }}>{s.isService ? "Service" : "Title"}:</span>
                        <span style={{ color: isDark ? "#f3f4f6" : "#0f172a", fontFamily: "DM Sans", fontSize: 14, fontWeight: 600 }}>{s.role}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: isDark ? "#9ca3af" : "#64748b", fontFamily: "DM Sans", fontSize: 14 }}>Location:</span>
                        <span style={{ color: isDark ? "#f3f4f6" : "#0f172a", fontFamily: "DM Sans", fontSize: 14, fontWeight: 600 }}>{s.location}</span>
                      </div>
                      {s.isService && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: isDark ? "#9ca3af" : "#64748b", fontFamily: "DM Sans", fontSize: 14 }}>Price:</span>
                            <span style={{ color: "#f59e0b", fontFamily: "DM Sans", fontSize: 14, fontWeight: 600 }}>{s.originalData?.pay || 'Contact for price'}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: isDark ? "#9ca3af" : "#64748b", fontFamily: "DM Sans", fontSize: 14 }}>Duration:</span>
                            <span style={{ color: isDark ? "#f3f4f6" : "#0f172a", fontFamily: "DM Sans", fontSize: 14, fontWeight: 600 }}>{s.originalData?.duration || '1 hour'}</span>
                          </div>
                        </>
                      )}
                      {!s.isService && (
                        <>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: isDark ? "#9ca3af" : "#64748b", fontFamily: "DM Sans", fontSize: 14 }}>Pay:</span>
                            <span style={{ color: "#f59e0b", fontFamily: "DM Sans", fontSize: 14, fontWeight: 600 }}>{s.originalData?.pay || 'Negotiable'}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: isDark ? "#9ca3af" : "#64748b", fontFamily: "DM Sans", fontSize: 14 }}>Job Type:</span>
                            <span style={{ color: isDark ? "#f3f4f6" : "#0f172a", fontFamily: "DM Sans", fontSize: 14, fontWeight: 600 }}>{s.originalData?.jobType || 'Full-time'}</span>
                          </div>
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                            <span style={{ color: isDark ? "#9ca3af" : "#64748b", fontFamily: "DM Sans", fontSize: 14 }}>Work Type:</span>
                            <span style={{ color: isDark ? "#f3f4f6" : "#0f172a", fontFamily: "DM Sans", fontSize: 14, fontWeight: 600 }}>{s.originalData?.workType || 'On-site'}</span>
                          </div>
                        </>
                      )}
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: isDark ? "#9ca3af" : "#64748b", fontFamily: "DM Sans", fontSize: 14 }}>Rating:</span>
                        <span style={{ color: "#f59e0b", fontFamily: "DM Sans", fontSize: 14, fontWeight: 600 }}>★ {s.rating}</span>
                      </div>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                        <span style={{ color: isDark ? "#9ca3af" : "#64748b", fontFamily: "DM Sans", fontSize: 14 }}>Experience:</span>
                        <span style={{ color: isDark ? "#f3f4f6" : "#0f172a", fontFamily: "DM Sans", fontSize: 14, fontWeight: 600 }}>{s.jobs} {s.isService ? 'services completed' : 'jobs posted'}</span>
                      </div>
                    </div>

                    <div style={{ marginBottom: 16 }}>
                      <h5 style={{ color: isDark ? "#f3f4f6" : "#0f172a", fontFamily: "Syne", fontWeight: 600, fontSize: 14, margin: "0 0 8px" }}>Contact Information</h5>
                      <div style={{ background: isDark ? "#111" : "#fff", borderRadius: 8, padding: 12 }}>
                        <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
                          <span style={{ fontSize: 16 }}>📧</span>
                          <span style={{ color: isDark ? "#e5e7eb" : "#374151", fontFamily: "DM Sans", fontSize: 13 }}>{s.originalData?.provider?.email || 'Contact via app'}</span>
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                          <span style={{ fontSize: 16 }}>📱</span>
                          <span style={{ color: isDark ? "#e5e7eb" : "#374151", fontFamily: "DM Sans", fontSize: 13 }}>Available upon confirmation</span>
                        </div>
                      </div>
                    </div>

                    <button 
                      onClick={() => handleConfirmBooking(s)} 
                      style={{ width: "100%", background: "#22c55e", color: "#fff", border: "none", borderRadius: 8, padding: "12px 0", fontFamily: "Syne", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
                    >
                      {s.isService ? "Confirm Booking" : "Submit Application"}
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        }
      </div>
    </section>
  );
}

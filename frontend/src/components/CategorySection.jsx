import React from 'react';

const SKILL_CATEGORIES = [
  { name: "Home Repair", count: "120+", icon: "M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6" },
  { name: "Real Estate", count: "80+", icon: "M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" },
  { name: "Cooking", count: "95+", icon: "M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" },
  { name: "Transport", count: "60+", icon: "M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0zM13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10l1 1h1m8-1V8l3 4m0 4h.01M6 16h8" },
  { name: "Tutoring", count: "150+", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
  { name: "Cleaning", count: "75+", icon: "M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" },
  { name: "Medical Help", count: "40+", icon: "M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" },
  { name: "Freelance", count: "200+", icon: "M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a1 1 0 01-1-1V5a1 1 0 011-1h16a1 1 0 011 1v11a1 1 0 01-1 1h-1" },
  { name: "Delivery", count: "110+", icon: "M12 19l9 2-9-18-9 18 9-2zm0 0v-8" },
  { name: "Engineering", count: "55+", icon: "M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z M15 12a3 3 0 11-6 0 3 3 0 016 0z" },
];

function CategorySection({ isDark, activeCat, setActiveCat, catPage, setCatPage, scrollToServices, mergedWithSearch = false }) {
  const bgColor = mergedWithSearch
    ? (isDark ? "#0f172a" : "#f8fafc")
    : (isDark ? "#000" : "#fff");
  const titleColor = isDark ? "#f9fafb" : "#0f172a";
  const pColor = isDark ? "#94a3b8" : "#64748b";
  const cardBg = isDark ? "#111" : "#f0f4ff";
  const cardActiveBg = "linear-gradient(135deg, #3b5bfc, #5b7fff)";
  const totalCatPages = Math.ceil(SKILL_CATEGORIES.length / 10);
  const visibleCats = mergedWithSearch
    ? SKILL_CATEGORIES
    : SKILL_CATEGORIES.slice(catPage * 10, catPage * 10 + 10);

  return (
    <section style={{ background: bgColor, padding: mergedWithSearch ? '8px 2rem 56px' : '56px 2rem', transition: "background 0.3s" }}>
      <div style={{ maxWidth: 1200, margin: '0 auto' }}>
        {!mergedWithSearch && (
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 32 }}>
            <div>
              <h2 style={{ fontFamily: 'Syne', fontWeight: 800, fontSize: 'clamp(1.4rem,3vw,2rem)', color: titleColor, margin: '0 0 6px', transition: "color 0.3s" }}>Find Help By Category</h2>
              <p style={{ color: pColor, fontFamily: 'DM Sans', fontSize: 14, margin: 0, transition: "color 0.3s" }}>Get inspired from 500+ local skills</p>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <button aria-label="Previous category page" onClick={() => setCatPage(p => Math.max(0, p - 1))} style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${isDark ? "#333" : "#d1d5db"}`, background: isDark ? "#111" : "#fff", color: isDark ? "#fff" : "#111", cursor: 'pointer', fontSize: 15 }}>←</button>
              <div style={{ display: 'flex', gap: 5 }}>
                {Array.from({ length: totalCatPages }).map((_, i) => (
                  <button key={i} aria-label={`Go to category page ${i + 1}`} onClick={() => setCatPage(i)} style={{ width: i === catPage ? 20 : 7, height: 7, borderRadius: 999, background: i === catPage ? '#22c55e' : (isDark ? "#333" : "#d1d5db"), cursor: 'pointer', border: 'none', padding: 0 }} />
                ))}
              </div>
              <button aria-label="Next category page" onClick={() => setCatPage(p => Math.min(totalCatPages - 1, p + 1))} style={{ width: 36, height: 36, borderRadius: '50%', border: `1.5px solid ${isDark ? "#333" : "#d1d5db"}`, background: isDark ? "#111" : "#fff", color: isDark ? "#fff" : "#111", cursor: 'pointer', fontSize: 15 }}>→</button>
            </div>
          </div>
        )}
        <div style={{ display: 'grid', gridTemplateColumns: mergedWithSearch ? 'repeat(auto-fit,minmax(170px,1fr))' : 'repeat(5,minmax(0,1fr))', gap: 14 }}>
          {visibleCats.map(cat => {
            const active = activeCat === cat.name;
            return (
              <button
                key={cat.name}
                type="button"
                aria-pressed={active}
                onClick={() => { setActiveCat(cat.name); setTimeout(scrollToServices, 100); }}
                style={{ background: active ? cardActiveBg : cardBg, border: isDark && !active ? "1px solid #1f2937" : "none", borderRadius: 18, padding: '24px 18px 20px', cursor: 'pointer', display: 'flex', flexDirection: 'column', minHeight: mergedWithSearch ? 165 : (active ? 200 : 180), transition: "all 0.3s ease", textAlign: 'left' }}
              >
                <div style={{ width: 56, height: 56, borderRadius: '50%', background: active ? 'rgba(255,255,255,0.22)' : (isDark ? '#1e293b' : '#e8eeff'), display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 'auto' }}>
                  <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke={active ? "#fff" : "#3b5bfc"} strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"><path d={cat.icon} /></svg>
                </div>
                <div style={{ marginTop: 28 }}>
                  <div style={{ fontFamily: 'Syne', fontWeight: 700, fontSize: 14.5, color: active ? '#fff' : (isDark ? "#fff" : '#0f172a'), marginBottom: 4 }}>{cat.name}</div>
                  <div style={{ fontFamily: 'DM Sans', fontSize: 12.5, color: active ? 'rgba(255,255,255,0.8)' : (isDark ? "#94a3b8" : '#94a3b8') }}>{cat.count} helpers</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </section>
  );
}

export default CategorySection;

import React, { useState } from 'react';

const servicesData = [
  {
    id: 1,
    company: "CleanNest",
    companyLogo: "CN",
    title: "House Cleaner",
    workType: "On-site",
    jobType: "Full-time",
    pay: "NPR 800 / per visit",
    location: "Pokhara",
    applicants: 3,
    status: "Active",
    urgent: false,
    category: "Cleaning",
    color: "#22c55e"
  },
  {
    id: 2,
    company: "Meal Mate",
    companyLogo: "MM",
    title: "Home Cook",
    workType: "On-site",
    jobType: "Part-time",
    pay: "NPR 15K - NPR 25K / month",
    location: "Kathmandu",
    applicants: 0,
    status: "Active",
    urgent: false,
    category: "Cooking",
    color: "#ea580c"
  },
  {
    id: 3,
    company: "QuickMove",
    companyLogo: "QM",
    title: "Delivery Rider",
    workType: "On-site",
    jobType: "Full-time",
    pay: "upto NPR 20K / month",
    location: "Pokhara",
    applicants: 1,
    status: "Expired",
    urgent: false,
    category: "Delivery",
    color: "#3b82f6"
  },
  {
    id: 4,
    company: "FitZone",
    companyLogo: "FZ",
    title: "Fitness Trainer",
    workType: "On-site",
    jobType: "Temporary",
    pay: "upto NPR 30K / month",
    location: "Lalitpur",
    applicants: 0,
    status: "Expired",
    urgent: true,
    category: "Fitness",
    color: "#8b5cf6"
  },
  {
    id: 5,
    company: "PixelCraft",
    companyLogo: "PC",
    title: "Graphic Designer",
    workType: "Remote",
    jobType: "Full-time",
    pay: "NPR 40K / month",
    location: "Remote",
    applicants: 2,
    status: "Expired",
    urgent: true,
    category: "Design",
    color: "#f59e0b"
  },
  {
    id: 6,
    company: "CareHome",
    companyLogo: "CH",
    title: "Registered Nurse",
    workType: "On-site",
    jobType: "Internship",
    pay: "from NPR 500 / per hour",
    location: "Biratnagar",
    applicants: 1,
    status: "Expired",
    urgent: false,
    category: "Healthcare",
    color: "#ec4899"
  }
];

const ServiceListings = () => {
  const [filter, setFilter] = useState("All");
  const [toast, setToast] = useState("");

  const showToast = (msg) => {
    setToast(msg);
    setTimeout(() => setToast(""), 2500);
  };

  const filteredServices = servicesData.filter(service => {
    if (filter === "All") return true;
    if (filter === "Urgent") return service.urgent;
    return service.status === filter;
  });

  const MoneyIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="5" width="20" height="14" rx="2" ry="2"/>
      <line x1="2" y1="10" x2="22" y2="10"/>
    </svg>
  );

  const LocationIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
      <circle cx="12" cy="10" r="3"/>
    </svg>
  );

  const PeopleIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/>
      <circle cx="9" cy="7" r="4"/>
      <path d="M22 21v-2a4 4 0 0 0-3-3.87"/>
      <path d="M16 3.13a4 4 0 0 1 0 7.75"/>
    </svg>
  );

  const CalendarIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="4" width="18" height="18" rx="2" ry="2"/>
      <line x1="16" y1="2" x2="16" y2="6"/>
      <line x1="8" y1="2" x2="8" y2="6"/>
      <line x1="3" y1="10" x2="21" y2="10"/>
    </svg>
  );

  const EyeIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
      <circle cx="12" cy="12" r="3"/>
    </svg>
  );

  return (
    <div style={{ background: "#111", padding: "40px 20px", fontFamily: "'DM Sans', sans-serif" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;700&family=DM+Sans:wght@400;500;700&display=swap');
        .service-card {
          background: #1a1a1a;
          border: 1px solid #2a2a2a;
          border-radius: 16px;
          padding: 24px;
          position: relative;
          overflow: visible;
          transition: transform 0.3s ease, border-color 0.3s ease;
        }
        .service-card:hover {
          transform: translateY(-4px);
          border-color: #22c55e33;
        }
        .urgent-badge {
          position: absolute;
          top: -14px;
          left: 50%;
          transform: translateX(-50%);
          background: #ef4444;
          color: white;
          padding: 4px 12px;
          border-radius: 999px;
          font-size: 12px;
          font-weight: 600;
          display: flex;
          align-items: center;
          gap: 4px;
          animation: pulse 2s infinite;
        }
        @keyframes pulse {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.7; }
        }
        .tag-badge {
          background: #3d1a0a;
          color: #ea580c;
          border-radius: 999px;
          padding: 5px 14px;
          font-size: 13px;
          font-weight: 500;
        }
        .detail-row {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 12px;
        }
        .detail-text {
          font-size: 14px;
          color: white;
        }
        .apply-btn {
          background: #ea580c;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 24px;
          font-family: 'Syne', sans-serif;
          font-weight: 700;
          cursor: pointer;
          transition: opacity 0.3s ease;
        }
        .apply-btn:hover {
          opacity: 0.88;
        }
        .view-btn {
          background: #2a2a2a;
          color: white;
          border: none;
          border-radius: 10px;
          padding: 10px 24px;
          font-family: 'DM Sans', sans-serif;
          cursor: pointer;
          display: flex;
          align-items: center;
          gap: 8px;
          transition: background 0.3s ease;
        }
        .view-btn:hover {
          background: #333;
        }
        .toast {
          position: fixed;
          bottom: 20px;
          left: 50%;
          transform: translateX(-50%);
          background: #22c55e;
          color: white;
          padding: 12px 24px;
          border-radius: 999px;
          font-weight: 600;
          z-index: 1000;
          animation: slideUp 0.3s ease;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateX(-50%) translateY(20px); }
          to { opacity: 1; transform: translateX(-50%) translateY(0); }
        }
      `}</style>

      {/* Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 40 }}>
        <div>
          <h2 style={{ color: "white", fontFamily: "'Syne', sans-serif", fontSize: 28, fontWeight: 700, margin: 0 }}>Browse Available Services</h2>
          <p style={{ color: "#9ca3af", fontSize: 16, margin: "8px 0 0" }}>Find the right local help for your needs</p>
        </div>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            background: "#1a1a1a",
            color: "white",
            border: "1px solid #2a2a2a",
            borderRadius: 8,
            padding: "10px 16px",
            fontSize: 14,
            outline: "none"
          }}
        >
          <option value="All">All</option>
          <option value="Active">Active</option>
          <option value="Expired">Expired</option>
          <option value="Urgent">Urgent</option>
        </select>
      </div>

      {/* Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 20 }}>
        {filteredServices.length > 0 ? (
          filteredServices.map(service => (
            <div key={service.id} className="service-card">
              {service.urgent && (
                <div className="urgent-badge">
                  ⚠ Urgent
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 16 }}>
                <div style={{
                  width: 60,
                  height: 60,
                  borderRadius: "50%",
                  background: service.color,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontSize: 20,
                  fontWeight: 700,
                  color: "white"
                }}>
                  {service.companyLogo}
                </div>
                <div>
                  <div style={{ color: "#9ca3af", fontSize: 13, fontFamily: "'DM Sans', sans-serif" }}>{service.company}</div>
                  <div style={{ color: "white", fontSize: 18, fontWeight: 700, fontFamily: "'Syne', sans-serif" }}>{service.title}</div>
                </div>
              </div>
              <hr style={{ border: "none", borderTop: "1px solid #2a2a2a", marginBottom: 16 }} />
              <div style={{ display: "flex", gap: 8, marginBottom: 20 }}>
                <span className="tag-badge">{service.workType}</span>
                <span className="tag-badge">{service.jobType}</span>
              </div>
              <div>
                <div className="detail-row">
                  <MoneyIcon />
                  <span className="detail-text">{service.pay}</span>
                </div>
                <div className="detail-row">
                  <LocationIcon />
                  <span className="detail-text">{service.location}</span>
                </div>
                <div className="detail-row">
                  <PeopleIcon />
                  <span className="detail-text">{service.applicants} applicants</span>
                </div>
                <div className="detail-row">
                  <CalendarIcon />
                  <span className="detail-text" style={{ color: service.status === "Active" ? "#22c55e" : "#6b7280" }}>{service.status}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 12, marginTop: 24 }}>
                <button
                  className="apply-btn"
                  onClick={() => showToast(`Applied to ${service.title} at ${service.company}!`)}
                >
                  Apply Now
                </button>
                <button
                  className="view-btn"
                  onClick={() => showToast(`Viewing ${service.title} details`)}
                >
                  <EyeIcon />
                  View More
                </button>
              </div>
            </div>
          ))
        ) : (
          <div style={{ gridColumn: "1 / -1", textAlign: "center", color: "#9ca3af", padding: 40 }}>
            No services match the selected filter.
          </div>
        )}
      </div>

      {/* Toast */}
      {toast && <div className="toast">{toast}</div>}
    </div>
  );
};

export { ServiceListings };
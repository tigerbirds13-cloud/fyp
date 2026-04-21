import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function PrivacyPolicyPage({ isDark }) {
  const [expanded, setExpanded] = useState({});

  const bgColor = isDark ? "#0a0e27" : "#ffffff";
  const textColor = isDark ? "#e0e7ff" : "#1f2937";
  const sectionBg = isDark ? "#111827" : "#f9fafb";
  const borderColor = isDark ? "#374151" : "#e5e7eb";
  const accentColor = "#22c55e";

  const sections = [
    {
      id: "intro",
      title: "1. Introduction",
      content: `This Privacy Policy explains how HomeTown Helper ("we," "us," "our," or "Company") collects, uses, discloses, and otherwise processes personal information in connection with our website and mobile applications (collectively, the "Service"). We are committed to protecting your privacy and ensuring you have a positive experience.`,
    },
    {
      id: "information",
      title: "2. Information We Collect",
      content: `We collect information you provide directly to us, such as:
• Account information: name, email address, phone number, date of birth
• Address and location data: city, region, postal code, country
• Payment information: processed securely by Khalti (we do not store card details)
• Profile information: skills, experience, certifications, reviews, ratings
• Communication: messages, support tickets, feedback
• Device information: IP address, browser type, operating system, device identifiers
• Usage data: pages visited, time spent, searches, bookings made`,
    },
    {
      id: "use",
      title: "3. How We Use Your Information",
      content: `We use your information to:
• Provide, maintain, and improve our Service
• Process payments and send transaction notifications
• Send transactional and promotional communications
• Verify your identity and prevent fraud
• Comply with legal obligations and law enforcement requests
• Analyze trends and user behavior to improve our platform
• Create aggregated, anonymized data for research and analytics
• Respond to your inquiries and customer support requests`,
    },
    {
      id: "sharing",
      title: "4. Information Sharing",
      content: `We may share your information with:
• Service providers: Khalti (payments), email services, hosting providers
• Business partners: only with your explicit consent
• Legal authorities: when required by law or to protect rights
• Other users: your profile (if public), reviews, and booking information
We do NOT sell your personal data to third parties.`,
    },
    {
      id: "retention",
      title: "5. Data Retention",
      content: `We retain your personal information for as long as:
• Your account is active
• Necessary to provide the Service
• Required by law or for legal proceedings
After account deletion, we retain some data (transactions, legal records) for 7 years as required by law.
You can request deletion of your data at any time.`,
    },
    {
      id: "rights",
      title: "6. Your Rights & Choices",
      content: `Depending on your location, you may have rights including:
• Right to Access: Request a copy of your personal data
• Right to Rectification: Correct inaccurate information
• Right to Deletion: Request we delete your data ("Right to be Forgotten")
• Right to Data Portability: Receive your data in portable format
• Right to Opt-out: Unsubscribe from marketing communications
• Right to Withdraw Consent: Withdraw consent at any time
To exercise these rights, contact us at privacy@hometownhelper.com`,
    },
    {
      id: "security",
      title: "7. Data Security",
      content: `We implement industry-standard security measures including:
• Encryption of data in transit (HTTPS/TLS)
• Encrypted storage of sensitive information
• Regular security audits and penetration testing
• Access controls and authentication mechanisms
• Employee training on data protection
However, no security system is impenetrable. We cannot guarantee absolute security.`,
    },
    {
      id: "cookies",
      title: "8. Cookies & Tracking",
      content: `We use cookies and similar technologies for:
• Authentication and session management
• Remembering user preferences
• Analytics and performance monitoring
• Marketing and retargeting (third-party cookies)
You can control cookies through your browser settings. Disabling cookies may affect Service functionality.`,
    },
    {
      id: "gdpr",
      title: "9. GDPR & International Privacy Laws",
      content: `If you are in the EU/EEA, your data is protected under GDPR. If you are in Nepal, your data is protected under Nepal's privacy laws. 
If you believe we've violated your privacy rights, you can lodge a complaint with your local data protection authority.`,
    },
    {
      id: "contact",
      title: "10. Contact Us",
      content: `For privacy inquiries, please contact:
Email: privacy@hometownhelper.com
Address: New Baneshwor, Kathmandu, Nepal
Response time: We aim to respond within 30 days.`,
    },
  ];

  const toggleSection = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    // Expand first section by default
    setExpanded({ intro: true });
  }, []);

  return (
    <div
      style={{
        minHeight: "100vh",
        background: bgColor,
        color: textColor,
        fontFamily: "'DM Sans', sans-serif",
      }}
    >
      {/* Header */}
      <div
        style={{
          background: isDark ? "#111827" : "#f3f4f6",
          padding: "64px 32px",
          textAlign: "center",
          borderBottom: `1px solid ${borderColor}`,
        }}
      >
        <h1
          style={{
            fontSize: 48,
            fontWeight: 800,
            margin: 0,
            fontFamily: "'Syne', sans-serif",
          }}
        >
          Privacy Policy
        </h1>
        <p
          style={{
            fontSize: 16,
            color: isDark ? "#9ca3af" : "#6b7280",
            margin: "16px 0 0",
            maxWidth: 600,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Last updated:{" "}
          {new Date().toLocaleDateString("en-US", {
            year: "numeric",
            month: "long",
            day: "numeric",
          })}
        </p>
      </div>

      {/* Content */}
      <div
        style={{ maxWidth: 900, margin: "0 auto", padding: "48px 32px 64px" }}
      >
        {sections.map((section, idx) => (
          <div key={section.id} style={{ marginBottom: 24 }}>
            <button
              onClick={() => toggleSection(section.id)}
              style={{
                width: "100%",
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
                padding: "20px",
                background: sectionBg,
                border: `1px solid ${borderColor}`,
                borderRadius: 12,
                cursor: "pointer",
                fontSize: 18,
                fontWeight: 700,
                color: textColor,
                transition: "all 0.3s ease",
              }}
              onMouseOver={(e) => (e.target.style.borderColor = accentColor)}
              onMouseOut={(e) => (e.target.style.borderColor = borderColor)}
            >
              {section.title}
              <ChevronUp
                size={24}
                style={{
                  transition: "transform 0.3s ease",
                  transform: expanded[section.id]
                    ? "rotate(0deg)"
                    : "rotate(180deg)",
                  color: accentColor,
                }}
              />
            </button>

            {expanded[section.id] && (
              <div
                style={{
                  padding: "24px 20px",
                  background: sectionBg,
                  borderLeft: `1px solid ${borderColor}`,
                  borderRight: `1px solid ${borderColor}`,
                  borderBottom: `1px solid ${borderColor}`,
                  borderBottomLeftRadius: 12,
                  borderBottomRightRadius: 12,
                  whiteSpace: "pre-wrap",
                  lineHeight: 1.8,
                  fontSize: 15,
                  color: isDark ? "#d1d5db" : "#4b5563",
                }}
              >
                {section.content}
              </div>
            )}
          </div>
        ))}

        {/* Footer CTA */}
        <div
          style={{
            marginTop: 64,
            padding: 32,
            background: sectionBg,
            borderRadius: 16,
            border: `2px solid ${accentColor}`,
            textAlign: "center",
          }}
        >
          <h3 style={{ fontSize: 24, fontWeight: 700, margin: "0 0 12px" }}>
            Questions?
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              color: isDark ? "#9ca3af" : "#6b7280",
            }}
          >
            Contact our Privacy Team for any concerns or data requests
          </p>
          <a
            href="mailto:privacy@hometownhelper.com"
            style={{
              display: "inline-block",
              padding: "12px 32px",
              background: accentColor,
              color: "#ffffff",
              borderRadius: 8,
              textDecoration: "none",
              fontWeight: 700,
              transition: "opacity 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            Email Privacy Team
          </a>
        </div>
      </div>
    </div>
  );
}

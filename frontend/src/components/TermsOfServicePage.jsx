import React, { useState, useEffect } from "react";
import { ChevronUp } from "lucide-react";

export default function TermsOfServicePage({ isDark }) {
  const [expanded, setExpanded] = useState({});

  const bgColor = isDark ? "#0a0e27" : "#ffffff";
  const textColor = isDark ? "#e0e7ff" : "#1f2937";
  const sectionBg = isDark ? "#111827" : "#f9fafb";
  const borderColor = isDark ? "#374151" : "#e5e7eb";
  const accentColor = "#f97316"; // orange for ToS

  const sections = [
    {
      id: "agreement",
      title: "1. Agreement to Terms",
      content: `By accessing and using HomeTown Helper ("Service"), you agree to be bound by these Terms of Service. If you do not agree to these terms, please do not use our Service.

These terms are subject to change. We will notify users of significant changes via email. Your continued use constitutes acceptance of updated terms.`,
    },
    {
      id: "eligibility",
      title: "2. Eligibility",
      content: `You must be at least 18 years old to use this Service. By registering, you represent that:
• You are of legal age
• You have the authority to enter into this agreement
• All information you provide is accurate and truthful
• You are not restricted from using the Service by law or court order
• You will comply with all applicable laws and regulations`,
    },
    {
      id: "accounts",
      title: "3. User Accounts & Conduct",
      content: `You are responsible for:
• Maintaining confidentiality of your account credentials
• All activity under your account
• Notifying us immediately of unauthorized access

Prohibited conduct includes:
• Impersonation or misrepresentation
• Harassment, abuse, or threatening language
• Illegal activities or fraud
• Intellectual property infringement
• Violating others' privacy or rights
• Spamming or malicious software
• Circumventing security measures

We reserve the right to suspend or terminate accounts for violations.`,
    },
    {
      id: "payments",
      title: "4. Payments & Billing",
      content: `• Payment is processed through Khalti, a third-party payment processor
• You authorize us to charge the payment method you provide
• Prices may change with 30 days' notice
• All sales are final unless otherwise stated
• We are not responsible for Khalti service interruptions
• Refunds are processed within 30 days
• For subscription services, charges recur automatically until cancellation`,
    },
    {
      id: "subscriptions",
      title: "5. Subscriptions",
      content: `• Subscriptions renew automatically on the billing date
• You can cancel anytime (no early termination fees)
• Cancellation takes effect at the end of the current billing period
• Partial refunds are not provided for early cancellation
• We may suspend service for non-payment
• Price changes apply at renewal; we'll notify you in advance`,
    },
    {
      id: "intellectualproperty",
      title: "6. Intellectual Property Rights",
      content: `• HomeTown Helper and its content are owned by or licensed to us
• You may not reproduce, distribute, or modify our content without permission
• User-generated content (reviews, messages) remains your property
• You grant us a license to display and distribute your content
• You warrant you own or have rights to all content you provide
• Unauthorized use of our trademarks or intellectual property is prohibited`,
    },
    {
      id: "servicewarranty",
      title: '7. Service "As-Is" Disclaimer',
      content: `THE SERVICE IS PROVIDED "AS-IS" AND "AS AVAILABLE" WITHOUT WARRANTIES OF ANY KIND.

We disclaim all warranties including:
• Merchantability or fitness for particular purpose
• Uninterrupted or error-free service
• Compatibility with devices or systems
• Accuracy or completeness of content

We do not guarantee:
• Quality of services provided by helpers/seekers
• Safety or legality of transactions
• Resolution of disputes between users
• Specific results or outcomes`,
    },
    {
      id: "limitation",
      title: "8. Limitation of Liability",
      content: `TO THE MAXIMUM EXTENT ALLOWED BY LAW:

• We are not liable for indirect, incidental, or consequential damages
• Our total liability is limited to amounts paid in the last 12 months
• We are not liable for:
  - Third-party services (Khalti, email providers)
  - User conduct or content
  - Data loss or corruption
  - Security breaches despite reasonable precautions
  - Service interruptions or downtime
  - Personal injury or property damage`,
    },
    {
      id: "disputes",
      title: "9. Dispute Resolution",
      content: `In case of disputes:
1. First, attempt to resolve directly with the other party
2. Contact support@hometownhelper.com with details
3. We will attempt mediation within 30 days
4. If unresolved, disputes proceed to arbitration
5. Arbitration is binding and governed by Nepal law
6. Class action waivers apply

Each party bears its own legal costs unless otherwise determined by arbitrator.`,
    },
    {
      id: "indemnification",
      title: "10. Indemnification",
      content: `You agree to indemnify and hold harmless HomeTown Helper from:
• Claims arising from your use of the Service
• Your violation of these terms
• Your violation of third-party rights
• Your content or user submissions
• Your disputes with other users

This includes all costs, damages, and reasonable attorney fees.`,
    },
    {
      id: "governing",
      title: "11. Governing Law",
      content: `• These terms are governed by the laws of Nepal
• Any legal action must be filed in courts of Kathmandu
• You consent to jurisdiction of Nepal courts
• This agreement is enforceable under Nepal law`,
    },
    {
      id: "severable",
      title: "12. Severability",
      content: `If any provision is found invalid or unenforceable:
• That provision is severed
• Remaining provisions remain in effect
• We may modify the invalid provision to make it valid
• This does not affect the enforceability of other terms`,
    },
    {
      id: "termination",
      title: "13. Termination",
      content: `We may terminate or suspend your account:
• For violation of these terms
• For non-payment
• For prohibited conduct
• Without cause with 30 days' notice
• Immediately for severe violations or safety concerns

Upon termination:
• Your access is revoked
• Subscriptions are cancelled
• Data may be retained per retention policies
• Certain obligations survive termination`,
    },
    {
      id: "contact",
      title: "14. Contact & Support",
      content: `For questions about these Terms:
Email: support@hometownhelper.com
Address: New Baneshwor, Kathmandu, Nepal
Phone: +977-1-4000000

We respond to inquiries within 48 hours.`,
    },
  ];

  const toggleSection = (id) => {
    setExpanded((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  useEffect(() => {
    setExpanded({ agreement: true });
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
          Terms of Service
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
        {sections.map((section) => (
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

        {/* Footer Agreement */}
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
            Agree to Our Terms?
          </h3>
          <p
            style={{
              margin: "0 0 20px",
              color: isDark ? "#9ca3af" : "#6b7280",
            }}
          >
            By using HomeTown Helper, you agree to these Terms of Service
          </p>
          <button
            style={{
              padding: "12px 32px",
              background: accentColor,
              color: "#ffffff",
              border: "none",
              borderRadius: 8,
              fontSize: 16,
              fontWeight: 700,
              cursor: "pointer",
              transition: "opacity 0.2s ease",
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
            onClick={() => window.history.back()}
          >
            I Agree & Continue
          </button>
        </div>
      </div>
    </div>
  );
}

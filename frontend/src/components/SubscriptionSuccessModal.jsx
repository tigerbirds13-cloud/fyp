import React, { useState } from "react";
import jsPDF from "jspdf";
import "jspdf-autotable";

/**
 * SubscriptionSuccessModal
 *
 * Displays after successful subscription purchase with:
 * - Success confirmation
 * - Plan benefits
 * - Receipt download option
 * - Dashboard navigation
 */

const PLAN_BENEFITS = {
  seeker: {
    pro: [
      "Unlimited Job Apply",
      "Create Unlimited Resume",
      "Can Customize Resume",
      "AI-Mock voice interview",
    ],
    elite: [
      "Unlimited Job Apply",
      "Create Unlimited Resume",
      "Can Customize Resume",
      "AI-Mock voice interview",
      "Priority Support",
      "Advanced Analytics",
    ],
  },
  helper: {
    pro: [
      "Unlimited Job Requests",
      "Enhanced Profile",
      "Visibility Badge",
      "Priority Messaging",
    ],
    elite: [
      "Unlimited Job Requests",
      "Enhanced Profile",
      "Visibility Badge",
      "Priority Messaging",
      "Verified Status",
      "Featured in Search",
    ],
  },
};

const PLAN_AMOUNTS = {
  seeker: {
    pro: 699,
    elite: 1499,
  },
  helper: {
    pro: 999,
    elite: 1999,
  },
};

const SubscriptionSuccessModal = ({
  isDark,
  subscriptionData,
  userType = "seeker",
  plan = "pro",
  onDashboardClick,
  onClose,
}) => {
  const [isGeneratingReceipt, setIsGeneratingReceipt] = useState(false);

  const modalBg = isDark ? "#111" : "#fff";
  const modalBorder = isDark ? "#1f2937" : "#e5e7eb";
  const titleColor = isDark ? "#f9fafb" : "#0f172a";
  const subColor = isDark ? "#9ca3af" : "#64748b";
  const successColor = "#16a34a";
  const benefitColor = isDark ? "#e5e7eb" : "#1f2937";

  const benefits = PLAN_BENEFITS[userType]?.[plan] || [];
  const planLabel = plan === "pro" ? "Pro" : "Elite";
  const amount = PLAN_AMOUNTS[userType]?.[plan] || 0;
  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "numeric",
    day: "numeric",
  });

  const generateReceipt = async () => {
    try {
      setIsGeneratingReceipt(true);

      const doc = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
      });

      // Set colors
      const primaryColor = [34, 197, 94]; // Green
      const darkColor = [15, 23, 42];

      // Header
      doc.setFillColor(...primaryColor);
      doc.rect(0, 0, 210, 30, "F");

      doc.setFont("helvetica", "bold");
      doc.setFontSize(24);
      doc.setTextColor(255, 255, 255);
      doc.text("Receipt", 105, 18, { align: "center" });

      // Reset text color
      doc.setTextColor(...darkColor);

      // Company Info
      doc.setFontSize(10);
      doc.setFont("helvetica", "normal");
      doc.text("HomeTownHelper", 20, 40);
      doc.text("Premium Subscription Service", 20, 47);

      // Receipt Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Receipt Information", 20, 60);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const detailsY = 70;
      const detailLineHeight = 7;

      doc.text(`Receipt Date: ${currentDate}`, 20, detailsY);
      doc.text(
        `Transaction ID: ${subscriptionData?.transactionId || "N/A"}`,
        20,
        detailsY + detailLineHeight,
      );
      doc.text(`Payment Method: Khalti`, 20, detailsY + detailLineHeight * 2);

      // Subscription Details
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Subscription Details", 20, detailsY + detailLineHeight * 4);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      const subDetailsY = detailsY + detailLineHeight * 5;

      doc.text(
        `User Type: ${userType === "seeker" ? "Service Seeker" : "Local Helper"}`,
        20,
        subDetailsY,
      );
      doc.text(`Plan: ${planLabel}`, 20, subDetailsY + detailLineHeight);
      doc.text(`Amount: NPR ${amount}`, 20, subDetailsY + detailLineHeight * 2);
      doc.text(
        `Billing Period: Monthly`,
        20,
        subDetailsY + detailLineHeight * 3,
      );

      // Features Table
      doc.setFont("helvetica", "bold");
      doc.setFontSize(11);
      doc.text("Included Benefits", 20, subDetailsY + detailLineHeight * 5);

      const tableData = benefits.map((benefit) => [benefit]);
      doc.autoTable({
        startY: subDetailsY + detailLineHeight * 6,
        head: [["Premium Benefits"]],
        body: tableData,
        margin: { left: 20, right: 20 },
        styles: {
          fontSize: 9,
          cellPadding: 5,
        },
        headStyles: {
          fillColor: primaryColor,
          textColor: [255, 255, 255],
          fontStyle: "bold",
        },
        bodyStyles: {
          textColor: darkColor,
        },
        alternateRowStyles: {
          fillColor: [245, 245, 245],
        },
      });

      // Footer
      const pageHeight = doc.internal.pageSize.getHeight();
      doc.setFont("helvetica", "italic");
      doc.setFontSize(9);
      doc.setTextColor(150, 150, 150);
      doc.text(
        "This is an automated receipt. For queries, contact support@hometownhelper.com",
        105,
        pageHeight - 10,
        { align: "center" },
      );

      // Save the PDF
      doc.save(`subscription-receipt-${currentDate.replace(/\//g, "-")}.pdf`);
      setIsGeneratingReceipt(false);
    } catch (error) {
      console.error("Error generating receipt:", error);
      alert("Failed to generate receipt. Please try again.");
      setIsGeneratingReceipt(false);
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        background: isDark ? "rgba(0,0,0,0.8)" : "rgba(0,0,0,0.5)",
        backdropFilter: "blur(6px)",
        zIndex: 400,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "20px",
      }}
    >
      <div
        style={{
          background: modalBg,
          border: `1px solid ${modalBorder}`,
          borderRadius: 20,
          padding: "40px 32px",
          width: "100%",
          maxWidth: 450,
          maxHeight: "90vh",
          overflow: "auto",
          textAlign: "center",
          boxShadow: isDark ? "none" : "0 20px 40px rgba(0,0,0,0.12)",
        }}
      >
        {/* Success Icon */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: "50%",
            background: successColor + "18",
            border: `2px solid ${successColor}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 40,
            color: successColor,
            margin: "0 auto 24px",
            position: "relative",
          }}
        >
          ✓
        </div>

        {/* Title */}
        <h2
          style={{
            color: titleColor,
            fontFamily: "Syne, sans-serif",
            fontWeight: 700,
            fontSize: 28,
            margin: "0 0 8px",
          }}
        >
          Purchase Successful!
        </h2>

        <p
          style={{
            color: subColor,
            fontFamily: "DM Sans, sans-serif",
            fontSize: 14,
            margin: "0 0 24px",
          }}
        >
          Thank you for upgrading to {planLabel}
        </p>

        {/* Receipt Info Box */}
        <div
          style={{
            background: isDark ? "#1a1a1a" : "#f9fafb",
            border: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
            borderRadius: 12,
            padding: "16px",
            marginBottom: 24,
            textAlign: "left",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 16,
            }}
          >
            <div>
              <p
                style={{
                  color: subColor,
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12,
                  margin: "0 0 4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Date
              </p>
              <p
                style={{
                  color: titleColor,
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  margin: 0,
                }}
              >
                {currentDate}
              </p>
            </div>
            <div>
              <p
                style={{
                  color: subColor,
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 12,
                  margin: "0 0 4px",
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Amount
              </p>
              <p
                style={{
                  color: titleColor,
                  fontFamily: "Syne, sans-serif",
                  fontWeight: 600,
                  fontSize: 15,
                  margin: 0,
                }}
              >
                NPR {amount}
              </p>
            </div>
          </div>
        </div>

        {/* Premium Benefits */}
        <div style={{ marginBottom: 24, textAlign: "left" }}>
          <h3
            style={{
              color: titleColor,
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 15,
              margin: "0 0 12px",
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            🎉 Your Premium Benefits
          </h3>
          <ul
            style={{
              listStyle: "none",
              padding: 0,
              margin: 0,
              display: "flex",
              flexDirection: "column",
              gap: 8,
            }}
          >
            {benefits.map((benefit, idx) => (
              <li
                key={idx}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 10,
                  color: benefitColor,
                  fontFamily: "DM Sans, sans-serif",
                  fontSize: 13,
                }}
              >
                <span style={{ color: successColor, fontWeight: 700 }}>●</span>
                {benefit}
              </li>
            ))}
          </ul>
        </div>

        {/* Transaction ID */}
        {subscriptionData?.transactionId && (
          <p
            style={{
              color: subColor,
              fontFamily: "DM Sans, sans-serif",
              fontSize: 11,
              margin: "0 0 20px",
              wordBreak: "break-all",
            }}
          >
            Transaction ID:{" "}
            <strong style={{ color: titleColor }}>
              {subscriptionData.transactionId}
            </strong>
          </p>
        )}

        {/* Action Buttons */}
        <div
          style={{
            display: "flex",
            gap: 12,
            flexDirection: "column",
          }}
        >
          <button
            onClick={onDashboardClick}
            style={{
              background: successColor,
              color: "#fff",
              border: "none",
              borderRadius: 10,
              padding: "14px 20px",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
            }}
            onMouseOver={(e) => (e.target.style.opacity = "0.9")}
            onMouseOut={(e) => (e.target.style.opacity = "1")}
          >
            Go to Dashboard →
          </button>

          <button
            onClick={generateReceipt}
            disabled={isGeneratingReceipt}
            style={{
              background: isDark ? "#1a1a1a" : "#f3f4f6",
              color: titleColor,
              border: `1px solid ${isDark ? "#2a2a2a" : "#e5e7eb"}`,
              borderRadius: 10,
              padding: "14px 20px",
              fontFamily: "Syne, sans-serif",
              fontWeight: 700,
              fontSize: 14,
              cursor: isGeneratingReceipt ? "not-allowed" : "pointer",
              transition: "all 0.2s",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 8,
              opacity: isGeneratingReceipt ? 0.6 : 1,
            }}
            onMouseOver={(e) => {
              if (!isGeneratingReceipt)
                e.target.style.background = isDark ? "#2a2a2a" : "#e5e7eb";
            }}
            onMouseOut={(e) => {
              e.target.style.background = isDark ? "#1a1a1a" : "#f3f4f6";
            }}
          >
            {isGeneratingReceipt ? "Generating..." : "📥 Download Receipt"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default SubscriptionSuccessModal;

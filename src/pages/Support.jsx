import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { HOW_YOU_CAN_HELP } from "../constants/content";
import { SITE_INFO } from "../constants/siteInfo";
import { fadeInUp } from "../constants/animations";
import SEO from "../components/SEO";

const Support = () => {
  return (
    <>
      <SEO 
        title="Support Us" 
        description={`Support ${SITE_INFO.name}. Make a donation, cover printing costs, or volunteer for our social projects.`}
        keywords="donate, support, upi, qr code, bank transfer, funding, Goa"
      />

      {/* Page Hero Header */}
      <section className="page-hero">
        <div 
          style={{
            position: "absolute",
            inset: 0,
            backgroundImage: "url('https://images.unsplash.com/photo-1544027993-37dbfe43562a?auto=format&fit=crop&w=1920&q=80')",
            backgroundSize: "cover",
            backgroundPosition: "center",
            opacity: 0.15,
            zIndex: 1
          }}
        />
        <div className="container" style={{ position: "relative", zIndex: 2 }}>
          <span className="page-hero-label">Make a Difference</span>
          <h1 className="font-playfair">Support Us</h1>
          <p className="breadcrumb">
            <Link to="/">Home</Link> <span style={{ margin: "0 0.5rem" }}>/</span> Support
          </p>
        </div>
      </section>

      {/* Section 1: Ways to Help */}
      <section className="section-padding">
        <div className="container">
          <div className="text-center" style={{ marginBottom: "var(--sp-12)" }}>
            <span className="badge badge-primary mb-3">Contributions</span>
            <h2 className="font-playfair section-title" style={{ color: "var(--color-secondary)" }}>Ways to Help Us</h2>
            <p style={{ color: "var(--color-text-light)", maxWidth: "700px", margin: "0 auto", lineHeight: "1.7" }}>
              We function on the principles of humanity, compassion, and community service. You can provide full or partial support to our social upliftment initiatives in multiple ways:
            </p>
          </div>

          <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "var(--sp-6)" }}>
            {HOW_YOU_CAN_HELP.map((item, idx) => (
              <motion.div 
                key={idx}
                className="card"
                style={{ 
                  flex: "1 1 300px",
                  maxWidth: "360px",
                  display: "flex", 
                  flexDirection: "column", 
                  alignItems: "center", 
                  textAlign: "center", 
                  padding: "var(--sp-6)", 
                  borderRadius: "var(--radius-lg)", 
                  border: "1px solid var(--color-border-light)", 
                  boxShadow: "var(--shadow-sm)" 
                }}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.05 }}
              >
                <div style={{ 
                  width: "48px", 
                  height: "48px", 
                  borderRadius: "50%", 
                  background: "rgba(255,153,51,0.1)", 
                  display: "flex", 
                  alignItems: "center", 
                  justifyContent: "center",
                  color: "var(--color-primary)",
                  fontSize: "1.5rem",
                  marginBottom: "var(--sp-4)",
                  flexShrink: 0
                }}>
                  🤝
                </div>
                <span style={{ color: "var(--color-text-light)", lineHeight: "1.6", fontSize: "var(--text-sm)" }}>{item}</span>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Section 2: Donation Methods */}
      <section className="section-padding section-bg-alt" style={{ borderTop: "1px solid var(--color-border-light)" }}>
        <div className="container">
          <div className="text-center" style={{ marginBottom: "var(--sp-10)" }}>
            <span className="badge badge-secondary mb-3">Contributions</span>
            <h2 className="font-playfair section-title" style={{ color: "var(--color-secondary)" }}>Make a Financial Donation</h2>
            <p style={{ color: "var(--color-text-light)", maxWidth: "600px", margin: "0 auto", lineHeight: "1.7" }}>
              Choose your preferred donation method. All contributions directly fund adolescent camps, disabled rehabilitation, and local community service projects.
            </p>
          </div>

          <div className="grid-2" style={{ gap: "var(--sp-8)", alignItems: "stretch" }}>
            
            {/* Method 1: UPI Code */}
            <motion.div
              className="card"
              initial={{ opacity: 0, x: -30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ 
                padding: "var(--sp-8)", 
                borderTop: "4px solid var(--color-primary)", 
                textAlign: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%"
              }}
            >
              <div>
                <h3 className="font-playfair" style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "var(--sp-2)", color: "var(--color-secondary)" }}>
                  Scan to Donate (UPI)
                </h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--sp-6)", lineHeight: "1.6" }}>
                  Scan the QR code below using any UPI app (Google Pay, PhonePe, Paytm, BHIM, etc.) to make a direct transfer.
                </p>
                <div style={{ 
                  display: "inline-block", 
                  padding: "var(--sp-4)", 
                  background: "#fff", 
                  border: "1px solid var(--color-border-light)", 
                  borderRadius: "var(--radius-lg)",
                  boxShadow: "var(--shadow-sm)",
                  marginBottom: "var(--sp-4)"
                }}>
                  <img 
                    src="/dummy_upi_qr.png" 
                    alt="UPI Donation QR Code" 
                    style={{ width: "220px", height: "220px", display: "block", margin: "0 auto" }} 
                  />
                </div>
              </div>
              <div style={{ fontSize: "var(--text-sm)", color: "var(--color-text-muted)", fontWeight: "600", borderTop: "1px solid var(--color-border-light)", paddingTop: "var(--sp-3)" }}>
                Payee: {SITE_INFO.bankDetails.payeeName}
              </div>
            </motion.div>

            {/* Method 2: Bank Transfer Details */}
            <motion.div
              className="card"
              initial={{ opacity: 0, x: 30 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              style={{ 
                padding: "var(--sp-8)", 
                borderTop: "4px solid var(--color-secondary)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                height: "100%"
              }}
            >
              <div>
                <h3 className="font-playfair" style={{ fontSize: "1.5rem", fontWeight: "700", marginBottom: "var(--sp-2)", color: "var(--color-secondary)" }}>
                  Bank Transfer Details
                </h3>
                <p style={{ fontSize: "var(--text-sm)", color: "var(--color-text-light)", marginBottom: "var(--sp-6)", lineHeight: "1.6" }}>
                  Alternatively, you can make financial contributions via cheque or direct online bank transfer (NEFT/IMPS) using these details:
                </p>
                
                <div style={{ display: "flex", flexDirection: "column", gap: "var(--sp-4)" }}>
                  <div style={{ borderBottom: "1px solid var(--color-border-light)", paddingBottom: "var(--sp-2)" }}>
                    <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: "600", color: "var(--color-text-light)" }}>Payee Name</span>
                    <p style={{ fontWeight: "700", margin: "0.25rem 0 0 0", color: "var(--color-secondary)" }}>{SITE_INFO.bankDetails.payeeName}</p>
                  </div>
                  <div style={{ borderBottom: "1px solid var(--color-border-light)", paddingBottom: "var(--sp-2)" }}>
                    <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: "600", color: "var(--color-text-light)" }}>Bank Name</span>
                    <p style={{ fontWeight: "600", margin: "0.25rem 0 0 0", color: "var(--color-text)" }}>{SITE_INFO.bankDetails.bankName}</p>
                  </div>
                  <div style={{ borderBottom: "1px solid var(--color-border-light)", paddingBottom: "var(--sp-2)" }}>
                    <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: "600", color: "var(--color-text-light)" }}>Branch</span>
                    <p style={{ fontWeight: "600", margin: "0.25rem 0 0 0", color: "var(--color-text)" }}>{SITE_INFO.bankDetails.branch}</p>
                  </div>
                  <div style={{ borderBottom: "1px solid var(--color-border-light)", paddingBottom: "var(--sp-2)" }}>
                    <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: "600", color: "var(--color-text-light)" }}>Account Number</span>
                    <p style={{ fontWeight: "700", fontSize: "1.1rem", margin: "0.25rem 0 0 0", color: "var(--color-secondary)" }}>{SITE_INFO.bankDetails.accountNumber}</p>
                  </div>
                </div>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "var(--sp-4)", borderTop: "1px solid var(--color-border-light)", paddingTop: "var(--sp-3)", marginTop: "var(--sp-4)" }}>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: "600", color: "var(--color-text-light)" }}>IFSC Code</span>
                  <p style={{ fontWeight: "700", margin: "0.25rem 0 0 0", color: "var(--color-text)" }}>{SITE_INFO.bankDetails.ifscCode}</p>
                </div>
                <div>
                  <span style={{ fontSize: "var(--text-xs)", textTransform: "uppercase", fontWeight: "600", color: "var(--color-text-light)" }}>MICR Code</span>
                  <p style={{ fontWeight: "700", margin: "0.25rem 0 0 0", color: "var(--color-text)" }}>{SITE_INFO.bankDetails.micrCode}</p>
                </div>
              </div>
            </motion.div>

          </div>
        </div>
      </section>
    </>
  );
};

export default Support;

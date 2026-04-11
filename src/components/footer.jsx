import React from "react";
import { Link } from "react-router-dom";

function Footer() {
  return (
    <footer style={styles.footer}>
      <div style={styles.inner}>

        {/* Grid */}
        <div style={styles.grid}>
          {/* Brand column */}
          <div style={styles.brandCol}>
            <div style={styles.brandName}>
              <span style={styles.brandDot} />
              Legal Tech
            </div>
            <p style={styles.brandTagline}>
              Automating legal for the next generation of founders.
            </p>
          </div>

          {/* Services */}
          <div style={styles.linkCol}>
            <h4 style={styles.colHeading}>Services</h4>
            <Link to="/document-templates" style={styles.footLink}>Document generation</Link>
            <Link to="/risk-analysis" style={styles.footLink}>Risk analysis</Link>
            <Link to="/pricing" style={styles.footLink}>Pricing</Link>
          </div>

          {/* Company */}
          <div style={styles.linkCol}>
            <h4 style={styles.colHeading}>Company</h4>
            <Link to="/about" style={styles.footLink}>About us</Link>
            <Link to="/careers" style={styles.footLink}>Careers</Link>
            <Link to="/contact" style={styles.footLink}>Contact</Link>
          </div>

          {/* Legal */}
          <div style={styles.linkCol}>
            <h4 style={styles.colHeading}>Legal</h4>
            <Link to="/privacy-policy" style={styles.footLink}>Privacy policy</Link>
            <Link to="/terms-of-service" style={styles.footLink}>Terms of service</Link>
          </div>
        </div>

        {/* Bottom bar */}
        <div style={styles.bottom}>
          © {new Date().getFullYear()} Legal Tech Inc. All rights reserved.
        </div>
      </div>
    </footer>
  );
}

const styles = {
  footer: {
    borderTop: "0.5px solid var(--nt-border)",
    background: "var(--nt-bg)",
    padding: "40px 28px 24px",
  },
  inner: {
    maxWidth: 1100,
    margin: "0 auto",
  },
  grid: {
    display: "grid",
    gridTemplateColumns: "2fr 1fr 1fr 1fr",
    gap: 24,
    marginBottom: 32,
  },

  // Brand
  brandCol: {},
  brandName: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 14,
    fontWeight: 500,
    color: "var(--nt-text)",
    marginBottom: 8,
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#1D9E75",
    display: "inline-block",
  },
  brandTagline: {
    fontSize: 12,
    color: "var(--nt-muted)",
    lineHeight: 1.65,
    maxWidth: 200,
  },

  // Link columns
  linkCol: {
    display: "flex",
    flexDirection: "column",
    gap: 0,
  },
  colHeading: {
    fontSize: 12,
    fontWeight: 500,
    color: "var(--nt-text)",
    marginBottom: 10,
  },
  footLink: {
    fontSize: 12,
    color: "var(--nt-muted)",
    textDecoration: "none",
    marginBottom: 7,
    display: "block",
    transition: "color .15s",
  },

  // Bottom
  bottom: {
    borderTop: "0.5px solid var(--nt-border)",
    paddingTop: 16,
    textAlign: "center",
    fontSize: 11,
    color: "var(--nt-muted)",
  },
};

export default Footer;
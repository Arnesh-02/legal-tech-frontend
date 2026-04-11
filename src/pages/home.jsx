import React from "react";
import { useNavigate } from "react-router-dom";
import { FileText, ShieldCheck, Users, Clock, ArrowRight } from "lucide-react";

function Home() {
  const navigate = useNavigate();

  return (
    <div style={styles.page}>

      {/* ── HERO ── */}
      <section style={styles.heroSection}>
        <div style={styles.container}>
          <div style={styles.badge}>
            <span style={styles.badgeDot} />
            AI-powered legal for founders
          </div>
          <h1 style={styles.heroTitle}>
            Create & analyze legal<br />documents instantly
          </h1>
          <p style={styles.heroSubtitle}>
            Generate founders' agreements, NDAs, and identify contract risks —
            in seconds, not weeks.
          </p>
          <div style={styles.heroBtns}>
            <button style={styles.btnPrimary} onClick={() => navigate("/document-templates")}>
              <FileText size={15} />
              Create document
            </button>
            <button style={styles.btnGhost} onClick={() => navigate("/risk-analysis")}>
              Analyze risk <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
            </button>
          </div>
        </div>
      </section>

      {/* ── STATS ── */}
      <section style={styles.statsSection}>
        <div style={{ ...styles.container, ...styles.statsGrid }}>
          {[
            { num: "2 min", label: "Avg. doc generation" },
            { num: "50+", label: "Document templates" },
            { num: "$0", label: "Legal fees to start" },
          ].map(({ num, label }) => (
            <div key={label} style={styles.statCard}>
              <div style={styles.statNum}>{num}</div>
              <div style={styles.statLabel}>{label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section style={styles.section}>
        <div style={styles.container}>
          <p style={styles.sectionLabel}>Core features</p>
          <h2 style={styles.sectionTitle}>Everything your startup needs</h2>
          <p style={styles.sectionSub}>From day-one paperwork to complex contract review.</p>
          <div style={styles.featGrid}>
            {[
              {
                icon: <FileText size={16} style={{ stroke: "#0F6E56" }} />,
                title: "Document generation",
                desc: "Legally sound founders' agreements, NDAs, and more — tailored to your details in minutes.",
              },
              {
                icon: <ShieldCheck size={16} style={{ stroke: "#0F6E56" }} />,
                title: "AI risk analysis",
                desc: "Upload any contract and get a clear breakdown of risks, ambiguous clauses, and missing terms.",
              },
              {
                icon: <Users size={16} style={{ stroke: "#0F6E56" }} />,
                title: "Find an advocate",
                desc: "Connect with vetted startup lawyers who understand early-stage needs and pricing.",
              },
              {
                icon: <Clock size={16} style={{ stroke: "#0F6E56" }} />,
                title: "Built for speed",
                desc: "Skip the back-and-forth. Get your documents reviewed, generated, and downloaded same day.",
              },
            ].map(({ icon, title, desc }) => (
              <FeatureCard key={title} icon={icon} title={title} desc={desc} />
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ── */}
      <section style={styles.section}>
        <div style={styles.container}>
          <p style={styles.sectionLabel}>How it works</p>
          <h2 style={styles.sectionTitle}>Simple & fast</h2>
          <p style={styles.sectionSub}>Three steps from start to signed.</p>
          <div style={styles.stepsGrid}>
            {[
              { n: "1", title: "Select & customize", desc: "Choose a template or upload an existing document for analysis." },
              { n: "2", title: "Input your details", desc: "Fill out a short form with your company info. No legal jargon." },
              { n: "3", title: "Download & sign", desc: "Get your polished document or risk report ready to act on." },
            ].map(({ n, title, desc }) => (
              <div key={n} style={styles.stepCard}>
                <div style={styles.stepNum}>{n}</div>
                <h3 style={styles.stepTitle}>{title}</h3>
                <p style={styles.stepDesc}>{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA BAND ── */}
      <section style={styles.ctaBandWrap}>
        <div style={{ ...styles.container, ...styles.ctaBand }}>
          <div>
            <h2 style={styles.ctaTitle}>Ready to secure your business?</h2>
            <p style={styles.ctaSub}>Generate your first document for free — no account needed.</p>
          </div>
          <button style={styles.btnPrimary} onClick={() => navigate("/document-templates")}>
            Get started <ArrowRight size={14} style={{ display: "inline", verticalAlign: "middle" }} />
          </button>
        </div>
      </section>

    </div>
  );
}

function FeatureCard({ icon, title, desc }) {
  const [hovered, setHovered] = React.useState(false);
  return (
    <div
      style={{ ...styles.featCard, ...(hovered ? styles.featCardHover : {}) }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
    >
      <div style={styles.featIcon}>{icon}</div>
      <h3 style={styles.featTitle}>{title}</h3>
      <p style={styles.featDesc}>{desc}</p>
    </div>
  );
}

const styles = {
  page: {
    fontFamily: "var(--font-sans, sans-serif)",
    color: "var(--nt-text)",
  },

  // Layout
  container: {
    maxWidth: 860,
    margin: "0 auto",
    padding: "0 28px",
  },

  // Hero
  heroSection: {
    padding: "72px 0 52px",
    textAlign: "center",
  },
  badge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 12,
    color: "#0F6E56",
    background: "#E1F5EE",
    border: "0.5px solid #9FE1CB",
    borderRadius: 999,
    padding: "4px 14px",
    marginBottom: 20,
    fontWeight: 500,
  },
  badgeDot: {
    width: 5,
    height: 5,
    borderRadius: "50%",
    background: "#1D9E75",
    display: "inline-block",
  },
  heroTitle: {
    fontSize: 34,
    fontWeight: 500,
    lineHeight: 1.22,
    letterSpacing: "-0.5px",
    color: "var(--nt-text)",
    marginBottom: 14,
  },
  heroSubtitle: {
    fontSize: 16,
    color: "var(--nt-muted)",
    lineHeight: 1.65,
    maxWidth: 480,
    margin: "0 auto 28px",
  },
  heroBtns: {
    display: "flex",
    gap: 10,
    justifyContent: "center",
    flexWrap: "wrap",
  },
  btnPrimary: {
    display: "inline-flex",
    alignItems: "center",
    gap: 7,
    fontSize: 14,
    fontWeight: 500,
    padding: "10px 22px",
    borderRadius: 8,
    background: "#1D9E75",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "opacity .15s",
    whiteSpace: "nowrap",
  },
  btnGhost: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 14,
    padding: "10px 20px",
    borderRadius: 8,
    background: "none",
    color: "var(--nt-text)",
    border: "0.5px solid var(--nt-border)",
    cursor: "pointer",
    transition: "background .15s",
  },

  // Stats
  statsSection: {
    padding: "0 0 52px",
  },
  statsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 10,
    maxWidth: 540,
  },
  statCard: {
    background: "var(--nt-bg2)",
    borderRadius: 8,
    padding: "18px 16px",
    textAlign: "center",
  },
  statNum: {
    fontSize: 24,
    fontWeight: 500,
    color: "var(--nt-text)",
  },
  statLabel: {
    fontSize: 11,
    color: "var(--nt-muted)",
    marginTop: 4,
  },

  // Section
  section: {
    padding: "0 0 52px",
  },
  sectionLabel: {
    fontSize: 11,
    fontWeight: 500,
    color: "#0F6E56",
    textTransform: "uppercase",
    letterSpacing: ".08em",
    marginBottom: 6,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 500,
    color: "var(--nt-text)",
    marginBottom: 6,
  },
  sectionSub: {
    fontSize: 14,
    color: "var(--nt-muted)",
    marginBottom: 24,
  },

  // Features
  featGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(2, 1fr)",
    gap: 12,
  },
  featCard: {
    background: "var(--nt-bg)",
    border: "0.5px solid var(--nt-border)",
    borderRadius: 12,
    padding: "20px",
    transition: "border-color .2s",
    cursor: "default",
  },
  featCardHover: {
    borderColor: "var(--nt-border-strong)",
  },
  featIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    background: "#E1F5EE",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
  },
  featTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--nt-text)",
    marginBottom: 6,
  },
  featDesc: {
    fontSize: 12,
    color: "var(--nt-muted)",
    lineHeight: 1.65,
  },

  // Steps
  stepsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)",
    gap: 16,
  },
  stepCard: {},
  stepNum: {
    fontSize: 11,
    fontWeight: 500,
    color: "#0F6E56",
    background: "#E1F5EE",
    border: "0.5px solid #9FE1CB",
    borderRadius: 999,
    width: 22,
    height: 22,
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 10,
  },
  stepTitle: {
    fontSize: 13,
    fontWeight: 500,
    color: "var(--nt-text)",
    marginBottom: 5,
  },
  stepDesc: {
    fontSize: 12,
    color: "var(--nt-muted)",
    lineHeight: 1.65,
  },

  // CTA band
  ctaBandWrap: {
    padding: "0 28px 52px",
  },
  ctaBand: {
    background: "#E1F5EE",
    border: "0.5px solid #9FE1CB",
    borderRadius: 12,
    padding: "28px 32px",
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 20,
    flexWrap: "wrap",
  },
  ctaTitle: {
    fontSize: 17,
    fontWeight: 500,
    color: "#085041",
    marginBottom: 4,
  },
  ctaSub: {
    fontSize: 13,
    color: "#0F6E56",
  },
};

export default Home;
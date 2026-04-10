import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

const SEV_CONFIG = {
  high:   { label: "Critical", accent: "#e53935", bg: "#fff5f5", text: "#b71c1c" },
  medium: { label: "Moderate", accent: "#f59e0b", bg: "#fffbeb", text: "#92400e" },
  low:    { label: "Low Risk", accent: "#10b981", bg: "#f0fdf4", text: "#065f46" },
};

const RiskReportPage = () => {
  const { state } = useLocation();
  const navigate  = useNavigate();
  const analysis  = state?.analysis;
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownloadPDF = async () => {
    setIsDownloading(true);
    try {
      const API_BASE = import.meta.env.VITE_API_URL;
      const response = await fetch(`${API_BASE}//generate-risk-report`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ document_type: "risk_report", context: analysis }),
      });
      if (!response.ok) throw new Error(response.statusText);
      const blob = await response.blob();
      const url  = window.URL.createObjectURL(blob);
      const a    = document.createElement("a");
      a.href     = url;
      a.download = `Risk_Report_${analysis.doc_id}.pdf`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error("Error generating PDF:", err);
      alert("Could not generate report. Please try again.");
    } finally {
      setIsDownloading(false);
    }
  };

  if (!analysis) {
    return (
      <div style={{ textAlign: "center", marginTop: "80px", fontFamily: "Inter, sans-serif" }}>
        <p style={{ color: "#6b7280" }}>No analysis data available.</p>
        <button
          onClick={() => navigate("/risk-analysis")}
          style={{ marginTop: 16, padding: "9px 20px", borderRadius: 8, border: "1.5px solid #d1d5db", background: "#fff", cursor: "pointer" }}
        >
          ← Go Back
        </button>
      </div>
    );
  }

  const counts = {
    high:   analysis.risks?.filter(r => r.severity.toLowerCase() === "high").length   || 0,
    medium: analysis.risks?.filter(r => r.severity.toLowerCase() === "medium").length || 0,
    low:    analysis.risks?.filter(r => r.severity.toLowerCase() === "low").length    || 0,
    total:  analysis.risks?.length || 0,
  };

  const shortName = analysis.file_name?.length > 40
    ? analysis.file_name.slice(0, 38) + "…"
    : analysis.file_name;

  return (
    <>
      {/* Scoped styles — NO global * reset that would break the rest of the app */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

        .rr-wrap {
          font-family: 'Inter', sans-serif;
          background: #f1f4f9;
          min-height: 100vh;
          padding: 40px 24px 72px;
          box-sizing: border-box;
        }

        .rr-wrap *, .rr-wrap *::before, .rr-wrap *::after {
          box-sizing: border-box;
        }

        /* Header */
        .rr-header {
          max-width: 1100px;
          margin: 0 auto 28px;
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e2e6ef;
          padding: 20px 24px;
          display: flex;
          align-items: center;
          justify-content: space-between;
          gap: 16px;
          flex-wrap: wrap;
          animation: rrFadeDown 0.45s ease both;
        }

        .rr-header-left {
          display: flex;
          align-items: center;
          gap: 14px;
          flex: 1;
          min-width: 0;
        }

        .rr-icon-box {
          width: 42px; height: 42px; flex-shrink: 0;
          background: #eef2ff; border-radius: 10px;
          display: flex; align-items: center; justify-content: center;
        }

        .rr-doc-id-label {
          font-size: 0.7rem; font-weight: 600;
          text-transform: uppercase; letter-spacing: 0.08em;
          color: #9ca3af; margin-bottom: 3px; line-height: 1;
        }

        .rr-doc-filename {
          font-size: 0.97rem; font-weight: 600; color: #111827;
          white-space: nowrap; overflow: hidden; text-overflow: ellipsis;
          max-width: min(380px, 50vw); line-height: 1.3;
        }

        .rr-actions { display: flex; gap: 10px; flex-shrink: 0; align-items: center; }

        .rr-btn-outline {
          padding: 8px 16px; border-radius: 8px;
          border: 1.5px solid #e2e6ef; background: #fff;
          color: #374151; font-family: 'Inter', sans-serif;
          font-size: 0.83rem; font-weight: 500; cursor: pointer;
          transition: background 0.15s, border-color 0.15s; white-space: nowrap;
        }
        .rr-btn-outline:hover { background: #f9fafb; border-color: #c5cad6; }

        .rr-btn-primary {
          padding: 8px 18px; border-radius: 8px;
          background: #1a237e; border: none; color: #fff;
          font-family: 'Inter', sans-serif; font-size: 0.83rem; font-weight: 600;
          cursor: pointer; display: flex; align-items: center; gap: 7px;
          transition: background 0.15s, transform 0.15s; white-space: nowrap;
        }
        .rr-btn-primary:hover:not(:disabled) { background: #283593; transform: translateY(-1px); }
        .rr-btn-primary:disabled { opacity: 0.6; cursor: not-allowed; }

        /* Stats */
        .rr-stats {
          max-width: 1100px; margin: 0 auto 24px;
          display: flex; gap: 10px; flex-wrap: wrap;
          animation: rrFadeDown 0.45s 0.07s ease both;
        }

        .rr-pill {
          display: inline-flex; align-items: center; gap: 7px;
          padding: 6px 14px; border-radius: 999px;
          font-size: 0.8rem; font-weight: 600; line-height: 1;
        }

        .rr-dot { width: 7px; height: 7px; border-radius: 50%; flex-shrink: 0; }

        /* Section title */
        .rr-section-title {
          max-width: 1100px; margin: 0 auto 20px;
          font-size: 1.25rem; font-weight: 700; color: #111827;
          animation: rrFadeDown 0.45s 0.12s ease both;
        }

        /* ── THE FIX: CSS Grid, not flex, so cards never overflow ── */
        .rr-grid {
          max-width: 1100px;
          margin: 0 auto;
          display: grid;
          grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
          gap: 18px;
          align-items: start;
        }

        /* Card */
        .rr-card {
          background: #fff;
          border-radius: 14px;
          border: 1px solid #e2e6ef;
          width: 100%;           /* fills grid cell, never overflows */
          display: flex;
          flex-direction: column;
          overflow: hidden;
          transition: transform 0.2s ease, box-shadow 0.2s ease;
          animation: rrCardIn 0.5s ease both;
          position: relative;
        }
        .rr-card:hover { transform: translateY(-3px); box-shadow: 0 10px 28px rgba(0,0,0,0.08); }

        .rr-card-stripe { height: 5px; width: 100%; flex-shrink: 0; }

        /* Pulse on critical cards */
        .rr-card-high {
          box-shadow: 0 0 0 1.5px rgba(229,57,53,0.2);
          animation: rrCardIn 0.5s ease both, rrPulse 2.6s ease-in-out infinite;
        }
        @keyframes rrPulse {
          0%,100% { box-shadow: 0 0 0 1.5px rgba(229,57,53,0.18); }
          50%      { box-shadow: 0 0 0 3.5px rgba(229,57,53,0.3); }
        }

        .rr-card-body { padding: 18px 20px 20px; display: flex; flex-direction: column; gap: 14px; }

        .rr-card-title { font-size: 0.92rem; font-weight: 600; color: #111827; line-height: 1.45; margin: 0; }

        .rr-card-meta {
          display: flex; align-items: center;
          justify-content: space-between; gap: 8px; flex-wrap: wrap;
        }

        .rr-badge {
          display: inline-block; padding: 3px 11px; border-radius: 999px;
          font-size: 0.7rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.06em; line-height: 1.6;
        }

        .rr-conf { font-size: 0.76rem; color: #9ca3af; font-weight: 400; }

        .rr-field-label {
          font-size: 0.66rem; font-weight: 700;
          text-transform: uppercase; letter-spacing: 0.1em;
          color: #9ca3af; margin-bottom: 6px;
        }

        .rr-field-text {
          font-size: 0.82rem; line-height: 1.65; color: #4b5563;
          background: #f8fafc; border-radius: 8px;
          padding: 11px 13px; border-left: 3px solid #e2e6ef;
          max-height: 130px; overflow-y: auto;
        }

        /* Animations */
        @keyframes rrFadeDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes rrCardIn {
          from { opacity: 0; transform: translateY(14px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        @keyframes rrSpin { to { transform: rotate(360deg); } }
        .rr-spinner {
          width: 13px; height: 13px; flex-shrink: 0;
          border: 2px solid rgba(255,255,255,0.35);
          border-top-color: #fff; border-radius: 50%;
          animation: rrSpin 0.65s linear infinite;
        }
      `}</style>

      <div className="rr-wrap">

        {/* Header */}
        <div className="rr-header">
          <div className="rr-header-left">
            <div className="rr-icon-box">
              <svg width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="#4f5bdb" strokeWidth="1.8">
                <path strokeLinecap="round" strokeLinejoin="round"
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414A1 1 0 0121 9.414V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div style={{ minWidth: 0 }}>
              <div className="rr-doc-id-label">ID · {analysis.doc_id}</div>
              <div className="rr-doc-filename" title={analysis.file_name}>{shortName}</div>
            </div>
          </div>

          <div className="rr-actions">
            <button className="rr-btn-outline" onClick={() => navigate("/dashboard")}>
              ← Dashboard
            </button>
            <button className="rr-btn-primary" onClick={handleDownloadPDF} disabled={isDownloading}>
              {isDownloading ? (
                <><div className="rr-spinner" /> Generating…</>
              ) : (
                <>
                  <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.2">
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M4 16v2a2 2 0 002 2h12a2 2 0 002-2v-2M7 10l5 5 5-5M12 3v12" />
                  </svg>
                  Download Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="rr-stats">
          {counts.high > 0 && (
            <span className="rr-pill" style={{ background: "#fff5f5", color: "#b71c1c" }}>
              <span className="rr-dot" style={{ background: "#e53935" }} />
              {counts.high} Critical{counts.high > 1 ? " risks" : " risk"}
            </span>
          )}
          {counts.medium > 0 && (
            <span className="rr-pill" style={{ background: "#fffbeb", color: "#92400e" }}>
              <span className="rr-dot" style={{ background: "#f59e0b" }} />
              {counts.medium} Moderate
            </span>
          )}
          {counts.low > 0 && (
            <span className="rr-pill" style={{ background: "#f0fdf4", color: "#065f46" }}>
              <span className="rr-dot" style={{ background: "#10b981" }} />
              {counts.low} Low{counts.low > 1 ? " risks" : " risk"}
            </span>
          )}
          <span className="rr-pill" style={{ background: "#f3f4f6", color: "#374151" }}>
            {counts.total} total findings
          </span>
        </div>

        {/* Section title */}
        <div className="rr-section-title">Identified Risks</div>

        {/* Cards */}
        <div className="rr-grid">
          {analysis.risks?.map((risk, i) => {
            const sev = risk.severity.toLowerCase();
            const cfg = SEV_CONFIG[sev] || SEV_CONFIG.low;

            return (
              <div
                key={i}
                className={`rr-card rr-card-${sev}`}
                style={{ animationDelay: `${0.06 * i + 0.15}s` }}
              >
                <div className="rr-card-stripe" style={{ background: cfg.accent }} />
                <div className="rr-card-body">
                  <p className="rr-card-title">{risk.title}</p>
                  <div className="rr-card-meta">
                    <span className="rr-badge" style={{ background: cfg.bg, color: cfg.text }}>
                      {cfg.label}
                    </span>
                    <span className="rr-conf">{Math.round(risk.confidence * 100)}% confidence</span>
                  </div>
                  <div>
                    <div className="rr-field-label">Evidence</div>
                    <div className="rr-field-text" style={{ borderLeftColor: cfg.accent + "66" }}>
                      {risk.evidence}
                    </div>
                  </div>
                  <div>
                    <div className="rr-field-label">Recommendation</div>
                    <div className="rr-field-text">{risk.recommendation}</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

      </div>
    </>
  );
};

export default RiskReportPage;
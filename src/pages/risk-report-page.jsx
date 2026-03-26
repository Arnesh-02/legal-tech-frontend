import React from "react";
import { useLocation, useNavigate } from "react-router-dom";

const RiskReportPage = () => {
  const { state } = useLocation();
  const navigate = useNavigate();
  const analysis = state?.analysis;

  if (!analysis) {
    return (
      <div className="no-data">
        <h2>No analysis data found</h2>
        <button className="btn-primary" onClick={() => navigate("/risk-analysis")}>
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="report-container">

      {/* Header Section */}
      <div className="report-header">
        <h1>Risk Analysis Report</h1>
        <div className="doc-info">
          <p><strong>Document ID:</strong> {analysis.doc_id}</p>
          <p><strong>File:</strong> {analysis.file_name}</p>
        </div>

        <button className="btn-secondary" onClick={() => navigate("/dashboard")}>
          Back to Dashboard
        </button>
      </div>

      {/* Risk List */}
      <h2 className="section-title">Identified Risks</h2>

      <div className="risk-list">
        {analysis.risks?.map((risk, i) => (
          <div className="risk-card" key={i}>
            
            <div className="risk-header">
              <h3>{risk.title}</h3>
              <span className={`severity-badge severity-${risk.severity}`}>
                {risk.severity.toUpperCase()}
              </span>
            </div>

            <p className="confidence">
              <strong>Confidence:</strong> {risk.confidence}
            </p>

            <p className="label">Evidence:</p>
            <p className="evidence">{risk.evidence}</p>

            <p className="label">Recommendation:</p>
            <p className="recommendation">{risk.recommendation}</p>
          </div>
        ))}
      </div>

    </div>
  );
};

export default RiskReportPage;

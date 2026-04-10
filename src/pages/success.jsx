import React, { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import ClipLoader from "react-spinners/ClipLoader"; 
import { CheckCircle, ArrowRight, Download, RefreshCw } from "lucide-react";
import "./success.css"; // Ensure you create this CSS file

function Success() {
  const location = useLocation();
  const navigate = useNavigate();

  const [instructions, setInstructions] = useState("");
  const [showRedraftBox, setShowRedraftBox] = useState(false);
  const [loading, setLoading] = useState(false); 
  const [redrafted, setRedrafted] = useState(null);
  const [message, setMessage] = useState("Your document has been generated and is ready for review.");

  const handleRedraft = async () => {
    setLoading(true);
    setMessage("AI is redrafting your contract...");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/redraft`, {
        method: "POST",
        credentials: "include", // Required for JWT cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          html: location.state?.html || "",
          instructions: instructions,
        }),
      });

      if (!response.ok) throw new Error("Redraft request failed");

      const data = await response.json();
      if (data.redrafted_html) {
        setRedrafted(data.redrafted_html);
        setMessage("Redraft complete! Review the new document preview below.");
      }
    } catch (err) {
      console.error("Redraft error:", err);
      setMessage("Something went wrong with redrafting. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const downloadRedraftedPDF = async () => {
    if (!redrafted) return;

    setLoading(true);
    setMessage("Generating final PDF...");
    try {
      const res = await fetch(`${import.meta.env.VITE_API_URL}/redraft/render_pdf`, {
        method: "POST",
        credentials: "include", // Required for JWT cookies
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ html: redrafted })
      });

      if (!res.ok) throw new Error("PDF generation failed");

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "redrafted_agreement.pdf";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setMessage("PDF downloaded successfully!");
    } catch (err) {
      console.error("PDF download error:", err);
      setMessage("Failed to generate PDF for download.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="page-container-app">
      <div className="app-container success-container">
        <div className="app-panel success-panel">
          <CheckCircle size={60} className="success-icon" />
          <h2 className="success-heading">Document Ready!</h2>
          <p className="success-message">{message}</p>

          <div className="success-buttons">
            <button className="btn-secondary-outline" onClick={() => navigate("/document-history")}>
              View History
            </button>
            <button className="btn-primary-teal" onClick={() => navigate("/generate-nda")}>
              <ArrowRight size={20} /> New Document
            </button>
            <button className="btn-primary-teal redraft-cta" onClick={() => setShowRedraftBox(!showRedraftBox)}>
              <RefreshCw size={20} /> Redraft with AI
            </button>
          </div>

          {loading && (
            <div className="loader-overlay">
              <ClipLoader color="#0d9488" size={50} />
              <p>Processing...</p>
            </div>
          )}

          {showRedraftBox && !redrafted && (
            <div className="redraft-box animated-fade-in">
              <h3>Custom Instructions</h3>
              <textarea
                value={instructions}
                onChange={(e) => setInstructions(e.target.value)}
                rows="4"
                placeholder="Change the governing law to New York, or update the non-compete to 24 months..."
                disabled={loading}
              />
              <button 
                onClick={handleRedraft} 
                disabled={loading || !instructions.trim()} 
                className="redraft-submit-btn"
              >
                {loading ? "Re-writing..." : "Generate AI Redraft"}
              </button>
            </div>
          )}

          {redrafted && (
            <div className="redrafted-preview-section animated-slide-up">
                <hr className="preview-divider" />
                <h3 className="preview-title">AI Redraft Preview</h3>
                <div className="paper-container">
                    <div className="redrafted-document" dangerouslySetInnerHTML={{ __html: redrafted }}></div>
                </div>
                <button onClick={downloadRedraftedPDF} disabled={loading} className="btn-download-final">
                    <Download size={20} /> Download Professional PDF
                </button>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}

export default Success;
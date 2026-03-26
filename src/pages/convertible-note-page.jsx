import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ConvertibleNotePage() {
  const navigate = useNavigate();
  const previewPanelRef = useRef(null);

  const today = new Date();
  const isoToday = today.toISOString().split("T")[0];

  // ------------------------------
  // FORM DATA (CONVERTIBLE NOTE FIELDS)
  // ------------------------------
  const [formData, setFormData] = useState({
    // Note Terms
    NOTE_PRINCIPAL_AMOUNT: "50000",
    NOTE_ISSUE_DATE: isoToday,
    NOTE_MATURITY_DATE: new Date(today.setFullYear(today.getFullYear() + 2)).toISOString().split("T")[0],
    INTEREST_RATE: "5",
    
    // Conversion Terms
    MINIMUM_RAISE_AMOUNT: "1000000",
    CONVERSION_DISCOUNT_RATE: "20",
    VALUATION_CAP: "5000000",
    
    // Company Details (Issuer)
    COMPANY_NAME: "",
    COMPANY_JURISDICTION: "Delaware",
    COMPANY_SIGNATORY_NAME: "",
    COMPANY_SIGNATORY_TITLE: "CEO",
    
    // Investor Details (Holder)
    INVESTOR_NAME: "",
    INVESTOR_ADDRESS: "",
    INVESTOR_SIGNATORY_NAME: "",
    INVESTOR_SIGNATORY_TITLE: "Managing Partner",

    // Legal
    GOVERNING_STATE: "California",
  });

  const [template, setTemplate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // ------------------------------
  // ALIASES — CONVERTIBLE NOTE
  // ------------------------------
  const ALIASES = {
    "note.principal.amount": "NOTE_PRINCIPAL_AMOUNT",
    "note.issue.date": "NOTE_ISSUE_DATE",
    "note.maturity.date": "NOTE_MATURITY_DATE",
    "interest.rate": "INTEREST_RATE",

    "minimum.raise.amount": "MINIMUM_RAISE_AMOUNT",
    "conversion.discount.rate": "CONVERSION_DISCOUNT_RATE",
    "valuation.cap": "VALUATION_CAP",

    "company.name": "COMPANY_NAME",
    "company.jurisdiction": "COMPANY_JURISDICTION",
    "company.signatory.name": "COMPANY_SIGNATORY_NAME",
    "company.signatory.title": "COMPANY_SIGNATORY_TITLE",

    "investor.name": "INVESTOR_NAME",
    "investor.address": "INVESTOR_ADDRESS",
    "investor.signatory.name": "INVESTOR_SIGNATORY_NAME",
    "investor.signatory.title": "INVESTOR_SIGNATORY_TITLE",

    "governing.state": "GOVERNING_STATE",
  };

  const placeholderToKey = (ph) => {
    const clean = String(ph || "").trim();
    if (formData.hasOwnProperty(clean)) return clean;
    const alias = ALIASES[clean.toLowerCase()];
    if (alias) return alias;
    return clean.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
  };

  // ------------------------------
  // FETCH TEMPLATE
  // ------------------------------
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/get-template/convertible-note`) 
      .then((res) => res.text())
      .then((text) => {
        setTemplate(text);
        setIsLoading(false);
      })
      .catch(() => {
        setTemplate("<p class='text-danger'>Error loading Convertible Note template.</p>");
        setIsLoading(false);
      });
  }, []);

  // ------------------------------
  // PREVIEW INTERACTION (Same logic as NDA page)
  // ------------------------------
  useEffect(() => {
    const panel = previewPanelRef.current;
    if (!panel || isLoading) return;

    const highlight = (key, add = true) => {
      const input = document.getElementById(key);
      if (input) {
        add
          ? input.classList.add("form-control-highlight")
          : input.classList.remove("form-control-highlight");
      }
    };

    const mouseOver = (e) => {
      if (e.target.classList.contains("placeholder-blank")) {
        highlight(e.target.dataset.key, true);
      }
    };

    const mouseOut = (e) => {
      if (e.target.classList.contains("placeholder-blank")) {
        highlight(e.target.dataset.key, false);
      }
    };

    const click = (e) => {
      if (e.target.classList.contains("placeholder-blank")) {
        const key = e.target.dataset.key;
        const input = document.getElementById(key);
        if (input) {
          input.scrollIntoView({ behavior: "smooth", block: "center" });
          input.focus();

          const accordion = input.closest(".accordion-collapse");
          if (accordion && !accordion.classList.contains("show")) {
            const button = document.querySelector(
              `[data-bs-target="#${accordion.id}"]`
            );
            if (button) button.click();
          }
        }
      }
    };

    panel.addEventListener("mouseover", mouseOver);
    panel.addEventListener("mouseout", mouseOut);
    panel.addEventListener("click", click);

    return () => {
      panel.removeEventListener("mouseover", mouseOver);
      panel.removeEventListener("mouseout", mouseOut);
      panel.removeEventListener("click", click);
    };
  }, [isLoading]);

  // ------------------------------
  // FORM HANDLING
  // ------------------------------
  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((p) => ({ ...p, [name]: value }));
  };

  // ------------------------------
  // TEMPLATE PREVIEW RENDERER
  // ------------------------------
  const blankSpan = (key) =>
    `<span class="placeholder-blank" data-key="${key}">[${key.replace(
      /_/g,
      " "
    )}]</span>`;

  const getPreview = () => {
    if (isLoading) return "";
    if (!template) return "<p>No template.</p>";

    return template.replace(/{{\s*([^}]+)\s*}}/g, (match, p1) => {
      const key = placeholderToKey(p1);
      const value = formData[key];
      return value && value !== "" ? value : blankSpan(key);
    });
  };

  // ------------------------------
  // DOWNLOAD PDF
  // ------------------------------
  const handleDownloadPDF = async () => {
    setIsDownloading(true);

    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/generate`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          document_type: "convertible-note", // Updated document type
          context: formData
        }),
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "Convertible_Note.pdf"; // Updated filename
      a.click();

      window.URL.revokeObjectURL(url);

      navigate("/download-complete", { state: { html: getPreview() } });
    } catch (err) {
      console.error(err);
      alert("PDF generation failed.");
    }

    setIsDownloading(false);
  };

  // ------------------------------
  // INPUT COMPONENTS
  // ------------------------------
  const renderField = (key, label, type = "text", placeholder = "") => (
    <div className="mb-3" key={key}>
      <label htmlFor={key} className="form-label fw-semibold">{label}</label>
      <input
        id={key}
        name={key}
        type={type}
        className="form-control"
        value={formData[key]}
        onChange={handleChange}
        placeholder={placeholder}
      />
    </div>
  );

  // ------------------------------
  // RENDER PAGE
  // ------------------------------
  return (
    <div className="container-fluid founders-page-container">
      {/* Re-using the same style block for consistent visual theme */}
      <style>{`
        .founders-page-container {
          padding-top: 2rem;
          padding-bottom: 2rem;
          background-color: var(--light-bg);
          min-height: calc(100vh - 70px);
        }
        .form-panel {
          max-height: 85vh;
          overflow-y: auto;
          background-color: var(--white);
          border-radius: var(--border-radius);
          box-shadow: var(--shadow-md);
        }
        .preview-panel {
          max-height: 85vh;
          overflow-y: auto;
          background-color: var(--white);
          border-radius: var(--border-radius);
          font-family: var(--font-serif);
          font-size: 1.05rem;
          line-height: 1.6;
        }
        .placeholder-blank {
          font-weight: 600;
          color: var(--accent-blue);
          background-color: #e7f1ff;
          border: 1px dashed var(--accent-blue);
          padding: 0.1em 0.4em;
          border-radius: 4px;
          cursor: pointer;
        }
        .form-control-highlight {
          border-color: var(--secondary-teal) !important;
          box-shadow: 0 0 0 0.25rem rgba(0, 124, 137, 0.25);
        }
      `}</style>

      <div className="row">
        {/* LEFT FORM PANEL */}
        <div className="col-lg-5">
          <div className="card form-panel shadow-sm">
            <div className="card-header bg-white border-0">
              <h3 className="text-secondary-teal">Convertible Note Details</h3>
              <p className="text-sm text-gray-500">A debt instrument that converts to equity upon a future financing round.</p>
            </div>

            <div className="card-body">
              <div className="accordion" id="noteFormSections">
                
                {/* SECTION 1: NOTE TERMS */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" data-bs-toggle="collapse" data-bs-target="#noteTerms">
                      Principal and Maturity
                    </button>
                  </h2>
                  <div id="noteTerms" className="accordion-collapse collapse show">
                    <div className="accordion-body">
                      {renderField("NOTE_PRINCIPAL_AMOUNT", "Principal Amount ($)", "number")}
                      {renderField("NOTE_ISSUE_DATE", "Issue Date", "date")}
                      {renderField("NOTE_MATURITY_DATE", "Maturity Date", "date")}
                      {renderField("INTEREST_RATE", "Annual Interest Rate (%)", "number")}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: CONVERSION TERMS */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#conversionTerms">
                      Conversion and Valuation
                    </button>
                  </h2>
                  <div id="conversionTerms" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      {renderField("MINIMUM_RAISE_AMOUNT", "Qualified Financing Minimum Raise ($)", "number", "e.g., 1000000")}
                      {renderField("CONVERSION_DISCOUNT_RATE", "Conversion Discount Rate (%)", "number", "e.g., 20")}
                      {renderField("VALUATION_CAP", "Valuation Cap ($)", "number", "e.g., 5000000")}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: COMPANY (ISSUER) */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#companyDetails">
                      Company (Issuer) Details
                    </button>
                  </h2>
                  <div id="companyDetails" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      {renderField("COMPANY_NAME", "Company Name")}
                      {renderField("COMPANY_JURISDICTION", "State/Country of Incorporation")}
                      <hr className="my-4" />
                      <h4>Signatory</h4>
                      {renderField("COMPANY_SIGNATORY_NAME", "Signatory Name")}
                      {renderField("COMPANY_SIGNATORY_TITLE", "Signatory Title")}
                    </div>
                  </div>
                </div>

                {/* SECTION 4: INVESTOR (HOLDER) */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#investorDetails">
                      Investor (Holder) Details
                    </button>
                  </h2>
                  <div id="investorDetails" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      {renderField("INVESTOR_NAME", "Investor/Holder Name (Entity or Individual)")}
                      {renderField("INVESTOR_ADDRESS", "Investor Address")}
                      <hr className="my-4" />
                      <h4>Signatory</h4>
                      {renderField("INVESTOR_SIGNATORY_NAME", "Signatory Name")}
                      {renderField("INVESTOR_SIGNATORY_TITLE", "Signatory Title")}
                    </div>
                  </div>
                </div>
                
                {/* SECTION 5: LEGAL/JURISDICTION */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#legalDetails">
                      Governing Law
                    </button>
                  </h2>
                  <div id="legalDetails" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      {renderField("GOVERNING_STATE", "Governing State/Jurisdiction")}
                    </div>
                  </div>
                </div>

              </div>

              <button
                className="btn btn-primary w-100 mt-4 py-2"
                onClick={handleDownloadPDF}
                disabled={isDownloading}
                style={{ backgroundColor: 'var(--secondary-teal)', borderColor: 'var(--secondary-teal)' }}
              >
                {isDownloading ? "Generating PDF..." : "Generate & Download PDF"}
              </button>
            </div>
          </div>
        </div>

        {/* RIGHT PREVIEW PANEL */}
        <div className="col-lg-7" ref={previewPanelRef}>
          <div className="card shadow-sm preview-panel">
            <div className="card-body">
              {isLoading ? (
                <div className="d-flex justify-content-center align-items-center" style={{ minHeight: '300px' }}>
                  <div className="spinner-border text-secondary-teal" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : (
                <div dangerouslySetInnerHTML={{ __html: getPreview() }} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default ConvertibleNotePage;
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function ConsultingAgreementPage() {
  const navigate = useNavigate();
  const previewPanelRef = useRef(null);

  const today = new Date();
  const isoToday = today.toISOString().split("T")[0];

  // ------------------------------
  // FORM DATA (CONSULTING AGREEMENT FIELDS)
  // ------------------------------
  const [formData, setFormData] = useState({
    EFFECTIVE_DATE: isoToday,
    TERMINATION_DATE_OR_EVENT: "",
    NOTICE_PERIOD: "30", // Default value
    COMPENSATION_RATE: "",
    PAYMENT_FREQUENCY: "Monthly", // Default value
    NONSOLICIT_PERIOD: "12", // Default value
    SERVICE_AREA: "",

    // Company/Client Details
    COMPANY_NAME: "",
    COMPANY_ADDRESS: "",
    COMPANY_JURISDICTION: "",
    AUTHORIZED_SIGNATORY_NAME: "",
    AUTHORIZED_SIGNATORY_DESIGNATION: "",
    
    // Consultant Details
    CONSULTANT_NAME: "",
    CONSULTANT_ADDRESS: "",
    CONSULTANT_JURISDICTION: "",

    // Jurisdiction
    JURISDICTION_CITY: "",
  });

  const [template, setTemplate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // ------------------------------
  // ALIASES — CONSULTING AGREEMENT
  // ------------------------------
  const ALIASES = {
    "effective.date": "EFFECTIVE_DATE",
    "termination.date.or.event": "TERMINATION_DATE_OR_EVENT",
    "notice.period": "NOTICE_PERIOD",
    "compensation.rate": "COMPENSATION_RATE",
    "payment.frequency": "PAYMENT_FREQUENCY",
    "nonsolicit.period": "NONSOLICIT_PERIOD",
    "service.area": "SERVICE_AREA",

    "company.name": "COMPANY_NAME",
    "company.address": "COMPANY_ADDRESS",
    "company.jurisdiction": "COMPANY_JURISDICTION",
    "authorized.signatory.name": "AUTHORIZED_SIGNATORY_NAME",
    "authorized.signatory.designation": "AUTHORIZED_SIGNATORY_DESIGNATION",

    "consultant.name": "CONSULTANT_NAME",
    "consultant.address": "CONSULTANT_ADDRESS",
    "consultant.jurisdiction": "CONSULTANT_JURISDICTION",

    "jurisdiction.city": "JURISDICTION_CITY",
  };

  const placeholderToKey = (ph) => {
    const clean = String(ph || "").trim();

    if (formData.hasOwnProperty(clean)) return clean;

    // Handle nested aliases like company.name
    const alias = ALIASES[clean.toLowerCase()];
    if (alias) return alias;

    return clean.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
  };

  // ------------------------------
  // FETCH CONSULTING AGREEMENT TEMPLATE
  // ------------------------------
  useEffect(() => {
    // Assuming the API endpoint for the new template is '/get-template/consulting-agreement'
    fetch(`${import.meta.env.VITE_API_URL}/get-template/consulting-agreement`) 
      .then((res) => res.text())
      .then((text) => {
        setTemplate(text);
        setIsLoading(false);
      })
      .catch(() => {
        setTemplate("<p class='text-danger'>Error loading Consulting Agreement template.</p>");
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
      // Note: We skip the special date logic as the template will handle formatting
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
          document_type: "consulting-agreement", // Updated document type
          context: formData
        }),
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "Consulting_Agreement.pdf"; // Updated filename
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
  // INPUT COMPONENTS (Re-used for consistency)
  // ------------------------------
  const renderField = (key, label, type = "text") => (
    <div className="mb-3" key={key}>
      <label htmlFor={key} className="form-label fw-semibold">{label}</label>
      <input
        id={key}
        name={key}
        type={type}
        className="form-control"
        value={formData[key]}
        onChange={handleChange}
      />
    </div>
  );

  const renderSelect = (key, label, options) => (
    <div className="mb-3" key={key}>
      <label className="form-label fw-semibold">{label}</label>
      <select
        id={key}
        name={key}
        className="form-select"
        value={formData[key]}
        onChange={handleChange}
      >
        {options.map((o) => (
          <option value={o.value} key={o.value}>
            {o.label}
          </option>
        ))}
      </select>
    </div>
  );
  
  const paymentFrequencyOptions = [
    { value: "Monthly", label: "Monthly" },
    { value: "Quarterly", label: "Quarterly" },
    { value: "Upon Completion", label: "Upon Completion of Milestones" },
  ];

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
              <h3 className="text-secondary-teal">Consulting Agreement Details</h3>
            </div>

            <div className="card-body">
              <div className="accordion" id="consultingFormSections">
                
                {/* SECTION 1: AGREEMENT TERMS */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" data-bs-toggle="collapse" data-bs-target="#agreementTerms">
                      Agreement & Compensation
                    </button>
                  </h2>
                  <div id="agreementTerms" className="accordion-collapse collapse show">
                    <div className="accordion-body">
                      {renderField("EFFECTIVE_DATE", "Start Date", "date")}
                      {renderField("TERMINATION_DATE_OR_EVENT", "End Date or Event (e.g., 'Completion of Project X')")}
                      {renderField("SERVICE_AREA", "Area of Service (e.g., 'Web Development', 'Financial Modeling')")}
                      <hr className="my-4" />
                      <h4>Compensation</h4>
                      {renderField("COMPENSATION_RATE", "Fee/Rate (e.g., '₹50,000 per month' or '$150/hour')")}
                      {renderSelect("PAYMENT_FREQUENCY", "Payment Frequency", paymentFrequencyOptions)}
                      {renderField("NOTICE_PERIOD", "Termination Notice Period (in days/months)")}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: COMPANY/CLIENT */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#companyDetails">
                      Company / Client Details
                    </button>
                  </h2>
                  <div id="companyDetails" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      {renderField("COMPANY_NAME", "Company Name")}
                      {renderField("COMPANY_ADDRESS", "Principal Address")}
                      {renderField("COMPANY_JURISDICTION", "Governing Jurisdiction (e.g., 'India', 'Delaware')")}
                      <hr className="my-4" />
                      <h4>Signatory</h4>
                      {renderField("AUTHORIZED_SIGNATORY_NAME", "Authorized Signatory Name")}
                      {renderField("AUTHORIZED_SIGNATORY_DESIGNATION", "Signatory Designation")}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: CONSULTANT */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#consultantDetails">
                      Consultant Details
                    </button>
                  </h2>
                  <div id="consultantDetails" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      {renderField("CONSULTANT_NAME", "Consultant Name (Individual or Entity)")}
                      {renderField("CONSULTANT_ADDRESS", "Consultant Address")}
                      {renderField("CONSULTANT_JURISDICTION", "Consultant Jurisdiction (If Entity)")}
                      {renderField("NONSOLICIT_PERIOD", "Non-Solicitation Period (in months)")}
                    </div>
                  </div>
                </div>
                
                {/* SECTION 4: LEGAL/JURISDICTION */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#legalDetails">
                      Legal and Governing Law
                    </button>
                  </h2>
                  <div id="legalDetails" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      {renderField("JURISDICTION_CITY", "Dispute Jurisdiction City (e.g., 'Bengaluru')")}
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

export default ConsultingAgreementPage;
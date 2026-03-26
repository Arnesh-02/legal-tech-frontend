import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";

function NDAPage() {
  const navigate = useNavigate();
  const previewPanelRef = useRef(null);

  const today = new Date();
  const isoToday = today.toISOString().split("T")[0];

  // ------------------------------
  // FORM DATA (NO SIGNATURE FIELDS)
  // ------------------------------
  const [formData, setFormData] = useState({
    EFFECTIVE_DATE: isoToday,
    EFFECTIVE_DAY: today.getDate(),
    EFFECTIVE_MONTH: today.toLocaleString("en-US", { month: "long" }),
    EFFECTIVE_YEAR: today.getFullYear(),

    PARTY_1_NAME: "",
    PARTY_1_ADDRESS: "",
    PARTY_1_SHORT_NAME: "",
    PARTY_2_NAME: "",
    PARTY_2_ADDRESS: "",
    PROPOSED_TRANSACTION: "",
    PARTY_1_SIGNATORY_NAME: "",
    PARTY_1_SIGNATORY_DESIGNATION: "",
    PARTY_1_SIGN_PLACE: "",
    PARTY_2_SIGNATORY_NAME: "",
    PARTY_2_SIGNATORY_DESIGNATION: "",
    PARTY_2_SIGN_PLACE: ""
  });

  const [template, setTemplate] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isDownloading, setIsDownloading] = useState(false);

  // ------------------------------
  // ALIASES — NDA ONLY + GLOBAL
  // ------------------------------
  const ALIASES = {
    "party_1_name": "PARTY_1_NAME",
    "party_1_address": "PARTY_1_ADDRESS",
    "party_1_short_name": "PARTY_1_SHORT_NAME",

    "party_1_signatory_name": "PARTY_1_SIGNATORY_NAME",
    "party_1_signatory_designation": "PARTY_1_SIGNATORY_DESIGNATION",
    "party_1_sign_place": "PARTY_1_SIGN_PLACE",

    "party_2_name": "PARTY_2_NAME",
    "party_2_address": "PARTY_2_ADDRESS",
    "party_2_signatory_name": "PARTY_2_SIGNATORY_NAME",
    "party_2_signatory_designation": "PARTY_2_SIGNATORY_DESIGNATION",
    "party_2_sign_place": "PARTY_2_SIGN_PLACE",

    "effective_date": "EFFECTIVE_DATE",
    "effective_day": "EFFECTIVE_DAY",
    "effective_month": "EFFECTIVE_MONTH",
    "effective_year": "EFFECTIVE_YEAR",

    "proposed_transaction": "PROPOSED_TRANSACTION"
  };

  const placeholderToKey = (ph) => {
    const clean = String(ph || "").trim();

    if (formData.hasOwnProperty(clean)) return clean;

    const alias = ALIASES[clean.toLowerCase()];
    if (alias) return alias;

    return clean.replace(/[^a-zA-Z0-9]+/g, "_").toUpperCase();
  };

  // ------------------------------
  // FETCH NDA TEMPLATE
  // ------------------------------
  useEffect(() => {
    fetch(`${import.meta.env.VITE_API_URL}/get-template/nda`)
      .then((res) => res.text())
      .then((text) => {
        setTemplate(text);
        setIsLoading(false);
      })
      .catch(() => {
        setTemplate("<p class='text-danger'>Error loading NDA template.</p>");
        setIsLoading(false);
      });
  }, []);

  // ------------------------------
  // PREVIEW INTERACTION
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

    if (name === "EFFECTIVE_DATE") {
      const dt = new Date(value);
      setFormData((prev) => ({
        ...prev,
        EFFECTIVE_DATE: value,
        EFFECTIVE_DAY: dt.getDate(),
        EFFECTIVE_MONTH: dt.toLocaleString("en-US", { month: "long" }),
        EFFECTIVE_YEAR: dt.getFullYear()
      }));
    } else {
      setFormData((p) => ({ ...p, [name]: value }));
    }
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
          document_type: "nda",
          context: formData
        }),
      });

      if (!response.ok) throw new Error("PDF generation failed");

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);

      const a = document.createElement("a");
      a.href = url;
      a.download = "NDA_Agreement.pdf";
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
  // INPUT COMPONENT
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

  const transactionOptions = [
    { value: "", label: "Select..." },
    { value: "Merger or Acquisition", label: "Merger or Acquisition" },
    { value: "Strategic Partnership", label: "Strategic Partnership" },
    { value: "Software Licensing", label: "Software Licensing" },
    { value: "Investment Review", label: "Investment Review" }
  ];

  // ------------------------------
  // RENDER PAGE
  // ------------------------------
  return (
    <div className="container-fluid founders-page-container">
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
              <h3 className="text-secondary-teal">NDA Agreement Details</h3>
            </div>

            <div className="card-body">
              <div className="accordion" id="ndaFormSections">
                
                {/* SECTION 1: AGREEMENT */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button" data-bs-toggle="collapse" data-bs-target="#agreement">
                      Agreement Terms
                    </button>
                  </h2>
                  <div id="agreement" className="accordion-collapse collapse show">
                    <div className="accordion-body">
                      {renderField("EFFECTIVE_DATE", "Effective Date", "date")}
                      {renderSelect("PROPOSED_TRANSACTION", "Proposed Transaction", transactionOptions)}
                    </div>
                  </div>
                </div>

                {/* SECTION 2: PARTY 1 */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#party1">
                      Party 1 (Disclosing Party)
                    </button>
                  </h2>
                  <div id="party1" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      {renderField("PARTY_1_NAME", "Party 1 Name")}
                      {renderField("PARTY_1_ADDRESS", "Address")}
                      {renderField("PARTY_1_SHORT_NAME", "Short Name")}
                      {renderField("PARTY_1_SIGNATORY_NAME", "Signatory Name")}
                      {renderField("PARTY_1_SIGN_PLACE", "Place of Signing")}
                    </div>
                  </div>
                </div>

                {/* SECTION 3: PARTY 2 */}
                <div className="accordion-item">
                  <h2 className="accordion-header">
                    <button className="accordion-button collapsed" data-bs-toggle="collapse" data-bs-target="#party2">
                      Party 2 (Receiving Party)
                    </button>
                  </h2>
                  <div id="party2" className="accordion-collapse collapse">
                    <div className="accordion-body">
                      {renderField("PARTY_2_NAME", "Party 2 Name")}
                      {renderField("PARTY_2_ADDRESS", "Address")}
                      {renderField("PARTY_2_SIGNATORY_NAME", "Signatory Name")}
                      {renderField("PARTY_2_SIGN_PLACE", "Place of Signing")}
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
                <div className="spinner-border text-primary"></div>
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

export default NDAPage;

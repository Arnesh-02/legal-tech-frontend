import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/auth-context";
import { fetchUser } from "../api/auth";
import { Loader, FileText, UploadCloud, ShieldCheck } from "lucide-react";
import "../App.css";

const RiskAnalysisPage = () => {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);

  const [file, setFile] = useState(null);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");

  // 🔐 Auto-authenticate user
  useEffect(() => {
    const loadUser = async () => {
      try {
        const response = await fetchUser();
        if (response?.data?.user) setUser(response.data.user);
        else navigate("/login");
      } catch (err) {
        navigate("/login");
      }
    };

    loadUser();
  }, []);

  // 📂 Handle file upload
  const handleFileUpload = (e) => {
    const uploaded = e.target.files[0];
    if (!uploaded) return;

    if (
      uploaded.type !== "application/pdf" &&
      !uploaded.name.endsWith(".doc") &&
      !uploaded.name.endsWith(".docx")
    ) {
      setErrorMsg("Only PDF, DOC, and DOCX files are allowed.");
      return;
    }

    setFile(uploaded);
    setErrorMsg("");
  };

  // 🚀 Run Risk Analysis
  const handleRiskAnalysis = async () => {
  if (!file) {
    setErrorMsg("Please upload a document first.");
    return;
  }

  setIsAnalyzing(true);

  const formData = new FormData();
  formData.append("file", file);

  try {
    const API_URL = import.meta.env.VITE_API_URL;

    const response = await fetch(`${API_URL}/risk-analysis`, {
      method: "POST",
      body: formData,
      credentials: "include"
    });

    const result = await response.json();

    setIsAnalyzing(false);
    navigate("/risk-report", { state: { analysis: result } });

  } catch (err) {
    setIsAnalyzing(false);
    setErrorMsg("Something went wrong. Try again.");
  }
  };

  return (
    <div className="risk-page-container">
      <div className="risk-card">
        <h2 className="risk-title">
          <ShieldCheck size={26} /> Contract Risk Analysis
        </h2>

        <p className="risk-subtitle">
          Upload your contract (PDF or Word) to generate a detailed legal risk assessment.
        </p>

        {/* FILE UPLOAD BOX */}
        <label className="upload-box">
          <UploadCloud size={40} className="upload-icon" />
          <p className="upload-text">
            {file ? (
              <>
                <FileText size={20} /> {file.name}
              </>
            ) : (
              "Click to upload PDF or Word document"
            )}
          </p>
          <input
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={handleFileUpload}
            hidden
          />
        </label>

        {errorMsg && <p className="error-text">{errorMsg}</p>}

        {/* ANALYZE BUTTON */}
        <button
          className="analyze-btn"
          onClick={handleRiskAnalysis}
          disabled={isAnalyzing}
        >
          {isAnalyzing ? (
            <>
              <Loader size={20} className="spin" /> Analyzing...
            </>
          ) : (
            "Run Risk Analysis"
          )}
        </button>
      </div>
    </div>
  );
};

export default RiskAnalysisPage;

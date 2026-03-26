import React from "react";
import { useNavigate } from "react-router-dom";

const DocumentTemplatesPage = () => {
  const navigate = useNavigate();

  const templates = [
    { name: "Founders Agreement", route: "/generate-founders-agreement" },
    { name: "NDA Agreement", route: "/generate-nda" },
    { name: "Consulting Agreement", route: "/generate-consulting-aggrement" },
    { name: "Convertible Note", route: "/generate-convertible-note" }
  ];

  return (
    <div
      style={{
        height: "100vh",
        width: "100vw",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        paddingTop: "40px",
        background: "#f7f7f7"
      }}
    >
      <h2 style={{ marginBottom: "30px", fontSize: "28px" }}>
        Select a Document Template
      </h2>

      <div
        style={{
          width: "90%",
          maxWidth: "1200px",
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          gap: "25px",
          marginTop:"150px"
        }}
      >
        {templates.map((temp, index) => (
          <div
            key={index}
            onClick={() => navigate(temp.route)}
            style={{
              height: "160px",
              padding: "20px",
              borderRadius: "12px",
              background: "#ffffff",
              border: "1px solid #e0e0e0",
              cursor: "pointer",
              fontSize: "20px",
              fontWeight: "500",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              textAlign: "center",
              boxShadow: "0px 4px 12px rgba(0,0,0,0.1)",
              transition: "all 0.3s ease"
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.transform = "translateY(-5px)";
              e.currentTarget.style.boxShadow = "0px 8px 20px rgba(0,0,0,0.15)";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.transform = "translateY(0)";
              e.currentTarget.style.boxShadow = "0px 4px 12px rgba(0,0,0,0.1)";
            }}
          >
            {temp.name}
          </div>
        ))}
      </div>
    </div>
  );
};

export default DocumentTemplatesPage;

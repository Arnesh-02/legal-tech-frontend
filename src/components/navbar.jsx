import React, { useState, useContext, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { AuthContext } from "../context/auth-context";
import { logoutUser } from "../api/auth";

function Navbar() {
  const navigate = useNavigate();
  const { user, setUser } = useContext(AuthContext);
  const [isDropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const logout = async () => {
    try { await logoutUser(); } catch {}
    setUser(null);
    navigate("/login");
  };

  const goToAdvocatesPage = () => navigate("/advocates");

  return (
    <header style={styles.navbar}>
      <div style={styles.navInner}>
        {/* Brand */}
        <div style={styles.brand} onClick={() => navigate("/")}>
          <span style={styles.brandDot} />
          Legal Tech
        </div>

        {/* Nav links */}
        <nav style={styles.links}>
          {[
            { label: "Home", path: "/" },
            { label: "Documents", path: "/document-templates" },
            { label: "Risk Analysis", path: "/risk-analysis" },
            { label: "Find Advocate", path: "/advocates" },
          ].map(({ label, path }) => (
            <span
              key={path}
              style={styles.link}
              onClick={() => navigate(path)}
              onMouseEnter={e => Object.assign(e.target.style, styles.linkHover)}
              onMouseLeave={e => Object.assign(e.target.style, { background: "transparent", color: "var(--nt-muted)" })}
            >
              {label}
            </span>
          ))}
        </nav>

        {/* Right section */}
        <div style={styles.right}>
          {user ? (
            <div ref={dropdownRef} style={{ position: "relative" }}>
              <div
                style={styles.userInfo}
                onClick={() => setDropdownOpen((o) => !o)}
              >
                <img
                  src={user.picture || "/default-avatar.png"}
                  alt="avatar"
                  style={styles.avatar}
                  onError={(e) => {
                    const name = user.name || user.email || "User";
                    e.target.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=1D9E75&color=fff`;
                  }}
                />
                <span style={styles.userName}>{user.name || user.email}</span>
                <ChevronDown
                  size={14}
                  style={{
                    color: "var(--nt-muted)",
                    transform: isDropdownOpen ? "rotate(180deg)" : "rotate(0deg)",
                    transition: "transform .2s",
                  }}
                />
              </div>

              {isDropdownOpen && (
                <div style={styles.dropdown}>
                  {[
                    { label: "Dashboard", path: "/dashboard" },
                    { label: "Documents", path: "/document-history" },
                    { label: "Profile", path: "/profile" },
                  ].map(({ label, path }) => (
                    <div
                      key={path}
                      style={styles.dropItem}
                      onClick={() => { setDropdownOpen(false); navigate(path); }}
                      onMouseEnter={e => e.currentTarget.style.background = "var(--nt-bg2)"}
                      onMouseLeave={e => e.currentTarget.style.background = "transparent"}
                    >
                      {label}
                    </div>
                  ))}
                  <div style={{ ...styles.dropItem, ...styles.logoutItem }} onClick={logout}
                    onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"}
                    onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    Logout
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div style={styles.authBtns}>
              <button style={styles.loginBtn} onClick={() => navigate("/login")}>Login</button>
              <button style={styles.registerBtn} onClick={() => navigate("/signup")}>Register</button>
            </div>
          )}
          <button style={styles.ctaBtn} onClick={goToAdvocatesPage}>
            Call an Expert
          </button>
        </div>
      </div>
    </header>
  );
}

const styles = {
  navbar: {
    position: "sticky",
    top: 0,
    zIndex: 100,
    background: "var(--nt-bg)",
    borderBottom: "0.5px solid var(--nt-border)",
    backdropFilter: "blur(8px)",
  },
  navInner: {
    maxWidth: 1100,
    margin: "0 auto",
    padding: "0 28px",
    height: 56,
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    gap: 16,
  },
  brand: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    fontSize: 15,
    fontWeight: 500,
    color: "var(--nt-text)",
    cursor: "pointer",
    userSelect: "none",
  },
  brandDot: {
    width: 7,
    height: 7,
    borderRadius: "50%",
    background: "#1D9E75",
    display: "inline-block",
  },
  links: {
    display: "flex",
    gap: 2,
  },
  link: {
    fontSize: 13,
    color: "var(--nt-muted)",
    padding: "6px 11px",
    borderRadius: 8,
    cursor: "pointer",
    transition: "background .15s, color .15s",
    background: "transparent",
    userSelect: "none",
  },
  linkHover: {
    background: "var(--nt-bg2)",
    color: "var(--nt-text)",
  },
  right: {
    display: "flex",
    alignItems: "center",
    gap: 8,
  },
  userInfo: {
    display: "flex",
    alignItems: "center",
    gap: 7,
    cursor: "pointer",
    padding: "5px 10px",
    borderRadius: 8,
    transition: "background .15s",
  },
  avatar: {
    width: 26,
    height: 26,
    borderRadius: "50%",
    objectFit: "cover",
  },
  userName: {
    fontSize: 13,
    color: "var(--nt-text)",
    fontWeight: 500,
  },
  dropdown: {
    position: "absolute",
    top: "calc(100% + 6px)",
    right: 0,
    background: "var(--nt-bg)",
    border: "0.5px solid var(--nt-border)",
    borderRadius: 10,
    minWidth: 160,
    boxShadow: "0 4px 16px rgba(0,0,0,0.08)",
    overflow: "hidden",
    zIndex: 200,
  },
  dropItem: {
    padding: "9px 14px",
    fontSize: 13,
    color: "var(--nt-text)",
    cursor: "pointer",
    transition: "background .12s",
  },
  logoutItem: {
    color: "#DC2626",
    borderTop: "0.5px solid var(--nt-border)",
  },
  authBtns: {
    display: "flex",
    gap: 6,
  },
  loginBtn: {
    fontSize: 13,
    color: "var(--nt-muted)",
    padding: "7px 14px",
    borderRadius: 8,
    background: "none",
    border: "0.5px solid var(--nt-border)",
    cursor: "pointer",
    transition: "background .15s",
  },
  registerBtn: {
    fontSize: 13,
    color: "var(--nt-text)",
    padding: "7px 14px",
    borderRadius: 8,
    background: "var(--nt-bg2)",
    border: "0.5px solid var(--nt-border)",
    cursor: "pointer",
    fontWeight: 500,
  },
  ctaBtn: {
    fontSize: 13,
    fontWeight: 500,
    padding: "8px 16px",
    borderRadius: 8,
    background: "#1D9E75",
    color: "#fff",
    border: "none",
    cursor: "pointer",
    transition: "opacity .15s",
  },
};

export default Navbar;
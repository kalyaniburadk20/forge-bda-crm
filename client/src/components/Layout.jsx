import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";
import { initials } from "../utils/helpers.js";

export default function Layout({ children }) {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const isManager = user?.role === "manager" || user?.role === "admin";

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="app-shell">
      <aside className="sidebar">
        <div className="brand">Forge<span>.</span></div>
        <div className="brand-sub">BDA Sales CRM</div>

        <nav style={{ flex: 1 }}>
          <NavLink to="/" end className="nav-link">Dashboard</NavLink>
          <NavLink to="/pipeline" className="nav-link">Pipeline</NavLink>
          <NavLink to="/leads" className="nav-link">All Leads</NavLink>
          {isManager && <NavLink to="/team" className="nav-link">Team Performance</NavLink>}
        </nav>

        <button className="btn btn-ghost btn-sm" onClick={handleLogout}>
          Sign out
        </button>
      </aside>

      <main className="main">
        <div className="topbar">
          <div />
          <div className="user-chip">
            <div className="avatar">{initials(user?.name)}</div>
            <div>
              <div style={{ fontSize: "0.88rem", fontWeight: 600 }}>{user?.name}</div>
              <div style={{ fontSize: "0.72rem", color: "var(--text-dim)", textTransform: "capitalize" }}>
                {user?.role}
              </div>
            </div>
          </div>
        </div>
        {children}
      </main>
    </div>
  );
}

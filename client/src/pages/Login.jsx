import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext.jsx";

export default function Login() {
  const { login, register } = useAuth();
  const navigate = useNavigate();
  const [mode, setMode] = useState("login");
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async () => {
    setError("");
    setLoading(true);
    try {
      if (mode === "login") {
        await login(form.email, form.password);
      } else {
        await register({ ...form, role: "associate" });
      }
      navigate("/");
    } catch (e) {
      setError(e.response?.data?.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-wrap">
      <div className="card auth-card">
        <div className="brand" style={{ fontSize: "1.8rem" }}>Forge<span>.</span></div>
        <h1>{mode === "login" ? "Welcome back" : "Create account"}</h1>
        <p className="muted" style={{ marginBottom: "1.5rem" }}>
          Sales pipeline & BDA team workspace
        </p>

        {mode === "register" && (
          <div className="field">
            <span className="label">Name</span>
            <input name="name" value={form.name} onChange={change} />
          </div>
        )}
        <div className="field">
          <span className="label">Email</span>
          <input name="email" type="email" value={form.email} onChange={change}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>
        <div className="field">
          <span className="label">Password</span>
          <input name="password" type="password" value={form.password} onChange={change}
            onKeyDown={(e) => e.key === "Enter" && submit()} />
        </div>

        {error && <div className="error">{error}</div>}

        <button className="btn" style={{ width: "100%" }} onClick={submit} disabled={loading}>
          {loading ? "Please wait…" : mode === "login" ? "Sign in" : "Sign up"}
        </button>

        <p className="muted" style={{ marginTop: "1rem", textAlign: "center" }}>
          {mode === "login" ? "No account? " : "Have an account? "}
          <button
            className="btn-ghost btn-sm"
            style={{ background: "none", border: "none", color: "var(--accent)", padding: 0 }}
            onClick={() => setMode(mode === "login" ? "register" : "login")}
          >
            {mode === "login" ? "Register" : "Sign in"}
          </button>
        </p>

        <div className="demo-box">
          <strong>Demo logins</strong> (password: <code>password123</code>)<br />
          admin@crm.com · manager@crm.com · arjun@crm.com
        </div>
      </div>
    </div>
  );
}

import { useEffect, useState } from "react";
import api from "../api/api.js";
import Layout from "../components/Layout.jsx";
import { fmtCurrency, initials } from "../utils/helpers.js";

export default function Team() {
  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get("/dashboard/team")
      .then((r) => setRows(r.data))
      .finally(() => setLoading(false));
  }, []);

  return (
    <Layout>
      <div>
        <h1 className="page-title">Team Performance</h1>
        <p className="page-sub">Leaderboard ranked by closed-won value</p>
      </div>

      <div className="card" style={{ marginTop: "1.6rem", padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>#</th><th>Associate</th><th>Total Leads</th>
                <th>Won</th><th>Won Value</th><th>Open Pipeline</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r, i) => (
                <tr key={r.email}>
                  <td style={{ color: "var(--text-dim)" }}>{i + 1}</td>
                  <td>
                    <div style={{ display: "flex", alignItems: "center", gap: "0.6rem" }}>
                      <div className="avatar" style={{ width: 30, height: 30, fontSize: "0.72rem" }}>
                        {initials(r.name)}
                      </div>
                      <div>
                        <div style={{ fontWeight: 600 }}>{r.name}</div>
                        <div style={{ fontSize: "0.74rem", color: "var(--text-dim)" }}>{r.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{r.total}</td>
                  <td style={{ color: "var(--green)", fontWeight: 600 }}>{r.won}</td>
                  <td style={{ color: "var(--accent)", fontWeight: 600 }}>{fmtCurrency(r.wonValue)}</td>
                  <td style={{ color: "var(--text-dim)" }}>{fmtCurrency(r.pipelineValue)}</td>
                </tr>
              ))}
              {rows.length === 0 && (
                <tr><td colSpan={6} className="loading">No team data yet</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>
    </Layout>
  );
}

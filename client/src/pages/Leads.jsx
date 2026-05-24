import { useEffect, useState, useCallback } from "react";
import api from "../api/api.js";
import Layout from "../components/Layout.jsx";
import LeadModal from "../components/LeadModal.jsx";
import { useAuth } from "../context/AuthContext.jsx";
import { STAGES, fmtCurrency } from "../utils/helpers.js";

export default function Leads() {
  const { user } = useAuth();
  const isManager = user.role === "manager" || user.role === "admin";
  const [leads, setLeads] = useState([]);
  const [search, setSearch] = useState("");
  const [stage, setStage] = useState("");
  const [modal, setModal] = useState(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    setLoading(true);
    const params = {};
    if (search) params.search = search;
    if (stage) params.stage = stage;
    const { data } = await api.get("/leads", { params });
    setLeads(data);
    setLoading(false);
  }, [search, stage]);

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
  }, [load]);

  const remove = async (id) => {
    if (!confirm("Delete this lead?")) return;
    await api.delete(`/leads/${id}`);
    load();
  };

  return (
    <Layout>
      <div className="topbar" style={{ marginBottom: "1.4rem" }}>
        <div>
          <h1 className="page-title">All Leads</h1>
          <p className="page-sub">{leads.length} lead{leads.length !== 1 ? "s" : ""} in view</p>
        </div>
        <button className="btn" onClick={() => setModal({})}>+ New Lead</button>
      </div>

      <div className="toolbar">
        <input placeholder="Search company or contact…" value={search}
          onChange={(e) => setSearch(e.target.value)} />
        <select value={stage} onChange={(e) => setStage(e.target.value)}>
          <option value="">All stages</option>
          {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
        </select>
      </div>

      <div className="card" style={{ padding: 0, overflow: "hidden" }}>
        {loading ? (
          <div className="loading">Loading…</div>
        ) : (
          <table className="table">
            <thead>
              <tr>
                <th>Company</th><th>Contact</th><th>Stage</th>
                <th>Value</th><th>Owner</th><th></th>
              </tr>
            </thead>
            <tbody>
              {leads.map((l) => (
                <tr key={l._id}>
                  <td style={{ cursor: "pointer", fontWeight: 600 }} onClick={() => setModal(l)}>
                    {l.company}
                  </td>
                  <td>{l.contactName}</td>
                  <td>
                    <span className="tag" style={{
                      background: "var(--surface-2)",
                      color: STAGES.find((s) => s.key === l.stage)?.color,
                    }}>
                      {STAGES.find((s) => s.key === l.stage)?.label}
                    </span>
                  </td>
                  <td style={{ color: "var(--accent)", fontWeight: 600 }}>{fmtCurrency(l.value)}</td>
                  <td style={{ color: "var(--text-dim)" }}>{l.owner?.name || "—"}</td>
                  <td style={{ textAlign: "right" }}>
                    <button className="btn-ghost btn-sm" style={{ borderRadius: 8, marginRight: 6 }}
                      onClick={() => setModal(l)}>Edit</button>
                    {isManager && (
                      <button className="btn-ghost btn-sm" style={{ borderRadius: 8, color: "var(--red)" }}
                        onClick={() => remove(l._id)}>Delete</button>
                    )}
                  </td>
                </tr>
              ))}
              {leads.length === 0 && (
                <tr><td colSpan={6} className="loading">No leads found</td></tr>
              )}
            </tbody>
          </table>
        )}
      </div>

      {modal !== null && (
        <LeadModal
          lead={modal._id ? modal : null}
          onClose={() => setModal(null)}
          onSaved={() => { setModal(null); load(); }}
        />
      )}
    </Layout>
  );
}

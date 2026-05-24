import { useEffect, useState, useCallback } from "react";
import api from "../api/api.js";
import Layout from "../components/Layout.jsx";
import LeadModal from "../components/LeadModal.jsx";
import { STAGES, PRIORITY_COLORS, fmtCurrency } from "../utils/helpers.js";

export default function Pipeline() {
  const [leads, setLeads] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dragId, setDragId] = useState(null);
  const [dragOver, setDragOver] = useState(null);
  const [modal, setModal] = useState(null); // null | {} | lead

  const load = useCallback(async () => {
    setLoading(true);
    const { data } = await api.get("/leads");
    setLeads(data);
    setLoading(false);
  }, []);

  useEffect(() => { load(); }, [load]);

  const onDrop = async (stage) => {
    setDragOver(null);
    const id = dragId;
    setDragId(null);
    if (!id) return;
    const lead = leads.find((l) => l._id === id);
    if (!lead || lead.stage === stage) return;
    // optimistic update
    setLeads((prev) => prev.map((l) => (l._id === id ? { ...l, stage } : l)));
    try {
      await api.patch(`/leads/${id}/stage`, { stage });
    } catch {
      load(); // revert on failure
    }
  };

  return (
    <Layout>
      <div className="topbar" style={{ marginBottom: "1.4rem" }}>
        <div>
          <h1 className="page-title">Pipeline</h1>
          <p className="page-sub">Drag leads between stages to update them</p>
        </div>
        <button className="btn" onClick={() => setModal({})}>+ New Lead</button>
      </div>

      {loading ? (
        <div className="loading">Loading pipeline…</div>
      ) : (
        <div className="board">
          {STAGES.map((stage) => {
            const items = leads.filter((l) => l.stage === stage.key);
            const total = items.reduce((s, l) => s + (l.value || 0), 0);
            return (
              <div
                key={stage.key}
                className={`column ${dragOver === stage.key ? "drag-over" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragOver(stage.key); }}
                onDragLeave={() => setDragOver(null)}
                onDrop={() => onDrop(stage.key)}
              >
                <div className="col-head">
                  <span className="col-title" style={{ color: stage.color }}>{stage.label}</span>
                  <span className="col-count">{items.length}</span>
                </div>
                <div style={{ fontSize: "0.75rem", color: "var(--text-dim)", marginBottom: "0.8rem" }}>
                  {fmtCurrency(total)}
                </div>
                {items.map((lead) => (
                  <div
                    key={lead._id}
                    className="lead-card"
                    draggable
                    onDragStart={() => setDragId(lead._id)}
                    onClick={() => setModal(lead)}
                  >
                    <div className="lead-company">{lead.company}</div>
                    <div className="lead-contact">{lead.contactName}</div>
                    <div className="lead-meta">
                      <span className="lead-value">{fmtCurrency(lead.value)}</span>
                      <span className="tag" style={{
                        background: "var(--surface)",
                        color: PRIORITY_COLORS[lead.priority],
                        border: `1px solid ${PRIORITY_COLORS[lead.priority]}`,
                      }}>
                        {lead.priority}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}

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

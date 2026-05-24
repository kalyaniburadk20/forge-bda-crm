import { useState, useEffect } from "react";
import api from "../api/api.js";
import { useAuth } from "../context/AuthContext.jsx";
import { STAGES, fmtCurrency } from "../utils/helpers.js";

const empty = {
  company: "", contactName: "", email: "", phone: "",
  value: 0, source: "other", priority: "medium", stage: "new", owner: "",
};

export default function LeadModal({ lead, onClose, onSaved }) {
  const { user } = useAuth();
  const isManager = user.role === "manager" || user.role === "admin";
  const [form, setForm] = useState(empty);
  const [team, setTeam] = useState([]);
  const [note, setNote] = useState("");
  const [activities, setActivities] = useState([]);
  const [saving, setSaving] = useState(false);

  const editing = Boolean(lead?._id);

  useEffect(() => {
    if (lead) {
      setForm({ ...empty, ...lead, owner: lead.owner?._id || lead.owner || "" });
      setActivities(lead.activities || []);
    } else {
      setForm(empty);
    }
  }, [lead]);

  useEffect(() => {
    if (isManager) api.get("/users").then((r) => setTeam(r.data)).catch(() => {});
  }, [isManager]);

  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const save = async () => {
    setSaving(true);
    try {
      const payload = { ...form, value: Number(form.value) };
      if (!isManager) delete payload.owner;
      if (editing) {
        await api.put(`/leads/${lead._id}`, payload);
      } else {
        await api.post("/leads", payload);
      }
      onSaved();
    } catch (e) {
      alert(e.response?.data?.message || "Save failed");
    } finally {
      setSaving(false);
    }
  };

  const addNote = async () => {
    if (!note.trim()) return;
    const { data } = await api.post(`/leads/${lead._id}/activities`, {
      type: "note",
      message: note,
    });
    setActivities(data);
    setNote("");
  };

  return (
    <div className="overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-head">
          <h2 style={{ fontSize: "1.3rem" }}>{editing ? "Edit Lead" : "New Lead"}</h2>
          <button className="btn btn-ghost btn-sm" onClick={onClose}>Close</button>
        </div>
        <div className="modal-body">
          <div className="field">
            <span className="label">Company</span>
            <input name="company" value={form.company} onChange={change} />
          </div>
          <div className="row-2">
            <div className="field">
              <span className="label">Contact Name</span>
              <input name="contactName" value={form.contactName} onChange={change} />
            </div>
            <div className="field">
              <span className="label">Phone</span>
              <input name="phone" value={form.phone} onChange={change} />
            </div>
          </div>
          <div className="field">
            <span className="label">Email</span>
            <input name="email" value={form.email} onChange={change} />
          </div>
          <div className="row-2">
            <div className="field">
              <span className="label">Deal Value (₹)</span>
              <input name="value" type="number" value={form.value} onChange={change} />
            </div>
            <div className="field">
              <span className="label">Stage</span>
              <select name="stage" value={form.stage} onChange={change}>
                {STAGES.map((s) => <option key={s.key} value={s.key}>{s.label}</option>)}
              </select>
            </div>
          </div>
          <div className="row-2">
            <div className="field">
              <span className="label">Source</span>
              <select name="source" value={form.source} onChange={change}>
                {["referral", "website", "cold-call", "event", "other"].map((s) => (
                  <option key={s} value={s}>{s}</option>
                ))}
              </select>
            </div>
            <div className="field">
              <span className="label">Priority</span>
              <select name="priority" value={form.priority} onChange={change}>
                {["low", "medium", "high"].map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
            </div>
          </div>
          {isManager && (
            <div className="field">
              <span className="label">Assign Owner</span>
              <select name="owner" value={form.owner} onChange={change}>
                <option value="">— Me —</option>
                {team.map((u) => <option key={u._id} value={u._id}>{u.name} ({u.role})</option>)}
              </select>
            </div>
          )}

          <button className="btn" style={{ width: "100%" }} onClick={save} disabled={saving}>
            {saving ? "Saving…" : editing ? "Update Lead" : "Create Lead"}
          </button>

          {editing && (
            <div style={{ marginTop: "1.6rem" }}>
              <span className="label">Activity Log</span>
              <div style={{ display: "flex", gap: "0.5rem", margin: "0.5rem 0 1rem" }}>
                <input
                  placeholder="Add a note or call summary…"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && addNote()}
                />
                <button className="btn btn-sm" onClick={addNote}>Add</button>
              </div>
              {[...activities].reverse().map((a, i) => (
                <div className="activity-item" key={a._id || i}>
                  <div>{a.message}</div>
                  <div className="activity-meta">
                    {a.type} · {a.createdBy?.name || "—"} ·{" "}
                    {a.createdAt ? new Date(a.createdAt).toLocaleString() : ""}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

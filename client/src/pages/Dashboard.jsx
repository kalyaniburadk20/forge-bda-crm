import { useEffect, useState } from "react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell,
} from "recharts";
import api from "../api/api.js";
import Layout from "../components/Layout.jsx";
import { STAGES, fmtCurrency } from "../utils/helpers.js";

export default function Dashboard() {
  const [stats, setStats] = useState(null);

  useEffect(() => {
    api.get("/dashboard/stats").then((r) => setStats(r.data)).catch(() => {});
  }, []);

  if (!stats) {
    return <Layout><div className="loading">Loading dashboard…</div></Layout>;
  }

  const chartData = stats.byStage.map((s) => ({
    ...s,
    label: STAGES.find((x) => x.key === s.stage)?.label || s.stage,
    color: STAGES.find((x) => x.key === s.stage)?.color,
  }));

  const cards = [
    { label: "Total Leads", value: stats.totalLeads },
    { label: "Pipeline Value", value: fmtCurrency(stats.pipelineValue) },
    { label: "Won Value", value: fmtCurrency(stats.wonValue) },
    { label: "Win Rate", value: `${stats.winRate}%` },
  ];

  return (
    <Layout>
      <div>
        <h1 className="page-title">Dashboard</h1>
        <p className="page-sub">Your sales pipeline at a glance</p>
      </div>

      <div className="stat-grid" style={{ marginTop: "1.6rem" }}>
        {cards.map((c) => (
          <div className="card stat-card" key={c.label}>
            <div className="stat-label">{c.label}</div>
            <div className="stat-value">{c.value}</div>
          </div>
        ))}
      </div>

      <div className="card">
        <h2 style={{ fontSize: "1.2rem", marginBottom: "1.2rem" }}>Leads by Stage</h2>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <XAxis dataKey="label" stroke="#a89c87" fontSize={12} />
            <YAxis stroke="#a89c87" fontSize={12} allowDecimals={false} />
            <Tooltip
              contentStyle={{ background: "#1c1916", border: "1px solid #38322a", borderRadius: 10 }}
              labelStyle={{ color: "#f2ece1" }}
            />
            <Bar dataKey="count" radius={[6, 6, 0, 0]}>
              {chartData.map((entry, i) => <Cell key={i} fill={entry.color} />)}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </Layout>
  );
}

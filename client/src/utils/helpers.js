export const STAGES = [
  { key: "new", label: "New", color: "#6d97c4" },
  { key: "contacted", label: "Contacted", color: "#c4a96d" },
  { key: "qualified", label: "Qualified", color: "#9b8ec4" },
  { key: "proposal", label: "Proposal", color: "#e0913a" },
  { key: "won", label: "Won", color: "#6fae6f" },
  { key: "lost", label: "Lost", color: "#cf6b5a" },
];

export const PRIORITY_COLORS = {
  low: "#6d97c4",
  medium: "#c4a96d",
  high: "#cf6b5a",
};

export const fmtCurrency = (n) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(n || 0);

export const initials = (name = "") =>
  name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();

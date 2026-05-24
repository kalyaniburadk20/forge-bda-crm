import asyncHandler from "express-async-handler";
import Lead from "../models/Lead.js";
import User from "../models/User.js";

const scopeFilter = async (user) => {
  if (user.role === "admin") return {};
  if (user.role === "manager") {
    const team = await User.find({ manager: user._id }).select("_id");
    const ids = team.map((u) => u._id);
    ids.push(user._id);
    return { owner: { $in: ids } };
  }
  return { owner: user._id };
};

// @desc   Aggregated dashboard metrics
// @route  GET /api/dashboard/stats
// @access Private
export const getStats = asyncHandler(async (req, res) => {
  const filter = await scopeFilter(req.user);

  const leads = await Lead.find(filter);
  const stages = ["new", "contacted", "qualified", "proposal", "won", "lost"];

  const byStage = stages.map((s) => ({
    stage: s,
    count: leads.filter((l) => l.stage === s).length,
    value: leads
      .filter((l) => l.stage === s)
      .reduce((sum, l) => sum + (l.value || 0), 0),
  }));

  const totalLeads = leads.length;
  const won = leads.filter((l) => l.stage === "won");
  const lost = leads.filter((l) => l.stage === "lost");
  const closed = won.length + lost.length;

  const stats = {
    totalLeads,
    pipelineValue: leads
      .filter((l) => !["won", "lost"].includes(l.stage))
      .reduce((s, l) => s + (l.value || 0), 0),
    wonValue: won.reduce((s, l) => s + (l.value || 0), 0),
    winRate: closed ? Math.round((won.length / closed) * 100) : 0,
    byStage,
  };

  res.json(stats);
});

// @desc   Per-associate performance leaderboard (manager/admin)
// @route  GET /api/dashboard/team
// @access Private (manager/admin)
export const getTeamPerformance = asyncHandler(async (req, res) => {
  const filter = await scopeFilter(req.user);
  const leads = await Lead.find(filter).populate("owner", "name email");

  const map = {};
  leads.forEach((l) => {
    if (!l.owner) return;
    const id = l.owner._id.toString();
    if (!map[id]) {
      map[id] = {
        name: l.owner.name,
        email: l.owner.email,
        total: 0,
        won: 0,
        wonValue: 0,
        pipelineValue: 0,
      };
    }
    map[id].total += 1;
    if (l.stage === "won") {
      map[id].won += 1;
      map[id].wonValue += l.value || 0;
    } else if (l.stage !== "lost") {
      map[id].pipelineValue += l.value || 0;
    }
  });

  res.json(Object.values(map).sort((a, b) => b.wonValue - a.wonValue));
});

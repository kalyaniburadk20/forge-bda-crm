import asyncHandler from "express-async-handler";
import Lead from "../models/Lead.js";
import User from "../models/User.js";

// Build a query filter based on the requester's role.
// - admin: sees everything
// - manager: sees own leads + leads of associates reporting to them
// - associate: sees only their own leads
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

// @desc   Get leads (scoped by role), with optional stage filter
// @route  GET /api/leads
// @access Private
export const getLeads = asyncHandler(async (req, res) => {
  const filter = await scopeFilter(req.user);
  if (req.query.stage) filter.stage = req.query.stage;
  if (req.query.search) {
    filter.$or = [
      { company: { $regex: req.query.search, $options: "i" } },
      { contactName: { $regex: req.query.search, $options: "i" } },
    ];
  }

  const leads = await Lead.find(filter)
    .populate("owner", "name email role")
    .sort({ updatedAt: -1 });

  res.json(leads);
});

// @desc   Get single lead
// @route  GET /api/leads/:id
// @access Private
export const getLeadById = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id)
    .populate("owner", "name email role")
    .populate("activities.createdBy", "name");

  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  res.json(lead);
});

// @desc   Create a lead
// @route  POST /api/leads
// @access Private
export const createLead = asyncHandler(async (req, res) => {
  const { company, contactName, email, phone, value, source, priority, expectedCloseDate, owner } =
    req.body;

  // Associates can only assign leads to themselves
  let assignedOwner = req.user._id;
  if ((req.user.role === "admin" || req.user.role === "manager") && owner) {
    assignedOwner = owner;
  }

  const lead = await Lead.create({
    company,
    contactName,
    email,
    phone,
    value,
    source,
    priority,
    expectedCloseDate,
    owner: assignedOwner,
  });

  res.status(201).json(lead);
});

// @desc   Update a lead (general fields)
// @route  PUT /api/leads/:id
// @access Private
export const updateLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  const fields = [
    "company",
    "contactName",
    "email",
    "phone",
    "value",
    "source",
    "priority",
    "expectedCloseDate",
    "owner",
  ];
  fields.forEach((f) => {
    if (req.body[f] !== undefined) lead[f] = req.body[f];
  });

  const updated = await lead.save();
  res.json(updated);
});

// @desc   Move a lead to a new pipeline stage (Kanban drag/drop)
// @route  PATCH /api/leads/:id/stage
// @access Private
export const updateLeadStage = asyncHandler(async (req, res) => {
  const { stage } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }

  const prev = lead.stage;
  lead.stage = stage;
  lead.activities.push({
    type: "stage_change",
    message: `Stage changed from "${prev}" to "${stage}"`,
    createdBy: req.user._id,
  });

  const updated = await lead.save();
  res.json(updated);
});

// @desc   Add an activity/note to a lead
// @route  POST /api/leads/:id/activities
// @access Private
export const addActivity = asyncHandler(async (req, res) => {
  const { type, message } = req.body;
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  lead.activities.push({ type, message, createdBy: req.user._id });
  await lead.save();
  const populated = await Lead.findById(lead._id).populate(
    "activities.createdBy",
    "name"
  );
  res.status(201).json(populated.activities);
});

// @desc   Delete a lead
// @route  DELETE /api/leads/:id
// @access Private (manager/admin only — enforced in routes)
export const deleteLead = asyncHandler(async (req, res) => {
  const lead = await Lead.findById(req.params.id);
  if (!lead) {
    res.status(404);
    throw new Error("Lead not found");
  }
  await lead.deleteOne();
  res.json({ message: "Lead removed" });
});

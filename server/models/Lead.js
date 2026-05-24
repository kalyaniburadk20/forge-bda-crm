import mongoose from "mongoose";

// Embedded sub-document for communication/activity log on a lead
const activitySchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["note", "call", "email", "meeting", "stage_change"],
      default: "note",
    },
    message: { type: String, required: true },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

const leadSchema = new mongoose.Schema(
  {
    company: { type: String, required: true, trim: true },
    contactName: { type: String, required: true, trim: true },
    email: { type: String, trim: true, lowercase: true },
    phone: { type: String, trim: true },
    // Pipeline stage = the Kanban column
    stage: {
      type: String,
      enum: ["new", "contacted", "qualified", "proposal", "won", "lost"],
      default: "new",
      index: true,
    },
    value: { type: Number, default: 0 }, // potential deal value
    source: {
      type: String,
      enum: ["referral", "website", "cold-call", "event", "other"],
      default: "other",
    },
    priority: {
      type: String,
      enum: ["low", "medium", "high"],
      default: "medium",
    },
    // The associate who owns this lead
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    expectedCloseDate: { type: Date },
    activities: [activitySchema],
  },
  { timestamps: true }
);

const Lead = mongoose.model("Lead", leadSchema);
export default Lead;

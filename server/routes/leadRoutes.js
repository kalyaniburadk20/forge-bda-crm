import express from "express";
import {
  getLeads,
  getLeadById,
  createLead,
  updateLead,
  updateLeadStage,
  addActivity,
  deleteLead,
} from "../controllers/leadController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect); // all lead routes require auth

router.route("/").get(getLeads).post(createLead);
router
  .route("/:id")
  .get(getLeadById)
  .put(updateLead)
  .delete(authorize("manager", "admin"), deleteLead);
router.patch("/:id/stage", updateLeadStage);
router.post("/:id/activities", addActivity);

export default router;

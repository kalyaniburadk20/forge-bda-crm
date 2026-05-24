import express from "express";
import { getStats, getTeamPerformance } from "../controllers/dashboardController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);
router.get("/stats", getStats);
router.get("/team", authorize("manager", "admin"), getTeamPerformance);

export default router;

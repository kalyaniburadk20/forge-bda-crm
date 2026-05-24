import express from "express";
import { getUsers } from "../controllers/userController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/", protect, authorize("manager", "admin"), getUsers);

export default router;

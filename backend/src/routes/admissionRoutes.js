import express from "express";
import { createAdmission } from "../controllers/admissionController.js";
import { authenticate, authorize } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/create", authenticate, authorize(['admin']), createAdmission);

export default router;
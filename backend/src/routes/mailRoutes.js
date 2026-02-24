// routes/mailRoutes.js
import express from "express";
import { getMailSummary } from "../controllers/mailController.js";

const router = express.Router();

// Endpoint to fetch summary and bounce counts
router.get("/summary/:campaignId", getMailSummary);

export default router;

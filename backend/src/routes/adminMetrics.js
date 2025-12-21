import express from "express";
import SafetyMetric from "../models/SafetyMetric.js";

const router = express.Router();

// INTERNAL ONLY — protect later
router.get("/daily", async (req, res) => {
  const data = await SafetyMetric.find().sort({ date: -1 }).limit(30);
  res.json(data);
});

export default router;

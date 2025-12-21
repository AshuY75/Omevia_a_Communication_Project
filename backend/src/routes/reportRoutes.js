import express from "express";
import User from "../models/UserModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { reporterId, reportedId } = req.body;

  if (reporterId === reportedId) {
    return res.status(400).json({ error: "Invalid report" });
  }

  const reportedUser = await User.findOne({ googleId: reportedId });
  if (!reportedUser) return res.status(404).json({ error: "User not found" });

  const today = new Date().toDateString();

  if (reportedUser.lastReportDate !== today) {
    reportedUser.reportsToday = 0;
    reportedUser.lastReportDate = today;
  }

  reportedUser.reportsToday += 1;

  // Trust score logic
  if (reportedUser.reportsToday === 1) {
    reportedUser.trustScore -= 10;
  } else {
    reportedUser.trustScore -= 20;
  }

  // Suspension rule
  if (reportedUser.trustScore <= 10) {
    reportedUser.isSuspendedUntil = new Date(Date.now() + 24 * 60 * 60 * 1000);
  }

  await reportedUser.save();

  res.json({ success: true });
});

export default router;

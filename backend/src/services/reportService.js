import Report from "../models/ReportModel.js";
import User from "../models/UserModel.js";

/**
 * Handles user reporting logic
 * Called from Socket.IO (NOT via HTTP)
 */
export async function handleReport({ reporterId, reportedId }) {
  if (!reporterId || !reportedId) {
    throw new Error("Invalid report payload");
  }

  if (reporterId === reportedId) {
    throw new Error("User cannot report themselves");
  }

  // Save report
  await Report.create({
    reporterId,
    reportedId,
  });

  // Penalize reported user
  const reportedUser = await User.findOne({ googleId: reportedId });

  if (!reportedUser) return;

  // Trust score penalty (your rule)
  reportedUser.trustScore = Math.max(0, reportedUser.trustScore - 10);

  await reportedUser.save();

  console.log(`🚨 Report registered: ${reporterId} → ${reportedId}`);
}

import Session from "../models/SessionModel.js";
import User from "../models/UserModel.js";
import SafetyMetric from "../models/SafetyMetric.js";

export async function generateDailyMetrics() {
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);

  const sessions = await Session.find({
    createdAt: { $gte: today, $lt: tomorrow },
  });

  if (sessions.length === 0) return;

  const totalSessions = sessions.length;

  const avgDuration = Math.round(
    sessions.reduce((sum, s) => sum + s.durationSeconds, 0) / totalSessions
  );

  const skipRate =
    sessions.filter((s) => s.endedBy === "skip").length / totalSessions;

  const reportRate =
    sessions.filter((s) => s.endedBy === "report").length / totalSessions;

  const users = await User.find();
  if (users.length === 0) return;

  const avgTrustScore = Math.round(
    users.reduce((sum, u) => sum + u.trustScore, 0) / users.length
  );

  const lowTrustUsers = users.filter((u) => u.trustScore < 50).length;

  const isolationRate = users.length > 0 ? lowTrustUsers / users.length : 0;

  await SafetyMetric.updateOne(
    { date: today.toISOString().slice(0, 10) },
    {
      date: today.toISOString().slice(0, 10),
      totalSessions,
      avgDuration,
      skipRate,
      reportRate,
      isolationRate,
      avgTrustScore,
      lowTrustUsers,
    },
    { upsert: true }
  );
}

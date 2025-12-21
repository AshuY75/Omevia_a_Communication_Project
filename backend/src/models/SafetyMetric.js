import mongoose from "mongoose";

const safetyMetricSchema = new mongoose.Schema({
  date: { type: String, unique: true },

  totalSessions: Number,
  avgDuration: Number,

  skipRate: Number,
  reportRate: Number,
  isolationRate: Number,

  avgTrustScore: Number,
  lowTrustUsers: Number,

  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("SafetyMetric", safetyMetricSchema);

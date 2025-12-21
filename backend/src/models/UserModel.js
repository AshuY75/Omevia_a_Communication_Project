import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  googleId: { type: String, unique: true },
  trustScore: { type: Number, default: 100 },
  reportsToday: { type: Number, default: 0 },
  lastReportDate: { type: String },
  isSuspendedUntil: { type: Date, default: null },
  skipCount: { type: Number, default: 0 },
  lastSkipAt: { type: Date },
  isFlagged: { type: Boolean, default: false },
  flagReason: String,
});

export default mongoose.model("User", userSchema);

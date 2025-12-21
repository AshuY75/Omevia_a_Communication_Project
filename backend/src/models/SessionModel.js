import mongoose from "mongoose";

const sessionSchema = new mongoose.Schema({
  sessionId: String,
  userA: String,
  userB: String,
  durationSeconds: Number,
  endedBy: { type: String, enum: ["natural", "skip", "report"] },
  reportedUser: String,
  createdAt: { type: Date, default: Date.now },
});

export default mongoose.model("Session", sessionSchema);

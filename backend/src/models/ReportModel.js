import mongoose from "mongoose";

const reportSchema = new mongoose.Schema(
  {
    reporterId: { type: String, required: true },
    reportedId: { type: String, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("Report", reportSchema);

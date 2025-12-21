import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import skipRoutes from "./routes/skipRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import { initSocket } from "./socket/socket.js";
import reportRoutes from "./routes/reportRoutes.js";
import SafetyMetric from "./models/SafetyMetric.js";
import adminMetrics from "./routes/adminMetrics.js";
import "./jobs/dailyMetrics.js";
import rateLimit from "express-rate-limit";

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

// Load env
dotenv.config();

const app = express();

// ✅ CORS (ONCE, EARLY)
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

// Routes
app.get("/", (req, res) => {
  res.send("Omevia backend running");
});
app.use("/auth", authRoutes);
app.use("/report", reportRoutes);
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});
app.use("/skip", skipRoutes);
app.use("/admin/metrics", adminMetrics);

// MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

// HTTP + Socket
const server = http.createServer(app);
initSocket(server);

// Start server
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

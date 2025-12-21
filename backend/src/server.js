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

// Load env FIRST
dotenv.config();

const app = express();

/* -------------------- RATE LIMIT -------------------- */
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 20,
  standardHeaders: true,
  legacyHeaders: false,
});

/* -------------------- CORS -------------------- */
app.use(
  cors({
    origin: process.env.FRONTEND_URL, // ✅ PROD SAFE
    credentials: true,
  })
);

/* -------------------- HEADERS (OAuth SAFE) -------------------- */
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

app.use(express.json());

/* -------------------- HEALTH CHECK (Railway) -------------------- */
app.get("/health", (req, res) => {
  res.status(200).send("OK");
});

/* -------------------- ROUTES -------------------- */
app.get("/", (req, res) => {
  res.send("Omevia backend running");
});

app.use("/auth", authLimiter, authRoutes);
app.use("/report", reportRoutes);
app.use("/skip", skipRoutes);
app.use("/admin/metrics", adminMetrics);

/* -------------------- DATABASE -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => console.error("❌ Mongo error:", err));

/* -------------------- HTTP + SOCKET -------------------- */
const server = http.createServer(app);
initSocket(server);

/* -------------------- START SERVER -------------------- */
const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`✅ Backend running on port ${PORT}`);
});

import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import http from "http";
import path from "path";
import { fileURLToPath } from "url";

import authRoutes from "./routes/authRoutes.js";
import skipRoutes from "./routes/skipRoutes.js";
import reportRoutes from "./routes/reportRoutes.js";
import adminMetrics from "./routes/adminMetrics.js";
import { initSocket } from "./socket/socket.js";

dotenv.config({
  path: path.resolve(process.cwd(), ".env"),
});
console.log("ENV CHECK:", process.env.GOOGLE_CLIENT_ID);

const app = express();

/* -------------------- FIX __dirname -------------------- */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* -------------------- TRUST PROXY (RENDER) -------------------- */
// Required for Render / reverse proxies
app.set("trust proxy", 1);

/* -------------------- BODY PARSER -------------------- */
app.use(express.json());

/* -------------------- OAUTH SAFE HEADER -------------------- */
app.use((req, res, next) => {
  res.setHeader("Cross-Origin-Opener-Policy", "same-origin-allow-popups");
  next();
});

/* -------------------- API ROUTES (BEFORE STATIC) -------------------- */
app.use("/auth", authRoutes);
app.use("/report", reportRoutes);
app.use("/skip", skipRoutes);
app.use("/admin/metrics", adminMetrics);

/* -------------------- SERVE FRONTEND -------------------- */
app.use(express.static(path.join(__dirname, "dist")));

app.get("*", (req, res) => {
  res.sendFile(path.join(__dirname, "dist", "index.html"));
});

/* -------------------- DATABASE -------------------- */
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB connected"))
  .catch((err) => {
    console.error("❌ MongoDB error:", err);
    process.exit(1);
  });

/* -------------------- SERVER + SOCKET -------------------- */
const server = http.createServer(app);
initSocket(server);
console.log("GOOGLE_CLIENT_ID:", process.env.GOOGLE_CLIENT_ID);

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

import { Server } from "socket.io";
import { handleMatchmaking } from "./matchmaker.js";
import { handleReport } from "../services/reportService.js";

export function initSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: "http://localhost:5173",
      methods: ["GET", "POST"],
      credentials: true,
    },
  });

  io.on("connection", (socket) => {
    console.log("✅ SOCKET CONNECTED:", socket.id);

    // Optional: attach identity (future hardening)
    socket.userId = socket.handshake.auth?.googleId || null;

    // Verification event
    socket.on("ping_test", () => {
      console.log("📩 Ping from frontend:", socket.id);
      socket.emit("pong_test", "pong from backend");
    });

    // Matchmaking
    handleMatchmaking(io, socket);

    // Report (NO HTTP LOOP)
    socket.on("reportUser", async ({ reportedId }) => {
      if (!socket.userId) return;

      try {
        await handleReport({
          reporterId: socket.userId,
          reportedId,
        });
      } catch (err) {
        console.error("Report failed:", err);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ SOCKET DISCONNECTED:", socket.id, "Reason:", reason);
    });
  });
}

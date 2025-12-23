import { Server } from "socket.io";
import { handleMatchmaking } from "./matchmaker.js";
import { handleReport } from "../services/reportService.js";

export function initSocket(server) {
  // 🔥 SAME-ORIGIN SOCKET (NO CORS)
  const io = new Server(server, {
    path: "/socket.io",
    serveClient: false,
  });

  io.on("connection", (socket) => {
    console.log("✅ SOCKET CONNECTED:", socket.id);

    // Optional identity (provided by client after auth)
    socket.userId = socket.handshake.auth?.googleId ?? null;

    socket.on("ping_test", () => {
      socket.emit("pong_test", "pong from backend");
    });

    // Matchmaking logic
    handleMatchmaking(io, socket);

    // Report user (auth required)
    socket.on("reportUser", async ({ reportedId }) => {
      if (!socket.userId || !reportedId) return;

      try {
        await handleReport({
          reporterId: socket.userId,
          reportedId,
        });
      } catch (err) {
        console.error("❌ Report failed:", err.message);
      }
    });

    socket.on("disconnect", (reason) => {
      console.log("❌ SOCKET DISCONNECTED:", socket.id, "Reason:", reason);
    });
  });
}

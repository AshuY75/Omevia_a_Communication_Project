import { Server } from "socket.io";
import { handleMatchmaking } from "./matchmaker.js";
import { handleReport } from "../services/reportService.js";

export function initSocket(server) {
  const io = new Server(server, {
    path: "/socket.io",

    // CORS — explicit, not wildcard
    cors: {
      origin: true, // reflect request origin
      methods: ["GET", "POST"],
      credentials: true,
    },

    // WebSocket first, polling as fallback
    transports: ["websocket", "polling"],

    allowUpgrades: true,
  });

  io.on("connection", (socket) => {
    console.log("✅ SOCKET CONNECTED:", socket.id);

    // Attach identity if provided
    const googleId = socket.handshake.auth?.googleId;
    socket.userId = typeof googleId === "string" ? googleId : null;

    // Basic health check
    socket.on("ping_test", () => {
      socket.emit("pong_test", "pong from backend");
    });

    // Matchmaking should decide what to do with anonymous users
    handleMatchmaking(io, socket);

    // Report user (auth required)
    socket.on("reportUser", async ({ reportedId }) => {
      if (!socket.userId) {
        console.warn("⚠️ reportUser called without auth");
        return;
      }
      if (!reportedId) return;

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
      console.log("❌ SOCKET DISCONNECTED:", socket.id, reason);
    });
    console.log("🔥 socket.js  loaded  this is from backend socket.js");
  });
  console.log("🔥 socket.js  loaded  this is from backend socket.js");
}

//.............................OLD........................

// import { Server } from "socket.io";
// import { handleMatchmaking } from "./matchmaker.js";
// import { handleReport } from "../services/reportService.js";

// export function initSocket(server) {
//   // 🔥 SAME-ORIGIN SOCKET (NO CORS)
//   // const io = new Server(server, {
//   //   path: "/socket.io",
//   //   serveClient: false,
//   // });

//   io.on("connection", (socket) => {
//     console.log("✅ SOCKET CONNECTED:", socket.id);

//     // Optional identity (provided by client after auth)
//     socket.userId = socket.handshake.auth?.googleId ?? null;

//     socket.on("ping_test", () => {
//       socket.emit("pong_test", "pong from backend");
//     });

//     // Matchmaking logic
//     handleMatchmaking(io, socket);

//     // Report user (auth required)
//     socket.on("reportUser", async ({ reportedId }) => {
//       if (!socket.userId || !reportedId) return;

//       try {
//         await handleReport({
//           reporterId: socket.userId,
//           reportedId,
//         });
//       } catch (err) {
//         console.error("❌ Report failed:", err.message);
//       }
//     });

//     socket.on("disconnect", (reason) => {
//       console.log("❌ SOCKET DISCONNECTED:", socket.id, "Reason:", reason);
//     });
//   });
// }

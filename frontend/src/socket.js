import { io } from "socket.io-client";

const socket = io({
  path: "/socket.io",
  autoConnect: false, // 🔥 CRITICAL
  transports: ["websocket", "polling"],
});
console.log("🔥 socket.js  loaded  this is from frontend socket.js");

export default socket;
//..................OLD
// import { io } from "socket.io-client";

// const socket = io(import.meta.env.VITE_BACKEND_URL, {
//   path: "/socket.io",
//   transports: ["polling"], // 🔥 FORCE polling
//   upgrade: false, // 🔥 DO NOT try websocket
//   withCredentials: true,
//   reconnection: true,
//   reconnectionAttempts: Infinity,
//   reconnectionDelay: 1000,
// });

// socket.on("connect", () => {
//   console.log("✅ SOCKET CONNECTED (polling):", socket.id);
//   socket.emit("ping_test");
// });

// socket.on("pong_test", (msg) => {
//   console.log("✅ BACKEND REPLIED:", msg);
// });

// socket.on("connect_error", (err) => {
//   console.error("❌ SOCKET ERROR:", err.message);
// });

// export default socket;

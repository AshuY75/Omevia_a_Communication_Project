import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
  transports: ["websocket", "polling"],
});

socket.on("connect", () => {
  console.log("✅ FRONTEND SOCKET CONNECTED:", socket.id);
  socket.emit("ping_test");
});

socket.on("pong_test", (msg) => {
  console.log("✅ BACKEND REPLIED:", msg);
});

socket.on("connect_error", (err) => {
  console.error("❌ SOCKET CONNECT ERROR:", err.message);
});

socket.on("disconnect", (reason) => {
  console.log("❌ FRONTEND SOCKET DISCONNECTED:", reason);
});

window.socket = socket;
export default socket;

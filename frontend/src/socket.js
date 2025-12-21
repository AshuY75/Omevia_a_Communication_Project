import { io } from "socket.io-client";

const socket = io(import.meta.env.VITE_BACKEND_URL, {
  withCredentials: true,
});

socket.on("connect", () => {
  console.log("✅ FRONTEND SOCKET CONNECTED:", socket.id);
  socket.emit("ping_test");
});

socket.on("pong_test", (msg) => {
  console.log("✅ BACKEND REPLIED:", msg);
});

socket.on("disconnect", () => {
  console.log("❌ FRONTEND SOCKET DISCONNECTED");
});
window.socket = socket;

export default socket;

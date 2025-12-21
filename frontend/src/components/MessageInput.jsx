import { useState, useRef } from "react";
import socket from "../socket";

function MessageInput({ sessionId }) {
  const [text, setText] = useState("");
  const typingTimeout = useRef(null);

  const sendMessage = () => {
    if (!text.trim()) return;

    socket.emit("sendMessage", {
      sessionId,
      message: text, // ✅ STRING ONLY
    });

    setText("");
    socket.emit("typingStop", { sessionId });
  };

  const handleChange = (e) => {
    setText(e.target.value);

    socket.emit("typing", { sessionId });

    clearTimeout(typingTimeout.current);
    typingTimeout.current = setTimeout(() => {
      socket.emit("typingStop", { sessionId });
    }, 1200);
  };

  return (
    <div className="flex items-center gap-3">
      <input
        value={text}
        onChange={handleChange}
        onKeyDown={(e) => e.key === "Enter" && sendMessage()}
        placeholder="Type a message…"
        className="flex-grow rounded-full bg-zinc-900 border border-zinc-700 px-4 py-2 text-sm text-white"
      />

      <button
        onClick={sendMessage}
        className="rounded-full px-5 py-2 bg-red-500 text-white font-semibold hover:bg-red-600"
      >
        Send
      </button>
    </div>
  );
}

export default MessageInput;

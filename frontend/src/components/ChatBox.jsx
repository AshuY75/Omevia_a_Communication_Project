import { useEffect, useState, useRef } from "react";
import socket from "../socket";
import MessageList from "./MessageList";
import MessageInput from "./MessageInput";

function ChatBox({ sessionId }) {
  const [messages, setMessages] = useState([]);
  const [isTyping, setIsTyping] = useState(false);
  const typingTimeoutRef = useRef(null);

  /* RECEIVE MESSAGES */
  useEffect(() => {
    const handleMessage = (msg) => {
      if (!msg || typeof msg.text !== "string") return;

      setMessages((prev) => [
        ...prev,
        {
          text: msg.text,
          sender: "other",
          time: msg.time,
          status: "delivered",
        },
      ]);
    };

    socket.on("receiveMessage", handleMessage);
    return () => socket.off("receiveMessage", handleMessage);
  }, []);

  /* TYPING INDICATOR */
  useEffect(() => {
    const handleTyping = () => {
      setIsTyping(true);

      clearTimeout(typingTimeoutRef.current);
      typingTimeoutRef.current = setTimeout(() => {
        setIsTyping(false);
      }, 1500);
    };

    socket.on("userTyping", handleTyping);
    return () => socket.off("userTyping", handleTyping);
  }, []);

  return (
    <div className="flex flex-col flex-1 max-w-[900px] w-full mx-auto px-4 py-4 overflow-hidden">
      {/* MESSAGE LIST (ONLY THIS SCROLLS) */}
      <div className="flex-1 overflow-y-auto rounded-2xl bg-zinc-900 border border-zinc-800 p-4">
        <MessageList messages={messages} />
      </div>

      {/* Typing */}
      {isTyping && (
        <div className="text-xs text-zinc-400 px-2 mt-1">
          Stranger is typing…
        </div>
      )}

      {/* INPUT */}
      <div className="mt-3">
        <MessageInput sessionId={sessionId} />
      </div>
    </div>
  );
}

export default ChatBox;

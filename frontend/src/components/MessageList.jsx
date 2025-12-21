import { useEffect, useRef } from "react";
import socket from "../socket";

function MessageList({ messages }) {
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!messages.length) {
    return (
      <div className="h-full flex items-center justify-center text-sm text-zinc-500">
        Say hi 👋
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      {messages.map((msg, i) => {
        // 🔹 SYSTEM MESSAGE
        if (msg.type === "system") {
          return (
            <div key={i} className="text-xs text-center text-zinc-500 py-2">
              {msg.text}
            </div>
          );
        }

        const isMe = msg.sender === "me" || msg.senderSocketId === socket.id;

        return (
          <div
            key={i}
            className={`flex animate-fadeIn ${
              isMe ? "justify-end" : "justify-start"
            }`}
          >
            <div
              className={`max-w-[70%] px-4 py-2 rounded-2xl text-sm break-words
                ${
                  isMe
                    ? "bg-red-500 text-white rounded-br-none"
                    : "bg-zinc-800 text-white border border-zinc-700 rounded-bl-none"
                }`}
            >
              {/* message text */}
              <div>{msg.text}</div>

              {/* time + delivery */}
              <div className="mt-1 flex items-center justify-end gap-1 text-[10px] opacity-60">
                <span>
                  {new Date(msg.time).toLocaleTimeString([], {
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </span>

                {isMe && <span>{msg.status === "delivered" ? "✓✓" : "✓"}</span>}
              </div>
            </div>
          </div>
        );
      })}

      <div ref={bottomRef} />
    </div>
  );
}

export default MessageList;

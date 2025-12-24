import { useEffect, useState } from "react";
import socket from "../socket";

import MatchHeader from "../components/MatchHeader";
import ChatBox from "../components/ChatBox";
import ActionButtons from "../components/ActionButtons";
import TypingIndicator from "../components/TypingIndicator";
import VideoChat from "../components/VideoChat";

function MatchPage({ user }) {
  const [sessionId, setSessionId] = useState(null);
  const [startedAt, setStartedAt] = useState(null);
  const [isTyping, setIsTyping] = useState(false);
  const [isInitiator, setIsInitiator] = useState(false);
  const [sessionState, setSessionState] = useState("waiting");

  useEffect(() => {
    if (!user) return;

    const joinQueueSafely = () => {
      console.log("🟢 joining queue", socket.id);

      socket.emit("joinQueue", {
        userId: user.googleId,
        trustScore: user.trustScore,
      });
    };

    // 🔥 JOIN QUEUE ONLY AFTER CONNECT
    if (socket.connected) {
      joinQueueSafely();
    } else {
      socket.once("connect", joinQueueSafely);
    }

    socket.on("matched", ({ sessionId, isInitiator }) => {
      setSessionId(sessionId);
      setIsInitiator(isInitiator);
      setStartedAt(Date.now());
      setSessionState("connected");
    });

    socket.on("sessionEnded", () => {
      setSessionId(null);
      setStartedAt(null);
      setSessionState("waiting");

      // 🔥 Rejoin AFTER backend cleanup
      setTimeout(() => {
        if (socket.connected) {
          joinQueueSafely();
        }
      }, 300);
    });

    socket.on("userTyping", () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1500);
    });

    return () => {
      socket.off("matched");
      socket.off("sessionEnded");
      socket.off("userTyping");
      socket.off("connect", joinQueueSafely);
    };
  }, [user]);

  /* =========================
     WAITING STATE
  ========================= */
  if (!sessionId) {
    return (
      <div className="h-screen flex items-center justify-center bg-black text-zinc-400">
        <div className="text-center">
          <div className="animate-pulse text-lg mb-2">🔍</div>
          <p>Looking for someone…</p>
        </div>
      </div>
    );
  }

  /* =========================
     MATCHED STATE
  ========================= */
  return (
    <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
      <MatchHeader sessionId={sessionId} startedAt={startedAt} />

      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        <div className="w-full md:w-[60%] h-[40vh] md:h-full border-b md:border-b-0 md:border-r border-zinc-800">
          <VideoChat sessionId={sessionId} isInitiator={isInitiator} />
        </div>

        <div className="flex flex-col flex-1 max-w-[900px] w-full mx-auto px-4 py-4 overflow-hidden">
          <ChatBox sessionId={sessionId} />

          <div className="w-full max-w-[900px] mx-auto px-4 pb-1">
            <TypingIndicator visible={isTyping} />
          </div>
        </div>
      </div>

      <ActionButtons sessionId={sessionId} googleId={user.googleId} />
    </div>
  );
}

export default MatchPage;

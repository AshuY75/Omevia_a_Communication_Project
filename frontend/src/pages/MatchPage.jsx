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

  /* =========================
     SOCKET LIFECYCLE
  ========================= */
  useEffect(() => {
    if (!user) return;

    // Join matchmaking
    socket.emit("joinQueue", {
      userId: user.googleId,
      trustScore: user.trustScore,
    });

    // Matched
    socket.on("matched", ({ sessionId }) => {
      setSessionId(sessionId);
      setStartedAt(Date.now());
    });

    // Session ended
    socket.on("sessionEnded", () => {
      setSessionId(null);
      setStartedAt(null);

      socket.emit("joinQueue", {
        userId: user.googleId,
        trustScore: user.trustScore,
      });
    });

    // Typing indicator
    socket.on("userTyping", () => {
      setIsTyping(true);
      setTimeout(() => setIsTyping(false), 1500);
    });

    return () => {
      socket.off("matched");
      socket.off("sessionEnded");
      socket.off("userTyping");
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
    <div className="h-screen flex flex-col  bg-black text-white overflow-hidden">
      {/* HEADER */}
      <MatchHeader sessionId={sessionId} startedAt={startedAt} />

      {/* MAIN CONTENT (VIDEO + CHAT) */}
      <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
        {/* 🎥 VIDEO SECTION */}
        <div
          className="
          w-full
          md:w-1/2
          h-[35vh]
          md:h-full
          flex-shrink-0
          border-b md:border-b-0 md:border-r
          border-zinc-800
        "
        >
          <VideoChat sessionId={sessionId} isInitiator={true} />
        </div>

        {/* 💬 CHAT SECTION */}
        <div className="flex-1 flex flex-col overflow-hidden">
          <ChatBox sessionId={sessionId} />

          {/* Typing indicator */}
          <div className="w-full max-w-[900px] mx-auto px-4 pb-1">
            <TypingIndicator visible={isTyping} />
          </div>
        </div>
      </div>

      {/* ACTION BUTTONS */}
      <ActionButtons sessionId={sessionId} googleId={user.googleId} />
    </div>
  );

  // return (
  //   <div className="h-screen flex flex-col bg-black text-white overflow-hidden">
  //     {/* HEADER (fixed height) */}
  //     <MatchHeader sessionId={sessionId} startedAt={startedAt} />

  //     {/* video */}
  //     <VideoChat
  //       sessionId={sessionId}
  //       isInitiator={true} // userA can be initiator later
  //     />

  //     {/* CHAT AREA (THIS CONTROLS SCROLL) */}
  //     <div className="flex-1 flex flex-col overflow-hidden">
  //       {/* Messages + input handled inside ChatBox */}
  //       <ChatBox sessionId={sessionId} />

  //       {/* Typing indicator (fixed below messages) */}
  //       <div className="w-full max-w-[900px] mx-auto px-4 pb-1">
  //         <TypingIndicator visible={isTyping} />
  //       </div>
  //     </div>

  //     {/* ACTION BUTTONS (fixed bottom) */}
  //     <ActionButtons sessionId={sessionId} googleId={user.googleId} />
  //   </div>
  // );
}

export default MatchPage;

import socket from "./socket";
import { useEffect, useState } from "react";

function MatchTest({ googleId, trustScore }) {
  const [sessionId, setSessionId] = useState(null);
  const [sessionStart, setSessionStart] = useState(null);

  useEffect(() => {
    socket.emit("joinQueue", { userId: googleId, trustScore });

    socket.on("matched", ({ sessionId }) => {
      console.log("🎯 MATCHED! Session ID:", sessionId);
      setSessionId(sessionId);
      setSessionStart(Date.now());
    });

    socket.on("sessionEnded", () => {
      console.log("⏹ Session ended");
      setSessionId(null);
      setSessionStart(null);
    });

    socket.on("receiveMessage", (msg) => {
      console.log("💬 Message received:", msg);
    });

    return () => {
      socket.off("matched");
      socket.off("sessionEnded");
      socket.off("receiveMessage");
    };
  }, []);

  /* ✅ THIS IS THE ONLY CORRECT SKIP */
  const handleSkip = () => {
    if (!sessionId) return;

    socket.emit("skipSession", {
      sessionId,
      googleId,
    });

    console.log("⏭ Skip sent for session:", sessionId);
  };

  return (
    <div>
      <h2>Session: {sessionId || "Waiting..."}</h2>

      {sessionId && <button onClick={handleSkip}>⏭ Skip</button>}
    </div>
  );
}

export default MatchTest;

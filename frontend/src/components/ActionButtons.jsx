import { useState } from "react";
import socket from "../socket";

function ActionButtons({ sessionId, googleId }) {
  const [reported, setReported] = useState(false);

  const handleSkip = () => {
    socket.emit("skipSession", { sessionId, googleId });
  };

  const handleReport = () => {
    if (reported) return;

    const confirmReport = window.confirm(
      "Report this user for inappropriate behavior?"
    );

    if (!confirmReport) return;

    socket.emit("reportUser", {
      reporterId: googleId,
      sessionId,
    });

    setReported(true);
    alert("Report submitted. The session will end.");
  };

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-4 flex gap-4">
      {/* Skip Button */}
      <button
        onClick={handleSkip}
        className="
          flex-1
          rounded-full
          py-3
          bg-zinc-800
          border
          border-zinc-700
          text-white
          font-semibold
          hover:border-red-500
          hover:text-red-400
          transition
        "
      >
        Skip
      </button>

      {/* Report Button */}
      <button
        onClick={handleReport}
        disabled={reported}
        className={`
          flex-1
          rounded-full
          py-3
          font-semibold
          border
          transition
          ${
            reported
              ? "bg-red-500/10 border-red-500/20 text-red-400 cursor-not-allowed"
              : "bg-red-500/20 border-red-500/40 text-red-400 hover:bg-red-500/30"
          }
        `}
      >
        {reported ? "Reported" : "Report"}
      </button>
    </div>
  );
}

export default ActionButtons;

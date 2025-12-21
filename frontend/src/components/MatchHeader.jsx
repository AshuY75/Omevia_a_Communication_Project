import { useEffect, useState } from "react";

function MatchHeader({ sessionId, startedAt }) {
  const [timeLeft, setTimeLeft] = useState(null);

  useEffect(() => {
    if (!startedAt) return;

    const MAX_DURATION_MS = 20 * 60 * 1000;

    const interval = setInterval(() => {
      const elapsed = Date.now() - startedAt;
      const remaining = Math.max(
        0,
        Math.floor((MAX_DURATION_MS - elapsed) / 1000)
      );

      setTimeLeft(remaining);
      if (remaining <= 0) clearInterval(interval);
    }, 1000);

    return () => clearInterval(interval);
  }, [startedAt]);

  const formatTime = (seconds) => {
    if (seconds === null) return "--:--";
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, "0")}`;
  };

  return (
    <header className="w-full border-b border-zinc-800 bg-zinc-900/90 backdrop-blur">
      <div className="max-w-7xl mx-auto px-4 h-14 flex items-center justify-between">
        {/* Left: Brand + Status */}
        <div className="flex items-center gap-3">
          <span className="text-white font-extrabold tracking-wide">
            Omevia
          </span>

          <span className="flex items-center gap-1 text-xs text-green-400">
            <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
            Connected
          </span>
        </div>

        {/* Center: Session ID */}
        <div className="text-xs text-zinc-400">
          Session
          <span className="ml-1 font-mono text-zinc-200">
            {sessionId ? sessionId.slice(0, 8) : "—"}
          </span>
        </div>

        {/* Right: Timer */}
        <div className="flex items-center gap-2 text-sm font-semibold text-white">
          <span className="text-red-400">⏱</span>
          {formatTime(timeLeft)}
        </div>
      </div>
    </header>
  );
}

export default MatchHeader;

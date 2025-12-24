import { useEffect, useState } from "react";
import socket from "./socket"; // IMPORT, don't auto-run

import AgeGate from "./pages/AgeGate";
import Auth from "./pages/Auth";
import MatchPage from "./pages/MatchPage";

function App() {
  const [step, setStep] = useState("age");
  const [user, setUser] = useState(null);

  const handleGoogle = async (token) => {
    try {
      const res = await fetch("/auth/google", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        throw new Error(`Auth failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Verified user:", data);

      if (!data.googleId) {
        throw new Error("Invalid auth response");
      }

      setUser({
        googleId: data.googleId,
        trustScore: data.trustScore,
      });

      setStep("match");
    } catch (err) {
      console.error("❌ Google auth error:", err.message);
    }
    console.log("🟣 frontend socket id (before connect):", socket.id);
  };

  // 🔥 SOCKET LIFECYCLE — SINGLE SOURCE OF TRUTH
  useEffect(() => {
    if (!user) return;

    socket.auth = { googleId: user.googleId };

    if (!socket.connected) {
      socket.connect();
    }

    // ❌ DO NOT auto-disconnect here
  }, [user]);

  return (
    <>
      {step === "age" && <AgeGate onConfirm={() => setStep("auth")} />}

      {step === "auth" && <Auth onSuccess={handleGoogle} />}

      {step === "match" && user && <MatchPage user={user} />}
    </>
  );
}

export default App;

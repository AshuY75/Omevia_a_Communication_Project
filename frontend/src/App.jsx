import { useState } from "react";
import AgeGate from "./pages/AgeGate";
import Auth from "./pages/Auth";
import MatchPage from "./pages/MatchPage";
import "./socket"; // socket init

function App() {
  const [step, setStep] = useState("age");
  const [user, setUser] = useState(null);

  const handleGoogle = async (token) => {
    try {
      // 🔥 SAME-ORIGIN REQUEST (NO CORS)
      const res = await fetch("/auth/google", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token }),
      });

      if (!res.ok) {
        throw new Error(`Auth failed with status ${res.status}`);
      }

      const data = await res.json();
      console.log("✅ Verified user:", data);

      // ✅ Minimal safety check
      if (!data.googleId) {
        throw new Error("Invalid auth response");
      }

      // ✅ Save user
      setUser({
        googleId: data.googleId,
        trustScore: data.trustScore,
      });

      // ✅ Move to next step
      setStep("match");
    } catch (err) {
      console.error("❌ Google auth error:", err.message);
    }
  };

  return (
    <>
      {step === "age" && <AgeGate onConfirm={() => setStep("auth")} />}

      {step === "auth" && <Auth onSuccess={handleGoogle} />}

      {step === "match" && user && <MatchPage user={user} />}
    </>
  );
}

export default App;

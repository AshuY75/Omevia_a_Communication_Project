import AgeGate from "./pages/AgeGate";
import Auth from "./pages/Auth";
import MatchTest from "./MatchTest";
import { useState } from "react";
import "./socket";
import MatchPage from "./pages/MatchPage";

function App() {
  const [step, setStep] = useState("age");
  const [user, setUser] = useState(null);

  const handleGoogle = async (token) => {
    const API_URL = import.meta.env.VITE_BACKEND_URL;

    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/auth/google`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });

    const data = await res.json();
    console.log("Verified user:", data);

    // ✅ SAFETY CHECK
    if (!data.googleId || data.trustScore === undefined) {
      console.error("Invalid auth response", data);
      return;
    }

    // ✅ SET USER INSIDE HANDLER
    setUser({
      googleId: data.googleId,
      trustScore: data.trustScore,
    });

    // ✅ MOVE TO MATCH STEP
    setStep("match");
  };

  return (
    <>
      {step === "age" && <AgeGate onConfirm={() => setStep("auth")} />}

      {step === "auth" && <Auth onSuccess={handleGoogle} />}

      {step === "match" && user && (
        <>
          <MatchPage user={user} />
          <MatchTest googleId={user.googleId} trustScore={user.trustScore} />
        </>
      )}
    </>
  );
}

export default App;

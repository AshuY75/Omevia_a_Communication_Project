import express from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/UserModel.js";

const router = express.Router();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

// Google OAuth route
router.post("/google", async (req, res) => {
  const { token } = req.body;

  if (!token) {
    return res.status(400).json({ error: "Token missing" });
  }

  try {
    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    const googleId = payload.sub;

    let user = await User.findOne({ googleId });

    if (!user) {
      user = await User.create({ googleId });
    }

    if (user.isBanned) {
      return res.status(403).json({ error: "User banned" });
    }
    console.log("Backend CLIENT ID:", process.env.GOOGLE_CLIENT_ID);

    // ✅ SEND RESPONSE ONCE
    return res.json({
      success: true,
      trustScore: user.trustScore,
      googleId: user.googleId,
    });
  } catch (err) {
    console.error("Google auth error:", err);
    return res.status(401).json({ error: "Invalid token" });
  }
  console.log("Backend CLIENT ID:", process.env.GOOGLE_CLIENT_ID);
});

export default router;

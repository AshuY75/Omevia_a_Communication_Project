import express from "express";
import { OAuth2Client } from "google-auth-library";
import User from "../models/UserModel.js";

const router = express.Router();

/* -------------------- VALIDATE ENV -------------------- */


const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/* -------------------- GOOGLE AUTH -------------------- */
router.post("/google", async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: "Token missing" });
    }

    const ticket = await client.verifyIdToken({
      idToken: token,
      audience: process.env.GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    // 🔐 Hard gate: Google-verified email only
    if (!payload?.email_verified) {
      return res.status(403).json({ error: "Email not verified" });
    }

    let user = await User.findOne({ googleId: payload.sub });

    if (!user) {
      user = await User.create({
        googleId: payload.sub,
        email: payload.email,
        trustScore: 100, // default (frontend expects this)
      });
    }

    // ✅ Single, consistent response shape
    return res.status(200).json({
      googleId: user.googleId,
      email: user.email,
      trustScore: user.trustScore,
    });
  } catch (err) {
    console.error("❌ Google auth error:", err.message);
    return res.status(401).json({ error: "Invalid Google token" });
  }
});

export default router;

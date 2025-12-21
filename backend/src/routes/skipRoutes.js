import express from "express";
import User from "../models/UserModel.js";

const router = express.Router();

router.post("/", async (req, res) => {
  const { googleId, sessionDuration } = req.body;

  const user = await User.findOne({ googleId });
  if (!user) return res.sendStatus(404);

  const now = Date.now();

  // Reset skip count after 10 mins
  if (user.lastSkipAt && now - user.lastSkipAt > 10 * 60 * 1000) {
    user.skipCount = 0;
  }

  // Penalties
  if (sessionDuration < 30) {
    user.skipCount += 1;
    user.trustScore -= 2;
  }

  if (user.skipCount >= 3) {
    user.trustScore -= 5;
  }

  user.lastSkipAt = now;
  await user.save();

  res.json({ success: true });
});

export default router;

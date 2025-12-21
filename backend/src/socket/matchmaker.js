import crypto from "crypto";
import User from "../models/UserModel.js";
import Session from "../models/SessionModel.js";
import { calculateSessionScore } from "../utils/sessionScore.js";

const normalQueue = [];
const isolatedQueue = [];
const activeSessions = new Map();
const FORCE_MATCH = true; // 🔥 EARLY STAGE MODE

export function handleMatchmaking(io, socket) {
  /* ==========================
     JOIN QUEUE
  ========================== */

  socket.on("joinQueue", ({ userId, trustScore }) => {
    if (!userId) return;

    // 🔥 FORCE MATCH: everyone goes to ONE queue
    if (FORCE_MATCH) {
      if (normalQueue.find((u) => u.userId === userId)) return;

      normalQueue.push({ userId, socketId: socket.id });
      attemptMatch(io);
      return;
    }

    // 🚫 future (disabled for now)
    const queue = trustScore > 50 ? normalQueue : isolatedQueue;

    if (queue.find((u) => u.userId === userId)) return;
    queue.push({ userId, socketId: socket.id });

    attemptMatch(io);
  });

  /* ==========================
     SEND MESSAGE
  ========================== */
  socket.on("sendMessage", ({ sessionId, message }) => {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    const receiverSocketId =
      socket.id === session.userA.socketId
        ? session.userB.socketId
        : session.userA.socketId;

    const payload = {
      text: message.text ?? message, // safe
      senderSocketId: socket.id,
      time: Date.now(),
    };

    // send to OTHER user
    io.to(receiverSocketId).emit("receiveMessage", payload);

    // send back to SENDER (echo)
    socket.emit("receiveMessage", payload);
  });

  /* ==========================
     TYPING INDICATOR ✅ (FIXED PLACE)
  ========================== */
  socket.on("typing", ({ sessionId }) => {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    const otherSocket =
      socket.id === session.userA.socketId
        ? session.userB.socketId
        : session.userA.socketId;

    io.to(otherSocket).emit("userTyping");
  });

  socket.on("typingStop", ({ sessionId }) => {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    const otherSocket =
      socket.id === session.userA.socketId
        ? session.userB.socketId
        : session.userA.socketId;

    io.to(otherSocket).emit("userTyping");
  });
  /* ==========================
     VIDEO/Audio
  ========================== */

  socket.on("webrtc-offer", ({ sessionId, offer }) => {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    const other =
      socket.id === session.userA.socketId
        ? session.userB.socketId
        : session.userA.socketId;

    io.to(other).emit("webrtc-offer", { offer });
  });

  socket.on("webrtc-answer", ({ sessionId, answer }) => {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    const other =
      socket.id === session.userA.socketId
        ? session.userB.socketId
        : session.userA.socketId;

    io.to(other).emit("webrtc-answer", { answer });
  });

  socket.on("webrtc-ice", ({ sessionId, candidate }) => {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    const other =
      socket.id === session.userA.socketId
        ? session.userB.socketId
        : session.userA.socketId;

    io.to(other).emit("webrtc-ice", { candidate });
  });

  /* ==========================
     SKIP SESSION
  ========================== */
  socket.on("skipSession", async ({ sessionId, googleId }) => {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    await finalizeSession(io, session, "skip", googleId);
  });
}

/* ==========================
   MATCH TWO USERS
========================== */
function attemptMatch(io) {
  if (normalQueue.length < 2) return;

  const userA = normalQueue.shift();
  const userB = normalQueue.shift();

  createSession(io, userA, userB);
}

/* ==========================
   CREATE SESSION
========================== */
function createSession(io, userA, userB) {
  const sessionId = crypto.randomUUID();
  const duration = Math.floor(Math.random() * (20 - 10 + 1) + 10) * 60 * 1000;

  const session = {
    sessionId,
    userA,
    userB,
    startedAt: Date.now(),
    expiresAt: Date.now() + duration,
  };

  activeSessions.set(sessionId, session);

  io.to(userA.socketId).emit("matched", { sessionId });
  io.to(userB.socketId).emit("matched", { sessionId });

  setTimeout(() => {
    finalizeSession(io, session, "natural");
  }, duration);
}

/* ==========================
   FINALIZE SESSION
========================== */
async function finalizeSession(io, session, endedBy, actorId = null) {
  if (!activeSessions.has(session.sessionId)) return;

  const durationSeconds = Math.floor((Date.now() - session.startedAt) / 1000);

  activeSessions.delete(session.sessionId);

  io.to(session.userA.socketId).emit("sessionEnded");
  io.to(session.userB.socketId).emit("sessionEnded");

  await Session.create({
    sessionId: session.sessionId,
    userA: session.userA.userId,
    userB: session.userB.userId,
    durationSeconds,
    endedBy,
    reportedUser: null,
  });

  for (const user of [session.userA, session.userB]) {
    const isSkipper = endedBy === "skip" && user.userId === actorId;

    const delta = calculateSessionScore({
      durationSeconds,
      endedBy,
      isReported: false,
      isSkipper,
    });

    await User.updateOne(
      { googleId: user.userId },
      { $inc: { trustScore: delta } }
    );
  }
}

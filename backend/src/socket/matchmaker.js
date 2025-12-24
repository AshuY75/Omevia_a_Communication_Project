import crypto from "crypto";
import User from "../models/UserModel.js";
import Session from "../models/SessionModel.js";
import { calculateSessionScore } from "../utils/sessionScore.js";

// 🔥 SAFE DATA STRUCTURES
const waitingQueue = new Map(); // socketId -> { userId }
const activeSessions = new Map(); // sessionId -> session
const socketToSession = new Map(); // socketId -> sessionId

export function handleMatchmaking(io, socket) {
  /* ==========================
     JOIN QUEUE
  ========================== */
  socket.on("joinQueue", ({ userId }) => {
    console.log("🟢 joinQueue:", socket.id, userId);
    if (!userId) return;

    // Clean any stale state
    cleanupSocket(io, socket.id);

    // Add to queue
    waitingQueue.set(socket.id, { userId });

    attemptMatch(io);
  });

  /* ==========================
     DISCONNECT
  ========================== */
  socket.on("disconnect", () => {
    cleanupSocket(io, socket.id);
  });

  /* ==========================
     SEND MESSAGE
  ========================== */
  socket.on("sendMessage", ({ sessionId, message }) => {
    const session = activeSessions.get(sessionId);
    if (!session) return;

    const other =
      socket.id === session.userA.socketId
        ? session.userB.socketId
        : session.userA.socketId;

    io.to(other).emit("receiveMessage", {
      text: message.text ?? message,
      senderSocketId: socket.id,
      time: Date.now(),
    });
  });

  /* ==========================
     TYPING
  ========================== */
  socket.on("typing", ({ sessionId }) => {
    relayToOther(io, socket.id, sessionId, "userTyping");
  });

  /* ==========================
     WEBRTC SIGNALS
  ========================== */
  ["webrtc-offer", "webrtc-answer", "webrtc-ice"].forEach((event) => {
    socket.on(event, (payload) => {
      relayToOther(io, socket.id, payload.sessionId, event, payload);
    });
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
   MATCH USERS
========================== */
function attemptMatch(io) {
  const ids = [...waitingQueue.keys()];
  if (ids.length < 2) return;

  const a = ids[0];
  const b = ids[1];

  const userA = waitingQueue.get(a);
  const userB = waitingQueue.get(b);

  if (!userA || !userB) return;

  waitingQueue.delete(a);
  waitingQueue.delete(b);

  createSession(io, a, userA.userId, b, userB.userId);
}

/* ==========================
   CREATE SESSION
========================== */
function createSession(io, socketA, userAId, socketB, userBId) {
  const sessionId = crypto.randomUUID();

  const session = {
    sessionId,
    userA: { socketId: socketA, userId: userAId },
    userB: { socketId: socketB, userId: userBId },
    startedAt: Date.now(),
  };

  activeSessions.set(sessionId, session);
  socketToSession.set(socketA, sessionId);
  socketToSession.set(socketB, sessionId);

  io.to(socketA).emit("matched", { sessionId, isInitiator: true });
  io.to(socketB).emit("matched", { sessionId, isInitiator: false });
}

/* ==========================
   CLEANUP SOCKET (NO REQUEUE)
========================== */
function cleanupSocket(io, socketId) {
  waitingQueue.delete(socketId);

  const sessionId = socketToSession.get(socketId);
  if (!sessionId) return;

  const session = activeSessions.get(sessionId);
  if (!session) return;

  const other =
    session.userA.socketId === socketId
      ? session.userB.socketId
      : session.userA.socketId;

  socketToSession.delete(socketId);
  socketToSession.delete(other);
  activeSessions.delete(sessionId);

  // 🔥 ONLY notify survivor
  io.to(other).emit("sessionEnded");
}

/* ==========================
   FINALIZE SESSION
========================== */
async function finalizeSession(io, session, endedBy, actorId = null) {
  if (!activeSessions.has(session.sessionId)) return;

  activeSessions.delete(session.sessionId);

  io.to(session.userA.socketId).emit("sessionEnded");
  io.to(session.userB.socketId).emit("sessionEnded");

  socketToSession.delete(session.userA.socketId);
  socketToSession.delete(session.userB.socketId);

  const durationSeconds = Math.floor((Date.now() - session.startedAt) / 1000);

  await Session.create({
    sessionId: session.sessionId,
    userA: session.userA.userId,
    userB: session.userB.userId,
    durationSeconds,
    endedBy,
  });

  for (const user of [session.userA, session.userB]) {
    const delta = calculateSessionScore({
      durationSeconds,
      endedBy,
      isReported: false,
      isSkipper: user.userId === actorId,
    });

    await User.updateOne(
      { googleId: user.userId },
      { $inc: { trustScore: delta } }
    );
  }
}

/* ==========================
   UTILS
========================== */
function relayToOther(io, senderSocket, sessionId, event, payload = {}) {
  const session = activeSessions.get(sessionId);
  if (!session) return;

  const other =
    senderSocket === session.userA.socketId
      ? session.userB.socketId
      : session.userA.socketId;

  io.to(other).emit(event, payload);
}

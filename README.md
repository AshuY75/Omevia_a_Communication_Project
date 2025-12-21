 #Omevia – Real-Time Anonymous Video & Chat Platform

Omevia is a **real-time anonymous video, voice, and chat application** inspired by Omegle.  
The project is built to demonstrate **advanced real-time system design**, not just UI.

This is a **production-style project** focusing on WebRTC, Socket.IO, and live session management.

## 🚀 Features

### 🔐 Authentication
- Google OAuth login
- Secure token verification
- Anonymous usage (no public profiles)

### 🤝 Matchmaking
- Random 1-to-1 user matching
- Force-match mode for early users
- Auto re-queue after session ends
- Skip & report functionality

### 🎥 Video & Voice Calling
- WebRTC peer-to-peer video calls
- Microphone mute/unmute
- Camera on/off
- Works on desktop & mobile
- Secure HTTPS-compatible WebRTC setup

### 💬 Real-Time Chat
- Socket.IO based messaging
- Sender/receiver message alignment
- Typing indicators
- Message timestamps
- Auto-scroll message list
- Delivery status (✓ / ✓✓)

### 🛡️ Safety
- User reporting
- Trust-score based logic (extensible)
- Session tracking in database

## 🧠 Tech Stack

### Frontend
- React (Vite)
- Tailwind CSS
- Socket.IO Client
- WebRTC APIs

### Backend
- Node.js
- Express
- Socket.IO
- MongoDB
- Google OAuth
- WebRTC signaling server


## 🔄 How It Works

1. User logs in via Google OAuth
2. User joins matchmaking queue
3. Backend pairs two users
4. WebRTC signaling via Socket.IO
5. Peer-to-peer video/audio connection
6. Real-time chat runs alongside video
7. Session ends → user re-enters queue

## 🌐 Live Demo

- Frontend: https://your-frontend-link.vercel.app  
- Backend: https://your-backend-link.railway.app  

> Camera & microphone permissions required.


## ⚙️ Environment Variables

### Backend
PORT=5000
MONGO_URI=your_mongodb_uri
GOOGLE_CLIENT_ID=your_google_client_id
FRONTEND_URL=your_frontend_url

shell
Copy code

### Frontend
VITE_BACKEND_URL=your_backend_url
VITE_GOOGLE_CLIENT_ID=your_google_client_id

## 🧪 Local Setup

### Backend
```bash
npm install
npm run dev
Frontend
bash
Copy code
npm install
npm run dev
⚠️ Known Limitations (Honest)
No TURN server (STUN only)

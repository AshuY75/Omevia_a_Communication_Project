import { useEffect, useRef, useState } from "react";
import socket from "../socket";
import {
  createPeerConnection,
  getLocalStream,
  addTracksToPeer,
  createOffer,
  createAnswer,
  setRemoteAnswer,
  addIceCandidate,
  cleanupPeer,
} from "../webrtc/peer";

function VideoChat({ sessionId, isInitiator }) {
  const localVideoRef = useRef(null);
  const remoteVideoRef = useRef(null);
  const localStreamRef = useRef(null);

  const [isMicOn, setIsMicOn] = useState(true);
  const [isCameraOn, setIsCameraOn] = useState(true);
  const [videoStatus, setVideoStatus] = useState("connecting");

  /* =====================
     TOGGLE MIC
  ===================== */
  const toggleMic = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    });
  };

  /* =====================
     TOGGLE CAMERA
  ===================== */
  const toggleCamera = () => {
    const stream = localStreamRef.current;
    if (!stream) return;

    stream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsCameraOn(track.enabled);
    });
  };

  /* =====================
     WEBRTC SETUP
  ===================== */
  useEffect(() => {
    if (!sessionId) return;

    let pc;

    const start = async () => {
      const stream = await getLocalStream();
      localStreamRef.current = stream;

      if (localVideoRef.current) {
        localVideoRef.current.srcObject = stream;
      }

      pc = await createPeerConnection(socket, sessionId, (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
        setVideoStatus("connected");
      });

      addTracksToPeer(stream);

      if (isInitiator) {
        const offer = await createOffer();
        socket.emit("webrtc-offer", { sessionId, offer });
      }
    };

    start();

    socket.on("webrtc-offer", async ({ offer }) => {
      const answer = await createAnswer(offer);
      socket.emit("webrtc-answer", { sessionId, answer });
    });

    socket.on("webrtc-answer", async ({ answer }) => {
      await setRemoteAnswer(answer);
    });

    socket.on("webrtc-ice", async ({ candidate }) => {
      await addIceCandidate(candidate);
    });

    return () => {
      cleanupPeer();
      socket.off("webrtc-offer");
      socket.off("webrtc-answer");
      socket.off("webrtc-ice");
    };
  }, [sessionId, isInitiator]);

  return (
    <div className="relative w-full h-[60vh] bg-black rounded-2xl overflow-hidden">
      {/* Remote video */}
      {videoStatus !== "connected" && (
        <div className="absolute inset-0 flex items-center justify-center text-zinc-400 text-sm bg-black/60">
          Connecting video…
        </div>
      )}

      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Local video */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="absolute bottom-4 right-4 w-40 h-28 rounded-xl border border-white/20 object-cover bg-black"
      />

      {/* Controls */}
      <div
        className="absolute bottom-3 sm:bottom-4 lg:bottom-6
left-1/2 -translate-x-1/2
flex gap-2 sm:gap-4
text-xs sm:text-sm lg:text-base
"
      >
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            isMicOn ? "bg-zinc-800" : "bg-red-600"
          }`}
        >
          {isMicOn ? "Mute Mic" : "Unmute Mic"}
        </button>

        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded-full text-sm font-semibold ${
            isCameraOn ? "bg-zinc-800" : "bg-red-600"
          }`}
        >
          {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
        </button>
      </div>
    </div>
  );
}

export default VideoChat;

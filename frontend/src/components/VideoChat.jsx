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

const localVideoRef = useRef(null);
const remoteVideoRef = useRef(null);
const [isMicOn, setIsMicOn] = useState(true);
const [isCameraOn, setIsCameraOn] = useState(true);

function VideoChat({ sessionId, isInitiator }) {
  const toggleMic = () => {
    if (!localStream) return;

    localStream.getAudioTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsMicOn(track.enabled);
    });
  };

  const toggleCamera = () => {
    if (!localStream) return;

    localStream.getVideoTracks().forEach((track) => {
      track.enabled = !track.enabled;
      setIsCameraOn(track.enabled);
    });
  };

  useEffect(() => {
    if (!sessionId) return;

    let pc;

    async function start() {
      const localStream = await getLocalStream();
      localVideoRef.current.srcObject = localStream;

      pc = await createPeerConnection(socket, sessionId, (remoteStream) => {
        remoteVideoRef.current.srcObject = remoteStream;
      });

      addTracksToPeer();

      if (isInitiator) {
        const offer = await createOffer();
        socket.emit("webrtc-offer", { sessionId, offer });
      }
    }

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
  }, [sessionId]);

  return (
    <div className="relative w-full h-[60vh] bg-black rounded-2xl overflow-hidden">
      {/* Stranger video (MAIN) */}
      <video
        ref={remoteVideoRef}
        autoPlay
        playsInline
        className="w-full h-full object-cover"
      />

      {/* Your video (SMALL OVERLAY) */}
      <video
        ref={localVideoRef}
        autoPlay
        muted
        playsInline
        className="
      absolute
      bottom-4 right-4
      w-40 h-28
      rounded-xl
      border border-white/20
      object-cover
      bg-black
    "
      />
      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-4">
        <button
          onClick={toggleMic}
          className={`px-4 py-2 rounded-full text-sm font-semibold
      ${isMicOn ? "bg-zinc-800" : "bg-red-600"}`}
        >
          {isMicOn ? "Mute Mic" : "Unmute Mic"}
        </button>

        <button
          onClick={toggleCamera}
          className={`px-4 py-2 rounded-full text-sm font-semibold
      ${isCameraOn ? "bg-zinc-800" : "bg-red-600"}`}
        >
          {isCameraOn ? "Turn Camera Off" : "Turn Camera On"}
        </button>
      </div>
    </div>
  );
}

export default VideoChat;

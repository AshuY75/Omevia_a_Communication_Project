let pc = null;
let localStream = null;

const ICE_SERVERS = {
  iceServers: [
    { urls: "stun:stun.l.google.com:19302" },
    { urls: "stun:stun1.l.google.com:19302" },
  ],
};

export async function createPeerConnection(socket, sessionId, onRemoteStream) {
  pc = new RTCPeerConnection(ICE_SERVERS);

  // 🔊 when remote track arrives
  pc.ontrack = (event) => {
    onRemoteStream(event.streams[0]);
  };

  // ❄️ ICE candidates
  pc.onicecandidate = (event) => {
    if (event.candidate) {
      socket.emit("webrtc-ice", {
        sessionId,
        candidate: event.candidate,
      });
    }
  };

  return pc;
}

export async function getLocalStream() {
  localStream = await navigator.mediaDevices.getUserMedia({
    video: true,
    audio: true,
  });
  return localStream;
}

export function addTracksToPeer() {
  localStream.getTracks().forEach((track) => {
    pc.addTrack(track, localStream);
  });
}

export async function createOffer() {
  const offer = await pc.createOffer();
  await pc.setLocalDescription(offer);
  return offer;
}

export async function createAnswer(offer) {
  await pc.setRemoteDescription(offer);
  const answer = await pc.createAnswer();
  await pc.setLocalDescription(answer);
  return answer;
}

export async function setRemoteAnswer(answer) {
  if (pc.signalingState !== "have-local-offer") {
    console.warn("Skipping setRemoteAnswer, state:", pc.signalingState);
    return;
  }
  await pc.setRemoteDescription(answer);
}

export async function addIceCandidate(candidate) {
  if (candidate) {
    await pc.addIceCandidate(candidate);
  }
}

export function cleanupPeer() {
  pc?.close();
  localStream?.getTracks().forEach((t) => t.stop());
  pc = null;
  localStream = null;
}

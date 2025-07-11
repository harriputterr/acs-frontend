class PeerService {
  peer: RTCPeerConnection;

  constructor() {
    this.peer = new RTCPeerConnection({
      iceServers: [
        {
          urls: [
            "stun:stun.l.google.com:19302",
            "stun:stun1.l.google.com:19302",
            "stun:stun2.l.google.com:19302",
            "stun:stun.stunprotocol.org:3478",
          ],
        },
        {
          urls: "turn:numb.viagenie.ca",
          credential: "muazkh",
          username: "webrtc@live.com",
        },
      ],
      iceCandidatePoolSize: 10,
    });

    // Log connection state changes for debugging
    this.peer.addEventListener("connectionstatechange", () => {});

    this.peer.addEventListener("signalingstatechange", () => {});

    this.peer.addEventListener("iceconnectionstatechange", () => {});
  }

  addLocalTracks(localStream: MediaStream){
    localStream.getTracks().forEach(track => {
      this.peer.addTrack(track, localStream)    
    });
  }

  async getOffer() {
    if (this.peer) {
      try {
        const offer = await this.peer.createOffer({
          offerToReceiveAudio: true,
          offerToReceiveVideo: true,
        });
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
        return offer;
      } catch (error) {
        console.error("Error creating offer:", error);
        throw error;
      }
    }
  }

  

  async getAnswer() {
    if (this.peer) {
      try {
        const answer = await this.peer.createAnswer();
        return answer;
      } catch (error) {
        console.error("Error creating answer:", error);
        throw error;
      }
    }
  }

  async setRemoteSdp(ans: RTCSessionDescriptionInit) {
    if (this.peer) {
      try {
        await this.peer.setRemoteDescription(new RTCSessionDescription(ans));
      } catch (error) {
        console.error("Error setting remote description:", error);
        throw error;
      }
    }
  }

  async setLocalSdp(offer: RTCSessionDescriptionInit) {
    if (this.peer) {
      try {
        await this.peer.setLocalDescription(new RTCSessionDescription(offer));
      } catch (error) {
        console.error("Error setting local description:", error);
        throw error;
      }
    }
  }

  async onIceCandidate(callback: (candidate: RTCIceCandidate) => void) {
    this.peer.onicecandidate = ({ candidate }) => {
      try {
        if (!candidate) return Error("Didn't receive the ice candidate");
        callback(candidate);
      } catch (error) {}
    };
  }

  async addIceCandidate(candidate: RTCIceCandidate) {
    try {
      this.peer.addIceCandidate(candidate);
    } catch (error) {
      console.log(error);
    }
  }
}

export default new PeerService();

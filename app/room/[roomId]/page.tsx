"use client";
import { useViewport } from "@/hooks/use-viewport";
import { useParams, useSearchParams } from "next/navigation";
import { useMediaStream } from "@/hooks/use-media-stream";
import MobileChat from "@/components/MobileChat";
import DesktopChat from "@/components/DesktopChat";
import { useCallback, useEffect, useRef, useState } from "react";
import { useSocket } from "@/providers/SocketProvider";
import peer from "@/service/peer";

export default function VideoChat() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const { isMobile } = useViewport();
  const searcParams = useSearchParams();
  const mode = searcParams.get("mode");
  const hasJoinedRef = useRef(false);

  const {
    localStream,
    remoteStream,
    hasLocalStream,
    hasRemoteStream,
    setLocalStream,
    setRemoteStream,
    setHasRemoteStream,
  } = useMediaStream();

  const { roomId } = useParams();

  const handleEndCall = () => {
    console.log("Call ended");
    // Handle call-end logic here
  };

  useEffect(() => {
    if (!socket) return;
    const anyLogger = (event: string, ...args: any[]) => {
      console.log("⬇️ got socket event:", event, args);
    };
    socket.onAny(anyLogger);
    return () => {
      socket.offAny(anyLogger);
    };
  }, [socket]);

  useEffect(() => {}, []);

  const onUserJoined = useCallback(
    async ({ id }: { id: string }) => {
      if (!localStream || !socket || remoteSocketId) return;

      console.log("User Joined:", id);
      setRemoteSocketId(id);

      peer.addLocalTracks(localStream);
      const offer = await peer.getOffer();
      if (!offer) return;
      const answer = await sendOfferAndWaitForAnswer(id, offer);
      console.log("This is the answer:", answer);
      await peer.setRemoteSdp(answer);
    },
    [socket, localStream]
  );

  const onReceivedOffer = useCallback(
    async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      console.log("Offer Received from:", from);
      setRemoteSocketId(from);
      console.log(localStream, "before");
      if (localStream && socket) {
        console.log(localStream, "After");
        await peer.setRemoteSdp(sdp);
        peer.addLocalTracks(localStream);
        const answer = await peer.getAnswer();
        peer.setLocalSdp(answer!);
        socket?.emit("webrtc-answer", { to: from, sdp: answer });
      }
    },
    [socket, localStream, setRemoteSocketId]
  );

  async function sendOfferAndWaitForAnswer(
    to: string,
    offer: RTCSessionDescriptionInit
  ) {
    return new Promise<RTCSessionDescriptionInit>((resolve, reject) => {
      socket?.on("webrtc-answer", ({ sdp, from }) => {
        resolve(sdp);
      });
      socket?.emit("webrtc-offer", { to, sdp: offer });
    });
  }

  // const handleSendOffer = useCallback(async () => {
  //   if (localStream && socket) {
  //     localStream
  //       .getTracks()
  //       .forEach((track) => peer.peer.addTrack(track, localStream));
  //     const offer = await peer.getOffer();
  //     socket.emit("webrtc-offer", { to: remoteSocketId, sdp: offer });
  //   }
  // }, [localStream, socket, remoteSocketId]);

  const onReceivedAnswer = useCallback(
    async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      await peer.setRemoteSdp(sdp);
    },
    [socket]
  );

  const onReceivingIceCandidate = useCallback(
    async ({ candidate }: { candidate: RTCIceCandidate }) => {
      await peer.addIceCandidate(candidate);
    },
    []
  );

  useEffect(() => {
    socket?.on("user-joined", onUserJoined);
    socket?.on("webrtc-offer", onReceivedOffer);
    // socket?.on("webrtc-answer", onReceivedAnswer);
    socket?.on("webrtc-ice-candidate", onReceivingIceCandidate);

    if (mode === "joiner" && !hasJoinedRef.current && localStream) {
      socket?.emit("join-room", { roomId }, () => {
        console.log("✅ Joined room as a joiner");
        hasJoinedRef.current = true;
      });
    }
    return () => {
      socket?.off("user-joined", onUserJoined);
      socket?.off("webrtc-offer", onReceivedOffer);
      // socket?.off("webrtc-answer", onReceivedAnswer);
      socket?.off("webrtc-ice-candidate", onReceivingIceCandidate);
    };
  }, [
    socket,
    mode,
    localStream,
    onUserJoined,
    onReceivedOffer,
    onReceivedAnswer,
    onReceivingIceCandidate,
  ]);

  useEffect(() => {
    peer.peer.ontrack = (event: RTCTrackEvent) => {
      console.log("This is the event ", event);
      const [incomingStream] = event.streams;
      setRemoteStream(incomingStream);
      setHasRemoteStream(true);
    };

    if (!socket || remoteSocketId === null) return;
    // Register our ICE‐candidate callback
    peer.onIceCandidate((candidate) => {
      socket.emit("webrtc-ice-candidate", {
        to: remoteSocketId,
        candidate,
      });
    });

    return () => {
      peer.onIceCandidate(() => {}); // reset it
    };
  }, [socket, remoteSocketId]);

  // Show loading state until viewport is determined
  if (isMobile === null) {
    return (
      <div className="w-full h-screen bg-black flex items-center justify-center">
        <div className="text-white">Loading...</div>
      </div>
    );
  }

  // Render only the appropriate layout based on viewport width
  if (isMobile) {
    return (
      <>
        
        <MobileChat
          roomId={roomId as string}
          localStream={localStream}
          remoteStream={remoteStream}
          hasLocalStream={hasLocalStream}
          hasRemoteStream={hasRemoteStream}
          onEndCall={handleEndCall}
        />
      </>
    );
  }

  return (
    <>
      <DesktopChat
        roomId={roomId as string}
        localStream={localStream}
        remoteStream={remoteStream}
        hasLocalStream={hasLocalStream}
        hasRemoteStream={hasRemoteStream}
        onEndCall={handleEndCall}
      />
    </>
  );
}

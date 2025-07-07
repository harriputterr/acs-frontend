"use client";
import { useViewport } from "@/hooks/use-viewport";
import { useParams } from "next/navigation";
import { useMediaStream } from "@/hooks/use-media-stream";
import MobileChat from "@/components/MobileChat";
import DesktopChat from "@/components/DesktopChat";
import { useCallback, useEffect, useState } from "react";
import { useSocket } from "@/providers/SocketProvider";
import peer from "@/service/peer";

export default function VideoChat() {
  const socket = useSocket();
  const [remoteSocketId, setRemoteSocketId] = useState<string | null>(null);
  const { isMobile } = useViewport();
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

  const onUserJoined = useCallback(
    async ({ id }: { id: string }) => {
      console.log("User Joined:", id);
      setRemoteSocketId(id);
    },
    [socket]
  );

  const onReceivedOffer = useCallback(
    async ({ from, sdp }: { from: string; sdp: RTCSessionDescriptionInit }) => {
      console.log("Offer Received from:", from);
      setRemoteSocketId(from);
      if (localStream && socket) {
        localStream
          .getTracks()
          .forEach((track) => peer.peer.addTrack(track, localStream));
        const answer = await peer.getAnswer(sdp);
        socket?.emit("webrtc-answer", { to: from, sdp: answer });
      }
    },
    [socket, localStream, setRemoteSocketId]
  );

  const handleSendOffer = useCallback(async () => {
    if (localStream && socket) {
      localStream
        .getTracks()
        .forEach((track) => peer.peer.addTrack(track, localStream));
      const offer = await peer.getOffer();
      socket.emit("webrtc-offer", { to: remoteSocketId, sdp: offer });
    }
  }, [localStream, socket, remoteSocketId]);

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
    socket?.on("webrtc-answer", onReceivedAnswer);
    socket?.on("webrtc-ice-candidate", onReceivingIceCandidate);
    return () => {
      socket?.off("user-joined", onUserJoined);
      socket?.off("webrtc-offer", onReceivedOffer);
      socket?.off("webrtc-answer", onReceivedAnswer);
      socket?.off("webrtc-ice-candidate", onReceivingIceCandidate);
    };
  }, [
    socket,
    onUserJoined,
    onReceivedOffer,
    onReceivedAnswer,
    onReceivingIceCandidate,
  ]);

  useEffect(() => {
    peer.peer.ontrack = (event: RTCTrackEvent) => {
      console.log("This is ran for me");
      const [incomingStream] = event.streams;
      console.log(incomingStream);
      setRemoteStream(incomingStream);
      setHasRemoteStream(true);
    };
    if (!socket || remoteSocketId === null) return;
    // Register our ICE‐candidate callback
    peer.onIceCandidate((candidate) => {
      console.log("Ice candidate ran for me");
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
        <div>
          <h1>RoomID: {roomId}</h1>
          {socket && <h2>Socket ID: {socket.id}</h2>}
          <button onClick={handleSendOffer}>Send Offer</button>
        </div>
        <MobileChat
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
      <div>
        <h1>RoomID: {roomId}</h1>
        {socket && <h2>Socket ID: {socket.id}</h2>}
        <button onClick={handleSendOffer}>Send Offer</button>
      </div>
      <DesktopChat
        localStream={localStream}
        remoteStream={remoteStream}
        hasLocalStream={hasLocalStream}
        hasRemoteStream={hasRemoteStream}
        onEndCall={handleEndCall}
      />
    </>
  );
}

"use client";
import ReactPlayer from "react-player";
import { useSocket } from "@/providers/SocketProvider";
import { useParams, useRouter } from "next/navigation";
import { useCallback, useEffect, useState } from "react";
import peer from "@/service/peer";
import VideoChat from "@/components/video-chat/page";

export default function Page() {
  const { roomId } = useParams();
  const router = useRouter();
  const socket = useSocket();
  const [myStream, setMyStream] = useState<MediaStream | null>(null);
  const [remoteSocketId, setRemoteSocketId] = useState<string>("");
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null);
  const [connectionStatus, setConnectionStatus] = useState("Disconnected");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isAudioOnly, setIsAudioOnly] = useState(false);
  const [isCameraEnabled, setIsCameraEnabled] = useState(true);
  const [isMicEnabled, setIsMicEnabled] = useState(true);
  const [username, setUsername] = useState<string>("");

  const getUserMedia = useCallback(async (audioOnly = false) => {
    // Clear previous errors
    setErrorMessage(null);

    // Try different approaches in sequence
    const approaches = [
      // Approach 1: Try with ideal constraints
      async () => {
        console.log("Trying approach 1: Ideal constraints");
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: audioOnly
            ? false
            : {
                width: { ideal: 640 },
                height: { ideal: 480 },
                frameRate: { ideal: 30 },
              },
        });
      },

      // Approach 2: Try with minimal video constraints
      async () => {
        if (audioOnly) throw new Error("Skip to audio only");
        console.log("Trying approach 2: Minimal video constraints");
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: {
            width: { ideal: 320 },
            height: { ideal: 240 },
            frameRate: { ideal: 15 },
          },
        });
      },

      // Approach 3: Try with just boolean constraints
      async () => {
        if (audioOnly) throw new Error("Skip to audio only");
        console.log("Trying approach 3: Boolean constraints");
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: true,
        });
      },

      // Approach 4: Try audio only
      async () => {
        console.log("Trying approach 4: Audio only");
        setIsAudioOnly(true);
        return await navigator.mediaDevices.getUserMedia({
          audio: true,
          video: false,
        });
      },
    ];

    // Try each approach in sequence
    for (let i = 0; i < approaches.length; i++) {
      try {
        const stream = await approaches[i]();
        console.log(`Approach ${i + 1} succeeded`);
        return stream;
      } catch (error) {
        console.error(`Approach ${i + 1} failed:`, error);
        // If this is the last approach, throw the error
        if (i === approaches.length - 1) {
          throw error;
        }
      }
    }

    // This should never be reached due to the throw in the loop
    throw new Error("All approaches failed");
  }, []);

  const handleUserJoined = useCallback(({ id }: { id: string }) => {
    console.log(`SOCKET ID ${id} joined room`);
    setRemoteSocketId(id);
  }, []);

  useEffect(() => {
    (async () => {
      try {
        const stream = await getUserMedia(false);
        setMyStream(stream);
        setIsAudioOnly(!stream.getVideoTracks().length);

        stream
          .getTracks()
          .forEach((track) => peer.peer.addTrack(track, stream));
      } catch (error) {
        console.error("Error loading media on mount:", error);
        setErrorMessage("Unable to access camera/microphone on load.");
      }
    })();
  }, [getUserMedia]);

  useEffect(() => {
    socket?.on("user:joined", handleUserJoined);

    return () => {
      socket?.off("user:joined", handleUserJoined);
    };
  }, [socket]);

  return (
      // <h1 className="flex text-2xl font-bold">Room Loaded!</h1>
      // <h1>{roomId && `Room Id: ${roomId}`}</h1>
    <>
      <VideoChat />
    </>
  );
}

"use client";
import { VideoChatConfig } from "@/types/VideoChatConfig";
import { useState, useRef, useEffect } from "react";
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Phone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Image from "next/image";
import MobileChat from "@/components/video-chat/mobile/page";
import DesktopChat from "@/components/video-chat/desktop/page";

export default function page() {
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);
  const [isSpeakerOff, setIsSpeakerOff] = useState(false);
  const [callDuration, setCallDuration] = useState(43); // seconds
  const [isCallActive, setIsCallActive] = useState(true);
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [isLocalVideoMain, setIsLocalVideoMain] = useState(false);
  const [dragStartTime, setDragStartTime] = useState(0);
  const [isMobile, setIsMobile] = useState(false);

  const localVideoRef = useRef<HTMLVideoElement>(null);
  const remoteVideoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  console.log(isLocalVideoMain);
  // Format time as MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  };

  // Simulate call timer
  useEffect(() => {
    if (!isCallActive) return;

    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [isCallActive]);

  // Initialize camera access
  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        if (localVideoRef.current) {
          localVideoRef.current.srcObject = stream;
        }
        if (remoteVideoRef.current) {
          remoteVideoRef.current.srcObject = stream;
        }
      } catch (error) {
        console.error("Error accessing media devices:", error);
      }
    };

    initializeMedia();
  }, []);

  const handleEndCall = () => {
    setIsCallActive(false);
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const toggleVideo = () => {
    setIsVideoOff(!isVideoOff);
  };

  const toggleSpeaker = () => {
    setIsSpeakerOff(!isSpeakerOff);
  };

  const handleVideoSwitch = () => {
    const dragDuration = Date.now() - dragStartTime;
    // Only switch if it was a quick tap (not a drag)
    if (dragDuration < 200 && !isDragging) {
      setIsLocalVideoMain(!isLocalVideoMain);
    }
  };

  const getConstrainedPosition = (x: number, y: number) => {
    if (!containerRef.current) return { x: 0, y: 0 };

    const container = containerRef.current.getBoundingClientRect();
    const videoWidth = window.innerWidth < 768 ? 96 : 128; // w-24 = 96px, w-32 = 128px
    const videoHeight = window.innerWidth < 768 ? 128 : 160; // h-32 = 128px, h-40 = 160px

    const maxX = container.width - videoWidth - 16; // 16px padding
    const maxY = container.height - videoHeight - 100; // 100px for controls

    return {
      x: Math.max(16, Math.min(maxX, x)),
      y: Math.max(16, Math.min(maxY, y)),
    };
  };

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true);
    setDragStartTime(Date.now());

    const startX = clientX - dragPosition.x;
    const startY = clientY - dragPosition.y;

    const handleMove = (moveX: number, moveY: number) => {
      const newPos = getConstrainedPosition(moveX - startX, moveY - startY);
      setDragPosition(newPos);
    };

    const handleEnd = () => {
      setIsDragging(false);
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchmove", handleTouchMove);
      document.removeEventListener("touchend", handleTouchEnd);
    };

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault();
      handleMove(e.clientX, e.clientY);
    };

    const handleMouseUp = () => {
      handleEnd();
    };

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault();
      handleMove(e.touches[0].clientX, e.touches[0].clientY);
    };

    const handleTouchEnd = () => {
      handleEnd();
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchmove", handleTouchMove, { passive: false });
    document.addEventListener("touchend", handleTouchEnd);
  };

  useEffect(() => {
    const onResize = () => setIsMobile(window.innerWidth < 1024);
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const config: VideoChatConfig = {
    localVideoRef,
    remoteVideoRef,
    containerRef,
    dragPosition,
    isDragging,
    isVideoOff,
    isMuted,
    isSpeakerOff,
    isLocalVideoMain,
    callDuration,
    handleDragStart,
    handleEndCall,
    handleVideoSwitch,
    toggleMute,
    toggleVideo,
    toggleSpeaker,
    formatTime,
    setIsLocalVideoMain,
  };

  return (
    <>
      {isMobile ? (
        <MobileChat config={config} />
      ) : (
        <DesktopChat config={config} />
      )}
      {/* Global styles */}
      <style jsx global>{`
        @media (max-width: 1024px) {
          body {
            overflow: hidden;
            position: fixed;
            width: 100%;
            height: 100%;
          }
        }
      `}</style>
    </>
  );
}

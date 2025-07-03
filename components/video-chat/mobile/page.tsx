"use client"
import {
  Mic,
  MicOff,
  Video,
  VideoOff,
  Volume2,
  VolumeX,
  Phone,
} from "lucide-react";
import { VideoChatConfig } from "@/types/VideoChatConfig";
import React from "react";
import { Button } from "@/components/ui/button";

export default function page({ config }: { config: VideoChatConfig }) {
  const {
    containerRef,
    isLocalVideoMain,
    remoteVideoRef,
    localVideoRef,
    dragPosition,
    isDragging,
    isVideoOff,
    callDuration,
    handleDragStart,
    handleEndCall,
    handleVideoSwitch,
    formatTime,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    isMuted,
    isSpeakerOff
  } = config;

  return (
    <>
      {/* Mobile Layout */}
      <div
        className="block lg:hidden w-full h-screen bg-black overflow-hidden"
        ref={containerRef}
      >
        {/* Main video area */}
        <div className="absolute inset-0">
          <video
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={isLocalVideoMain}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-gray-900/40 flex items-center justify-center">
            {/* <img
              src={isLocalVideoMain ? "/acs-placeholder-dark.png" : "/acs-placeholder-light.png"}
              alt="Main video placeholder 1"
              width={400}
              height={600}
              className="w-full h-full object-contain max-w-md"
            /> */}
          </div>
        </div>

        {/* Draggable small video */}
        <div
          className="absolute z-10 cursor-pointer select-none"
          style={{
            left: `${dragPosition.x}px`,
            top: `${dragPosition.y || 80}px`,
            transform: isDragging ? "scale(1.05)" : "scale(1)",
            transition: isDragging ? "none" : "all 0.2s ease",
          }}
          onMouseDown={(e) => {
            e.preventDefault();
            handleDragStart(e.clientX, e.clientY);
          }}
          onTouchStart={(e) => {
            e.preventDefault();
            handleDragStart(e.touches[0].clientX, e.touches[0].clientY);
          }}
          onClick={handleVideoSwitch}
        >
          <div className="relative w-24 h-32 md:w-32 md:h-40 rounded-2xl overflow-hidden bg-gray-800 border-2 border-white/20 shadow-lg">
            <video
              ref={localVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={!isLocalVideoMain}
            />
            {/* <div className="absolute inset-0 flex items-center justify-center bg-navy-900">
              <img
                src={isLocalVideoMain ? "/acs-placeholder-light.png" : "/acs-placeholder-dark.png"}
                alt="Small video placeholder"
                width={120}
                height={160}
                className="w-full h-full object-cover scale-150 object-[center_30%]"
              />
            </div> */}
            {((isLocalVideoMain && false) ||
              (!isLocalVideoMain && isVideoOff)) && (
              <div className="absolute inset-0 bg-navy-900 flex items-center justify-center">
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <VideoOff className="h-6 w-6 text-white" />
                </div>
              </div>
            )}
            <div className="absolute top-1 left-1/2 transform -translate-x-1/2">
              <div className="w-6 h-1 bg-white/50 rounded-full"></div>
            </div>
          </div>
        </div>

        {/* Call duration */}
        <div className="absolute top-4 right-4 z-10">
          <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
            <span className="text-white text-sm font-mono">
              {formatTime(callDuration)}
            </span>
          </div>
        </div>

        {/* Control buttons - raised higher for mobile */}
        <div className="absolute bottom-28 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-4">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className={`w-16 h-16 rounded-full ${
                isMuted
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/20 hover:bg-white/30"
              } backdrop-blur-sm`}
            >
              {isMuted ? (
                <MicOff className="h-5 w-5 text-white" />
              ) : (
                <Mic className="h-10 w-10 text-white" />
              )}
            </Button>

            <Button
              onClick={toggleVideo}
              variant="ghost"
              size="icon"
              className={`w-16 h-16 rounded-full ${
                isVideoOff
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/20 hover:bg-white/30"
              } backdrop-blur-sm`}
            >
              {isVideoOff ? (
                <VideoOff className="h-5 w-5 text-white" />
              ) : (
                <Video className="h-5 w-5 text-white" />
              )}
            </Button>

            <Button
              onClick={toggleSpeaker}
              variant="ghost"
              size="icon"
              className={`w-16 h-16 rounded-full ${
                isSpeakerOff
                  ? "bg-red-500 hover:bg-red-600"
                  : "bg-white/20 hover:bg-white/30"
              } backdrop-blur-sm`}
            >
              {isSpeakerOff ? (
                <VolumeX className="h-5 w-5 text-white" />
              ) : (
                <Volume2 className="h-5 w-5 text-white" />
              )}
            </Button>

            <Button
              onClick={handleEndCall}
              variant="ghost"
              size="icon"
              className="w-16 h-16 rounded-full bg-red-500 hover:bg-red-600 backdrop-blur-sm"
            >
              <Phone className="h-5 w-5 text-white rotate-[135deg]" />
            </Button>
          </div>
        </div>
      </div>
    </>
  );
}

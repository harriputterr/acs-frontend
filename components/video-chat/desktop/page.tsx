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

export default function DesktopChat({config} : {config: VideoChatConfig}) {
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
    setIsLocalVideoMain,
    formatTime,
    toggleMute,
    toggleSpeaker,
    toggleVideo,
    isMuted,
    isSpeakerOff
  } = config;

  return (
    <div className="hidden lg:flex w-full h-screen bg-black">
        {/* Main video area */}
        <div className="flex-1 relative">
          <video
            // ref={isLocalVideoMain ? localVideoRef : remoteVideoRef}
            ref={remoteVideoRef}
            className="w-full h-full object-cover"
            autoPlay
            playsInline
            muted={isLocalVideoMain}
          />
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-gray-900/40 flex items-center justify-center">
            {/* <img
              src={isLocalVideoMain ? "/acs-placeholder-dark.png" : "/acs-placeholder-light.png"}
              alt="Main video placeholder"
              width={800}
              height={600}
              className="w-full h-full object-contain"
              
            /> */}
          </div>

          {/* Call duration - desktop */}
          <div className="absolute bottom-6 left-6 z-10">
            <div className="bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
              <span className="text-white text-lg font-mono">
                {formatTime(callDuration)}
              </span>
            </div>
          </div>

          {/* Control buttons - desktop */}
          <div className="absolute bottom-6 left-1/2 transform -translate-x-1/2 z-20">
            <div className="flex items-center space-x-6">
              <Button
                onClick={toggleMute}
                variant="ghost"
                size="icon"
                className={`w-14 h-14 rounded-full ${
                  isMuted
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/20 hover:bg-white/30"
                } backdrop-blur-sm`}
              >
                {isMuted ? (
                  <MicOff className="h-6 w-6 text-white" />
                ) : (
                  <Mic className="h-6 w-6 text-white" />
                )}
              </Button>

              <Button
                onClick={toggleVideo}
                variant="ghost"
                size="icon"
                className={`w-14 h-14 rounded-full ${
                  isVideoOff
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/20 hover:bg-white/30"
                } backdrop-blur-sm`}
              >
                {isVideoOff ? (
                  <VideoOff className="h-6 w-6 text-white" />
                ) : (
                  <Video className="h-6 w-6 text-white" />
                )}
              </Button>

              <Button
                onClick={toggleSpeaker}
                variant="ghost"
                size="icon"
                className={`w-14 h-14 rounded-full ${
                  isSpeakerOff
                    ? "bg-red-500 hover:bg-red-600"
                    : "bg-white/20 hover:bg-white/30"
                } backdrop-blur-sm`}
              >
                {isSpeakerOff ? (
                  <VolumeX className="h-6 w-6 text-white" />
                ) : (
                  <Volume2 className="h-6 w-6 text-white" />
                )}
              </Button>

              <Button
                onClick={handleEndCall}
                variant="ghost"
                size="icon"
                className="w-14 h-14 rounded-full bg-red-500 hover:bg-red-600 backdrop-blur-sm"
              >
                <Phone className="h-6 w-6 text-white rotate-[135deg]" />
              </Button>
            </div>
          </div>
        </div>

        {/* Right sidebar for desktop */}
        <div className="w-80 bg-gray-900 flex flex-col">
          {/* Secondary video */}
          <div className="flex-1 p-4">
            <div
              className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 cursor-pointer hover:border-white/30 transition-colors"
              onClick={() => setIsLocalVideoMain(!isLocalVideoMain)}
            >
              <video
                ref={localVideoRef}
                // ref={isLocalVideoMain ? remoteVideoRef : localVideoRef}
                className="w-full h-full object-cover"
                autoPlay
                playsInline
                muted={!isLocalVideoMain}
              />
              <div className="absolute inset-0 flex items-center justify-center bg-navy-900">
                {/* <img
                  src={isLocalVideoMain ? "/acs-placeholder-light.png" : "/acs-placeholder-dark.png"}
                  alt="Secondary video placeholder"
                  width={300}
                  height={200}
                  className="w-full h-full object-contain"
                /> */}
              </div>
              {((isLocalVideoMain && false) ||
                (!isLocalVideoMain && isVideoOff)) && (
                <div className="absolute inset-0 bg-navy-900 flex items-center justify-center">
                  <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                    <VideoOff className="h-8 w-8 text-white" />
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Chat or additional controls area */}
          <div className="h-32 p-4 border-t border-gray-700">
            <div className="text-white text-sm opacity-75 text-center">
              Click video to switch views
            </div>
          </div>
        </div>
      </div>
  )
}

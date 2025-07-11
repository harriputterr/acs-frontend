"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Phone, Copy } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"
import { toast } from "sonner"

interface DesktopChatProps {
  roomId: string
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  hasLocalStream: boolean
  hasRemoteStream: boolean
  onEndCall: () => void
}

export default function DesktopChat({
  roomId,
  localStream,
  remoteStream,
  hasLocalStream,
  hasRemoteStream,
  onEndCall,
}: DesktopChatProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [callDuration, setCallDuration] = useState(0)
  const [isCallActive, setIsCallActive] = useState(true)
  const [isLocalVideoMain, setIsLocalVideoMain] = useState(false)
  const desktopMainVideoRef = useRef<HTMLVideoElement>(null)
  const desktopSideVideoRef = useRef<HTMLVideoElement>(null)

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  useEffect(() => {
    if (!isCallActive) return
    const interval = setInterval(() => {
      setCallDuration((prev) => prev + 1)
    }, 1000)
    return () => clearInterval(interval)
  }, [isCallActive])

  useEffect(() => {
    if (desktopMainVideoRef.current) {
      desktopMainVideoRef.current.srcObject = isLocalVideoMain ? localStream : remoteStream
    }
    if (desktopSideVideoRef.current) {
      desktopSideVideoRef.current.srcObject = isLocalVideoMain ? remoteStream : localStream
    }
  }, [localStream, remoteStream, isLocalVideoMain])

  const handleEndCall = () => {
    setIsCallActive(false)
    onEndCall()
  }

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsMuted(!isMuted)
    }
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = !track.enabled
      })
      setIsVideoOff(!isVideoOff)
    }
  }

  const toggleSpeaker = () => {
    setIsSpeakerOff(!isSpeakerOff)
    if (desktopMainVideoRef.current) {
      desktopMainVideoRef.current.muted = !isSpeakerOff && !isLocalVideoMain
    }
    if (desktopSideVideoRef.current) {
      desktopSideVideoRef.current.muted = !isSpeakerOff && isLocalVideoMain
    }
  }

  const shouldShowMainPlaceholder = () => {
    return isLocalVideoMain ? !hasLocalStream || isVideoOff : !hasRemoteStream
  }

  const shouldShowSidePlaceholder = () => {
    return isLocalVideoMain ? !hasRemoteStream : !hasLocalStream || isVideoOff
  }

  const copyRoomId = () => {
    navigator.clipboard.writeText(roomId)
    toast.success("Room ID copied to clipboard!")
  }

  return (
    <div className="flex w-full h-screen bg-black">
      {/* Main video area */}
      <div className="flex-1 relative">
        <video
          ref={desktopMainVideoRef}
          className="w-full h-full object-cover"
          autoPlay
          playsInline
          muted={isLocalVideoMain || isSpeakerOff}
          style={{
            display: shouldShowMainPlaceholder() ? "none" : "block",
          }}
        />
        {shouldShowMainPlaceholder() && (
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/20 to-gray-900/40 flex items-center justify-center">
            <Image
              src={isLocalVideoMain ? "/acs-placeholder-dark.png" : "/acs-placeholder-light.png"}
              alt="Main video placeholder"
              width={800}
              height={600}
              className="w-full h-full object-contain"
              priority
            />
            {isLocalVideoMain && isVideoOff && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <VideoOff className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
        )}
        {/* Call duration */}
        <div className="absolute top-6 left-1/2 -translate-x-1/2 z-30">
          <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm rounded-full px-4 py-2">
            <div className="w-2.5 h-2.5 bg-red-500 rounded-full animate-pulse"></div>
            <span className="text-white text-lg font-mono tracking-wider">{formatTime(callDuration)}</span>
          </div>
        </div>
        {/* Control buttons */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="flex items-center space-x-6">
            <Button
              onClick={toggleMute}
              variant="ghost"
              size="icon"
              className={`w-14 h-14 rounded-full ${
                isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
              } backdrop-blur-sm`}
            >
              {isMuted ? <MicOff className="h-6 w-6 text-white" /> : <Mic className="h-6 w-6 text-white" />}
            </Button>
            <Button
              onClick={toggleVideo}
              variant="ghost"
              size="icon"
              className={`w-14 h-14 rounded-full ${
                isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
              } backdrop-blur-sm`}
            >
              {isVideoOff ? <VideoOff className="h-6 w-6 text-white" /> : <Video className="h-6 w-6 text-white" />}
            </Button>
            <Button
              onClick={toggleSpeaker}
              variant="ghost"
              size="icon"
              className={`w-14 h-14 rounded-full ${
                isSpeakerOff ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
              } backdrop-blur-sm`}
            >
              {isSpeakerOff ? <VolumeX className="h-6 w-6 text-white" /> : <Volume2 className="h-6 w-6 text-white" />}
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
      {/* Right sidebar */}
      <div className="w-80 bg-gray-900 flex flex-col">
        <div className="flex-1 p-4 space-y-4">
          <div
            className="relative w-full h-64 rounded-2xl overflow-hidden bg-gray-800 border border-gray-700 cursor-pointer hover:border-white/30 transition-colors"
            onClick={() => setIsLocalVideoMain(!isLocalVideoMain)}
          >
            <video
              ref={desktopSideVideoRef}
              className="w-full h-full object-cover"
              autoPlay
              playsInline
              muted={!isLocalVideoMain || isSpeakerOff}
              style={{
                display: shouldShowSidePlaceholder() ? "none" : "block",
              }}
            />
            {shouldShowSidePlaceholder() && (
              <div className="absolute inset-0 flex items-center justify-center bg-navy-900">
                <Image
                  src={isLocalVideoMain ? "/acs-placeholder-light.png" : "/acs-placeholder-dark.png"}
                  alt="Secondary video placeholder"
                  width={300}
                  height={200}
                  className="w-full h-full object-contain"
                />
              </div>
            )}
            {!isLocalVideoMain && isVideoOff && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <VideoOff className="h-8 w-8 text-white" />
              </div>
            )}
          </div>
          <div>
            <h3 className="text-sm text-gray-400 mb-1">Room ID</h3>
            <div className="flex items-center gap-2">
              <p className="flex-1 text-lg font-mono text-white bg-gray-800 p-2 rounded-md truncate">{roomId}</p>
              <Button
                onClick={copyRoomId}
                variant="outline"
                size="icon"
                className="bg-gray-800 border-gray-700 hover:bg-gray-700"
              >
                <Copy className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
        <div className="h-32 p-4 border-t border-gray-700">
          <div className="text-white text-sm opacity-75 text-center">Click video to switch views</div>
        </div>
      </div>
    </div>
  )
}

"use client"

import { useState, useRef, useEffect } from "react"
import { Mic, MicOff, Video, VideoOff, Volume2, VolumeX, Phone } from "lucide-react"
import { Button } from "@/components/ui/button"
import Image from "next/image"

interface MobileChatProps {
  localStream: MediaStream | null
  remoteStream: MediaStream | null
  hasLocalStream: boolean
  hasRemoteStream: boolean
  onEndCall: () => void
}

export default function MobileChat({ localStream, remoteStream, hasLocalStream, hasRemoteStream, onEndCall }: MobileChatProps) {
  const [isMuted, setIsMuted] = useState(false)
  const [isVideoOff, setIsVideoOff] = useState(false)
  const [isSpeakerOff, setIsSpeakerOff] = useState(false)
  const [callDuration, setCallDuration] = useState(43)
  const [isCallActive, setIsCallActive] = useState(true)
  const [dragPosition, setDragPosition] = useState({ x: 0, y: 0 })
  const [isDragging, setIsDragging] = useState(false)
  const [isLocalVideoMain, setIsLocalVideoMain] = useState(false)
  const [dragStartTime, setDragStartTime] = useState(0)
  const [isInitialized, setIsInitialized] = useState(false)

  // Separate refs for mobile layout
  const mobileMainVideoRef = useRef<HTMLVideoElement>(null)
  const mobileSmallVideoRef = useRef<HTMLVideoElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  // Initialize default position only once on client side
  useEffect(() => {
    if (!isInitialized && typeof window !== "undefined") {
      setDragPosition({
        x: window.innerWidth - 112,
        y: 80,
      })
      setIsInitialized(true)
    }
  }, [isInitialized])

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

  // Assign streams to video elements based on current layout
  useEffect(() => {
    if (mobileMainVideoRef.current) {
      mobileMainVideoRef.current.srcObject = isLocalVideoMain ? localStream : remoteStream
    }
    if (mobileSmallVideoRef.current) {
      mobileSmallVideoRef.current.srcObject = isLocalVideoMain ? remoteStream : localStream
    }
  }, [localStream, remoteStream, isLocalVideoMain])

  const handleEndCall = () => {
    setIsCallActive(false)
    onEndCall()
  }

  const toggleMute = () => {
    if (localStream) {
      localStream.getAudioTracks().forEach((track) => {
        track.enabled = isMuted
      })
    }
    setIsMuted(!isMuted)
  }

  const toggleVideo = () => {
    if (localStream) {
      localStream.getVideoTracks().forEach((track) => {
        track.enabled = isVideoOff
      })
    }
    setIsVideoOff(!isVideoOff)
  }

  const toggleSpeaker = () => {
    setIsSpeakerOff(!isSpeakerOff)
    if (mobileMainVideoRef.current) {
      mobileMainVideoRef.current.muted = !isSpeakerOff && !isLocalVideoMain
    }
    if (mobileSmallVideoRef.current) {
      mobileSmallVideoRef.current.muted = !isSpeakerOff && isLocalVideoMain
    }
  }

  const handleVideoSwitch = () => {
    const dragDuration = Date.now() - dragStartTime
    if (dragDuration < 200 && !isDragging) {
      setIsLocalVideoMain(!isLocalVideoMain)
    }
  }

  const getConstrainedPosition = (x: number, y: number) => {
    if (!containerRef.current) return { x: 0, y: 0 }

    const container = containerRef.current.getBoundingClientRect()
    const videoWidth = 96
    const videoHeight = 128

    const maxX = container.width - videoWidth - 16
    const maxY = container.height - videoHeight - 160
    const minX = 16
    const minY = 60

    return {
      x: Math.max(minX, Math.min(maxX, x)),
      y: Math.max(minY, Math.min(maxY, y)),
    }
  }

  const handleDragStart = (clientX: number, clientY: number) => {
    setIsDragging(true)
    setDragStartTime(Date.now())

    const startX = clientX - dragPosition.x
    const startY = clientY - dragPosition.y

    const handleMove = (moveX: number, moveY: number) => {
      const newPos = getConstrainedPosition(moveX - startX, moveY - startY)
      setDragPosition(newPos)
    }

    const handleEnd = () => {
      setIsDragging(false)
      document.removeEventListener("mousemove", handleMouseMove)
      document.removeEventListener("mouseup", handleMouseUp)
      document.removeEventListener("touchmove", handleTouchMove)
      document.removeEventListener("touchend", handleTouchEnd)
    }

    const handleMouseMove = (e: MouseEvent) => {
      e.preventDefault()
      handleMove(e.clientX, e.clientY)
    }

    const handleMouseUp = () => {
      handleEnd()
    }

    const handleTouchMove = (e: TouchEvent) => {
      e.preventDefault()
      handleMove(e.touches[0].clientX, e.touches[0].clientY)
    }

    const handleTouchEnd = () => {
      handleEnd()
    }

    document.addEventListener("mousemove", handleMouseMove)
    document.addEventListener("mouseup", handleMouseUp)
    document.addEventListener("touchmove", handleTouchMove, { passive: false })
    document.addEventListener("touchend", handleTouchEnd)
  }

  const shouldShowMainPlaceholder = () => {
    return isLocalVideoMain ? !hasLocalStream || isVideoOff : !hasRemoteStream
  }

  const shouldShowSmallPlaceholder = () => {
    return isLocalVideoMain ? !hasRemoteStream : !hasLocalStream || isVideoOff
  }

  // Don't render until position is initialized to prevent jump
  if (!isInitialized) {
    return (
      <div className="relative w-full h-screen bg-black overflow-hidden">
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-white">Loading...</div>
        </div>
      </div>
    )
  }

  return (
    <div className="relative w-full h-screen bg-black overflow-hidden" ref={containerRef}>
      {/* Main video area */}
      <div className="absolute inset-0 w-full h-full">
        <video
          ref={mobileMainVideoRef}
          className="absolute inset-0 w-full h-full object-cover z-10"
          autoPlay
          playsInline
          muted={isLocalVideoMain || isSpeakerOff}
          style={{
            display: shouldShowMainPlaceholder() ? "none" : "block",
          }}
        />

        {shouldShowMainPlaceholder() && (
          <div className="absolute inset-0 w-full h-full bg-gray-900 flex items-center justify-center z-10">
            <Image
              src={isLocalVideoMain ? "/acs-placeholder-dark.png" : "/acs-placeholder-light.png"}
              alt="Main video placeholder"
              width={400}
              height={600}
              className="w-full h-full object-contain max-w-md"
              priority
            />
            {isLocalVideoMain && isVideoOff && (
              <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                <VideoOff className="h-12 w-12 text-white" />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Small draggable video */}
      <div
        className="absolute z-20 cursor-pointer select-none touch-none"
        style={{
          left: `${dragPosition.x}px`, // No fallback needed since we initialize properly
          top: `${dragPosition.y}px`,
          transform: isDragging ? "scale(1.05)" : "scale(1)",
          transition: isDragging ? "none" : "all 0.2s ease",
        }}
        onMouseDown={(e) => {
          e.preventDefault()
          handleDragStart(e.clientX, e.clientY)
        }}
        onTouchStart={(e) => {
          handleDragStart(e.touches[0].clientX, e.touches[0].clientY)
        }}
        onClick={handleVideoSwitch}
      >
        <div className="relative w-24 h-32 rounded-2xl overflow-hidden bg-gray-800 border-2 border-white/20 shadow-lg">
          <video
            ref={mobileSmallVideoRef}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay
            playsInline
            muted={!isLocalVideoMain || isSpeakerOff}
            style={{
              display: shouldShowSmallPlaceholder() ? "none" : "block",
            }}
          />

          {shouldShowSmallPlaceholder() && (
            <div className="absolute inset-0 w-full h-full bg-gray-800 flex items-center justify-center">
              <Image
                src={isLocalVideoMain ? "/acs-placeholder-light.png" : "/acs-placeholder-dark.png"}
                alt="Small video placeholder"
                width={120}
                height={160}
                className="w-full h-full object-cover scale-150 object-[center_30%]"
              />
            </div>
          )}

          {!isLocalVideoMain && isVideoOff && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center z-10">
              <VideoOff className="h-6 w-6 text-white" />
            </div>
          )}

          <div className="absolute top-1 left-1/2 transform -translate-x-1/2 z-10">
            <div className="w-6 h-1 bg-white/50 rounded-full"></div>
          </div>
        </div>
      </div>

      {/* Call duration */}
      <div className="absolute bottom-48 left-4 z-30">
        <div className="bg-black/50 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-white text-sm font-mono">{formatTime(callDuration)}</span>
        </div>
      </div>

      {/* Control buttons */}
      <div className="absolute bottom-36 left-1/2 transform -translate-x-1/2 z-30">
        <div className="flex items-center space-x-4">
          <Button
            onClick={toggleMute}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full ${
              isMuted ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
            } backdrop-blur-sm`}
          >
            {isMuted ? <MicOff className="h-5 w-5 text-white" /> : <Mic className="h-5 w-5 text-white" />}
          </Button>

          <Button
            onClick={toggleVideo}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full ${
              isVideoOff ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
            } backdrop-blur-sm`}
          >
            {isVideoOff ? <VideoOff className="h-5 w-5 text-white" /> : <Video className="h-5 w-5 text-white" />}
          </Button>

          <Button
            onClick={toggleSpeaker}
            variant="ghost"
            size="icon"
            className={`w-12 h-12 rounded-full ${
              isSpeakerOff ? "bg-red-500 hover:bg-red-600" : "bg-white/20 hover:bg-white/30"
            } backdrop-blur-sm`}
          >
            {isSpeakerOff ? <VolumeX className="h-5 w-5 text-white" /> : <Volume2 className="h-5 w-5 text-white" />}
          </Button>

          <Button
            onClick={handleEndCall}
            variant="ghost"
            size="icon"
            className="w-12 h-12 rounded-full bg-red-500 hover:bg-red-600 backdrop-blur-sm"
          >
            <Phone className="h-5 w-5 text-white rotate-[135deg]" />
          </Button>
        </div>
      </div>
    </div>
  )
}

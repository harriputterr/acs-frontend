"use client"

import { useEffect, useState } from "react"

export function useMediaStream() {
  const [localStream, setLocalStream] = useState<MediaStream | null>(null)
  const [remoteStream, setRemoteStream] = useState<MediaStream | null>(null)
  const [hasLocalStream, setHasLocalStream] = useState(false)
  const [hasRemoteStream, setHasRemoteStream] = useState(false)

  useEffect(() => {
    const initializeMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: { width: 1280, height: 720 },
          audio: true,
        })

        setLocalStream(stream)
        setHasLocalStream(true)

        // Simulate remote stream for demo
        // const clonedStream = stream.clone()
        // setRemoteStream(clonedStream)
        // setHasRemoteStream(true)
      } catch (error) {
        console.error("Error accessing media devices:", error)
        alert("Camera access denied. Please allow camera access and refresh.")
      }
    }

    initializeMedia()

    return () => {
      // Cleanup streams
      if (localStream) {
        localStream.getTracks().forEach((track) => track.stop())
      }
      if (remoteStream) {
        remoteStream.getTracks().forEach((track) => track.stop())
      }
    }
  }, [])

  return {
    localStream,
    remoteStream,
    hasLocalStream,
    hasRemoteStream,
    setLocalStream,
    setRemoteStream,
    setHasRemoteStream
  }
}

"use client"

import type React from "react"

import { Suspense } from "react"
import { Input } from "@/components/ui/input"
import { useSocket } from "@/providers/SocketProvider"
import { Button } from "@/components/ui/button"
import { Video, Keyboard } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"
import { toast } from "sonner"
import { useCallback, useState } from "react"
import { useSession } from "next-auth/react"

function LandingContent() {
  const [inputRoomId, setInputRoomId] = useState("")
  const { data: session } = useSession()
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const socket = useSocket()
  const params = useSearchParams()
  const userNameFromForm = params.get("username")

  if (userNameFromForm) {
    localStorage.setItem("guestUsername", userNameFromForm)
  }

  const handleStartNewCall = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!socket) return
      if (!socket.connected) socket.connect()

      const username = session?.user?.name || userNameFromForm || "Guest"
      socket.emit("create-room", { username }, ({ roomId }: { roomId: string }) => {
        router.push(`/room/${roomId}?mode=creator`)
      })
    },
    [socket, router, session, userNameFromForm],
  )

  const handleJoinRoom = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!socket) return
      if (!socket.connected) socket.connect()

      setIsLoading(true)
      socket?.emit("room-exist", { roomId: inputRoomId }, ({ roomExists }: { roomExists: boolean }) => {
        if (!roomExists) {
          toast.error("Room doesn't exist! Please use a valid room id or start a new call.")
          setIsLoading(false)
        } else {
          router.push(`/room/${inputRoomId}?mode=joiner`)
        }
      })
    },
    [inputRoomId, socket, router],
  )

  return (
    <div className="flex flex-col min-h-screen bg-gray-50 text-gray-800">
      {/* Hero Section */}
      <div className="flex-grow flex items-center justify-center">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-slate-800">
              Your eyes on the grime,
              <br />
              from a safe distance.
            </h1>
            <p className="mt-4 text-lg text-gray-600">
              Crystal-clear 1:1 video calls to operate and monitor your ACS cleaning robots in hazardous zones.
            </p>
            <div className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                onClick={handleStartNewCall}
                size="lg"
                className="w-full sm:w-auto bg-orange-500 hover:bg-orange-600 text-white"
              >
                <Video className="mr-2 h-5 w-5" />
                Start a New Call
              </Button>
              <div className="w-full sm:w-auto flex items-center space-x-2">
                <div className="relative flex-grow">
                  <Keyboard className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    placeholder="Enter a code"
                    className="pl-10 w-full"
                    onChange={(e) => setInputRoomId(e.target.value)}
                  />
                </div>
                <Button variant="outline" onClick={handleJoinRoom} disabled={isLoading || !inputRoomId.trim()}>
                  {isLoading ? "Joining..." : "Join"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default function LandingPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <LandingContent />
    </Suspense>
  )
}

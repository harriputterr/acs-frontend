"use client";
import { Input } from "@/components/ui/input";
import { useSocket } from "@/providers/SocketProvider";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Zap,
  Shield,
  Users,
  BarChart3,
  Video,
  Keyboard,
} from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import dynamic from "next/dynamic";


import { useCallback, useEffect, useState } from "react";

const ClientInput = dynamic(
  () => import("@/components/ui/input").then((mod) => mod.Input),
  { ssr: false }
);
export default function Home() {
  const [inputRoomId, setInputRoomId] = useState("");
  
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const socket = useSocket();

  const handleStartNewCall = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      if (!socket) return;

      if (!socket.connected) socket.connect();
      // Will send username as data into this emitting event later.
      socket.emit(
        "room:create",
        undefined,
        ({ roomId }: { roomId: string }) => {
          router.push(`/room/${roomId}`);
        }
      );
    },
    [socket, router]
  );

  const handleJoinRoom = useCallback(
    (e: React.MouseEvent<HTMLButtonElement>) => {
      console.log("Button was clicked");
      console.log(inputRoomId)
     
      if (!socket) return;
      if (!socket.connected) socket.connect();

      setIsLoading(true);

      socket?.emit(
        "room:join",
        { roomId: inputRoomId },
        ({ roomExists }: { roomExists: boolean }) => {
          if (!roomExists) {
            // Show toasts room doesnt exists
            toast.error(
              "Room doesn't exist! Please use a valid room id or start a new call."
            );
            setIsLoading(false)
          } else {
            router.push(`/room/${inputRoomId}`);
          }
        }
      );
    },
    [isLoading,inputRoomId, socket, router]
  );

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
              Crystal-clear 1:1 video calls to operate and monitor your ACS
              cleaning robots in hazardous zones.
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
                  <ClientInput
                    type="text"
                    placeholder="Enter a code"
                    className="pl-10 w-full"
                    onChange={(e) => setInputRoomId(e.target.value)}
                  />
                </div>
                <Button
                  variant="outline"
                  onClick={handleJoinRoom}
                  disabled={isLoading || !inputRoomId.trim()}
                >
                  {isLoading ? "Joining..." : "Join"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>


      
      
    </div>
  );
}

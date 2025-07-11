"use client";

import type React from "react";
import { Inter } from "next/font/google";

import { Toaster } from "sonner";
import NextAuthSessionProvider from "@/providers/NextAuthSessionProvider";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { LogOut, User } from "lucide-react";
import { useEffect, useState } from "react";

const inter = Inter({ subsets: ["latin"] });

export default function AppHeader() {
  const { data: session } = useSession();
  const [userName, setUserName] = useState<string | null>(null);
   useEffect(() => {
    if (typeof window === "undefined") return

    // Initial load
    setUserName(window.localStorage.getItem("username"))

    // Update when another tab (or same tab) changes that key
    const onStorage = (e: StorageEvent) => {
      if (e.key === "username") {
        setUserName(e.newValue)
      }
    }
    window.addEventListener("storage", onStorage)
    return () => window.removeEventListener("storage", onStorage)
  }, []) // still just []—we set up our own listener
  
  if (!session && !userName) return null;
  return (
    <div className="bg-white/80 backdrop-blur-md border-b border-gray-200 p-4 sticky top-0 z-50">
      <div className="container mx-auto flex justify-between items-center">
        <div className="flex items-center gap-3">
          <User className="h-5 w-5 text-gray-600" />
          <span className="font-semibold text-gray-800">
            Welcome, {session?.user?.name || userName}
          </span>
        </div>
        <Button
          onClick={() => {
            localStorage.removeItem("username")
            signOut({ callbackUrl: "/" });
          }}
          variant="outline"
          size="sm"
        >
          <LogOut className="mr-2 h-4 w-4" />
          Sign Out
        </Button>
      </div>
    </div>
  );
}

"use client"

import type React from "react"
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { User, ArrowRight } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { Github } from "lucide-react"
import Image from "next/image"
import { toast } from "sonner"
import Link from "next/link"
import { sign } from "crypto";

export default function SignIn() {
  const [username, setUsername] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter();
  const handleSocialSignIn = async (provider: "google" | "github") => {
    signIn(provider, {callbackUrl: "/landing"})
  }

  const handleUsernameSubmit = () => {
    if (!username.trim()) {
      toast.error("Please enter a username")
      return
    }
    if (username.trim().length < 2) {
      toast.error("Username must be at least 2 characters")
      return
    }

    setIsLoading(true)
    router.push(`/landing?username=${username}`)
  }

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleUsernameSubmit()
    }
  }

  return (
    <div className="min-h-screen relative overflow-hidden bg-gradient-to-br from-slate-50 to-gray-100">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0">
        <Image
          src="/acs-hero.jpg"
          alt="ACS Automated Cleaning Services"
          fill
          className="object-cover opacity-40"
          priority
        />
        <div className="absolute inset-0 bg-gradient-to-r from-white/75 to-white/60" />
      </div>

      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-3 md:p-4">
        <div className="w-full max-w-6xl mx-auto">
          {/* Header - Compact on Mobile */}
          <div className="text-center mb-6 md:mb-16">
            <div className="mb-4 md:mb-8">
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-7xl font-bold text-slate-800 mb-2 md:mb-6 leading-tight">
                Connect with Experts.
                <br />
                <span className="text-orange-500">Clean with Confidence.</span>
              </h1>
              <p className="text-sm sm:text-base md:text-xl lg:text-2xl text-gray-600 max-w-3xl mx-auto leading-relaxed px-2">
                Crystal-clear video calls to operate and monitor your ACS cleaning robots in hazardous zones.
              </p>
            </div>
          </div>

          {/* Mobile Layout */}
          <div className="block md:hidden">
            <div className="space-y-4 max-w-sm mx-auto">
              {/* Mobile Sign In Card */}
              <Card className="backdrop-blur-md bg-white/95 border-0 shadow-xl">
                <CardHeader className="text-center pb-3">
                  <CardTitle className="text-xl font-bold text-slate-800">Sign In</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3 px-4 pb-4">
                  <Button
                    onClick={() => handleSocialSignIn("google")}
                    variant="outline"
                    className="w-full h-10 text-sm font-medium hover:bg-gray-50 transition-all duration-200 border-2 hover:border-gray-300"
                    disabled={isLoading}
                  >
                    <FcGoogle className="mr-2 h-4 w-4" />
                    Continue with Google
                  </Button>

                  <Button
                    onClick={() => handleSocialSignIn("github")}
                    variant="outline"
                    className="w-full h-10 text-sm font-medium hover:bg-gray-50 transition-all duration-200 border-2 hover:border-gray-300"
                    disabled={isLoading}
                  >
                    <Github className="mr-2 h-4 w-4" />
                    Continue with GitHub
                  </Button>
                </CardContent>
              </Card>

            </div>
          </div>

          {/* Desktop Layout - Unchanged */}
          <div className="hidden md:flex  flex-col lg:flex-row items-center justify-center gap-8 max-w-xl mx-auto">
            {/* Sign In Card */}
            <Card className="backdrop-blur-md bg-white/95 border-0 shadow-2xl hover:shadow-3xl transition-all duration-300 w-full lg:w-auto lg:flex-1">
              <CardHeader className="text-center pb-8">
                <CardTitle className="text-3xl font-bold text-slate-800">Sign In</CardTitle>
              </CardHeader>
              <CardContent className="space-y-6 px-8 pb-8">
                <Button
                  onClick={() => handleSocialSignIn("google")}
                  variant="outline"
                  className="w-full h-14 text-lg font-medium hover:bg-gray-50 transition-all duration-200 border-2 hover:border-gray-300"
                  disabled={isLoading}
                >
                  <FcGoogle className="mr-4 h-6 w-6" />
                  Continue with Google
                </Button>

                <Button
                  onClick={() => handleSocialSignIn("github")}
                  variant="outline"
                  className="w-full h-14 text-lg font-medium hover:bg-gray-50 transition-all duration-200 border-2 hover:border-gray-300"
                  disabled={isLoading}
                >
                  <Github className="mr-4 h-6 w-6" />
                  Continue with GitHub
                </Button>
              </CardContent>
            </Card>

          
          </div>

          {/* Footer */}
          <div className="text-center mt-6 md:mt-16">
            <p className="text-sm md:text-lg text-gray-600">
              Made with Love ❤️ by{" "}
              <Link
                href="https://www.linkedin.com/in/harsingh-sekhon/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-orange-500 hover:text-orange-600 font-semibold underline decoration-2 underline-offset-2 transition-colors"
              >
                Harsingh
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

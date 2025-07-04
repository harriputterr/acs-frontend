"use client"

import { useEffect, useState } from "react"

export function useViewport() {
  // Initialize with null to prevent hydration mismatch
  const [isMobile, setIsMobile] = useState<boolean | null>(null)

  useEffect(() => {
    const checkViewport = () => {
      setIsMobile(window.innerWidth < 1024) // lg breakpoint
    }

    // Set initial value
    checkViewport()

    window.addEventListener("resize", checkViewport)
    return () => window.removeEventListener("resize", checkViewport)
  }, [])

  return { isMobile }
}

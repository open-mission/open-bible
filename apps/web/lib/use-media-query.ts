"use client"

import { useState, useEffect } from "react"

export function useIsMobile(): boolean {
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const mq = window.matchMedia("(max-width: 767px)")
    const timer = setTimeout(() => {
      setIsMobile(mq.matches)
    }, 0)
    function handler(e: MediaQueryListEvent) {
      setIsMobile(e.matches)
    }
    mq.addEventListener("change", handler)
    return () => {
      mq.removeEventListener("change", handler)
      clearTimeout(timer)
    }
  }, [])

  return isMobile
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { desktopRuntime } from "@/lib/desktop-runtime"

/**
 * Listens for native desktop menu events and routes to Configurações.
 */
export function TauriMenuListener() {
  const router = useRouter()

  useEffect(() => {
    return desktopRuntime.onOpenSettings(() => router.push("/config"))
  }, [router])

  return null
}

"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"

/**
 * Listens for native Tauri menu events, such as clicking "Configurações" (Settings),
 * and routes the user to the config page.
 */
export function TauriMenuListener() {
  const router = useRouter()

  useEffect(() => {
    let unlisten: (() => void) | undefined

    async function setupListener() {
      if (typeof window === "undefined" || !("__TAURI_INTERNALS__" in window)) {
        return
      }

      try {
        const { listen } = await import("@tauri-apps/api/event")
        unlisten = await listen("open-settings", () => {
          router.push("/config")
        })
      } catch (err) {
        console.error("Failed to bind open-settings Tauri listener:", err)
      }
    }

    setupListener()

    return () => {
      if (unlisten) {
        unlisten()
      }
    }
  }, [router])

  return null
}

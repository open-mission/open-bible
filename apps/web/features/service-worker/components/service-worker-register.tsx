"use client"

import { useEffect } from "react"
import { isTauri } from "@/lib/is-tauri"

export function ServiceWorkerRegister() {
  useEffect(() => {
    // No service worker inside the Tauri desktop app: next-pwa is disabled for the
    // static export and /sw.js is not generated there, so registering would only 404.
    if (isTauri) return
    if (!("serviceWorker" in navigator)) return

    let refreshing = false
    const handleControllerChange = () => {
      if (refreshing) return
      refreshing = true
      window.location.reload()
    }

    navigator.serviceWorker.addEventListener("controllerchange", handleControllerChange)

    navigator.serviceWorker
      .register("/sw.js", { updateViaCache: "none" })
      .then((registration) => registration.update())
      .catch(() => {
        // SW registration may fail in dev — that's fine
      })

    return () => {
      navigator.serviceWorker.removeEventListener("controllerchange", handleControllerChange)
    }
  }, [])

  return null
}

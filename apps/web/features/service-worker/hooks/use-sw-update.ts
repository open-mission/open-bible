"use client"

import { useState, useEffect, useCallback } from "react"

interface UseServiceWorkerUpdate {
  isUpdateAvailable: boolean
  updateNow: () => void
}

export function useServiceWorkerUpdate(): UseServiceWorkerUpdate {
  const [isUpdateAvailable, setIsUpdateAvailable] = useState(false)
  const [waitingSW, setWaitingSW] = useState<ServiceWorker | null>(null)

  useEffect(() => {
    if (!("serviceWorker" in navigator)) return

    navigator.serviceWorker.ready.then((registration) => {
      if (registration.waiting) {
        setIsUpdateAvailable(true)
        setWaitingSW(registration.waiting)
      }

      registration.addEventListener("updatefound", () => {
        const newSW = registration.installing
        if (!newSW) return

        newSW.addEventListener("statechange", (event) => {
          const target = event.target as ServiceWorker
          if (target.state === "installed") {
            setIsUpdateAvailable(true)
            setWaitingSW(target)
          }
        })
      })
    })
  }, [])

  const updateNow = useCallback(() => {
    if (!waitingSW) return

    waitingSW.postMessage("SKIP_WAITING")

    navigator.serviceWorker.addEventListener("controllerchange", () => {
      window.location.reload()
    })

    setTimeout(() => {
      window.location.reload()
    }, 2000)
  }, [waitingSW])

  return { isUpdateAvailable, updateNow }
}

"use client"

import { useEffect, useRef } from "react"
import {
  useBibleVersion,
  useDownloadProgress,
} from "@/features/bible-reader/context/bible-version-context"
import {
  showDownloadStart,
  showDownloadProgress,
  showDownloadSuccess,
  showDownloadError,
} from "@/features/bible-reader/lib/download-toast"

/**
 * Auto-downloads the ARA Bible on first visit when no version is installed.
 * App-global behavior — runs regardless of Simple/Advanced workspace mode.
 * Extracted from the original `app/page.tsx` so both modes share it.
 */
export function useAutoDownloadAra() {
  const {
    installedVersions,
    installVersion,
    setVersionId,
    isVersionsLoaded,
  } = useBibleVersion()
  const { isInstalling, downloadProgress } = useDownloadProgress()
  const activeToastIdRef = useRef<string | number | null>(null)

  useEffect(() => {
    if (
      isVersionsLoaded &&
      installedVersions !== undefined &&
      installedVersions.length === 0 &&
      !isInstalling &&
      !activeToastIdRef.current
    ) {
      activeToastIdRef.current = showDownloadStart(
        "Bíblia Almeida Revista e Atualizada (ARA)",
      )

      installVersion("ara")
        .then(() => {
          if (activeToastIdRef.current) {
            showDownloadSuccess(activeToastIdRef.current, "Bíblia ARA")
            activeToastIdRef.current = null
          }
          setVersionId("ara")
        })
        .catch((e) => {
          console.error("Auto download failed:", e)
          if (activeToastIdRef.current) {
            showDownloadError(activeToastIdRef.current, "Bíblia ARA")
            activeToastIdRef.current = null
          }
        })
    }
  }, [
    isVersionsLoaded,
    installedVersions,
    isInstalling,
    installVersion,
    setVersionId,
  ])

  useEffect(() => {
    if (activeToastIdRef.current && isInstalling && downloadProgress) {
      showDownloadProgress(
        activeToastIdRef.current,
        downloadProgress.current,
        downloadProgress.total,
      )
    }
  }, [isInstalling, downloadProgress])
}

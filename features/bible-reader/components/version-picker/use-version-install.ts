"use client"

import { useRef, useState } from "react"
import { useBibleVersion, useDownloadProgress } from "@/features/bible-reader/context/bible-version-context"
import {
  showDownloadStart,
  showDownloadSuccess,
  showDownloadError,
} from "@/features/bible-reader/lib/download-toast"

/**
 * Encapsula a instalação de uma versão + o ciclo de vida do toast de progresso.
 * Usa sonner via download-toast helpers para notificações padronizadas.
 */
export function useVersionInstall() {
  const { installVersion } = useBibleVersion()
  const { isInstalling, downloadProgress } = useDownloadProgress()
  const toastIdRef = useRef<string | number | null>(null)
  const [installingName, setInstallingName] = useState("")

  async function install(id: string, name: string) {
    setInstallingName(name)
    toastIdRef.current = showDownloadStart(name)

    try {
      await installVersion(id)
      if (toastIdRef.current) {
        showDownloadSuccess(toastIdRef.current, name)
        toastIdRef.current = null
      }
    } catch {
      if (toastIdRef.current) {
        showDownloadError(toastIdRef.current, name)
        toastIdRef.current = null
      }
    }
  }

  return { install, isInstalling, downloadProgress, installingName }
}

"use client"

import { useRef, useState } from "react"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { useToast } from "@/features/layout/hooks/use-toast"

/**
 * Encapsula a instalação de uma versão + o ciclo de vida do toast de progresso
 * (loading -> success/error -> auto-remove). Substitui o useEffect duplicado
 * que existia tanto no BibleVersionSelector quanto no ReaderVersionBadge.
 */
export function useVersionInstall() {
  const { installVersion, isInstalling, downloadProgress } = useBibleVersion()
  const { addToast, updateToast, removeToast } = useToast()
  const toastIdRef = useRef<string | null>(null)
  const [installingName, setInstallingName] = useState("")

  // Atualiza o progresso do toast enquanto o download corre.
  function syncProgress(progress: { current: number; total: number } | null) {
    if (toastIdRef.current && progress) {
      updateToast(toastIdRef.current, { progress })
    }
  }

  // Dispara a instalação e gerencia o toast (loading -> success/error).
  async function install(id: string, name: string) {
    setInstallingName(name)
    toastIdRef.current = addToast({
      message: `Baixando ${name}...`,
      type: "loading",
      progress: downloadProgress ?? { current: 0, total: 100 },
    })
    try {
      await installVersion(id)
      if (toastIdRef.current) {
        updateToast(toastIdRef.current, {
          message: `${name} disponível offline`,
          type: "success",
          progress: undefined,
        })
        const idToRemove = toastIdRef.current
        setTimeout(() => {
          removeToast(idToRemove)
          if (toastIdRef.current === idToRemove) toastIdRef.current = null
        }, 4000)
      }
    } catch (err) {
      if (toastIdRef.current) {
        updateToast(toastIdRef.current, {
          message: `Falha ao baixar ${name}`,
          type: "error",
          progress: undefined,
        })
        const idToRemove = toastIdRef.current
        setTimeout(() => {
          removeToast(idToRemove)
          if (toastIdRef.current === idToRemove) toastIdRef.current = null
        }, 5000)
      }
      throw err
    }
  }

  return {
    install,
    syncProgress,
    isInstalling,
    downloadProgress,
    installingName,
  }
}

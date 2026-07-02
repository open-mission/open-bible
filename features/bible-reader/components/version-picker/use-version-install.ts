"use client"

import { useRef, useState, useEffect } from "react"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { useToast } from "@/features/layout/hooks/use-toast"

/**
 * Encapsula a instalação de uma versão + o ciclo de vida do toast de progresso
 * (loading -> success/error -> auto-remove). Substitui o useEffect duplicado
 * que existia tanto no BibleVersionSelector quanto no ReaderVersionBadge.
 *
 * O toast de progresso é atualizado via effect observando `downloadProgress`
 * (referência que só muda quando o progresso avança) + `updateToast` (callback
 * estável do ToastProvider). Nunca usar uma função não-memoizada como depósito
 * de effect que chama setState — isso causa loop infinito.
 */
export function useVersionInstall() {
  const { installVersion, isInstalling, downloadProgress } = useBibleVersion()
  const { addToast, updateToast, removeToast } = useToast()
  const toastIdRef = useRef<string | null>(null)
  const [installingName, setInstallingName] = useState("")

  // Atualiza apenas a barra de progresso do toast enquanto o download avança.
  // Só roda quando `downloadProgress` muda de referência (e `updateToast` é estável),
  // portanto não dispara re-render em cascata.
  useEffect(() => {
    if (toastIdRef.current && downloadProgress) {
      updateToast(toastIdRef.current, { progress: downloadProgress })
    }
  }, [downloadProgress, updateToast])

  // Dispara a instalação e gerencia o toast (loading -> success/error).
  // O sucesso é decidido pela resolução da promise — não pelo progresso atingir
  // 100%, que é frágil (downloads de tamanho desconhecido nunca batem o total).
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
    } catch {
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
    }
  }

  return { install, isInstalling, downloadProgress, installingName }
}

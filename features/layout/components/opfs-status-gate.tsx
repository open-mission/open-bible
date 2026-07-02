"use client"

import { useEffect } from "react"
import { isOpfsAvailable } from "@/lib/opfs-available"
import { useToast } from "@/features/layout/hooks/use-toast"

/**
 * Surfaces a friendly, persistent error toast when the underlying webview does not
 * support OPFS — required by the SQLite WASM offline layer. Without this the app
 * would silently fail to read Bibles offline (notably on older WebKitGTK on Linux).
 * No-op when OPFS is available. Rendered inside ToastProvider so it can use toasts.
 */
export function OpfsStatusGate() {
  const { addToast } = useToast()

  useEffect(() => {
    if (!isOpfsAvailable()) {
      addToast({
        type: "error",
        message:
          "Este ambiente não suporta armazenamento offline (OPFS). A leitura offline das Bíblias não estará disponível. Atualize o WebView do sistema e reinicie o aplicativo.",
      })
    }
  }, [addToast])

  return null
}

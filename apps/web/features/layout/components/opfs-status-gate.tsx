"use client"

import { useEffect } from "react"
import { isOpfsAvailable } from "@/lib/opfs-available"
import { toast } from "sonner"

/**
 * Surfaces a friendly, persistent error toast when the underlying webview does not
 * support OPFS — required by the SQLite WASM offline layer. Without this the app
 * would silently fail to read Bibles offline (notably on older WebKitGTK on Linux).
 * No-op when OPFS is available. Rendered inside Toaster so it can use sonner.
 */
export function OpfsStatusGate() {
  useEffect(() => {
    if (!isOpfsAvailable()) {
      toast.error(
        "Este ambiente não suporta armazenamento offline (OPFS). A leitura offline das Bíblias não estará disponível. Atualize o WebView do sistema e reinicie o aplicativo.",
        { duration: Infinity }
      )
    }
  }, [])

  return null
}

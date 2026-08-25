"use client"

import { useEffect } from "react"

export default function ErrorBoundary({
  error,
}: {
  error: Error & { digest?: string }
}) {
  useEffect(() => {
    console.error("Erro na aplicação:", error)
  }, [error])

  async function recover() {
    try {
      if ("serviceWorker" in navigator) {
        await Promise.all(
          (await navigator.serviceWorker.getRegistrations()).map((registration) =>
            registration.unregister(),
          ),
        )
      }
      if ("caches" in window) {
        await Promise.all((await caches.keys()).map((key) => caches.delete(key)))
      }
      localStorage.removeItem("openbible:active-view")
    } finally {
      window.location.replace(`/?recovery=${Date.now()}`)
    }
  }

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center gap-4 bg-background p-6 text-center">
      <h1 className="text-2xl font-semibold text-foreground">Algo deu errado</h1>
      <p className="max-w-md text-sm text-muted-foreground">
        Ocorreu um erro inesperado ao carregar o Open Bible. Tente recarregar a
        página. Se o problema persistir, reinicie o aplicativo.
      </p>
      <button
        onClick={recover}
        className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
      >
        Tentar novamente
      </button>
    </div>
  )
}

"use client"

import { useEffect } from "react"
import * as Sentry from "@sentry/nextjs"

// global-error replaces the root layout, so it must render its own <html>/<body>.
// Inline styles keep it readable even if the Tailwind globals.css (imported by the
// normal layout) are not loaded in this fallback shell.
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error)
    console.error("Erro global:", error)
  }, [error])

  return (
    <html lang="pt-BR">
      <body
        style={{
          margin: 0,
          background: "#f5f4f0",
          color: "#1a1714",
          fontFamily: "system-ui, -apple-system, sans-serif",
        }}
      >
        <div
          style={{
            minHeight: "100dvh",
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            gap: 16,
            padding: 24,
            textAlign: "center",
          }}
        >
          <h1 style={{ fontSize: 24, margin: 0 }}>Algo deu errado</h1>
          <p style={{ maxWidth: 460, fontSize: 14, opacity: 0.8, margin: 0 }}>
            Ocorreu um erro crítico ao iniciar o Open Bible. Tente recarregar a
            página. Se o problema persistir, reinicie o aplicativo.
          </p>
          <button
            onClick={reset}
            style={{
              marginTop: 8,
              padding: "8px 16px",
              fontSize: 14,
              fontWeight: 600,
              border: "none",
              borderRadius: 8,
              background: "#b89a6a",
              color: "#1a1714",
              cursor: "pointer",
            }}
          >
            Tentar novamente
          </button>
        </div>
      </body>
    </html>
  )
}

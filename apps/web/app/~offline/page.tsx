"use client"

import { WifiOff } from "lucide-react"
import { useRouter } from "next/navigation"

export default function OfflinePage() {
  const router = useRouter()

  return (
    <div className="flex min-h-dvh flex-col items-center justify-center bg-background px-4 text-center text-foreground">
      <div className="flex flex-col items-center max-w-md p-6 bg-card border border-border/60 rounded-2xl shadow-lg space-y-6">
        <div className="p-4 bg-primary/10 rounded-full text-primary">
          <WifiOff className="h-12 w-12" />
        </div>
        
        <div className="space-y-2">
          <h1 className="font-sans text-2xl font-bold tracking-tight">Sem conexão com a internet</h1>
          <p className="text-sm text-muted-foreground">
            Você está offline. O aplicativo carregará os textos bíblicos e notas armazenados localmente no seu dispositivo.
          </p>
        </div>

        <button
          onClick={() => router.refresh()}
          className="w-full flex items-center justify-center gap-2 rounded-lg bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground hover:bg-primary/90 transition-colors shadow-sm"
        >
          Tentar novamente
        </button>
      </div>
    </div>
  )
}

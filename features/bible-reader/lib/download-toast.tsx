"use client"

import { toast } from "sonner"

interface DownloadToastProps {
  name: string
  progress?: { current: number; total: number }
  status?: "loading" | "success" | "error"
}

function DownloadToast({ name, progress, status = "loading" }: DownloadToastProps) {
  const pct = progress ? Math.round((progress.current / progress.total) * 100) : 0

  if (status === "success") {
    return (
      <div className="flex items-center justify-between gap-4 bg-background rounded-xl px-4 py-3 shadow-lg border border-border">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold text-foreground truncate">{name}</p>
          <p className="text-xs text-muted-foreground">disponível offline</p>
        </div>
      </div>
    )
  }

  if (status === "error") {
    return (
      <div className="flex items-center justify-between gap-4 bg-background rounded-xl px-4 py-3 shadow-lg border border-border">
        <div className="flex flex-col gap-0.5 min-w-0">
          <p className="text-sm font-semibold text-destructive">Falha ao baixar</p>
          <p className="text-xs text-muted-foreground truncate">{name}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-between gap-4 bg-background rounded-xl px-4 py-3 shadow-lg border border-border">
      <div className="flex flex-col gap-1 min-w-0 flex-1">
        <p className="text-sm font-semibold text-foreground truncate">Baixando {name}</p>
        <div className="flex items-center gap-2">
          <div className="relative h-1.5 flex-1 rounded-full bg-muted overflow-hidden">
            <div
              className="absolute inset-y-0 left-0 rounded-full bg-primary transition-all duration-300"
              style={{ width: `${pct}%` }}
            />
          </div>
          <span className="text-[11px] text-muted-foreground tabular-nums shrink-0">{pct}%</span>
        </div>
      </div>
    </div>
  )
}

export function showDownloadStart(name: string): string | number {
  return toast.custom(
    () => <DownloadToast name={name} progress={{ current: 0, total: 100 }} />,
    { id: `download-${name}`, duration: Infinity }
  )
}

export function showDownloadProgress(
  id: string | number,
  name: string,
  progress: { current: number; total: number }
) {
  toast.custom(
    () => <DownloadToast name={name} progress={progress} />,
    { id, duration: Infinity }
  )
}

export function showDownloadSuccess(id: string | number, name: string) {
  toast.custom(
    () => <DownloadToast name={name} status="success" />,
    { id, duration: 4000 }
  )
}

export function showDownloadError(id: string | number, name: string) {
  toast.custom(
    () => <DownloadToast name={name} status="error" />,
    { id, duration: 5000 }
  )
}

"use client"

import { toast } from "sonner"
import { IconLoader } from "@tabler/icons-react"

interface DownloadToastProps {
  name: string
  progress?: { current: number; total: number }
  status?: "loading" | "success" | "error"
}

function DownloadToast({ name, progress, status = "loading" }: DownloadToastProps) {
  const pct = progress ? Math.round((progress.current / progress.total) * 100) : 0

  return (
    <div className="flex items-start gap-3 bg-popover text-popover-foreground">
      {status === "loading" && (
        <IconLoader className="size-4 shrink-0 mt-0.5 animate-spin" />
      )}
      <div className="flex-1 min-w-0">
        {status === "loading" && (
          <p className="text-sm font-medium">Baixando {name}...</p>
        )}
        {status === "success" && (
          <p className="text-sm font-medium">{name} disponível offline</p>
        )}
        {status === "error" && (
          <p className="text-sm font-medium">Falha ao baixar {name}</p>
        )}
        {status === "loading" && progress && (
          <div className="mt-2">
            <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full rounded-full bg-primary transition-all duration-300"
                style={{ width: `${pct}%` }}
              />
            </div>
            <p className="text-[10px] text-muted-foreground mt-1 text-right">
              {pct}%
            </p>
          </div>
        )}
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

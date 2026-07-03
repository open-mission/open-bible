"use client"

import { createContext, useContext, useState, useCallback, useEffect, useMemo, type ReactNode } from "react"
import { createPortal } from "react-dom"
import { X } from "lucide-react"

interface Toast {
  id: string
  message: string
  type: "success" | "error" | "loading"
  progress?: { current: number; total: number }
}

interface ToastActionContextValue {
  addToast: (toast: Omit<Toast, "id">) => string
  removeToast: (id: string) => void
  updateToast: (id: string, updates: Partial<Toast>) => void
}

interface ToastStateContextValue {
  toasts: Toast[]
}

const ToastActionContext = createContext<ToastActionContextValue | null>(null)
const ToastStateContext = createContext<ToastStateContextValue | null>(null)

let toastCounter = 0

function ToastPortal({ toasts, onRemove }: { toasts: Toast[]; onRemove: (id: string) => void }) {
  const [mounted, setMounted] = useState(false)
  useEffect(() => setMounted(true), [])

  if (!mounted || toasts.length === 0) return null

  return createPortal(
    <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {toasts.map((toast) => (
        <div
          key={toast.id}
          className={`pointer-events-auto rounded-lg border px-4 py-3 shadow-lg animate-in slide-in-from-right-2 ${
            toast.type === "success"
              ? "bg-emerald-50 dark:bg-emerald-950 border-emerald-200 dark:border-emerald-800"
              : toast.type === "error"
                ? "bg-red-50 dark:bg-red-950 border-red-200 dark:border-red-800"
                : "bg-card border-border"
          }`}
        >
          <div className="flex items-start gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm text-foreground">{toast.message}</p>
              {toast.progress && (
                <div className="mt-2">
                  <div className="flex items-center justify-between text-[10px] text-muted-foreground mb-1">
                    <span>
                      {toast.progress.current}/{toast.progress.total} livros
                    </span>
                    <span>
                      {Math.round(
                        (toast.progress.current / toast.progress.total) * 100
                      )}
                      %
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
                    <div
                      className="h-full rounded-full bg-primary transition-all duration-300"
                      style={{
                        width: `${(toast.progress.current / toast.progress.total) * 100}%`,
                      }}
                    />
                  </div>
                </div>
              )}
            </div>
            <button
              onClick={() => onRemove(toast.id)}
              className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          </div>
        </div>
      ))}
    </div>,
    document.body
  )
}

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<Toast[]>([])

  const addToast = useCallback((toast: Omit<Toast, "id">) => {
    const id = `toast-${++toastCounter}`
    setToasts((prev) => [...prev, { ...toast, id }])
    return id
  }, [])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  const updateToast = useCallback((id: string, updates: Partial<Toast>) => {
    setToasts((prev) => prev.map((t) => (t.id === id ? { ...t, ...updates } : t)))
  }, [])

  const actionValue = useMemo<ToastActionContextValue>(
    () => ({ addToast, removeToast, updateToast }),
    [addToast, removeToast, updateToast]
  )

  const stateValue = useMemo<ToastStateContextValue>(
    () => ({ toasts }),
    [toasts]
  )

  return (
    <ToastActionContext.Provider value={actionValue}>
      <ToastStateContext.Provider value={stateValue}>
        {children}
        <ToastPortal toasts={toasts} onRemove={removeToast} />
      </ToastStateContext.Provider>
    </ToastActionContext.Provider>
  )
}

export function useToastAction() {
  const ctx = useContext(ToastActionContext)
  if (!ctx) throw new Error("useToastAction must be used within ToastProvider")
  return ctx
}

export function useToastState() {
  const ctx = useContext(ToastStateContext)
  if (!ctx) throw new Error("useToastState must be used within ToastProvider")
  return ctx
}

export function useToast(): ToastActionContextValue & ToastStateContextValue {
  return { ...useToastAction(), ...useToastState() }
}

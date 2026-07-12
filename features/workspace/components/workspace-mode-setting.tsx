"use client"

import { LayoutGrid, Rows3 } from "lucide-react"
import { useWorkspaceMode, type WorkspaceMode } from "../hooks/use-workspace-mode"
import { cn } from "@/lib/utils"

/**
 * Settings card that lets the user switch between "simple" (single reader,
 * the classic experience) and "advanced" (workspace with tabs/grid) reading
 * modes. The choice is persisted via useWorkspaceMode and takes effect on the
 * next home page load.
 */
export function WorkspaceModeSetting() {
  const { mode, setMode } = useWorkspaceMode()

  const options: {
    value: WorkspaceMode
    label: string
    description: string
    icon: React.ReactNode
  }[] = [
    {
      value: "simple",
      label: "Simples",
      description: "Uma única passagem aberta por vez — a experiência clássica.",
      icon: <Rows3 className="h-5 w-5" />,
    },
    {
      value: "advanced",
      label: "Avançado",
      description: "Workspace com abas — abra várias passagens e traduções ao mesmo tempo.",
      icon: <LayoutGrid className="h-5 w-5" />,
    },
  ]

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-lg font-serif font-medium text-foreground mb-1">
          Modo de Leitura
        </h2>
        <p className="text-sm text-muted-foreground">
          Escolha como as passagens bíblicas são exibidas. O modo avançado ativa o
          workspace com abas para abrir vários textos simultaneamente.
        </p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {options.map((opt) => {
          const active = mode === opt.value
          return (
            <button
              key={opt.value}
              onClick={() => setMode(opt.value)}
              aria-pressed={active}
              className={cn(
                "flex flex-col items-start gap-2 rounded-xl border-2 p-4 text-left transition-colors",
                active
                  ? "border-primary bg-primary/5 text-primary"
                  : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card",
              )}
            >
              <div className="flex items-center gap-2">
                {opt.icon}
                <span className={cn("text-sm font-semibold", active && "text-primary")}>
                  {opt.label}
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                {opt.description}
              </p>
            </button>
          )
        })}
      </div>
    </div>
  )
}

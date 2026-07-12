"use client"

import { LayoutGrid, Rows3, Columns2, Rows2, SquareStack } from "lucide-react"
import { useWorkspaceMode, type WorkspaceMode, type WorkspaceLayout } from "../hooks/use-workspace-mode"
import { cn } from "@/lib/utils"

/**
 * Settings card that lets the user switch between "simple" (single reader,
 * the classic experience) and "advanced" (workspace with tabs/grid) reading
 * modes. When "advanced" is selected, a second control lets the user pick the
 * default workspace layout: browser-style tabs, side-by-side columns, or
 * stacked rows. Choices are persisted via useWorkspaceMode and take effect on
 * the next home page load.
 */
export function WorkspaceModeSetting() {
  const { mode, setMode, layout, setLayout } = useWorkspaceMode()

  const modeOptions: {
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
      description: "Workspace com abas e grade tiling — abra várias passagens e traduções ao mesmo tempo, lado a lado.",
      icon: <LayoutGrid className="h-5 w-5" />,
    },
  ]

  const layoutOptions: {
    value: WorkspaceLayout
    label: string
    description: string
    icon: React.ReactNode
  }[] = [
    {
      value: "tabs",
      label: "Abas",
      description: "Abas estilo navegador — uma aba por vez.",
      icon: <SquareStack className="h-5 w-5" />,
    },
    {
      value: "columns",
      label: "Colunas",
      description: "Painéis lado a lado (horizontal).",
      icon: <Columns2 className="h-5 w-5" />,
    },
    {
      value: "rows",
      label: "Linhas",
      description: "Painéis empilhados (vertical).",
      icon: <Rows2 className="h-5 w-5" />,
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
        {modeOptions.map((opt) => {
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

      {mode === "advanced" && (
        <div className="space-y-3 rounded-xl border border-border bg-card/50 p-4 animate-in fade-in-50 duration-200">
          <div>
            <h3 className="text-sm font-semibold text-foreground">
              Layout padrão do workspace
            </h3>
            <p className="text-xs text-muted-foreground">
              Escolha como os painéis são organizados ao entrar no modo avançado.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
            {layoutOptions.map((opt) => {
              const active = layout === opt.value
              return (
                <button
                  key={opt.value}
                  onClick={() => setLayout(opt.value)}
                  aria-pressed={active}
                  className={cn(
                    "flex flex-col items-start gap-2 rounded-lg border-2 p-3 text-left transition-colors",
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-background",
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
      )}
    </div>
  )
}

"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Monitor, Moon, Sun, Check } from "lucide-react"
import { useAppTheme } from "@/components/theme-provider"
import { useBibleVersion } from "@/lib/bible-version-context"
import { COLOR_LABELS, COLOR_SWATCHES, type ThemeColor, type ThemeMode } from "@/lib/theme"

const COLORS = Object.keys(COLOR_LABELS) as ThemeColor[]

const MODES: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Claro",   icon: <Sun className="h-4 w-4" /> },
  { value: "system", label: "Sistema", icon: <Monitor className="h-4 w-4" /> },
  { value: "dark",  label: "Escuro",  icon: <Moon className="h-4 w-4" /> },
]

export default function ConfigPage() {
  const router = useRouter()
  const { mode, color, setTheme, setColor } = useAppTheme()
  const { defaultVersionId, setDefaultVersionId, availableVersions, installedVersions } = useBibleVersion()
  const [versions, setVersions] = useState<{ id: string; name: string }[]>([])

  useEffect(() => {
    const installed = installedVersions.map((v) => ({ id: v.id, name: v.name }))
    const available = availableVersions
      .filter((av) => !installedVersions.find((iv) => iv.id === av.id))
      .map((v) => ({ id: v.id, name: v.name }))
    setVersions([...installed, ...available])
  }, [availableVersions, installedVersions])

  return (
    <div className="min-h-dvh bg-background text-foreground">
      {/* Header */}
      <header className="sticky top-0 z-10 flex items-center gap-3 border-b border-border bg-background/95 backdrop-blur px-4 py-3">
        <button
          onClick={() => router.back()}
          aria-label="Voltar"
          className="flex items-center justify-center w-8 h-8 rounded-md text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
        >
          <ArrowLeft className="h-4 w-4" />
        </button>
        <h1 className="font-serif text-base font-medium">Preferências</h1>
      </header>

      <div className="mx-auto max-w-md px-4 py-8 space-y-10">

        {/* ── Default Bible version ──────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Versão padrão
          </h2>
          <p className="text-sm text-muted-foreground mb-3">
            Selecione a versão bíblica usada por padrão ao abrir o aplicativo.
          </p>
          <div className="space-y-1">
            {versions.map((v) => {
              const active = defaultVersionId === v.id
              const isInstalled = !!installedVersions.find((iv) => iv.id === v.id)
              return (
                <button
                  key={v.id}
                  onClick={() => setDefaultVersionId(v.id)}
                  className={`w-full flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span className="flex-1 text-left">{v.name}</span>
                  {isInstalled && (
                    <span className="text-[10px] text-muted-foreground/60">offline</span>
                  )}
                  {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              )
            })}
            {versions.length === 0 && (
              <p className="text-sm text-muted-foreground/50 text-center py-4">
                Carregando versões...
              </p>
            )}
          </div>
        </section>

        {/* ── Appearance ─────────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Aparência
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {MODES.map((m) => {
              const active = mode === m.value
              return (
                <button
                  key={m.value}
                  onClick={() => setTheme(m.value)}
                  aria-pressed={active}
                  className={`flex flex-col items-center gap-2 rounded-lg border-2 px-3 py-4 text-sm font-medium transition-colors ${
                    active
                      ? "border-primary bg-primary/5 text-primary"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {m.icon}
                  {m.label}
                </button>
              )
            })}
          </div>
        </section>

        {/* ── Accent color ───────────────────────────────────────────────── */}
        <section>
          <h2 className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-4">
            Cor de destaque
          </h2>
          <div className="grid grid-cols-3 gap-2">
            {COLORS.map((c) => {
              const active = color === c
              return (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  aria-pressed={active}
                  className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  {/* Color swatch */}
                  <span
                    className="h-4 w-4 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: COLOR_SWATCHES[c] }}
                    aria-hidden="true"
                  />
                  <span className="flex-1 text-left">{COLOR_LABELS[c]}</span>
                  {active && <Check className="h-3.5 w-3.5 text-primary shrink-0" />}
                </button>
              )
            })}
          </div>

          {/* Live preview chip */}
          <div className="mt-5 flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-3">
            <span
              className="h-5 w-5 rounded-full shrink-0 shadow-sm"
              style={{ backgroundColor: COLOR_SWATCHES[color] }}
            />
            <p className="text-sm text-muted-foreground">
              Cor ativa:{" "}
              <span className="font-medium text-primary">{COLOR_LABELS[color]}</span>
            </p>
          </div>
        </section>

      </div>
    </div>
  )
}

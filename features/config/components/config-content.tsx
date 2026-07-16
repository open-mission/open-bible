"use client"

import { useEffect, useState } from "react"
import { Monitor, Moon, Sun, Check, BookOpen, Palette, LayoutGrid, Keyboard, RefreshCw } from "lucide-react"
import { useAppTheme } from "@/features/theme/components/theme-provider"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { COLOR_LABELS, COLOR_SWATCHES, type ThemeColor, type ThemeMode } from "@/features/theme/utils/theme"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { WorkspaceModeSetting } from "@/features/workspace/components/workspace-mode-setting"
import { isTauri } from "@/lib/is-tauri"

const COLORS = Object.keys(COLOR_LABELS) as ThemeColor[]

const MODES: { value: ThemeMode; label: string; icon: React.ReactNode }[] = [
  { value: "light", label: "Claro", icon: <Sun className="h-4 w-4" /> },
  { value: "system", label: "Sistema", icon: <Monitor className="h-4 w-4" /> },
  { value: "dark", label: "Escuro", icon: <Moon className="h-4 w-4" /> },
]

/**
 * The settings body (Versão Bíblica / Tema / Leitura tabs). Extracted so it can
 * be rendered inside a Dialog (desktop) or Drawer (mobile) as well as the
 * standalone /config page.
 */
export function ConfigContent() {
  const { mode, color, palette, setTheme, setColor, setPalette } = useAppTheme()
  const { defaultVersionId, setDefaultVersionId, availableVersions, installedVersions } = useBibleVersion()
  const [versions, setVersions] = useState<{ id: string; name: string }[]>([])
  const [isDesktop, setIsDesktop] = useState(false)
  const [isMac] = useState(() => {
    if (typeof window === "undefined") return false
    return /Mac|iPod|iPhone|iPad/.test(navigator.platform) || (navigator.userAgent.includes("Mac") && "ontouchend" in document)
  })

  // States for Tauri auto-updater
  const [appVersion, setAppVersion] = useState<string>("")
  const [updateStatus, setUpdateStatus] = useState<
    "idle" | "checking" | "available" | "no-update" | "downloading" | "downloaded" | "error"
  >("idle")
  const [updateInfo, setUpdateInfo] = useState<{
    version: string
    date?: string
    body?: string
  } | null>(null)
  const [downloadProgress, setDownloadProgress] = useState<number>(0)
  const [errorMessage, setErrorMessage] = useState<string>("")
  const [updateObject, setUpdateObject] = useState<any>(null)

  // Fetch app version on mount inside Tauri
  useEffect(() => {
    if (!isTauri) return

    async function fetchVersion() {
      try {
        const { getVersion } = await import("@tauri-apps/api/app")
        const version = await getVersion()
        setAppVersion(version)
      } catch (err) {
        console.error("Erro ao obter versão do app:", err)
      }
    }
    fetchVersion()
  }, [])

  const handleCheckUpdate = async () => {
    if (!isTauri) return
    setUpdateStatus("checking")
    setErrorMessage("")
    try {
      const { check } = await import("@tauri-apps/plugin-updater")
      const update = await check()
      if (update) {
        setUpdateInfo({
          version: update.version,
          date: update.date,
          body: update.body,
        })
        setUpdateObject(update)
        setUpdateStatus("available")
      } else {
        setUpdateStatus("no-update")
      }
    } catch (err: any) {
      console.error("Erro ao verificar atualizações:", err)
      setUpdateStatus("error")
      setErrorMessage(err?.toString() || "Erro desconhecido ao verificar atualizações")
    }
  }

  const handleDownloadInstall = async () => {
    if (!updateObject) return
    setUpdateStatus("downloading")
    setDownloadProgress(0)
    try {
      await updateObject.downloadAndInstall((event: any) => {
        if (event?.event === "Started") {
          setDownloadProgress(0)
        } else if (event?.event === "Progress") {
          if (event.data?.contentLength) {
            const pct = Math.round((event.data.progress / event.data.contentLength) * 100)
            setDownloadProgress(pct)
          }
        } else if (event?.event === "Finished") {
          setDownloadProgress(100)
        }
      })
      setUpdateStatus("downloaded")
    } catch (err: any) {
      console.error("Erro ao baixar e instalar atualização:", err)
      setUpdateStatus("error")
      setErrorMessage(err?.toString() || "Erro ao baixar e instalar atualização")
    }
  }

  const handleRelaunch = async () => {
    try {
      const { relaunch } = await import("@tauri-apps/plugin-process")
      await relaunch()
    } catch (err) {
      console.error("Erro ao reiniciar o aplicativo:", err)
    }
  }

  useEffect(() => {
    const installed = installedVersions.map((v) => ({ id: v.id, name: v.name }))
    const available = availableVersions
      .filter((av) => !installedVersions.find((iv) => iv.id === av.id))
      .map((v) => ({ id: v.id, name: v.name }))
    const timer = setTimeout(() => {
      setVersions([...installed, ...available])
    }, 0)
    return () => clearTimeout(timer)
  }, [availableVersions, installedVersions])

  useEffect(() => {
    const media = window.matchMedia("(min-width: 768px)")
    const timer = setTimeout(() => {
      setIsDesktop(media.matches)
    }, 0)
    const listener = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    media.addEventListener("change", listener)
    return () => {
      media.removeEventListener("change", listener)
      clearTimeout(timer)
    }
  }, [])

  return (
    <Tabs
      defaultValue="version"
      orientation={isDesktop ? "vertical" : "horizontal"}
      className="w-full gap-6 md:gap-8 flex flex-col md:flex-row"
    >
      <TabsList className="w-full md:w-56 shrink-0 flex flex-row md:flex-col justify-start items-stretch bg-muted/50 p-1 md:p-2 rounded-xl h-auto">
        <TabsTrigger
          value="version"
          className="flex-1 md:flex-initial flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm justify-center md:justify-start"
        >
          <BookOpen className="h-4 w-4" />
          <span>Versão Bíblica</span>
        </TabsTrigger>
        <TabsTrigger
          value="theme"
          className="flex-1 md:flex-initial flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm justify-center md:justify-start"
        >
          <Palette className="h-4 w-4" />
          <span>Tema</span>
        </TabsTrigger>
        <TabsTrigger
          value="workspace"
          className="flex-1 md:flex-initial flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm justify-center md:justify-start"
        >
          <LayoutGrid className="h-4 w-4" />
          <span>Leitura</span>
        </TabsTrigger>
        <TabsTrigger
          value="shortcuts"
          className="flex-1 md:flex-initial flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm justify-center md:justify-start"
        >
          <Keyboard className="h-4 w-4" />
          <span>Atalhos</span>
        </TabsTrigger>
        {isTauri && (
          <TabsTrigger
            value="updates"
            className="flex-1 md:flex-initial flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-sm justify-center md:justify-start"
          >
            <RefreshCw className="h-4 w-4" />
            <span>Atualizações</span>
          </TabsTrigger>
        )}
      </TabsList>

      <div className="flex-1 min-w-0 bg-card border border-border/60 rounded-xl p-6 shadow-sm">
        {/* ── Default Bible version ──────────────────────────────────────── */}
        <TabsContent value="version" className="space-y-4">
          <div>
            <h2 className="text-lg font-serif font-medium text-foreground mb-1">
              Versão padrão
            </h2>
            <p className="text-sm text-muted-foreground">
              Selecione a versão bíblica usada por padrão ao abrir o aplicativo.
            </p>
          </div>
          <div className="space-y-2 max-h-[50vh] overflow-y-auto pr-1">
            {versions.map((v) => {
              const active = defaultVersionId === v.id
              const isInstalled = !!installedVersions.find((iv) => iv.id === v.id)
              return (
                <button
                  key={v.id}
                  onClick={() => setDefaultVersionId(v.id)}
                  className={`w-full flex items-center gap-3 rounded-lg border px-4 py-3 text-sm transition-colors ${
                    active
                      ? "border-primary bg-primary/5 text-foreground font-medium"
                      : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                  }`}
                >
                  <span className="flex-1 text-left">{v.name}</span>
                  {isInstalled && (
                    <span className="text-[10px] text-muted-foreground/60 px-1.5 py-0.5 bg-secondary rounded">offline</span>
                  )}
                  {active && <Check className="h-4 w-4 text-primary shrink-0" />}
                </button>
              )
            })}
            {versions.length === 0 && (
              <p className="text-sm text-muted-foreground/50 text-center py-4">
                Carregando versões...
              </p>
            )}
          </div>
        </TabsContent>

        {/* ── Theme (Appearance + Accent Color) ──────────────────────────── */}
        <TabsContent value="theme" className="space-y-8 animate-in fade-in-50 duration-200">
          {/* Estilo do Tema */}
          <div className="space-y-4">
            <div>
              <h2 className="text-lg font-serif font-medium text-foreground mb-1">
                Estilo do Tema
              </h2>
              <p className="text-sm text-muted-foreground">
                Escolha a paleta de cores base para o leitor.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "default" as const, label: "Padrão" },
                { value: "dracula" as const, label: "Dracula" },
                { value: "gruvbox" as const, label: "Gruvbox" },
              ].map((p) => {
                const active = palette === p.value
                return (
                  <button
                    key={p.value}
                    onClick={() => setPalette(p.value)}
                    aria-pressed={active}
                    className={`flex flex-col items-center justify-center gap-1 rounded-lg border-2 px-3 py-4 text-sm font-medium transition-colors h-14 cursor-pointer ${
                      active
                        ? "border-primary bg-primary/5 text-primary font-semibold"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card"
                    }`}
                  >
                    {p.label}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Appearance Mode */}
          <div className="space-y-4 pt-4 border-t border-border/50">
            <div>
              <h2 className="text-lg font-serif font-medium text-foreground mb-1">
                Aparência
              </h2>
              <p className="text-sm text-muted-foreground">
                Escolha o tema visual do aplicativo.
              </p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {MODES.map((m) => {
                const active = mode === m.value
                const disabled = palette === "dracula"
                return (
                  <button
                    key={m.value}
                    disabled={disabled}
                    onClick={() => setTheme(m.value)}
                    aria-pressed={active}
                    className={`flex flex-col items-center gap-3 rounded-lg border-2 px-3 py-5 text-sm font-medium transition-colors ${
                      active && !disabled
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground bg-card"
                    } ${disabled ? "opacity-50 cursor-not-allowed" : "cursor-pointer"}`}
                  >
                    <div className="p-2 rounded-full bg-secondary/50">
                      {m.icon}
                    </div>
                    {disabled && m.value === "dark" ? "Escuro (Fixo)" : m.label}
                  </button>
                )
              })}
            </div>
          </div>
          {/* Accent color */}
          {palette === "default" && (
            <div className="space-y-4 pt-4 border-t border-border/50 animate-in fade-in-50 duration-200">
              <div>
                <h2 className="text-lg font-serif font-medium text-foreground mb-1">
                  Cor de destaque
                </h2>
                <p className="text-sm text-muted-foreground">
                  Escolha a cor principal para os botões e destaques do aplicativo.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2.5">
                {COLORS.map((c) => {
                  const active = color === c
                  return (
                    <button
                      key={c}
                      onClick={() => setColor(c)}
                      aria-pressed={active}
                      className={`flex items-center gap-2.5 rounded-lg border px-3 py-2.5 text-sm transition-colors cursor-pointer bg-card ${
                        active
                          ? "border-primary bg-primary/5 text-foreground font-medium"
                          : "border-border text-muted-foreground hover:border-primary/40 hover:text-foreground"
                      }`}
                    >
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
              <div className="flex items-center gap-3 rounded-lg border border-border bg-secondary/40 px-4 py-3">
                <span
                  className="h-5 w-5 rounded-full shrink-0 shadow-sm"
                  style={{ backgroundColor: COLOR_SWATCHES[color] }}
                />
                <p className="text-sm text-muted-foreground">
                  Cor ativa:{" "}
                  <span className="font-medium text-primary">{COLOR_LABELS[color]}</span>
                </p>
              </div>
            </div>
          )}
        </TabsContent>

        {/* ── Reading Mode (Simple / Advanced workspace) ────────────────── */}
        <TabsContent value="workspace" className="space-y-8 animate-in fade-in-50 duration-200">
          <WorkspaceModeSetting />
        </TabsContent>

        {/* ── Keyboard Shortcuts ────────────────── */}
        <TabsContent value="shortcuts" className="space-y-6 animate-in fade-in-50 duration-200">
          <div>
            <h2 className="text-lg font-serif font-medium text-foreground mb-1">
              Atalhos do Teclado
            </h2>
            <p className="text-sm text-muted-foreground">
              Acelere sua navegação pelo workspace usando os comandos rápidos listados abaixo.
            </p>
          </div>

          <div className="divide-y divide-border/40 border-y border-border/40">
            {[
              {
                desc: "Criar Nova Aba (Horizontal / Coluna)",
                keys: isMac ? ["⌘", "T"] : ["Ctrl", "T"],
                altKeys: ["Alt", "T"],
              },
              {
                desc: "Criar Nova Aba (Vertical / Linha)",
                keys: isMac ? ["⌘", "Shift", "T"] : ["Ctrl", "Shift", "T"],
                altKeys: ["Alt", "Shift", "T"],
              },
              {
                desc: "Fechar Aba Ativa",
                keys: isMac ? ["⌘", "W"] : ["Ctrl", "W"],
                altKeys: ["Alt", "W"],
              },
              {
                desc: "Alternar Abas (Seletor de Abas)",
                keys: ["Ctrl", "Tab"],
                altKeys: ["Alt", "E"],
              },
              {
                desc: "Ir para Aba Específica (1 a 9)",
                keys: isMac ? ["⌘", "1..9"] : ["Ctrl", "1..9"],
              },
            ].map((shortcut, idx) => (
              <div key={idx} className="flex flex-col sm:flex-row sm:items-center justify-between py-3.5 gap-2">
                <span className="text-sm font-medium text-foreground/80">{shortcut.desc}</span>
                <div className="flex items-center gap-2">
                  <div className="flex gap-1">
                    {shortcut.keys.map((k, ki) => (
                      <kbd
                        key={ki}
                        className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 font-mono text-[11px] font-semibold text-foreground/90 bg-muted border border-border/80 rounded shadow-xs"
                      >
                        {k}
                      </kbd>
                    ))}
                  </div>
                  {shortcut.altKeys && (
                    <>
                      <span className="text-xs text-muted-foreground/50">ou</span>
                      <div className="flex gap-1">
                        {shortcut.altKeys.map((ak, aki) => (
                          <kbd
                            key={aki}
                            className="inline-flex items-center justify-center min-w-5 h-5 px-1.5 font-mono text-[11px] font-semibold text-muted-foreground/85 bg-muted/45 border border-border/50 rounded shadow-xs"
                          >
                            {ak}
                          </kbd>
                        ))}
                      </div>
                    </>
                  )}
                </div>
              </div>
            ))}
          </div>
        </TabsContent>

        {isTauri && (
          <TabsContent value="updates" className="space-y-6 animate-in fade-in-50 duration-200">
            <div>
              <h2 className="text-lg font-serif font-medium text-foreground mb-1">
                Atualizações do Aplicativo
              </h2>
              <p className="text-sm text-muted-foreground">
                Verifique se há novas versões do Open Bible e mantenha seu app atualizado.
              </p>
            </div>

            <div className="border border-border/80 rounded-lg p-5 bg-card/40 space-y-4">
              <div className="flex justify-between items-center text-sm border-b border-border/40 pb-3">
                <span className="text-muted-foreground font-medium">Versão atual:</span>
                <span className="font-mono bg-muted px-2 py-0.5 rounded text-foreground font-semibold">
                  v{appVersion || "..."}
                </span>
              </div>

              {updateStatus === "idle" && (
                <div className="flex justify-end">
                  <button
                    onClick={handleCheckUpdate}
                    className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors rounded-lg flex items-center gap-2 cursor-pointer shadow-xs"
                  >
                    Verificar Atualizações
                  </button>
                </div>
              )}

              {updateStatus === "checking" && (
                <div className="flex items-center gap-3 py-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-primary" />
                  <span className="text-sm text-muted-foreground">Buscando novas atualizações...</span>
                </div>
              )}

              {updateStatus === "no-update" && (
                <div className="space-y-4">
                  <p className="text-sm text-emerald-500 font-medium flex items-center gap-2">
                    <Check className="h-4 w-4" />
                    Você já está utilizando a versão mais recente!
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={handleCheckUpdate}
                      className="px-4 py-2 text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors rounded-lg cursor-pointer"
                    >
                      Verificar Novamente
                    </button>
                  </div>
                </div>
              )}

              {updateStatus === "available" && updateInfo && (
                <div className="space-y-4">
                  <div className="bg-primary/5 border border-primary/20 rounded-lg p-4 space-y-2">
                    <h3 className="text-sm font-semibold text-foreground">
                      Nova versão disponível: <span className="font-mono text-primary">v{updateInfo.version}</span>
                    </h3>
                    {updateInfo.date && (
                      <p className="text-xs text-muted-foreground">
                        Lançada em: {updateInfo.date}
                      </p>
                    )}
                    {updateInfo.body && (
                      <div className="text-xs text-muted-foreground border-t border-border/40 pt-2 mt-2 max-h-32 overflow-y-auto whitespace-pre-wrap font-sans">
                        {updateInfo.body}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end">
                    <button
                      onClick={handleDownloadInstall}
                      className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors rounded-lg cursor-pointer shadow-xs"
                    >
                      Baixar e Instalar
                    </button>
                  </div>
                </div>
              )}

              {updateStatus === "downloading" && (
                <div className="space-y-3 py-2">
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-muted-foreground">Baixando atualização...</span>
                    <span className="font-semibold text-primary">{downloadProgress}%</span>
                  </div>
                  <div className="w-full bg-secondary h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-primary h-full transition-all duration-300 rounded-full"
                      style={{ width: `${downloadProgress}%` }}
                    />
                  </div>
                </div>
              )}

              {updateStatus === "downloaded" && (
                <div className="space-y-4">
                  <p className="text-sm text-emerald-500 font-medium">
                    Atualização baixada com sucesso! O aplicativo precisa ser reiniciado para aplicar as mudanças.
                  </p>
                  <div className="flex justify-end">
                    <button
                      onClick={handleRelaunch}
                      className="px-4 py-2 text-sm font-semibold bg-primary text-primary-foreground hover:bg-primary/95 transition-colors rounded-lg cursor-pointer shadow-xs animate-pulse"
                    >
                      Reiniciar Agora
                    </button>
                  </div>
                </div>
              )}

              {updateStatus === "error" && (
                <div className="space-y-4">
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3">
                    <p className="text-sm font-semibold text-destructive mb-1">
                      Falha ao processar atualização
                    </p>
                    <p className="text-xs text-muted-foreground font-mono truncate">
                      {errorMessage}
                    </p>
                  </div>
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={handleCheckUpdate}
                      className="px-4 py-2 text-sm font-semibold bg-secondary text-secondary-foreground hover:bg-secondary/90 transition-colors rounded-lg cursor-pointer"
                    >
                      Tentar Novamente
                    </button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>
        )}
      </div>
    </Tabs>
  )
}

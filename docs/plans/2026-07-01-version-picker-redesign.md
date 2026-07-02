# Plano: Version Picker Redesign

**Goal:** Substituir o seletor de versão atual (popover/BottomSheet) e o dialog de download separado
por um único dialog rico no estilo do `BookChapterDialog`, com abas "Instaladas"/"Disponíveis",
eliminando a duplicação `BibleVersionSelector` ↔ `ReaderVersionBadge`.

**Architecture:** O trigger (`bible-version-selector.tsx`) mantém a aparência compacta (abreviação na
pill) mas abre um `VersionPickerDialog`. O dialog é componentizado numa pasta `version-picker/` com
sub-componentes para header, abas e linha de versão, mais um hook `useVersionInstall` que de-duplica a
lógica de download+toast. O `ReaderVersionBadge` e o `DownloadVersionsDialog` são removidos.

**Tech Stack:** Next.js, React, Tailwind v4, `@base-ui/react` (Dialog/Tabs), vaul (Drawer/BottomSheet),
lucide-react. Sem testes — verificação por `pnpm lint` + `pnpm build`.

**Spec:** `docs/specs/2026-07-01-version-picker-redesign-design.md`

## Mapa de arquivos

| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `features/bible-reader/components/version-picker/version-meta.ts` | **criar** | Constante `VERSION_SIZES` (movida de `download-versions-dialog.tsx`) + helpers de filtro/formatação. |
| `features/bible-reader/components/version-picker/use-version-install.ts` | **criar** | Hook: `installVersion` + `installingName` + efeito de toast (loading→success/error→auto-remove). |
| `features/bible-reader/components/version-picker/version-row.tsx` | **criar** | Card reutilizável de uma versão (abreviação, nome, metadados, ações). |
| `features/bible-reader/components/version-picker/version-search-header.tsx` | **criar** | Header fixo: InputGroup de busca + botão fechar. |
| `features/bible-reader/components/version-picker/installed-versions-tab.tsx` | **criar** | Conteúdo da aba "Instaladas" (lista filtrada + estado vazio). |
| `features/bible-reader/components/version-picker/available-versions-tab.tsx` | **criar** | Conteúdo da aba "Disponíveis" (lista filtrada + progresso de download). |
| `features/bible-reader/components/version-picker/version-picker-dialog.tsx` | **criar** | Container mobile/desktop + tabs + hospeda `useVersionInstall`. |
| `features/bible-reader/components/bible-version-selector.tsx` | **reescrever** | Trigger (Button c/ abreviação) que abre o dialog. |
| `features/bible-reader/components/reader-header.tsx` | **editar** | Trocar 2× `<ReaderVersionBadge>` → `<BibleVersionSelector>`; atualizar import. |
| `features/bible-reader/components/reader-version-badge.tsx` | **excluir** | Absorvido pelo novo selector. |
| `features/bible-reader/components/download-versions-dialog.tsx` | **excluir** | Absorvido pela aba "Disponíveis". |

---

## Tarefas

### Task 1 — Criar `version-picker/version-meta.ts`

Constantes e helpers compartilhados, movendo `VERSION_SIZES` do `download-versions-dialog.tsx`.

- [ ] Criar `features/bible-reader/components/version-picker/version-meta.ts`:

```ts
import type { VersionMeta, AvailableVersion } from "@/features/bible-reader/context/bible-version-context"

/** Tamanho aproximado (compactado) de cada versão, em MB. */
export const VERSION_SIZES: Record<string, string> = {
  acf: "4.3 MB",
  alm1911: "4.3 MB",
  ara: "4.3 MB",
  arc: "4.3 MB",
  as21: "4.2 MB",
  blivre: "4.3 MB",
  jfaa: "4.3 MB",
  kja: "4.9 MB",
  kjf: "4.5 MB",
  mens: "4.5 MB",
  naa: "4.5 MB",
  nbv: "4.8 MB",
  ntlh: "5.1 MB",
  nvi: "4.3 MB",
  nvt: "4.4 MB",
  ol: "4.5 MB",
  tb: "4.3 MB",
  vfl: "4.6 MB",
}

/** Tamanho formatado de uma versão (fallback "4.5 MB"). */
export function getVersionSize(id: string): string {
  return VERSION_SIZES[id] ?? "4.5 MB"
}

/** Filtra uma lista de versões por nome ou id (case-insensitive). query vazia → retorna tudo. */
export function filterVersions<T extends { id: string; name: string }>(
  versions: T[],
  query: string
): T[] {
  const q = query.trim().toLowerCase()
  if (!q) return versions
  return versions.filter(
    (v) => v.name.toLowerCase().includes(q) || v.id.toLowerCase().includes(q)
  )
}

/** Versões disponíveis que ainda não estão instaladas. */
export function getNotInstalledAvailable(
  available: AvailableVersion[],
  installed: VersionMeta[]
): AvailableVersion[] {
  return available.filter((av) => !installed.some((iv) => iv.id === av.id))
}
```

- [ ] Verificar: `pnpm lint` (sem erro de tipos — `VersionMeta`/`AvailableVersion` são exportados do contexto).
- [ ] Commit: `feat(version-picker): add version metadata helpers and sizes`

---

### Task 2 — Criar `version-picker/use-version-install.ts`

Hook que de-duplica o `useEffect` de toast de download (hoje copiado em `bible-version-selector.tsx`
e `reader-version-badge.tsx`) e adiciona toast de erro.

- [ ] Criar `features/bible-reader/components/version-picker/use-version-install.ts`:

```ts
"use client"

import { useRef } from "react"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { useToast } from "@/features/layout/hooks/use-toast"

/**
 * Encapsula a instalação de uma versão + o ciclo de vida do toast de progresso
 * (loading → success/error → auto-remove em 4s). Substitui o useEffect duplicado
 * que existia tanto no BibleVersionSelector quanto no ReaderVersionBadge.
 */
export function useVersionInstall() {
  const { installVersion, isInstalling, downloadProgress } = useBibleVersion()
  const { addToast, updateToast, removeToast } = useToast()
  const toastIdRef = useRef<string | null>(null)
  const installingNameRef = useRef<string>("")

  // Dispara a instalação e dispara o toast inicial (loading).
  async function install(id: string, name: string) {
    installingNameRef.current = name
    toastIdRef.current = addToast({
      message: `Baixando ${name}...`,
      type: "loading",
      progress: downloadProgress ?? { current: 0, total: 100 },
    })
    try {
      await installVersion(id)
      if (toastIdRef.current) {
        updateToast(toastIdRef.current, {
          message: `${name} disponível offline`,
          type: "success",
          progress: undefined,
        })
        const idToRemove = toastIdRef.current
        setTimeout(() => {
          removeToast(idToRemove)
          if (toastIdRef.current === idToRemove) toastIdRef.current = null
        }, 4000)
      }
    } catch (err) {
      if (toastIdRef.current) {
        updateToast(toastIdRef.current, {
          message: `Falha ao baixar ${name}`,
          type: "error",
          progress: undefined,
        })
        const idToRemove = toastIdRef.current
        setTimeout(() => {
          removeToast(idToRemove)
          if (toastIdRef.current === idToRemove) toastIdRef.current = null
        }, 5000)
      }
      throw err
    }
  }

  // Atualiza o progresso do toast enquanto o download corre.
  // Chamado pelo componente via useEffect quando downloadProgress muda.
  function syncProgress(progress: { current: number; total: number } | null) {
    if (toastIdRef.current && progress) {
      updateToast(toastIdRef.current, { progress })
    }
  }

  return {
    install,
    syncProgress,
    isInstalling,
    downloadProgress,
    installingName: installingNameRef.current,
  }
}
```

- [ ] Verificar: `pnpm lint`.
- [ ] Commit: `feat(version-picker): add useVersionInstall hook for download + toast lifecycle`

---

### Task 3 — Criar `version-picker/version-row.tsx`

Card reutilizável de uma versão — usado por ambas as abas. Layout inspirado no `BookButton` do
`book-chapter-dialog.tsx` (linha horizontal, conteúdo à esquerda, ação à direita).

- [ ] Criar `features/bible-reader/components/version-picker/version-row.tsx`:

```tsx
"use client"

import { cn } from "@/lib/utils"

interface VersionRowProps {
  abbreviation: string
  name: string
  meta?: string
  /** Estado visual da linha. */
  state?: "active" | "default"
  /** Conteúdo da área de ação (botão selecionar/baixar/lixeira). */
  children?: React.ReactNode
  onClick?: () => void
}

export function VersionRow({
  abbreviation,
  name,
  meta,
  state = "default",
  children,
  onClick,
}: VersionRowProps) {
  const isActive = state === "active"
  const clickable = Boolean(onClick)

  const inner = (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
          {abbreviation}
        </span>
        <span className={cn("font-semibold truncate", isActive && "text-primary-foreground")}>
          {name}
        </span>
      </span>
      {meta && (
        <span className={cn("text-[10px] truncate", isActive ? "text-primary-foreground/70" : "text-muted-foreground/60")}>
          {meta}
        </span>
      )}
    </div>
  )

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-2 rounded-lg border transition-all px-4 py-3 text-left",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "border-border hover:bg-accent/60 text-foreground"
      )}
    >
      {clickable ? (
        <button onClick={onClick} className="flex-1 min-w-0 cursor-pointer">
          {inner}
        </button>
      ) : (
        <div className="flex-1 min-w-0">{inner}</div>
      )}
      {children && <div className="shrink-0">{children}</div>}
    </div>
  )
}
```

- [ ] Verificar: `pnpm lint`.
- [ ] Commit: `feat(version-picker): add VersionRow reusable card`

---

### Task 4 — Criar `version-picker/version-search-header.tsx`

Header fixo (altura `h-14`) com InputGroup de busca + botão fechar. Espelha o header do
`book-chapter-dialog.tsx`.

- [ ] Criar `features/bible-reader/components/version-picker/version-search-header.tsx`:

```tsx
"use client"

import { Search, X } from "lucide-react"
import { InputGroup, InputGroupAddon, InputGroupInput } from "@/components/ui/input-group"

interface VersionSearchHeaderProps {
  query: string
  onQueryChange: (q: string) => void
  onClose: () => void
}

export function VersionSearchHeader({ query, onQueryChange, onClose }: VersionSearchHeaderProps) {
  return (
    <header className="flex items-center px-4 h-14 shrink-0 gap-3 z-10">
      <InputGroup className="flex-1 h-10 shadow-none border-border bg-background">
        <InputGroupAddon align="inline-start">
          <Search className="h-4 w-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Pesquisar versão..."
          className="text-base md:text-sm placeholder:text-muted-foreground h-full"
        />
      </InputGroup>
      <button
        onClick={onClose}
        className="p-1.5 hover:bg-accent rounded-md text-muted-foreground transition-colors cursor-pointer shrink-0"
        aria-label="Fechar"
      >
        <X className="h-5 w-5" />
      </button>
    </header>
  )
}
```

- [ ] Verificar: `pnpm lint`.
- [ ] Commit: `feat(version-picker): add VersionSearchHeader`

---

### Task 5 — Criar `version-picker/installed-versions-tab.tsx`

Conteúdo da aba "Instaladas": lista de `VersionRow` filtrada por `query`, selecionar ativa a versão,
lixeira desinstala. Estado vazio tratado.

- [ ] Criar `features/bible-reader/components/version-picker/installed-versions-tab.tsx`:

```tsx
"use client"

import { Check, Trash2 } from "lucide-react"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { filterVersions, getVersionSize } from "./version-meta"
import { VersionRow } from "./version-row"
import { cn } from "@/lib/utils"

interface InstalledVersionsTabProps {
  query: string
  onSelect: (id: string) => void
}

export function InstalledVersionsTab({ query, onSelect }: InstalledVersionsTabProps) {
  const { versionId, installedVersions, uninstallVersion } = useBibleVersion()
  const filtered = filterVersions(installedVersions, query)

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
        <p>
          {query
            ? `Nenhuma versão encontrada para "${query}".`
            : "Nenhuma versão instalada. Baixe uma na aba Disponíveis."}
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
      {filtered.map((v) => {
        const isActive = v.id === versionId
        return (
          <VersionRow
            key={v.id}
            abbreviation={v.id}
            name={v.name}
            meta={`${v.books.length} livros • ${getVersionSize(v.id)} • SQLite`}
            state={isActive ? "active" : "default"}
            onClick={() => onSelect(v.id)}
          >
            {isActive ? (
              <Check className="h-4 w-4 text-primary-foreground" />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  if (confirm(`Remover "${v.name}" do dispositivo?`)) {
                    uninstallVersion(v.id)
                  }
                }}
                className="text-muted-foreground hover:text-destructive transition-colors p-1.5 hover:bg-accent rounded-md cursor-pointer"
                aria-label={`Remover ${v.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </VersionRow>
        )
      })}
    </div>
  )
}
```

- [ ] Verificar: `pnpm lint`.
- [ ] Commit: `feat(version-picker): add InstalledVersionsTab`

---

### Task 6 — Criar `version-picker/available-versions-tab.tsx`

Conteúdo da aba "Disponíveis": lista das versões não-instaladas filtrada por `query`, botão baixar
com progresso no rodapé.

- [ ] Criar `features/bible-reader/components/version-picker/available-versions-tab.tsx`:

```tsx
"use client"

import { useEffect } from "react"
import { Download, Loader2 } from "lucide-react"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { getNotInstalledAvailable, filterVersions, getVersionSize } from "./version-meta"
import { VersionRow } from "./version-row"
import { useVersionInstall } from "./use-version-install"

interface AvailableVersionsTabProps {
  query: string
}

export function AvailableVersionsTab({ query }: AvailableVersionsTabProps) {
  const { availableVersions, installedVersions, isInstalling, downloadProgress } = useBibleVersion()
  const notInstalled = getNotInstalledAvailable(availableVersions, installedVersions)
  const filtered = filterVersions(notInstalled, query)
  const { install, syncProgress, installingName } = useVersionInstall()

  // Sincroniza o progresso do download no toast enquanto ele corre.
  useEffect(() => {
    syncProgress(downloadProgress)
  }, [downloadProgress, syncProgress])

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
        <p>{query ? `Nenhuma versão encontrada para "${query}".` : "Todas as versões já estão instaladas."}</p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        {filtered.map((v) => (
          <VersionRow
            key={v.id}
            abbreviation={v.id}
            name={v.name}
            meta={`${v.totalBooks} livros • ${getVersionSize(v.id)} • SQLite`}
          >
            <button
              onClick={() => install(v.id, v.name)}
              disabled={isInstalling}
              className="rounded-md bg-primary text-primary-foreground text-xs px-3 py-1.5 font-medium hover:opacity-90 disabled:opacity-50 flex items-center gap-1.5 transition-opacity cursor-pointer"
              aria-label={`Baixar ${v.name}`}
            >
              <Download className="h-3.5 w-3.5" />
              <span>Baixar</span>
            </button>
          </VersionRow>
        ))}
      </div>

      {isInstalling && downloadProgress && (
        <div className="mt-2 pt-3 border-t border-border shrink-0 sticky bottom-0 bg-background">
          <div className="flex items-center gap-2 text-[11px] text-muted-foreground mb-1">
            <Loader2 className="h-3 w-3 animate-spin" />
            <span>
              Baixando {installingName}... {Math.round((downloadProgress.current / downloadProgress.total) * 100)}%
            </span>
          </div>
          <div className="h-1.5 rounded-full bg-secondary overflow-hidden">
            <div
              className="h-full rounded-full bg-primary transition-all duration-300"
              style={{ width: `${(downloadProgress.current / downloadProgress.total) * 100}%` }}
            />
          </div>
        </div>
      )}
    </div>
  )
}
```

- [ ] Verificar: `pnpm lint`.
- [ ] Commit: `feat(version-picker): add AvailableVersionsTab`

---

### Task 7 — Criar `version-picker/version-picker-dialog.tsx`

Container que decide mobile/desktop, hospeda header + tabs + conteúdo. Espelha a estrutura do
`book-chapter-dialog.tsx` (`DesktopDialog` inline + `BottomSheet`).

- [ ] Criar `features/bible-reader/components/version-picker/version-picker-dialog.tsx`:

```tsx
"use client"

import { useState } from "react"
import { BookOpen } from "lucide-react"
import { BottomSheet } from "@/components/ui/bottom-sheet"
import { useIsMobile } from "@/lib/use-media-query"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { VersionSearchHeader } from "./version-search-header"
import { InstalledVersionsTab } from "./installed-versions-tab"
import { AvailableVersionsTab } from "./available-versions-tab"

interface VersionPickerDialogProps {
  open: boolean
  onClose: () => void
}

export function VersionPickerDialog({ open, onClose }: VersionPickerDialogProps) {
  const isMobile = useIsMobile()
  const { versionId, setVersionId, installedVersions, availableVersions } = useBibleVersion()
  const [query, setQuery] = useState("")

  function handleSelect(id: string) {
    setVersionId(id)
    onClose()
  }

  function handleClose() {
    setQuery("")
    onClose()
  }

  const installedCount = installedVersions.length
  const availableCount = availableVersions.length - installedCount

  const content = (
    <div className="relative flex flex-col h-full max-h-[90vh] bg-background md:max-h-[75vh] overflow-hidden">
      <VersionSearchHeader query={query} onQueryChange={setQuery} onClose={handleClose} />

      {/* Fade abaixo do header */}
      <div className="absolute top-14 left-0 right-0 h-6 bg-linear-to-b from-background to-transparent pointer-events-none z-10" />

      <div className="px-4 md:px-6 pt-2 pb-2 shrink-0 z-10 bg-background">
        <Tabs defaultValue="installed">
          <TabsList className="w-full">
            <TabsTrigger value="installed">Instaladas ({installedCount})</TabsTrigger>
            <TabsTrigger value="available">Disponíveis ({availableCount})</TabsTrigger>
          </TabsList>
          <TabsContent value="installed" className="mt-0">
            <div className="overflow-y-auto p-4 md:p-6 pt-4 custom-scrollbar">
              <InstalledVersionsTab query={query} onSelect={handleSelect} />
            </div>
          </TabsContent>
          <TabsContent value="available" className="mt-0">
            <div className="overflow-y-auto p-4 md:p-6 pt-4 custom-scrollbar">
              <AvailableVersionsTab query={query} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )

  if (isMobile) {
    return (
      <BottomSheet open={open} onClose={handleClose} size="95">
        <div className="flex flex-col">{content}</div>
      </BottomSheet>
    )
  }

  if (!open) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="bg-background w-full max-w-2xl h-full max-h-[80vh] rounded-xl shadow-2xl flex flex-col overflow-hidden border border-border animate-in fade-in zoom-in-95 duration-200">
        {content}
      </div>
    </div>
  )
}
```

- [ ] Verificar: `pnpm lint`.
- [ ] Commit: `feat(version-picker): add VersionPickerDialog container`

---

### Task 8 — Reescrever `bible-version-selector.tsx`

Trigger compacto (Button com abreviação) que abre o dialog. Substitui a lógica de popover/BottomSheet.
Mantém a assinatura do `ReaderVersionBadge` (`className`, `variant`) para drop-in no `reader-header.tsx`.

- [ ] Reescrever `features/bible-reader/components/bible-version-selector.tsx`:

```tsx
"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context"
import { VersionPickerDialog } from "./version-picker/version-picker-dialog"

interface BibleVersionSelectorProps {
  className?: string
  variant?: "default" | "outline" | "ghost" | "secondary"
}

export function BibleVersionSelector({
  className,
  variant = "outline",
}: BibleVersionSelectorProps) {
  const { versionId, installedVersions, availableVersions } = useBibleVersion()
  const [open, setOpen] = useState(false)

  const currentAbbr = versionId.toUpperCase()
  const currentFullName =
    installedVersions.find((v) => v.id === versionId)?.name ??
    availableVersions.find((v) => v.id === versionId)?.name ??
    versionId.toUpperCase()

  return (
    <>
      <Button
        onClick={() => setOpen(true)}
        variant={variant}
        size="lg"
        className={cn(variant === "outline" && "border-l-0", "rounded-[inherit] h-9", className)}
        aria-label="Selecionar versão da Bíblia"
        title={currentFullName}
      >
        <span className="text-sm font-semibold mx-1">{currentAbbr}</span>
      </Button>

      <VersionPickerDialog open={open} onClose={() => setOpen(false)} />
    </>
  )
}
```

- [ ] Verificar: `pnpm lint`.
- [ ] Commit: `feat(bible-reader): rewrite BibleVersionSelector as trigger for the picker dialog`

---

### Task 9 — Atualizar `reader-header.tsx`

Trocar as 2 ocorrências de `ReaderVersionBadge` por `BibleVersionSelector`.

- [ ] Em `features/bible-reader/components/reader-header.tsx`:
  - Trocar import: remover `import { ReaderVersionBadge } from "./reader-version-badge";` →
    `import { BibleVersionSelector } from "./bible-version-selector";`
  - Linha ~120 (header desktop): `<ReaderVersionBadge variant="ghost" className="h-8 rounded-full px-3" />` →
    `<BibleVersionSelector variant="ghost" className="h-8 rounded-full px-3" />`
  - Linha ~188 (nav mobile): `<ReaderVersionBadge variant="ghost" className="h-9 rounded-full px-3" />` →
    `<BibleVersionSelector variant="ghost" className="h-9 rounded-full px-3" />`
- [ ] Verificar: `pnpm lint`.
- [ ] Commit: `refactor(reader-header): use BibleVersionSelector instead of ReaderVersionBadge`

---

### Task 10 — Remover arquivos obsoletos

- [ ] Excluir `features/bible-reader/components/reader-version-badge.tsx`.
- [ ] Excluir `features/bible-reader/components/download-versions-dialog.tsx`.
- [ ] Confirmar que não há mais imports órfãos: `grep -rn "reader-version-badge\|download-versions-dialog\|ReaderVersionBadge\|DownloadVersionsDialog" --include="*.tsx" --include="*.ts" . | grep -v node_modules` → deve retornar vazio.
- [ ] Commit: `chore(bible-reader): remove obsolete ReaderVersionBadge and DownloadVersionsDialog`

---

### Task 11 — Verificação final

- [ ] `pnpm lint` sem erros.
- [ ] `pnpm build` sem erros.
- [ ] Checagem manual (`pnpm dev`):
  - Desktop: clicar na abreviação da versão na pill do header → abre dialog com header de busca + 2 abas + contadores; selecionar versão fecha o dialog; buscar filtra a aba ativa; aba Disponíveis mostra botões Baixar; desinstalar funciona.
  - Mobile: clicar a versão na nav inferior → BottomSheet 95% com o mesmo conteúdo; alvos de toque adequados; busca com `text-base` (sem zoom iOS).
  - Download: barra de progresso aparece; toast "disponível offline" surge ao concluir; toast de erro em caso de falha.

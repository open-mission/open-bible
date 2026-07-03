# Plano: Migrar Notificações para sonner

## Contexto

O projeto possui dois sistemas de notificação conflitantes:
1. **Sistema custom** (`features/layout/hooks/use-toast.tsx`) — ToastProvider + useToastAction com portal manual, progress bar, e lifecycle por setTimeout
2. **shadcn sonner** (`components/ui/sonner.tsx`) — componente instalado mas **não utilizado no layout**

A regra shadcn é clara: **"Toast via `sonner`"**. O sistema custom deve ser substituído.

## Arquivos Afetados

### Consumo atual do sistema custom
| Arquivo | Uso |
|---------|-----|
| `app/page.tsx` | Auto-download ARA (loading → success/error) |
| `features/bible-reader/components/version-picker/use-version-install.ts` | Download de versões com progress bar |
| `features/bible-reader/components/verse-selection-popover.tsx` | Copy para clipboard |
| `features/layout/components/opfs-status-gate.tsx` | Erro OPFS indisponível |
| `app/layout.tsx` | Envolto por `<ToastProvider>` |

### Arquivos a criar
- `features/bible-reader/lib/download-toast.tsx` — custom renderer com progress bar

### Arquivos a modificar
- `app/layout.tsx` — swap `ToastProvider` → `<Toaster />`
- `use-version-install.ts` — migrar para sonner
- `app/page.tsx` — migrar para sonner
- `verse-selection-popover.tsx` — usar `toast.success()` / `toast.error()`
- `opfs-status-gate.tsx` — usar `toast.error()`

### Arquivo a remover
- `features/layout/hooks/use-toast.tsx`

## Implementação

### 1. Criar `features/bible-reader/lib/download-toast.tsx`

Custom renderer para sonner com suporte a progress bar:

```tsx
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
    <div className="flex items-start gap-3">
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
    (t) => <DownloadToast name={name} progress={{ current: 0, total: 100 }} />,
    { id: `download-${name}`, duration: Infinity }
  )
}

export function showDownloadProgress(
  id: string | number,
  name: string,
  progress: { current: number; total: number }
) {
  toast.custom(
    (t) => <DownloadToast name={name} progress={progress} />,
    { id, duration: Infinity }
  )
}

export function showDownloadSuccess(id: string | number, name: string) {
  toast.custom(
    (t) => <DownloadToast name={name} status="success" />,
    { id, duration: 4000 }
  )
}

export function showDownloadError(id: string | number, name: string) {
  toast.custom(
    (t) => <DownloadToast name={name} status="error" />,
    { id, duration: 5000 }
  )
}
```

### 2. Reescrever `use-version-install.ts`

```tsx
"use client"

import { useRef, useState } from "react"
import { useBibleVersion, useDownloadProgress } from "@/features/bible-reader/context/bible-version-context"
import {
  showDownloadStart,
  showDownloadProgress,
  showDownloadSuccess,
  showDownloadError,
} from "@/features/bible-reader/lib/download-toast"

export function useVersionInstall() {
  const { installVersion } = useBibleVersion()
  const { isInstalling, downloadProgress } = useDownloadProgress()
  const toastIdRef = useRef<string | number | null>(null)
  const [installingName, setInstallingName] = useState("")

  async function install(id: string, name: string) {
    setInstallingName(name)
    toastIdRef.current = showDownloadStart(name)

    try {
      await installVersion(id)
      if (toastIdRef.current) {
        showDownloadSuccess(toastIdRef.current, name)
        toastIdRef.current = null
      }
    } catch {
      if (toastIdRef.current) {
        showDownloadError(toastIdRef.current, name)
        toastIdRef.current = null
      }
    }
  }

  return { install, isInstalling, downloadProgress, installingName }
}
```

Nota: O `downloadProgress` ainda é retornado para a UI inline do `available-versions-tab.tsx` (barra no rodapé).

### 3. Atualizar `app/page.tsx`

Trocar `useToastAction` por `toast` do sonner:

```tsx
// ANTES
const { addToast, updateToast, removeToast } = useToastAction();
const [activeToastId, setActiveToastId] = useState<string | null>(null);

// DEPOIS
import { toast } from "sonner";
import { showDownloadStart, showDownloadProgress, showDownloadSuccess, showDownloadError } from "@/features/bible-reader/lib/download-toast";

const activeToastIdRef = useRef<string | number | null>(null);

// Auto-download:
activeToastIdRef.current = showDownloadStart("Bíblia Almeida Revista e Atualizada (ARA)");
installVersion("ara")
  .then(() => {
    if (activeToastIdRef.current) {
      showDownloadSuccess(activeToastIdRef.current, "Bíblia ARA");
      activeToastIdRef.current = null;
    }
    setVersionId("ara");
  })
  .catch((e) => {
    console.error("Auto download failed:", e);
    if (activeToastIdRef.current) {
      showDownloadError(activeToastIdRef.current, "Bíblia ARA");
      activeToastIdRef.current = null;
    }
  });

// Progress sync:
useEffect(() => {
  if (activeToastIdRef.current && isInstalling && downloadProgress) {
    showDownloadProgress(activeToastIdRef.current, "Bíblia ARA", downloadProgress);
  }
}, [isInstalling, downloadProgress]);
```

### 4. Atualizar `verse-selection-popover.tsx`

```tsx
// ANTES
const { addToast, removeToast } = useToastAction();
const id = addToast({ message: "Referência copiada!", type: "success" });
setTimeout(() => { removeToast(id); }, 2000);

// DEPOIS
import { toast } from "sonner";
toast.success("Referência copiada!");
// sonner já tem auto-dismiss (duration: 4000 padrão)
```

### 5. Atualizar `opfs-status-gate.tsx`

```tsx
// ANTES
const { addToast } = useToastAction();
addToast({ type: "error", message: "Este ambiente não suporta..." });

// DEPOIS
import { toast } from "sonner";
toast.error("Este ambiente não suporta armazenamento offline (OPFS)...");
```

### 6. Atualizar `app/layout.tsx`

```tsx
// ANTES
import { ToastProvider } from "@/features/layout/hooks/use-toast";
<ToastProvider>
  {children}
  <OpfsStatusGate />
</ToastProvider>

// DEPOIS
import { Toaster } from "@/components/ui/sonner";
<>
  {children}
  <OpfsStatusGate />
  <Toaster />
</>
```

### 7. Remover `features/layout/hooks/use-toast.tsx`

Arquivo não será mais necessário.

## Verificação

1. `pnpm lint` — sem erros
2. Testar manualmente:
   - Primeira visita (auto-download ARA) → toast com progresso → success
   - Versão picker → baixar versão → toast com progresso → success
   - Copiar versículo → toast success rápido
   - OPFS indisponível → toast error persistente
3. Verificar mobile e desktop (responsividade do sonner é nativa)

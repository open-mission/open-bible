"use client";

import { useServiceWorkerUpdate } from "@/features/service-worker/hooks/use-sw-update";
import { Button } from "@/components/ui/button";
import { IconRefresh } from "@tabler/icons-react";

export function UpdateBanner() {
  const { isUpdateAvailable, updateNow } = useServiceWorkerUpdate();

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] w-[calc(100%-2rem)] max-w-sm pointer-events-none">
      <div className="pointer-events-auto flex items-center gap-3 rounded-xl border border-border bg-popover/95 p-3 shadow-lg backdrop-blur-md">
        <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
          <IconRefresh className="size-4" />
        </span>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-popover-foreground">
            Nova versão disponível
          </p>
          <p className="text-xs text-muted-foreground">
            Atualize para a versão mais recente.
          </p>
        </div>
        <Button size="sm" onClick={updateNow} className="shrink-0">
          <IconRefresh data-icon="inline-start" />
          Atualizar
        </Button>
      </div>
    </div>
  );
}


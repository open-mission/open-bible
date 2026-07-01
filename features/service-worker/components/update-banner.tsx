"use client";

import { useServiceWorkerUpdate } from "@/features/service-worker/hooks/use-sw-update";
import { Button } from "@/components/ui/button";

export function UpdateBanner() {
  const { isUpdateAvailable, updateNow } = useServiceWorkerUpdate();

  if (!isUpdateAvailable) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-100 p-4 pointer-events-none">
      <div className="pointer-events-auto mx-auto max-w-md rounded-lg border bg-card shadow-lg p-3 flex items-center justify-between gap-3">
        <p className="text-sm text-foreground">Nova versão disponível.</p>
        <Button size="sm" onClick={updateNow}>
          Atualizar
        </Button>
      </div>
    </div>
  );
}

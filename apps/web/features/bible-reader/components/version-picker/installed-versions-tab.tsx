"use client";

import { useState } from "react";
import { Check, Trash2 } from "lucide-react";
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { filterVersions, getVersionSize } from "./version-meta";
import { VersionRow } from "./version-row";

interface InstalledVersionsTabProps {
  query: string;
  onSelect: (id: string) => void;
}

/**
 * Conteúdo da aba "Instaladas": lista filtrada por `query`. Selecionar ativa
 * a versão (e fecha o dialog via onSelect). A lixeira desinstala mediante um
 * dialog de confirmação próprio (pt-BR), sem modal nativo do navegador.
 */
export function InstalledVersionsTab({
  query,
  onSelect,
}: InstalledVersionsTabProps) {
  const { versionId, installedVersions, uninstallVersion } = useBibleVersion();
  const [pendingRemove, setPendingRemove] = useState<{ id: string; name: string } | null>(null);
  const filtered = filterVersions(installedVersions, query);

  if (filtered.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-12 text-sm text-muted-foreground gap-2">
        <p>
          {query
            ? `Nenhuma versão encontrada para "${query}".`
            : "Nenhuma versão instalada. Baixe uma na aba Disponíveis."}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-1 gap-2 md:mx-6">
      {filtered.map((v) => {
        const isActive = v.id === versionId;
        return (
          <VersionRow
            key={v.id}
            abbreviation={v.id}
            name={v.name}
            meta={`${v.books.length} livros • ${getVersionSize(v.id)}`}
            state={isActive ? "active" : "default"}
            onClick={() => onSelect(v.id)}
          >
            {isActive ? (
              <Check className="h-4 w-4 text-primary" />
            ) : (
              <AlertDialog
                open={pendingRemove?.id === v.id}
                onOpenChange={(open) => {
                  if (open) setPendingRemove({ id: v.id, name: v.name });
                  else setPendingRemove(null);
                }}
              >
                <AlertDialogTrigger
                  render={
                    <button
                      type="button"
                      onClick={(e) => e.stopPropagation()}
                      className="text-muted-foreground hover:text-destructive transition-colors p-1.5 hover:bg-accent rounded-md cursor-pointer"
                      aria-label={`Remover ${v.name}`}
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  }
                />
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Remover tradução?</AlertDialogTitle>
                    <AlertDialogDescription>
                      “{pendingRemove?.name}” deixa de ocupar espaço neste
                      dispositivo. Você pode baixá-la novamente quando quiser.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancelar</AlertDialogCancel>
                    <AlertDialogAction
                      variant="destructive"
                      onClick={() => {
                        if (pendingRemove) uninstallVersion(pendingRemove.id);
                        setPendingRemove(null);
                      }}
                    >
                      Remover
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </VersionRow>
        );
      })}
    </div>
  );
}

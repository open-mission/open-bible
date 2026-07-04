"use client";

import { Check, Trash2 } from "lucide-react";
import { useBibleVersion } from "@/features/bible-reader/context/bible-version-context";
import { filterVersions, getVersionSize } from "./version-meta";
import { VersionRow } from "./version-row";

interface InstalledVersionsTabProps {
  query: string;
  onSelect: (id: string) => void;
}

/**
 * Conteúdo da aba "Instaladas": lista filtrada por `query`. Selecionar ativa
 * a versão (e fecha o dialog via onSelect). Lixeira desinstala com confirmação.
 */
export function InstalledVersionsTab({
  query,
  onSelect,
}: InstalledVersionsTabProps) {
  const { versionId, installedVersions, uninstallVersion } = useBibleVersion();
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
            meta={`${v.books.length} livros • ${getVersionSize(v.id)} • SQLite`}
            state={isActive ? "active" : "default"}
            onClick={() => onSelect(v.id)}
          >
            {isActive ? (
              <Check className="h-4 w-4 text-primary-foreground" />
            ) : (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm(`Remover "${v.name}" do dispositivo?`)) {
                    uninstallVersion(v.id);
                  }
                }}
                className="text-muted-foreground hover:text-destructive transition-colors p-1.5 hover:bg-accent rounded-md cursor-pointer"
                aria-label={`Remover ${v.name}`}
              >
                <Trash2 className="h-4 w-4" />
              </button>
            )}
          </VersionRow>
        );
      })}
    </div>
  );
}

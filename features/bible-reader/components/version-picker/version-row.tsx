"use client";

import { cn } from "@/lib/utils";

interface VersionRowProps {
  abbreviation: string;
  name: string;
  meta?: string;
  /** Estado visual da linha. */
  state?: "active" | "default";
  /** Conteúdo da área de ação (botão selecionar/baixar/lixeira). */
  children?: React.ReactNode;
  onClick?: () => void;
}

/**
 * Card reutilizável de uma versão. Layout horizontal (conteúdo à esquerda,
 * ação à direita) inspirado no BookButton do book-chapter-dialog.
 */
export function VersionRow({
  abbreviation,
  name,
  meta,
  state = "default",
  children,
  onClick,
}: VersionRowProps) {
  const isActive = state === "active";
  const clickable = Boolean(onClick);

  const inner = (
    <div className="flex flex-col gap-0.5 min-w-0">
      <span className="flex items-center gap-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground/80">
          {abbreviation}
        </span>
        <span
          className={cn(
            "font-semibold truncate",
            isActive && "text-primary-foreground",
          )}
        >
          {name}
        </span>
      </span>
      {meta && (
        <span
          className={cn(
            "text-[10px] truncate",
            isActive
              ? "text-primary-foreground/70"
              : "text-muted-foreground/60",
          )}
        >
          {meta}
        </span>
      )}
    </div>
  );

  return (
    <div
      className={cn(
        "group flex items-center justify-between gap-2 rounded-lg border transition-all px-4 py-3 text-left",
        isActive
          ? "bg-primary text-primary-foreground border-primary shadow-sm"
          : "border-border hover:bg-accent/60 text-foreground",
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
  );
}

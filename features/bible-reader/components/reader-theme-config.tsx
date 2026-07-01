"use client";

import { Check, Sun, Moon, Monitor } from "lucide-react";
import { useAppTheme } from "@/features/theme/components/theme-provider";
import {
  COLOR_LABELS,
  COLOR_SWATCHES,
  type ThemeColor,
} from "@/features/theme/utils/theme";
import { cn } from "@/lib/utils";

export function ReaderThemeConfig() {
  const { mode, color, palette, setTheme, setColor, setPalette } =
    useAppTheme();
  const colorList = Object.keys(COLOR_LABELS) as ThemeColor[];

  return (
    <div className="space-y-6 py-4">
      {/* Estilo do Tema */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold leading-none">Estilo do Tema</h3>
        <p className="text-xs text-muted-foreground">
          Escolha a paleta de cores base para o leitor.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            { value: "default" as const, label: "Padrão" },
            { value: "dracula" as const, label: "Dracula" },
            { value: "gruvbox" as const, label: "Gruvbox" },
          ].map((p) => {
            const active = palette === p.value;
            return (
              <button
                key={p.value}
                onClick={() => setPalette(p.value)}
                className={cn(
                  "flex items-center justify-center rounded-lg border-2 px-3 py-3 text-xs font-semibold transition-all cursor-pointer h-10",
                  active
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                )}
              >
                {p.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Aparência */}
      <div className="space-y-3 pt-4 border-t border-border">
        <h3 className="text-sm font-semibold leading-none">Aparência</h3>
        <p className="text-xs text-muted-foreground">
          Escolha o tema visual do leitor.
        </p>
        <div className="grid grid-cols-3 gap-3">
          {[
            {
              value: "light" as const,
              label: "Claro",
              icon: <Sun className="h-4 w-4" />,
            },
            {
              value: "system" as const,
              label: "Sistema",
              icon: <Monitor className="h-4 w-4" />,
            },
            {
              value: "dark" as const,
              label: "Escuro",
              icon: <Moon className="h-4 w-4" />,
            },
          ].map((m) => {
            const active = mode === m.value;
            const disabled = palette === "dracula";
            return (
              <button
                key={m.value}
                disabled={disabled}
                onClick={() => setTheme(m.value)}
                className={cn(
                  "flex flex-col items-center gap-2.5 rounded-lg border-2 px-3 py-4 text-xs font-semibold transition-all cursor-pointer",
                  active && !disabled
                    ? "border-primary bg-primary/5 text-primary"
                    : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  disabled && "opacity-50 cursor-not-allowed",
                )}
              >
                <div className="p-1.5 rounded-full bg-secondary/50">
                  {m.icon}
                </div>
                {disabled && m.value === "dark" ? "Escuro (Fixo)" : m.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Cor de Destaque */}
      {palette === "default" && (
        <div className="space-y-3 pt-4 border-t border-border animate-in fade-in-50 duration-200">
          <h3 className="text-sm font-semibold leading-none">
            Cor de destaque
          </h3>
          <p className="text-xs text-muted-foreground">
            Escolha a cor principal dos destaques e botões.
          </p>
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2 max-h-[240px] overflow-y-auto pr-1 custom-scrollbar">
            {colorList.map((c) => {
              const active = color === c;
              return (
                <button
                  key={c}
                  onClick={() => setColor(c)}
                  className={cn(
                    "flex items-center gap-2 rounded-lg border px-2.5 py-2 text-xs transition-all cursor-pointer",
                    active
                      ? "border-primary bg-primary/5 text-foreground font-semibold"
                      : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                  )}
                >
                  <span
                    className="h-3.5 w-3.5 rounded-full shrink-0 ring-1 ring-black/10"
                    style={{ backgroundColor: COLOR_SWATCHES[c] }}
                  />
                  <span className="truncate">{COLOR_LABELS[c]}</span>
                  {active && (
                    <Check className="h-3.5 w-3.5 text-primary shrink-0 ml-auto" />
                  )}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

"use client";

import { Palette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { cn } from "@/lib/utils";
import { useAppTheme } from "@/features/theme/components/theme-provider";
import { useHighlightsContext } from "@/features/highlights/context/highlights-context";

interface ReaderDisplaySettingsProps {
  fontSize: number;
  onChangeFontSize: (size: number) => void;
  verseSpacing: "small" | "medium" | "large";
  onChangeVerseSpacing: (spacing: "small" | "medium" | "large") => void;
  readerMode: "narrow" | "medium" | "wide";
  onChangeReaderMode: (mode: "narrow" | "medium" | "wide") => void;
  readerFont: "sans" | "serif" | "mono";
  onChangeReaderFont: (font: "sans" | "serif" | "mono") => void;
  onConfigureTheme: () => void;
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-xs font-semibold text-foreground">{children}</span>
  );
}

function OptionButton({
  label,
  active,
  onClick,
  className,
}: {
  label: string;
  active: boolean;
  onClick: () => void;
  className?: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "flex items-center justify-center rounded-lg border-2 py-2 text-xs transition-all cursor-pointer h-9 flex-1 min-w-0",
        className,
        active
          ? "border-primary bg-primary/5 text-primary font-bold shadow-xs"
          : "border-border bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
      )}
    >
      {label}
    </button>
  );
}

function SegmentedChoice<V extends string>({
  value,
  onChange,
  options,
}: {
  value: V;
  onChange: (v: V) => void;
  options: { value: V; label: string; className?: string }[];
}) {
  return (
    <div className="flex gap-2">
      {options.map((o) => (
        <OptionButton
          key={o.value}
          label={o.label}
          active={value === o.value}
          onClick={() => onChange(o.value)}
          className={o.className}
        />
      ))}
    </div>
  );
}

export function ReaderDisplaySettings({
  fontSize,
  onChangeFontSize,
  verseSpacing,
  onChangeVerseSpacing,
  readerMode,
  onChangeReaderMode,
  readerFont,
  onChangeReaderFont,
  onConfigureTheme,
}: ReaderDisplaySettingsProps) {
  const { mode, setTheme } = useAppTheme();
  const {
    gutterPosition,
    setGutterPosition,
    mobileInteraction,
    setMobileInteraction,
    desktopInteraction,
    setDesktopInteraction,
  } = useHighlightsContext();

  return (
    <div className="flex flex-col gap-6">
      {/* Leitura */}
      <section className="flex flex-col gap-4">
        <SectionLabel>Leitura</SectionLabel>

        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center text-xs font-medium">
            <span>Tamanho do texto</span>
            <span className="text-muted-foreground">{fontSize}px</span>
          </div>
          <div className="flex items-center gap-3">
            <span className="text-xs text-muted-foreground font-semibold">A</span>
            <span
              className="text-xs text-muted-foreground font-semibold"
              aria-hidden
            >
              A
            </span>
            <Slider
              min={16}
              max={24}
              step={2}
              value={[fontSize]}
              onValueChange={(val) =>
                onChangeFontSize(Array.isArray(val) ? val[0] : val)
              }
              className="flex-1"
              aria-label="Tamanho do texto"
            />
            <span className="text-lg text-muted-foreground font-semibold leading-none">
              A
            </span>
          </div>
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium">Estilo da fonte</span>
          <SegmentedChoice
            value={readerFont}
            onChange={onChangeReaderFont}
            options={[
              { value: "sans", label: "Sans", className: "font-sans" },
              { value: "serif", label: "Serif", className: "font-serif" },
              { value: "mono", label: "Mono", className: "font-mono" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium">Espaço entre os versículos</span>
          <SegmentedChoice
            value={verseSpacing}
            onChange={onChangeVerseSpacing}
            options={[
              { value: "small", label: "Compacto" },
              { value: "medium", label: "Padrão" },
              { value: "large", label: "Espaçoso" },
            ]}
          />
        </div>

        <div className="flex flex-col gap-2">
          <span className="text-xs font-medium">Margens do texto</span>
          <SegmentedChoice
            value={readerMode}
            onChange={onChangeReaderMode}
            options={[
              { value: "narrow", label: "Estreito" },
              { value: "medium", label: "Padrão" },
              { value: "wide", label: "Largo" },
            ]}
          />
          <span className="text-[11px] text-muted-foreground leading-normal">
            Escolha o quanto o texto ocupa da tela.
          </span>
        </div>
      </section>

      {/* Destaques */}
      <section className="flex flex-col gap-4 border-t border-border pt-4">
        <SectionLabel>Destaques</SectionLabel>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            Marca lateral dos indicadores
          </span>
          <div className="flex gap-2">
            <OptionButton
              label="Esquerda"
              active={gutterPosition === "left"}
              onClick={() => setGutterPosition("left")}
            />
            <OptionButton
              label="Direita"
              active={gutterPosition === "right"}
              onClick={() => setGutterPosition("right")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            Como abrir os detalhes no celular
          </span>
          <div className="flex gap-2">
            <OptionButton
              label="Sobe do rodapé"
              active={mobileInteraction === "drawer"}
              onClick={() => setMobileInteraction("drawer")}
            />
            <OptionButton
              label="Ao lado do texto"
              active={mobileInteraction === "popover"}
              onClick={() => setMobileInteraction("popover")}
            />
          </div>
        </div>

        <div className="flex flex-col gap-1.5">
          <span className="text-[11px] font-medium text-muted-foreground">
            Como abrir os detalhes no computador
          </span>
          <div className="flex gap-2">
            <OptionButton
              label="Ao lado do texto"
              active={desktopInteraction === "popover"}
              onClick={() => setDesktopInteraction("popover")}
            />
            <OptionButton
              label="Painel lateral"
              active={desktopInteraction === "drawer"}
              onClick={() => setDesktopInteraction("drawer")}
            />
          </div>
        </div>
      </section>

      {/* Tema */}
      <section className="flex flex-col gap-2 border-t border-border pt-4">
        <SectionLabel>Tema</SectionLabel>
        <div className="grid grid-cols-3 gap-2">
          {/* Claro */}
          <button
            onClick={() => setTheme("light")}
            className={cn(
              "relative flex flex-col items-start gap-1 p-2 rounded-lg border-2 text-left transition-all overflow-hidden h-14 cursor-pointer",
              mode === "light"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-foreground/30 bg-card",
            )}
          >
            <div className="absolute inset-0 bg-white" />
            <div className="relative z-10 w-full flex flex-col gap-1">
              <div className="h-1.5 w-8 rounded-sm bg-neutral-200" />
              <div className="h-1 w-12 rounded-sm bg-neutral-300" />
              <div className="h-1 w-10 rounded-sm bg-neutral-300" />
            </div>
            <span className="absolute bottom-1 right-2 z-10 text-[10px] font-bold text-neutral-800">
              Claro
            </span>
          </button>

          {/* Escuro */}
          <button
            onClick={() => setTheme("dark")}
            className={cn(
              "relative flex flex-col items-start gap-1 p-2 rounded-lg border-2 text-left transition-all overflow-hidden h-14 cursor-pointer",
              mode === "dark"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-foreground/30 bg-card",
            )}
          >
            <div className="absolute inset-0 bg-zinc-950" />
            <div className="relative z-10 w-full flex flex-col gap-1">
              <div className="h-1.5 w-8 rounded-sm bg-zinc-700" />
              <div className="h-1 w-12 rounded-sm bg-zinc-800" />
              <div className="h-1 w-10 rounded-sm bg-zinc-800" />
            </div>
            <span className="absolute bottom-1 right-2 z-10 text-[10px] font-bold text-white">
              Escuro
            </span>
          </button>

          {/* Automático */}
          <button
            onClick={() => setTheme("system")}
            className={cn(
              "relative flex flex-col items-start gap-1 p-2 rounded-lg border-2 text-left transition-all overflow-hidden h-14 cursor-pointer",
              mode === "system"
                ? "border-primary bg-primary/5"
                : "border-border hover:border-foreground/30 bg-card",
            )}
          >
            <div className="absolute inset-y-0 left-0 right-1/2 bg-white" />
            <div className="absolute inset-y-0 left-1/2 right-0 bg-zinc-950" />
            <div className="relative z-10 w-full flex flex-col gap-1">
              <div className="h-1.5 w-8 rounded-sm bg-neutral-400" />
              <div className="h-1 w-12 rounded-sm bg-neutral-500" />
              <div className="h-1 w-10 rounded-sm bg-neutral-500" />
            </div>
            <span className="absolute bottom-1 right-2 z-10 text-[10px] font-bold mix-blend-difference text-white">
              Auto
            </span>
          </button>
        </div>
      </section>

      {/* Configurar Tema Button */}
      <div className="border-t border-border pt-3">
        <Button
          variant="outline"
          size="sm"
          className="w-full justify-center gap-2 h-8 text-xs cursor-pointer"
          onClick={onConfigureTheme}
        >
          <Palette className="h-3.5 w-3.5 text-primary" />
          Escolher cor de destaque…
        </Button>
      </div>
    </div>
  );
}

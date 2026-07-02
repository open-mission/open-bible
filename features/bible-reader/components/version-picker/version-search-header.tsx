"use client";

import { Search, X } from "lucide-react";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupButton,
  InputGroupInput,
} from "@/components/ui/input-group";

interface VersionSearchHeaderProps {
  query: string;
  onQueryChange: (q: string) => void;
  onClose: () => void;
}

/**
 * Header fixo (altura h-14) com InputGroup de busca + botão fechar dentro do
 * input (InputGroupButton). O botão fechar só aparece no desktop — no mobile o
 * BottomSheet (vaul) fecha por swipe/overlay. Espelha o header do
 * book-chapter-dialog.
 */
export function VersionSearchHeader({
  query,
  onQueryChange,
  onClose,
}: VersionSearchHeaderProps) {
  return (
    <header className="flex items-center px-4 h-14 shrink-0 gap-3 z-10">
      <InputGroup className="flex-1 h-10 shadow-none border-border bg-background">
        <InputGroupAddon align="inline-start">
          <Search className="size-4 text-muted-foreground" />
        </InputGroupAddon>
        <InputGroupInput
          type="text"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
          placeholder="Pesquisar versão..."
          className="text-base md:text-sm placeholder:text-muted-foreground h-full"
        />
        <InputGroupAddon align="inline-end" className="hidden md:flex pr-1">
          <InputGroupButton
            variant="ghost"
            size="icon-sm"
            onClick={onClose}
            aria-label="Fechar"
            className="text-muted-foreground hover:text-foreground"
          >
            <X className="size-4" />
          </InputGroupButton>
        </InputGroupAddon>
      </InputGroup>
    </header>
  );
}

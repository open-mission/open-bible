"use client"

export function ReaderEmpty({ onOpenSidebar }: { onOpenSidebar: () => void }) {
  return (
    <div className="flex flex-1 h-full flex-col items-center justify-center gap-4 p-8">
      <p className="font-serif text-xl text-muted-foreground/60 text-balance text-center">
        Selecione um livro e um capítulo para começar a ler.
      </p>
      <p className="text-xs text-muted-foreground/40 text-center text-balance">
        Clique em qualquer versículo para destacar ou adicionar uma nota.
      </p>
      <p className="text-[10px] text-muted-foreground/30 mt-2">
        v{process.env.NEXT_PUBLIC_APP_VERSION}
      </p>
      <button
        onClick={onOpenSidebar}
        className="md:hidden mt-2 rounded-md px-4 py-2 text-sm bg-secondary text-secondary-foreground hover:bg-accent hover:text-accent-foreground transition-colors"
      >
        Escolher livro
      </button>
    </div>
  )
}

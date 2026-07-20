# Sidebar & Navigation — Professional UX Design Spec

**Data:** 2026-07-20
**Objetivo:** Elevar o visual e UX da sidebar, navegação e atalhos para um nível profissional, inspirado em Notion, Midday e Obsidian, tanto em desktop quanto mobile (PWA e Tauri).

---

## 1. Motivação

O Open Bible tem uma sidebar funcional (modo avançado) e um dialog de navegação (Cmd+K em simple mode), mas falta **polish visual**, atalhos abrangentes, uma **command palette** global, e uma navegação **app-shell** que prepare para páginas futuras (notas, comentários, destaques) sem criar novas abas de navegador.

A experiência precisa se sentir como um app nativo — não como um site com menus genéricos.

---

## 2. Escopo

### 2.1 Sidebar Profissional (Desktop)

**Referências:** Notion sidebar, Midday sidebar, Linear sidebar.

#### Design Visual
- **Header:** Logo full (expandido) ou minimal (colapsado), com transição suave de opacidade
- **Seções visuais claras:** "Navegação", "Painéis Abertos" (no advanced mode), separadas por labels com tipografia refinada (uppercase, letter-spacing, font-weight 500, text-xs, muted-foreground/60)
- **Menu items:** Altura consistente (h-9), ícones de 18px, font-medium, rounded-lg com hover state `bg-sidebar-accent/50`, active state `bg-sidebar-accent text-sidebar-accent-foreground` com borda sutil à esquerda (2px primary)
- **Micro-animações:** Hover com `transition-all duration-150`, collapse/expand com `transition-[width] duration-200 ease-in-out`
- **Footer refinado:** Settings, theme toggle, e versão em tipografia micro — tudo alinhado e coeso
- **Search trigger:** Botão com placeholder "Buscar..." e atalho `⌘K` (usa `<Kbd>` component), que abre a Command Palette global

#### Navegação por Seções
Items fixos na sidebar que funcionam como SPA navigation (sem full-page reload):
| Item | Ícone | Route/State | Status |
|------|-------|-------------|--------|
| Leitura | `IconBook` | `/` ou state "reader" | Implementar agora |
| Notas | `IconNotebook` | state "notes" | Preparar route — stub page |
| Destaques | `IconHighlight` | state "highlights" | Preparar route — stub page |
| Busca | `IconSearch` | Abre command palette | Implementar agora |
| Configurações | `IconSettings` | Abre config dialog | Já existe |

#### Collapsible Behavior
- Desktop: `collapsible="icon"` — sidebar colapsa para ícones-only (48px) com tooltip hover
- Atalho global: `Cmd/Ctrl + \` para toggle (evita conflito com Cmd+B do browser)
- State persisted em localStorage `openbible:sidebar-collapsed`
- Mobile: sidebar render como Sheet (slide-over) — o shadcn `sidebar.tsx` já suporta isso nativamente

### 2.2 Command Palette Global

**Referências:** Notion (Cmd+P/K), Obsidian (Cmd+P), VS Code (Cmd+Shift+P).

Usar o `components/ui/command.tsx` existente (baseado em `cmdk`) para criar uma Command Palette global acessível via:
- **Atalho desktop:** `Cmd/Ctrl + K` (já existe no simple mode para BookChapterDialog — será migrado)
- **Botão na sidebar:** Search trigger visual

#### Grupos de Comandos
| Grupo | Comandos |
|-------|----------|
| **Navegação Rápida** | Ir para livro/capítulo (search com fuzzy matching) |
| **Versões** | Mudar versão da Bíblia (lista versões instaladas) |
| **Ações** | Nova aba, Fechar aba, Mudar para modo Grade/Abas |
| **Aparência** | Mudar tema (claro/escuro), Mudar cor de destaque |
| **Páginas** | Ir para Notas, Ir para Destaques, Configurações |

#### Comportamento
- Fuzzy search nativo do `cmdk`
- Atalhos mostrados inline em cada item (ex: `⌘T` ao lado de "Nova aba")
- `Escape` fecha, `Enter` executa, Arrow keys navegam
- No mobile: acessível via botão na bottom bar (não via atalho)

### 2.3 Keyboard Shortcuts System

**Referências:** Obsidian, Notion, VS Code.

#### Hook: `useGlobalShortcuts`
Central de atalhos globais. Registra todos os atalhos num único listener no `window`, com guards para inputs/textareas/contenteditable.

| Atalho | Ação | Disponibilidade |
|--------|------|-----------------|
| `Cmd/Ctrl + K` | Abrir Command Palette | Global |
| `Cmd/Ctrl + \` | Toggle sidebar | Desktop |
| `Cmd/Ctrl + T` | Nova aba (advanced mode) | Desktop |
| `Cmd/Ctrl + W` | Fechar aba ativa | Desktop |
| `Cmd/Ctrl + 1-9` | Ir para aba N | Desktop |
| `Cmd/Ctrl + Tab` | Tab switcher | Desktop |
| `Alt + T` | Nova aba (fallback browser) | Desktop |
| `Alt + W` | Fechar aba (fallback browser) | Desktop |
| `Alt + E` | Tab switcher (fallback) | Desktop |
| `←` / `→` | Capítulo anterior/próximo | Leitor (sem foco em input) |

**Nota sobre conflitos com browser:** `Cmd+T`, `Cmd+W` conflitam com o browser. A implementação usa `Alt+T` e `Alt+W` como fallbacks seguros. Os atalhos com `Cmd/Ctrl` são interceptados via `e.preventDefault()` — no PWA standalone e Tauri funcionam sem conflito. No browser normal, podem não funcionar (o browser intercepta primeiro). O command palette mostra o atalho correto baseado no contexto (standalone vs browser).

### 2.4 App-Shell Navigation (SPA-like)

**Problema:** URLs com `<Link>` ou `router.push()` em PWA standalone podem criar novas janelas/abas, quebrando a experiência nativa.

**Solução:** Sistema de navegação por "views" gerenciadas por state, não por Next.js routing.

#### Arquitetura
```
AppNavigationProvider (context)
├── activeView: "reader" | "notes" | "highlights" | "settings"
├── navigate(view): void
├── goBack(): void
├── history: ViewHistoryEntry[]
└── canGoBack: boolean
```

- **Desktop:** Sidebar items chamam `navigate("reader")`, `navigate("notes")`, etc.
- **Mobile:** Bottom tab bar com ícones — transições com CSS animations
- **PWA standalone:** Zero full-page reloads, tudo via state
- **Tauri:** Funciona identicamente via state
- **Browser:** Opcionalmente atualiza a URL via `window.history.pushState()` (shallow routing) para permitir deep-linking sem causar page reload

#### View Registry
```typescript
type AppView = "reader" | "notes" | "highlights"
```

Cada view mapeia para um componente lazy-loaded. Views futuras ("comments", "bookmarks") podem ser adicionadas registrando no mapa sem tocar no layout.

### 2.5 Mobile Navigation Refinada

**Estado atual:** `MobileNav` é um stub (mostra apenas versão). `WorkspaceMobileBar` existe no advanced mode.

**Objetivo:** Barra de navegação inferior estilo app nativo — fixa, bonita, com feedback visual.

#### Design
- **Height:** 56px + `env(safe-area-inset-bottom)`
- **Items:** 3-4 ícones centralizados (Leitura, Notas, Destaques, Busca)
- **Active state:** Ícone preenchido + label visível + cor primary (transição suave)
- **Inactive state:** Ícone outline + label oculta + muted-foreground
- **Backdrop:** `bg-background/85 backdrop-blur-lg border-t border-border/40`
- **Feedback:** Micro-scale on tap (0.95 → 1.0), haptic-like visual bounce

---

## 3. Decisões de Design

### 3.1 Ambos os modos (simple e advanced) terão sidebar?
**Decisão:** Sim. O modo "simple" terá a sidebar com navegação entre views. O modo "advanced" mantém a workspace sidebar existente mas ganha a navigation section no topo.

### 3.2 Command Palette substitui BookChapterDialog?
**Decisão:** Não substitui. O BookChapterDialog continua como a UI rica para seleção de livro/capítulo. A command palette é um atalho rápido que, ao selecionar "Ir para livro", abre o BookChapterDialog. São complementares.

### 3.3 Sidebar no mobile?
**Decisão:** Não. Mobile usa bottom tab bar para navegação principal. A sidebar é desktop-only. Mas o botão de hamburger no header mobile pode abrir a sidebar como Sheet se o usuário quiser acesso a itens secundários.

---

## 4. Critérios de Sucesso

- [ ] Sidebar desktop com visual profissional (hover states, tipografia, micro-animações, ícones consistentes)
- [ ] Command palette global (`Cmd/Ctrl + K`) com busca fuzzy e ações
- [ ] Sistema de atalhos centralizado sem conflitos com browser
- [ ] Navegação SPA-like que funcione em PWA standalone, Tauri e browser
- [ ] Bottom tab bar mobile nativa e bonita
- [ ] Preparação de views futuras (notes, highlights) como stubs
- [ ] Zero regressão na funcionalidade existente (simple mode e advanced mode)

---

## 5. Tech Stack

- shadcn `sidebar.tsx` (já existe) — composable, colapsável, Sheet no mobile
- shadcn `command.tsx` (já existe, nunca usado) — cmdk, fuzzy search
- shadcn `kbd.tsx` (já existe) — display de atalhos
- CSS transitions/animations para micro-interações
- `window.history.pushState` para shallow routing (opcional)
- Context API para app navigation state

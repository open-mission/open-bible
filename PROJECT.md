# Projeto

## História e motivação

Open Bible nasceu para oferecer a Bíblia em português offline-first, acessível em web, PWA e desktop sem depender de conexão. A motivação é missionária (org `open-mission`): distribuir 18 versões em português com leitura, anotações e destaques locais, sem lock-in de servidor, usando SQLite WASM + OPFS no navegador e TursoDB no servidor apenas como origem de download.

## Finalidade

Entregar leitura bíblica rápida, pesquisável e anotável: navegação por livro/capítulo/versículo, troca de versão, busca textual, notas vinculadas a múltiplos versículos com range, categorias e destaques coloridos, PWA instalável e app Tauri/Electron desktop com o mesmo frontend (static export). API Hono serve catálogo e download gzip de `.db` via TursoDB/R2.

## Pessoas e contexto de uso

- Leitor devocional em português (mobile PWA e desktop) que precisa de acesso offline.
- Estudante/líder que cria notas e referências cruzadas (multi-versos, multi-versões).
- Usuário desktop (Tauri) que prefere janela nativa com updater (`update-dialog`).
- Consumidor da API (`/api/bibles/*`) incluindo app iOS (CORS aberto, docs em `/api/docs`).

## Capacidades principais

- Catálogo e instalação sob demanda de 18 versões (download ` /api/bibles/download/{version}` → OPFS).
- Leitura por capítulo com `useBibleVerses` → `BibleVersionContext.getVerses()` → `BibleDatabase` local.
- Busca `LIKE %q% COLLATE NOCASE` (sem FTS) com paridade server/local.
- Notas + referências (Drizzle `notes`, `note_references`, soft-delete) e rascunho de destaques (`highlights`, `highlight_verses`, `highlight_categories`).
- Tema claro/escuro com 15 accent colors (`lib/theme.ts`, `next-themes`) e Tailwind v4 + shadcn/ui base-vega.
- Auth Better Auth email/senha (TursoDB Kysely, sessão 7 dias).

## Limites

- Não faz sync em nuvem de notas/destaques (apenas local `app.db`).
- Não usa FTS nem paginação server-side complexa; export JSON `build:data` só fallback.
- Não hospeda Bíblias no repo — distribuição via TursoDB/R2 gzip; `better-sqlite3` só em scripts de import.
- Não expõe PWA/service-worker no Tauri (static export).

## Contexto técnico

Stack: **Next.js 16 App Router**. Layout server component (`app/layout.tsx`) com chain `ThemeProvider → BibleVersionProvider → ToastProvider`; demais componentes são `"use client"` (exceto `components/ui/button.tsx`). Bíblias locais via Web Worker dedicado `public/sqlite-wasm/open-bible.worker.js` (SAHPool VFS) e `DatabaseManager` + Drizzle `sqlite-proxy` para `app.db`; provider chain coordena versão e leitura. API Hono + Zod OpenAPI em `app/api/[[...route]]/route.ts`. Detalhes verificáveis em `.specsfy/STACK.md` e `.specsfy/DATABASE.md`.

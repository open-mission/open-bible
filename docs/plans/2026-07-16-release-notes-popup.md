# Plano de Implementação — feat/184 Release Notes Popup

**Goal:** Adicionar um pop-up lateral "Nova versão disponível" que mostra um resumo do changelog e leva
às Configurações, detectando nova versão via `package.json#version` + endpoint opcional `/api/version`.

**Architecture:** Provider client-side (`ReleaseNotesProvider`) engloba `children` no `app/layout.tsx`,
detecta nova versão no mount (local + fetch best-effort), persiste última vista em `localStorage`
(`openbible:last-seen-version`), e renderiza um pop-up (desktop canto inferior direito / mobile bottom
sheet). O destino "ver tudo" reusa o `ConfigDialog` existente (rola até `#changelog-section`).

**Tech Stack:** Next.js 16 (App Router), React 19, TypeScript, Tailwind v4, shadcn/ui base-vega
(`@base-ui/react` via `@/components/ui/*`), tabler icons, Hono API route coexistente.

> Nota: já existe `features/service-worker/components/update-banner.tsx` (SW reload). Esta feature é
> **complementar**: mostra changelog + leva ao config. Não alterar o `UpdateBanner` existente.

---

## Tarefas

- [ ] **T1 — Utilitários de versão** `lib/release-notes/version.ts`
  - `getAppVersion()`: retorna `process.env.NEXT_PUBLIC_APP_VERSION ?? "0.0.0"` (setado no build via
    `next.config.mjs` lendo `package.json`, ou import estático de `package.json`).
  - `compareSemver(a: string, b: string): number` (parse numérico major.minor.patch, ignora prerelease).
  - `getLastSeenVersion(): string` / `setLastSeenVersion(v: string): void` com try/catch em
    `localStorage` (chave `openbible:last-seen-version`); SSR-safe (typeof window guard).

- [ ] **T2 — Parser de changelog** `lib/release-notes/changelog.ts`
  - Importar `CHANGELOG.md` como raw string (use `??raw` do webpack ou `fs` em build; em App Router
    client, embutir via `import changelogSrc from "@/CHANGELOG.md?raw"` — Next webpack suporta `?raw`).
  - `parseLatestEntry(src): { version, date, sections: {Added?, Changed?, Fixed?} }` — regex para
    `## [x.y.z] - data` e captura blocos `### Added/Changed/Fixed`.
  - `summarizeLatest(src): string[]` → lista de bullet points (primeiras N linhas de cada seção).
  - Fallback: retorna `{ version: getAppVersion(), sections: {} }` se parse falhar.

- [ ] **T3 — Endpoint de versão** `app/api/version/route.ts`
  - Hono ou Route Handler simples (`export async function GET()`). Retorna
    `Response.json({ version: <package.json version>, changelogUrl: "/changelog" })`.
  - Coexiste com `app/api/[[...route]]/route.ts` (caminho `/api/version` não conflita com catch-all de
    bíblias). Confirmar ordem de matching no `next.config`/hono; se houver conflito, usar
    `app/api/version/route.ts` (mais específico ganha).

- [ ] **T4 — Provider** `features/release-notes/components/release-notes-provider.tsx` (`"use client"`)
  - Context: `{ hasUpdate, latestVersion, summary, open(opts?), dismiss() }`.
  - `useEffect` no mount:
    1. `appVersion = getAppVersion()`
    2. `remote = await fetch('/api/version').then(r=>r.json()).catch(()=>null)` (best-effort)
    3. `latest = remote?.version && compareSemver(remote.version, appVersion) > 0 ? remote.version : appVersion`
    4. `lastSeen = getLastSeenVersion()`
    5. se `compareSemver(latest, lastSeen) > 0` → `setHasUpdate(true)`, `setLatestVersion(latest)`,
       `setSummary(summarizeLatest(changelogSrc))`, abre pop-up.
  - `dismiss()` → `setLastSeenVersion(latest)` + `setHasUpdate(false)`.
  - `open({focus?:'changelog'})` → dispara evento/callback para `ConfigButton` abrir `ConfigDialog`
    (via context compartilhado ou `customEvent`). **Simpler:** provider renderiza o `ConfigButton`?
    Não — reusar o `ConfigButton` existente. Solução: provider expõe `requestOpenConfig(focus)` que o
    `app/layout` conecta ao `ConfigDialog`. Ver T6.

- [ ] **T5 — Pop-up** `features/release-notes/components/release-notes-toast.tsx` (`"use client"`)
  - Usa `useReleaseNotes()` do provider.
  - Desktop (md+): `fixed bottom-4 right-4 z-[90] w-80` Card com:
    - Header: `IconSparkles` + "Nova versão v{latestVersion} disponível"
    - Body: resumo do changelog (lista `summary`, máx 4 itens, `line-clamp-3` por item)
    - Actions: `[Atualizar]` (primary, abre config), `[Ver tudo]` (outline, abre config + scroll
      changelog), `[Agora não]` (ghost, dismiss)
  - Mobile: `fixed inset-x-0 bottom-0 z-[90] rounded-t-2xl` sheet equivalente.
  - Respeita `next-themes` (usa `bg-popover`, `text-popover-foreground`, `border-border` como o
    `UpdateBanner` existente). Animação de entrada (Tailwind `animate-in slide-in-from-bottom`).
  - `useEffect` para auto-dismiss opcional? Não — mantém até ação do usuário (per spec).

- [ ] **T6 — Integração layout/Config**
  - `app/layout.tsx`: envolver `children` (dentro de `TooltipProvider`, antes de `OpfsStatusGate`) com
    `<ReleaseNotesProvider>` e renderizar `<ReleaseNotesToast />` + conectar abertura do `ConfigDialog`.
    Como o `ConfigDialog` é controlado pelo `ConfigButton` local, a integração "abrir config" precisa de
    um listener global. **Abordagem:** `ReleaseNotesProvider` dispara `CustomEvent('open-config',
    {detail:{focus}})`; um `ConfigOpenerBridge` (montado no layout) escuta e controla um `ConfigDialog`
    compartilhado. **OU** mais simples e sem refactoring arriscado: o pop-up renderiza seu próprio
    `ConfigDialog` controlado localmente (reusa o componente `ConfigDialog` + `ConfigContent` já
    existentes). **Escolha:** pop-up controla seu próprio `ConfigDialog` (isolado, sem acoplar ao
    `ConfigButton` existente). `ConfigContent` já tem `#changelog-section` (T7) para scroll.
  - `features/release-notes/components/release-notes-toast.tsx`: manter estado `configOpen` +
    `configFocus`; render `<ConfigDialog open={configOpen} onOpenChange={...} focus={configFocus} />`.
  - `features/config/components/config-dialog.tsx`: aceitar prop opcional `focus?: 'changelog'`; ao
    abrir com `focus==='changelog'`, `useEffect` rola `document.getElementById('changelog-section')
    ?.scrollIntoView()` após mount do `ConfigContent`.

- [ ] **T7 — Seção de novidades no Config**
  - `features/config/components/config-content.tsx`: adicionar `<section id="changelog-section">` com
    título "Novidades" e renderizar o changelog completo da versão atual (usa `summarizeLatest` /
    `parseLatestEntry` de `lib/release-notes/changelog.ts`). Estilizar com Card/Accordion shadcn.

- [ ] **T8 — Build wiring da versão**
  - `next.config.mjs`: definir `env: { NEXT_PUBLIC_APP_VERSION: pkg.version }` lendo `package.json`
    (já é feito em algum ponto? confirmar; se não, adicionar). Isso evita import de `package.json` em
    client (que quebraria bundling).

- [ ] **T9 — Verificação**
  - `pnpm install` na worktree (checar `git diff --stat pnpm-lock.yaml` — reverter se só reformatação).
  - `pnpm lint` → 0 erros (warnings existentes ok).
  - `pnpm build` → passa (ignora TS, mas deve compilar).
  - Smoke manual: `pnpm dev`, forçar `localStorage` `openbible:last-seen-version` = versão anterior →
    recarregar → pop-up aparece; clicar "Ver tudo" → config rola até Novidades; "Agora não" → some e não
    reaparece na mesma versão.
  - **CRÍTICO pós-build:** `git diff --stat HEAD` — se `public/sw.js` mudou (auto-gerado pelo PWA),
    reverter: `git checkout HEAD -- public/sw.js`.

- [ ] **T10 — Commits & PR**
  - Commit semântico: `feat(release-notes): add new version popup with changelog summary`
  - Push: `git push -u origin feat/184-release-notes-popup`
  - PR: `gh pr create --base develop --title "feat: add release notes / new version popup" --body "Closes #184"`
  - NÃO usar `--no-verify`.

## Mapa de arquivos
| Arquivo | Ação | Responsabilidade |
|---------|------|------------------|
| `lib/release-notes/version.ts` | criar | semver + localStorage last-seen |
| `lib/release-notes/changelog.ts` | criar | parse/summary do CHANGELOG.md |
| `app/api/version/route.ts` | criar | endpoint de versão (best-effort) |
| `features/release-notes/components/release-notes-provider.tsx` | criar | contexto + detecção |
| `features/release-notes/components/release-notes-toast.tsx` | criar | pop-up UI + ConfigDialog local |
| `features/config/components/config-dialog.tsx` | modificar | prop `focus` + scroll |
| `features/config/components/config-content.tsx` | modificar | seção `#changelog-section` |
| `app/layout.tsx` | modificar | envolver provider + toast |
| `next.config.mjs` | modificar | `NEXT_PUBLIC_APP_VERSION` |

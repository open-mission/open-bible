# Backlog: Corrigir build do Tauri

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0001 |
| Status | Promoted |
| Produto | Open Bible Desktop |
| Épico | Confiabilidade do build e release desktop |
| Funcionalidade | Build Tauri reprodutível (Linux local + CI) |
| Tipo | Técnico |
| Prioridade | Alta |
| Milestones | |
| Criado em | 2026-08-23 |
| Spec promovida | specs/draft/0001-corrigir-build-do-tauri/spec.md |

## Ideia original

precisamos corrigir o build do tauri

## Problema percebido

Build do Tauri falha na etapa após o export web (pnpm build:tauri passa, mas pnpm desktop:build / cargo/tauri bundling falha) — erro exato pendente de reprodução local em Linux/WebKitGTK.

## Pessoa afetada ou beneficiada

Desenvolvedores mantenedores validando localmente e usuário final do app desktop (app precisa abrir sem tela branca e funcionar offline/online).

## Resultado ou valor esperado

Fluxo reprodutível localmente em Linux: pnpm build:tauri gera out/ com sqlite-wasm/jswasm e index.html, pnpm desktop:build/cargo completa sem erro, app abre sem tela branca, navegação offline (worker SQLite/OPFS) e CSP/connect-src para API remota validados, e configuração pronta para CI cross-platform (tauri-action) sem stash residual.

## Contexto

Desktop Tauri v2 com Next.js 16 output:export condicional (TAURI_BUILD=1), scripts/build-tauri.mjs (stash de app/api, copy:wasm, next build --webpack), src-tauri/tauri.conf.json (frontendDist ../out, beforeBuildCommand pnpm build:tauri, CSP wasm-unsafe-eval). Validação focada em Linux/WebKitGTK e preparo para matriz CI macOS/Linux/Windows.

## Referências relacionadas

- `specs/inbox/2026-08-22-235241-corrigir-build-do-tauri.md` — origem (declaração integral: "precisamos corrigir o build do tauri") — relação: inbox origem
- `docs/plans/2026-07-02-tauri-desktop.md` — plano original Tauri (output export condicional, scripts/build-tauri.mjs, frontendDist) — documentação relacionada
- `docs/plans/2026-07-02-desktop-release-fix.md` — pipeline de assets copy:wasm/out/sqlite-wasm — documentação relacionada
- `scripts/build-tauri.mjs` — stash de app/api, TAURI_BUILD=1, copy:wasm, next build — referência técnica
- `next.config.mjs` — branch isTauri ? output:"export" : withPWA, sourcemaps.disable — referência técnica
- `src-tauri/tauri.conf.json` — beforeBuildCommand pnpm build:tauri, CSP wasm-unsafe-eval/connect-src, bundle targets — referência técnica
- `package.json` — scripts build:tauri/desktop:dev/desktop:build, @tauri-apps/cli — referência técnica

## Comportamento esperado

- Dado `TAURI_BUILD=1`, `scripts/build-tauri.mjs` move `app/api` para `.tauri-build-stash`, roda `copy:wasm` e `next build --webpack` com `output: export`, gera `out/` com `index.html` e `sqlite-wasm/jswasm/` (sqlite3.wasm + worker), e restaura `app/api` ao final inclusive em caso de erro.
- Em seguida `pnpm desktop:build` / `cargo build` compila o bundle Tauri a partir de `frontendDist: ../out` sem erro de Rust/bundling/ícones.
- Ao abrir o app desktop em Linux/WebKitGTK: sem tela branca, worker SQLite carrega (`public/sqlite-wasm/open-bible.worker.js` presente em `out/sqlite-wasm/`), OPFS acessível, navegação entre livros/capítulos funciona offline, e chamadas à API remota (`https://openbible-prod.vercel.app`) não são bloqueadas por CSP.
- Após qualquer execução (sucesso ou falha interrompida), `.tauri-build-stash` é limpo e `app/api` restaurado, não deixando a árvore sem rotas para o build web/Vercel.

## Regras de negócio

- Build desktop não pode alterar o deploy web: `app/api` deve estar presente fora do modo Tauri; stash/restauração deve ser transacional (finally).
- `copy:wasm` deve rodar antes do `next build` quando `TAURI_BUILD=1`, pois prebuild não é executado via `next build` direto.
- `next.config.mjs` deve manter `withPWA` desabilitado apenas em `isTauri`; headers de SW/manifest não são emitidos em export.
- CSP deve permitir `script-src 'wasm-unsafe-eval'` e `connect-src https://openbible-prod.vercel.app`; demais diretivas mantidas.
- Versão do app deve permanecer sincronizada em `package.json`, `src-tauri/tauri.conf.json` e `src-tauri/Cargo.toml` (via `scripts/release.mjs`).

## Critérios de aceitação

- Scenario: Export web para Tauri gera assets completos
  Given `TAURI_BUILD=1` e toolchain Node/pnpm instalada
  When executa `pnpm build:tauri`
  Then `out/index.html` existe e `out/sqlite-wasm/jswasm/` contém `sqlite3.wasm` e worker, sem erro no log, e `app/api` foi restaurado

- Scenario: Bundle Tauri compila em Linux
  Given `out/` válido gerado
  When executa `pnpm desktop:build` (ou `cargo check`/`tauri build` equivalente)
  Then a compilação Rust/bundling completa sem erro e artefato ou validação de bundle é produzida (ou check passa) em ambiente Linux com WebKitGTK

- Scenario: App abre sem tela branca e funciona offline
  Given app desktop instalado/executado via `tauri dev` ou bundle local
  When abre a janela principal
  Then conteúdo renderiza (sem blank screen), navegação entre livros/capítulos funciona, worker SQLite não retorna 404 e OPFS opera

- Scenario: Rede e CSP não bloqueiam API remota
  Given app em modo Tauri
  When realiza fetch a `https://openbible-prod.vercel.app/api/*`
  Then requisição não é bloqueada por CSP (`connect-src`) e retorna sem erro de CORS/CSP no console

- Scenario: Estabilidade da árvore após falha interrompida
  Given uma execução anterior de `build-tauri.mjs` foi interrompida com stash pendente
  When inicia novo `pnpm build:tauri`
  Then script detecta `!existsSync(app/api) && existsSync(STASHED_API)` e restaura automaticamente antes de prosseguir, finalizando com `.tauri-build-stash` limpo

## Qualidades e operação

- Segurança: CSP restritiva mantida; `wasm-unsafe-eval` apenas para sqlite-wasm; sem expor `TURSO_*` no bundle desktop (usa API remota via `NEXT_PUBLIC_API_ORIGIN`).
- Privacidade: nenhuma coleta adicional; app desktop reutiliza mesma origem de API remota.
- Desempenho e volume: export estático deve incluir assets já otimizados; `config.cache=false` em produção mantido; sem cache Workbox para `/api/bibles/download/` (já NetworkOnly no web).
- Auditoria e observabilidade: logs `[build-tauri]` para move/restauração/stash-rescue; erro de build deve sair com stack e código não-zero; Sentry sourcemaps desabilitados em `isTauri`.
- Confiabilidade: build reprodutível localmente e pronto para matriz CI `tauri-action` (macOS/Linux/Windows) sem exigir mudanças adicionais nos scripts.

## Dependências

- Node.js 22 + pnpm 10.22.0
- Rust toolchain + `@tauri-apps/cli` 2.x
- WebKitGTK e dependências de sistema para `tauri dev/build` em Linux
- `src-tauri/tauri.conf.json` com `frontendDist ../out` e ícones em `src-tauri/icons/`
- `resources/bibles/ARA.sqlite` opcional para seed (não bloqueia build se ausente)

## Situações de erro

- `sqlite-wasm/dist` ausente → `copy:wasm` falha com "run pnpm install first" (não deve gerar `out` parcial).
- `app/api` ausente por execução interrompida → rescue no início de `build-tauri.mjs` restaura de `.tauri-build-stash`.
- `public/sqlite-wasm` não copiado → worker 404 em runtime → tela branca; mitigado por `copy:wasm` antes do build.
- CSP bloqueando `wasm-unsafe-eval` ou `connect-src` → worker ou fetch falham; corrigir `tauri.conf.json` `app.security.csp`.
- Versão divergente entre `package.json`/`tauri.conf.json`/`Cargo.toml` → bundle com versão errada; corrigir via `pnpm release`.

## Escopo

- Dentro: corrigir `scripts/build-tauri.mjs`, `next.config.mjs`, `src-tauri/tauri.conf.json` e `scripts/copy-sqlite-wasm.mjs` se necessário para que `pnpm build:tauri` + `pnpm desktop:build` passem em Linux e fiquem prontos para CI cross-platform; testar fluxo localmente (export + bundle + abertura do app + OPFS/CSP).
- Fora: novas features desktop (updater, menu nativo, título overlay, ícones novos), refatoração ampla de `src-tauri/src/` (salvo causa raiz), e mudanças no deploy web/Vercel além da preservação de `app/api`.

## Dúvidas, decisões e riscos

- Decisão confirmada: falha presumida na etapa 2 (tauri/cargo após export) — precisa confirmação via reprodução local; backlog mantém inferência como hipótese, não declaração do usuário.
- Decisão confirmada: atores = devs mantenedores (validação local) + usuário final desktop (app funcional).
- Decisão confirmada: critério completo do item 3 da Pergunta 4 (out + bundle + runtime + CSP + estabilidade).
- Risco: erro exato ainda não reproduzido localmente; causa pode ser toolchain Rust/WebKitGTK ausente, `tauri.conf.json` desatualizado, ou `copy:wasm` incompleto — mitigado por testar fluxo localmente antes de alterar código.
- Risco: diferença entre ambiente Linux local e runners CI (macOS/Windows) pode exigir ajustes adicionais de `bundle.targets` ou `tauri-action` fora deste escopo inicial.

## Pronto para desenvolvimento

- [x] O problema e a pessoa beneficiada estão claros.
- [x] O evento inicial e o resultado esperado estão claros.
- [x] Permissões, regras e exceções relevantes estão claras.
- [x] O resultado pode ser verificado objetivamente.
- [x] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [x] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Aprofundar nesta etapa até o item ficar pronto para `$specsfy-03-specify`.

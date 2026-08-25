# Backlog: Migrar desktop de Tauri para Electron

| Metainformação | Valor |
| --- | --- |
| ID | BACKLOG-0003 |
| Status | Ready for specification |
| Produto | Open Bible |
| Épico | Aplicativo desktop multiplataforma |
| Funcionalidade | Shell desktop Electron |
| Tipo | Técnico |
| Prioridade | Não priorizado |
| Milestones | |
| Criado em | 2026-08-24 |
| Spec promovida | Nenhuma |

## Ideia original

seguindo o fluxo do specsfy vamos trabalhar na migracao do tauri para o electron na @apps/desktop-tauri/

## Problema percebido

O shell Tauri gera falhas de build e distribuição do aplicativo desktop, aumentando o custo de manutenção e dificultando entregas confiáveis.

## Pessoa afetada ou beneficiada

Mantenedores que constroem e distribuem o aplicativo desktop e pessoas que usam a versão desktop.

## Resultado ou valor esperado

Uma versão Electron do aplicativo desktop pode ser construída e distribuída de forma reproduzível, preservando os comportamentos desktop essenciais da versão Tauri.

## Contexto

Entrega posterior à fundação do monorepo. O código atual está em apps/desktop-tauri e usa um export estático de apps/web; a migração precisa substituir o shell Tauri sem duplicar regras de negócio nem quebrar leitura offline, OPFS/SQLite, API remota, menu, atualização e distribuição, salvo decisões explícitas de escopo.

## Referências relacionadas

- `specs/inbox/2026-08-24-142349-migrar-desktop-de-tauri-para-electron.md` — inbox de origem.
- `specs/inbox/2026-08-23-143301-arquitetura-multiplataforma-com-monorepo.md` — direção anterior de substituir Tauri por Electron.
- `specs/backlog/0002-fundacao-monorepo-multiplataforma.md` — precedente: monorepo e Tauri legado preparado para substituição posterior.
- `specs/completed/0002-fundacao-monorepo-multiplataforma/spec.md` — spec entregue: boundaries compartilhados e localização do Tauri legado.
- `specs/completed/0001-corrigir-build-do-tauri/spec.md` — comportamento desktop atual que deve ser preservado durante a transição.
- `docs/specs/2026-07-02-tauri-desktop-design.md` — arquitetura e restrições do shell desktop atual.
- `.github/workflows/desktop-release.yml` — matriz atual de build e distribuição desktop.

## Comportamento esperado

- Electron será desenvolvido e validado em paralelo ao Tauri.
- Tauri permanecerá disponível como fallback até que a paridade necessária seja validada.
- A migração não deve duplicar regras de negócio nem alterar o comportamento Web.
- A primeira entrega Electron deve contemplar Linux, macOS e Windows.
- A paridade mínima inclui build/dev, leitura offline com SQLite/OPFS, API remota, menu nativo, abertura de Configurações, updater, relaunch, versionamento e distribuição nos três sistemas.
- A atualização automática deve usar `electron-builder` e `electron-updater`, com artefatos assinados, canais stable/beta e publicação nas releases do GitHub.
- O renderer Electron deve operar com `contextIsolation` e sandbox habilitados, `nodeIntegration` desabilitado e uma API preload mínima protegida por allowlist de IPC.
- A persistência local deve permanecer em SQLite WASM + OPFS no renderer, sem migrar o banco para o processo principal nesta entrega.
- A Web deve continuar funcionando sem depender de Electron, Tauri ou APIs Node no bundle do navegador.

## Regras de negócio

- Regras de leitura, busca, instalação de Bíblias, notas e destaques permanecem nos pacotes compartilhados ou na aplicação Web; o shell Electron não pode duplicá-las.
- O desktop usa a API remota configurada para operações server-side e não expõe segredos `TURSO_*` no renderer ou nos artefatos distribuídos.
- O updater só instala artefatos cuja assinatura e canal sejam válidos; falha de atualização não pode impedir o uso da versão atualmente instalada.
- O fallback Tauri não é removido enquanto todos os critérios de paridade e rollback não forem comprovados.

## Critérios de aceitação

- Scenario: Iniciar o Electron em desenvolvimento
  Given o workspace Web e o shell Electron instalados
  When a pessoa executa o comando de desenvolvimento desktop
  Then o Electron inicia uma janela com o app Web e o fluxo de navegação funciona sem Tauri

- Scenario: Construir os três targets desktop
  Given a branch possui lockfile e configuração de build válidos
  When o pipeline executa os builds Electron para Linux, macOS e Windows
  Then cada target gera o artefato esperado sem depender do Rust/Tauri

- Scenario: Ler uma Bíblia instalada offline
  Given uma Bíblia está instalada localmente
  And a aplicação Electron está sem conexão de rede
  When a pessoa abre um livro e capítulo
  Then os versículos são carregados pelo SQLite WASM + OPFS sem tela branca ou erro de IPC

- Scenario: Usar a API remota quando necessário
  Given a aplicação Electron está online
  When uma operação depende de API server-side
  Then ela usa a origem remota configurada e não expõe credenciais server-side no renderer

- Scenario: Abrir Configurações pelo menu nativo
  Given a aplicação Electron está aberta
  When a pessoa seleciona Configurações no menu nativo
  Then a rota ou superfície de Configurações é aberta sem importar APIs Tauri

- Scenario: Atualizar por canal assinado
  Given existe uma release assinada no canal selecionado
  When a pessoa verifica atualizações
  Then o Electron identifica a versão compatível, exibe progresso, instala o artefato assinado e permite relaunch

- Scenario: Falha no updater
  Given o servidor de releases está indisponível ou a assinatura é inválida
  When a pessoa verifica atualizações
  Then a falha é apresentada de forma recuperável e a versão instalada continua utilizável

- Scenario: Retirar o fallback somente após validação
  Given CI e smoke tests passaram em Linux, macOS e Windows
  And leitura offline, OPFS, menu, Configurações, updater e instalação foram validados
  When a release Electron é promovida
  Then a última release Tauri permanece disponível como rollback até a confirmação operacional da nova release

- Scenario: Preservar a Web
  Given a aplicação é executada como Web/PWA
  When a pessoa usa leitura, busca, instalação e navegação existentes
  Then o comportamento Web permanece funcional sem carregar Electron, Tauri ou Node

## Qualidades e operação

- Segurança: a avaliar.
- Segurança: `contextIsolation` e sandbox habilitados, `nodeIntegration` desabilitado, IPC allowlist e artefatos assinados; nenhum segredo server-side no renderer.
- Privacidade: nenhum dado novo coletado; o banco local permanece no dispositivo e a API remota mantém a origem existente.
- Desempenho e volume: o renderer deve iniciar sem tela branca e o acesso offline deve manter o comportamento atual; medir startup e carregamento de capítulo contra o baseline Tauri durante a validação.
- Auditoria e observabilidade: registrar resultado de build, assinatura, canal, versão, falha de updater e rollback sem registrar segredos.

## Dependências

- `apps/web` e seu export estático para o shell desktop.
- `packages/contracts`, `packages/domain-bible`, `packages/application-bible` e `packages/adapters-web` como fronteiras compartilhadas.
- GitHub Releases, credenciais de assinatura e pipeline multiplataforma.
- Toolchain Electron (`electron`, `electron-builder`, `electron-updater`) a definir na especificação técnica.
- Estratégia atual de SQLite WASM + OPFS e assets copiados por `scripts/copy-sqlite-wasm.mjs`.

## Situações de erro

- Build ou empacotamento falha em um target: o pipeline deve falhar sem publicar artefato parcial.
- Assets estáticos ou SQLite WASM não são encontrados: o build deve falhar com diagnóstico explícito, sem entregar tela branca.
- IPC não autorizado ou payload inválido: a chamada deve ser rejeitada sem executar operação nativa.
- OPFS indisponível: a aplicação deve apresentar o estado de indisponibilidade e manter o fallback Tauri disponível durante a transição.
- API remota indisponível: operações dependentes devem exibir erro recuperável sem afetar a leitura local.
- Update indisponível, canal incompatível ou assinatura inválida: não instalar e manter a versão atual utilizável.

## Escopo

- Dentro: substituir o shell Tauri por um shell Electron faseado em `apps/desktop-tauri/`; adaptar scripts, dependências, runtime detection, menu, Configurações, updater, build, assinatura, distribuição e CI; criar testes de boundary e smoke tests; manter Tauri como fallback até o gate de saída.
- Fora: novas funcionalidades de leitura, busca, notas ou destaques; mudança de schema/ownership do banco; criação da TUI/OpenTUI; nova UI nativa fora do renderer Web; redesign da API Web; remoção antecipada do fallback Tauri.

## Dúvidas, decisões e riscos

- Decisão confirmada: a migração será faseada; Electron coexistirá com Tauri durante a transição.
- Decisão confirmada: a primeira entrega Electron terá suporte a Linux, macOS e Windows.
- Decisão confirmada: a transição exige paridade completa dos comportamentos desktop atuais antes de retirar o fallback Tauri.
- Decisão confirmada: atualizações automáticas usarão `electron-builder` + `electron-updater`, artefatos assinados e canais stable/beta nas releases do GitHub.
- Decisão confirmada: a fronteira Electron seguirá configuração segura por padrão, com IPC mínimo e allowlist no preload.
- Decisão confirmada: a persistência local continuará em SQLite WASM + OPFS no renderer, sem mudança de schema ou ownership nesta migração.
- Decisão confirmada: o fallback Tauri só será retirado após CI e smoke tests nos três sistemas, com rollback pela última release Tauri.
- Risco: APIs específicas de Tauri estão espalhadas pelo renderer e pelo updater; mitigação: mapear imports e criar adapter desktop antes de remover dependências.
- Risco: diferenças de permissões e secure context entre Electron e Tauri podem afetar OPFS; mitigação: validar em cada target e preservar a mensagem de indisponibilidade.
- Risco: assinatura e publicação multiplataforma podem falhar no CI; mitigação: validar artefatos imutáveis e canais antes de promover releases.

## Pronto para desenvolvimento

- [ ] O problema e a pessoa beneficiada estão claros.
- [ ] O evento inicial e o resultado esperado estão claros.
- [ ] Permissões, regras e exceções relevantes estão claras.
- [ ] O resultado pode ser verificado objetivamente.
- [ ] Segurança, privacidade e desempenho foram avaliados conforme o risco.
- [ ] Fora de escopo, dependências e decisões pendentes estão registrados.

## Próximo passo

Aprofundar nesta etapa até o item ficar pronto para `$specsfy-03-specify`.

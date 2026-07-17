![Open Bible](public/hero.svg)

<p align="center">
  <h1 align="center"><b>Open Bible</b></h1>
  <p align="center">
    A Bíblia Sagrada offline-first para a web e desktop
    <br />
    <a href="https://openbible-prod.vercel.app"><strong>🌐 Abrir App »</strong></a>
    <br />
    <br />
    <a href="https://github.com/open-mission/open-bible/issues">Reportar Bug</a>
    ·
    <a href="https://github.com/open-mission/open-bible/issues">Solicitar Funcionalidade</a>
    ·
    <a href="CONTRIBUTING.md">Contribuir</a>
  </p>
</p>

<p align="center">
  <a href="https://github.com/open-mission/open-bible/releases">
    <img src="https://img.shields.io/github/v/release/open-mission/open-bible?style=for-the-badge&logo=github&color=5c6bc0" alt="Version" />
  </a>
  <a href="LICENSE">
    <img src="https://img.shields.io/github/license/open-mission/open-bible?style=for-the-badge&color=26c6da" alt="License" />
  </a>
  <a href="https://nextjs.org">
    <img src="https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js" alt="Next.js" />
  </a>
  <a href="https://openbible-prod.vercel.app">
    <img src="https://img.shields.io/badge/PWA-Offline--First-5c6bc0?style=for-the-badge&logo=pwa" alt="PWA" />
  </a>
  <img src="https://img.shields.io/github/last-commit/open-mission/open-bible/develop?style=for-the-badge&label=updated" alt="Last Commit" />
</p>

<p align="center">
  <a href="README.md">🇺🇸 English</a>
</p>

---

## ✨ Funcionalidades

- 📖 **18 versões da Bíblia** em Português disponíveis para download e uso offline
- ⚡ **Offline-First** — SQLite WASM rodando direto no navegador via OPFS
- 📝 **Notas e anotações** salvas localmente por versículo
- 🌙 **Tema escuro/claro** com 15 cores de destaque personalizáveis
- 📱 **PWA instalável** — funciona como app nativo no iOS e Android

### Em Breve 🚀

- 🔍 **Busca avançada** por palavra ou trecho em qualquer versão
- 🎨 **Highlights e marcações** com cores personalizáveis

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **UI** | [shadcn/ui](https://ui.shadcn.com) + [Tailwind CSS v4](https://tailwindcss.com) |
| **DB** | SQLite WASM + OPFS + [Drizzle ORM](https://orm.drizzle.team) |
| **Deploy** | [Vercel](https://vercel.com) |

---

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org) ≥ 20
- [pnpm](https://pnpm.io) ≥ 9

### Instalação

```bash
git clone git@github.com:open-mission/open-bible.git
cd open-bible
pnpm install
cp .env.local.example .env.local
pnpm dev
```

> O script `predev` copia automaticamente os assets do SQLite WASM para `public/`.

---

## 📋 Scripts

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Servidor de desenvolvimento (porta 3000) |
| `pnpm build` | Build de produção |
| `pnpm commit` | Criar commit semântico interativo |
| `pnpm release` | Criar release com bump de versão |
| `pnpm desktop:dev` | App desktop (Tauri) em modo dev |
| `pnpm desktop:build` | Build de produção do app desktop |

---

## 🖥️ Desktop (Tauri)

O Open Bible também roda como app nativo (macOS, Linux e Windows) via [Tauri v2](https://tauri.app),
reutilizando o mesmo frontend Next.js (static export) e a pilha de leitura offline SQLite WASM + OPFS.
As rotas `/api/*` não entram no bundle desktop — o download de versões aponta para a API remota.

### Pré-requisitos

- [Rust](https://www.rust-lang.org/tools/install) (toolchain estável)
- Dependências de sistema por SO:
  - **macOS** — Xcode Command Line Tools (`xcode-select --install`)
  - **Linux** — `libwebkit2gtk-4.1-dev libappindicator3-dev librsvg2-dev patchelf`
  - **Windows** — [Microsoft C++ Build Tools](https://visualstudio.microsoft.com/visual-cpp-build-tools/) + WebView2

### Desenvolvimento

```bash
pnpm desktop:dev     # abre a janela nativa apontando para o dev server (porta 3000)
pnpm desktop:build   # gera o instalador em src-tauri/target/release/bundle/
```

### Release

Um push de tag `v*` dispara o workflow [`desktop-release.yml`](.github/workflows/desktop-release.yml),
que compila os três SO em paralelo e anexa os instaladores a um **GitHub Release em rascunho** para
revisão antes de publicar.

> ⚠️ **Builds não-assinados.** Os instaladores atuais não têm assinatura de código. No **macOS**,
> contorne o Gatekeeper com clique direito → *Abrir* (ou
> `xattr -dr com.apple.quarantine "Open Bible.app"`). No **Windows**, no aviso do SmartScreen use
> *Mais informações* → *Executar assim mesmo*.

---

## 🌿 Commits e Branches

Este projeto usa **[Conventional Commits](https://www.conventionalcommits.org/)** com validação automática via `commitlint` e `husky`.

### Commits Semânticos

```bash
feat(reader): add font size adjustment
fix(ios): prevent keyboard from hiding input
docs: update API documentation
chore(deps): upgrade Next.js to 16.3
```

Use `pnpm commit` para um guia interativo.

### Branches

```
main          ← produção (deploy automático via Vercel)
 └── develop  ← integração (base para PRs)
       └── feat/nome-da-feature
       └── fix/nome-do-bug
       └── improve/nome-da-melhoria
```

### Fluxo de Trabalho

1. **Crie uma issue** usando o template adequado
2. **Crie uma branch** a partir de `develop`:
   - `feat/{nr}-desc` para features
   - `fix/{nr}-desc` para bugs
   - `improve/{nr}-desc` para melhorias
3. **Desenvolva** com commits semânticos
4. **Abra um PR** referenciando a issue: `Closes #nr`
5. **Merge** após review → Issue é fechada automaticamente

> Veja o [CONTRIBUTING.md](CONTRIBUTING.md) para o guia completo.

---

## 📜 Licença

Distribuído sob a [licença MIT](LICENSE). Consulte o arquivo `LICENSE` para mais detalhes.

---

<div align="center">

Feito com ❤️ para a missão — [open-mission](https://github.com/open-mission)

</div>

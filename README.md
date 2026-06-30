<div align="center">

<img src="public/icons/icon-192x192.png" alt="Open Bible Logo" width="96" height="96" />

# Open Bible

**Bíblia Sagrada offline-first para a web e dispositivos móveis**

[![Version](https://img.shields.io/github/v/release/open-mission/open-bible?style=for-the-badge&logo=github&color=5c6bc0)](https://github.com/open-mission/open-bible/releases)
[![License](https://img.shields.io/github/license/open-mission/open-bible?style=for-the-badge&color=26c6da)](LICENSE)
[![Next.js](https://img.shields.io/badge/Next.js-16-black?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.7-3178c6?style=for-the-badge&logo=typescript)](https://www.typescriptlang.org)
[![PWA](https://img.shields.io/badge/PWA-Offline--First-5c6bc0?style=for-the-badge&logo=pwa)](https://web.dev/progressive-web-apps/)
[![Conventional Commits](https://img.shields.io/badge/commits-conventional-fe5196?style=for-the-badge&logo=conventionalcommits)](https://www.conventionalcommits.org)

[**🌐 Abrir App**](https://open-bible.vercel.app) · [**📖 API Docs**](https://open-bible.vercel.app/api/docs) · [**🐛 Reportar Bug**](https://github.com/open-mission/open-bible/issues/new?template=bug_report.md) · [**✨ Sugerir Feature**](https://github.com/open-mission/open-bible/issues/new?template=feature_request.md)

</div>

---

## ✨ Funcionalidades

- 📖 **18 versões da Bíblia** em Português disponíveis para download e uso offline
- ⚡ **Offline-First** — SQLite WASM rodando direto no navegador via OPFS
- 🔍 **Busca** por palavra ou trecho em qualquer versão instalada
- 📝 **Notas e anotações** salvas localmente por versículo
- 🌙 **Tema escuro/claro** com 15 cores de destaque personalizáveis
- 📱 **PWA instalável** — funciona como app nativo no iOS e Android
- 🔒 **Autenticação** com sessões persistentes (Better Auth)
- 🌐 **API REST** documentada com OpenAPI / Scalar

---

## 🛠️ Stack

| Camada | Tecnologia |
|--------|-----------|
| **Framework** | [Next.js 16](https://nextjs.org) (App Router) |
| **Linguagem** | TypeScript 5.7 |
| **UI** | [shadcn/ui](https://ui.shadcn.com) (base-nova) + Tailwind CSS v4 |
| **DB Cliente** | SQLite WASM + OPFS + [Drizzle ORM](https://orm.drizzle.team) |
| **DB Servidor** | [TursoDB](https://turso.tech) (libSQL) |
| **API** | [Hono](https://hono.dev) + [Zod OpenAPI](https://github.com/honojs/zod-openapi) |
| **Auth** | [Better Auth](https://www.better-auth.com) |
| **Deploy** | [Vercel](https://vercel.com) |
| **PWA** | [@ducanh2912/next-pwa](https://github.com/DuCanhGH/next-pwa) + Workbox |

---

## 🚀 Começando

### Pré-requisitos

- [Node.js](https://nodejs.org) ≥ 20
- [pnpm](https://pnpm.io) ≥ 9

### Instalação

```bash
# Clone o repositório
git clone git@github.com:open-mission/open-bible.git
cd open-bible

# Instale as dependências (também instala git hooks via Husky)
pnpm install

# Configure as variáveis de ambiente
cp .env.local.example .env.local
```

### Variáveis de Ambiente

```env
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
BETTER_AUTH_SECRET=...          # mínimo 32 caracteres
BETTER_AUTH_URL=http://localhost:3000
CLOUDFLARE_BUCKET_PUBLIC_URL=...
```

### Desenvolvimento

```bash
pnpm dev      # inicia o servidor em http://localhost:3000
```

> O script `predev` copia automaticamente os assets do SQLite WASM para `public/`.

---

## 📋 Scripts Disponíveis

| Script | Descrição |
|--------|-----------|
| `pnpm dev` | Servidor de desenvolvimento (porta 3000) |
| `pnpm build` | Build de produção |
| `pnpm start` | Servidor de produção |
| `pnpm commit` | Criar commit semântico interativo (Commitizen) |
| `pnpm release` | Criar um novo release com bump de versão |
| `pnpm release patch` | Bump de patch (0.0.X) |
| `pnpm release minor` | Bump de minor (0.X.0) |
| `pnpm release major` | Bump de major (X.0.0) |
| `pnpm copy:wasm` | Copia assets SQLite WASM para `public/` |
| `pnpm build:data` | Exporta SQLite → JSON (fallback) |
| `pnpm db:init` | Cria tabelas no TursoDB |
| `pnpm db:import` | Importa 18 arquivos SQLite no TursoDB |

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

Use `pnpm commit` para um guia interativo. Veja o [CONTRIBUTING.md](CONTRIBUTING.md) para o guia completo.

### Branches

```
main          ← produção
 └── develop  ← integração
       └── feat/nome-da-feature
       └── fix/nome-do-bug
```

---

## 📡 API

A API REST está disponível em `/api` com documentação interativa em `/api/docs`.

### Endpoints Principais

| Método | Endpoint | Descrição |
|--------|----------|-----------|
| `GET` | `/api/bibles` | Lista todas as versões disponíveis |
| `GET` | `/api/bibles/{version}/books/{id}/chapters/{n}` | Versículos de um capítulo |
| `GET` | `/api/bibles/{version}/search?q=...` | Busca por texto |
| `GET` | `/api/bibles/download/{version}` | Download do banco SQLite |

---

## 🤝 Contribuindo

Contribuições são bem-vindas! Leia o [CONTRIBUTING.md](CONTRIBUTING.md) para entender o fluxo de trabalho, padrão de branches e commits semânticos.

1. Fork o repositório
2. Crie sua branch: `git checkout -b feat/minha-feature origin/develop`
3. Faça seus commits: `pnpm commit`
4. Abra um Pull Request para `develop`

---

## 📜 Licença

Distribuído sob a [licença MIT](LICENSE). Consulte o arquivo `LICENSE` para mais detalhes.

---

<div align="center">

Feito com ❤️ para a missão — [open-mission](https://github.com/open-mission)

</div>

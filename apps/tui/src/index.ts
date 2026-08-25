#!/usr/bin/env node
import { BibleManager } from "./db/bible-manager.js"
import { InstalledStore } from "./db/installed-store.js"
import { downloadBible, listRemoteVersions } from "./services/download.js"
import { getDataDir } from "./db/paths.js"

async function cmdList() {
  const store = new InstalledStore()
  const list = store.list()
  store.close()
  if (list.length === 0) {
    console.log("Nenhuma versão instalada em", getDataDir())
    return
  }
  for (const b of list) {
    console.log(`${b.id}\t${b.name}\t${new Date(b.installedAt).toISOString()}`)
  }
}

async function cmdListRemote() {
  try {
    const remotes = await listRemoteVersions()
    console.log(JSON.stringify(remotes, null, 2))
  } catch (e: unknown) {
    console.error("Erro ao listar remotas:", (e as Error).message)
    process.exit(1)
  }
}

async function cmdDownload(version: string) {
  console.log(`Baixando ${version}...`)
  try {
    await downloadBible(version)
    console.log(`✅ ${version} instalada em ${getDataDir()}/bibles/${version}.db`)
  } catch (e: unknown) {
    console.error(`❌ Falha: ${(e as Error).message}`)
    process.exit(1)
  }
}

async function cmdRemove(version: string) {
  const { removeBible } = await import("./services/download.js")
  const ok = await removeBible(version)
  console.log(ok ? `Removida ${version}` : `Não encontrada ${version}`)
}

async function cmdRead(version: string, book: string, chapterStr: string) {
  const chapter = parseInt(chapterStr, 10)
  const mgr = new BibleManager()
  const verses = mgr.getChapterVerses(version, book, chapter)
  mgr.close()
  if (verses.length === 0) {
    console.log(`Nenhum versículo para ${version} ${book} ${chapter}`)
    process.exit(1)
  }
  for (const v of verses) {
    console.log(`${v.verse} ${v.text}`)
  }
}

async function cmdTui() {
  const { createCliRenderer } = await import("@opentui/core")
  const { createRoot } = await import("@opentui/react")
  const { App } = await import("./ui/app.js")
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  const React = await import("react")
  const renderer = await createCliRenderer({ exitOnCtrlC: true })
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  createRoot(renderer).render(React.createElement(App))
}

function printHelp() {
  console.log(`
Open Bible TUI — leitor terminal com sqlite nativo

Uso:
  open-bible-tui                    inicia TUI interativo (OpenTUI)
  open-bible-tui list               lista versões instaladas
  open-bible-tui list-remote        lista versões remotas
  open-bible-tui download <id>      baixa e instala versão (ex: ara, nvi)
  open-bible-tui remove <id>        remove versão instalada
  open-bible-tui read <id> <livro> <cap>  imprime capítulo (ex: read ara gen 1)
  open-bible-tui --help             esta ajuda

Env:
  OPEN_BIBLE_DATA_DIR  override do diretório de dados (padrão: ~/.local/share/open-bible)
  OPEN_BIBLE_API_URL   base da API (padrão: http://localhost:3000)
`)
}

const args = process.argv.slice(2)
const cmd = args[0]

if (!cmd || cmd === "tui") {
  await cmdTui()
} else if (cmd === "--help" || cmd === "-h" || cmd === "help") {
  printHelp()
} else if (cmd === "list") {
  await cmdList()
} else if (cmd === "list-remote") {
  await cmdListRemote()
} else if (cmd === "download") {
  if (!args[1]) { console.error("Informe versão: download <id>"); process.exit(1)}
  await cmdDownload(args[1])
} else if (cmd === "remove") {
  if (!args[1]) { console.error("Informe versão: remove <id>"); process.exit(1)}
  await cmdRemove(args[1])
} else if (cmd === "read") {
  if (!args[1] || !args[2] || !args[3]) { console.error("Uso: read <versão> <livro> <cap>"); process.exit(1)}
  await cmdRead(args[1], args[2], args[3])
} else {
  console.error(`Comando desconhecido: ${cmd}`)
  printHelp()
  process.exit(1)
}

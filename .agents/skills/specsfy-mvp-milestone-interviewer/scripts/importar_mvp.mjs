#!/usr/bin/env node
/**
 * Importa o MVP como M01, cria a cadeia Inbox → backlog → spec Draft e aplica
 * defaults apenas quando o trecho sustenta a resposta. Lacunas permanecem
 * marcadas como pendentes; o fluxo não implementa código nem passa gates.
 */

import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, join, relative, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);
const skillRoot = dirname(fileURLToPath(import.meta.url));
const inboxScript = resolve(skillRoot, "../../specsfy-01-inbox/scripts/capturar_inbox.mjs");
const backlogScript = resolve(skillRoot, "../../specsfy-02-backlog/scripts/iniciar_backlog.mjs");
const specScript = resolve(skillRoot, "../../specsfy-03-specify/scripts/iniciar_spec.mjs");

function fail(message) { throw new Error(message); }

function parseArgs(argv) {
  const values = {};
  for (let index = 0; index < argv.length; index += 1) {
    const key = argv[index];
    const value = argv[index + 1];
    if (!key?.startsWith("--")) fail(`argumento inválido: ${key}`);
    if (value === undefined || value.startsWith("--")) fail(`valor ausente para ${key}`);
    values[key.slice(2)] = value;
    index += 1;
  }
  return values;
}

function containsSensitiveData(content) {
  return /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----|\b(?:api[_-]?key|secret|token|password)\s*[:=]\s*\S+/iu.test(content);
}

function slug(value) {
  const result = value.normalize("NFKD").replace(/\p{Diacritic}/gu, "").toLowerCase().replace(/[^a-z0-9]+/gu, "-").replace(/^-+|-+$/gu, "");
  return result || "tema-do-mvp";
}

function titleFromTheme(theme, index) {
  const firstLine = theme.split(/\r?\n/u).find((line) => line.trim())?.replace(/^#+\s*/u, "").trim();
  return firstLine && firstLine.length <= 100 ? firstLine : `Tema ${index} do MVP`;
}

const developmentSignals = [
  "cadastro", "consulta", "listagem", "dashboard", "tela", "pagina", "formulario",
  "login", "autenticacao", "autorizacao", "integracao", "api", "endpoint", "banco",
  "persist", "notificacao", "upload", "download", "workflow", "funcionalidade",
  "feature", "servico", "relatorio", "filtro", "busca", "criar", "editar", "excluir",
  "listar", "consultar", "enviar", "gerar", "salvar", "automatizar", "receber",
  "mostrar", "acompanhar", "visualizar", "pedido", "cliente", "andamento",
];

const nonDevelopmentHeadings = [
  "visao", "visao do produto", "publico", "publico-alvo", "persona", "posicionamento",
  "principios", "principios do produto", "contexto", "problema", "metricas", "metricas de sucesso",
  "premissas", "restricoes", "escopo", "fora de escopo", "objetivo geral",
];

function classifyTheme(theme, index) {
  const title = normalized(titleFromTheme(theme, index));
  const text = normalized(theme);
  const explicitBuild = /\b(?:desenvolver|desenvolvimento|implementar|implementacao|construir|criar|entregar|feature|funcionalidade)\b/u.test(text);
  const explicitBehavior = /\b(?:sistema|aplicacao|app|produto|servico)\b.{0,80}\b(?:deve|permitir|possibilitar|salvar|consultar|listar|enviar|gerar|automatizar)\b/u.test(text);
  const headingOnlyContext = nonDevelopmentHeadings.some((value) => title === value || title.startsWith(`${value}:`));
  const featureNoun = developmentSignals.some((value) => title.includes(value));
  const bodyBehavior = developmentSignals.some((value) => text.includes(value));

  if (headingOnlyContext && !explicitBuild && !explicitBehavior) {
    return { developable: false, reason: "tema contextual, sem entrega de software identificada" };
  }
  if (explicitBuild || explicitBehavior || featureNoun) {
    return { developable: true, reason: "capacidade ou comportamento de software identificado" };
  }
  if (bodyBehavior && /\b(?:resultado|entrega|capacidade|fluxo)\b/u.test(text)) {
    return { developable: true, reason: "entrega de software sugerida pelo trecho" };
  }
  return { developable: false, reason: "nenhuma capacidade ou comportamento de software identificado" };
}

function quotedTheme(theme) {
  return theme.trim().split(/\r?\n/gu).map((line) => `> ${line}`).join("\n");
}

function normalized(value) {
  return value
    .normalize("NFKD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase()
    .trim();
}

function cleanValue(value) {
  return value
    .replace(/^[-*+]\s+/u, "")
    .replace(/^>\s?/u, "")
    .replace(/[`*_]/gu, "")
    .trim();
}

const labels = {
  problem: ["problema", "problema percebido", "dor", "necessidade"],
  person: ["pessoa", "pessoas", "publico", "publico-alvo", "usuario", "usuarios", "para quem", "quem usa", "destinado a"],
  result: ["resultado", "resultado esperado", "valor", "objetivo", "sucesso", "saida"],
  context: ["contexto", "jornada", "fluxo", "escopo"],
  menu: ["menus e navegacao principal", "menu", "menus", "navegacao", "navegacao principal"],
};

function labelValue(line, field) {
  const candidate = normalized(line).replace(/^#+\s*/u, "");
  const matches = labels[field].map(normalized).sort((left, right) => right.length - left.length);
  for (const label of matches) {
    if (candidate === label) return "";
    if (candidate.startsWith(`${label}:`)) return cleanValue(line.slice(line.indexOf(":") + 1));
    if (candidate.startsWith(`${label} -`)) return cleanValue(line.slice(line.indexOf("-") + 1));
  }
  return null;
}

function extractLabeledValue(theme, field) {
  const lines = theme.split(/\r?\n/gu);
  for (let index = 0; index < lines.length; index += 1) {
    const direct = labelValue(lines[index], field);
    if (direct) return direct;
    if (direct === null) continue;

    const heading = lines[index].replace(/^\s*#+\s*/u, "").trim();
    if (!labels[field].some((label) => normalized(heading) === normalized(label))) continue;
    const collected = [];
    for (let next = index + 1; next < lines.length; next += 1) {
      if (/^\s*#{1,6}\s+/u.test(lines[next])) break;
      const value = cleanValue(lines[next]);
      if (value) collected.push(value);
    }
    if (collected.length) return collected.join("\n");
  }
  return null;
}

function extractObviousValue(theme, field) {
  const labeled = extractLabeledValue(theme, field);
  if (labeled) return { value: labeled, reason: "rótulo explícito no trecho" };

  const candidates = theme.split(/\r?\n/gu).map(cleanValue).filter(Boolean);
  const patterns = {
    problem: [/^(?:o|a)\s+(?:problema|dor|necessidade)\s+(?:e|é)\s+/iu, /\b(?:nao|não)\s+(?:consegue|conseguem|tem|têm|possui|possuem)\b/iu, /\bdificuldade\b/iu],
    person: [/^(?:para quem|destinado a|feito para|usuarios?|usuárias?|pessoas?)\b/iu],
    result: [/^(?:o sistema|a pessoa|o usuario|a usuaria|o usuário|a usuária)\s+(?:deve|consegue|conseguira|conseguirá)\b/iu, /^(?:permitir|possibilitar|entregar|gerar|obter)\b/iu],
    context: [/^(?:durante|quando|ao|na|no|em)\b/iu],
    menu: [/\bmenus?\b/iu, /\bnavega(?:ção|cao)\b/iu],
  };
  const candidate = candidates.find((line) => patterns[field].some((pattern) => pattern.test(line)));
  return candidate ? { value: candidate, reason: "formulação inequívoca no trecho" } : null;
}

/** Remove o heading do tema para que a ideia registrada contenha só o conteúdo. */
function themeBody(theme) {
  return theme.replace(/^\s*#{1,6}\s+[^\r\n]*(?:\r?\n|$)/u, "").trim() || theme.trim();
}

function initialBacklogFields(theme, inboxPath) {
  const evidence = `O MVP declara:\n\n${quotedTheme(theme)}`;
  const extracted = Object.fromEntries(Object.keys(labels).map((field) => [field, extractObviousValue(theme, field)]));
  const fields = {
    idea: themeBody(theme),
    problem: extracted.problem?.value ?? "Lacuna: o MVP não declara o problema percebido deste tema.",
    person: extracted.person?.value ?? "Lacuna: o MVP não identifica a pessoa afetada ou beneficiada deste tema.",
    result: extracted.result?.value ?? "Lacuna: o MVP não declara o resultado ou valor esperado deste tema.",
    context: extracted.context?.value ?? `Tema derivado de \`${inboxPath}\` e da milestone \`M01\`.`,
    menu: extracted.menu?.value ?? "Lacuna: o MVP não declara os menus ou a navegação principal deste tema.",
  };
  const defaults = Object.entries(extracted)
    .filter(([, item]) => item)
    .map(([field, item]) => ({ field, value: item.value, reason: item.reason }));
  return { fields, defaults, evidence };
}

function automaticDefaults(defaults) {
  if (!defaults.length) return "## Defaults aplicados automaticamente\n\n- Nenhum default seguro encontrado; as lacunas permanecem para a entrevista.\n\n";
  return [
    "## Defaults aplicados automaticamente",
    "",
    "O importador aplicou somente respostas sustentadas pelo trecho do MVP:",
    "",
    ...defaults.map(({ field, value, reason }) => `- **${field}**: ${value} _(base: ${reason})_`),
    "",
    "Lacunas não preenchidas continuam abertas para `$specsfy-02-backlog`.",
    "",
  ].join("\n");
}

function initialInboxFields(title, defaults) {
  const values = Object.fromEntries(defaults.map(({ field, value }) => [field, value]));
  return {
    summary: `Tema importado do MVP: ${title}.`,
    problem: values.problem ?? "Lacuna: problema não identificado explicitamente no trecho.",
    people: values.person ?? "Lacuna: pessoa não identificada explicitamente no trecho.",
    value: values.result ?? "Lacuna: resultado não identificado explicitamente no trecho.",
    signals: defaults.length
      ? defaults.map(({ field, value }) => `${field}: ${value}`).join("\n")
      : "Nenhum default seguro encontrado no trecho.",
    review: "Perguntar somente sobre lacunas, ambiguidades ou contradições que permanecerem após a leitura do MVP.",
  };
}

function inboxClassification(classification) {
  return classification.developable
    ? `Tema classificado como desenvolvível: ${classification.reason}.`
    : `Tema mantido somente como contexto: ${classification.reason}. Não criar backlog nem spec.`;
}

function mvpEvidence(inboxPath, theme) {
  return [
    "## Registros confirmados no MVP",
    "",
    `- Inbox de origem: \`${inboxPath}\`.`,
    "- Milestone de origem: `specs/milestones/M01.md`.",
    "- Use o texto abaixo para preencher respostas já declaradas antes de formular perguntas.",
    "- Pergunte somente sobre lacuna, ambiguidade ou contradição que permaneça após a leitura.",
    "",
    "### Trecho importado",
    "",
    quotedTheme(theme),
    "",
  ].join("\n");
}

/** Divide o MVP por seções ou parágrafos sem inventar temas de produto. */
function themes(content) {
  const sections = content
    .split(/(?=^#{2,}\s+)/mu)
    .map((section) => section.trim())
    .filter((section) => section && section.replace(/^#\s+.*$/mu, "").trim());
  if (/^#{2,}\s+/mu.test(content) && sections.length) return sections;

  const paragraphs = content.split(/\r?\n\s*\r?\n/gu).map((item) => item.trim()).filter(Boolean);
  return paragraphs.length ? paragraphs : [content.trim()];
}

async function resolveSuperprojectRoot(root) {
  try {
    const { stdout } = await execFileAsync("git", ["-C", root, "rev-parse", "--show-superproject-working-tree"], { encoding: "utf8" });
    return stdout.trim() || null;
  } catch {
    return null;
  }
}

async function readMvpSource(root) {
  const localSource = join(root, "MVP.md");
  try {
    return { content: await readFile(localSource, "utf8"), source: localSource };
  } catch (error) {
    if (error?.code !== "ENOENT") throw error;
  }
  const superprojectRoot = await resolveSuperprojectRoot(root);
  if (!superprojectRoot) fail("MVP.md não encontrado na raiz do projeto");
  const source = join(superprojectRoot, "MVP.md");
  try {
    return { content: await readFile(source, "utf8"), source };
  } catch (error) {
    if (error?.code === "ENOENT") fail("MVP.md não encontrado no projeto nem no repositório pai");
    throw error;
  }
}

async function run(script, args) {
  const { stdout } = await execFileAsync("node", [script, ...args], { encoding: "utf8" });
  return stdout.trim();
}

function replaceOnce(content, needle, value) {
  if (!content.includes(needle)) return content;
  return content.replace(needle, value);
}

function automaticAnswers(defaults) {
  return defaults.length
    ? defaults.map(({ field, value, reason }) => `- **${field}**: ${value} _(base: ${reason})_`).join("\n")
    : "- Nenhuma resposta automática segura encontrada.";
}

function openQuestions(fields) {
  const missing = Object.entries(fields)
    .filter(([field, value]) => ["problem", "person", "result", "menu"].includes(field) && value.startsWith("Lacuna:"))
    .map(([, value]) => `- ${value.replace(/^Lacuna:/u, "Pendente:")}`);
  return missing.length ? missing.join("\n") : "- Nenhuma lacuna nesses campos; validar demais escolhas durante o refinamento.";
}

/** Preenche a spec Draft sem escolher arquitetura ou inventar requisitos ausentes. */
function renderDraftSpec(content, title, backlogPath, inboxPath, fields, defaults) {
  const pending = (value) => value.startsWith("Lacuna:") ? value.replace(/^Lacuna:/u, "Pendente:") : value;
  const actor = pending(fields.person);
  const problem = pending(fields.problem);
  const result = pending(fields.result);
  const menu = pending(fields.menu);
  const idea = fields.idea;
  let rendered = content
    .replaceAll("| Milestones | |", "| Milestones | M01 |")
    .replaceAll("| Interface para pessoas | A definir |", "| Interface para pessoas | Pendente: o MVP não informa se há interface para pessoas. |")
    .replaceAll("[Dor observável e contexto.]", problem)
    .replaceAll("[Mudança percebida pelo usuário ou negócio.]", result)
    .replaceAll("[Capacidade incluída.]", idea)
    .replaceAll("[Limite explícito.]", "O MVP não declarou limite adicional; manter o escopo deste tema.")
    .replaceAll("[Ator]", actor)
    .replaceAll("[Menu principal e menus secundários, seus itens, destinos ou rotas, permissões e comportamento responsivo. Se não houver menu, declare como a pessoa chega às telas e por que a navegação direta é suficiente.]", menu)
    .replaceAll("[objetivo, permissões ou responsabilidade]", "Executa ou recebe o resultado descrito no MVP; permissões a confirmar.")
    .replaceAll("[título]", title)
    .replaceAll("[capacidade]", idea)
    .replaceAll("[valor]", result)
    .replaceAll("[capacidade observável]", title)
    .replaceAll("[estado inicial]", "O tema do MVP está disponível para ser executado.")
    .replaceAll("[ação]", idea)
    .replaceAll("[resultado observável]", result)
    .replaceAll("[contexto alternativo]", "O fluxo recebe os dados previstos no tema do MVP.")
    .replaceAll("[regra observável]", "O sistema preserva o resultado descrito no MVP.")
    .replaceAll("[condição de falha ou limite]", "Uma informação necessária ainda não está declarada no MVP.")
    .replaceAll("[tratamento observável]", "O sistema registra a lacuna e não inventa uma resposta.")
    .replaceAll("O sistema deve [comportamento verificável].", `O sistema deve executar ${idea} e produzir ${result}.`)
    .replaceAll("[pergunta investigada] → [conclusão e impacto].", `Leitura de ${backlogPath} → os defaults foram reaproveitados; lacunas permanecem em Draft.`)
    .replaceAll("[Código, documento, stakeholder ou “Nenhuma fonte externa”.]", `MVP.md, ${inboxPath} e ${backlogPath}.`)
    .replaceAll("[Pergunta material] → **A**: [resposta incorporada].", automaticAnswers(defaults))
    .replaceAll("[Pergunta bloqueante ou “Nenhuma”.]", openQuestions(fields))
    .replaceAll("[Stack, arquitetura e convenções encontradas no repositório.]", "Não analisadas durante a importação; nenhuma implementação é executada.")
    .replaceAll("[Framework, roteamento, componentes, estilos, formulários, testes, telas atuais afetadas e fontes locais observadas. Explique “A confirmar” quando a stack não definir a camada.]", "A confirmar em etapa posterior; esta importação não escolhe stack.")
    .replaceAll("[Condição] → [comportamento observável].", "Lacuna material → manter a spec como Draft e perguntar somente no refinamento.");
  rendered = replaceOnce(rendered, "- [Métrica mensurável com alvo.]", "- Métrica e alvo a confirmar; o MVP não declarou medida observável.");
  rendered = replaceOnce(rendered, "- [Fora de escopo]", "- Fora de escopo não declarado no MVP; confirmar antes de promover o gate.");
  return rendered.replace(/\[([^\]\r\n]+)\]/gu, "Pendente: $1");
}

async function createDraftSpec(root, title, backlogPath, inboxPath, fields, defaults) {
  const specPath = await run(specScript, ["--title", title, "--root", root]);
  const content = await readFile(specPath, "utf8");
  const rendered = renderDraftSpec(content, title, backlogPath, inboxPath, fields, defaults);
  await writeFile(specPath, rendered, "utf8");
  return specPath;
}

async function createMilestone(root, source, content) {
  const destination = join(root, "specs", "milestones", "M01.md");
  await mkdir(dirname(destination), { recursive: true });
  const hash = createHash("sha256").update(content).digest("hex");
  const milestone = [
    "# Milestone 1.0",
    "",
    "| Metadado | Valor |",
    "| --- | --- |",
    "| Status | Importada de MVP.md |",
    `| Origem | \`${relative(root, source) || "MVP.md"}\` |`,
    `| Integridade da origem | SHA-256 \`${hash}\` |`,
    "",
    "## Material importado",
    "",
    content.trim(),
    "",
    "## Proveniência e próximos passos",
    "",
    "As Inboxes preservam todos os temas. Backlogs e specs Draft são derivados",
    "somente dos temas classificados como entregas de software desenvolvíveis.",
    "",
  ].join("\n");
  try {
    await writeFile(destination, milestone, { encoding: "utf8", flag: "wx" });
  } catch (error) {
    if (error?.code === "EEXIST") fail("a milestone 1.0 já existe e não será sobrescrita");
    throw error;
  }
  return destination;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const root = resolve(args.root ?? process.cwd());
  const { content, source } = await readMvpSource(root);
  if (!content.trim()) fail("MVP.md não pode estar vazio");
  if (containsSensitiveData(content)) fail("MVP.md contém dado sensível aparente; remova-o antes de importar");

  const milestone = await createMilestone(root, source, content);
  const session = `MVP-${new Date().toISOString().slice(0, 10).replaceAll("-", "")}-${slug(source === join(root, "MVP.md") ? "local" : "hub")}`;
  const sources = `- \`${relative(root, source) || "MVP.md"}\`: importado em \`specs/milestones/M01.md\`.`;
  const created = [];

  for (const [index, theme] of themes(content).entries()) {
    const title = titleFromTheme(theme, index + 1);
    const classification = classifyTheme(theme, index + 1);
    const preliminary = initialBacklogFields(theme, "Inbox criada nesta importação");
    const inboxFields = initialInboxFields(title, preliminary.defaults);
    const inbox = await run(inboxScript, [
      "--input", theme,
      "--title", title,
      "--session", session,
      "--turn", String(index + 1),
      "--sources", sources,
      "--summary", inboxFields.summary,
      "--problem", inboxFields.problem,
      "--people", inboxFields.people,
      "--value", inboxFields.value,
      "--signals", `${inboxClassification(classification)}\n${inboxFields.signals}`,
      "--review", inboxFields.review,
      "--directions", classification.developable
        ? "Aprofundar somente lacunas da entrega de software."
        : "Não transformar este tema contextual em backlog ou spec.",
      "--root", root,
    ]);
    const inboxPath = relative(root, inbox);
    if (!classification.developable) {
      created.push({
        inbox: inboxPath,
        backlog: null,
        spec: null,
        developable: false,
        reason: classification.reason,
        defaults: preliminary.defaults,
      });
      continue;
    }
    const extracted = initialBacklogFields(theme, inboxPath);
    const backlog = await run(backlogScript, [
      "--title", title,
      "--idea", extracted.fields.idea,
      "--problem", extracted.fields.problem,
      "--person", extracted.fields.person,
      "--result", extracted.fields.result,
      "--context", extracted.fields.context,
      "--root", root,
    ]);
    const backlogContent = await readFile(backlog, "utf8");
    const backlogRelative = relative(root, backlog);
    await writeFile(backlog, backlogContent.replace(
      "## Referências relacionadas\n\n- Nenhuma referência relevante encontrada.",
      `${automaticDefaults(extracted.defaults)}${mvpEvidence(inboxPath, theme)}\n## Referências relacionadas\n\n- Inbox de origem: \`${inboxPath}\`.\n- Milestone de origem: \`specs/milestones/M01.md\`.\n- Refinamento obrigatório: \`$specsfy-02-backlog\` somente para lacunas, ambiguidades ou contradições antes de promoção.`,
    ), "utf8");
    const specPath = await createDraftSpec(
      root,
      title,
      backlogRelative,
      inboxPath,
      extracted.fields,
      extracted.defaults,
    );
    const completedBacklog = await readFile(backlog, "utf8");
    await writeFile(backlog, completedBacklog
      .replace("| Status | Captured |", "| Status | Promoted |")
      .replace("| Spec promovida | Nenhuma |", `| Spec promovida | \`${relative(root, specPath)}\` |`), "utf8");
    created.push({
      inbox: inboxPath,
      backlog: backlogRelative,
      spec: relative(root, specPath),
      developable: true,
      defaults: extracted.defaults,
    });
  }

  console.log(JSON.stringify({ milestone: relative(root, milestone), session, items: created }, null, 2));
}

main().catch((error) => {
  console.error(`erro: ${error instanceof Error ? error.message : String(error)}`);
  process.exitCode = 1;
});

---
name: Open Bible
description: Bíblia offline-first de bolso — um santuário calmo de papel e tinta com o acento escolhido pelo leitor
colors:
  papel: "oklch(1 0 0)"
  tinta: "oklch(0.145 0 0)"
  neve: "oklch(0.985 0 0)"
  noite: "oklch(0.115 0 0)"
  bruma: "oklch(0.97 0 0)"
  carvao: "oklch(0.269 0 0)"
  fio: "oklch(0.922 0 0)"
  fio-noite: "oklch(1 0 0 / 10%)"
  tinta-suave: "oklch(0.556 0 0)"
  neblina: "oklch(0.708 0 0)"
  acento-neutro: "oklch(0.205 0 0)"
  acento-neutro-noite: "oklch(0.922 0 0)"
  rubi: "oklch(0.577 0.245 27.325)"
  rubi-noite: "oklch(0.704 0.191 22.216)"
  marca-ambar: "oklch(0.88 0.12 80)"
  marca-verde: "oklch(0.87 0.1 150)"
  marca-azul: "oklch(0.86 0.09 230)"
  marca-rosa: "oklch(0.88 0.1 10)"
typography:
  display:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "36px"
    fontWeight: 600
    lineHeight: 1.1
  leitura:
    fontFamily: "Lora, Georgia, serif"
    fontSize: "20px"
    fontWeight: 400
    lineHeight: 1.8
  body:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "14px"
    fontWeight: 500
    lineHeight: 1.5
  label-olho:
    fontFamily: "Inter, ui-sans-serif, system-ui, sans-serif"
    fontSize: "11px"
    fontWeight: 700
    letterSpacing: "0.3em"
rounded:
  sm: "8px"
  md: "11px"
  lg: "14px"
  xl: "20px"
spacing:
  xs: "4px"
  sm: "8px"
  md: "16px"
  lg: "24px"
components:
  botao-primario:
    backgroundColor: "{colors.acento-neutro}"
    textColor: "{colors.neve}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 10px"
  botao-contorno:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 10px"
  cartao:
    backgroundColor: "{colors.papel}"
    textColor: "{colors.tinta}"
    rounded: "{rounded.xl}"
    padding: "16px 24px"
  campo-texto:
    backgroundColor: "transparent"
    textColor: "{colors.tinta}"
    rounded: "{rounded.md}"
    height: "36px"
    padding: "0 10px"
---

# Design System: Open Bible

## Overview

**Creative North Star: "Santuário de Bolso"**

Open Bible é uma capela pessoal que cabe no bolso: recolhida, reverente e íntima. A interface existe para desaparecer — superfícies neutras de papel, uma tipografia confortável e nada competindo com o texto sagrado pela atenção. A densidade é baixa por princípio; cada tela tem um trabalho e o faz em silêncio.

A personalidade é **calma e tátil**: botões que afundam 1 pixel no toque, foco visível mas gentil, transições curtas sem alarde. As superfícies são planas em repouso e ganham definição de fios finos (hairlines) e sombras mínimas. Um único acento cromático — escolhido pelo próprio leitor entre 15 opções — empresta voz ao sistema por vez, e os destaques de versículo se comportam como marca-texto real sobre o papel.

Rejeições confirmadas pelo produto: **kit religioso clichê** (dourado, vitral, ornamento barroco ou serifada dramática) e **dashboard corporativo** (painéis densos, tabelas apertadas, métricas). Fé sem kitsch; leitura sem ruído de ferramenta de trabalho.

**Key Characteristics:**
- Base neutra dupla "Papel & Tinta": branco puro no claro, quase-preto profundo no escuro
- Um acento por vez, trocável em runtime pelo leitor (15 opções); cor é evento, não decoração
- Superfícies planas definidas por anéis-fio (`ring-foreground/10`) e `shadow-xs`
- Escritura em Lora serifada, 16–24px ajustáveis, entrelinha generosa 1.8
- Destaques como tinta translúcida de marca-texto com sublinhado
- Botões táteis: press de 1px, foco em anel triplo suave
- Cantos generosos derivados de `--radius: 14px`

## Colors

Paleta quase acromática por natureza: dois neutros estruturam tudo (papel e tinta), e a única voz cromática é a que o leitor escolher. Os valores canônicos vivem como variáveis CSS em `app/globals.css` (formato OKLCH) e nunca devem ser copiados como literais em componentes novos.

### Primary

- **Acento do Leitor** (padrão neutro: claro `oklch(0.205 0 0)` / escuro `oklch(0.922 0 0)`): a primária do sistema é um slot trocável em runtime. O usuário escolhe entre 15 cores (`features/theme/utils/theme.ts`: neutral, amber, blue, cyan, emerald, fuchsia, green, indigo, lime, orange, pink, rose, violet, yellow, zinc) aplicadas via `[data-color]` no `<html>`. A troca afeta **apenas** `--primary`, `--primary-foreground`, `--ring` e `--chart-1`; todo o resto herda a base neutra. Usos: botão primário, anéis de foco, bordas de seleção ativa, estados ativos — sempre pontual.

### Secondary

Omitido — o sistema tem uma única voz de acento por vez.

### Tertiary

Omitido — mesma razão.

### Neutral

A dualidade **Papel & Tinta**, com pares claro↔escuro:

- **Papel** (claro `oklch(1 0 0)` ↔ escuro `oklch(0.115 0 0)` como **Noite**): fundo de página e leitura.
- **Tinta** (claro `oklch(0.145 0 0)` ↔ escuro `oklch(0.985 0 0)` como **Neve**): texto principal e ícones.
- **Bruma** (claro `oklch(0.97 0 0)` ↔ escuro `oklch(0.269 0 0)` como **Carvão**): fundos `muted`/`secondary`/`accent`, hovers discretos, tiles inativos.
- **Fio** (claro `oklch(0.922 0 0)` ↔ escuro `oklch(1 0 0 / 10%)`): bordas, divisores, inputs; no escuro vira véu translúcido de branco (input usa 15%).
- **Tinta Suave** (claro `oklch(0.556 0 0)` ↔ escuro `oklch(0.708 0 0)` como **Neblina**): texto secundário, placeholders, rótulos discretos, números de versículo.

### Marcações (destaques)

Quatro pastéis de sistema para destaques de versículo (variáveis `--highlight-*`):

- **Marca Âmbar** (claro `oklch(0.88 0.12 80)` / escuro `oklch(0.70 0.12 75)`)
- **Marca Verde** (claro `oklch(0.87 0.1 150)` / escuro `oklch(0.65 0.1 145)`)
- **Marca Azul** (claro `oklch(0.86 0.09 230)` / escuro `oklch(0.65 0.1 225)`)
- **Marca Rosa** (claro `oklch(0.88 0.1 10)` / escuro `oklch(0.68 0.1 15)`)

Além dos pastéis, o seletor de destaques oferece 36 cores vivas ("neon", `features/highlights/utils/highlight-colors.ts`; padrões Emerald `#34d399`, Blue `#3b82f6`, Violet `#8b5cf6`, Rose `#fb7185`, Amber `#f59e0b`, Cyan `#22d3ee`). A aplicação é sempre a mesma fórmula de tinta: fundo translúcido a ~18% (`hex + 2e`) + sublinhado de 1.5px a ~50% (`hex + 80`), raio 3px, `box-decoration-break: clone`.

### Destrutivo

- **Rubi** (claro `oklch(0.577 0.245 27.325)` / escuro `oklch(0.704 0.191 22.216)`): ações destrutivas e erros. Nunca em preenchimento sólido — sempre tingido a 10–20% sobre a superfície.

### Named Rules

**A Regra da Voz Única.** Existe apenas um acento por vez e ele é escolhido pelo leitor, não pelo designer. O acento aparece em focos, estados ativos e bordas de seleção — nunca em preenchimentos grandes. Sua raridade é o que dá autoridade a ele.

**A Regra do Papel Antes da Tinta.** Fundos são sempre neutros. Cor só entra onde há significado: seleção, foco, destaque, erro.

## Typography

**Display Font:** Lora (fallback Georgia, serif) — a voz da Escritura.
**Body Font:** Inter (fallback ui-sans-serif/system-ui) — a voz da interface.
**Mono Font:** Geist Mono — opção de leitura e dados técnicos.

**Character:** O par Inter + Lora divide o mundo em duas camadas silenciosas: Inter organiza (controles, rótulos, estados) e Lora habita (o texto bíblico). Nenhuma delas chama atenção para si; o contraste vem do meio serifado contra o sans neutro, não de peso ou tamanho agressivos.

### Hierarchy

- **Display** (Lora semibold, 36px, centralizado): títulos de capítulo na área de leitura. É o único momento grande e composto da página.
- **Eyebrow** (Inter bold, 11px, maiúsculas, tracking 0.3em): rótulos como "CAPÍTULO 3", ladeados por réguas-fio de 32px. Também usados como marcadores de seção.
- **Leitura** (Lora regular, padrão 20px, ajustável 16–24px em passos de 2, entrelinha 1.8): o texto bíblico — o elemento mais importante do produto. Fonte selecionável pelo leitor: serif (padrão), sans ou mono.
- **UI Body** (Inter medium, 14px): botões, controles, itens de lista.
- **Label** (Inter medium, 12px): rótulos de formulários e configurações; versões menores de 10–11px aparecem em pílulas e metadados.
- **Número de Versículo** (Inter bold, 12px, `muted-foreground` a 60%): sobe na linha como um sussurro à esquerda do texto.

### Named Rules

**A Regra do Texto Quieto.** A Escritura nunca recebe negrito, itálico decorativo ou cor de destaque no corpo. Hierarquia vem da medida, da entrelinha 1.8 e do silêncio ao redor — não do peso.

## Layout

Mobile-first, coluna única. A navegação é barra inferior de abas no celular e sidebar no desktop; um command palette (Ctrl/Cmd+K) cobre usuários avançados.

A coluna de leitura tem três medidas controladas pelo leitor: **estreita** (`max-w-2xl`, 42rem), **média** (`max-w-4xl`, 56rem) e **larga** (sem limite). Calhas laterais crescem com o espaço: 16px no mobile até 64px no modo estreito em desktop (`md:px-16`). O respiro superior é de 32px (`pt-8`) e o rodapé sempre soma `env(safe-area-inset-bottom)` para respeitar gestos do sistema.

A grade de espaçamento é a escala Tailwind (base 4px); cards internamente usam 24px (`--card-spacing`, 16px na variante compacta). Scrollbars são customizadas e discretas: trilho transparente, polegar de 6px arredondado. O viewport trava zoom (`maximumScale: 1`) e o teclado móvel redimensiona conteúdo (`interactiveWidget: resizes-content`) — decisões deliberadas para estabilidade da leitura em PWA.

## Elevation & Depth

Profundidade por **fios de luz**, confirmada como filosofia: superfícies são planas em repouso. Quem define as bordas são anéis-fio de 1px (`ring-1 ring-foreground/10`) e, no modo escuro, véus translúcidos de branco (10% em bordas, 15% em inputs) em vez de cinzas sólidos. A única sombra do sistema é `shadow-xs` (`0 1px 2px rgb(0 0 0 / 0.05)`), sempre acompanhando um anel-fio.

Profundidade é resposta, não estado: aparece quando o usuário age — hover muda o fundo para Bruma, toque afunda o botão 1px, painéis deslizam. Nada flutua sem motivo; não há glassmorphism nem gradientes de elevação.

### Shadow Vocabulary

- **shadow-xs** (`box-shadow: 0 1px 2px 0 rgb(0 0 0 / 0.05)`): repouso de botões outline e cards. Sempre combinado com anel-fio.

### Named Rules

**A Regra do Fio de Luz.** Borda define, sombra sussurra. Se uma superfície precisa de profundidade para ser compreendida, o problema é a hierarquia — não falta de sombra.

## Shapes

O raio deriva de uma única fonte: `--radius: 14px`. A escala multiplica esse valor — `sm` ≈ 8px (×0.6), `md` ≈ 11px (×0.8), `lg` = 14px, `xl` ≈ 20px (×1.4), `2xl` ≈ 25px (×1.8) — dando cantos visivelmente generosos sem virar bolha. Botões e inputs usam `md` (11px); cards e modais, `xl` (20px); tiles de configuração, `lg` (14px).

Duas exceções deliberadas: pílulas e chips são totalmente redondas (`9999px`), e a tinta de marca-texto usa raio mínimo de 3px com `box-decoration-break: clone`, imitando caneta sobre o papel. Bordas têm sempre 1px (fio); não há bordas grossas, duplas ou ornamentais.

## Components

Componentes vivem em `components/ui/` (shadcn/ui sobre Base UI) e seguem os tokens acima via classes semânticas — nunca literais.

### Buttons

Caráter: **calmos e táteis**.

- **Shape:** cantos médios arredondados (11px, `rounded-md`)
- **Primary:** preenchido com o acento atual (`bg-primary` sobre texto `primary-foreground`), altura 36px, padding horizontal 10px, Inter medium 14px
- **Hover:** primária esvanece para 80% de opacidade; variantes outline/ghost migram o fundo para Bruma
- **Focus:** anel triplo do acento a 50% (`ring-3 ring-ring/50`) + borda assumindo o acento — visível e gentil
- **Active:** afunda 1px (`translate-y-px`) — a assinatura tátil do sistema
- **Variantes:** `outline` (borda Fio + fundo Papel + `shadow-xs`), `secondary` (Bruma sólida), `ghost` (transparente, hover Bruma), `destructive` (**tingida**: fundo Rubi a 10%, texto Rubi, hover a 20% — nunca sólida), `link` (texto do acento, sublinhado com offset 4px)
- **Sizes:** `xs` 24px, `sm` 32px, padrão 36px, `lg` 40px; quadradas para ícone em 24/32/36/40px

### Inputs

- **Style:** altura 36px, largura total, borda Fio de 1px, fundo transparente (escuro: véu de branco a 30%), raio 11px, `shadow-xs`
- **Focus:** mesma gramática dos botões — borda vira acento + anel triplo a 50%
- **Error:** `aria-invalid` pinta borda e anel com Rubi translúcido
- **Placeholder:** Tinta Suave

### Cards

- **Corner Style:** arredondado amplo (20px, `rounded-xl`)
- **Background:** Papel/Card (`bg-card`), sem gradiente
- **Shadow Strategy:** anel-fio `ring-foreground/10` + `shadow-xs` (ver Elevação)
- **Border:** nenhuma além do anel
- **Internal Padding:** 24px (16px na variante `size="sm"`); imagens sangram nos cantos superior/inferior com raio herdado

### Chips

- **Nota anexada ao versículo:** pílula totalmente redonda, borda Fio, fundo Bruma a 40%, Inter medium 10px, ícone de nota de 12px; hover migra para Bruma cheia

### Navigation

Sidebar no desktop e barra inferior de abas no mobile compartilham a mesma linguagem: itens fantasma com hover Bruma, item ativo marcado pelo acento (fundo tingido a 5%, texto/borda no acento). Command palette para saltos rápidos. Transição de views é fade de 150ms; troca de capítulo desliza direcionalmente (200ms ease-out) conforme o gesto.

### Tiles de Escolha (assinatura)

Seletor de opções em grade (fonte, posição, tema): tile com borda dupla de 2px. Estado selecionado: borda no acento, fundo acento a 5%, texto no acento, bold, `shadow-xs`. Estado inativo: borda Fio, texto Tinta Suave, hover aproxima a borda do acento (40%). É o padrão canônico para qualquer escolha mutuamente exclusiva.

### Versículo (assinatura)

Linha de leitura com número sussurrado à esquerda (Inter bold 12px, Tinta Suave a 60%) e texto Lora em entrelinha 1.8. Seleção sublinha com offset 4px e opacidade 40%. Hover revela ações sem mudar o layout. É a célula central do produto — toda nova superfície de leitura deve nascer dela.

## Do's and Don'ts

### Do:

- **Do** consumir sempre as variáveis semânticas (`bg-background`, `text-foreground`, `bg-card`, `bg-muted`, `border-border`, `ring-ring`, `text-primary`) — a primária troca em runtime e todo hex fixo quebra o tema do usuário.
- **Do** derivar raios de `--radius` (14px): ×0.6, ×0.8, ×1, ×1.4 — nunca inventar valores intermediários.
- **Do** dar a todo interativo o press tátil (`active:translate-y-px`) e o foco visível (`focus-visible:ring-3 ring-ring/50`).
- **Do** compor leitura com entrelinha 1.8 e medida confortável (42–56rem).
- **Do** marcar seções com eyebrow maiúsculo (tracking 0.3em) ladeado por réguas-fio de 32px.
- **Do** aplicar destaques como tinta translúcida (~18%) + sublinhado (~50%), raio 3px, com `box-decoration-break: clone`.
- **Do** respeitar `env(safe-area-inset-bottom)` em qualquer container rolável de tela cheia.

### Don't:

- **Don't** usar dourado, vitral, ornamento barroco ou serifada dramática — kit religioso clichê é anti-referência declarada.
- **Don't** construir densidade de dashboard: sem grades de métricas, KPIs ou tabelas apertadas.
- **Don't** usar preenchimento sólido em ação destrutiva — Rubi é sempre tingido a 10–20%.
- **Don't** introduzir sombras além de `shadow-xs`, glassmorphism, blur ou gradientes de profundidade.
- **Don't** confiar em seleção nativa de texto fora de campos editáveis — ela é desabilitada globalmente por design (a seleção de versículos usa popover próprio).
- **Don't** trazer fontes novas: o trio é Inter, Lora e Geist Mono, carregados via `next/font`.

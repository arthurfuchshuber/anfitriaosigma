# Playbook de Layout e Design — Anfitrião Sigma (v3 · base branca)

Guia para replicar o visual da landing principal nas demais páginas (cidades, Intranet, Proprietário, mentoria etc.) sem perder a identidade. Tudo aqui foi extraído do mockup validado e do código em `src/components/sigma/`.

> Regra de ouro do processo: **layout novo ou alterado = mockup primeiro, validação, só depois código.** Ao pedir mudança em uma parte, muda **só** aquela parte.

---

## 1. Princípios

1. **Corporativo, moderno, limpo.** Muito branco, muito respiro, poucos elementos por bloco.
2. **Base branca (≈80% da página).** Faixas escuras (roxo profundo) são pontuais: simulador, "Onde estamos atuando" e CTA final. Nunca duas faixas escuras seguidas.
3. **Roxo é a cor da marca. Laranja e magenta só em detalhes minúsculos** (ponto de status, estrela). Sem azul, verde, vermelho vivo ou cores gritantes.
4. **Efeitos suaves e lentos.** Nada pisca, nada balança. Movimento transmite "estável e premium".
5. **Transições entre blocos sem corte.** Todo bloco termina em degradê longo para o branco ou para o bloco seguinte (ver seção 6).
6. **Tipografia única e sem enfeites.** Nada de itálico serifado ou letras decorativas (foi reprovado por parecer pouco profissional).
7. **Só números verificados.** Nenhum número entra sem origem confirmada pela equipe (ex.: Stúdio 35 m² em Foz do Iguaçu = R$ 83 mil em 2025).

---

## 2. Tokens de cor

| Token | Hex | Uso |
|---|---|---|
| Ink | `#120A1C` | Texto principal, fundo das faixas escuras, rodapé |
| Roxo marca | `#431171` | Botão primário, links, acentos, estrelas das avaliações |
| Roxo profundo | `#2A0A47` | Fim do degradê do logo/avatares |
| Roxo médio | `#5A2394` | Início do degradê do logo/avatares |
| Roxo vivo (texto gradiente) | `#7B4DAB` → `#A68CC4` | Meio/fim do texto em degradê `.gt` |
| Lilás de fundo 1 | `#FAF8FC` | Fundo de cartões suaves, inputs |
| Lilás de fundo 2 | `#F7F5FA` / `#F2ECF8` | Chips, ícones, faixas claras |
| Lilás faixa | `#EFE8F7` | Faixa de "Serviços" (miolo) |
| Borda | `#E7E2EE` (cartões) · `#ECE7F2` (divisórias) · `#D2C5E3` (inputs/botão secundário) | Sempre 1px (inputs 1.5px) |
| Texto secundário | `#5F5870` | Parágrafos |
| Texto terciário | `#8C849C` | Legendas, rótulos pequenos |
| Texto sobre escuro | `#C2B1D6` (corrido) · `#D9CCE8` (nota) · `#8F7FA6` (rodapé) | Nunca branco puro em parágrafos |
| Acento laranja | `#FF4700` | **Apenas** ponto pulsante e estrelas ★ |
| Acento magenta | `#D700A6` | **Apenas** halo muito sutil (≤10% de opacidade) |
| Erro | `#B3300F` sobre `#FFF3EF` | Mensagens de validação |

Regras: máximo de **uma** cor de acento por bloco; texto sobre branco sempre `#120A1C`, `#5F5870` ou `#431171`.

---

## 3. Tipografia

- **Títulos:** Sora (600). Classe `.hd`.
- **Corpo:** DM Sans (400/500/600/700).
- Texto em degradê de marca: classe `.gt` (sobre claro) e `.gtl` (sobre escuro). **Aplicar só em 2–5 palavras-chave do título**, nunca no título inteiro.

| Elemento | Tamanho | Peso | Entrelinha | Tracking |
|---|---|---|---|---|
| H1 (hero) | `clamp(40px, 6vw, 80px)` | 600 | 1.02 | `-0.045em` |
| H2 de seção | `clamp(34px, 4.4vw, 62px)` (50–58px em faixas) | 600 | 1.04–1.06 | `-0.045em` |
| Número de destaque | `clamp(48px, 5.4vw, 76px)` | 600 | 1 | `-0.05em` |
| Título de card | 20–22px | 600 | 1.2 | `-0.03em` |
| Parágrafo de apoio | 18–20px | 400 | 1.6–1.65 | normal |
| Parágrafo de card | 15–15.5px | 400 | 1.6 | normal |
| Eyebrow (sobretítulo) | 12.5px | 600 | — | `.16em`, MAIÚSCULAS |
| Rótulo de campo | 13px | 600 | — | normal |
| Legenda | 12–12.5px | 500 | 1.5 | normal |

**Eyebrow** vem sempre acima do H2: roxo `#431171` em fundo claro, `#C2B1D6` em fundo escuro.
Títulos têm **largura máxima** (800–1176px) e são centralizados só quando o bloco é centralizado.

---

## 4. Grid, espaçamento e ritmo

- Largura máxima do conteúdo: **1240px**, centralizado, com **32px** de margem lateral (24px em telas pequenas).
- Faixas "de ponta a ponta" (full-bleed): o fundo ocupa 100% da largura; o conteúdo continua em 1240px.
- Seções comuns: `padding: 120–130px 32px`. Entre seções claras: respiro de 90–130px.
- Gaps: 14–20px entre cartões, 32–64px entre colunas, 96px entre colunas de faixa escura.
- Colunas via `flex-wrap: wrap` com `flex: 1 1 <base>` (420–560px). Nunca largura fixa que estoure a tela.
- **Menus/trilhos roláveis:** sempre aplicar a regra anti-corte (padding interno lateral de 6px + `scroll-padding`, nenhum item cortado nas bordas) e manter dentro das mesmas margens laterais máximas do conteúdo.

---

## 5. Componentes

### Botão primário
Pílula (`border-radius: 999px`), fundo `#431171`, texto branco 600, 17px (nav: 14.5px), padding `17px 18px 17px 30px` com **ícone-seta em círculo** `30px` (`rgba(255,255,255,.16)`). Sombra `0 18px 40px -18px rgba(67,17,113,.7)`. Classe `.btn` (brilho que cruza no hover + sobe 2px).

### Botão secundário
Pílula, fundo `rgba(255,255,255,.8)`, borda `#D2C5E3`, texto `#120A1C`.

### Botão em fundo escuro
Fundo branco, texto `#120A1C` ou `#431171`, raio 16px (retangular) ou pílula (nav).

### Cartão
Fundo `#fff`, borda 1px `#E7E2EE`, raio **24–34px**, padding 26–40px. Classe `.lift` (sobe 5px e ganha sombra roxa no hover). Cartão de destaque: fundo ink/roxo escuro com borda `rgba(255,255,255,.12)`.

### Cartão de vidro (sobre escuro)
`background: rgba(255,255,255,.06)`, `backdrop-filter: blur(18px)`, borda `rgba(255,255,255,.12)`, raio 32px, padding 52px.

### Chip / selo
Fundo `#F2ECF8`, texto `#431171` 700, 12–13px, raio 999px, padding `5–6px 12–14px`.

### Ícone de card
Quadrado `44px`, raio 13px, fundo `#F2ECF8`, ícone `stroke #431171` 21px.

### Campo de formulário
Altura 52px, raio 14px, borda 1.5px `#D2C5E3`, fundo `#FAF8FC`, texto 16px. Rótulo acima (13px/600/`#5F5870`). Campos secundários (cidade/UF/CEP/complemento): altura 44px, raio 12px, rótulo 11.5px. Validação: mensagem em `#B3300F`, 13px, abaixo do botão.

### Avaliação (proprietário/hóspede)
Cartão raio 28px; estrelas `#431171` (letter-spacing 3px); depoimento entre aspas curvas; rodapé com avatar de iniciais (44px, degradê roxo), nome 600 e descrição 13.5px `#5F5870`. Proprietários em coluna masonry (3 colunas); hóspedes em **trilho horizontal** com `scroll-snap`.

### Linha de lista (hairline)
Sem bolinhas grandes: marcador pequeno + texto 15–16px, separada por 1px `#ECE7F2`. Mais "limpo" que caixas por item.

### Selo "Em dia" / status
Texto `✓ Em dia` em linhas de um cartão escuro "Rotina do seu imóvel".

### FAQ (acordeão)
Linhas separadas por hairline; botão `+`/`–` circular 34px; item aberto troca para fundo `#431171` e ícone branco.

---

## 6. Degradês de transição (regra mais importante)

**Problema comum:** degradês curtos ou com poucos pontos "quebram" e parecem faixas cinzas. 

**Fórmula validada:**

1. Use **muitos pontos de cor (≈ 20 por lado)** interpolados com curva **suavizada (smootherstep)**: `e = t³(6t² − 15t + 10)`.
2. O caminho de cor passa por **violeta** (`#6E4A9E`), não por cinza: branco → violeta → ink. Isso evita a faixa acinzentada.
3. **Comprimento:** o degradê de entrada/saída deve ocupar **550–700px** (≈ 38–45% da altura da faixa). Se parecer brusco, aumente o *padding* da faixa, não a velocidade da curva.
4. O miolo escuro (`#120A1C`) fica estável entre as duas rampas; é onde moram título e cartões.
5. Faixa escura **sempre** abre e fecha em branco (`#fff`), nunca corta seco na próxima seção.
6. O CTA final é a exceção: abre do branco e **fecha no rodapé** na mesma cor `#120A1C`, sem linha de emenda.

Gerador (Python) usado para os degradês:

```python
def ease(t): return t*t*t*(t*(6*t-15)+10)
# anchors: branco -> #6E4A9E (em e=.6) -> #120A1C
```

Paddings de referência das faixas escuras (desktop): simulador `640px 32px 680px`; "Onde estamos atuando" `560px 32px 580px`; CTA final `560px 32px 120px`. Em telas menores usar `clamp()` (já aplicado no código).

---

## 7. Efeitos (todos suaves)

| Efeito | Onde | Como |
|---|---|---|
| Navbar fixa | Todas as páginas | Pílula flutuante; no topo clara e ampla, ao rolar (>40px) fica **roxo-escura**, mais compacta e com mais blur |
| Spotlight que segue o mouse | Hero | `radial-gradient` 520px, roxo a 14%, posição pelo mouse |
| Grade de fundo | Hero | Linhas 1px roxo a 7%, 64px, com máscara radial |
| Aurora | Hero, faixas escuras | Círculos borrados (`blur 30–40px`), animação `sgAurora` 16–26s |
| Painel 3D | Hero | `perspective(1800px) rotateX(5deg)`, máscara que desvanece embaixo |
| Curva desenhada | Painel | `pathLength=1` + `stroke-dashoffset` (2.2s) |
| Marquee de cidades | Faixa de cidades | 38s linear, máscara lateral de 14% |
| Contagem | Números | 2s, ease-out cúbico, dispara quando entra na tela |
| Toggle deslizante | Comparativo | Indicador que desliza (`.45s`) + barra que cresce |
| Entrada | Hero | `sgFadeUp` escalonado (0.1s, 0.2s, 0.3s) |

Respeitar `prefers-reduced-motion` (já no `sigma.css`).

---

## 8. Imagens de fundo e silhuetas

- Silhuetas de prédios/serra em SVG, com **padrão de janelas** e máscara que desvanece em cima e embaixo (nunca termina em borda seca).
- Hero: prédios claros (`#EFE8F7` + janelas brancas). Faixas escuras: prédios `#1D1031` com janelas `#A68CC4` a 45–55%. Hóspedes: **serra em 3 camadas** (`#E7DEF1`, `#DDD0EC`, `#D2C3E5`).
- Quando houver **fotos reais** dos imóveis/cidades, elas substituem as silhuetas mantendo a mesma máscara de desvanecimento e uma sobreposição roxa a 20–35% para manter o contraste.

---

## 9. Anatomia de uma seção (receita)

1. Eyebrow (12.5px, caixa alta).
2. H2 (Sora 600) com 2–5 palavras em degradê.
3. Parágrafo de apoio (18px, máx. 480–640px de largura).
4. Conteúdo (cartões/lista/gráfico) com 20px de gap.
5. CTA único e claro (botão primário) quando fizer sentido.
6. Transição de saída (degradê ou respiro de 100px+).

Ordem da landing: Hero → cidades → números → simulador (faixa escura) → solução → comparativo → processo → cuidado constante → serviços → resultados → onde estamos atuando (faixa escura) → avaliações de proprietários → avaliações de hóspedes → FAQ → CTA final → rodapé.

---

## 10. Navbar e acessos

- Fixa (`position: fixed`), centralizada, largura `min(1320px, 100% − 24px)`; links: Solução, Comparativo, Processo, Avaliações, FAQ.
- À direita: **Entrar** (menu com *Intranet* e *Proprietário*, hoje **desativados** com a etiqueta "em breve") e **Análise gratuita**.
- Para ativar um acesso: em `Navbar.tsx`, preencher `href` e trocar `enabled: true` no item correspondente.
- Em telas ≤ 960px os links viram menu hambúrguer (painel escuro, raio 15px). Detalhes mobile na seção 14.

---

## 11. Páginas internas (Intranet, Proprietário, cidades)

- Mesmo cabeçalho (`Navbar`) e rodapé (`Footer`); importe `@/styles/sigma.css` e envolva a página em `<div className="sg">`.
- Áreas logadas (Intranet/Proprietário): fundo branco, cartões `#fff` com borda `#E7E2EE`, tabelas com hairlines `#ECE7F2`, cabeçalho de página com eyebrow + H2 menor (`clamp(30px, 3.4vw, 44px)`).
- Onde aparecer um **imóvel/anúncio**, mostrar também "Proprietário(a): nome" com o ícone padrão de mensagem.
- Não alterar tooltips e layouts já aprovados ao incluir funcionalidades novas.

---

## 12. Como reutilizar no código

- `src/styles/sigma.css`: classes `.sg`, `.hd`, `.gt`, `.gtl`, `.lift`, `.btn`, `.rail`, `.navlink` e todas as animações `sg*`.
- `src/lib/css.ts`: helper `css("a:b;c:d")` que aplica o estilo validado no mockup. Para novos blocos, copie o padrão de um componente existente em `src/components/sigma/`.
- Conteúdo editável sem mexer em layout: `src/data/sigma.ts` (números, passos, serviços, casos), `src/data/faq.ts`, `src/data/reviews.ts`.
- Cada seção é um componente isolado; para criar página nova, componha os existentes.

---

## 13. Checklist antes de aprovar uma página

- [ ] Fundo majoritariamente branco; no máximo 1–2 faixas escuras.
- [ ] Só roxo como cor dominante; laranja/magenta apenas em micro-detalhes.
- [ ] Sora nos títulos, DM Sans no corpo; sem serifa/itálico decorativo.
- [ ] Degradês longos (≥ 550px), sem faixa cinza, sem corte seco.
- [ ] Conteúdo dentro de 1240px com margens laterais de 32px.
- [ ] Trilhos roláveis sem item cortado nas bordas.
- [ ] Todos os números têm origem confirmada.
- [ ] Efeitos suaves e com `prefers-reduced-motion` respeitado.
- [ ] Contraste de texto adequado (nunca `#8C849C` em parágrafo longo).
- [ ] Mockup desktop aprovado **antes** do código; mobile depois.

---

## 14. Regras do layout MOBILE (≤ 767px) — validado em mockup

O mobile **não é o desktop espremido**: tem composição própria, validada em mockup (390px de largura). No código, `Index.tsx` troca entre `src/components/sigma/*` (desktop) e `src/components/sigma/mobile/M*.tsx` (mobile) via `useMediaQuery("(max-width: 767px)")`. **Alterou algo no mobile? Altere o componente `M*` correspondente; alterou no desktop? Altere o componente desktop.** Textos compartilhados ficam em `src/data/*`; textos que diferem entre as versões ficam dentro do componente de cada versão.

### Grid e espaçamento
- Margem lateral **20px**; conteúdo sempre em coluna única (exceto números 2×2, cidade/UF e CEP/complemento lado a lado).
- Respiro vertical entre seções: **72–80px** (faixas escuras: ver degradês abaixo).
- Cartões: raio **22–26px**, padding **20–28px**, gap de **12–14px** entre eles. Painéis do hero/simulador: raio 24–26px.

### Tipografia mobile (já ajustada pelo time)
| Elemento | Tamanho |
|---|---|
| H1 (hero) | 33px / 1.05 |
| H2 de seção | 26px (22–23px em títulos longos: FAQ, avaliações, "onde estamos") |
| Números grandes (simulador/comparativo/case) | 40px |
| Números da faixa de indicadores | 30px |
| Parágrafo | 15–16.5px |
| Eyebrow | 12px, `.16em`, caixa alta |
| Rótulo/legenda | 11–13px |

### Componentes
- **Botões:** largura total, altura **54–56px**, raio 16px (hero: pílula 999px). Um por linha, empilhados com 12px de gap.
- **Navbar:** pílula fixa compacta (`top:12px`, `calc(100% − 24px)`), raio **15px** (não 999px). Ao rolar ou abrir o menu, fica escura. Menu aberto: painel escuro raio 15px com os 5 links (17px, hairline), depois Intranet e Proprietário **desativados** ("em breve") e botão "Análise gratuita" em branco (pílula, 54px).
- **Números:** grade 2×2 com hairline de 1px entre as células.
- **Processo:** linha do tempo **vertical** (círculo numerado + linha em degradê roxo).
- **Cuidado constante:** cartão escuro "Rotina do seu imóvel" + 6 cartões horizontais (ícone à esquerda).
- **Serviços:** dois cartões empilhados (gestão escuro, mentoria branco) com linhas hairline.
- **Resultados:** cartões empilhados com mini-curva.
- **Avaliações de proprietários:** cartões empilhados. **Hóspedes:** trilho horizontal com `scroll-snap` e **regra anti-corte** (`padding: 6px 20px 24px`, `scroll-padding: 0 20px`, cartão de 290px para o próximo "espiar" pela borda).
- **FAQ:** acordeão com botão circular de 32px.
- **Formulário:** cidade+UF e CEP+complemento em duas linhas de dois campos; demais campos em largura total.

### Degradês mobile
Mesma fórmula suavizada da seção 6, porém **mais curtos** (≈ 300–330px): simulador `padding 310px 20px 330px`; "onde estamos" `290px 20px 310px`; CTA final `310px 20px 90px`. Nunca cortar seco.

### Efeitos mobile
Sem spotlight de mouse nem painel 3D. Mantêm-se: aurora, marquee de cidades, contagem dos números, toggle deslizante, entrada suave. Alvos de toque ≥ 44px.

### Checklist mobile
- [ ] Sem rolagem horizontal da página (`scrollWidth == 390`).
- [ ] Botões ≥ 54px, campos ≥ 44px.
- [ ] Trilhos com anti-corte e dentro das margens de 20px.
- [ ] Textos longos sem estourar (títulos até 3 linhas).
- [ ] Menu fecha ao tocar em um link.
- [ ] Mockup mobile aprovado **antes** de qualquer mudança de código.

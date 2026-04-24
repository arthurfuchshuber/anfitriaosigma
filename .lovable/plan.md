
# Landing Page — Anfitrião Sigma

Landing page única, **mobile-first**, com estética **black piano** (preto profundo + magenta vibrante #fe00bf + roxo #71007e), animações sutis, glassmorphism e tipografia sans-serif premium de alto contraste.

Todos os CTAs abrem **WhatsApp (47 99675-9381)** com mensagem pré-preenchida diferente conforme o botão (ex: gestão, mentoria, análise gratuita).

---

## 🎨 Identidade Visual

- **Paleta:** preto profundo `#000000` (base), magenta `#fe00bf` (CTAs e destaques), roxo `#71007e` (gradientes e elementos secundários)
- **Acabamentos:** gradientes sutis magenta→roxo, glow nos CTAs, glassmorphism em cards, bordas finas luminosas, ruído sutil no fundo para textura premium
- **Tipografia:** sans-serif moderna (ex: Inter / Space Grotesk) — pesos contrastantes, headlines grandes e tight, corpo respirado
- **Animações:** fade-in e slide-up no scroll, hover com glow nos botões, micro-interações nos cards, números animados (counters)
- Imagens dos fundadores entram como **placeholders elegantes** prontos para você substituir depois

---

## 🧱 Estrutura da Página (seções na ordem)

### 1. Navbar fixa minimalista
Logo "Anfitrião Sigma" + links âncora (Serviços, Comparativo, Sobre, Contato) + botão CTA magenta

### 2. Hero — acima da dobra
- **Headline:** "Transforme seu imóvel em uma máquina de renda — sem esforço"
- **Subheadline:** "Nós cuidamos de tudo. Você só acompanha os lucros."
- **CTA primário (magenta, com glow):** "Quero maximizar meu imóvel" → WhatsApp (mensagem de gestão)
- **CTA secundário (outline):** "Quero aprender a faturar com hospedagem" → WhatsApp (mensagem de mentoria)
- Lateral direita: card glassmorphism com **placeholder dos dois fundadores** (homem + mulher), badge "Fundadores" e selo de autoridade
- Indicadores rápidos abaixo: "+300% receita média", "100+ imóveis", "Nota 4.9★"

### 3. Comparativo de Receita (bloco-âncora)
- **Tabela visual fixa** lado a lado: Aluguel Tradicional vs Temporada
  - Receita bruta, custos, receita líquida, ocupação, valorização
  - Coluna temporada destacada em magenta/roxo com badge "Recomendado"
- **Calculadora interativa abaixo:** input "Quanto seu imóvel rende hoje por mês?" → mostra projeção animada de quanto poderia render por temporada (multiplicador realista ~2.8x a 3.5x)
- Frase de impacto: *"O que você ganha em 1 mês no aluguel tradicional, pode ganhar em poucos dias com estratégia."*
- CTA: "Quero essa receita no meu imóvel"

### 4. Problema & Solução
- Layout em duas colunas: **Dores** (vermelho sutil) vs **Soluções** (magenta)
  - Baixa rentabilidade → Otimização inteligente de preço
  - Inadimplência → Pagamento antecipado por hóspede
  - Dor de cabeça com inquilinos → Hóspedes verificados, gestão 360°
  - Tempo perdido → Automação total

### 5. Serviços (dois cards premium)
- **Card 1 — Gestão Completa:** "Você não faz nada. Nós fazemos tudo." Lista: fotos profissionais, anúncios multi-plataforma, precificação dinâmica, atendimento 24/7, limpeza, manutenção. CTA WhatsApp.
- **Card 2 — Mentoria Sigma:** "Aprenda a escalar como um profissional." Lista: posicionamento, pricing, automação, estratégias validadas. CTA WhatsApp.

### 6. Prova / Autoridade
- Faixa com **3 números animados** (counters): +300% receita, 100+ imóveis geridos, 98% taxa de ocupação
- **3 depoimentos** em cards glassmorphism (nomes/cidades fictícios realistas com avatares iniciais)
- Mini-cases: "Apto 45m² em Balneário Camboriú: R$2.800 → R$9.400/mês"

### 7. Sobre os Fundadores
- Layout com **placeholder de foto profissional dos dois** + bio humanizada
- Texto: experiência, visão, propósito
- Frase âncora: *"Nós criamos a Anfitrião Sigma para transformar imóveis comuns em ativos altamente lucrativos."*

### 8. CTA Final (alta intensidade)
- Fundo gradiente magenta→roxo com glow
- Headline: "Seu imóvel pode estar rendendo muito mais."
- Botão grande: "Quero uma análise gratuita"
- Selo de urgência: "⚡ Vagas limitadas para novos imóveis este mês"

### 9. FAQ (acordeão)
- 5–6 perguntas: comissão, regiões atendidas, tempo de implementação, mentoria online/presencial, garantias

### 10. Footer
Logo, contato (WhatsApp clicável), redes sociais (placeholders), copyright

---

## ⚙️ Técnico

- **Stack:** React + Tailwind + shadcn (já no projeto)
- Tokens de design (preto/magenta/roxo) configurados em `index.css` e `tailwind.config.ts` — nada hardcoded
- Componentes reutilizáveis: `Hero`, `RevenueCompare`, `RevenueCalculator`, `PainSolution`, `ServiceCard`, `StatsBar`, `Testimonials`, `Founders`, `FinalCTA`, `FAQ`, `Footer`
- Helper `openWhatsApp(message)` centralizando o número 47 99675-9381
- Animações de scroll com Intersection Observer + classes Tailwind
- 100% responsivo, otimizado para tráfego pago (semântica, performance, sem libs pesadas)

---

## 📌 Itens que você poderá trocar facilmente depois
- Fotos reais dos fundadores (2 placeholders marcados)
- Logo da marca (texto agora, imagem depois)
- Depoimentos reais (substituir os fictícios)
- Número de WhatsApp (centralizado em um único arquivo)

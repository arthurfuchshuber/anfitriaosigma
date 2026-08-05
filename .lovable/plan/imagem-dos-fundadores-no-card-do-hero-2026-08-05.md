# Imagem dos fundadores no card do Hero

Colocar a ilustração enviada (casal com laptop, mala, rodo e balde) no card "Fundadores" do Hero, substituindo o placeholder das iniciais AT/JT — com o fundo bege trocado por preto piano, mantendo a folha do Canadá e o skyline visíveis em tom escuro sutil.

## Como tratar a imagem

O fundo bege não é "vazio": a folha do Canadá e os prédios estão desenhados nele com contraste muito baixo. Remover o fundo apagaria os dois. Por isso:

1. Editar a imagem por IA pedindo: trocar o fundo bege por preto profundo (#0a0a0a), mantendo a folha e o skyline como silhuetas sutis em cinza-escuro/magenta muito baixo, sem alterar as pessoas nem os objetos.
2. Conferir o resultado. Se a folha/skyline sumirem ou o recorte ficar sujo, plano B: manter o fundo original e aplicar máscara radial + `mix-blend` no card para o bege escurecer e fundir com o preto do site.
3. Subir o arquivo final via Lovable Assets (CDN) e importar o pointer `.asset.json` — sem binário no repositório.

## Onde entra

`src/components/landing/Hero.tsx`, dentro do card "Fundadores":

- O bloco `aspect-[4/5]` com os círculos "AT/JT" e o selo "Foto dos fundadores" é substituído por `<img>` com `object-cover object-top`, `alt` descritivo e `loading="eager"` (está acima da dobra).
- Mantém-se o container arredondado, o `gradient-border`, o glow e o ruído já existentes.
- Um gradiente sutil de baixo para cima (`from-background`) sobre a imagem garante que a base funda com o card.
- Badge "Fundadores" e o selo "Top performance" continuam como estão.

## Técnico

- Nenhuma cor hardcoded: gradiente e overlay usam tokens (`background`, `primary`, `secondary`) já definidos em `index.css`.
- Imagem responsiva; no mobile o card aparece abaixo do texto, como hoje.
- Nada de lógica nova — apenas apresentação.

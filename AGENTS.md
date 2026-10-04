# Instruções para agentes (Lovable / Claude)

Antes de criar ou alterar qualquer tela, componente ou estilo, leia **`PLAYBOOK-LAYOUT-DESIGN.md`** (raiz do projeto) e siga-o à risca.

- Base branca, roxo `#431171` como cor da marca; laranja/magenta só em micro-detalhes.
- Títulos em Sora, corpo em DM Sans; sem serifa/itálico decorativo.
- Reutilize `src/components/sigma/*`, `src/styles/sigma.css` e `css()` de `src/lib/css.ts`.
- Conteúdo editável em `src/data/*`.
- Mudança de layout/visual: apresentar mockup e aguardar validação antes de implementar. Ao ajustar uma parte, mudar somente ela.
- Desktop e mobile são composições separadas (`sigma/*` e `sigma/mobile/M*`); ajuste o componente da versão correspondente.

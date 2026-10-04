# Instruções para agentes (Lovable / Claude)

Antes de criar ou alterar qualquer tela, componente ou estilo, leia **`PLAYBOOK-LAYOUT-DESIGN.md`** (raiz do projeto) e siga-o à risca.

- Base branca, roxo `#431171` como cor da marca; laranja/magenta só em micro-detalhes.
- Títulos em Sora, corpo em DM Sans; sem serifa/itálico decorativo.
- Reutilize `src/components/sigma/*`, `src/styles/sigma.css` e `css()` de `src/lib/css.ts`.
- Conteúdo editável em `src/data/*`.
- Mudança de layout/visual: apresentar mockup e aguardar validação antes de implementar. Ao ajustar uma parte, mudar somente ela.
- Desktop e mobile são composições separadas (`sigma/*` e `sigma/mobile/M*`); ajuste o componente da versão correspondente.

## Regras permanentes (valem para TODO o ecossistema)

1. **Logomarca**: a única logomarca válida é o σ oficial (`public/logo-sigma.png`, quadrado com degradê; `public/logo-sigma-mark.png` = σ branco sem fundo, para usar sobre fundos coloridos). Use o componente `src/components/sigma/SigmaLogo.tsx`. Favicon, ícones de aba, apple-touch-icon, manifest, login da Intranet, e-mails e tela de consentimento do Google devem usar exatamente esse ícone. Nunca usar logo/ícone padrão do Lovable, Vite ou texto "σ" improvisado.
2. **Preview do link (Open Graph) sempre VIVO**: toda vez que `anfitriaosigma.com.br` for colado em qualquer lugar (LinkedIn, WhatsApp, Slack…), a imagem deve ser o topo da landing page **ao vivo**, gerada a partir do site publicado — nunca uma imagem anexada/estática. Em `index.html`, `og:image` e `twitter:image` apontam para o serviço de screenshot (microlink) com `url=https://anfitriaosigma.com.br/`. Não substituir por arquivo estático.
3. **Intranet**: segue o mesmo playbook (base branca, roxo #431171). Regras de negócio do cálculo ficam no banco (`supabase/migrations`), nunca no front.
4. **Campos com máscara ou seleção — sempre**: nenhum campo de texto livre quando existe formato. Data → calendário (`DateInput`); telefone → DDI + máscara (`PhoneInput`); CPF/CNPJ → máscara + dígitos (CNPJ com consulta ATIVO na Receita, `CnpjInput`); CEP com preenchimento automático; UF/banco/parentesco/regime em lista; PIX com máscara por tipo; dinheiro/percentual com máscara. Use `src/components/intranet/fields.tsx` e `src/lib/intranet/masks.ts`.
5. **Cadastro pendente**: campo obrigatório novo → registrar em `required_fields` (banco) e em `src/lib/intranet/cadastro.ts`; o bloqueio e a página `/intranet/cadastro` (acordeão, uma página, sem "tripa") aparecem automaticamente. Em PF o RG é obrigatório.

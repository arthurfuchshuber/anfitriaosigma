# Intranet Anfitrião Sigma — guia de instalação

A Intranet vive em `/intranet` (mesmo projeto da landing). O botão **Entrar → Intranet** do menu já está ligado.
Banco, login e e-mails ficam 100% no **Supabase** (sem planilhas).

## 1. Supabase
1. Crie (ou use) um projeto Supabase. Em **Project Settings → API** copie a URL e a chave `anon`.
2. No projeto/hospedagem defina:
   - `VITE_SUPABASE_URL`
   - `VITE_SUPABASE_PUBLISHABLE_KEY`  (modelo em `.env.example`)
3. **SQL Editor**: rode, em ordem, os 7 arquivos de `supabase/migrations/`:
   `…01_schema.sql` → `…02_engine.sql` → `…03_rpc.sql` → `…04_rls.sql` → `…05_pending.sql` (cadastro pendente) → `…06_grants.sql` (permissões da API de dados; no Lovable Cloud sem isso o app não lê nenhuma tabela) → `…07_pj_flow.sql` (fluxo PJ sem repetição, contato de referência com endereço).
   No Lovable Cloud a gravação direta em `storage.buckets` é recusada: crie os buckets **avatars** (público) e **invoices** (privado) pela ferramenta de Storage (o arquivo 04 já ignora o erro e segue).
   (Ou `supabase db push` com a CLI.) O arquivo 04 agenda a validação automática diária via `pg_cron`; se a extensão não existir, ative em *Database → Extensions* e agende `select public.run_validation();` 1×/dia.
4. **Authentication → Providers → Google**: ative, informe Client ID/Secret do Google Cloud.
   - *Redirect URL* do Google Cloud: `https://SEU-PROJETO.supabase.co/auth/v1/callback`
   - Em **Authentication → URL Configuration**: Site URL `https://anfitriaosigma.com.br` e adicione `https://anfitriaosigma.com.br/intranet/areas` (e o domínio de preview) em *Redirect URLs*.
5. **Domínio restrito**: já garantido no banco (gatilho `enforce_company_domain`): qualquer e-mail fora de `@anfitriaosigma.com.br` é recusado no cadastro. O primeiro acesso de `sigma@anfitriaosigma.com.br` vira **admin** com todas as áreas liberadas.

## 2. E-mail de "Solicitar acesso" → sigma@anfitriaosigma.com.br
```
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set MAIL_FROM="Intranet Anfitrião Sigma <intranet@anfitriaosigma.com.br>"   # domínio verificado no Resend
supabase secrets set NOTIFY_TO=sigma@anfitriaosigma.com.br
supabase secrets set SITE_URL=https://anfitriaosigma.com.br
supabase functions deploy notify-access-request
supabase functions deploy log-event
supabase functions deploy cnpj-lookup      # consulta de CNPJ ATIVO na Receita (BrasilAPI, reserva CNPJ.ws); exige login
```
Sem `MAIL_FROM` o Resend usa `onboarding@resend.dev` (só entrega para o e-mail dono da conta Resend). O pedido sempre fica registrado em **Pessoas → Solicitações**, mesmo se o e-mail falhar.

## 3. Logo na tela de login do Google (em vez do logo do Lovable)
A tela "Fazer login com o Google" é controlada pelo Google Cloud: **APIs e serviços → Tela de consentimento OAuth → Branding**: nome do app *Anfitrião Sigma*, logo = `public/logo-sigma.png`, domínio `anfitriaosigma.com.br`. Use um **Client ID próprio** (não o do Lovable Cloud). Em *Supabase → Authentication → Email Templates* use o mesmo logo (`https://anfitriaosigma.com.br/logo-sigma.png`).

## 4. Preview vivo do link
`index.html` usa `og:image` apontando para um serviço de screenshot (microlink) que fotografa o topo de `https://anfitriaosigma.com.br` na hora. Sem imagem anexada. Observações: LinkedIn/WhatsApp guardam cache do preview (o LinkedIn por até ~7 dias — use o *Post Inspector* para forçar a atualização); o plano gratuito do microlink tem limite de requisições — se o tráfego crescer, assine um plano ou hospede uma função de screenshot própria.

## 5. Fluxo de acesso
Login Google → **/intranet/areas** → ao clicar numa área sem permissão: *Solicitar acesso* → e-mail ao gestor → **Aguardando aprovação** → gestor aprova/nega em *Metas e Vendas → Pessoas → Solicitações* → a área libera. Para ativar outra área ("em breve"), mude `active: true` em `src/lib/intranet/areas.ts` e crie a rota.

## 6. Premissas assumidas (confira)
- Venda validada = `data da venda + 10 dias`. Atingimento e bônus usam só vendas **validadas**; pendentes aparecem separadas.
- `caixa_pct` do produto = parte do valor da venda que entra em caixa (base do alerta Comissão ÷ caixa ≤ 15%).
- Múltiplo histórico em **dias corridos**: mês vigente até o dia 25 (25 ÷ dias do mês no denominador) + os 2 meses anteriores inteiros.
- Salário fixo da nota/folha = salário vigente do mês (sem proporcional de entrada).
- Gestor vê CPF/CNPJ/RG/PIX **mascarados**; só o dono altera.
- A nota fiscal é um *espelho* gerado pelo sistema; a NFS-e oficial é emitida no portal da prefeitura.

## 7. Testes
`npm test` roda os testes do front e do **motor SQL** (PGlite): meta do Dárcio = R$ 18.937, rampa, reajuste não retroativo, duplicidade, piso, validação automática, log imutável, dados sensíveis, solicitação de acesso.


## 8. Cadastro pendente (campos obrigatórios)
- Qualquer campo obrigatório vazio **bloqueia** as áreas e leva à página única `/intranet/cadastro` (itens recolhidos, um aberto por vez, PF/PJ).
- Colaborador: identificação (PF: CPF + RG · PJ: CNPJ + razão social), contato, endereço (CEP), emergência, PIX e banco. Gestor/admin também preenchem a **empresa** (CNPJ, endereço, responsável legal, banco).
- Quem é obrigatório vive na tabela `required_fields` (coluna `since` = desde quando). Gestor liga/desliga em **Cadastros → Campos obrigatórios**; ao ligar, quem estiver com o campo vazio é bloqueado no próximo acesso. "Lembrar" envia aviso interno.
- **Novo campo no futuro**: (1) coluna no banco, (2) `insert into required_fields …`, (3) um item em `src/lib/intranet/cadastro.ts` e um `case` em `field_value()` na migration. A pendência reaparece sozinha para todos.
- CNPJ: dígitos validados no banco e situação ATIVA confirmada na Receita (edge function `cnpj-lookup`); CNPJ baixado/inapto é recusado. Se a Receita estiver fora do ar, salva como "sem confirmação". CPF: só dígitos (a Receita não permite consultar a situação do CPF gratuitamente).

### 8.1 Fluxo PF / PJ (v2)
- A página é **uma lista só, sem abas**. PF/PJ escolhe-se no 1º item (Identificação).
- **Gestor/admin PJ**: o banco espelha (só onde a empresa está vazia) CNPJ, razão social, fantasia, inscrição municipal, banco/agência/conta e os dados do responsável legal (nome, CPF, nascimento, celular) para `company_info` — função `sync_company_from_manager` (migration 07). Por isso a empresa NÃO pergunta de novo; sobram só regime tributário, endereço e contato da empresa.
- **Representante legal (PJ)**: CPF, RG, e-mail pessoal, celular e endereço completo — com a chavezinha **"Usar os dados da empresa"** (copia telefone/e-mail e endereço da etapa da empresa).
- **Contato de referência**: nome completo, relacionamento, telefone e endereço (todos obrigatórios, exceto complemento).
- **Inscrição municipal** não é obrigatória (PF/PJ nem empresa).

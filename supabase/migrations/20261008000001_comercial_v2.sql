-- =====================================================================
-- Comercial v2 — modelo novo (mockups validados em 08/10/2026).
-- Prefixo cm_ = Comercial. Substitui, na prática, o modelo antigo (sales, products, params...):
-- as tabelas antigas continuam no banco, mas NADA do app novo as usa (podem ser removidas depois).
-- Regras: docs/comercial/DECISOES.md (decisões 1–44). Todo cálculo oficial vive aqui; o front só exibe.
-- Rodar depois das migrations 01–08.
-- =====================================================================

-- ---------- Relógio (permite testar com data fixa: set cm.today / cm.now) ----------------------
create function public.cm_today() returns date language sql stable as $$
  select coalesce(nullif(current_setting('cm.today', true), '')::date, (now() at time zone 'America/Sao_Paulo')::date) $$;
create function public.cm_now() returns timestamp language sql stable as $$
  select coalesce(nullif(current_setting('cm.now', true), '')::timestamp, (now() at time zone 'America/Sao_Paulo')) $$;

-- ---------- Cadastros ---------------------------------------------------------------------------
create table public.cm_empresas (            -- linha de negócio; o PESO da meta é por empresa
  id    uuid primary key default gen_random_uuid(),
  name  text not null unique,                 -- "Cherry Publicidade"
  linha text not null,                        -- nome de exibição no peso: "Marketing p/ Anfitriões"
  peso  numeric not null default 0 check (peso between 0 and 1),   -- peso padrão (vira regra do mês)
  sort  int not null default 0
);

create table public.cm_products (
  id          uuid primary key default gen_random_uuid(),
  empresa_id  uuid not null references public.cm_empresas (id),
  name        text not null unique,
  gera_caixa  boolean not null default true,  -- false = "Sem Caixa · Estimado" (bruto = valor estimado)
  fidelidade  boolean not null default false,
  periodo_min int not null default 12 check (periodo_min between 1 and 60),
  active      boolean not null default true,
  sort        int not null default 0,
  created_at  timestamptz not null default now()
);

create table public.cm_cobrancas (            -- "Pagamento Integral" e/ou "Recorrência"
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.cm_products (id) on delete cascade,
  kind       text not null check (kind in ('integral', 'recorrencia')),
  bruto      numeric not null check (bruto >= 0),
  liquido    numeric check (liquido >= 0),     -- null = "Pelas Taxas" (ou = bruto se não houver taxa)
  unique (product_id, kind)
);

create table public.cm_product_formas (       -- formas aceitas, parcelamento e taxa (fração: 0.133 = 13,3%)
  product_id  uuid not null references public.cm_products (id) on delete cascade,
  forma       text not null check (forma in ('cartao', 'pix', 'boleto')),
  parcela     boolean not null default false,
  max_parcelas int not null default 1 check (max_parcelas between 1 and 24),
  taxa        numeric not null default 0 check (taxa >= 0 and taxa < 1),
  primary key (product_id, forma)
);

create table public.cm_seniorities (
  id     uuid primary key default gen_random_uuid(),
  name   text not null unique,
  weight numeric not null check (weight > 0),
  salary numeric not null check (salary >= 0),
  sort   int not null default 0
);

create table public.cm_sellers (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid unique references auth.users (id) on delete set null,
  name           text not null,
  seniority_id   uuid not null references public.cm_seniorities (id),
  start_date     date not null,
  effective_from date not null,                -- decisão 19: cadastro depois do dia 28 só vale no mês seguinte
  end_date       date,
  active         boolean not null default true,
  salary_override numeric check (salary_override >= 0),   -- só ADMIN altera (decisão 23)
  created_at     timestamptz not null default now()
);

create table public.cm_seller_log (           -- histórico de alterações (salário, peso, senioridade, gatilho...)
  id        bigint generated always as identity primary key,
  seller_id uuid not null references public.cm_sellers (id) on delete cascade,
  at        timestamptz not null default now(),
  by_user   uuid,
  field     text not null,
  old_value text,
  new_value text
);

-- ---------- Regras por mês (vigência) ----------------------------------------------------------
create table public.cm_months (
  month        date primary key check (month = date_trunc('month', month)::date),
  rules        jsonb not null,
  published_at timestamptz not null default now(),
  published_by uuid,
  unlocked     boolean not null default false      -- admin autorizou alterar mês travado
);

create table public.cm_unlock_requests (
  id           uuid primary key default gen_random_uuid(),
  month        date not null,
  requested_by uuid not null,
  requested_at timestamptz not null default now(),
  status       text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  decided_by   uuid,
  decided_at   timestamptz
);

-- ---------- Vendas ------------------------------------------------------------------------------
create table public.cm_sales (
  id              uuid primary key default gen_random_uuid(),
  seller_id       uuid not null references public.cm_sellers (id),
  product_id      uuid not null references public.cm_products (id),
  cobranca_id     uuid not null references public.cm_cobrancas (id),
  cliente         text not null,
  status          text not null default 'aguardando_pagamento'
                  check (status in ('aguardando_pagamento', 'em_prazo', 'validada', 'cancelada')),
  registered_at   date not null default public.cm_today(),
  month           date not null,                    -- mês da venda = mês do 1º pagamento confirmado (antes: mês do registro)
  first_payment_at date,
  confirmed_by    uuid,
  prazo_dias      int,                              -- prazo vigente no mês do 1º pagamento (guardado na venda)
  cancelavel_ate  date,
  validada_em     date,
  comprovante     text,                             -- caminho no bucket "comprovantes"
  cancelled_at    timestamptz,
  cancelled_by    uuid,
  cancel_reason   text,
  created_by      uuid,
  created_at      timestamptz not null default now()
);
create index cm_sales_seller_month on public.cm_sales (seller_id, month);
create index cm_sales_status on public.cm_sales (status, cancelavel_ate);

create table public.cm_sale_payments (        -- cada forma de pagamento da venda
  id        uuid primary key default gen_random_uuid(),
  sale_id   uuid not null references public.cm_sales (id) on delete cascade,
  forma     text not null check (forma in ('cartao', 'pix', 'boleto')),
  bruto     numeric not null check (bruto >= 0),
  liquido   numeric not null check (liquido >= 0),
  parcelas  int not null default 1 check (parcelas between 1 and 24),
  first_date date not null,                   -- data do pagamento (à vista/cartão) ou da 1ª parcela
  paid_at   date,                             -- null = ainda não pago/confirmado
  sort      int not null default 0
);
create index cm_sale_payments_sale on public.cm_sale_payments (sale_id);

-- ---------- Congelamento e ajustes ---------------------------------------------------------------
create table public.cm_freezes (
  month     date primary key,
  frozen_at timestamptz not null default now(),
  rows      jsonb not null                      -- [{seller_id, meta, pontos, atingimento, gatilho, fator, salario, bonus}]
);

create table public.cm_adjustments (          -- cancelamento depois do congelamento (decisão 38)
  id         uuid primary key default gen_random_uuid(),
  month      date not null,
  sale_id    uuid not null references public.cm_sales (id),
  seller_id  uuid not null references public.cm_sellers (id),
  decision   text not null check (decision in ('manter', 'ajustar')),
  motivo     text,
  pontos_antes numeric, pontos_depois numeric,
  bonus_antes numeric, bonus_depois numeric,
  review_pending boolean not null default false,   -- cancelado pelo próprio vendedor: gestor revisa
  decided_by uuid,
  decided_at timestamptz not null default now()
);

-- ---------- Seeds (valores validados nos mockups) -------------------------------------------------
insert into public.cm_empresas (name, linha, peso, sort) values
  ('Imóveis', 'Gestão', 0.35, 1), ('Cherry Publicidade', 'Marketing p/ Anfitriões', 0.40, 2),
  ('Conciergeia', 'ConciergeIA', 0.15, 3), ('Orks', 'Orks Tech', 0.10, 4);

insert into public.cm_seniorities (name, weight, salary, sort) values
  ('Júnior', 1, 1800, 1), ('Pleno', 1.5, 2570, 2), ('Sênior', 2, 3500, 3);

do $$
declare e_imo uuid; e_cher uuid; e_con uuid; e_ork uuid; p uuid;
begin
  select id into e_imo from public.cm_empresas where name = 'Imóveis';
  select id into e_cher from public.cm_empresas where name = 'Cherry Publicidade';
  select id into e_con from public.cm_empresas where name = 'Conciergeia';
  select id into e_ork from public.cm_empresas where name = 'Orks';

  insert into public.cm_products (empresa_id, name, gera_caixa, sort) values (e_imo, 'Gestão Parcial de Airbnb', false, 1) returning id into p;
  insert into public.cm_cobrancas (product_id, kind, bruto) values (p, 'integral', 1000);
  insert into public.cm_product_formas values (p, 'pix', false, 1, 0), (p, 'boleto', false, 1, 0.025);
  insert into public.cm_products (empresa_id, name, gera_caixa, sort) values (e_imo, 'Gestão Completa de Airbnb', false, 2) returning id into p;
  insert into public.cm_cobrancas (product_id, kind, bruto) values (p, 'integral', 1000);
  insert into public.cm_product_formas values (p, 'pix', false, 1, 0), (p, 'boleto', false, 1, 0.025);

  insert into public.cm_products (empresa_id, name, gera_caixa, fidelidade, periodo_min, sort) values (e_cher, 'Marketing p/ Anfitriões', true, true, 12, 3) returning id into p;
  insert into public.cm_cobrancas (product_id, kind, bruto) values (p, 'integral', 18000), (p, 'recorrencia', 3000);
  insert into public.cm_product_formas values (p, 'cartao', true, 12, 0.133), (p, 'pix', true, 6, 0), (p, 'boleto', true, 6, 0.025);

  insert into public.cm_products (empresa_id, name, gera_caixa, sort) values (e_con, 'ConciergeIA', true, 4) returning id into p;
  insert into public.cm_cobrancas (product_id, kind, bruto) values (p, 'recorrencia', 499);
  insert into public.cm_product_formas values (p, 'pix', false, 1, 0), (p, 'boleto', false, 1, 0.025);

  insert into public.cm_products (empresa_id, name, gera_caixa, sort) values (e_ork, 'Orks Tech', true, 5) returning id into p;
  insert into public.cm_cobrancas (product_id, kind, bruto) values (p, 'recorrencia', 899);
  insert into public.cm_product_formas values (p, 'pix', false, 1, 0), (p, 'boleto', false, 1, 0.025);
end $$;

-- Feriados nacionais (nome como nos mockups)
update public.holidays set name = 'Nossa Senhora Aparecida' where name = 'Nossa Sra. Aparecida';

-- =====================================================================
-- MOTOR
-- =====================================================================
create function public.cm_role() returns text language sql stable security definer set search_path = public as $$
  select role::text from public.user_roles where user_id = auth.uid() $$;

create function public.cm_my_seller() returns uuid language sql stable security definer set search_path = public as $$
  select id from public.cm_sellers where user_id = auth.uid() $$;

create function public.cm_assert_manager() returns void language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão: só gestor ou admin'; end if;
end $$;

-- Mês travado = a partir do dia 28 do mês anterior (decisão 27), salvo autorização do admin.
create function public.cm_locked(m date) returns boolean language sql stable security definer set search_path = public as $$
  select public.cm_today() >= ((public.month_start(m) - interval '1 month')::date + 27)
     and not coalesce((select unlocked from public.cm_months where month = public.month_start(m)), false) $$;

-- ---------- Regras (padrão a partir dos cadastros) ---------------------------------------------
create function public.cm_seed_rules() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'custo', 30000, 'pct', 1,
    'seniorities', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'weight', weight, 'salary', salary) order by sort) from public.cm_seniorities), '[]'::jsonb),
    'gatilho', jsonb_build_object('entrada', 0.7, 'm1', 0.7, 'm2', 0.8, 'm3', 0.9, 'm4', 1.0),
    'regua', jsonb_build_object('on', true, 'leve', 0.8, 'padrao', 1.0, 'acel', 1.3, 'max', 1.6, 'acel_de', 1.2, 'max_de', 1.5),
    'pesos', coalesce((select jsonb_object_agg(id::text, peso) from public.cm_empresas), '{}'::jsonb),
    'valores', coalesce((select jsonb_object_agg(c.id::text, jsonb_build_object('bruto', c.bruto, 'liquido', c.liquido)) from public.cm_cobrancas c), '{}'::jsonb),
    'operacao', jsonb_build_object('corte', 25, 'folha', 5, 'bonus', 10, 'prazo', 7)) $$;

-- Regras efetivas do mês: publicadas; senão as do último mês publicado anterior; senão o padrão.
create function public.cm_rules(m date) returns jsonb language sql stable security definer set search_path = public as $$
  select coalesce(
    (select rules from public.cm_months where month = public.month_start(m)),
    (select rules from public.cm_months where month < public.month_start(m) order by month desc limit 1),
    public.cm_seed_rules()) $$;

create function public.cm_month_status(m date) returns text language sql stable security definer set search_path = public as $$
  select case
    when public.month_start(m) = public.month_start(public.cm_today()) then 'em_vigor'
    when public.month_start(m) < public.month_start(public.cm_today()) then 'encerrado'
    when exists (select 1 from public.cm_months where month = public.month_start(m)) then 'programado'
    else 'sem_regras' end $$;

-- ---------- Pontos de cada cobrança --------------------------------------------------------------
-- forma de referência = 1ª aceita na ordem cartão, pix, boleto (taxa que converte bruto em líquido)
create function public.cm_ref_taxa(p_product uuid) returns numeric language sql stable security definer set search_path = public as $$
  select coalesce((select taxa from public.cm_product_formas where product_id = p_product
                   order by case forma when 'cartao' then 1 when 'pix' then 2 else 3 end limit 1), 0) $$;

-- Líquido da cobrança: digitado > pelas taxas (se gera caixa) > bruto
create function public.cm_cobranca_liquido(p_cob uuid, p_valores jsonb default null) returns numeric
language plpgsql stable security definer set search_path = public as $$
declare c public.cm_cobrancas; pr public.cm_products; bruto numeric; liq numeric;
begin
  select * into c from public.cm_cobrancas where id = p_cob;
  select * into pr from public.cm_products where id = c.product_id;
  bruto := coalesce((p_valores -> p_cob::text ->> 'bruto')::numeric, c.bruto);
  liq := case when p_valores is null then c.liquido else (p_valores -> p_cob::text ->> 'liquido')::numeric end;
  if liq is not null then return liq; end if;
  if pr.gera_caixa then return round(bruto * (1 - public.cm_ref_taxa(pr.id)), 2); end if;
  return bruto;
end $$;

-- ---------- Calendário ---------------------------------------------------------------------------
create function public.cm_calendar(m date) returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'month', public.month_start(m),
    'dias_uteis', public.business_days(public.month_start(m), public.month_end(m)),
    'feriados', coalesce((select jsonb_agg(jsonb_build_object('dia', to_char(day, 'DD/MM'), 'nome', name) order by day)
                          from public.holidays where day between public.month_start(m) and public.month_end(m)
                            and extract(isodow from day) < 6), '[]'::jsonb)) $$;

-- ---------- Vendedor: entrada, mês de casa, gatilho, salário -------------------------------------
create function public.cm_eff_start(s public.cm_sellers) returns date language sql immutable as $$
  select greatest(s.start_date, s.effective_from) $$;

create function public.cm_seller_in_month(s public.cm_sellers, m date) returns boolean language sql stable as $$
  select public.cm_eff_start(s) <= public.month_end(m)
     and ((s.end_date is null and s.active) or s.end_date >= public.month_start(m)) $$;

-- Mês de casa: 0 = mês de entrada; 1 = mês seguinte... (decisão 10)
create function public.cm_house_month(s public.cm_sellers, m date) returns int language sql immutable as $$
  select (extract(year from public.month_start(m)) * 12 + extract(month from public.month_start(m))
        - extract(year from public.cm_eff_start(s)) * 12 - extract(month from public.cm_eff_start(s)))::int $$;

create function public.cm_house_label(n int) returns text language sql immutable as $$
  select case when n <= 0 then 'Mês de Entrada' when n >= 4 then 'Mês 4 em diante' else 'Mês ' || n end $$;

-- Gatilho mínimo: Mês 1 70 / 2 80 / 3 90 / 4+ 100; mês de entrada = 70% × dias úteis restantes ÷ dias úteis do mês
create function public.cm_gatilho(s public.cm_sellers, m date, rules jsonb) returns numeric
language plpgsql stable security definer set search_path = public as $$
declare n int := public.cm_house_month(s, m); g jsonb := rules -> 'gatilho'; du int; rest int;
begin
  if n <= 0 then
    du := public.business_days(public.month_start(m), public.month_end(m));
    rest := public.business_days(greatest(public.cm_eff_start(s), public.month_start(m)), public.month_end(m));
    return round(coalesce((g ->> 'entrada')::numeric, 0.7) * rest / nullif(du, 0), 4);
  end if;
  return (g ->> case when n >= 4 then 'm4' else 'm' || n end)::numeric;
end $$;

create function public.cm_seller_salary(s public.cm_sellers, rules jsonb) returns numeric language sql stable as $$
  select coalesce(s.salary_override, (select (x ->> 'salary')::numeric from jsonb_array_elements(rules -> 'seniorities') x where (x ->> 'id')::uuid = s.seniority_id)) $$;

create function public.cm_seller_weight(s public.cm_sellers, rules jsonb) returns numeric language sql stable as $$
  select (select (x ->> 'weight')::numeric from jsonb_array_elements(rules -> 'seniorities') x where (x ->> 'id')::uuid = s.seniority_id) $$;

-- ---------- Régua (acelerador / detrator) ---------------------------------------------------------
-- abaixo do gatilho = ×0 (detrator forte); do gatilho a 99,9% = ×0,8 (só existe se gatilho < 100%); 100–119,9 ×1; 120–149,9 ×1,3; ≥150 ×1,6
create function public.cm_fator(att numeric, gat numeric, rules jsonb) returns numeric language plpgsql immutable as $$
declare r jsonb := rules -> 'regua';
begin
  if att < gat then return 0; end if;
  if not coalesce((r ->> 'on')::boolean, true) then return 1; end if;
  if att >= coalesce((r ->> 'max_de')::numeric, 1.5) then return (r ->> 'max')::numeric; end if;
  if att >= coalesce((r ->> 'acel_de')::numeric, 1.2) then return (r ->> 'acel')::numeric; end if;
  if att >= 1 then return (r ->> 'padrao')::numeric; end if;
  return (r ->> 'leve')::numeric;
end $$;

-- ---------- Distribuição da meta -----------------------------------------------------------------
-- Pode receber regras de rascunho (p_rules) para a prévia dos passos de Parâmetros.
create function public.cm_distribution(m date, p_rules jsonb default null) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  rules jsonb := coalesce(p_rules, public.cm_rules(m));
  objetivo numeric := (rules ->> 'custo')::numeric * (rules ->> 'pct')::numeric;
  wsum numeric := 0; s public.cm_sellers; sellers jsonb := '[]'::jsonb; emp jsonb := '[]'::jsonb;
  w numeric; sal numeric; meta numeric; gat numeric; n int; e record; ppv numeric; pts numeric;
  peso numeric; psum numeric := 0; seniors jsonb; first_cob uuid;
begin
  for s in select * from public.cm_sellers x where public.cm_seller_in_month(x, m) loop
    wsum := wsum + coalesce(public.cm_seller_weight(s, rules), 0);
  end loop;
  for s in select * from public.cm_sellers x where public.cm_seller_in_month(x, m) order by name loop
    w := coalesce(public.cm_seller_weight(s, rules), 0);
    sal := public.cm_seller_salary(s, rules);
    meta := case when wsum > 0 then round(objetivo * w / wsum) else 0 end;
    gat := public.cm_gatilho(s, m, rules); n := public.cm_house_month(s, m);
    sellers := sellers || jsonb_build_object('id', s.id, 'name', s.name,
      'seniority', (select name from public.cm_seniorities where id = s.seniority_id),
      'weight', w, 'salary', sal, 'meta', meta, 'gatilho', gat, 'casa', n, 'casa_label', public.cm_house_label(n),
      'total_100', sal * 2);
  end loop;
  for e in select * from public.cm_empresas order by sort loop
    peso := coalesce((rules -> 'pesos' ->> e.id::text)::numeric, 0);
    psum := psum + peso;
    -- variação de referência da empresa: 1º produto ativo, cobrança integral antes da recorrência
    select c.id into first_cob from public.cm_cobrancas c join public.cm_products p on p.id = c.product_id
      where p.empresa_id = e.id and p.active order by p.sort, case c.kind when 'integral' then 1 else 2 end limit 1;
    ppv := case when first_cob is null then null else public.cm_cobranca_liquido(first_cob, rules -> 'valores') end;
    pts := round(objetivo * peso);
    emp := emp || jsonb_build_object('id', e.id, 'linha', e.linha, 'empresa', e.name, 'peso', peso, 'pontos', pts,
             'pts_venda', ppv, 'qtd', case when coalesce(ppv, 0) > 0 then round(pts / ppv, 2) end);
  end loop;
  return jsonb_build_object('month', public.month_start(m), 'objetivo', objetivo, 'custo', (rules ->> 'custo')::numeric,
    'pct', (rules ->> 'pct')::numeric, 'peso_total', psum, 'meta_total', coalesce((select sum((x ->> 'meta')::numeric) from jsonb_array_elements(sellers) x), 0),
    'sellers', sellers, 'empresas', emp,
    'cobrancas', coalesce((select jsonb_agg(jsonb_build_object('id', c.id, 'pts', public.cm_cobranca_liquido(c.id, rules -> 'valores')) order by p.sort, c.kind)
       from public.cm_cobrancas c join public.cm_products p on p.id = c.product_id where p.active), '[]'::jsonb));
end $$;

-- ---------- Congelamento: 23h59 do dia (final da validação − 3); prazo ≤ 3 → último dia do mês (decisão 37)
create function public.cm_freeze_at(m date) returns timestamp language sql stable security definer set search_path = public as $$
  select (public.month_end(m) + greatest(coalesce((public.cm_rules(m) -> 'operacao' ->> 'prazo')::int, 7) - 3, 0)) + time '23:59' $$;

-- ---------- Pontos de uma venda --------------------------------------------------------------------
-- confirmado: pago e venda confirmada (Em Prazo/Validada). previsto: ainda não pago. total: o que contaria no mês.
-- Cartão (qualquer nº de parcelas) = líquido integral. À vista (1×) = líquido integral. Pix/Boleto parcelado = só a parcela do mês.
create function public.cm_payment_points(p_pay uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare s public.cm_sales; p public.cm_sale_payments; amt numeric := 0; k int; due date; d date;
begin
  select * into p from public.cm_sale_payments where id = p_pay;
  select * into s from public.cm_sales where id = p.sale_id;
  if p.forma = 'cartao' or p.parcelas = 1 then
    d := coalesce(p.paid_at, p.first_date);
    if public.month_start(d) = s.month then amt := p.liquido; end if;
  else
    for k in 1..p.parcelas loop
      due := (p.first_date + ((k - 1) || ' month')::interval)::date;
      if public.month_start(due) = s.month then amt := amt + round(p.liquido / p.parcelas, 2); end if;
    end loop;
  end if;
  if p.paid_at is not null and s.status in ('em_prazo', 'validada') then return jsonb_build_object('confirmado', amt, 'previsto', 0); end if;
  return jsonb_build_object('confirmado', 0, 'previsto', amt);
end $$;

create function public.cm_sale_points(p_sale uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare p public.cm_sale_payments; conf numeric := 0; prev numeric := 0; x jsonb;
begin
  for p in select * from public.cm_sale_payments where sale_id = p_sale loop
    x := public.cm_payment_points(p.id);
    conf := conf + (x ->> 'confirmado')::numeric; prev := prev + (x ->> 'previsto')::numeric;
  end loop;
  return jsonb_build_object('confirmado', conf, 'previsto', prev, 'total', conf + prev);
end $$;

-- ---------- Resultado de um vendedor no mês --------------------------------------------------------
create function public.cm_seller_month(p_seller uuid, m date) returns jsonb
language plpgsql stable security definer set search_path = public as $$
declare
  mm date := public.month_start(m); rules jsonb := public.cm_rules(m); dist jsonb := public.cm_distribution(m);
  me jsonb; meta numeric := 0; gat numeric; sal numeric; s public.cm_sellers; x record;
  vali numeric := 0; prazo numeric := 0; aguard numeric := 0; conf numeric; ating numeric; fator numeric; bonus numeric;
  fz jsonb; frozen boolean := false; pts jsonb;
begin
  select * into s from public.cm_sellers where id = p_seller;
  select j into me from jsonb_array_elements(dist -> 'sellers') j where (j ->> 'id')::uuid = p_seller;
  if me is not null then meta := (me ->> 'meta')::numeric; gat := (me ->> 'gatilho')::numeric; sal := (me ->> 'salary')::numeric;
  else gat := public.cm_gatilho(s, m, rules); sal := public.cm_seller_salary(s, rules); end if;
  for x in select id, status from public.cm_sales where seller_id = p_seller and month = mm and status <> 'cancelada' loop
    pts := public.cm_sale_points(x.id);
    if x.status = 'validada' then vali := vali + (pts ->> 'confirmado')::numeric;
    elsif x.status = 'em_prazo' then prazo := prazo + (pts ->> 'confirmado')::numeric;
    else aguard := aguard + (pts ->> 'previsto')::numeric; end if;
  end loop;
  conf := vali + prazo;
  select j into fz from public.cm_freezes f, jsonb_array_elements(f.rows) j where f.month = mm and (j ->> 'seller_id')::uuid = p_seller;
  if fz is not null then
    frozen := true; conf := (fz ->> 'pontos')::numeric; meta := (fz ->> 'meta')::numeric; gat := (fz ->> 'gatilho')::numeric; sal := (fz ->> 'salario')::numeric;
  end if;
  ating := case when meta > 0 then round(conf / meta, 4) else 0 end;
  fator := public.cm_fator(ating, gat, rules);
  bonus := round(sal * ating * fator, 2);
  return jsonb_build_object('seller_id', p_seller, 'name', s.name, 'month', mm, 'meta', meta, 'gatilho', gat, 'gatilho_pts', round(meta * gat),
    'salario', sal, 'confirmado', conf, 'validadas', vali, 'em_prazo', prazo, 'aguardando', aguard,
    'atingimento', ating, 'fator', fator, 'bonus', bonus, 'abaixo_gatilho', ating < gat,
    'congelado', frozen, 'congelamento', public.cm_freeze_at(m));
end $$;

-- ---------- Rotina diária: validação automática + congelamento ------------------------------------
create function public.cm_run_daily() returns void language plpgsql security definer set search_path = public as $$
declare mm date; first_m date; sl jsonb := '[]'::jsonb; sid uuid; r jsonb;
begin
  update public.cm_sales set status = 'validada', validada_em = cancelavel_ate + 1
   where status = 'em_prazo' and cancelavel_ate < public.cm_today();
  select min(month) into first_m from public.cm_sales;
  if first_m is null then return; end if;
  for mm in select g::date from generate_series(first_m, public.month_start(public.cm_today()), interval '1 month') g loop
    if not exists (select 1 from public.cm_freezes where month = mm) and public.cm_now() >= public.cm_freeze_at(mm) then
      sl := '[]'::jsonb;
      for sid in select (j ->> 'id')::uuid from jsonb_array_elements(public.cm_distribution(mm) -> 'sellers') j loop
        r := public.cm_seller_month(sid, mm);
        sl := sl || jsonb_build_object('seller_id', sid, 'meta', r -> 'meta', 'pontos', r -> 'confirmado', 'atingimento', r -> 'atingimento',
               'gatilho', r -> 'gatilho', 'fator', r -> 'fator', 'salario', r -> 'salario', 'bonus', r -> 'bonus');
      end loop;
      insert into public.cm_freezes (month, rows) values (mm, sl);
    end if;
  end loop;
end $$;

-- ---------- Vendas: registrar, confirmar pagamento, editar, cancelar ------------------------------
create function public.cm_pay_taxa(p_product uuid, p_forma text) returns numeric language sql stable security definer set search_path = public as $$
  select coalesce((select taxa from public.cm_product_formas where product_id = p_product and forma = p_forma), 0) $$;

create function public.cm_assert_sale_access(p_seller uuid) returns void language plpgsql stable security definer set search_path = public as $$
begin
  if public.is_manager() then return; end if;
  if p_seller is distinct from public.cm_my_seller() then raise exception 'sem permissão: venda de outro vendedor'; end if;
end $$;

create function public.cm_save_payments(p_sale uuid, p_product uuid, p_formas jsonb, p_pago boolean, p_data date) returns void
language plpgsql security definer set search_path = public as $$
declare f jsonb; fm text; br numeric; lq numeric; pa int; dt date; pd date; pf public.cm_product_formas; i int := 0;
begin
  if p_formas is null or jsonb_array_length(p_formas) = 0 then raise exception 'informe ao menos uma forma de pagamento'; end if;
  delete from public.cm_sale_payments where sale_id = p_sale;
  for f in select * from jsonb_array_elements(p_formas) loop
    fm := f ->> 'forma'; br := (f ->> 'bruto')::numeric; pa := coalesce((f ->> 'parcelas')::int, 1);
    select * into pf from public.cm_product_formas where product_id = p_product and forma = fm;
    if not found then raise exception 'forma de pagamento não aceita pelo produto: %', fm; end if;
    if pa > (case when pf.parcela then pf.max_parcelas else 1 end) then raise exception 'parcelas acima do permitido (% vezes)', pf.max_parcelas; end if;
    if br is null or br <= 0 then raise exception 'valor bruto inválido'; end if;
    lq := coalesce((f ->> 'liquido')::numeric, round(br * (1 - pf.taxa), 2));
    dt := coalesce((f ->> 'data')::date, p_data, public.cm_today());
    pd := null;
    if p_pago and dt <= public.cm_today() and (fm = 'cartao' or pa = 1 or coalesce((f ->> 'pago')::boolean, false)) then pd := dt; end if;
    insert into public.cm_sale_payments (sale_id, forma, bruto, liquido, parcelas, first_date, paid_at, sort)
    values (p_sale, fm, br, lq, pa, dt, pd, i);
    i := i + 1;
  end loop;
end $$;

-- recalcula status/datas de uma venda a partir dos pagamentos
create function public.cm_refresh_sale(p_sale uuid) returns void language plpgsql security definer set search_path = public as $$
declare s public.cm_sales; fp date; prazo int; mm date;
begin
  select * into s from public.cm_sales where id = p_sale;
  if s.status = 'cancelada' then return; end if;
  select min(paid_at) into fp from public.cm_sale_payments where sale_id = p_sale;
  if fp is null then
    update public.cm_sales set status = 'aguardando_pagamento', first_payment_at = null, prazo_dias = null, cancelavel_ate = null, validada_em = null,
      month = public.month_start((select min(first_date) from public.cm_sale_payments where sale_id = p_sale)) where id = p_sale;
  else
    mm := public.month_start(fp);
    prazo := coalesce((public.cm_rules(mm) -> 'operacao' ->> 'prazo')::int, 7);
    update public.cm_sales set status = case when fp + prazo < public.cm_today() then 'validada' else 'em_prazo' end,
      first_payment_at = fp, month = mm, prazo_dias = prazo, cancelavel_ate = fp + prazo, validada_em = fp + prazo + 1,
      confirmed_by = coalesce(confirmed_by, auth.uid()) where id = p_sale;
  end if;
end $$;

create function public.cm_register_sale(p jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare sid uuid; pid uuid := (p ->> 'product_id')::uuid; cid uuid := (p ->> 'cobranca_id')::uuid; seller uuid;
  dt date := nullif(p ->> 'data_pagamento', '')::date; mm date;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  seller := case when public.is_manager() then coalesce((p ->> 'seller_id')::uuid, public.cm_my_seller()) else public.cm_my_seller() end;
  if seller is null then raise exception 'vendedor não cadastrado'; end if;
  if coalesce(trim(p ->> 'cliente'), '') = '' then raise exception 'informe o cliente'; end if;
  if not exists (select 1 from public.cm_cobrancas where id = cid and product_id = pid) then raise exception 'cobrança não pertence ao produto'; end if;
  insert into public.cm_sales (seller_id, product_id, cobranca_id, cliente, month, comprovante, created_by)
  values (seller, pid, cid, trim(p ->> 'cliente'), public.month_start(coalesce(dt, public.cm_today())), nullif(p ->> 'comprovante', ''), auth.uid())
  returning cm_sales.id into sid;
  perform public.cm_save_payments(sid, pid, p -> 'formas', coalesce((p ->> 'pago')::boolean, false), dt);
  perform public.cm_refresh_sale(sid);
  select month into mm from public.cm_sales where id = sid;
  if exists (select 1 from public.cm_freezes where month = mm) then raise exception 'o resultado de % já está congelado', to_char(mm, 'MM/YYYY'); end if;
  return sid;
end $$;

create function public.cm_update_sale(p_sale uuid, p jsonb) returns void language plpgsql security definer set search_path = public as $$
declare s public.cm_sales; dt date := nullif(p ->> 'data_pagamento', '')::date;
begin
  select * into s from public.cm_sales where id = p_sale;
  if not found then raise exception 'venda não encontrada'; end if;
  perform public.cm_assert_sale_access(s.seller_id);
  if s.status <> 'aguardando_pagamento' then raise exception 'só vendas aguardando pagamento podem ser editadas'; end if;
  update public.cm_sales set cliente = coalesce(nullif(trim(p ->> 'cliente'), ''), cliente), comprovante = coalesce(nullif(p ->> 'comprovante', ''), comprovante) where id = p_sale;
  if p ? 'formas' then perform public.cm_save_payments(p_sale, s.product_id, p -> 'formas', coalesce((p ->> 'pago')::boolean, false), dt); end if;
  perform public.cm_refresh_sale(p_sale);
end $$;

-- Confirma o pagamento: sem p_payment confirma as formas à vista (ou a 1ª parcela) na data; com p_payment confirma só aquela forma.
create function public.cm_confirm_payment(p_sale uuid, p_date date default null, p_payment uuid default null) returns void
language plpgsql security definer set search_path = public as $$
declare s public.cm_sales; d date := coalesce(p_date, public.cm_today()); n int;
begin
  select * into s from public.cm_sales where id = p_sale;
  if not found then raise exception 'venda não encontrada'; end if;
  perform public.cm_assert_sale_access(s.seller_id);
  if s.status = 'cancelada' then raise exception 'venda cancelada'; end if;
  if d > public.cm_today() then raise exception 'a data do pagamento não pode ser futura'; end if;
  if p_payment is not null then
    update public.cm_sale_payments set paid_at = d where id = p_payment and sale_id = p_sale;
  else
    update public.cm_sale_payments set paid_at = d where sale_id = p_sale and paid_at is null and (forma = 'cartao' or parcelas = 1);
    get diagnostics n = row_count;
    if n = 0 then
      update public.cm_sale_payments set paid_at = d where id = (select id from public.cm_sale_payments where sale_id = p_sale and paid_at is null order by sort limit 1);
    end if;
  end if;
  if exists (select 1 from public.cm_freezes where month = public.month_start(d)) and s.status = 'aguardando_pagamento' then
    raise exception 'o resultado de % já está congelado', to_char(public.month_start(d), 'MM/YYYY');
  end if;
  perform public.cm_refresh_sale(p_sale);
end $$;

-- Prévia do cancelamento depois do congelamento (tela "Cancelar Venda")
create function public.cm_cancel_preview(p_sale uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare s public.cm_sales; r jsonb; pts jsonb; after_pts numeric; rules jsonb; ating numeric; fator numeric; b numeric; sel public.cm_sellers;
begin
  select * into s from public.cm_sales where id = p_sale;
  perform public.cm_assert_sale_access(s.seller_id);
  select * into sel from public.cm_sellers where id = s.seller_id;
  r := public.cm_seller_month(s.seller_id, s.month); rules := public.cm_rules(s.month);
  pts := public.cm_sale_points(p_sale);
  after_pts := case when s.status in ('em_prazo', 'validada') then greatest((r ->> 'confirmado')::numeric - (pts ->> 'confirmado')::numeric, 0) else (r ->> 'confirmado')::numeric end;
  ating := case when (r ->> 'meta')::numeric > 0 then round(after_pts / (r ->> 'meta')::numeric, 4) else 0 end;
  fator := public.cm_fator(ating, (r ->> 'gatilho')::numeric, rules);
  b := round((r ->> 'salario')::numeric * ating * fator, 2);
  return jsonb_build_object('sale_id', p_sale, 'seller', sel.name, 'month', s.month, 'congelado', (r ->> 'congelado')::boolean,
    'pontos', jsonb_build_array((r ->> 'confirmado')::numeric, after_pts),
    'atingimento', jsonb_build_array((r ->> 'atingimento')::numeric, ating),
    'fator', jsonb_build_array((r ->> 'fator')::numeric, fator),
    'bonus', jsonb_build_array((r ->> 'bonus')::numeric, b),
    'diferenca', round((r ->> 'bonus')::numeric - b, 2),
    'congelado_em', public.cm_freeze_at(s.month),
    'bonus_pago_em', (public.month_start(s.month) + interval '1 month')::date + (coalesce((rules -> 'operacao' ->> 'bonus')::int, 10) - 1),
    'hoje', public.cm_today(), 'cancelada_por', case when public.is_manager() then 'Gestor' else 'Vendedor' end);
end $$;

-- Cancelar venda: só até o fim do prazo (vendedor, gestor ou admin). Depois do congelamento exige decisão (decisão 38).
create function public.cm_cancel_sale(p_sale uuid, p_decision text default null, p_motivo text default null) returns void
language plpgsql security definer set search_path = public as $$
declare s public.cm_sales; pv jsonb; frozen boolean; dec text; mgr boolean := public.is_manager();
begin
  select * into s from public.cm_sales where id = p_sale for update;
  if not found then raise exception 'venda não encontrada'; end if;
  perform public.cm_assert_sale_access(s.seller_id);
  if s.status = 'cancelada' then raise exception 'venda já cancelada'; end if;
  if s.status = 'validada' or (s.cancelavel_ate is not null and s.cancelavel_ate < public.cm_today()) then
    raise exception 'o prazo de cancelamento desta venda terminou';
  end if;
  frozen := exists (select 1 from public.cm_freezes where month = s.month) and s.status = 'em_prazo';
  if frozen then
    pv := public.cm_cancel_preview(p_sale);
    dec := case when mgr then coalesce(p_decision, 'manter') else 'manter' end;
    if dec = 'ajustar' and coalesce(trim(p_motivo), '') = '' then raise exception 'informe o motivo do ajuste'; end if;
    if dec = 'ajustar' then
      update public.cm_freezes f set rows = (select jsonb_agg(case when (j ->> 'seller_id')::uuid = s.seller_id then
          j || jsonb_build_object('pontos', pv -> 'pontos' -> 1, 'atingimento', pv -> 'atingimento' -> 1, 'fator', pv -> 'fator' -> 1, 'bonus', pv -> 'bonus' -> 1)
          else j end) from jsonb_array_elements(f.rows) j) where f.month = s.month;
    end if;
    insert into public.cm_adjustments (month, sale_id, seller_id, decision, motivo, pontos_antes, pontos_depois, bonus_antes, bonus_depois, review_pending, decided_by)
    values (s.month, p_sale, s.seller_id, dec, nullif(trim(p_motivo), ''), (pv -> 'pontos' ->> 0)::numeric, (pv -> 'pontos' ->> 1)::numeric,
            (pv -> 'bonus' ->> 0)::numeric, (pv -> 'bonus' ->> 1)::numeric, not mgr, auth.uid());
    if not mgr then perform public.notify(null, 'cm_cancel_frozen', 'Cancelamento após congelamento', 'Venda de ' || s.cliente || ' cancelada pelo vendedor; revise o resultado congelado.', p_sale::text); end if;
  end if;
  update public.cm_sales set status = 'cancelada', cancelled_at = now(), cancelled_by = auth.uid(), cancel_reason = nullif(trim(p_motivo), '') where id = p_sale;
end $$;

-- =====================================================================
-- TELAS (RPCs que devolvem o JSON de cada tela)
-- =====================================================================
create table public.cm_drafts (                -- rascunho dos Parâmetros por mês ("ainda não vale para os vendedores")
  month      date primary key check (month = date_trunc('month', month)::date),
  rules      jsonb not null,
  updated_by uuid,
  updated_at timestamptz not null default now()
);

create function public.cm_me() returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare sid uuid := public.cm_my_seller();
begin
  perform public.cm_run_daily();
  return jsonb_build_object('role', public.cm_role(), 'is_manager', public.is_manager(), 'is_admin', public.is_admin(),
    'seller_id', sid, 'name', (select name from public.cm_sellers where id = sid), 'today', public.cm_today(),
    'sellers', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by name) from public.cm_sellers x
        where (public.is_manager() and (x.active or x.end_date >= public.month_start(public.cm_today()))) or x.id = sid), '[]'::jsonb));
end $$;

-- ---------- Menu (hub) ---------------------------------------------------------------------------
create function public.cm_team_confirmed(m date) returns numeric language plpgsql stable security definer set search_path = public as $$
declare t numeric := 0; sid uuid;
begin
  for sid in select (j ->> 'id')::uuid from jsonb_array_elements(public.cm_distribution(m) -> 'sellers') j loop
    t := t + (public.cm_seller_month(sid, m) ->> 'confirmado')::numeric;
  end loop;
  return t;
end $$;

create function public.cm_sugestao_pct(m date) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare cur numeric := (public.cm_rules(m) ->> 'pct')::numeric; i int; mm date; t numeric; meta numeric; atts numeric[] := '{}'; sid uuid; r jsonb;
        avg_a numeric; n int; above int := 0; sug numeric; conf text;
begin
  for i in 1..3 loop
    mm := (public.month_start(m) - (i || ' month')::interval)::date;
    t := 0; meta := 0;
    for sid in select (j ->> 'id')::uuid from jsonb_array_elements(public.cm_distribution(mm) -> 'sellers') j loop
      r := public.cm_seller_month(sid, mm); t := t + (r ->> 'confirmado')::numeric; meta := meta + (r ->> 'meta')::numeric;
    end loop;
    if meta > 0 and t > 0 then atts := atts || round(t / meta, 4); if t / meta >= 1 then above := above + 1; end if; end if;
  end loop;
  n := coalesce(array_length(atts, 1), 0);
  if n = 0 then return jsonb_build_object('sem_historico', true, 'atual', cur); end if;
  select avg(a) into avg_a from unnest(atts) a;
  sug := case when above = n and n >= 2 then cur + 0.05 when avg_a < 0.9 and n >= 2 then greatest(cur - 0.05, 0.5) else cur end;
  conf := case when n >= 3 then 'Alta' when n = 2 then 'Média' else 'Baixa' end;
  return jsonb_build_object('sem_historico', false, 'atual', cur, 'sugerido', sug, 'aliviar', greatest(cur - 0.05, 0.5), 'confianca', conf,
    'meses', n, 'acima', above, 'atingimentos', to_jsonb(atts));
end $$;

create function public.cm_hub() returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare nxt date := (public.month_start(public.cm_today()) + interval '1 month')::date; cur date := public.month_start(public.cm_today());
  np int; nv int; sug jsonb; has_pub boolean; has_draft boolean; prog int; steps jsonb; done int := 0; first_open boolean := true; st text; i int := 0; x jsonb;
begin
  perform public.cm_assert_manager(); perform public.cm_run_daily();
  select count(*) into np from public.cm_products p join public.cm_empresas e on e.id = p.empresa_id where p.active and e.peso > 0;
  select count(*) into nv from public.cm_sellers sl where public.cm_seller_in_month(sl, nxt);
  sug := public.cm_sugestao_pct(nxt);
  has_pub := exists (select 1 from public.cm_months where month = nxt);
  has_draft := exists (select 1 from public.cm_drafts where month = nxt);
  select count(*) into prog from public.cm_months where month > cur;
  steps := jsonb_build_array(
    jsonb_build_object('key', 'produtos', 'label', 'Produtos', 'value', np || ' com Peso', 'done', np > 0),
    jsonb_build_object('key', 'vendedores', 'label', 'Vendedores', 'value', nv || ' Ativos', 'done', nv > 0),
    jsonb_build_object('key', 'sugestao', 'label', 'Sugestão', 'value', case when (sug ->> 'sem_historico')::boolean then '—' else round((sug ->> 'sugerido')::numeric * 100) || '%' end, 'done', np > 0 and nv > 0),
    jsonb_build_object('key', 'parametros', 'label', 'Parâmetros', 'value', case when has_pub then 'Publicado' when has_draft then 'Rascunho' else 'Pendente' end, 'done', has_pub),
    jsonb_build_object('key', 'meses', 'label', 'Meses Programados', 'value', case when prog > 0 then prog || ' Programados' else 'Sem Regras' end, 'done', prog >= 2));
  for x in select * from jsonb_array_elements(steps) loop
    i := i + 1;
    if (x ->> 'done')::boolean then done := done + 1; st := 'done';
    elsif first_open then st := 'now'; first_open := false; else st := 'todo'; end if;
    steps := jsonb_set(steps, array[(i - 1)::text, 'state'], to_jsonb(st));
  end loop;
  return jsonb_build_object('proximo', nxt, 'concluidas', done, 'total', 5, 'etapas', steps,
    'atual', cur, 'vendas_pts', public.cm_team_confirmed(cur));
end $$;

-- ---------- Produtos -------------------------------------------------------------------------------
create function public.cm_cob_label(kind text, gera_caixa boolean) returns text language sql immutable as $$
  select case when not gera_caixa then 'Sem Caixa · Estimado' when kind = 'integral' then 'Cartão de Crédito' else 'Recorrência Mensal' end $$;

create function public.cm_products_options() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'empresas', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'linha', linha, 'peso', peso) order by sort) from public.cm_empresas), '[]'::jsonb),
    'products', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'empresa_id', p.empresa_id, 'empresa', e.name, 'gera_caixa', p.gera_caixa, 'active', p.active,
      'cobrancas', (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'kind', c.kind, 'label', case c.kind when 'integral' then 'Pagamento Integral' else 'Recorrência Mensal' end,
                      'bruto', c.bruto, 'liquido', public.cm_cobranca_liquido(c.id)) order by c.kind), '[]'::jsonb) from public.cm_cobrancas c where c.product_id = p.id),
      'formas', (select coalesce(jsonb_agg(jsonb_build_object('forma', f.forma, 'parcela', f.parcela, 'max', f.max_parcelas, 'taxa', f.taxa)
                    order by case f.forma when 'cartao' then 1 when 'pix' then 2 else 3 end), '[]'::jsonb) from public.cm_product_formas f where f.product_id = p.id)
    ) order by p.sort) from public.cm_products p join public.cm_empresas e on e.id = p.empresa_id where p.active or public.is_manager()), '[]'::jsonb)) $$;

create function public.cm_product_get(p_id uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare p public.cm_products;
begin
  perform public.cm_assert_manager();
  select * into p from public.cm_products where id = p_id;
  return jsonb_build_object(
    'empresas', (select jsonb_agg(jsonb_build_object('id', id, 'name', name) order by sort) from public.cm_empresas),
    'product', case when p.id is null then null else jsonb_build_object('id', p.id, 'empresa_id', p.empresa_id, 'name', p.name, 'gera_caixa', p.gera_caixa,
        'fidelidade', p.fidelidade, 'periodo_min', p.periodo_min, 'active', p.active) end,
    'cobrancas', coalesce((select jsonb_agg(jsonb_build_object('kind', c.kind, 'bruto', c.bruto, 'liquido', c.liquido, 'liquido_calc', public.cm_cobranca_liquido(c.id)) order by c.kind)
                           from public.cm_cobrancas c where c.product_id = p_id), '[]'::jsonb),
    'formas', coalesce((select jsonb_agg(jsonb_build_object('forma', f.forma, 'parcela', f.parcela, 'max', f.max_parcelas, 'taxa', f.taxa)) from public.cm_product_formas f where f.product_id = p_id), '[]'::jsonb));
end $$;

create function public.cm_products_list() returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.cm_assert_manager();
  return jsonb_build_object(
    'peso_count', (select count(*) from public.cm_products p join public.cm_empresas e on e.id = p.empresa_id where p.active and e.peso > 0),
    'rows', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'empresa', e.name, 'active', p.active, 'gera_caixa', p.gera_caixa,
        'variacoes', (select count(*) from public.cm_cobrancas c where c.product_id = p.id),
        'pts', (select public.cm_cobranca_liquido(c.id) from public.cm_cobrancas c where c.product_id = p.id order by case c.kind when 'integral' then 1 else 2 end limit 1)) order by p.sort)
      from public.cm_products p join public.cm_empresas e on e.id = p.empresa_id), '[]'::jsonb));
end $$;

create function public.cm_product_save(p jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare pid uuid := nullif(p ->> 'id', '')::uuid; c jsonb; f jsonb; kinds text[] := '{}'; forms text[] := '{}';
begin
  perform public.cm_assert_manager();
  if coalesce(trim(p ->> 'name'), '') = '' then raise exception 'informe o nome do produto'; end if;
  if jsonb_array_length(coalesce(p -> 'cobrancas', '[]'::jsonb)) = 0 then raise exception 'escolha ao menos uma cobrança'; end if;
  if jsonb_array_length(coalesce(p -> 'formas', '[]'::jsonb)) = 0 then raise exception 'escolha ao menos uma forma de pagamento'; end if;
  if pid is null then
    insert into public.cm_products (empresa_id, name, gera_caixa, fidelidade, periodo_min, sort)
    values ((p ->> 'empresa_id')::uuid, trim(p ->> 'name'), coalesce((p ->> 'gera_caixa')::boolean, true), coalesce((p ->> 'fidelidade')::boolean, false),
            coalesce((p ->> 'periodo_min')::int, 12), (select coalesce(max(sort), 0) + 1 from public.cm_products)) returning id into pid;
  else
    update public.cm_products set empresa_id = (p ->> 'empresa_id')::uuid, name = trim(p ->> 'name'), gera_caixa = coalesce((p ->> 'gera_caixa')::boolean, true),
      fidelidade = coalesce((p ->> 'fidelidade')::boolean, false), periodo_min = coalesce((p ->> 'periodo_min')::int, 12),
      active = coalesce((p ->> 'active')::boolean, true) where id = pid;
  end if;
  for c in select * from jsonb_array_elements(p -> 'cobrancas') loop
    if (c ->> 'bruto') is null or (c ->> 'bruto')::numeric <= 0 then raise exception 'valor bruto é obrigatório'; end if;
    kinds := kinds || (c ->> 'kind');
    insert into public.cm_cobrancas (product_id, kind, bruto, liquido) values (pid, c ->> 'kind', (c ->> 'bruto')::numeric, nullif(c ->> 'liquido', '')::numeric)
    on conflict (product_id, kind) do update set bruto = excluded.bruto, liquido = excluded.liquido;
  end loop;
  delete from public.cm_cobrancas where product_id = pid and not (kind = any (kinds)) and not exists (select 1 from public.cm_sales where cobranca_id = cm_cobrancas.id);
  for f in select * from jsonb_array_elements(p -> 'formas') loop
    forms := forms || (f ->> 'forma');
    insert into public.cm_product_formas (product_id, forma, parcela, max_parcelas, taxa)
    values (pid, f ->> 'forma', coalesce((f ->> 'parcela')::boolean, false), case when coalesce((f ->> 'parcela')::boolean, false) then coalesce((f ->> 'max')::int, 1) else 1 end, coalesce((f ->> 'taxa')::numeric, 0))
    on conflict (product_id, forma) do update set parcela = excluded.parcela, max_parcelas = excluded.max_parcelas, taxa = excluded.taxa;
  end loop;
  delete from public.cm_product_formas where product_id = pid and not (forma = any (forms));
  return pid;
end $$;

-- ---------- Vendedores -----------------------------------------------------------------------------
create function public.cm_lock_day(m date) returns date language sql immutable as $$ select ((date_trunc('month', m) - interval '1 month')::date + 27) $$;

create function public.cm_sellers_list(p_active boolean default true) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare m date := public.month_start(public.cm_today()); dist jsonb; rules jsonb;
begin
  perform public.cm_assert_manager();
  dist := public.cm_distribution(m); rules := public.cm_rules(m);
  return jsonb_build_object('month', m,
    'total', (select count(*) from public.cm_sellers x where public.cm_seller_in_month(x, m)),
    'por_senioridade', coalesce((select jsonb_agg(jsonb_build_object('name', sn.name, 'qtd', (select count(*) from public.cm_sellers x where public.cm_seller_in_month(x, m) and x.seniority_id = sn.id)) order by sn.sort)
                                from public.cm_seniorities sn), '[]'::jsonb),
    'rows', coalesce((select jsonb_agg(jsonb_build_object('id', x.id, 'name', x.name, 'seniority', sn.name,
        'casa_label', public.cm_house_label(public.cm_house_month(x, m)),
        'meta', (select (j ->> 'meta')::numeric from jsonb_array_elements(dist -> 'sellers') j where (j ->> 'id')::uuid = x.id),
        'gatilho', public.cm_gatilho(x, m, rules)) order by x.name)
      from public.cm_sellers x join public.cm_seniorities sn on sn.id = x.seniority_id
      where case when p_active then public.cm_seller_in_month(x, m) else not public.cm_seller_in_month(x, m) end), '[]'::jsonb));
end $$;

create function public.cm_seller_get(p_id uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare s public.cm_sellers; m date := public.month_start(public.cm_today()); rules jsonb := public.cm_rules(public.cm_today()); dist jsonb := public.cm_distribution(public.cm_today()); me jsonb;
begin
  perform public.cm_assert_manager();
  select * into s from public.cm_sellers where id = p_id;
  select j into me from jsonb_array_elements(dist -> 'sellers') j where (j ->> 'id')::uuid = p_id;
  return jsonb_build_object('month', m, 'is_admin', public.is_admin(),
    'seniorities', (select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'salary', salary) order by sort) from public.cm_seniorities),
    'users', coalesce((select jsonb_agg(jsonb_build_object('id', pr.id, 'name', coalesce(pr.full_name, pr.email), 'email', pr.email) order by coalesce(pr.full_name, pr.email))
                       from public.profiles pr where not exists (select 1 from public.cm_sellers x where x.user_id = pr.id and x.id is distinct from p_id)), '[]'::jsonb),
    'seller', case when s.id is null then null else jsonb_build_object('id', s.id, 'user_id', s.user_id, 'name', s.name, 'seniority_id', s.seniority_id,
        'seniority', (select name from public.cm_seniorities where id = s.seniority_id), 'start_date', s.start_date, 'effective_from', s.effective_from, 'end_date', s.end_date, 'active', s.active,
        'salary', public.cm_seller_salary(s, rules), 'salary_override', s.salary_override,
        'casa_label', public.cm_house_label(public.cm_house_month(s, m)), 'gatilho', public.cm_gatilho(s, m, rules),
        'meta', coalesce((me ->> 'meta')::numeric, 0), 'total_100', public.cm_seller_salary(s, rules) * 2) end);
end $$;

create function public.cm_seller_save(p jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare sid uuid := nullif(p ->> 'id', '')::uuid; old public.cm_sellers; sd date := (p ->> 'start_date')::date; eff date;
begin
  perform public.cm_assert_manager();
  if coalesce(trim(p ->> 'name'), '') = '' then raise exception 'informe o nome'; end if;
  if sd is null then raise exception 'informe a data de início'; end if;
  if (p ->> 'seniority_id') is null then raise exception 'informe a senioridade'; end if;
  -- decisão 19: cadastro depois do dia 28 só vale a partir do mês seguinte
  eff := case when public.cm_today() > public.cm_lock_day(sd) then (public.month_start(sd) + interval '1 month')::date else sd end;
  if sd < public.cm_today() then eff := sd; end if;
  if sid is null then
    insert into public.cm_sellers (user_id, name, seniority_id, start_date, effective_from, end_date, active, salary_override)
    values (nullif(p ->> 'user_id', '')::uuid, trim(p ->> 'name'), (p ->> 'seniority_id')::uuid, sd, eff, nullif(p ->> 'end_date', '')::date,
            coalesce((p ->> 'active')::boolean, true), case when public.is_admin() then nullif(p ->> 'salary_override', '')::numeric end) returning id into sid;
    insert into public.cm_seller_log (seller_id, by_user, field, old_value, new_value) values (sid, auth.uid(), 'cadastro', null, trim(p ->> 'name'));
  else
    select * into old from public.cm_sellers where id = sid;
    if old.seniority_id <> (p ->> 'seniority_id')::uuid then
      insert into public.cm_seller_log (seller_id, by_user, field, old_value, new_value)
      values (sid, auth.uid(), 'Senioridade', (select name from public.cm_seniorities where id = old.seniority_id), (select name from public.cm_seniorities where id = (p ->> 'seniority_id')::uuid));
    end if;
    if public.is_admin() and old.salary_override is distinct from nullif(p ->> 'salary_override', '')::numeric then
      insert into public.cm_seller_log (seller_id, by_user, field, old_value, new_value) values (sid, auth.uid(), 'Salário', old.salary_override::text, p ->> 'salary_override');
    end if;
    if old.start_date <> sd then insert into public.cm_seller_log (seller_id, by_user, field, old_value, new_value) values (sid, auth.uid(), 'Data de Início', old.start_date::text, sd::text); end if;
    if old.end_date is distinct from nullif(p ->> 'end_date', '')::date then insert into public.cm_seller_log (seller_id, by_user, field, old_value, new_value) values (sid, auth.uid(), 'Data de Saída', old.end_date::text, p ->> 'end_date'); end if;
    if old.active <> coalesce((p ->> 'active')::boolean, true) then insert into public.cm_seller_log (seller_id, by_user, field, old_value, new_value) values (sid, auth.uid(), 'Status', old.active::text, coalesce(p ->> 'active', 'true')); end if;
    update public.cm_sellers set user_id = coalesce(nullif(p ->> 'user_id', '')::uuid, user_id), name = trim(p ->> 'name'), seniority_id = (p ->> 'seniority_id')::uuid,
      start_date = sd, effective_from = case when old.start_date = sd then old.effective_from else eff end, end_date = nullif(p ->> 'end_date', '')::date,
      active = coalesce((p ->> 'active')::boolean, true),
      salary_override = case when public.is_admin() then nullif(p ->> 'salary_override', '')::numeric else salary_override end where id = sid;
  end if;
  return sid;
end $$;

create function public.cm_seller_history(p_id uuid) returns jsonb language plpgsql stable security definer set search_path = public as $$
begin
  perform public.cm_assert_manager();
  return coalesce((select jsonb_agg(jsonb_build_object('at', l.at, 'field', l.field, 'old', l.old_value, 'new', l.new_value,
      'by', (select coalesce(nickname, full_name, email) from public.profiles where id = l.by_user)) order by l.at desc) from public.cm_seller_log l where l.seller_id = p_id), '[]'::jsonb);
end $$;

-- ---------- Parâmetros: leitura, rascunho, publicação ------------------------------------------------
create function public.cm_rules_get(p_months date[]) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare m date := public.month_start(p_months[1]); rl jsonb; draft boolean; st jsonb := '[]'::jsonb; xm date;
begin
  perform public.cm_assert_manager();
  select d.rules into rl from public.cm_drafts d where d.month = m;
  draft := rl is not null;
  if rl is null then rl := public.cm_rules(m); end if;
  foreach xm in array p_months loop
    st := st || jsonb_build_object('month', public.month_start(xm), 'status', public.cm_month_status(xm), 'locked', public.cm_locked(xm),
           'draft', exists (select 1 from public.cm_drafts where month = public.month_start(xm)));
  end loop;
  return jsonb_build_object('month', m, 'rules', rl, 'draft', draft, 'locked', public.cm_locked(m), 'locked_since', public.cm_lock_day(m), 'months', st,
    'calendar', (select jsonb_agg(public.cm_calendar(public.month_start(u.d)) order by u.d) from unnest(p_months) u(d)),
    'empresas', (select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'linha', linha) order by sort) from public.cm_empresas),
    'variacoes', coalesce((select jsonb_agg(jsonb_build_object('cobranca_id', c.id, 'produto', p.name, 'label', public.cm_cob_label(c.kind, p.gera_caixa), 'gera_caixa', p.gera_caixa,
         'bruto', c.bruto, 'liquido', c.liquido, 'taxa', public.cm_ref_taxa(p.id)) order by p.sort, c.kind)
         from public.cm_cobrancas c join public.cm_products p on p.id = c.product_id where p.active), '[]'::jsonb),
    'pending_unlock', exists (select 1 from public.cm_unlock_requests where month = m and status = 'pending'));
end $$;

create function public.cm_draft_save(p_months date[], p_rules jsonb) returns void language plpgsql security definer set search_path = public as $$
declare x date; mm date;
begin
  perform public.cm_assert_manager();
  foreach x in array p_months loop
    mm := public.month_start(x);
    if public.cm_locked(mm) then raise exception '% está travado: peça autorização ao admin', to_char(mm, 'MM/YYYY'); end if;
    insert into public.cm_drafts (month, rules, updated_by) values (mm, p_rules, auth.uid())
    on conflict (month) do update set rules = excluded.rules, updated_by = excluded.updated_by, updated_at = now();
  end loop;
end $$;

create function public.cm_validate_rules(r jsonb) returns void language plpgsql immutable as $$
declare psum numeric; prazo int := (r -> 'operacao' ->> 'prazo')::int; bonus int := (r -> 'operacao' ->> 'bonus')::int;
begin
  select coalesce(sum(value::numeric), 0) into psum from jsonb_each_text(r -> 'pesos');
  if abs(psum - 1) > 0.0001 then raise exception 'os pesos dos produtos precisam somar 100%% (hoje % %%)', round(psum * 100); end if;
  if (r ->> 'custo')::numeric <= 0 then raise exception 'informe o custo da área'; end if;
  if prazo < 1 then raise exception 'o prazo de cancelamento precisa ser de ao menos 1 dia'; end if;
  if prazo >= bonus then raise exception 'o prazo de cancelamento (% dias) precisa ser menor que o dia do bônus (dia %); máximo % dias', prazo, bonus, bonus - 1; end if;
  if exists (select 1 from jsonb_each(r -> 'valores') v where (v.value ->> 'bruto') is null or (v.value ->> 'bruto')::numeric <= 0) then
    raise exception 'o valor bruto de todas as variações é obrigatório'; end if;
end $$;

create function public.cm_publish(p_months date[]) returns void language plpgsql security definer set search_path = public as $$
declare x date; mm date; r jsonb;
begin
  perform public.cm_assert_manager();
  foreach x in array p_months loop
    mm := public.month_start(x);
    if public.cm_locked(mm) then raise exception '% está travado: peça autorização ao admin', to_char(mm, 'MM/YYYY'); end if;
    select rules into r from public.cm_drafts where month = mm;
    if r is null then r := public.cm_rules(mm); end if;
    perform public.cm_validate_rules(r);
    insert into public.cm_months (month, rules, published_by, unlocked) values (mm, r, auth.uid(), false)
    on conflict (month) do update set rules = excluded.rules, published_at = now(), published_by = excluded.published_by, unlocked = false;
    delete from public.cm_drafts where month = mm;
  end loop;
end $$;

create function public.cm_request_unlock(p_month date) returns void language plpgsql security definer set search_path = public as $$
begin
  perform public.cm_assert_manager();
  if exists (select 1 from public.cm_unlock_requests where month = public.month_start(p_month) and status = 'pending') then return; end if;
  insert into public.cm_unlock_requests (month, requested_by) values (public.month_start(p_month), auth.uid());
  perform public.notify(null, 'cm_unlock', 'Pedido para alterar mês travado', public.actor_name() || ' pediu autorização para alterar ' || to_char(public.month_start(p_month), 'MM/YYYY'), p_month::text);
end $$;

-- Admin autoriza (ou nega) a alteração de um mês travado
create function public.cm_decide_unlock(p_month date, p_approve boolean) returns void language plpgsql security definer set search_path = public as $$
declare mm date := public.month_start(p_month); r jsonb;
begin
  if not public.is_admin() then raise exception 'só o admin autoriza a alteração de mês travado'; end if;
  update public.cm_unlock_requests set status = case when p_approve then 'approved' else 'denied' end, decided_by = auth.uid(), decided_at = now()
   where month = mm and status = 'pending';
  if p_approve then
    insert into public.cm_months (month, rules, unlocked) values (mm, public.cm_rules(mm), true)
    on conflict (month) do update set unlocked = true;
  end if;
end $$;

-- Prévia da distribuição com regras de rascunho + calendário
create function public.cm_preview(p_month date, p_rules jsonb) returns jsonb language sql stable security definer set search_path = public as $$
  select public.cm_distribution(p_month, p_rules) $$;

-- ---------- Meses Programados -----------------------------------------------------------------------
create function public.cm_months_list() returns jsonb language plpgsql stable security definer set search_path = public as $$
declare cur date := public.month_start(public.cm_today()); i int; m date; rows jsonb := '[]'::jsonb;
begin
  perform public.cm_assert_manager();
  for i in 0..5 loop
    m := (cur + (i || ' month')::interval)::date;
    rows := rows || jsonb_build_object('month', m, 'status', public.cm_month_status(m), 'locked', public.cm_locked(m),
      'objetivo', case when exists (select 1 from public.cm_months where month = m) or i = 0 then (public.cm_distribution(m) ->> 'objetivo')::numeric end);
  end loop;
  return jsonb_build_object('atual', cur, 'objetivo_atual', (public.cm_distribution(cur) ->> 'objetivo')::numeric, 'rows', rows);
end $$;

-- ---------- Projeção ---------------------------------------------------------------------------------
-- Realizado = pontos confirmados; mês corrente = parcial; futuros = ritmo por dia útil dos últimos meses × dias úteis do mês.
create function public.cm_projecao(p_months date[], p_rules jsonb default null) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare cur date := public.month_start(public.cm_today()); i int; m date; v numeric; du int; sum_rate numeric := 0; n_rate int := 0; rate numeric;
  bars jsonb := '[]'::jsonb; seg jsonb := '[]'::jsonb; bon jsonb := '[]'::jsonb; target date := public.month_start(p_months[1]);
  d jsonb; meta numeric; proj numeric; att numeric; b numeric; sj jsonb; elapsed int; rules jsonb;
begin
  perform public.cm_assert_manager();
  rules := coalesce(p_rules, public.cm_rules(target));
  -- ritmo (pontos por dia útil): 2 meses fechados + corrente (parcial pelos dias úteis decorridos)
  for i in 1..2 loop
    m := (cur - (i || ' month')::interval)::date; v := public.cm_team_confirmed(m); du := public.business_days(m, public.month_end(m));
    if v > 0 and du > 0 then sum_rate := sum_rate + v / du; n_rate := n_rate + 1; end if;
  end loop;
  v := public.cm_team_confirmed(cur); elapsed := greatest(public.business_days(cur, public.cm_today()), 1);
  if v > 0 then sum_rate := sum_rate + v / elapsed; n_rate := n_rate + 1; end if;
  rate := case when n_rate > 0 then sum_rate / n_rate end;
  for i in -1..4 loop
    m := (cur + (i || ' month')::interval)::date;
    du := public.business_days(m, public.month_end(m));
    if i < 0 then v := public.cm_team_confirmed(m); bars := bars || jsonb_build_object('month', m, 'value', v, 'kind', 'realizado');
    elsif i = 0 then bars := bars || jsonb_build_object('month', m, 'value', public.cm_team_confirmed(m), 'kind', 'parcial');
    else bars := bars || jsonb_build_object('month', m, 'value', case when rate is not null then round(rate * du) end, 'kind', 'projetado'); end if;
  end loop;
  d := public.cm_distribution(target, rules); meta := (d ->> 'objetivo')::numeric;
  for i in 1..4 loop
    m := (cur + (i || ' month')::interval)::date;
    if m < target then continue; end if;
    du := public.business_days(m, public.month_end(m));
    proj := case when rate is not null then round(rate * du) end;
    d := public.cm_distribution(m, rules); att := case when proj is not null and (d ->> 'meta_total')::numeric > 0 then round(proj / (d ->> 'meta_total')::numeric, 4) end;
    seg := seg || jsonb_build_object('month', m, 'projetado', proj, 'atingimento', att);
    b := 0;
    if att is not null then
      for sj in select * from jsonb_array_elements(d -> 'sellers') loop
        b := b + round((sj ->> 'salary')::numeric * att * public.cm_fator(att, (sj ->> 'gatilho')::numeric, rules), 2);
      end loop;
    end if;
    bon := bon || jsonb_build_object('month', m, 'valor', case when att is not null then round(b) end, 'pct_caixa', case when proj > 0 then round(b / proj, 4) end);
  end loop;
  return jsonb_build_object('meta', meta, 'bars', bars, 'seguintes', seg, 'bonus', bon);
end $$;

-- ---------- Sugestão -----------------------------------------------------------------------------------
create function public.cm_sugestao(p_month date default null) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare nxt date := coalesce(public.month_start(p_month), (public.month_start(public.cm_today()) + interval '1 month')::date);
  sg jsonb := public.cm_sugestao_pct(nxt); rules jsonb := public.cm_rules(nxt); motivos jsonb := '[]'::jsonb; s public.cm_sellers; cols jsonb := '[]'::jsonb;
  k text; pctv numeric; r2 jsonb; d jsonb; meta numeric; avg_pts numeric; att numeric; bonus numeric; sal numeric; gat numeric; n int; rampa int; du_a int; du_b int; opts jsonb := '{}'::jsonb; mm date; tot numeric := 0; c int := 0; i int; v numeric;
begin
  perform public.cm_assert_manager();
  if (sg ->> 'sem_historico')::boolean then return jsonb_build_object('month', nxt, 'sem_historico', true, 'atual', sg -> 'atual'); end if;
  motivos := motivos || jsonb_build_object('label', case when (sg ->> 'acima')::int * 2 >= (sg ->> 'meses')::int then 'Time acima da meta' else 'Time abaixo da meta' end,
      'value', case when (sg ->> 'acima')::int * 2 >= (sg ->> 'meses')::int then (sg ->> 'acima') || ' meses' else ((sg ->> 'meses')::int - (sg ->> 'acima')::int) || ' meses' end);
  select count(*) into rampa from public.cm_sellers x where public.cm_seller_in_month(x, nxt) and public.cm_gatilho(x, nxt, rules) < 1;
  if rampa > 0 then motivos := motivos || jsonb_build_object('label', 'Vendedores em Rampagem', 'value', rampa || ' em ' || lower(to_char(nxt, 'TMmon'))); end if;
  du_a := public.business_days(nxt, public.month_end(nxt)); du_b := public.business_days((nxt - interval '1 month')::date, public.month_end((nxt - interval '1 month')::date));
  if du_a <> du_b then motivos := motivos || jsonb_build_object('label', initcap(to_char(nxt, 'TMmonth')) || ' com ' || case when du_a < du_b then 'menos' else 'mais' end || ' dias úteis',
      'value', case when du_a < du_b then '−' else '+' end || abs(du_a - du_b) || ' dia' || case when abs(du_a - du_b) > 1 then 's' else '' end); end if;
  -- efeito para um vendedor de referência (o 1º ativo): pontos médios dos últimos 3 meses × cenários de % de geração
  select * into s from public.cm_sellers x where public.cm_seller_in_month(x, nxt) order by name limit 1;
  if s.id is not null then
    for i in 1..3 loop
      mm := (nxt - ((i + 0) || ' month')::interval)::date; v := (public.cm_seller_month(s.id, mm) ->> 'confirmado')::numeric;
      if v > 0 then tot := tot + v; c := c + 1; end if;
    end loop;
    avg_pts := case when c > 0 then tot / c end;
    for k in select unnest(array['atual', 'sugerido', 'aliviar']) loop
      pctv := (sg ->> k)::numeric; r2 := jsonb_set(rules, '{pct}', to_jsonb(pctv)); d := public.cm_distribution(nxt, r2);
      select (j ->> 'meta')::numeric, (j ->> 'salary')::numeric, (j ->> 'gatilho')::numeric into meta, sal, gat from jsonb_array_elements(d -> 'sellers') j where (j ->> 'id')::uuid = s.id;
      att := case when avg_pts is not null and meta > 0 then round(avg_pts / meta, 4) end;
      bonus := case when att is not null then round(sal * att * public.cm_fator(att, gat, r2), 0) end;
      opts := opts || jsonb_build_object(k, jsonb_build_object('pct', pctv, 'objetivo', (d ->> 'objetivo')::numeric, 'atingimento', att, 'bonus', bonus));
    end loop;
  end if;
  return jsonb_build_object('month', nxt, 'sem_historico', false, 'atual', sg -> 'atual', 'sugerido', sg -> 'sugerido', 'aliviar', sg -> 'aliviar', 'confianca', sg ->> 'confianca',
    'meses', sg -> 'atingimentos', 'motivos', motivos, 'vendedor', case when s.id is null then null else s.name end, 'cenarios', opts);
end $$;

-- Aplica a sugestão como rascunho do mês seguinte
create function public.cm_apply_sugestao(p_month date, p_scenario text) returns void language plpgsql security definer set search_path = public as $$
declare sg jsonb := public.cm_sugestao_pct(p_month); r jsonb := coalesce((select rules from public.cm_drafts where month = public.month_start(p_month)), public.cm_rules(p_month));
begin
  perform public.cm_assert_manager();
  if (sg ->> 'sem_historico')::boolean then raise exception 'sem histórico suficiente para sugerir'; end if;
  perform public.cm_draft_save(array[public.month_start(p_month)], jsonb_set(r, '{pct}', to_jsonb((sg ->> case p_scenario when 'aliviar' then 'aliviar' when 'manter' then 'atual' else 'sugerido' end)::numeric)));
end $$;

-- ---------- Calculadora de Meta ------------------------------------------------------------------------
create function public.cm_calc(p_month date default null, p_seller uuid default null) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare cur date := public.month_start(public.cm_today()); m date := coalesce(public.month_start(p_month), cur); sid uuid; r jsonb; d jsonb; rules jsonb := public.cm_rules(m);
  me jsonb; meta numeric; real numeric; falta numeric; produtos jsonb := '[]'::jsonb; e jsonb; need numeric; needs numeric := 0; rec record; emp_real numeric; cob uuid; ppv numeric;
  months jsonb := '[]'::jsonb; x date; st text; scale numeric; peso numeric; s public.cm_sellers; q numeric;
begin
  perform public.cm_run_daily();
  sid := case when public.is_manager() then coalesce(p_seller, public.cm_my_seller(), (select id from public.cm_sellers sx where public.cm_seller_in_month(sx, m) order by name limit 1)) else public.cm_my_seller() end;
  if sid is null then return jsonb_build_object('month', m, 'sem_vendedor', true); end if;
  select * into s from public.cm_sellers where id = sid;
  r := public.cm_seller_month(sid, m); d := public.cm_distribution(m);
  meta := (r ->> 'meta')::numeric; real := (r ->> 'confirmado')::numeric; falta := greatest(meta - real, 0);
  -- necessidade por empresa = meta × peso − realizado da empresa; escalada para fechar exatamente a "falta"
  for e in select * from jsonb_array_elements(d -> 'empresas') loop
    select coalesce(sum((public.cm_sale_points(sa.id) ->> 'confirmado')::numeric), 0) into emp_real from public.cm_sales sa
      join public.cm_products pr on pr.id = sa.product_id where sa.seller_id = sid and sa.month = m and sa.status in ('em_prazo', 'validada') and pr.empresa_id = (e ->> 'id')::uuid;
    need := greatest(meta * (e ->> 'peso')::numeric - emp_real, 0); needs := needs + need;
    e := e || jsonb_build_object('need', need); produtos := produtos || e;
  end loop;
  scale := case when needs > 0 then falta / needs else 0 end;
  return jsonb_build_object('month', m, 'status', public.cm_month_status(m),
    'months', (select coalesce(jsonb_agg(jsonb_build_object('month', mm, 'status', public.cm_month_status(mm)) order by mm), '[]'::jsonb) from (
        select distinct x2 as mm from (select cur as x2 union select month from public.cm_months union select month from public.cm_freezes) q where x2 >= (cur - interval '2 month') and x2 <= (cur + interval '3 month')) z),
    'sellers', (select coalesce(jsonb_agg(jsonb_build_object('id', x2.id, 'name', x2.name) order by x2.name), '[]'::jsonb) from public.cm_sellers x2
                where (public.is_manager() and public.cm_seller_in_month(x2, m)) or x2.id = public.cm_my_seller()),
    'seller', jsonb_build_object('id', sid, 'name', s.name), 'meta', meta, 'realizado', real, 'falta', falta, 'gatilho', r -> 'gatilho', 'gatilho_pts', r -> 'gatilho_pts',
    'salario', r -> 'salario', 'regua', rules -> 'regua',
    'peso_total', (select coalesce(sum((pj ->> 'peso')::numeric), 0) from jsonb_array_elements(produtos) pj),
    'produtos', (select coalesce(jsonb_agg(jsonb_build_object('cobranca_id', c.id, 'produto', pr.name, 'tipo', public.cm_cob_label(c.kind, pr.gera_caixa), 'peso', (pe ->> 'peso')::numeric,
         'pts', public.cm_cobranca_liquido(c.id, rules -> 'valores'),
         'qtd', case when c.id = (select c2.id from public.cm_cobrancas c2 join public.cm_products p2 on p2.id = c2.product_id where p2.empresa_id = pr.empresa_id and p2.active order by p2.sort, case c2.kind when 'integral' then 1 else 2 end limit 1)
                     and public.cm_cobranca_liquido(c.id, rules -> 'valores') > 0 then ceil((pe ->> 'need')::numeric * scale / public.cm_cobranca_liquido(c.id, rules -> 'valores') * 100) / 100 else 0 end)
         order by pr.sort, c.kind), '[]'::jsonb)
       from public.cm_cobrancas c join public.cm_products pr on pr.id = c.product_id
       join jsonb_array_elements(produtos) pe on (pe ->> 'id')::uuid = pr.empresa_id where pr.active));
end $$;

-- ---------- Vendas ------------------------------------------------------------------------------------------
create function public.cm_forma_label(f text, parcelado boolean) returns text language sql immutable as $$
  select case f when 'cartao' then 'Cartão de Crédito' when 'pix' then case when parcelado then 'Boleto | PIX Parcelado' else 'PIX' end
                else case when parcelado then 'Boleto | PIX Parcelado' else 'Boleto' end end $$;

create function public.cm_sales_list(p_seller uuid default null, p_month date default null, p_todos boolean default false) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare cur date := public.month_start(public.cm_today()); m date := coalesce(public.month_start(p_month), cur); todos boolean; sid uuid; r jsonb; rows jsonb := '[]'::jsonb;
  vali numeric := 0; prazo numeric := 0; aguard numeric := 0; conf numeric := 0; meta numeric := 0; x record; pts jsonb; v numeric; one jsonb;
begin
  perform public.cm_run_daily();
  if public.is_manager() then
    sid := coalesce(p_seller, public.cm_my_seller());
    todos := coalesce(p_todos, false) or sid is null;
  else
    sid := public.cm_my_seller(); todos := false;
    if sid is null then return jsonb_build_object('month', m, 'sem_vendedor', true); end if;
  end if;
  if todos then
    for x in select (j ->> 'id')::uuid as id from jsonb_array_elements(public.cm_distribution(m) -> 'sellers') j loop
      r := public.cm_seller_month(x.id, m);
      vali := vali + (r ->> 'validadas')::numeric; prazo := prazo + (r ->> 'em_prazo')::numeric; aguard := aguard + (r ->> 'aguardando')::numeric;
      conf := conf + (r ->> 'confirmado')::numeric; meta := meta + (r ->> 'meta')::numeric;
    end loop;
    r := jsonb_build_object('meta', meta, 'confirmado', conf, 'validadas', vali, 'em_prazo', prazo, 'aguardando', aguard,
      'atingimento', case when meta > 0 then round(conf / meta, 4) end, 'congelamento', public.cm_freeze_at(m));
  else
    r := public.cm_seller_month(sid, m);
  end if;
  for x in select sa.id, sa.status, sa.cliente, sa.first_payment_at, sa.registered_at, pr.name as produto, sl.name as vendedor, c.kind, pr.gera_caixa
           from public.cm_sales sa join public.cm_products pr on pr.id = sa.product_id join public.cm_sellers sl on sl.id = sa.seller_id join public.cm_cobrancas c on c.id = sa.cobranca_id
           where (todos or sa.seller_id = sid) and (sa.month = m or (sa.status = 'aguardando_pagamento' and sa.month = m))
           order by case sa.status when 'validada' then 1 when 'em_prazo' then 2 when 'aguardando_pagamento' then 3 else 4 end, coalesce(sa.first_payment_at, sa.registered_at), sa.created_at loop
    pts := public.cm_sale_points(x.id);
    v := case when x.status in ('em_prazo', 'validada') then (pts ->> 'confirmado')::numeric else (pts ->> 'total')::numeric end;
    rows := rows || jsonb_build_object('id', x.id, 'produto', x.produto || case when x.kind = 'recorrencia' and x.produto like 'Marketing%' then ' · Recorrência' else '' end,
      'cliente', x.cliente, 'vendedor', x.vendedor, 'data', coalesce(x.first_payment_at, x.registered_at), 'pontos', v, 'status', x.status);
  end loop;
  return jsonb_build_object('month', m, 'todos', todos, 'seller', case when todos then null else jsonb_build_object('id', sid, 'name', (select name from public.cm_sellers where id = sid)) end,
    'sellers', (select coalesce(jsonb_agg(jsonb_build_object('id', x2.id, 'name', x2.name) order by x2.name), '[]'::jsonb) from public.cm_sellers x2
                where (public.is_manager() and (x2.active or x2.end_date >= m)) or x2.id = public.cm_my_seller()),
    'hero', r, 'rows', rows);
end $$;

create function public.cm_sale_get(p_sale uuid) returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare s public.cm_sales; pr public.cm_products; c public.cm_cobrancas; sl public.cm_sellers; pts jsonb; forms jsonb; frozen boolean; mgr boolean := public.is_manager(); done_by text; canc_by text;
begin
  perform public.cm_run_daily();
  select * into s from public.cm_sales where id = p_sale;
  if not found then raise exception 'venda não encontrada'; end if;
  perform public.cm_assert_sale_access(s.seller_id);
  select * into pr from public.cm_products where id = s.product_id; select * into c from public.cm_cobrancas where id = s.cobranca_id; select * into sl from public.cm_sellers where id = s.seller_id;
  pts := public.cm_sale_points(p_sale);
  frozen := exists (select 1 from public.cm_freezes where month = s.month);
  select coalesce(nickname, full_name, email) into done_by from public.profiles where id = s.confirmed_by;
  select coalesce(nickname, full_name, email) into canc_by from public.profiles where id = s.cancelled_by;
  select coalesce(jsonb_agg(jsonb_build_object('id', p.id, 'forma', p.forma, 'label', public.cm_forma_label(p.forma, p.parcelas > 1 and p.forma <> 'cartao'),
      'bruto', p.bruto, 'liquido', p.liquido, 'parcelas', p.parcelas, 'data', p.first_date, 'paid_at', p.paid_at, 'parcelado', p.parcelas > 1 and p.forma <> 'cartao',
      'pelas_taxas', abs(p.liquido - round(p.bruto * (1 - public.cm_pay_taxa(s.product_id, p.forma)), 2)) < 0.01 and public.cm_pay_taxa(s.product_id, p.forma) > 0) order by p.sort), '[]'::jsonb)
    into forms from public.cm_sale_payments p where p.sale_id = p_sale;
  return jsonb_build_object('id', s.id, 'status', s.status, 'produto', pr.name, 'cliente', s.cliente, 'seller_id', s.seller_id, 'vendedor', sl.name,
    'cobranca', case c.kind when 'integral' then 'Pagamento Integral' else 'Recorrência Mensal' end,
    'formas', forms, 'bruto', (select coalesce(sum(bruto), 0) from public.cm_sale_payments where sale_id = p_sale), 'liquido', (select coalesce(sum(liquido), 0) from public.cm_sale_payments where sale_id = p_sale),
    'registrada_em', s.registered_at, 'pago_em', s.first_payment_at, 'cancelavel_ate', s.cancelavel_ate, 'validada_em', s.validada_em, 'month', s.month,
    'confirmado_por', done_by, 'comprovante', s.comprovante, 'pontos', case when s.status in ('em_prazo', 'validada') then pts -> 'confirmado' else pts -> 'total' end, 'previsto', pts -> 'previsto',
    'congelado', frozen, 'cancelada_em', s.cancelled_at, 'cancelada_por', canc_by, 'motivo', s.cancel_reason, 'product_id', s.product_id, 'cobranca_id', s.cobranca_id,
    'can_cancel', s.status in ('aguardando_pagamento', 'em_prazo') and (s.cancelavel_ate is null or s.cancelavel_ate >= public.cm_today()),
    'can_confirm', s.status = 'aguardando_pagamento', 'can_edit', s.status = 'aguardando_pagamento', 'is_manager', mgr);
end $$;

-- Prévia do registro (tela "Registrar Venda"): roda o registro de verdade dentro de um sub-bloco e desfaz — as regras são as mesmas do banco.
create function public.cm_sale_preview(p jsonb) returns jsonb language plpgsql volatile security definer set search_path = public as $$
declare sid uuid; s public.cm_sales; pts jsonb; formas jsonb := '[]'::jsonb; pay public.cm_sale_payments; pp jsonb; af jsonb; bf jsonb; res jsonb;
  pr jsonb := p || jsonb_build_object('cliente', coalesce(nullif(trim(p ->> 'cliente'), ''), 'Prévia'));
begin
  begin
    sid := public.cm_register_sale(pr);
    select * into s from public.cm_sales where id = sid;
    pts := public.cm_sale_points(sid);
    for pay in select * from public.cm_sale_payments where sale_id = sid order by sort loop
      pp := public.cm_payment_points(pay.id);
      formas := formas || jsonb_build_object('forma', pay.forma, 'parcelas', pay.parcelas, 'bruto', pay.bruto, 'liquido', pay.liquido, 'data', pay.first_date, 'paid_at', pay.paid_at,
        'label', public.cm_forma_label(pay.forma, pay.parcelas > 1 and pay.forma <> 'cartao'), 'parcelado', pay.parcelas > 1 and pay.forma <> 'cartao',
        'pelas_taxas', abs(pay.liquido - round(pay.bruto * (1 - public.cm_pay_taxa(s.product_id, pay.forma)), 2)) < 0.01 and public.cm_pay_taxa(s.product_id, pay.forma) > 0,
        'confirmado', pp -> 'confirmado', 'previsto', pp -> 'previsto');
    end loop;
    af := public.cm_seller_month(s.seller_id, s.month);
    delete from public.cm_sales where id = sid;
    bf := public.cm_seller_month(s.seller_id, s.month);
    res := jsonb_build_object('month', s.month, 'status', s.status, 'formas', formas, 'confirmado', pts -> 'confirmado', 'previsto', pts -> 'previsto',
      'bruto', (select coalesce(sum((x ->> 'bruto')::numeric), 0) from jsonb_array_elements(formas) x), 'liquido', (select coalesce(sum((x ->> 'liquido')::numeric), 0) from jsonb_array_elements(formas) x),
      'atingimento', jsonb_build_array(bf -> 'atingimento', af -> 'atingimento'), 'cancelavel_ate', s.cancelavel_ate, 'validada_em', s.validada_em);
    raise exception '__preview__';
  exception when others then
    if sqlerrm <> '__preview__' then raise; end if;
  end;
  return res;
end $$;

-- ---------- Calculadora: alcance/bônus simulados e prévia do líquido do produto ----------------------------------
-- Pontos simulados = confirmado + Σ quantidade × pontos da cobrança (mesmas regras de cm_seller_month/cm_fator).
create function public.cm_calc_sim(p_month date default null, p_seller uuid default null, p_qtds jsonb default '{}'::jsonb) returns jsonb
language plpgsql volatile security definer set search_path = public as $$
declare cur date := public.month_start(public.cm_today()); m date := coalesce(public.month_start(p_month), cur); sid uuid; r jsonb; rules jsonb := public.cm_rules(m);
  extra numeric := 0; pts numeric; ating numeric; fator numeric; bonus numeric; k text; v numeric;
begin
  sid := case when public.is_manager() then coalesce(p_seller, public.cm_my_seller(), (select id from public.cm_sellers x where public.cm_seller_in_month(x, m) order by name limit 1)) else public.cm_my_seller() end;
  if sid is null then return jsonb_build_object('month', m, 'sem_vendedor', true); end if;
  r := public.cm_seller_month(sid, m);
  for k, v in select key, value::numeric from jsonb_each_text(coalesce(p_qtds, '{}'::jsonb)) loop
    extra := extra + greatest(v, 0) * coalesce(public.cm_cobranca_liquido(k::uuid, rules -> 'valores'), 0);
  end loop;
  pts := (r ->> 'confirmado')::numeric + extra;
  ating := case when (r ->> 'meta')::numeric > 0 then round(pts / (r ->> 'meta')::numeric, 4) else 0 end;
  fator := public.cm_fator(ating, (r ->> 'gatilho')::numeric, rules);
  bonus := round((r ->> 'salario')::numeric * ating * fator, 2);
  return jsonb_build_object('month', m, 'pontos', round(pts), 'atingimento', ating, 'fator', fator, 'bonus', bonus, 'abaixo_gatilho', ating < (r ->> 'gatilho')::numeric);
end $$;

-- Líquido de cada cobrança do formulário de Produto (digitado > pelas taxas > bruto), igual a cm_cobranca_liquido, sem gravar nada.
create function public.cm_product_preview(p jsonb) returns jsonb language plpgsql stable security definer set search_path = public as $$
declare c jsonb; ref numeric; res jsonb := '[]'::jsonb; gera boolean := coalesce((p ->> 'gera_caixa')::boolean, true); bruto numeric;
begin
  perform public.cm_assert_manager();
  select (f ->> 'taxa')::numeric into ref from jsonb_array_elements(coalesce(p -> 'formas', '[]'::jsonb)) f
    order by case f ->> 'forma' when 'cartao' then 1 when 'pix' then 2 else 3 end limit 1;
  ref := coalesce(ref, 0);
  for c in select * from jsonb_array_elements(coalesce(p -> 'cobrancas', '[]'::jsonb)) loop
    bruto := coalesce(nullif(c ->> 'bruto', '')::numeric, 0);
    res := res || jsonb_build_object('kind', c ->> 'kind', 'liquido',
      case when nullif(c ->> 'liquido', '') is not null then (c ->> 'liquido')::numeric when gera then round(bruto * (1 - ref), 2) else bruto end);
  end loop;
  return res;
end $$;

-- ---------- Segurança: RLS, grants, auditoria, storage, agendamento ------------------------------------------------
do $$
declare t text;
begin
  foreach t in array array['cm_empresas', 'cm_products', 'cm_cobrancas', 'cm_product_formas', 'cm_seniorities', 'cm_sellers', 'cm_seller_log', 'cm_months',
    'cm_unlock_requests', 'cm_sales', 'cm_sale_payments', 'cm_freezes', 'cm_adjustments', 'cm_drafts']
  loop execute format('alter table public.%I enable row level security', t); end loop;
end $$;

-- Leitura direta: catálogos para quem tem a área; vendas só do dono ou gestor. Escrita: SOMENTE pelas RPCs (security definer).
create policy cm_emp_sel on public.cm_empresas for select to authenticated using (public.has_area('metas'));
create policy cm_prod_sel on public.cm_products for select to authenticated using (public.has_area('metas'));
create policy cm_cob_sel on public.cm_cobrancas for select to authenticated using (public.has_area('metas'));
create policy cm_pf_sel on public.cm_product_formas for select to authenticated using (public.has_area('metas'));
create policy cm_sen_sel on public.cm_seniorities for select to authenticated using (public.is_manager());
create policy cm_sel_sel on public.cm_sellers for select to authenticated using (public.is_manager() or user_id = auth.uid());
create policy cm_log_sel on public.cm_seller_log for select to authenticated using (public.is_manager());
create policy cm_mon_sel on public.cm_months for select to authenticated using (public.is_manager());
create policy cm_unl_sel on public.cm_unlock_requests for select to authenticated using (public.is_manager());
create policy cm_sal_sel on public.cm_sales for select to authenticated using (public.is_manager() or seller_id = public.cm_my_seller());
create policy cm_pay_sel on public.cm_sale_payments for select to authenticated using (exists (select 1 from public.cm_sales s where s.id = sale_id and (public.is_manager() or s.seller_id = public.cm_my_seller())));
create policy cm_frz_sel on public.cm_freezes for select to authenticated using (public.is_manager());
create policy cm_adj_sel on public.cm_adjustments for select to authenticated using (public.is_manager());
create policy cm_drf_sel on public.cm_drafts for select to authenticated using (public.is_manager());
-- Sem policies de escrita: a RLS barra insert/update/delete diretos.
revoke insert, update, delete on public.cm_empresas, public.cm_products, public.cm_cobrancas, public.cm_product_formas, public.cm_seniorities, public.cm_sellers,
  public.cm_seller_log, public.cm_months, public.cm_unlock_requests, public.cm_sales, public.cm_sale_payments, public.cm_freezes, public.cm_adjustments, public.cm_drafts from authenticated, anon;

grant select on public.cm_empresas, public.cm_products, public.cm_cobrancas, public.cm_product_formas, public.cm_seniorities, public.cm_sellers, public.cm_seller_log,
  public.cm_months, public.cm_unlock_requests, public.cm_sales, public.cm_sale_payments, public.cm_freezes, public.cm_adjustments, public.cm_drafts to authenticated;
grant all on public.cm_empresas, public.cm_products, public.cm_cobrancas, public.cm_product_formas, public.cm_seniorities, public.cm_sellers, public.cm_seller_log,
  public.cm_months, public.cm_unlock_requests, public.cm_sales, public.cm_sale_payments, public.cm_freezes, public.cm_adjustments, public.cm_drafts to service_role;

-- Auditoria imutável das tabelas do Comercial
do $$
declare t text;
begin
  foreach t in array array['cm_products', 'cm_cobrancas', 'cm_product_formas', 'cm_seniorities', 'cm_sellers', 'cm_months', 'cm_sales', 'cm_sale_payments', 'cm_freezes', 'cm_adjustments']
  loop
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$s for each row execute function public.audit_row()', t);
  end loop;
end $$;

-- Execução: nada para anônimos; as funções internas de apoio ficam acessíveis só ao servidor
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated, service_role;
revoke execute on function public.write_log(text, text, text, text, text, text) from authenticated;
revoke execute on function public.notify(uuid, text, text, text, text) from authenticated;
revoke execute on function public.cm_seed_rules() from anon;
revoke execute on function public.cm_run_daily() from anon;

-- Comprovantes (storage) — se o SQL não puder criar o bucket, crie "comprovantes" (privado) pelo painel
do $$
begin
  if to_regclass('storage.buckets') is not null then
    begin
      insert into storage.buckets (id, name, public) values ('comprovantes', 'comprovantes', false) on conflict (id) do nothing;
    exception when others then
      raise notice 'bucket "comprovantes" não criado por SQL (%): crie pelo Storage', sqlerrm;
    end;
    begin
      execute $p$create policy "comprovantes_ler" on storage.objects for select to authenticated
                 using (bucket_id = 'comprovantes' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_manager()))$p$;
      execute $p$create policy "comprovantes_enviar" on storage.objects for insert to authenticated
                 with check (bucket_id = 'comprovantes' and (storage.foldername(name))[1] = auth.uid()::text)$p$;
    exception when others then
      raise notice 'políticas de storage dos comprovantes não criadas (%)', sqlerrm;
    end;
  end if;
end $$;

-- Rotina diária (validação automática + congelamento), se pg_cron existir. Também roda "sob demanda" nas telas.
do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('sigma-comercial-diario', '5 3 * * *', 'select public.cm_run_daily()');
    perform cron.schedule('sigma-comercial-congelar', '2 2 * * *', 'select public.cm_run_daily()');
  end if;
exception when others then
  raise notice 'pg_cron indisponível: as telas executam cm_run_daily() sozinhas ao abrir; agende-a diariamente se quiser.';
end $$;

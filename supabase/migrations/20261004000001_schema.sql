-- =====================================================================
-- Intranet Anfitrião Sigma — 1/4  ESQUEMA
-- Tabelas, gatilhos de cadastro (restrição de domínio) e funções-base.
-- Rode os 4 arquivos em ordem no SQL Editor do Supabase (ou `supabase db push`).
-- =====================================================================

create type public.app_role as enum ('closer', 'gestor', 'admin');

-- ---------- Perfis ----------------------------------------------------
create table public.profiles (
  id              uuid primary key references auth.users (id) on delete cascade,
  email           text not null unique,
  full_name       text,
  nickname        text,
  avatar_url      text,
  phone           text,
  whatsapp        text,
  birth_date      date,
  personal_email  text,
  address         jsonb not null default '{}'::jsonb,   -- {cep, rua, numero, complemento, bairro, cidade, uf}
  job_title       text,
  seniority       text,                                  -- informativo (não altera meta)
  manager_id      uuid references public.profiles (id),
  regime          text check (regime in ('clt', 'pj')) default 'pj',
  start_date      date,
  end_date        date,
  active          boolean not null default true,
  google_login    boolean not null default true,
  emergency_name  text,
  emergency_phone text,
  notes           text,
  created_at      timestamptz not null default now()
);

create table public.user_roles (
  user_id uuid primary key references auth.users (id) on delete cascade,
  role    public.app_role not null default 'closer'
);

-- Dados sensíveis: só o próprio dono lê/altera (gestor vê mascarado via função).
create table public.profile_sensitive (
  user_id    uuid primary key references auth.users (id) on delete cascade,
  cpf        text,
  cnpj       text,
  rg         text,
  pix_key    text,
  bank       text,
  agency     text,
  account    text,
  updated_at timestamptz not null default now()
);

-- ---------- Áreas e solicitações de acesso -----------------------------
create table public.area_access (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  area         text not null,
  status       text not null default 'pending' check (status in ('pending', 'approved', 'denied')),
  requested_at timestamptz not null default now(),
  decided_by   uuid references auth.users (id),
  decided_at   timestamptz,
  note         text,
  unique (user_id, area)
);

-- ---------- Produtos (com vigência) ------------------------------------
create table public.products (
  id         uuid primary key default gen_random_uuid(),
  name       text not null unique,
  recurring  boolean not null default false,
  active     boolean not null default true,
  sort       int not null default 0,
  created_at timestamptz not null default now()
);

create table public.product_versions (
  id         uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  valid_from date not null,                          -- sempre 1º dia de um mês
  points     numeric not null check (points >= 0),   -- "Valor" do produto na meta
  min_price  numeric not null default 0,             -- piso (valor mínimo estimado)
  caixa_pct  numeric not null default 0 check (caixa_pct between 0 and 1),
  unique (product_id, valid_from)
);

-- ---------- Parâmetros (com vigência) ----------------------------------
create table public.params (
  key        text not null,
  valid_from date not null default '2000-01-01',
  value      numeric not null,
  primary key (key, valid_from)
);

create table public.salary_history (
  id         uuid primary key default gen_random_uuid(),
  user_id    uuid not null references auth.users (id) on delete cascade,
  valid_from date not null,
  amount     numeric not null check (amount >= 0),
  unique (user_id, valid_from)
);

create table public.holidays (
  day  date primary key,
  name text not null
);

create table public.company_info (
  id          int primary key default 1 check (id = 1),
  legal_name  text,
  cnpj        text,
  address     text,
  email       text,
  nf_notes    text
);

-- ---------- Metas ------------------------------------------------------
create table public.multiplier_fixed (            -- tabela de múltiplo fixado por mês
  month      date primary key,
  value      numeric not null check (value > 0),
  set_by     uuid references auth.users (id),
  set_at     timestamptz not null default now()
);

create table public.meta_overrides (              -- MetaEscala manual por vendedor (vigência por mês)
  id              uuid primary key default gen_random_uuid(),
  user_id         uuid not null references auth.users (id) on delete cascade,
  effective_month date not null,
  scale           numeric not null check (scale >= 0),
  reason          text,
  created_by      uuid references auth.users (id),
  created_at      timestamptz not null default now()
);

create table public.goal_locks (                   -- "meta fechada" confirmada pelo gestor
  month        date primary key,
  confirmed_by uuid references auth.users (id),
  confirmed_at timestamptz not null default now()
);

create table public.month_goals (                  -- foto das metas no momento do fechamento
  month      date not null,
  user_id    uuid not null references auth.users (id) on delete cascade,
  salary     numeric not null,
  ramp       numeric not null,
  multiplier numeric not null,
  scale      numeric not null,
  goal       numeric not null,
  primary key (month, user_id)
);

create table public.month_closures (               -- fechamento do mês (congela a folha)
  month     date primary key,
  closed_by uuid references auth.users (id),
  closed_at timestamptz not null default now(),
  rows      jsonb not null
);

-- ---------- Vendas -----------------------------------------------------
create table public.sales (
  id             uuid primary key default gen_random_uuid(),
  seller_id      uuid not null references auth.users (id),
  client_name    text not null,
  client_doc     text,                              -- somente dígitos
  sale_date      date not null,
  status         text not null default 'pending' check (status in ('pending', 'validated', 'cancelled')),
  pay_method     text not null check (pay_method in ('boleto', 'cartao', 'pix', 'transferencia')),
  installments   int not null default 1 check (installments >= 1),
  recurring      boolean not null default false,
  notes          text,
  floor_status   text not null default 'ok' check (floor_status in ('ok', 'needs_approval', 'approved', 'rejected')),
  dup_flag       boolean not null default false,
  total_value    numeric not null default 0,
  validated_at   timestamptz,
  cancelled_at   timestamptz,
  cancelled_by   uuid references auth.users (id),
  cancel_reason  text,
  created_at     timestamptz not null default now()
);
create index sales_seller_date on public.sales (seller_id, sale_date);
create index sales_status on public.sales (status, sale_date);
create index sales_dup on public.sales (client_doc, total_value, sale_date);

create table public.sale_items (
  id           uuid primary key default gen_random_uuid(),
  sale_id      uuid not null references public.sales (id) on delete cascade,
  product_id   uuid not null references public.products (id),
  qty          int not null default 1 check (qty >= 1),
  qty_override int check (qty_override >= 0),
  value        numeric not null default 0             -- valor total do produto nesta venda
);
create index sale_items_sale on public.sale_items (sale_id);

-- ---------- Nota fiscal de pagamento ----------------------------------
create table public.invoices (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references auth.users (id) on delete cascade,
  month        date not null,
  number       text,
  amount       numeric not null,
  fixo         numeric not null,
  bonus        numeric not null,
  status       text not null default 'pendente' check (status in ('pendente', 'enviada', 'aprovada', 'paga')),
  file_path    text,                                   -- NF externa anexada (bucket "invoices")
  generated_at timestamptz not null default now(),
  approved_by  uuid references auth.users (id),
  paid_at      timestamptz,
  unique (user_id, month)
);

-- ---------- Avisos -----------------------------------------------------
create table public.notifications (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid references auth.users (id) on delete cascade,  -- null = todos os gestores
  kind        text not null,
  title       text not null,
  body        text,
  ref         text,
  created_at  timestamptz not null default now(),
  resolved_at timestamptz
);
create index notifications_user on public.notifications (user_id, resolved_at);

-- ---------- Log imutável ----------------------------------------------
create table public.audit_log (
  id         bigint generated always as identity primary key,
  at         timestamptz not null default now(),
  actor_id   uuid,
  actor_name text,
  actor_role text,
  action     text not null,
  entity     text,
  entity_id  text,
  detail     text,
  location   text,
  device     text,
  meta       jsonb
);
create index audit_log_at on public.audit_log (at desc);

create function public.audit_log_immutable() returns trigger language plpgsql as $$
begin
  raise exception 'audit_log é imutável (somente inserção)';
end $$;
create trigger audit_log_no_update before update or delete on public.audit_log
  for each row execute function public.audit_log_immutable();
create trigger audit_log_no_truncate before truncate on public.audit_log
  for each statement execute function public.audit_log_immutable();

-- ---------- Funções de papel/acesso -----------------------------------
create function public.is_manager() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role in ('gestor', 'admin') from public.user_roles where user_id = auth.uid()), false)
$$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = public as $$
  select coalesce((select role = 'admin' from public.user_roles where user_id = auth.uid()), false)
$$;

create function public.has_area(a text) returns boolean
language sql stable security definer set search_path = public as $$
  select public.is_manager() or exists (
    select 1 from public.area_access where user_id = auth.uid() and area = a and status = 'approved')
$$;

-- ---------- Cadastro: restringe domínio + cria perfil ------------------
create function public.enforce_company_domain() returns trigger language plpgsql as $$
begin
  if lower(coalesce(new.email, '')) not like '%@anfitriaosigma.com.br' then
    raise exception 'Somente e-mails @anfitriaosigma.com.br podem acessar a Intranet.';
  end if;
  return new;
end $$;

create function public.handle_new_user() returns trigger language plpgsql security definer set search_path = public as $$
declare r public.app_role := 'closer';
begin
  if lower(new.email) = 'sigma@anfitriaosigma.com.br' then r := 'admin'; end if;
  insert into public.profiles (id, email, full_name, avatar_url)
  values (new.id, lower(new.email),
          coalesce(new.raw_user_meta_data ->> 'full_name', new.raw_user_meta_data ->> 'name'),
          new.raw_user_meta_data ->> 'avatar_url')
  on conflict (id) do nothing;
  insert into public.user_roles (user_id, role) values (new.id, r) on conflict do nothing;
  if r = 'admin' then
    insert into public.area_access (user_id, area, status, decided_at)
    select new.id, a, 'approved', now() from unnest(array['metas','operacao','financeiro','treinamento','comercial']) a
    on conflict do nothing;
  end if;
  return new;
end $$;

drop trigger if exists enforce_company_domain on auth.users;
create trigger enforce_company_domain before insert on auth.users
  for each row execute function public.enforce_company_domain();
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------- Auditoria automática de linhas ------------------------------
create function public.audit_row() returns trigger language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid();
  nm text; rl text; j_new jsonb; j_old jsonb; ent_id text; det text;
begin
  if uid is not null then
    select coalesce(nickname, full_name, email) into nm from public.profiles where id = uid;
    select role::text into rl from public.user_roles where user_id = uid;
  else
    nm := 'Sistema'; rl := 'sistema';
  end if;
  if TG_OP = 'DELETE' then j_old := to_jsonb(old); j_new := null; else j_new := to_jsonb(new); end if;
  if TG_OP = 'UPDATE' then j_old := to_jsonb(old); end if;
  ent_id := coalesce(j_new ->> 'id', j_old ->> 'id', j_new ->> 'user_id', j_new ->> 'month', j_new ->> 'key');
  if TG_OP = 'UPDATE' then
    select string_agg(k || ': ' || coalesce(j_old ->> k, '∅') || ' → ' || coalesce(j_new ->> k, '∅'), '; ')
      into det from jsonb_object_keys(j_new) k where j_old -> k is distinct from j_new -> k;
    if det is null then return new; end if;
  elsif TG_OP = 'INSERT' then
    det := left(j_new::text, 600);
  else
    det := left(j_old::text, 600);
  end if;
  insert into public.audit_log (actor_id, actor_name, actor_role, action, entity, entity_id, detail, location, device)
  values (uid, nm, rl, lower(TG_OP) || ':' || TG_TABLE_NAME, TG_TABLE_NAME, ent_id, det,
          case when uid is null then 'servidor' else 'banco de dados' end, null);
  return coalesce(new, old);
end $$;

do $$
declare t text;
begin
  foreach t in array array['sales','sale_items','products','product_versions','params','salary_history',
    'holidays','company_info','multiplier_fixed','meta_overrides','goal_locks','month_closures','invoices',
    'area_access','user_roles','profiles']
  loop
    execute format('create trigger audit_%1$s after insert or update or delete on public.%1$s
                    for each row execute function public.audit_row()', t);
  end loop;
end $$;

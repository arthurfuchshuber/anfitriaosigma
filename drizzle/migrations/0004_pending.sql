-- =====================================================================
-- Intranet Anfitrião Sigma — 5/5  CADASTRO PENDENTE (campos obrigatórios)
--   • catálogo de campos obrigatórios (empresa e colaborador) com "desde" e liga/desliga
--   • novas colunas de cadastro (PF/PJ, razão social, PIX, banco, responsável legal…)
--   • validação de CPF/CNPJ (dígitos) no banco
--   • RPCs: my_pending, pending_people, required_field_stats, set_required_field, remind_pending
--   Regra: qualquer campo obrigatório vazio BLOQUEIA o acesso às áreas até ser preenchido.
-- =====================================================================

-- ---------- novas colunas ----------------------------------------------
alter table public.profile_sensitive
  add column if not exists doc_type        text check (doc_type in ('pf', 'pj')),
  add column if not exists company_name    text,
  add column if not exists trade_name      text,
  add column if not exists municipal_reg   text,
  add column if not exists pix_type        text check (pix_type in ('cpf', 'cnpj', 'celular', 'email', 'aleatoria')),
  add column if not exists cnpj_status     text,
  add column if not exists cnpj_checked_at timestamptz;

alter table public.profiles
  add column if not exists emergency_relation text;

alter table public.company_info
  add column if not exists trade_name      text,
  add column if not exists municipal_reg   text,
  add column if not exists tax_regime      text,
  add column if not exists addr            jsonb not null default '{}'::jsonb,
  add column if not exists phone           text,
  add column if not exists rep_name        text,
  add column if not exists rep_cpf         text,
  add column if not exists rep_birth       date,
  add column if not exists rep_phone       text,
  add column if not exists bank            text,
  add column if not exists agency          text,
  add column if not exists account         text,
  add column if not exists cnpj_status     text,
  add column if not exists cnpj_checked_at timestamptz;

-- ---------- validação de documentos ------------------------------------
create or replace function public.valid_cpf(v text) returns boolean
language plpgsql immutable as $$
declare d text := regexp_replace(coalesce(v, ''), '\D', '', 'g'); s int; r int; i int;
begin
  if length(d) <> 11 or d ~ '^(\d)\1{10}$' then return false; end if;
  s := 0; for i in 1..9 loop s := s + substr(d, i, 1)::int * (11 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  if r <> substr(d, 10, 1)::int then return false; end if;
  s := 0; for i in 1..10 loop s := s + substr(d, i, 1)::int * (12 - i); end loop;
  r := (s * 10) % 11; if r = 10 then r := 0; end if;
  return r = substr(d, 11, 1)::int;
end $$;

create or replace function public.valid_cnpj(v text) returns boolean
language plpgsql immutable as $$
declare d text := regexp_replace(coalesce(v, ''), '\D', '', 'g');
        w1 int[] := array[5,4,3,2,9,8,7,6,5,4,3,2];
        w2 int[] := array[6,5,4,3,2,9,8,7,6,5,4,3,2];
        s int; r int; i int;
begin
  if length(d) <> 14 or d ~ '^(\d)\1{13}$' then return false; end if;
  s := 0; for i in 1..12 loop s := s + substr(d, i, 1)::int * w1[i]; end loop;
  r := s % 11; r := case when r < 2 then 0 else 11 - r end;
  if r <> substr(d, 13, 1)::int then return false; end if;
  s := 0; for i in 1..13 loop s := s + substr(d, i, 1)::int * w2[i]; end loop;
  r := s % 11; r := case when r < 2 then 0 else 11 - r end;
  return r = substr(d, 14, 1)::int;
end $$;

-- Normaliza (só dígitos) e rejeita documento inválido. Vazio é permitido (fica pendente).
create or replace function public.check_sensitive_docs() returns trigger
language plpgsql as $$
begin
  new.cpf  := nullif(regexp_replace(coalesce(new.cpf, ''),  '\D', '', 'g'), '');
  new.cnpj := nullif(regexp_replace(coalesce(new.cnpj, ''), '\D', '', 'g'), '');
  new.rg   := nullif(upper(regexp_replace(coalesce(new.rg, ''), '[^0-9A-Za-z]', '', 'g')), '');
  new.municipal_reg := nullif(regexp_replace(coalesce(new.municipal_reg, ''), '\D', '', 'g'), '');
  if new.cpf  is not null and not public.valid_cpf(new.cpf)   then raise exception 'CPF inválido'; end if;
  if new.cnpj is not null and not public.valid_cnpj(new.cnpj) then raise exception 'CNPJ inválido'; end if;
  if new.cnpj_status is not null and new.cnpj_status not in ('ATIVA', 'unverified') then
    raise exception 'CNPJ sem situação ATIVA na Receita Federal (%)', new.cnpj_status;
  end if;
  return new;
end $$;
-- roda antes do audit_sensitive (ordem alfabética dos triggers BEFORE): "a_" vem primeiro
create trigger a_check_sensitive_docs before insert or update on public.profile_sensitive
  for each row execute function public.check_sensitive_docs();

create or replace function public.check_company_docs() returns trigger
language plpgsql as $$
begin
  new.cnpj := nullif(regexp_replace(coalesce(new.cnpj, ''), '\D', '', 'g'), '');
  new.rep_cpf := nullif(regexp_replace(coalesce(new.rep_cpf, ''), '\D', '', 'g'), '');
  new.municipal_reg := nullif(regexp_replace(coalesce(new.municipal_reg, ''), '\D', '', 'g'), '');
  if new.cnpj is not null and not public.valid_cnpj(new.cnpj) then raise exception 'CNPJ da empresa inválido'; end if;
  if new.rep_cpf is not null and not public.valid_cpf(new.rep_cpf) then raise exception 'CPF do responsável inválido'; end if;
  if new.cnpj_status is not null and new.cnpj_status not in ('ATIVA', 'unverified') then
    raise exception 'CNPJ da empresa sem situação ATIVA na Receita Federal (%)', new.cnpj_status;
  end if;
  return new;
end $$;
create trigger check_company_docs before insert or update on public.company_info
  for each row execute function public.check_company_docs();

-- ---------- catálogo de campos obrigatórios ----------------------------
create table public.required_fields (
  key       text primary key,
  scope     text not null check (scope in ('company', 'user')),
  grp       text not null,                                  -- item do acordeão
  label     text not null,
  doc_type  text check (doc_type in ('pf', 'pj')),          -- só vale p/ PF ou PJ (null = todos)
  required  boolean not null default true,
  since     date not null default current_date,             -- quando virou obrigatório
  sort      int not null default 0
);

insert into public.required_fields (key, scope, grp, label, doc_type, required, sort) values
  -- colaborador · Identificação
  ('u_full_name',      'user', 'ident',   'Nome completo',               null, true,  10),
  ('u_cpf',            'user', 'ident',   'CPF',                         'pf', true,  11),
  ('u_rg',             'user', 'ident',   'RG',                          'pf', true,  12),
  ('u_cnpj',           'user', 'ident',   'CNPJ',                        'pj', true,  13),
  ('u_company_name',   'user', 'ident',   'Razão social',                'pj', true,  14),
  ('u_trade_name',     'user', 'ident',   'Nome fantasia',               'pj', false, 15),
  ('u_municipal_reg',  'user', 'ident',   'Inscrição municipal',         'pj', false, 16),
  ('u_birth_date',     'user', 'ident',   'Data de nascimento',          null, true,  17),
  ('u_nickname',       'user', 'ident',   'Como quer ser chamado',       null, true,  18),
  -- colaborador · Contato
  ('u_phone',          'user', 'contato', 'Celular',                     null, true,  20),
  ('u_whatsapp',       'user', 'contato', 'WhatsApp',                    null, false, 21),
  ('u_personal_email', 'user', 'contato', 'E-mail pessoal',              null, true,  22),
  -- colaborador · Endereço
  ('u_cep',            'user', 'endereco','CEP',                         null, true,  30),
  ('u_street',         'user', 'endereco','Rua',                         null, true,  31),
  ('u_number',         'user', 'endereco','Número',                      null, true,  32),
  ('u_complement',     'user', 'endereco','Complemento',                 null, false, 33),
  ('u_neighborhood',   'user', 'endereco','Bairro',                      null, true,  34),
  ('u_city',           'user', 'endereco','Cidade',                      null, true,  35),
  ('u_uf',             'user', 'endereco','UF',                          null, true,  36),
  -- colaborador · Emergência
  ('u_emerg_name',     'user', 'emerg',   'Nome do contato',             null, true,  40),
  ('u_emerg_relation', 'user', 'emerg',   'Parentesco',                  null, true,  41),
  ('u_emerg_phone',    'user', 'emerg',   'Telefone do contato',         null, true,  42),
  -- colaborador · Pagamento
  ('u_pix_type',       'user', 'pay',     'Tipo da chave PIX',           null, true,  50),
  ('u_pix_key',        'user', 'pay',     'Chave PIX',                   null, true,  51),
  ('u_bank',           'user', 'pay',     'Banco',                       null, true,  52),
  ('u_agency',         'user', 'pay',     'Agência',                     null, true,  53),
  ('u_account',        'user', 'pay',     'Conta',                       null, true,  54),
  -- empresa · Identificação
  ('c_cnpj',           'company', 'ident','CNPJ da empresa',             null, true,  10),
  ('c_legal_name',     'company', 'ident','Razão social',                null, true,  11),
  ('c_trade_name',     'company', 'ident','Nome fantasia',               null, false, 12),
  ('c_municipal_reg',  'company', 'ident','Inscrição municipal',         null, true,  13),
  ('c_tax_regime',     'company', 'ident','Regime tributário',           null, true,  14),
  -- empresa · Endereço e contato
  ('c_cep',            'company', 'endereco','CEP',                      null, true,  20),
  ('c_street',         'company', 'endereco','Rua',                      null, true,  21),
  ('c_number',         'company', 'endereco','Número',                   null, true,  22),
  ('c_complement',     'company', 'endereco','Complemento',              null, false, 23),
  ('c_neighborhood',   'company', 'endereco','Bairro',                   null, true,  24),
  ('c_city',           'company', 'endereco','Cidade',                   null, true,  25),
  ('c_uf',             'company', 'endereco','UF',                       null, true,  26),
  ('c_email',          'company', 'endereco','E-mail para notas fiscais',null, true,  27),
  ('c_phone',          'company', 'endereco','Telefone da empresa',      null, true,  28),
  -- empresa · Responsável legal
  ('c_rep_name',       'company', 'resp', 'Nome do responsável',         null, true,  30),
  ('c_rep_cpf',        'company', 'resp', 'CPF do responsável',          null, true,  31),
  ('c_rep_birth',      'company', 'resp', 'Nascimento do responsável',   null, true,  32),
  ('c_rep_phone',      'company', 'resp', 'Celular do responsável',      null, true,  33),
  -- empresa · Dados bancários
  ('c_bank',           'company', 'banc', 'Banco',                       null, true,  40),
  ('c_agency',         'company', 'banc', 'Agência',                     null, true,  41),
  ('c_account',        'company', 'banc', 'Conta',                       null, true,  42)
on conflict (key) do nothing;

alter table public.required_fields enable row level security;
create policy rf_sel on public.required_fields for select to authenticated using (true);
-- escrita só pela RPC set_required_field (sem policy de insert/update/delete)
create trigger audit_required_fields after insert or update or delete on public.required_fields
  for each row execute function public.audit_row();

-- ---------- valor atual de um campo (interno) --------------------------
create or replace function public.field_value(p_key text, p_user uuid) returns text
language plpgsql stable security definer set search_path = public as $$
declare p public.profiles; s public.profile_sensitive; c public.company_info; r text;
begin
  if left(p_key, 2) = 'u_' then
    select * into p from public.profiles where id = p_user;
    select * into s from public.profile_sensitive where user_id = p_user;
    r := case p_key
      when 'u_full_name'      then p.full_name
      when 'u_nickname'       then p.nickname
      when 'u_birth_date'     then p.birth_date::text
      when 'u_phone'          then p.phone
      when 'u_whatsapp'       then p.whatsapp
      when 'u_personal_email' then p.personal_email
      when 'u_cep'            then p.address ->> 'cep'
      when 'u_street'         then p.address ->> 'rua'
      when 'u_number'         then p.address ->> 'numero'
      when 'u_complement'     then p.address ->> 'complemento'
      when 'u_neighborhood'   then p.address ->> 'bairro'
      when 'u_city'           then p.address ->> 'cidade'
      when 'u_uf'             then p.address ->> 'uf'
      when 'u_emerg_name'     then p.emergency_name
      when 'u_emerg_relation' then p.emergency_relation
      when 'u_emerg_phone'    then p.emergency_phone
      when 'u_cpf'            then s.cpf
      when 'u_rg'             then s.rg
      when 'u_cnpj'           then s.cnpj
      when 'u_company_name'   then s.company_name
      when 'u_trade_name'     then s.trade_name
      when 'u_municipal_reg'  then s.municipal_reg
      when 'u_pix_type'       then s.pix_type
      when 'u_pix_key'        then s.pix_key
      when 'u_bank'           then s.bank
      when 'u_agency'         then s.agency
      when 'u_account'        then s.account
    end;
  else
    select * into c from public.company_info where id = 1;
    r := case p_key
      when 'c_cnpj'         then c.cnpj
      when 'c_legal_name'   then c.legal_name
      when 'c_trade_name'   then c.trade_name
      when 'c_municipal_reg' then c.municipal_reg
      when 'c_tax_regime'   then c.tax_regime
      when 'c_cep'          then c.addr ->> 'cep'
      when 'c_street'       then c.addr ->> 'rua'
      when 'c_number'       then c.addr ->> 'numero'
      when 'c_complement'   then c.addr ->> 'complemento'
      when 'c_neighborhood' then c.addr ->> 'bairro'
      when 'c_city'         then c.addr ->> 'cidade'
      when 'c_uf'           then c.addr ->> 'uf'
      when 'c_email'        then c.email
      when 'c_phone'        then c.phone
      when 'c_rep_name'     then c.rep_name
      when 'c_rep_cpf'      then c.rep_cpf
      when 'c_rep_birth'    then c.rep_birth::text
      when 'c_rep_phone'    then c.rep_phone
      when 'c_bank'         then c.bank
      when 'c_agency'       then c.agency
      when 'c_account'      then c.account
    end;
  end if;
  return nullif(btrim(coalesce(r, '')), '');
end $$;
revoke execute on function public.field_value(text, uuid) from public, anon, authenticated;

-- ---------- pendências -------------------------------------------------
create or replace function public.user_doc_type(p_user uuid) returns text
language sql stable security definer set search_path = public as $$
  select coalesce((select doc_type from public.profile_sensitive where user_id = p_user), 'pf') $$;
revoke execute on function public.user_doc_type(uuid) from public, anon, authenticated;

create or replace function public.missing_user_fields(p_user uuid default null) returns text[]
language plpgsql stable security definer set search_path = public as $$
declare u uuid := coalesce(p_user, auth.uid()); dt text;
begin
  if u is distinct from auth.uid() and not public.is_manager() then raise exception 'sem permissão'; end if;
  dt := public.user_doc_type(u);
  return coalesce((select array_agg(rf.key order by rf.sort) from public.required_fields rf
                    where rf.scope = 'user' and rf.required and (rf.doc_type is null or rf.doc_type = dt)
                      and public.field_value(rf.key, u) is null), '{}');
end $$;

create or replace function public.missing_company_fields() returns text[]
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  return coalesce((select array_agg(rf.key order by rf.sort) from public.required_fields rf
                    where rf.scope = 'company' and rf.required and public.field_value(rf.key, null) is null), '{}');
end $$;

-- Pendências de quem está logado: {"user":[…], "company":[…] | null}. Empresa só para gestor/admin.
create or replace function public.my_pending() returns jsonb
language plpgsql stable security definer set search_path = public as $$
begin
  return jsonb_build_object(
    'user', to_jsonb(public.missing_user_fields(auth.uid())),
    'company', case when public.is_manager() then to_jsonb(public.missing_company_fields()) else null end,
    'doc_type', public.user_doc_type(auth.uid()));
end $$;

-- Gestor: quem tem pendência e quantas (para "Lembrar")
create or replace function public.pending_people()
returns table (user_id uuid, full_name text, email text, missing int, total int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  return query
    select p.id, p.full_name, p.email,
           cardinality(public.missing_user_fields(p.id)),
           (select count(*)::int from public.required_fields rf
             where rf.scope = 'user' and rf.required and (rf.doc_type is null or rf.doc_type = public.user_doc_type(p.id)))
      from public.profiles p where p.active
     order by 4 desc, p.full_name;
end $$;

-- Gestor: catálogo com % de preenchimento
create or replace function public.required_field_stats()
returns table (key text, scope text, grp text, label text, doc_type text, required boolean, since date, sort int, filled_pct int)
language plpgsql stable security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  return query
    select rf.key, rf.scope, rf.grp, rf.label, rf.doc_type, rf.required, rf.since, rf.sort,
           case when rf.scope = 'company'
                then (case when public.field_value(rf.key, null) is null then 0 else 100 end)
                else coalesce((select round(100.0 * count(*) filter (where public.field_value(rf.key, p.id) is not null) / nullif(count(*), 0))::int
                                 from public.profiles p
                                where p.active and (rf.doc_type is null or rf.doc_type = public.user_doc_type(p.id))), 0)
           end
      from public.required_fields rf order by rf.scope desc, rf.sort;
end $$;

-- Liga/desliga a obrigatoriedade. Ao LIGAR, "desde" vira hoje e todos com o campo vazio voltam a ver a pendência.
create or replace function public.set_required_field(p_key text, p_required boolean) returns void
language plpgsql security definer set search_path = public as $$
declare cur boolean;
begin
  if not public.is_manager() then raise exception 'apenas gestor/admin'; end if;
  select required into cur from public.required_fields where key = p_key;
  if not found then raise exception 'campo desconhecido'; end if;
  update public.required_fields
     set required = p_required, since = case when p_required and not cur then current_date else since end
   where key = p_key;
end $$;

-- Gestor lembra uma pessoa (notificação interna; aparece no Cadastro dela)
create or replace function public.remind_pending(p_user uuid) returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  if not public.is_manager() then raise exception 'apenas gestor/admin'; end if;
  n := cardinality(public.missing_user_fields(p_user));
  if n > 0 then
    perform public.notify(p_user, 'pending_fields', 'Cadastro pendente',
      'Faltam ' || n || ' informações no seu cadastro. Complete para continuar usando a Intranet.', 'cadastro');
    perform public.write_log('lembrete:cadastro', 'profiles', p_user::text, 'Lembrete de cadastro pendente (' || n || ')', 'app', null);
  end if;
  return n;
end $$;

-- ---------- perfil: novos campos ---------------------------------------
create or replace function public.update_my_profile(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  if p ? 'personal_email' and coalesce(p ->> 'personal_email', '') <> ''
     and (p ->> 'personal_email') !~* '^[^@\s]+@[^@\s]+\.[^@\s]{2,}$' then
    raise exception 'E-mail pessoal inválido';
  end if;
  if p ? 'birth_date' and nullif(p ->> 'birth_date', '') is not null
     and ((p ->> 'birth_date')::date > current_date or (p ->> 'birth_date')::date < date '1900-01-01') then
    raise exception 'Data de nascimento inválida';
  end if;
  update public.profiles set
    -- o nome vem do Google; só é editável enquanto estiver vazio
    full_name       = case when p ? 'full_name' and coalesce(btrim(full_name), '') = '' then nullif(btrim(p ->> 'full_name'), '') else full_name end,
    nickname        = case when p ? 'nickname'        then p ->> 'nickname'        else nickname end,
    phone           = case when p ? 'phone'           then p ->> 'phone'           else phone end,
    whatsapp        = case when p ? 'whatsapp'        then p ->> 'whatsapp'        else whatsapp end,
    avatar_url      = case when p ? 'avatar_url'      then p ->> 'avatar_url'      else avatar_url end,
    personal_email  = case when p ? 'personal_email'  then p ->> 'personal_email'  else personal_email end,
    birth_date      = case when p ? 'birth_date'      then nullif(p ->> 'birth_date', '')::date else birth_date end,
    address         = case when p ? 'address'         then p -> 'address'          else address end,
    emergency_name  = case when p ? 'emergency_name'  then p ->> 'emergency_name'  else emergency_name end,
    emergency_relation = case when p ? 'emergency_relation' then p ->> 'emergency_relation' else emergency_relation end,
    emergency_phone = case when p ? 'emergency_phone' then p ->> 'emergency_phone' else emergency_phone end
  where id = auth.uid();
end $$;

-- máscara também para os novos campos sensíveis
drop function if exists public.sensitive_masked(uuid);
create function public.sensitive_masked(p_user uuid)
returns table (cpf text, cnpj text, rg text, pix_key text, bank text, agency text, account text, filled boolean,
               doc_type text, company_name text, trade_name text, municipal_reg text, pix_type text, cnpj_status text)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() and auth.uid() <> p_user then raise exception 'sem permissão'; end if;
  return query select public.mask_text(s.cpf), public.mask_text(s.cnpj), public.mask_text(s.rg),
                      public.mask_text(s.pix_key, 3), s.bank, public.mask_text(s.agency, 1),
                      public.mask_text(s.account, 2), true,
                      s.doc_type, s.company_name, s.trade_name, public.mask_text(s.municipal_reg, 2), s.pix_type, s.cnpj_status
               from public.profile_sensitive s where s.user_id = p_user;
end $$;

-- permissões: só autenticados chamam as RPCs públicas
revoke execute on function public.missing_user_fields(uuid), public.missing_company_fields(), public.my_pending(),
  public.pending_people(), public.required_field_stats(), public.set_required_field(text, boolean),
  public.remind_pending(uuid) from public, anon;
grant execute on function public.missing_user_fields(uuid), public.missing_company_fields(), public.my_pending(),
  public.pending_people(), public.required_field_stats(), public.set_required_field(text, boolean),
  public.remind_pending(uuid) to authenticated;
grant select on public.required_fields to authenticated;

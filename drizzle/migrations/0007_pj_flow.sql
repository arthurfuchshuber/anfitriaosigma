-- 07 · Fluxo PJ sem repetição + contato de referência com endereço + inscrição municipal opcional
-- Regras (todas no banco):
--  • Gestor/admin PJ: CNPJ, razão social, banco e responsável legal preenchidos no cadastro pessoal são ESPELHADOS
--    para company_info (só onde a empresa ainda está vazia) — não se pede a mesma coisa duas vezes.
--  • CPF e RG também são pedidos ao representante legal PJ (antes só PF).
--  • Inscrição municipal da empresa deixa de ser obrigatória.
--  • Contato de referência passa a ter endereço (CEP, rua, número, bairro, cidade, UF).

alter table public.profiles add column if not exists emergency_address jsonb not null default '{}'::jsonb;

-- catálogo
update public.required_fields set required = false where key in ('c_municipal_reg', 'u_municipal_reg');
update public.required_fields set doc_type = null where key in ('u_cpf', 'u_rg');
insert into public.required_fields (key, scope, grp, label, doc_type, required, sort) values
  ('u_emerg_cep',          'user', 'emerg', 'CEP do contato',          null, true,  43),
  ('u_emerg_street',       'user', 'emerg', 'Rua do contato',          null, true,  44),
  ('u_emerg_number',       'user', 'emerg', 'Número do contato',       null, true,  45),
  ('u_emerg_complement',   'user', 'emerg', 'Complemento do contato',  null, false, 46),
  ('u_emerg_neighborhood', 'user', 'emerg', 'Bairro do contato',       null, true,  47),
  ('u_emerg_city',         'user', 'emerg', 'Cidade do contato',       null, true,  48),
  ('u_emerg_uf',           'user', 'emerg', 'UF do contato',           null, true,  49)
on conflict (key) do nothing;

-- leitura dos campos (acrescenta o endereço do contato)
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
      when 'u_emerg_cep'          then p.emergency_address ->> 'cep'
      when 'u_emerg_street'       then p.emergency_address ->> 'rua'
      when 'u_emerg_number'       then p.emergency_address ->> 'numero'
      when 'u_emerg_complement'   then p.emergency_address ->> 'complemento'
      when 'u_emerg_neighborhood' then p.emergency_address ->> 'bairro'
      when 'u_emerg_city'         then p.emergency_address ->> 'cidade'
      when 'u_emerg_uf'           then p.emergency_address ->> 'uf'
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

-- gravação do perfil (acrescenta o endereço do contato)
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
    emergency_phone = case when p ? 'emergency_phone' then p ->> 'emergency_phone' else emergency_phone end,
    emergency_address = case when p ? 'emergency_address' then coalesce(p -> 'emergency_address', '{}'::jsonb) else emergency_address end
  where id = auth.uid();
end $$;

-- espelho gestor/admin PJ → empresa (preenche só o que está vazio na empresa)
create or replace function public.sync_company_from_manager(p_user uuid) returns void
language plpgsql security definer set search_path = public as $$
declare p public.profiles; s public.profile_sensitive;
begin
  if not exists (select 1 from public.user_roles where user_id = p_user and role in ('gestor', 'admin')) then return; end if;
  select * into s from public.profile_sensitive where user_id = p_user;
  if not found or s.doc_type is distinct from 'pj' then return; end if;
  select * into p from public.profiles where id = p_user;
  update public.company_info ci set
    cnpj_status    = case when nullif(ci.cnpj, '') is null and s.cnpj is not null then s.cnpj_status else ci.cnpj_status end,
    cnpj_checked_at = case when nullif(ci.cnpj, '') is null and s.cnpj is not null then s.cnpj_checked_at else ci.cnpj_checked_at end,
    cnpj           = coalesce(nullif(ci.cnpj, ''), s.cnpj),
    legal_name     = coalesce(nullif(ci.legal_name, ''), s.company_name),
    trade_name     = coalesce(nullif(ci.trade_name, ''), s.trade_name),
    municipal_reg  = coalesce(nullif(ci.municipal_reg, ''), s.municipal_reg),
    bank           = coalesce(nullif(ci.bank, ''), s.bank),
    agency         = coalesce(nullif(ci.agency, ''), s.agency),
    account        = coalesce(nullif(ci.account, ''), s.account),
    rep_name       = coalesce(nullif(ci.rep_name, ''), p.full_name),
    rep_cpf        = coalesce(nullif(ci.rep_cpf, ''), s.cpf),
    rep_birth      = coalesce(ci.rep_birth, p.birth_date),
    rep_phone      = coalesce(nullif(ci.rep_phone, ''), p.phone)
  where ci.id = 1;
end $$;
revoke execute on function public.sync_company_from_manager(uuid) from public, anon, authenticated;

create or replace function public.trg_sync_company_sens() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform public.sync_company_from_manager(new.user_id); return null; end $$;
create or replace function public.trg_sync_company_prof() returns trigger
language plpgsql security definer set search_path = public as $$
begin perform public.sync_company_from_manager(new.id); return null; end $$;
revoke execute on function public.trg_sync_company_sens(), public.trg_sync_company_prof() from public, anon, authenticated;

drop trigger if exists z_sync_company_sens on public.profile_sensitive;
create trigger z_sync_company_sens after insert or update on public.profile_sensitive
  for each row execute function public.trg_sync_company_sens();
drop trigger if exists z_sync_company_prof on public.profiles;
create trigger z_sync_company_prof after update of full_name, birth_date, phone on public.profiles
  for each row execute function public.trg_sync_company_prof();

-- quem já era gestor/admin PJ é espelhado agora
select public.sync_company_from_manager(user_id) from public.user_roles where role in ('gestor', 'admin');

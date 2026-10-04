-- =====================================================================
-- Intranet Anfitrião Sigma — 3/4  AÇÕES (RPCs com checagem de papel)
-- =====================================================================

create function public.actor_name() returns text language sql stable security definer set search_path = public as $$
  select coalesce(nickname, full_name, email) from public.profiles where id = auth.uid() $$;

create function public.write_log(p_action text, p_entity text, p_entity_id text, p_detail text,
                                 p_location text default null, p_device text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  insert into public.audit_log (actor_id, actor_name, actor_role, action, entity, entity_id, detail, location, device)
  values (auth.uid(), public.actor_name(),
          (select role::text from public.user_roles where user_id = auth.uid()),
          p_action, p_entity, p_entity_id, p_detail, p_location, p_device);
end $$;

-- Evento de interface (login, acesso a tela, exportação...). Local/dispositivo vêm do cliente/edge function.
create function public.log_event(p_action text, p_detail text default null, p_location text default null, p_device text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  perform public.write_log(p_action, 'ui', null, p_detail, p_location, p_device);
end $$;

create function public.notify(p_user uuid, p_kind text, p_title text, p_body text, p_ref text default null)
returns void language sql security definer set search_path = public as $$
  insert into public.notifications (user_id, kind, title, body, ref) values (p_user, p_kind, p_title, p_body, p_ref) $$;

-- ---------- Acesso por área --------------------------------------------
create function public.request_access(p_area text) returns text
language plpgsql security definer set search_path = public as $$
declare cur text;
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  select status into cur from public.area_access where user_id = auth.uid() and area = p_area;
  if cur = 'approved' then return 'approved'; end if;
  if cur = 'pending' then return 'pending'; end if;
  insert into public.area_access (user_id, area, status, requested_at, decided_by, decided_at)
  values (auth.uid(), p_area, 'pending', now(), null, null)
  on conflict (user_id, area) do update set status = 'pending', requested_at = now(), decided_by = null, decided_at = null;
  perform public.notify(null, 'access_request', 'Pedido de acesso: ' || p_area,
          public.actor_name() || ' solicitou acesso à área ' || p_area, auth.uid()::text || ':' || p_area);
  return 'pending';
end $$;

create function public.decide_access(p_user uuid, p_area text, p_approve boolean, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  insert into public.area_access (user_id, area, status, decided_by, decided_at, note)
  values (p_user, p_area, case when p_approve then 'approved' else 'denied' end, auth.uid(), now(), p_note)
  on conflict (user_id, area) do update
    set status = excluded.status, decided_by = excluded.decided_by, decided_at = excluded.decided_at, note = excluded.note;
  update public.notifications set resolved_at = now() where kind = 'access_request' and ref = p_user::text || ':' || p_area;
  perform public.notify(p_user, 'access_decision',
    case when p_approve then 'Acesso aprovado' else 'Acesso negado' end, 'Área: ' || p_area, p_area);
end $$;

-- ---------- Perfil -----------------------------------------------------
create function public.update_my_profile(p jsonb) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.profiles set
    nickname        = case when p ? 'nickname'        then p ->> 'nickname'        else nickname end,
    phone           = case when p ? 'phone'           then p ->> 'phone'           else phone end,
    whatsapp        = case when p ? 'whatsapp'        then p ->> 'whatsapp'        else whatsapp end,
    avatar_url      = case when p ? 'avatar_url'      then p ->> 'avatar_url'      else avatar_url end,
    personal_email  = case when p ? 'personal_email'  then p ->> 'personal_email'  else personal_email end,
    birth_date      = case when p ? 'birth_date'      then nullif(p ->> 'birth_date', '')::date else birth_date end,
    address         = case when p ? 'address'         then p -> 'address'          else address end,
    emergency_name  = case when p ? 'emergency_name'  then p ->> 'emergency_name'  else emergency_name end,
    emergency_phone = case when p ? 'emergency_phone' then p ->> 'emergency_phone' else emergency_phone end
  where id = auth.uid();
end $$;

-- Visão mascarada para gestor (CPF/CNPJ/RG/PIX/banco nunca saem completos)
create function public.mask_text(v text, keep int default 2) returns text language sql immutable as $$
  select case when v is null or v = '' then null
              else repeat('•', greatest(length(v) - keep, 3)) || right(v, keep) end $$;

create function public.sensitive_masked(p_user uuid)
returns table (cpf text, cnpj text, rg text, pix_key text, bank text, agency text, account text, filled boolean)
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() and auth.uid() <> p_user then raise exception 'sem permissão'; end if;
  return query select public.mask_text(s.cpf), public.mask_text(s.cnpj), public.mask_text(s.rg),
                      public.mask_text(s.pix_key, 3), s.bank, public.mask_text(s.agency, 1),
                      public.mask_text(s.account, 2), true
               from public.profile_sensitive s where s.user_id = p_user;
end $$;

-- Log sem valores quando o dono altera dados sensíveis
create function public.audit_sensitive() returns trigger language plpgsql security definer set search_path = public as $$
declare cols text;
begin
  select string_agg(k, ', ') into cols from jsonb_object_keys(to_jsonb(new)) k
   where k not in ('user_id', 'updated_at')
     and (TG_OP = 'INSERT' or to_jsonb(old) -> k is distinct from to_jsonb(new) -> k)
     and to_jsonb(new) ->> k is not null;
  if cols is not null then
    perform public.write_log('sensibilidade:' || lower(TG_OP), 'profile_sensitive', new.user_id::text,
                             'Campos alterados (valores ocultos): ' || cols, 'app', null);
  end if;
  new.updated_at := now();
  return new;
end $$;
create trigger audit_profile_sensitive before insert or update on public.profile_sensitive
  for each row execute function public.audit_sensitive();

-- ---------- Vendas -----------------------------------------------------
create function public.digits(v text) returns text language sql immutable as $$ select regexp_replace(coalesce(v, ''), '\D', '', 'g') $$;

-- Duplicidade: CPF/CNPJ + valor total + mês
create function public.check_duplicate(p_doc text, p_total numeric, p_date date)
returns uuid language sql stable security definer set search_path = public as $$
  select id from public.sales
  where client_doc = public.digits(p_doc) and public.digits(p_doc) <> ''
    and total_value = p_total and status <> 'cancelled'
    and public.month_start(sale_date) = public.month_start(p_date)
  limit 1
$$;

create function public.register_sale(p_client text, p_doc text, p_date date, p_items jsonb, p_pay text,
                                     p_installments int, p_recurring boolean, p_notes text)
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  uid uuid := auth.uid(); sid uuid; it jsonb; tot numeric := 0; need_floor boolean := false;
  dup uuid; w numeric; floor_v numeric; q int; v numeric; retro int; sname text;
begin
  if uid is null then raise exception 'não autenticado'; end if;
  if not public.has_area('metas') then raise exception 'sem acesso à área Metas e Vendas'; end if;
  retro := public.param('retroativo_dias', current_date)::int;
  if p_date > current_date then raise exception 'A data da venda não pode ser futura.'; end if;
  if p_date < current_date - retro then raise exception 'Lançamento retroativo permitido por até % dias.', retro; end if;
  if exists (select 1 from public.month_closures where month = public.month_start(p_date)) then
    raise exception 'O mês dessa venda já foi fechado.';
  end if;
  if p_items is null or jsonb_array_length(p_items) = 0 then raise exception 'Inclua ao menos um produto.'; end if;

  for it in select * from jsonb_array_elements(p_items) loop
    q := coalesce((it ->> 'qty')::int, 1); v := coalesce((it ->> 'value')::numeric, 0);
    tot := tot + v;
    floor_v := coalesce((select min_price from public.product_versions
                         where product_id = (it ->> 'product_id')::uuid and valid_from <= public.month_start(p_date)
                         order by valid_from desc limit 1), 0);
    if v < floor_v * q then need_floor := true; end if;
  end loop;

  dup := public.check_duplicate(p_doc, tot, p_date);

  insert into public.sales (seller_id, client_name, client_doc, sale_date, pay_method, installments, recurring, notes,
                            floor_status, dup_flag, total_value)
  values (uid, p_client, public.digits(p_doc), p_date, p_pay, greatest(coalesce(p_installments, 1), 1), coalesce(p_recurring, false),
          p_notes, case when need_floor then 'needs_approval' else 'ok' end, dup is not null, tot)
  returning id into sid;

  insert into public.sale_items (sale_id, product_id, qty, value)
  select sid, (e ->> 'product_id')::uuid, coalesce((e ->> 'qty')::int, 1), coalesce((e ->> 'value')::numeric, 0)
  from jsonb_array_elements(p_items) e;

  sname := public.actor_name();
  if dup is not null then
    perform public.notify(uid, 'duplicate', 'Possível venda duplicada', p_client || ' — mesmo documento, valor e mês de outra venda.', sid::text);
    perform public.notify(null, 'duplicate', 'Possível venda duplicada', sname || ' lançou ' || p_client || ' com mesmo documento, valor e mês.', sid::text);
  end if;
  if need_floor then
    perform public.notify(null, 'floor', 'Venda abaixo do piso', sname || ' lançou ' || p_client || ' abaixo do valor mínimo — aprovação necessária.', sid::text);
  end if;
  return jsonb_build_object('id', sid, 'duplicate', dup is not null, 'dup_of', dup, 'needs_approval', need_floor);
end $$;

create function public.cancel_sale(p_id uuid, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
declare s public.sales%rowtype;
begin
  select * into s from public.sales where id = p_id;
  if not found then raise exception 'venda não encontrada'; end if;
  if s.seller_id <> auth.uid() and not public.is_manager() then raise exception 'sem permissão'; end if;
  if s.status <> 'pending' then raise exception 'Só vendas pendentes podem ser canceladas; vendas validadas permanecem.'; end if;
  update public.sales set status = 'cancelled', cancelled_at = now(), cancelled_by = auth.uid(), cancel_reason = p_reason where id = p_id;
end $$;

create function public.decide_floor(p_id uuid, p_approve boolean) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  update public.sales set floor_status = case when p_approve then 'approved' else 'rejected' end,
         status = case when p_approve then status else 'cancelled' end,
         cancelled_at = case when p_approve then null else now() end,
         cancelled_by = case when p_approve then null else auth.uid() end,
         cancel_reason = case when p_approve then null else 'Piso não aprovado' end
   where id = p_id and floor_status = 'needs_approval';
  update public.notifications set resolved_at = now() where kind in ('floor', 'duplicate') and ref = p_id::text;
end $$;

create function public.set_item_qty(p_item uuid, p_qty int) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  update public.sale_items set qty_override = p_qty where id = p_item;
end $$;

-- ---------- Metas, multiplicador e fechamento --------------------------
-- p_when: 'now' (vale já neste mês) | 'next' (vale a partir do mês seguinte). A confirmação em 2 passos é na tela.
create function public.effective_month(p_when text) returns date language sql stable as $$
  select case when p_when = 'next' then (public.month_start(current_date) + interval '1 month')::date
              else public.month_start(current_date) end $$;

create function public.set_meta_scale(p_user uuid, p_scale numeric, p_when text, p_reason text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  if exists (select 1 from public.month_goals where month = public.effective_month(p_when) and user_id = p_user) then
    raise exception 'A meta desse mês já foi fechada.';
  end if;
  insert into public.meta_overrides (user_id, effective_month, scale, reason, created_by)
  values (p_user, public.effective_month(p_when), p_scale, p_reason, auth.uid());
end $$;

create function public.set_multiplier(p_month date, p_value numeric) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  if exists (select 1 from public.goal_locks where month = public.month_start(p_month)) then raise exception 'Meta desse mês já fechada.'; end if;
  insert into public.multiplier_fixed (month, value, set_by) values (public.month_start(p_month), p_value, auth.uid())
  on conflict (month) do update set value = excluded.value, set_by = excluded.set_by, set_at = now();
end $$;

create function public.set_product_version(p_product uuid, p_points numeric, p_min numeric, p_caixa numeric, p_when text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  insert into public.product_versions (product_id, valid_from, points, min_price, caixa_pct)
  values (p_product, public.effective_month(p_when), p_points, p_min, p_caixa)
  on conflict (product_id, valid_from) do update set points = excluded.points, min_price = excluded.min_price, caixa_pct = excluded.caixa_pct;
end $$;

-- Gestor confirma "meta fechada": congela metas do mês seguinte. Só após o dia de corte.
create function public.confirm_goal_lock(p_month date) returns void
language plpgsql security definer set search_path = public as $$
declare som date := public.month_start(p_month); mult numeric;
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  if current_date < (som - interval '1 month')::date + (public.param('dia_corte', som)::int - 1) then
    raise exception 'A meta só pode ser fechada após o dia de corte.';
  end if;
  if exists (select 1 from public.goal_locks where month = som) then return; end if;
  mult := public.team_multiplier(som);
  insert into public.month_goals (month, user_id, salary, ramp, multiplier, scale, goal)
  select som, p.id, coalesce(public.salary_at(p.id, som), 0), public.ramp_factor(p.id, som), mult,
         public.meta_scale(p.id, som), public.individual_goal(p.id, som)
  from public.profiles p join public.user_roles r on r.user_id = p.id and r.role = 'closer'
  where public.ramp_factor(p.id, som) > 0;
  insert into public.goal_locks (month, confirmed_by) values (som, auth.uid());
end $$;

-- Resumo mensal: gestor vê todos; closer vê só a si mesmo
create function public.month_summary(p_month date)
returns table (user_id uuid, full_name text, nickname text, salary numeric, ramp numeric, multiplier numeric,
               goal numeric, validated numeric, pending numeric, attainment numeric, bonus numeric,
               total_pay numeric, caixa numeric)
language plpgsql security definer set search_path = public as $$
declare som date := public.month_start(p_month);
begin
  if auth.uid() is null then raise exception 'não autenticado'; end if;
  if not public.has_area('metas') then raise exception 'sem acesso'; end if;
  if exists (select 1 from public.month_closures where month = som) then
    return query select (x ->> 'user_id')::uuid, x ->> 'full_name', x ->> 'nickname', (x ->> 'salary')::numeric,
      (x ->> 'ramp')::numeric, (x ->> 'multiplier')::numeric, (x ->> 'goal')::numeric, (x ->> 'validated')::numeric,
      (x ->> 'pending')::numeric, (x ->> 'attainment')::numeric, (x ->> 'bonus')::numeric, (x ->> 'total_pay')::numeric,
      (x ->> 'caixa')::numeric
      from public.month_closures c, jsonb_array_elements(c.rows) x
      where c.month = som and (public.is_manager() or (x ->> 'user_id')::uuid = auth.uid());
  else
    return query select * from public.compute_month(som) c where public.is_manager() or c.user_id = auth.uid();
  end if;
end $$;

-- Média anônima da equipe (só se houver 3+ vendedores)
create function public.team_average(p_month date) returns table (n int, avg_attainment numeric)
language plpgsql security definer set search_path = public as $$
begin
  if not public.has_area('metas') then raise exception 'sem acesso'; end if;
  return query select count(*)::int, case when count(*) >= 3 then avg(attainment) end
               from public.compute_month(public.month_start(p_month));
end $$;

create function public.close_month(p_month date) returns void
language plpgsql security definer set search_path = public as $$
declare som date := public.month_start(p_month);
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  if exists (select 1 from public.month_closures where month = som) then raise exception 'Mês já fechado.'; end if;
  if current_date <= public.month_end(som) + public.param('retroativo_dias', som)::int then
    raise exception 'O mês só fecha após a janela de lançamento (% dias).', public.param('retroativo_dias', som)::int;
  end if;
  perform public.run_validation();
  if exists (select 1 from public.sales where status = 'pending' and public.month_start(sale_date) = som) then
    raise exception 'Ainda há vendas pendentes neste mês.';
  end if;
  insert into public.month_closures (month, closed_by, rows)
  select som, auth.uid(), coalesce(jsonb_agg(to_jsonb(c)), '[]'::jsonb) from public.compute_month(som) c;
end $$;

-- Nota fiscal (espelho): fixo + bônus do mês já fechado
create function public.generate_invoice(p_month date) returns public.invoices
language plpgsql security definer set search_path = public as $$
declare som date := public.month_start(p_month); r record; inv public.invoices;
begin
  if not exists (select 1 from public.month_closures where month = som) then raise exception 'Nota disponível após o fechamento do mês.'; end if;
  select * into r from public.month_summary(som) where user_id = auth.uid();
  if not found then raise exception 'Sem remuneração neste mês.'; end if;
  insert into public.invoices (user_id, month, number, amount, fixo, bonus)
  values (auth.uid(), som, to_char(som, 'YYYYMM') || '-' || substr(auth.uid()::text, 1, 4), r.total_pay, r.salary, r.bonus)
  on conflict (user_id, month) do nothing;
  select * into inv from public.invoices where user_id = auth.uid() and month = som;
  return inv;
end $$;

create function public.attach_invoice(p_month date, p_path text) returns void
language plpgsql security definer set search_path = public as $$
begin
  update public.invoices set file_path = p_path, status = case when status = 'pendente' then 'enviada' else status end
  where user_id = auth.uid() and month = public.month_start(p_month);
end $$;

create function public.set_invoice_status(p_user uuid, p_month date, p_status text) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  update public.invoices set status = p_status, approved_by = auth.uid(),
         paid_at = case when p_status = 'paga' then now() else paid_at end
  where user_id = p_user and month = public.month_start(p_month);
end $$;

-- Pessoas: papel (apenas admin)
create function public.set_role(p_user uuid, p_role public.app_role) returns void
language plpgsql security definer set search_path = public as $$
begin
  if not public.is_admin() then raise exception 'somente admin'; end if;
  update public.user_roles set role = p_role where user_id = p_user;
end $$;
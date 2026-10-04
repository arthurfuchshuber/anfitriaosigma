-- =====================================================================
-- Intranet Anfitrião Sigma — 2/4  MOTOR DE METAS (fonte única da verdade)
-- Funções puras do cálculo; as telas só exibem o que sai daqui.
-- =====================================================================

create function public.param(k text, d date default current_date) returns numeric
language sql stable as $$
  select value from public.params where key = k and valid_from <= d order by valid_from desc limit 1
$$;

create function public.month_start(d date) returns date language sql immutable as $$
  select date_trunc('month', d)::date $$;

create function public.month_end(d date) returns date language sql immutable as $$
  select (date_trunc('month', d) + interval '1 month - 1 day')::date $$;

-- NETWORKDAYS com feriados
create function public.business_days(a date, b date) returns int
language sql stable as $$
  select count(*)::int from generate_series(a, b, interval '1 day') g(d)
  where extract(isodow from g.d) < 6
    and not exists (select 1 from public.holidays h where h.day = g.d::date)
$$;

-- Salário vigente no mês (reajuste não é retroativo)
create function public.salary_at(uid uuid, m date) returns numeric
language sql stable as $$
  select amount from public.salary_history s
  where s.user_id = uid
    and s.valid_from <= greatest(public.month_start(m), (select start_date from public.profiles where id = uid))
  order by s.valid_from desc limit 1
$$;

-- Fator de rampa: etapa (70/80/90/100%) × proporção de dias úteis trabalhados no mês
create function public.ramp_factor(uid uuid, m date) returns numeric
language plpgsql stable as $$
declare
  p public.profiles%rowtype;
  som date := public.month_start(m);
  eom date := public.month_end(m);
  k int; stage numeric; lo date; hi date; tot int;
begin
  select * into p from public.profiles where id = uid;
  if not found or p.start_date is null then return 0; end if;
  if p.start_date > eom or (p.end_date is not null and p.end_date < som) then return 0; end if;
  k := (extract(year from som)::int * 12 + extract(month from som)::int)
     - (extract(year from p.start_date)::int * 12 + extract(month from p.start_date)::int);
  stage := case when k <= 0 then public.param('rampa_entrada', som)
                when k = 1 then public.param('rampa_m1', som)
                when k = 2 then public.param('rampa_m2', som)
                else public.param('rampa_m3', som) end;
  lo := greatest(p.start_date, som);
  hi := least(coalesce(p.end_date, eom), eom);
  tot := public.business_days(som, eom);
  if tot = 0 then return 0; end if;
  return stage * public.business_days(lo, hi)::numeric / tot;
end $$;

-- Vendedor "rampado": já no mês 3+ e trabalhando o mês inteiro
create function public.is_ramped(uid uuid, m date) returns boolean
language sql stable as $$
  select public.ramp_factor(uid, m) = public.param('rampa_m3', public.month_start(m))
$$;

create function public.item_weight(pid uuid, d date) returns numeric
language sql stable as $$
  select points from public.product_versions
  where product_id = pid and valid_from <= public.month_start(d) order by valid_from desc limit 1
$$;

create function public.item_caixa_pct(pid uuid, d date) returns numeric
language sql stable as $$
  select caixa_pct from public.product_versions
  where product_id = pid and valid_from <= public.month_start(d) order by valid_from desc limit 1
$$;

-- Pontos do vendedor no mês. status_filter: 'all' (não canceladas), 'validated', 'pending'
create function public.seller_points(uid uuid, m date, status_filter text default 'all', cut date default null)
returns numeric language sql stable as $$
  select coalesce(sum(coalesce(si.qty_override, si.qty) * coalesce(public.item_weight(si.product_id, s.sale_date), 0)), 0)
  from public.sales s join public.sale_items si on si.sale_id = s.id
  where s.seller_id = uid
    and s.sale_date between public.month_start(m) and coalesce(cut, public.month_end(m))
    and s.status <> 'cancelled'
    and s.floor_status in ('ok', 'approved')
    and (status_filter = 'all' or s.status = status_filter)
$$;

-- Caixa (valor que entra em caixa) do vendedor no mês
create function public.seller_caixa(uid uuid, m date) returns numeric
language sql stable as $$
  select coalesce(sum(si.value * coalesce(public.item_caixa_pct(si.product_id, s.sale_date), 0)), 0)
  from public.sales s join public.sale_items si on si.sale_id = s.id
  where s.seller_id = uid
    and s.sale_date between public.month_start(m) and public.month_end(m)
    and s.status <> 'cancelled' and s.floor_status in ('ok', 'approved')
$$;

-- Múltiplo da equipe do mês
create function public.team_multiplier(m date) returns numeric
language plpgsql stable as $$
declare
  som date := public.month_start(m);
  fx numeric; base numeric; prev numeric; target numeric; num numeric := 0; den numeric := 0;
  p1 date; p2 date; p3 date; cutd date; frac numeric; r record;
begin
  select value into fx from public.multiplier_fixed where month = som;
  if found then return fx; end if;
  base := public.param('multiplo', som);
  if coalesce(public.param('ajuste_historico', som), 0) <> 1 then return base; end if;
  if som < date '2020-01-01' or not exists (select 1 from public.sales where sale_date < som) then return base; end if;

  p1 := (som - interval '1 month')::date;
  p2 := (som - interval '2 month')::date;
  p3 := (som - interval '3 month')::date;
  cutd := p1 + (public.param('dia_corte', p1)::int - 1);
  frac := public.business_days(p1, cutd)::numeric / nullif(public.business_days(p1, public.month_end(p1)), 0);

  for r in select u.user_id from public.user_roles u where u.role = 'closer' loop
    if public.is_ramped(r.user_id, p1) then
      num := num + public.seller_points(r.user_id, p1, 'all', cutd);
      den := den + coalesce(public.salary_at(r.user_id, p1), 0) * coalesce(frac, 1);
    end if;
    if public.is_ramped(r.user_id, p2) then
      num := num + public.seller_points(r.user_id, p2);
      den := den + coalesce(public.salary_at(r.user_id, p2), 0);
    end if;
    if public.is_ramped(r.user_id, p3) then
      num := num + public.seller_points(r.user_id, p3);
      den := den + coalesce(public.salary_at(r.user_id, p3), 0);
    end if;
  end loop;

  prev := public.team_multiplier(p1);
  if den <= 0 then return prev; end if;
  target := num / (public.param('fator_base', som) * den);
  return round(prev * least(public.param('ajuste_max', som), greatest(public.param('ajuste_min', som), target / prev)), 4);
end $$;

create function public.meta_scale(uid uuid, m date) returns numeric
language sql stable as $$
  select coalesce((select scale from public.meta_overrides
                   where user_id = uid and effective_month <= public.month_start(m)
                   order by effective_month desc, created_at desc limit 1), 1)
$$;

-- Meta individual = Salário × 2 × rampa × Múltiplo × MetaEscala (ou a foto, se o mês já foi fechado)
create function public.individual_goal(uid uuid, m date) returns numeric
language plpgsql stable as $$
declare g numeric; som date := public.month_start(m);
begin
  select goal into g from public.month_goals where month = som and user_id = uid;
  if found then return g; end if;
  return round(coalesce(public.salary_at(uid, som), 0) * public.param('fator_base', som)
         * public.ramp_factor(uid, som) * public.team_multiplier(som) * public.meta_scale(uid, som), 2);
end $$;

-- Resumo do mês (cálculo vivo). Bônus = salário × atingimento (validado ÷ meta), sem teto.
create function public.compute_month(m date)
returns table (user_id uuid, full_name text, nickname text, salary numeric, ramp numeric, multiplier numeric,
               goal numeric, validated numeric, pending numeric, attainment numeric, bonus numeric,
               total_pay numeric, caixa numeric)
language sql stable as $$
  with base as (
    select p.id, p.full_name, p.nickname,
           coalesce(public.salary_at(p.id, m), 0) as salary,
           public.ramp_factor(p.id, m) as ramp,
           public.individual_goal(p.id, m) as goal,
           public.seller_points(p.id, m, 'validated') as validated,
           public.seller_points(p.id, m, 'pending') as pending,
           public.seller_caixa(p.id, m) as caixa
    from public.profiles p join public.user_roles r on r.user_id = p.id and r.role = 'closer'
    where public.ramp_factor(p.id, m) > 0
  )
  select id, full_name, nickname, salary, ramp, public.team_multiplier(m), goal, validated, pending,
         case when goal > 0 then validated / goal else 0 end,
         round(salary * case when goal > 0 then validated / goal else 0 end, 2),
         round(salary + salary * case when goal > 0 then validated / goal else 0 end, 2),
         caixa
  from base order by full_name
$$;

-- Valida automaticamente vendas pendentes com mais de N dias (idempotente)
create function public.run_validation() returns int
language plpgsql security definer set search_path = public as $$
declare n int;
begin
  with up as (
    update public.sales set status = 'validated', validated_at = now()
    where status = 'pending' and floor_status in ('ok', 'approved')
      and sale_date + public.param('dias_validar', sale_date)::int <= current_date
    returning id)
  select count(*) into n from up;
  if n > 0 then
    insert into public.audit_log (actor_name, actor_role, action, entity, detail, location)
    values ('Sistema', 'sistema', 'validacao_automatica', 'sales', n || ' venda(s) validada(s) automaticamente', 'servidor');
  end if;
  return n;
end $$;

-- ---------- Parâmetros e dados iniciais ---------------------------------
insert into public.params (key, value) values
  ('multiplo', 6.5), ('fator_base', 2), ('ajuste_historico', 0), ('ajuste_min', 0.9), ('ajuste_max', 1.25),
  ('dias_validar', 10), ('dia_corte', 25), ('limite_comissao', 0.15),
  ('rampa_entrada', 0.7), ('rampa_m1', 0.8), ('rampa_m2', 0.9), ('rampa_m3', 1),
  ('retroativo_dias', 20), ('dia_fechamento_extra', 0)
on conflict do nothing;

insert into public.holidays (day, name) values
  ('2026-01-01','Confraternização Universal'), ('2026-02-16','Carnaval'), ('2026-02-17','Carnaval'),
  ('2026-04-03','Sexta-feira Santa'), ('2026-04-21','Tiradentes'), ('2026-05-01','Dia do Trabalho'),
  ('2026-06-04','Corpus Christi'), ('2026-09-07','Independência'), ('2026-10-12','Nossa Sra. Aparecida'),
  ('2026-11-02','Finados'), ('2026-11-15','Proclamação da República'), ('2026-11-20','Consciência Negra'),
  ('2026-12-25','Natal'),
  ('2027-01-01','Confraternização Universal'), ('2027-02-08','Carnaval'), ('2027-02-09','Carnaval'),
  ('2027-03-26','Sexta-feira Santa'), ('2027-04-21','Tiradentes'), ('2027-05-01','Dia do Trabalho'),
  ('2027-05-27','Corpus Christi'), ('2027-09-07','Independência'), ('2027-10-12','Nossa Sra. Aparecida'),
  ('2027-11-02','Finados'), ('2027-11-15','Proclamação da República'), ('2027-11-20','Consciência Negra'),
  ('2027-12-25','Natal')
on conflict do nothing;

insert into public.products (name, recurring, sort) values
  ('Gestão Completa', true, 1), ('Gestão Parcial', true, 2), ('ConciergeIA', true, 3),
  ('Cherry CC 12x', false, 4), ('Cherry MENSAL', true, 5), ('Orks Tech', false, 6)
on conflict do nothing;

insert into public.product_versions (product_id, valid_from, points, min_price, caixa_pct)
select p.id, '2000-01-01', v.points, v.piso, v.caixa
from public.products p join (values
  ('Gestão Completa', 1000, 800, 0), ('Gestão Parcial', 1000, 800, 0), ('ConciergeIA', 499, 399, 0),
  ('Cherry CC 12x', 15600, 12000, 0.6), ('Cherry MENSAL', 3000, 2400, 0.3), ('Orks Tech', 899, 700, 0)
) as v(name, points, piso, caixa) on v.name = p.name
on conflict do nothing;

insert into public.company_info (id, legal_name, cnpj, address, email, nf_notes)
values (1, 'Anfitrião Sigma', '', '', 'sigma@anfitriaosigma.com.br', 'Descrição sugerida: Prestação de serviços de venda e consultoria comercial.')
on conflict do nothing;

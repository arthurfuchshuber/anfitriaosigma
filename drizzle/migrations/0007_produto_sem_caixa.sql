-- Produto sem caixa não exige forma de pagamento para salvar; vendas desse produto aceitam qualquer forma (à vista, sem taxa).

create or replace function public.cm_product_save(p jsonb) returns uuid language plpgsql security definer set search_path = public as $$
declare pid uuid := nullif(p ->> 'id', '')::uuid; c jsonb; f jsonb; kinds text[] := '{}'; forms text[] := '{}';
begin
  perform public.cm_assert_manager();
  if coalesce(trim(p ->> 'name'), '') = '' then raise exception 'informe o nome do produto'; end if;
  if jsonb_array_length(coalesce(p -> 'cobrancas', '[]'::jsonb)) = 0 then raise exception 'escolha ao menos uma cobrança'; end if;
  if coalesce((p ->> 'gera_caixa')::boolean, true) and jsonb_array_length(coalesce(p -> 'formas', '[]'::jsonb)) = 0 then raise exception 'escolha ao menos uma forma de pagamento'; end if;
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
  for f in select * from jsonb_array_elements(coalesce(p -> 'formas', '[]'::jsonb)) loop
    forms := forms || (f ->> 'forma');
    insert into public.cm_product_formas (product_id, forma, parcela, max_parcelas, taxa)
    values (pid, f ->> 'forma', coalesce((f ->> 'parcela')::boolean, false), case when coalesce((f ->> 'parcela')::boolean, false) then coalesce((f ->> 'max')::int, 1) else 1 end, coalesce((f ->> 'taxa')::numeric, 0))
    on conflict (product_id, forma) do update set parcela = excluded.parcela, max_parcelas = excluded.max_parcelas, taxa = excluded.taxa;
  end loop;
  delete from public.cm_product_formas where product_id = pid and not (forma = any (forms));
  return pid;
end $$;

create or replace function public.cm_save_payments(p_sale uuid, p_product uuid, p_formas jsonb, p_pago boolean, p_data date) returns void
language plpgsql security definer set search_path = public as $$
declare f jsonb; fm text; br numeric; lq numeric; pa int; dt date; pd date; pf public.cm_product_formas; i int := 0;
begin
  if p_formas is null or jsonb_array_length(p_formas) = 0 then raise exception 'informe ao menos uma forma de pagamento'; end if;
  delete from public.cm_sale_payments where sale_id = p_sale;
  for f in select * from jsonb_array_elements(p_formas) loop
    fm := f ->> 'forma'; br := (f ->> 'bruto')::numeric; pa := coalesce((f ->> 'parcelas')::int, 1);
    select * into pf from public.cm_product_formas where product_id = p_product and forma = fm;
    if not found then
      -- produto sem caixa pode não ter formas cadastradas: aceita qualquer forma, à vista e sem taxa
      if exists (select 1 from public.cm_products where id = p_product and not gera_caixa) and not exists (select 1 from public.cm_product_formas where product_id = p_product) then
        pf := (p_product, fm, false, 1, 0);
      else raise exception 'forma de pagamento não aceita pelo produto: %', fm; end if;
    end if;
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

create or replace function public.cm_products_options() returns jsonb language sql stable security definer set search_path = public as $$
  select jsonb_build_object(
    'empresas', coalesce((select jsonb_agg(jsonb_build_object('id', id, 'name', name, 'linha', linha, 'peso', peso) order by sort) from public.cm_empresas), '[]'::jsonb),
    'products', coalesce((select jsonb_agg(jsonb_build_object('id', p.id, 'name', p.name, 'empresa_id', p.empresa_id, 'empresa', e.name, 'gera_caixa', p.gera_caixa, 'active', p.active,
      'cobrancas', (select coalesce(jsonb_agg(jsonb_build_object('id', c.id, 'kind', c.kind, 'label', case c.kind when 'integral' then 'Pagamento Integral' else 'Recorrência Mensal' end,
                      'bruto', c.bruto, 'liquido', public.cm_cobranca_liquido(c.id)) order by c.kind), '[]'::jsonb) from public.cm_cobrancas c where c.product_id = p.id),
      'formas', (select case when not p.gera_caixa and not exists (select 1 from public.cm_product_formas z where z.product_id = p.id) then '[{"forma":"cartao","parcela":false,"max":1,"taxa":0},{"forma":"pix","parcela":false,"max":1,"taxa":0},{"forma":"boleto","parcela":false,"max":1,"taxa":0}]'::jsonb else coalesce(jsonb_agg(jsonb_build_object('forma', f.forma, 'parcela', f.parcela, 'max', f.max_parcelas, 'taxa', f.taxa)
                    order by case f.forma when 'cartao' then 1 when 'pix' then 2 else 3 end), '[]'::jsonb) end from public.cm_product_formas f where f.product_id = p.id)
    ) order by p.sort) from public.cm_products p join public.cm_empresas e on e.id = p.empresa_id where p.active or public.is_manager()), '[]'::jsonb)) $$;

notify pgrst, 'reload schema';
-- Auditoria v11 (26/11/2026): correções de banco.
-- 1) cm_calc devolve sempre o contrato completo (sellers/months/status) quando não há vendedor.
-- 2) cm_seller_month usa fator/bonus CONGELADOS (e ajustados) em vez de recalcular com as regras vivas.
-- 3) Remove o job de cron duplicado (cm_run_daily rodava 2x por dia).
-- 4) Revoga TODO acesso do papel anon às tabelas/funções do schema public (a RLS deixa de ser a única barreira).

-- ---------- 1) cm_calc: contrato estável no caso "sem vendedor" ---------------------------------------
do $mig$
declare d text; novo text;
begin
  select pg_get_functiondef('public.cm_calc(date,uuid)'::regprocedure) into d;
  novo := replace(d, 'jsonb_build_object(''month'', m, ''sem_vendedor'', true)',
                     'jsonb_build_object(''month'', m, ''status'', ''sem_regras'', ''sem_vendedor'', true, ''sellers'', ''[]''::jsonb, ''months'', ''[]''::jsonb)');
  if novo = d and position('''sellers'', ''[]''' in d) = 0 then raise exception 'cm_calc: trecho do retorno sem vendedor não encontrado'; end if;
  execute novo;
end $mig$;

-- ---------- 2) cm_seller_month: resultado congelado/ajustado prevalece sobre as regras vivas -------------
do $mig$
declare d text; novo text;
begin
  select pg_get_functiondef('public.cm_seller_month(uuid,date)'::regprocedure) into d;
  if position('(fz ->> ''fator'')' in d) > 0 then return; end if;   -- já aplicado
  novo := replace(d, 'fator := public.cm_fator(ating, gat, rules);',
                     'fator := coalesce((fz ->> ''fator'')::numeric, public.cm_fator(ating, gat, rules));');
  novo := replace(novo, 'bonus := round(sal * ating * fator, 2);',
                        'bonus := coalesce((fz ->> ''bonus'')::numeric, round(sal * ating * fator, 2));');
  if novo = d or position('(fz ->> ''bonus'')' in novo) = 0 then raise exception 'cm_seller_month: trechos não encontrados'; end if;
  execute novo;
end $mig$;

-- ---------- 3) Cron: mantém um único job diário do motor ------------------------------------------------
do $mig$
begin
  if exists (select 1 from pg_namespace where nspname = 'cron') then
    perform cron.unschedule(jobid) from cron.job where jobname = 'sigma-comercial-congelar';
  end if;
exception when others then
  raise notice 'cron indisponível: %', sqlerrm;
end $mig$;

-- ---------- 4) anon sem nenhum acesso ao schema public --------------------------------------------------
revoke all on all tables    in schema public from anon;
revoke all on all sequences in schema public from anon;
revoke all on all functions in schema public from anon;
alter default privileges in schema public revoke all on tables    from anon;
alter default privileges in schema public revoke all on sequences from anon;
alter default privileges in schema public revoke all on functions from anon;

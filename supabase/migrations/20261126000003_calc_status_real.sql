-- cm_calc sem vendedor: o status do mês vem da regra real (antes ficava fixo em 'sem_regras', mesmo com o mês em vigor).
do $mig$
declare d text; novo text;
begin
  select pg_get_functiondef('public.cm_calc(date,uuid)'::regprocedure) into d;
  novo := replace(d, '''status'', ''sem_regras'', ''sem_vendedor''', '''status'', public.cm_month_status(m), ''sem_vendedor''');
  if novo = d then
    if position('cm_month_status(m), ''sem_vendedor''' in d) > 0 then return; end if;
    raise exception 'cm_calc: trecho não encontrado';
  end if;
  execute novo;
end $mig$;

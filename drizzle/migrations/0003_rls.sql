-- =====================================================================
-- Intranet Anfitrião Sigma — 4/4  SEGURANÇA (RLS), STORAGE E AGENDAMENTO
-- (aplicado sem o INSERT em storage.buckets: no Cloud os buckets avatars/invoices
--  foram criados pela ferramenta de storage; demais instruções idênticas ao arquivo)
-- =====================================================================

do $$
declare t text;
begin
  foreach t in array array['profiles','user_roles','profile_sensitive','area_access','products','product_versions',
    'params','salary_history','holidays','company_info','multiplier_fixed','meta_overrides','goal_locks',
    'month_goals','month_closures','sales','sale_items','invoices','notifications','audit_log']
  loop execute format('alter table public.%I enable row level security', t); end loop;
end $$;

create policy profiles_sel on public.profiles for select to authenticated using (id = auth.uid() or public.is_manager());
create policy profiles_upd on public.profiles for update to authenticated using (public.is_manager()) with check (public.is_manager());
create policy profiles_ins on public.profiles for insert to authenticated with check (public.is_manager());

create policy roles_sel on public.user_roles for select to authenticated using (user_id = auth.uid() or public.is_manager());

create policy sens_sel on public.profile_sensitive for select to authenticated using (user_id = auth.uid());
create policy sens_ins on public.profile_sensitive for insert to authenticated with check (user_id = auth.uid());
create policy sens_upd on public.profile_sensitive for update to authenticated using (user_id = auth.uid()) with check (user_id = auth.uid());

create policy area_sel on public.area_access for select to authenticated using (user_id = auth.uid() or public.is_manager());

create policy prod_sel on public.products for select to authenticated using (public.has_area('metas'));
create policy prod_w on public.products for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy pv_sel on public.product_versions for select to authenticated using (public.has_area('metas'));
create policy pv_w on public.product_versions for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy par_sel on public.params for select to authenticated using (public.has_area('metas'));
create policy par_w on public.params for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy hol_sel on public.holidays for select to authenticated using (public.has_area('metas'));
create policy hol_w on public.holidays for all to authenticated using (public.is_manager()) with check (public.is_manager());
create policy co_sel on public.company_info for select to authenticated using (public.has_area('metas'));
create policy co_w on public.company_info for update to authenticated using (public.is_manager()) with check (public.is_manager());
create policy mf_sel on public.multiplier_fixed for select to authenticated using (public.is_manager());
create policy gl_sel on public.goal_locks for select to authenticated using (public.is_manager());
create policy mo_sel on public.meta_overrides for select to authenticated using (user_id = auth.uid() or public.is_manager());
create policy mg_sel on public.month_goals for select to authenticated using (user_id = auth.uid() or public.is_manager());
create policy mc_sel on public.month_closures for select to authenticated using (public.is_manager());

create policy sal_sel on public.salary_history for select to authenticated using (user_id = auth.uid() or public.is_manager());
create policy sal_w on public.salary_history for all to authenticated using (public.is_manager()) with check (public.is_manager());

create policy sales_sel on public.sales for select to authenticated
  using ((seller_id = auth.uid() and public.has_area('metas')) or public.is_manager());
create policy items_sel on public.sale_items for select to authenticated
  using (exists (select 1 from public.sales s where s.id = sale_id and ((s.seller_id = auth.uid() and public.has_area('metas')) or public.is_manager())));

create policy inv_sel on public.invoices for select to authenticated using (user_id = auth.uid() or public.is_manager());
create policy notif_sel on public.notifications for select to authenticated
  using (user_id = auth.uid() or (user_id is null and public.is_manager()));
create policy audit_sel on public.audit_log for select to authenticated using (public.is_manager());

revoke all on all functions in schema public from anon;
revoke execute on function public.write_log(text, text, text, text, text, text) from public, authenticated;
revoke execute on function public.notify(uuid, text, text, text, text) from public, authenticated;
revoke execute on function public.run_validation() from public, anon;
grant execute on function public.run_validation() to authenticated, service_role;
revoke insert, update, delete on public.audit_log from authenticated, anon;

create policy "avatars_read" on storage.objects for select using (bucket_id = 'avatars');
create policy "avatars_write" on storage.objects for insert to authenticated
  with check (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "avatars_update" on storage.objects for update to authenticated
  using (bucket_id = 'avatars' and (storage.foldername(name))[1] = auth.uid()::text);
create policy "invoices_own" on storage.objects for select to authenticated
  using (bucket_id = 'invoices' and ((storage.foldername(name))[1] = auth.uid()::text or public.is_manager()));
create policy "invoices_up" on storage.objects for insert to authenticated
  with check (bucket_id = 'invoices' and (storage.foldername(name))[1] = auth.uid()::text);

do $$
begin
  if exists (select 1 from pg_available_extensions where name = 'pg_cron') then
    create extension if not exists pg_cron;
    perform cron.schedule('sigma-validar-vendas', '10 3 * * *', 'select public.run_validation()');
  end if;
exception when others then
  raise notice 'pg_cron indisponível: ative em Database → Extensions e agende run_validation() diariamente.';
end $$;
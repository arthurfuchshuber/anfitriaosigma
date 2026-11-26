-- Auditoria v11 (2ª rodada): funções SECURITY DEFINER internas estavam executáveis por QUALQUER usuário logado via /rest/v1/rpc.
-- Achados críticos corrigidos aqui:
--   * field_value(p_key, p_user): devolvia CPF, RG, CNPJ, PIX, banco, endereço e nascimento de QUALQUER usuário;
--   * cm_save_payments(p_sale, ...): apagava e regravava os pagamentos de QUALQUER venda (altera pontos e bônus);
--   * cm_seller_month / cm_distribution / cm_rules / cm_team_confirmed / cm_sale_points ...: expunham salário, meta e bônus de todos.
-- Regra daqui em diante: função SECURITY DEFINER só é chamável por `authenticated` se estiver na lista abaixo
-- (RPCs que o front chama + helpers usados por policies). O resto só roda por dentro de outras funções (com privilégio do dono).
do $mig$
declare
  allow text[] := array[
    -- Comercial v2 (chamadas pelo front)
    'cm_apply_sugestao','cm_calc','cm_calc_sim','cm_cancel_preview','cm_cancel_sale','cm_confirm_payment','cm_decide_unlock','cm_draft_save',
    'cm_hub','cm_me','cm_people_list','cm_months_list','cm_preview','cm_product_get','cm_product_preview','cm_product_save','cm_products_list','cm_products_options',
    'cm_projecao','cm_publish','cm_register_sale','cm_request_unlock','cm_rules_get','cm_sale_get','cm_sale_preview','cm_sales_list','cm_seller_get',
    'cm_seller_history','cm_seller_save','cm_sellers_list','cm_sugestao','cm_update_sale','cm_validate_rules',
    -- usadas em policies RLS / auto-consulta
    'cm_my_seller','has_area','is_manager','is_admin','actor_name',
    -- Intranet (chamadas pelo front)
    'attach_invoice','cancel_sale','check_duplicate','close_month','confirm_goal_lock','decide_access','decide_floor','generate_invoice','log_event',
    'month_summary','my_pending','pending_people','register_sale','remind_pending','request_access','required_field_stats','run_validation',
    'sensitive_masked','set_invoice_status','set_item_qty','set_meta_scale','set_multiplier','set_product_version','set_required_field','set_role',
    'team_average','update_my_profile'];
  f record;
begin
  for f in
    select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prokind = 'f' and p.prosecdef and not (p.proname = any (allow))
  loop
    execute format('revoke execute on function %s from public, anon, authenticated', f.sig);
  end loop;
  -- as da lista continuam sem acesso para anon/public
  for f in
    select p.oid::regprocedure as sig from pg_proc p join pg_namespace n on n.oid = p.pronamespace
     where n.nspname = 'public' and p.prokind = 'f' and p.prosecdef and p.proname = any (allow)
  loop
    execute format('revoke execute on function %s from public, anon', f.sig);
    execute format('grant execute on function %s to authenticated', f.sig);
  end loop;
end $mig$;

-- Buckets de upload: limite de tamanho e tipos permitidos (o público `avatars` não pode aceitar SVG/HTML).
do $mig$
begin
  update storage.buckets set file_size_limit = 3145728, allowed_mime_types = array['image/png','image/jpeg','image/webp','image/gif'] where id = 'avatars';
  update storage.buckets set file_size_limit = 10485760, allowed_mime_types = array['application/pdf','image/png','image/jpeg','image/webp','image/heic'] where id in ('invoices','comprovantes');
exception when undefined_table or insufficient_privilege then
  raise notice 'storage.buckets indisponível: configure os limites dos buckets pelo painel de Storage.';
end $mig$;

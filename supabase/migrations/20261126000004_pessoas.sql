-- Pessoas (Comercial): solicitações de acesso, equipe e papéis, com o admin principal protegido.
--  * cm_people_list(): lista para a tela Pessoas (somente gestor/admin).
--  * decide_access / set_role: ganham proteções (admin principal, auto-negação, último admin).
--  * trigger: o papel do admin principal (sigma@anfitriaosigma.com.br) nunca deixa de ser admin.
--  * cm_hub: passa a informar quantas solicitações estão pendentes (linha "Pessoas" do menu).

create or replace function public.cm_people_list() returns jsonb language plpgsql volatile security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  return jsonb_build_object(
    'is_admin', public.is_admin(),
    'me', auth.uid(),
    'people', coalesce((
      select jsonb_agg(to_jsonb(q) - 'ord' order by q.ord, q.requested_at desc nulls last, lower(q.name))
        from (
          select p.id, coalesce(nullif(p.full_name, ''), nullif(p.nickname, ''), split_part(p.email, '@', 1)) as name, p.email,
                 coalesce(r.role::text, 'closer') as role,
                 case when r.role in ('gestor', 'admin') then 'approved' else coalesce(a.status, 'none') end as access,
                 a.requested_at, a.decided_at, a.note,
                 s.id as seller_id, s.active as seller_active,
                 cardinality(public.missing_user_fields(p.id)) = 0 as cadastro_ok,
                 lower(p.email) = 'sigma@anfitriaosigma.com.br' as protegido,
                 case when a.status = 'pending' and coalesce(r.role::text, 'closer') = 'closer' then 0 else 1 end as ord
            from public.profiles p
            left join public.user_roles r on r.user_id = p.id
            left join public.area_access a on a.user_id = p.id and a.area = 'metas'
            left join public.cm_sellers s on s.user_id = p.id
           where p.active and (r.role in ('gestor', 'admin') or a.status is not null)
        ) q), '[]'::jsonb));
end $$;
revoke execute on function public.cm_people_list() from public, anon;
grant execute on function public.cm_people_list() to authenticated;

create or replace function public.decide_access(p_user uuid, p_area text, p_approve boolean, p_note text default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if not public.is_manager() then raise exception 'sem permissão'; end if;
  if not p_approve and (p_user = auth.uid() or exists (select 1 from public.profiles where id = p_user and lower(email) = 'sigma@anfitriaosigma.com.br')) then
    raise exception 'este acesso não pode ser negado';
  end if;
  insert into public.area_access (user_id, area, status, decided_by, decided_at, note)
  values (p_user, p_area, case when p_approve then 'approved' else 'denied' end, auth.uid(), now(), nullif(trim(p_note), ''))
  on conflict (user_id, area) do update
    set status = excluded.status, decided_by = excluded.decided_by, decided_at = excluded.decided_at, note = excluded.note;
  update public.notifications set resolved_at = now() where kind = 'access_request' and ref = p_user::text || ':' || p_area;
  perform public.notify(p_user, 'access_decision',
    case when p_approve then 'Acesso aprovado' else 'Acesso negado' end, 'Área: ' || p_area, p_area);
end $$;

create or replace function public.set_role(p_user uuid, p_role public.app_role) returns void
language plpgsql security definer set search_path = public as $$
declare cur public.app_role; em text;
begin
  if not public.is_admin() then raise exception 'somente admin'; end if;
  select email into em from public.profiles where id = p_user;
  if em is null then raise exception 'pessoa não encontrada'; end if;
  select role into cur from public.user_roles where user_id = p_user;
  if p_role <> 'admin' then
    if lower(em) = 'sigma@anfitriaosigma.com.br' then raise exception 'o admin principal não pode perder o papel de admin'; end if;
    if p_user = auth.uid() then raise exception 'você não pode remover o seu próprio papel de admin'; end if;
    if cur = 'admin' and (select count(*) from public.user_roles where role = 'admin') <= 1 then raise exception 'precisa existir ao menos um admin'; end if;
  end if;
  if cur is null then insert into public.user_roles (user_id, role) values (p_user, p_role);
  else update public.user_roles set role = p_role where user_id = p_user; end if;
end $$;

-- cinto e suspensório: nem por SQL direto o papel do admin principal deixa de ser admin
create or replace function public.guard_main_admin() returns trigger language plpgsql security definer set search_path = public as $$
begin
  if new.role <> 'admin' and exists (select 1 from public.profiles where id = new.user_id and lower(email) = 'sigma@anfitriaosigma.com.br') then
    raise exception 'o admin principal não pode perder o papel de admin';
  end if;
  return new;
end $$;
revoke execute on function public.guard_main_admin() from public, anon, authenticated;
drop trigger if exists guard_main_admin on public.user_roles;
create trigger guard_main_admin before update on public.user_roles for each row execute function public.guard_main_admin();

-- garante o estado atual: admin principal com papel admin e acesso às áreas
do $mig$
begin
  update public.user_roles set role = 'admin' where user_id in (select id from public.profiles where lower(email) = 'sigma@anfitriaosigma.com.br') and role <> 'admin';
end $mig$;

-- menu do Comercial: solicitações pendentes
do $mig$
declare d text;
begin
  d := pg_get_functiondef('public.cm_hub()'::regprocedure);
  d := replace(d, '''vendas_pts'', public.cm_team_confirmed(cur))',
    '''vendas_pts'', public.cm_team_confirmed(cur), ''pessoas_pend'', (select count(*)::int from public.area_access where area = ''metas'' and status = ''pending''))');
  if d not like '%pessoas_pend%' then raise exception 'cm_hub: trecho esperado não encontrado'; end if;
  execute d;
end $mig$;

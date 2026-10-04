-- 08 · Relações para a API embutir o perfil (nome/apelido) nas consultas de vendas e de pedidos de acesso.
-- Erro corrigido: "Could not find a relationship between 'sales' and 'seller_id' in the schema cache".
-- sales.seller_id e area_access.user_id já apontam para auth.users; a API de dados só embute tabelas do schema public,
-- então ganham também uma relação com public.profiles (mesmo id do usuário). Nada muda nos dados nem nas regras (RLS).
do $$ begin
  if not exists (select 1 from pg_constraint where conname = 'sales_seller_id_profiles_fkey') then
    alter table public.sales add constraint sales_seller_id_profiles_fkey foreign key (seller_id) references public.profiles (id);
  end if;
  if not exists (select 1 from pg_constraint where conname = 'area_access_user_id_profiles_fkey') then
    alter table public.area_access add constraint area_access_user_id_profiles_fkey foreign key (user_id) references public.profiles (id) on delete cascade;
  end if;
end $$;
create index if not exists area_access_user_idx on public.area_access (user_id);
notify pgrst, 'reload schema';

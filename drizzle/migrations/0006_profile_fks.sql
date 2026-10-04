alter table public.sales add constraint sales_seller_id_profiles_fkey foreign key (seller_id) references public.profiles (id);
alter table public.area_access add constraint area_access_user_id_profiles_fkey foreign key (user_id) references public.profiles (id) on delete cascade;
create index if not exists area_access_user_idx on public.area_access (user_id);
notify pgrst, 'reload schema';
-- Infra do Cloud: a API de dados não concede privilégios padrão em public. RLS continua decidindo o acesso.
grant usage on schema public to authenticated, service_role;
grant select, insert, update, delete on all tables in schema public to authenticated;
grant all on all tables in schema public to service_role;
grant usage, select on all sequences in schema public to authenticated, service_role;
revoke insert, update, delete on public.audit_log from authenticated, anon;

-- EXECUTE: o "revoke ... from anon" não remove o grant padrão de PUBLIC. Fecha para anon de fato.
revoke execute on all functions in schema public from public, anon;
grant execute on all functions in schema public to authenticated, service_role;
revoke execute on function public.write_log(text, text, text, text, text, text) from authenticated;
revoke execute on function public.notify(uuid, text, text, text, text) from authenticated;
revoke execute on function public.field_value(text, uuid) from authenticated;
revoke execute on function public.user_doc_type(uuid) from authenticated;
alter default privileges in schema public revoke execute on functions from public;

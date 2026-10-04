// @vitest-environment node
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

const DIR = "supabase/migrations";
let db: PGlite;
const ADMIN = "00000000-0000-0000-0000-0000000000a1";
const GESTOR = "00000000-0000-0000-0000-0000000000a2";
const DARCIO = "00000000-0000-0000-0000-0000000000b1";
const ANA = "00000000-0000-0000-0000-0000000000b2";

const as = async (uid: string | null, role = "authenticated") => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false);`);
  if (uid) await db.exec(`set role ${role}`);
};
const q = async <T = any>(sql: string, params: any[] = []) => (await db.query<T>(sql, params)).rows;

beforeAll(async () => {
  db = new PGlite();
  await db.exec(`
    create role anon; create role authenticated; create role service_role;
    create schema auth;
    create table auth.users (id uuid primary key, email text, raw_user_meta_data jsonb default '{}'::jsonb);
    create function auth.uid() returns uuid language sql stable as $$ select nullif(current_setting('request.jwt.claim.sub', true), '')::uuid $$;
    grant usage on schema auth to anon, authenticated, service_role;
    grant usage on schema public to anon, authenticated, service_role;
  `);
  for (const f of readdirSync(DIR).sort()) await db.exec(readFileSync(`${DIR}/${f}`, "utf8"));
  await db.exec(`grant select, insert, update, delete on all tables in schema public to authenticated;
                 grant execute on all functions in schema public to authenticated;`);
  const ins = (id: string, email: string) =>
    db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${id}', '${email}', '{"full_name":"${email.split("@")[0]}"}')`);
  await ins(ADMIN, "sigma@anfitriaosigma.com.br");
  await ins(GESTOR, "gestor@anfitriaosigma.com.br");
  await ins(DARCIO, "darcio@anfitriaosigma.com.br");
  await ins(ANA, "ana@anfitriaosigma.com.br");
  await db.exec(`
    update public.user_roles set role='gestor' where user_id='${GESTOR}';
    update public.profiles set start_date='2026-10-05' where id='${DARCIO}';
    update public.profiles set start_date='2026-01-05' where id='${ANA}';
    insert into public.salary_history (user_id, valid_from, amount) values
      ('${DARCIO}','2026-10-05',2300), ('${ANA}','2026-01-05',3000), ('${ANA}','2026-10-15',4000);
    insert into public.area_access (user_id, area, status) values ('${DARCIO}','metas','approved'), ('${ANA}','metas','approved');
  `);
});

describe("cadastro", () => {
  it("rejeita e-mail fora do domínio", async () => {
    await expect(db.exec(`insert into auth.users (id, email) values (gen_random_uuid(), 'x@gmail.com')`)).rejects.toThrow(/anfitriaosigma/);
  });
  it("primeiro admin é sigma@", async () => {
    expect((await q(`select role from public.user_roles where user_id='${ADMIN}'`))[0].role).toBe("admin");
    expect(await q(`select 1 from public.area_access where user_id='${ADMIN}' and area='comercial' and status='approved'`)).toHaveLength(1);
  });
});

describe("motor de metas", () => {
  it("dias úteis de outubro/2026 = 21 (feriado 12/10) e 19 a partir do dia 5", async () => {
    expect((await q(`select public.business_days('2026-10-01','2026-10-31') n`))[0].n).toBe(21);
    expect((await q(`select public.business_days('2026-10-05','2026-10-31') n`))[0].n).toBe(19);
  });
  it("meta do Dárcio: 2300 × 2 × 70% × 19/21 × 6,5 = 18.937", async () => {
    const g = Number((await q(`select public.individual_goal('${DARCIO}','2026-10-01') g`))[0].g);
    expect(Math.round(g)).toBe(18937);
  });
  it("rampa: mês 1 = 80%, mês 2 = 90%, mês 3+ = 100%", async () => {
    const r = async (m: string) => Number((await q(`select public.ramp_factor('${DARCIO}','${m}') r`))[0].r);
    expect(await r("2026-11-01")).toBeCloseTo(0.8, 5);
    expect(await r("2026-12-01")).toBeCloseTo(0.9, 5);
    expect(await r("2027-01-01")).toBeCloseTo(1, 5);
    expect(await r("2026-09-01")).toBe(0);
  });
  it("reajuste de salário não é retroativo", async () => {
    expect(Number((await q(`select public.salary_at('${ANA}','2026-10-01') s`))[0].s)).toBe(3000);
    expect(Number((await q(`select public.salary_at('${ANA}','2026-11-01') s`))[0].s)).toBe(4000);
  });
  it("MetaEscala manual multiplica a meta", async () => {
    await db.exec(`insert into public.meta_overrides (user_id, effective_month, scale) values ('${DARCIO}','2026-10-01',0.5)`);
    expect(Math.round(Number((await q(`select public.individual_goal('${DARCIO}','2026-10-01') g`))[0].g))).toBe(9468);
    await db.exec(`delete from public.meta_overrides`).catch(() => {});
  });
});

describe("vendas e bônus", () => {
  let pCherry: string, pGC: string;
  beforeAll(async () => {
    pCherry = (await q(`select id from public.products where name='Cherry CC 12x'`))[0].id;
    pGC = (await q(`select id from public.products where name='Gestão Completa'`))[0].id;
    await db.exec(`delete from public.meta_overrides`);
  });
  it("registra venda, calcula pendente e abaixo do piso exige aprovação", async () => {
    await as(DARCIO);
    const ok = (await q(`select public.register_sale('Cliente A','111.222.333-44', current_date,
      '[{"product_id":"${pGC}","qty":1,"value":1000}]'::jsonb,'pix',1,false,null) r`))[0].r;
    expect(ok.needs_approval).toBe(false);
    const low = (await q(`select public.register_sale('Cliente B','999', current_date,
      '[{"product_id":"${pGC}","qty":1,"value":500}]'::jsonb,'pix',1,false,null) r`))[0].r;
    expect(low.needs_approval).toBe(true);
    const dup = (await q(`select public.register_sale('Cliente A','11122233344', current_date,
      '[{"product_id":"${pGC}","qty":1,"value":1000}]'::jsonb,'boleto',1,false,null) r`))[0].r;
    expect(dup.duplicate).toBe(true);
    await as(null);
  });
  it("retroativo além de 20 dias é recusado", async () => {
    await as(DARCIO);
    await expect(q(`select public.register_sale('X','1', current_date - 40,
      '[{"product_id":"${pGC}","qty":1,"value":1000}]'::jsonb,'pix',1,false,null)`)).rejects.toThrow(/retroativo/i);
    await as(null);
  });
  it("validação automática após 10 dias; validada não cancela", async () => {
    await as(null);
    await db.exec(`insert into public.sales (seller_id, client_name, client_doc, sale_date, pay_method, total_value)
                   values ('${ANA}','Cliente Velho','55', current_date - 12, 'pix', 15600) `);
    const sid = (await q(`select id from public.sales where client_name='Cliente Velho'`))[0].id;
    await db.exec(`insert into public.sale_items (sale_id, product_id, qty, value) values ('${sid}','${pCherry}',1,15600)`);
    expect(Number((await q(`select public.run_validation() n`))[0].n)).toBeGreaterThanOrEqual(1);
    expect((await q(`select status from public.sales where id='${sid}'`))[0].status).toBe("validated");
    await as(ANA);
    await expect(q(`select public.cancel_sale('${sid}','teste')`)).rejects.toThrow(/validadas permanecem/);
    await as(null);
  });
  it("bônus = salário × atingimento, sem teto", async () => {
    const m = (await q(`select public.month_start(current_date - 12)::text m`))[0].m;
    const row = (await q(`select * from public.compute_month('${m}') where user_id='${ANA}'`))[0];
    expect(Number(row.validated)).toBe(15600);
    expect(Number(row.bonus)).toBeCloseTo(Number(row.salary) * Number(row.validated) / Number(row.goal), 1);
  });
  it("pendente só cancela se pendente; closer cancela a própria", async () => {
    await as(DARCIO);
    const id = (await q(`select id from public.sales where client_name='Cliente B'`))[0].id;
    await q(`select public.cancel_sale('${id}','erro')`);
    await as(null);
    expect((await q(`select status from public.sales where id='${id}'`))[0].status).toBe("cancelled");
  });
});

describe("multiplicador histórico", () => {
  it("usa dias corridos (25 de 31 em outubro) no mês vigente", async () => {
    await db.exec(`insert into public.profiles (id, email) select '00000000-0000-0000-0000-0000000000d1','x@anfitriaosigma.com.br' where false`);
    const f = Number((await q(`select (date '2026-10-25' - date '2026-10-01' + 1)::numeric / (public.month_end('2026-10-01') - date '2026-10-01' + 1) f`))[0].f);
    expect(f).toBeCloseTo(25 / 31, 6);
  });
  it("fica dentro dos limites 0,9 / 1,25 do múltiplo anterior", async () => {
    await db.exec(`insert into public.params (key, valid_from, value) values ('ajuste_historico','2026-01-01',1)`);
    const mult = Number((await q(`select public.team_multiplier(date_trunc('month', current_date)::date) m`))[0].m);
    expect(mult).toBeGreaterThanOrEqual(6.5 * 0.9 - 1e-6);
    expect(mult).toBeLessThanOrEqual(6.5 * 1.25 + 1e-6);
    await db.exec(`delete from public.params where key='ajuste_historico' and valid_from='2026-01-01'`);
  });
  it("múltiplo fixo na tabela prevalece", async () => {
    await db.exec(`insert into public.multiplier_fixed (month, value) values ('2030-01-01', 7.25)`);
    expect(Number((await q(`select public.team_multiplier('2030-01-15') m`))[0].m)).toBe(7.25);
  });
});

describe("segurança", () => {
  it("log é imutável", async () => {
    await as(null);
    await expect(db.exec(`update public.audit_log set action='x'`)).rejects.toThrow(/imutável/);
    await expect(db.exec(`delete from public.audit_log`)).rejects.toThrow(/imutável/);
  });
  it("sensível: só o dono lê; gestor só vê mascarado", async () => {
    await as(DARCIO);
    await db.exec(`insert into public.profile_sensitive (user_id, cpf, pix_key) values ('${DARCIO}','52998224725','darcio@pix.com')`);
    expect(await q(`select * from public.profile_sensitive`)).toHaveLength(1);
    await as(GESTOR);
    expect(await q(`select * from public.profile_sensitive`)).toHaveLength(0);
    const m = (await q(`select * from public.sensitive_masked('${DARCIO}')`))[0];
    expect(m.cpf).toMatch(/^•+25$/);
    await as(ANA);
    await expect(q(`select * from public.sensitive_masked('${DARCIO}')`)).rejects.toThrow(/permissão/);
    await as(null);
  });
  it("closer não vê vendas dos outros nem o log; sem área aprovada não vê nada", async () => {
    await as(ANA);
    expect((await q(`select distinct seller_id from public.sales`)).every((r) => r.seller_id === ANA)).toBe(true);
    expect(await q(`select * from public.audit_log`)).toHaveLength(0);
    await as(null);
  });
  it("solicitar acesso gera pedido pendente e gestor aprova", async () => {
    await db.exec(`insert into auth.users (id, email) values ('00000000-0000-0000-0000-0000000000c1','novo@anfitriaosigma.com.br')`);
    await as("00000000-0000-0000-0000-0000000000c1");
    expect((await q(`select public.request_access('metas') s`))[0].s).toBe("pending");
    await expect(q(`select * from public.month_summary('2026-10-01')`)).rejects.toThrow(/sem acesso/);
    await as(GESTOR);
    await q(`select public.decide_access('00000000-0000-0000-0000-0000000000c1','metas', true)`);
    await as("00000000-0000-0000-0000-0000000000c1");
    await q(`select * from public.month_summary('2026-10-01')`);
    await as(null);
  });
});

describe("cadastro pendente", () => {
  const VALID_CNPJ = "11222333000181";
  it("valida dígitos de CPF e CNPJ", async () => {
    const r = (await q(`select public.valid_cpf('529.982.247-25') a, public.valid_cpf('111.111.111-11') b, public.valid_cpf('529.982.247-24') c,
                               public.valid_cnpj('11.222.333/0001-81') d, public.valid_cnpj('11.222.333/0001-80') e, public.valid_cnpj('00000000000000') f`))[0];
    expect(r).toEqual({ a: true, b: false, c: false, d: true, e: false, f: false });
  });
  it("colaborador novo tem pendências; gestor/admin também veem as da empresa; closer não vê as da empresa", async () => {
    await as(ANA);
    const p = (await q(`select public.my_pending() p`))[0].p;
    expect(p.user).toContain("u_cpf");
    expect(p.user).toContain("u_rg");
    expect(p.user).not.toContain("u_cnpj");           // PF por padrão
    expect(p.user).not.toContain("u_whatsapp");       // opcional
    expect(p.company).toBeNull();
    await as(ADMIN);
    const a = (await q(`select public.my_pending() p`))[0].p;
    expect(a.company).toContain("c_cnpj");
    expect(a.company).toContain("c_rep_cpf");
    await as(null);
  });
  it("PJ troca CPF/RG por CNPJ/razão social nas pendências", async () => {
    await as(ANA);
    await db.exec(`insert into public.profile_sensitive (user_id, doc_type) values ('${ANA}','pj')`);
    const p = (await q(`select public.my_pending() p`))[0].p;
    expect(p.user).toContain("u_cnpj");
    expect(p.user).toContain("u_company_name");
    expect(p.user).not.toContain("u_cpf");
    expect(p.user).not.toContain("u_rg");
    await as(null);
  });
  it("preencher reduz as pendências; CPF/CNPJ inválidos e CNPJ inativo são recusados", async () => {
    await as(ANA);
    await expect(db.exec(`update public.profile_sensitive set cnpj='11222333000180' where user_id='${ANA}'`)).rejects.toThrow(/CNPJ inválido/);
    await expect(db.exec(`update public.profile_sensitive set cnpj='${VALID_CNPJ}', cnpj_status='BAIXADA' where user_id='${ANA}'`)).rejects.toThrow(/sem situação ATIVA/);
    await db.exec(`update public.profile_sensitive set cnpj='11.222.333/0001-81', cnpj_status='ATIVA', company_name='ANA LTDA' where user_id='${ANA}'`);
    expect((await q(`select cnpj from public.profile_sensitive where user_id='${ANA}'`))[0].cnpj).toBe(VALID_CNPJ);
    const p = (await q(`select public.my_pending() p`))[0].p;
    expect(p.user).not.toContain("u_cnpj");
    expect(p.user).not.toContain("u_company_name");
    await q(`select public.update_my_profile('{"phone":"+5545999999999","birth_date":"1990-05-10","nickname":"Ana","address":{"cep":"85851000","rua":"Av. Paraná","numero":"10","bairro":"Centro","cidade":"Foz do Iguaçu","uf":"PR"}}'::jsonb)`);
    const p2 = (await q(`select public.my_pending() p`))[0].p;
    for (const k of ["u_phone", "u_birth_date", "u_nickname", "u_cep", "u_street", "u_number", "u_neighborhood", "u_city", "u_uf"]) expect(p2.user).not.toContain(k);
    await expect(q(`select public.update_my_profile('{"personal_email":"xx"}'::jsonb)`)).rejects.toThrow(/E-mail pessoal inválido/);
    await as(null);
  });
  it("campo novo obrigatório faz a pendência reaparecer para quem já estava completo; só gestor liga/desliga", async () => {
    await as(ANA);
    await expect(q(`select public.set_required_field('u_whatsapp', true)`)).rejects.toThrow(/gestor/);
    await as(GESTOR);
    await q(`select public.set_required_field('u_whatsapp', true)`);
    await as(ANA);
    expect((await q(`select public.my_pending() p`))[0].p.user).toContain("u_whatsapp");
    await as(GESTOR);
    await q(`select public.set_required_field('u_whatsapp', false)`);
    await as(ANA);
    expect((await q(`select public.my_pending() p`))[0].p.user).not.toContain("u_whatsapp");
    await as(null);
  });
  it("empresa: gestor salva e a pendência some; estatísticas e lembrete funcionam", async () => {
    await as(GESTOR);
    await db.exec(`update public.company_info set cnpj='${VALID_CNPJ}', cnpj_status='ATIVA', legal_name='ANFITRIAO SIGMA LTDA', municipal_reg='123', tax_regime='Simples Nacional',
      addr='{"cep":"85851000","rua":"Av. Paraná","numero":"1","bairro":"Centro","cidade":"Foz","uf":"PR"}'::jsonb, phone='+5545999999999',
      rep_name='Fulano', rep_cpf='52998224725', rep_birth='1980-01-01', rep_phone='+5545999999999', bank='260', agency='0001', account='12345-6' where id=1`);
    const c = (await q(`select public.my_pending() p`))[0].p.company;
    expect(c).toEqual([]);
    const st = await q(`select * from public.required_field_stats()`);
    expect(st.find((r) => r.key === "c_cnpj")!.filled_pct).toBe(100);
    expect(st.find((r) => r.key === "u_cpf")!.filled_pct).toBeLessThan(100);
    const ppl = await q(`select * from public.pending_people()`);
    expect(ppl.length).toBeGreaterThan(0);
    expect(Number((await q(`select public.remind_pending('${DARCIO}') n`))[0].n)).toBeGreaterThan(0);
    await as(DARCIO);
    await expect(q(`select * from public.pending_people()`)).rejects.toThrow(/permissão/);
    await as(null);
  });
});

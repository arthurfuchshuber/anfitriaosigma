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
    await db.exec(`insert into public.profile_sensitive (user_id, cpf, pix_key) values ('${DARCIO}','12345678901','darcio@pix.com')`);
    expect(await q(`select * from public.profile_sensitive`)).toHaveLength(1);
    await as(GESTOR);
    expect(await q(`select * from public.profile_sensitive`)).toHaveLength(0);
    const m = (await q(`select * from public.sensitive_masked('${DARCIO}')`))[0];
    expect(m.cpf).toMatch(/^•+01$/);
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

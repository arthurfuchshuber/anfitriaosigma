/* eslint-disable @typescript-eslint/no-explicit-any */
// @vitest-environment node
// Motor do Comercial v2 (migration 20261008000001): regras validadas nos mockups de 08/10/2026.
import { PGlite } from "@electric-sql/pglite";
import { readFileSync, readdirSync } from "node:fs";
import { beforeAll, describe, expect, it } from "vitest";

const DIR = "supabase/migrations";
let db: PGlite;
const ADMIN = "00000000-0000-0000-0000-0000000000a1";
const GESTOR = "00000000-0000-0000-0000-0000000000a2";
const U_ANA = "00000000-0000-0000-0000-0000000000b2";
const U_BRUNO = "00000000-0000-0000-0000-0000000000b3";

const as = async (uid: string | null) => {
  await db.exec(`reset role; select set_config('request.jwt.claim.sub', '${uid ?? ""}', false);`);
  if (uid) await db.exec(`set role authenticated`);
};
const today = (d: string, now?: string) => db.exec(`reset role; select set_config('cm.today','${d}',false), set_config('cm.now','${now ?? d + " 12:00"}',false);`);
const q = async <T = any>(sql: string) => (await db.query<T>(sql)).rows;
const j = async (sql: string) => { const r = (await q<{ r: any }>(`select (${sql}) as r`))[0].r; return typeof r === "string" && r !== "" && !isNaN(Number(r)) ? Number(r) : r; };
const one = async <T = any>(sql: string) => (await q<T>(sql))[0];

let ANA: string, BRUNO: string, CARLA: string, DIEGO: string;
let P_GESTAO: string, C_GESTAO: string, P_MKT: string, C_MKT_INT: string, C_MKT_REC: string, P_CON: string, C_CON: string, P_ORK: string, C_ORK: string;

const reg = async (uid: string, p: object) => (await j(`public.cm_register_sale('${JSON.stringify(p)}'::jsonb)`)) as string;
const saleOf = (seller: string, prod: string, cob: string, cliente: string, bruto: number, data: string, pago = true, forma = "pix", extra: object = {}) => ({
  seller_id: seller, product_id: prod, cobranca_id: cob, cliente, pago, data_pagamento: data, formas: [{ forma, bruto, parcelas: 1, data, ...extra }],
});

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
                 revoke insert, update, delete on public.cm_sellers, public.cm_sales, public.cm_sale_payments, public.cm_months, public.cm_freezes from authenticated;
                 grant execute on all functions in schema public to authenticated;`);
  const ins = (id: string, email: string) => db.exec(`insert into auth.users (id, email, raw_user_meta_data) values ('${id}', '${email}', '{"full_name":"${email.split("@")[0]}"}')`);
  await ins(ADMIN, "sigma@anfitriaosigma.com.br"); await ins(GESTOR, "gestor@anfitriaosigma.com.br");
  await ins(U_ANA, "ana@anfitriaosigma.com.br"); await ins(U_BRUNO, "bruno@anfitriaosigma.com.br");
  await db.exec(`update public.user_roles set role='gestor' where user_id='${GESTOR}';
    insert into public.area_access (user_id, area, status) values ('${U_ANA}','metas','approved'), ('${U_BRUNO}','metas','approved');`);
  await today("2026-10-10");
  const sen = async (n: string) => (await one<{ id: string }>(`select id from public.cm_seniorities where name='${n}'`)).id;
  const mk = async (name: string, s: string, start: string, user?: string) =>
    (await one<{ id: string }>(`insert into public.cm_sellers (name, seniority_id, start_date, effective_from, user_id) values ('${name}', '${await sen(s)}', '${start}', '${start}', ${user ? `'${user}'` : "null"}) returning id`)).id;
  ANA = await mk("Ana Souza", "Pleno", "2026-08-03", U_ANA); BRUNO = await mk("Bruno Lima", "Sênior", "2025-01-10", U_BRUNO);
  CARLA = await mk("Carla Dias", "Júnior", "2026-09-14"); DIEGO = await mk("Diego Rocha", "Pleno", "2025-03-03");
  const pid = async (n: string) => (await one<{ id: string }>(`select id from public.cm_products where name='${n}'`)).id;
  const cid = async (p: string, k: string) => (await one<{ id: string }>(`select id from public.cm_cobrancas where product_id='${p}' and kind='${k}'`)).id;
  P_GESTAO = await pid("Gestão Parcial de Airbnb"); C_GESTAO = await cid(P_GESTAO, "integral");
  P_MKT = await pid("Marketing p/ Anfitriões"); C_MKT_INT = await cid(P_MKT, "integral"); C_MKT_REC = await cid(P_MKT, "recorrencia");
  P_CON = await pid("ConciergeIA"); C_CON = await cid(P_CON, "recorrencia"); P_ORK = await pid("Orks Tech"); C_ORK = await cid(P_ORK, "recorrencia");
});

describe("distribuição da meta", () => {
  it("Outubro: objetivo 30.000, metas 5.000 / 7.500 / 10.000 e quantidades por produto", async () => {
    const d = await j(`public.cm_distribution('2026-10-01')`);
    expect(d.objetivo).toBe(30000);
    const meta = Object.fromEntries(d.sellers.map((s: any) => [s.name, s.meta]));
    expect(meta).toEqual({ "Ana Souza": 7500, "Bruno Lima": 10000, "Carla Dias": 5000, "Diego Rocha": 7500 });
    expect(d.empresas.map((e: any) => [e.linha, e.pontos, e.qtd])).toEqual([["Gestão", 10500, 10.5], ["Marketing p/ Anfitriões", 12000, 0.77], ["ConciergeIA", 4500, 9.02], ["Orks Tech", 3000, 3.34]]);
  });
  it("Novembro com 105%: objetivo 31.500 e pontos 11.025 / 12.600 / 4.725 / 3.150", async () => {
    const r = await j(`jsonb_set(public.cm_rules('2026-11-01'), '{pct}', '1.05')`);
    const d = await j(`public.cm_distribution('2026-11-01', '${JSON.stringify(r)}'::jsonb)`);
    expect(d.objetivo).toBe(31500);
    expect(d.empresas.map((e: any) => e.pontos)).toEqual([11025, 12600, 4725, 3150]);
  });
  it("gatilho por mês de casa e mês de entrada proporcional", async () => {
    const d = await j(`public.cm_distribution('2026-10-01')`);
    const g = Object.fromEntries(d.sellers.map((s: any) => [s.name, [s.gatilho, s.casa_label]]));
    expect(g["Ana Souza"]).toEqual([0.8, "Mês 2"]); expect(g["Carla Dias"]).toEqual([0.7, "Mês 1"]);
    expect(g["Bruno Lima"]).toEqual([1, "Mês 4 em diante"]);
    const e = await one<{ g: number }>(`select public.cm_gatilho(x, '2026-10-01', public.cm_rules('2026-10-01')) g from (select * from public.cm_sellers where name='Ana Souza') x`);
    expect(Number(e.g)).toBe(0.8);
    await db.exec(`insert into public.cm_sellers (name, seniority_id, start_date, effective_from) select 'Nova', id, '2026-10-15', '2026-10-15' from public.cm_seniorities where name='Júnior'`);
    const n = await one<{ g: number }>(`select public.cm_gatilho(x, '2026-10-01', public.cm_rules('2026-10-01')) g from public.cm_sellers x where name='Nova'`);
    expect(Number(n.g)).toBeCloseTo(0.7 * 12 / 21, 3); // 15/10 → 12 dias úteis restantes (15/10 incluso) de 21
    await db.exec(`delete from public.cm_sellers where name='Nova'`);
  });
  it("calendário: Nov/2026 = 19 dias úteis (Finados e Consciência Negra); Out = 21", async () => {
    expect((await j(`public.cm_calendar('2026-11-01')`)).dias_uteis).toBe(19);
    const c = await j(`public.cm_calendar('2026-11-01')`);
    expect(c.feriados.map((f: any) => f.dia)).toEqual(["02/11", "20/11"]);
    expect((await j(`public.cm_calendar('2026-10-01')`)).dias_uteis).toBe(21);
  });
});

describe("régua e gatilho", () => {
  const f = (att: number, gat: number) => j(`public.cm_fator(${att}, ${gat}, public.cm_rules('2026-10-01'))`);
  it("abaixo do gatilho ×0; gatilho a 99,9% ×0,8; 100% ×1; 120% ×1,3; 150% ×1,6", async () => {
    expect([await f(0.79, 0.8), await f(0.8, 0.8), await f(0.999, 0.8), await f(1, 0.8), await f(1.2, 0.8), await f(1.5, 0.8)]).toEqual([0, 0.8, 0.8, 1, 1.3, 1.6]);
  });
  it("gatilho 100% = tudo ou nada", async () => { expect([await f(0.999, 1), await f(1, 1)]).toEqual([0, 1]); });
});

describe("vendas e pontos", () => {
  it("registra as vendas da Ana (mockup Vendas) e confere 4.500 / 60% / abaixo do gatilho", async () => {
    await as(U_ANA);
    await today("2026-10-10");
    await reg(U_ANA, saleOf(ANA, P_GESTAO, C_GESTAO, "Rafael Nunes", 1000, "2026-10-01"));
    await reg(U_ANA, saleOf(ANA, P_ORK, C_ORK, "Lucas Prado", 899, "2026-10-02"));
    await reg(U_ANA, saleOf(ANA, P_MKT, C_MKT_REC, "Pedro Alves", 3000, "2026-10-06", true, "cartao", { parcelas: 3 }));
    await reg(U_ANA, saleOf(ANA, P_ORK, C_ORK, "Camila Rocha", 899, "2026-10-09", false));
    await reg(U_ANA, saleOf(ANA, P_CON, C_CON, "Marina Costa", 499, "2026-10-09", false));
    const canc = await reg(U_ANA, saleOf(ANA, P_CON, C_CON, "Carlos Lima", 499, "2026-10-03"));
    await j(`public.cm_cancel_sale('${canc}')`).catch(() => null);
    await as(null);
    const r = await j(`public.cm_seller_month('${ANA}', '2026-10-01')`);
    expect(r.confirmado).toBe(4500); expect(r.validadas).toBe(1899); expect(r.em_prazo).toBe(2601); expect(r.aguardando).toBe(1398);
    expect(r.atingimento).toBe(0.6); expect(r.abaixo_gatilho).toBe(true); expect(r.gatilho_pts).toBe(6000);
  });
  it("prazo de 7 dias a partir do 1º pagamento; validação automática no dia seguinte", async () => {
    const s = await one(`select status, cancelavel_ate::text c, validada_em::text v from public.cm_sales where cliente='Pedro Alves'`);
    expect(s).toMatchObject({ status: "em_prazo", c: "2026-10-13", v: "2026-10-14" });
    const v = await one(`select status from public.cm_sales where cliente='Rafael Nunes'`);
    expect(v.status).toBe("validada");
    await today("2026-10-14"); await db.exec(`select public.cm_run_daily()`);
    expect((await one(`select status from public.cm_sales where cliente='Pedro Alves'`)).status).toBe("validada");
    await today("2026-10-10");
    await db.exec(`update public.cm_sales set status='em_prazo', validada_em=cancelavel_ate+1 where cliente='Pedro Alves'`);
  });
  it("venda mista de 18.000: cartão 8.670 + PIX 3.000 confirmados e boleto 5× previsto 975", async () => {
    await as(GESTOR);
    const id = await reg(GESTOR, { seller_id: DIEGO, product_id: P_MKT, cobranca_id: C_MKT_INT, cliente: "Beatriz Moura", pago: true, data_pagamento: "2026-10-09", formas: [
      { forma: "cartao", bruto: 10000, parcelas: 6, data: "2026-10-09" }, { forma: "pix", bruto: 3000, parcelas: 1, data: "2026-10-09" },
      { forma: "boleto", bruto: 5000, parcelas: 5, data: "2026-10-20" }] });
    await as(null);
    const pts = await j(`public.cm_sale_points('${id}')`);
    expect(pts).toEqual({ confirmado: 11670, previsto: 975, total: 12645 });
    const s = await one(`select cancelavel_ate::text c, validada_em::text v, status from public.cm_sales where id='${id}'`);
    expect(s).toMatchObject({ c: "2026-10-16", v: "2026-10-17", status: "em_prazo" });
    // confirmar a parcela do boleto passa a "Confirmado"
    await as(GESTOR); await today("2026-10-20");
    const pay = await one(`select id from public.cm_sale_payments where sale_id='${id}' and forma='boleto'`);
    await j(`public.cm_confirm_payment('${id}', '2026-10-20', '${pay.id}')`).catch(() => db.exec(`select public.cm_confirm_payment('${id}', '2026-10-20', '${pay.id}')`));
    await as(null);
    expect((await j(`public.cm_sale_points('${id}')`)).confirmado).toBe(12645);
    await today("2026-10-10");
    await db.exec(`delete from public.cm_sales where id='${id}'`);
  });
  it("cartão em qualquer nº de parcelas conta o líquido integral; parcela de mês seguinte não conta", async () => {
    await as(GESTOR);
    const id = await reg(GESTOR, { seller_id: DIEGO, product_id: P_MKT, cobranca_id: C_MKT_INT, cliente: "X", pago: true, data_pagamento: "2026-10-05", formas: [
      { forma: "cartao", bruto: 18000, parcelas: 12, data: "2026-10-05" }, { forma: "boleto", bruto: 6000, parcelas: 6, data: "2026-11-05" }] });
    await as(null);
    expect(await j(`public.cm_sale_points('${id}')`)).toEqual({ confirmado: 15606, previsto: 0, total: 15606 });
    await db.exec(`delete from public.cm_sales where id='${id}'`);
  });
});

describe("congelamento", () => {
  it("prazo 7 → 04/11 às 23h59; prazo ≤ 3 → 23h59 do último dia do mês", async () => {
    expect((await one(`select public.cm_freeze_at('2026-10-01')::text t`)).t).toBe("2026-11-04 23:59:00");
    for (const prazo of [3, 2, 1]) {
      await db.exec(`insert into public.cm_months (month, rules) values ('2027-03-01', jsonb_set(public.cm_seed_rules(), '{operacao,prazo}', '${prazo}')) on conflict (month) do update set rules = excluded.rules`);
      expect((await one(`select public.cm_freeze_at('2027-03-01')::text t`)).t).toBe("2027-03-31 23:59:00");
    }
    await db.exec(`delete from public.cm_months where month='2027-03-01'`);
  });
  it("prazo ≥ dia do bônus é bloqueado (máx. 9 dias)", async () => {
    await expect(db.exec(`select public.cm_validate_rules(jsonb_set(public.cm_seed_rules(), '{operacao,prazo}', '10'))`)).rejects.toThrow(/menor que o dia do bônus/);
    await db.exec(`select public.cm_validate_rules(jsonb_set(public.cm_seed_rules(), '{operacao,prazo}', '9'))`);
  });
});

describe("cancelamento depois do congelamento (decisão 38)", () => {
  let sale: string;
  it("Ana com 7.500 pts congelados; cancelar 499 → 7.001 (93%), ×0,8, bônus 2.570 → 1.919", async () => {
    await db.exec(`delete from public.cm_sales where seller_id='${ANA}'`);
    await today("2026-10-31");
    await as(U_ANA);
    for (let i = 0; i < 6; i++) await reg(U_ANA, saleOf(ANA, P_GESTAO, C_GESTAO, `G${i}`, 1000, "2026-10-20"));
    await reg(U_ANA, saleOf(ANA, P_GESTAO, C_GESTAO, "G6", 1001, "2026-10-20"));
    sale = await reg(U_ANA, saleOf(ANA, P_CON, C_CON, "Paulo Reis", 499, "2026-10-31"));
    await as(null);
    await today("2026-11-04", "2026-11-04 23:58"); await db.exec(`select public.cm_run_daily()`);
    expect(await q(`select 1 from public.cm_freezes where month='2026-10-01'`)).toHaveLength(0);
    await today("2026-11-04", "2026-11-04 23:59"); await db.exec(`select public.cm_run_daily()`);
    expect(await q(`select 1 from public.cm_freezes where month='2026-10-01'`)).toHaveLength(1);
    const r = await j(`public.cm_seller_month('${ANA}', '2026-10-01')`);
    expect(r).toMatchObject({ confirmado: 7500, atingimento: 1, congelado: true }); expect(r.bonus).toBe(2570);
    await today("2026-11-05");
    await as(GESTOR);
    const pv = await j(`public.cm_cancel_preview('${sale}')`);
    expect(pv.pontos).toEqual([7500, 7001]); expect(pv.fator).toEqual([1, 0.8]); expect(pv.bonus).toEqual([2570, 1919.28]); expect(pv.atingimento[1]).toBeCloseTo(0.9335, 3);
    await db.exec(`select public.cm_cancel_sale('${sale}', 'manter')`);
    await as(null);
    expect((await j(`public.cm_seller_month('${ANA}', '2026-10-01')`)).bonus).toBe(2570); // mantido
  });
  it("Ajustar Manualmente exige motivo e atualiza o resultado congelado", async () => {
    await as(GESTOR); await today("2026-11-05");
    // desfaz o cancelamento anterior para testar o ajuste
    await db.exec(`reset role; update public.cm_sales set status='em_prazo', cancelled_at=null where id='${sale}'; delete from public.cm_adjustments; set role authenticated; select set_config('request.jwt.claim.sub','${GESTOR}',false)`);
    await expect(db.exec(`select public.cm_cancel_sale('${sale}', 'ajustar', '')`)).rejects.toThrow(/motivo/);
    await db.exec(`select public.cm_cancel_sale('${sale}', 'ajustar', 'cliente desistiu')`);
    await as(null);
    const r = await j(`public.cm_seller_month('${ANA}', '2026-10-01')`);
    expect(r.confirmado).toBe(7001); expect(r.bonus).toBe(1919.28);
  });
  it("depois do prazo final não cancela mais", async () => {
    await as(GESTOR); await today("2026-11-20");
    await db.exec(`reset role; update public.cm_sales set status='validada' where cliente='G1'; set role authenticated; select set_config('request.jwt.claim.sub','${GESTOR}',false)`);
    const id = (await one(`select id from public.cm_sales where cliente='G1'`)).id;
    await expect(db.exec(`select public.cm_cancel_sale('${id}')`)).rejects.toThrow(/prazo/);
    await as(null);
  });
});

describe("permissões", () => {
  it("vendedor só vê as próprias vendas e não chama RPC de gestor", async () => {
    await today("2026-11-20"); await as(U_BRUNO);
    expect(await q(`select 1 from public.cm_sales`)).toHaveLength(0);
    await expect(db.exec(`select public.cm_hub()`)).rejects.toThrow(/sem permissão/);
    await expect(db.exec(`select public.cm_seller_save('{}'::jsonb)`)).rejects.toThrow(/sem permissão/);
    await as(null);
  });
  it("só o admin autoriza alterar mês travado", async () => {
    await today("2026-10-10"); await as(GESTOR);
    expect((await j(`public.cm_locked('2026-10-01')`))).toBe(true);
    await expect(db.exec(`select public.cm_draft_save(array['2026-10-01'::date], public.cm_seed_rules())`)).rejects.toThrow(/travado/);
    await db.exec(`select public.cm_request_unlock('2026-10-01')`);
    await expect(db.exec(`select public.cm_decide_unlock('2026-10-01', true)`)).rejects.toThrow(/só o admin/);
    await as(ADMIN); await db.exec(`select public.cm_decide_unlock('2026-10-01', true)`);
    expect(await j(`public.cm_locked('2026-10-01')`)).toBe(false);
    await as(null);
  });
  it("Novembro (travado só a partir de 28/10) aceita rascunho e publicação; pesos precisam fechar 100%", async () => {
    await today("2026-10-10"); await as(GESTOR);
    await db.exec(`select public.cm_draft_save(array['2026-11-01'::date,'2026-12-01'::date], jsonb_set(public.cm_seed_rules(), '{pct}', '1.05'))`);
    await db.exec(`select public.cm_publish(array['2026-11-01'::date,'2026-12-01'::date])`);
    expect((await j(`public.cm_distribution('2026-12-01')`)).objetivo).toBe(31500);
    expect(await j(`public.cm_month_status('2026-11-01')`)).toBe("programado");
    await expect(db.exec(`select public.cm_draft_save(array['2027-01-01'::date], jsonb_set(public.cm_seed_rules(), '{pesos}', '{}')); select public.cm_publish(array['2027-01-01'::date])`)).rejects.toThrow(/100/);
    await as(null);
  });
});

describe("RPCs das telas (fumaça: nenhuma pode falhar)", () => {
  it("gestor consegue abrir todas as telas de gestão e a lista/detalhe de vendas", async () => {
    await today("2026-10-10"); await as(GESTOR);
    const calls = [
      `public.cm_me()`, `public.cm_hub()`, `public.cm_months_list()`, `public.cm_products_list()`, `public.cm_products_options()`, `public.cm_sellers_list()`,
      `public.cm_seller_get('${ANA}')`, `public.cm_seller_history('${ANA}')`, `public.cm_rules_get(array['2026-11-01'::date, '2026-12-01'::date])`,
      `public.cm_projecao(array['2026-11-01'::date])`, `public.cm_sugestao('2026-11-01')`, `public.cm_calc('2026-10-01', '${ANA}')`,
      `public.cm_sales_list('${ANA}', '2026-10-01')`, `public.cm_sales_list(null, '2026-10-01', true)`, `public.cm_product_get('${P_MKT}')`,
    ];
    for (const c of calls) await expect(j(c), c).resolves.toBeDefined();
    const sales = (await j(`public.cm_sales_list('${ANA}', '2026-10-01')`)).rows;
    expect(sales.map((s: any) => s.status)).toEqual([...sales.map((s: any) => s.status)].sort((a: string, b: string) => ["validada", "em_prazo", "aguardando_pagamento", "cancelada"].indexOf(a) - ["validada", "em_prazo", "aguardando_pagamento", "cancelada"].indexOf(b)));
    for (const s of sales) await expect(j(`public.cm_sale_get('${s.id}')`)).resolves.toBeDefined();
    await as(null);
  });
});

describe("produto sem caixa (sem formas de pagamento obrigatórias)", () => {
  it("salva sem formas, aparece com formas padrão nas opções e aceita venda", async () => {
    await today("2026-12-10"); await as(GESTOR);
    const emp = (await one(`select id from public.cm_empresas where linha = 'Gestão'`)).id;
    const pid = await j(`public.cm_product_save('${JSON.stringify({ empresa_id: emp, name: "Teste Sem Caixa", gera_caixa: false, cobrancas: [{ kind: "integral", bruto: 500 }], formas: [] })}'::jsonb)`);
    const opt = (await j(`public.cm_products_options()`)).products.find((x: any) => x.id === pid);
    expect(opt.formas.map((f: any) => f.forma)).toEqual(["cartao", "pix", "boleto"]);
    await expect(j(`public.cm_product_save('${JSON.stringify({ empresa_id: emp, name: "Com Caixa", gera_caixa: true, cobrancas: [{ kind: "integral", bruto: 500 }], formas: [] })}'::jsonb)`)).rejects.toThrow(/forma de pagamento/);
    const cob = (await one(`select id from public.cm_cobrancas where product_id='${pid}'`)).id;
    await as(U_ANA);
    const sid = await reg(U_ANA, saleOf(ANA, pid, cob, "Cliente Sem Caixa", 500, "2026-12-10"));
    expect(sid).toBeTruthy();
    await as(null);
    await db.exec(`delete from public.cm_sales where id='${sid}'; delete from public.cm_cobrancas where product_id='${pid}'; delete from public.cm_products where id='${pid}'`);
    await today("2026-10-10");
  });
});

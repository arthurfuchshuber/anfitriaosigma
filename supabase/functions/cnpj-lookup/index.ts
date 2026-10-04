// Consulta a situação cadastral de um CNPJ na Receita Federal (via BrasilAPI, com reserva na CNPJ.ws).
// Exige usuário logado (verify_jwt padrão do Supabase). Não guarda nada: só repassa o resultado.
// Resposta: { valid, found, active, status, razao_social, nome_fantasia, cnae, abertura, simples } ou { unavailable: true }.
import { createClient } from "npm:@supabase/supabase-js@2";

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...CORS, "Content-Type": "application/json" } });

const validCNPJ = (d: string) => {
  if (d.length !== 14 || /^(\d)\1{13}$/.test(d)) return false;
  const dv = (n: number) => {
    const w = n === 12 ? [5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2] : [6, 5, 4, 3, 2, 9, 8, 7, 6, 5, 4, 3, 2];
    let t = 0; for (let i = 0; i < n; i++) t += Number(d[i]) * w[i];
    const r = t % 11; return r < 2 ? 0 : 11 - r;
  };
  return dv(12) === Number(d[12]) && dv(13) === Number(d[13]);
};

const timeout = (ms: number) => AbortSignal.timeout(ms);

async function brasilApi(d: string) {
  const r = await fetch(`https://brasilapi.com.br/api/cnpj/v1/${d}`, { signal: timeout(7000), headers: { Accept: "application/json" } });
  if (r.status === 404) return { found: false as const };
  if (!r.ok) throw new Error(`brasilapi ${r.status}`);
  const j = await r.json();
  const status = String(j.descricao_situacao_cadastral ?? "").toUpperCase();
  return {
    found: true as const, status, active: status === "ATIVA", razao_social: j.razao_social ?? "", nome_fantasia: j.nome_fantasia ?? "",
    cnae: j.cnae_fiscal ? `${j.cnae_fiscal} · ${j.cnae_fiscal_descricao ?? ""}` : "", abertura: j.data_inicio_atividade ?? "", simples: j.opcao_pelo_simples ?? null,
  };
}

async function cnpjWs(d: string) {
  const r = await fetch(`https://publica.cnpj.ws/cnpj/${d}`, { signal: timeout(7000), headers: { Accept: "application/json" } });
  if (r.status === 404) return { found: false as const };
  if (!r.ok) throw new Error(`cnpjws ${r.status}`);
  const j = await r.json();
  const e = j.estabelecimento ?? {};
  const status = String(e.situacao_cadastral ?? "").toUpperCase();
  return {
    found: true as const, status, active: status === "ATIVA", razao_social: j.razao_social ?? "", nome_fantasia: e.nome_fantasia ?? "",
    cnae: e.atividade_principal ? `${e.atividade_principal.id} · ${e.atividade_principal.descricao}` : "", abertura: e.data_inicio_atividade ?? "",
    simples: j.simples?.simples === "Sim",
  };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: CORS });
  try {
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return json({ error: "não autenticado" }, 401);
    const { cnpj } = await req.json();
    const d = String(cnpj ?? "").replace(/\D/g, "");
    if (!validCNPJ(d)) return json({ valid: false });
    for (const fn of [brasilApi, cnpjWs]) {
      try { return json({ valid: true, ...(await fn(d)) }); } catch { /* tenta a próxima fonte */ }
    }
    return json({ valid: true, unavailable: true });
  } catch (e) {
    return json({ error: String(e) }, 400);
  }
});

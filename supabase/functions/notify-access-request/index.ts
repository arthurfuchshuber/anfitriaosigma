// Envia e-mail ao gestor quando alguém pede acesso a uma área da Intranet.
// Secrets (supabase secrets set ...): RESEND_API_KEY (obrigatório), NOTIFY_TO, MAIL_FROM, SITE_URL
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};
const AREA_NAMES: Record<string, string> = { metas: "Metas e Vendas", operacao: "Operação", financeiro: "Financeiro", treinamento: "Treinamento", comercial: "Comercial" };
const esc = (s: string) => s.replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]!));

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const sb = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await sb.auth.getUser();
    if (!user) return json({ error: "não autenticado" }, 401);
    const { area } = await req.json();
    // só envia se o pedido pendente realmente existe e é recente (evita spam)
    const { data: reqRow } = await sb.from("area_access").select("requested_at,status").eq("user_id", user.id).eq("area", area).maybeSingle();
    if (!reqRow || reqRow.status !== "pending" || Date.now() - new Date(reqRow.requested_at).getTime() > 5 * 60_000) return json({ sent: false, reason: "sem pedido recente" });
    const { data: prof } = await sb.from("profiles").select("full_name,nickname,email").eq("id", user.id).maybeSingle();

    const key = Deno.env.get("RESEND_API_KEY");
    if (!key) return json({ sent: false, reason: "RESEND_API_KEY ausente" }, 500);
    const site = Deno.env.get("SITE_URL") ?? "https://anfitriaosigma.com.br";
    const name = prof?.full_name ?? prof?.email ?? user.email ?? "";
    const areaName = AREA_NAMES[area] ?? area;
    const link = `${site}/intranet/metas/pessoas?tab=solicitacoes`;
    const html = `<div style="font-family:Arial,sans-serif;max-width:520px;margin:auto;color:#120A1C">
      <h2 style="color:#431171;margin:0 0 12px">Pedido de acesso — ${esc(areaName)}</h2>
      <p><b>${esc(name)}</b> (${esc(prof?.email ?? user.email ?? "")}) pediu acesso à área <b>${esc(areaName)}</b> da Intranet.</p>
      <p>Aprove ou negue na Intranet:</p>
      <p><a href="${link}" style="background:#431171;color:#fff;text-decoration:none;padding:12px 22px;border-radius:999px;display:inline-block;font-weight:600">Revisar pedido</a></p>
      <p style="color:#8C849C;font-size:12px">Anfitrião Sigma · Intranet</p></div>`;
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: Deno.env.get("MAIL_FROM") ?? "Intranet Anfitrião Sigma <onboarding@resend.dev>",
        to: [Deno.env.get("NOTIFY_TO") ?? "sigma@anfitriaosigma.com.br"],
        reply_to: prof?.email ?? user.email,
        subject: `Pedido de acesso: ${name} → ${areaName}`,
        html,
      }),
    });
    if (!r.ok) return json({ sent: false, reason: await r.text() }, 502);
    return json({ sent: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

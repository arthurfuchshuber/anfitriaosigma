// Registra eventos de interface no log imutável com local aproximado (IP/cidade/país) e dispositivo.
import { createClient } from "npm:@supabase/supabase-js@2";

const cors = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: cors });
  const json = (b: unknown, status = 200) => new Response(JSON.stringify(b), { status, headers: { ...cors, "Content-Type": "application/json" } });
  try {
    const anon = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_ANON_KEY")!, {
      global: { headers: { Authorization: req.headers.get("Authorization") ?? "" } },
    });
    const { data: { user } } = await anon.auth.getUser();
    if (!user) return json({ error: "não autenticado" }, 401);
    const { action, detail, device } = await req.json();

    const ip = (req.headers.get("x-forwarded-for") ?? "").split(",")[0].trim();
    const city = req.headers.get("cf-ipcity");
    const country = req.headers.get("cf-ipcountry");
    const location = [city && decodeURIComponent(city), country, ip && `IP ${ip}`].filter(Boolean).join(" · ") || "não identificado";

    const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const [{ data: p }, { data: r }] = await Promise.all([
      admin.from("profiles").select("full_name,nickname,email").eq("id", user.id).maybeSingle(),
      admin.from("user_roles").select("role").eq("user_id", user.id).maybeSingle(),
    ]);
    const { error } = await admin.from("audit_log").insert({
      actor_id: user.id, actor_name: p?.nickname ?? p?.full_name ?? p?.email, actor_role: r?.role,
      action: String(action).slice(0, 80), entity: "ui", detail: detail ? String(detail).slice(0, 500) : null,
      location, device: device ? String(device).slice(0, 300) : null,
    });
    if (error) return json({ error: error.message }, 500);
    return json({ ok: true });
  } catch (e) {
    return json({ error: String(e) }, 500);
  }
});

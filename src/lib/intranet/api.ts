import { supabase } from "@/integrations/supabase/client";
import { addMonths } from "./format";
import type { AuditRow, Invoice, MonthRow, Notice, Product, ProductVersion, Profile, Sale } from "./types";

const ok = <T,>({ data, error }: { data: T; error: { message: string } | null }): T => {
  if (error) throw new Error(error.message);
  return data;
};
const rpc = async <T = unknown,>(fn: string, args?: Record<string, unknown>) => ok(await supabase.rpc(fn, args) as { data: T; error: { message: string } | null });

/** Registra evento no log imutável. Usa a edge function (local aproximado por IP); cai para RPC se indisponível. */
export async function logEvent(action: string, detail?: string) {
  const device = typeof navigator !== "undefined" ? navigator.userAgent : "";
  try {
    const { error } = await supabase.functions.invoke("log-event", { body: { action, detail, device } });
    if (error) throw error;
  } catch {
    try { await supabase.rpc("log_event", { p_action: action, p_detail: detail ?? null, p_location: null, p_device: device }); } catch { /* log é best-effort no cliente */ }
  }
}

// ---------- acesso ----------
export async function requestAccess(area: string) {
  const status = await rpc<string>("request_access", { p_area: area });
  if (status === "pending") {
    // e-mail ao gestor (falha no envio não desfaz o pedido — fica visível em Pessoas → Solicitações)
    await supabase.functions.invoke("notify-access-request", { body: { area } }).catch(() => undefined);
  }
  return status;
}
export const decideAccess = (user: string, area: string, approve: boolean, note?: string) =>
  rpc("decide_access", { p_user: user, p_area: area, p_approve: approve, p_note: note ?? null });
export const listAccessRequests = async () =>
  ok(await supabase.from("area_access").select("*, profiles:user_id(full_name, nickname, email)").order("requested_at", { ascending: false }));

// ---------- catálogo ----------
export const listProducts = async () => {
  const [p, v] = await Promise.all([supabase.from("products").select("*").order("sort"), supabase.from("product_versions").select("*").order("valid_from", { ascending: false })]);
  const products = ok(p) as Product[]; const versions = ok(v) as ProductVersion[];
  const now = new Date().toISOString().slice(0, 10);
  return products.map((pr) => {
    const vs = versions.filter((x) => x.product_id === pr.id);
    const cur = vs.find((x) => x.valid_from <= now) ?? vs[vs.length - 1];
    const next = vs.find((x) => x.valid_from > now);
    return { ...pr, version: cur, next };
  });
};
export type ProductRow = Awaited<ReturnType<typeof listProducts>>[number];
export const saveProductVersion = (p: string, points: number, min: number, caixa: number, when: "now" | "next") =>
  rpc("set_product_version", { p_product: p, p_points: points, p_min: min, p_caixa: caixa, p_when: when });

export const getParams = async () => {
  const rows = ok(await supabase.from("params").select("*").order("valid_from", { ascending: false })) as { key: string; value: number; valid_from: string }[];
  const out: Record<string, number> = {};
  for (const r of rows) if (!(r.key in out) && r.valid_from <= new Date().toISOString().slice(0, 10)) out[r.key] = Number(r.value);
  return out;
};
export const saveParam = async (key: string, value: number, validFrom: string) =>
  ok(await supabase.from("params").upsert({ key, value, valid_from: validFrom }));

// ---------- vendas ----------
export interface NewSale { client: string; doc: string; date: string; items: { product_id: string; qty: number; value: number }[]; pay: string; installments: number; recurring: boolean; notes: string }
export const checkDuplicate = (doc: string, total: number, date: string) => rpc<string | null>("check_duplicate", { p_doc: doc, p_total: total, p_date: date });
export const registerSale = (s: NewSale) =>
  rpc<{ id: string; duplicate: boolean; needs_approval: boolean }>("register_sale", { p_client: s.client, p_doc: s.doc, p_date: s.date, p_items: s.items, p_pay: s.pay, p_installments: s.installments, p_recurring: s.recurring, p_notes: s.notes });
export const cancelSale = (id: string, reason: string) => rpc("cancel_sale", { p_id: id, p_reason: reason });
export const decideFloor = (id: string, approve: boolean) => rpc("decide_floor", { p_id: id, p_approve: approve });
export const setItemQty = (item: string, qty: number) => rpc("set_item_qty", { p_item: item, p_qty: qty });
export const runValidation = () => rpc<number>("run_validation");

export const listSales = async (opts: { month?: string; seller?: string; status?: string } = {}) => {
  let q = supabase.from("sales").select("*, sale_items(*), profiles:seller_id(full_name, nickname)").order("sale_date", { ascending: false }).order("created_at", { ascending: false });
  if (opts.month) q = q.gte("sale_date", opts.month).lt("sale_date", addMonths(opts.month, 1));
  if (opts.seller) q = q.eq("seller_id", opts.seller);
  if (opts.status) q = q.eq("status", opts.status);
  return ok(await q) as unknown as Sale[];
};
export const getSale = async (id: string) =>
  ok(await supabase.from("sales").select("*, sale_items(*), profiles:seller_id(full_name, nickname)").eq("id", id).single()) as unknown as Sale;

// ---------- metas ----------
export const monthSummary = (month: string) => rpc<MonthRow[]>("month_summary", { p_month: month });
export const teamAverage = async (month: string) => (await rpc<{ n: number; avg_attainment: number | null }[]>("team_average", { p_month: month }))[0];
export const setMetaScale = (user: string, scale: number, when: "now" | "next", reason: string) => rpc("set_meta_scale", { p_user: user, p_scale: scale, p_when: when, p_reason: reason });
export const setMultiplier = (month: string, value: number) => rpc("set_multiplier", { p_month: month, p_value: value });
export const confirmGoalLock = (month: string) => rpc("confirm_goal_lock", { p_month: month });
export const closeMonth = (month: string) => rpc("close_month", { p_month: month });
export const getGoalLocks = async () => ok(await supabase.from("goal_locks").select("month")) as { month: string }[];
export const getClosures = async () => ok(await supabase.from("month_closures").select("month")) as { month: string }[];
export const getFixedMultipliers = async () => ok(await supabase.from("multiplier_fixed").select("*").order("month")) as { month: string; value: number }[];
export const getMultiplier = async (month: string) => {
  const rows = await monthSummary(month).catch(() => []);
  return rows[0]?.multiplier ?? null;
};

// ---------- pessoas ----------
export const listProfiles = async () => {
  const [p, r, s] = await Promise.all([
    supabase.from("profiles").select("*").order("full_name"),
    supabase.from("user_roles").select("*"),
    supabase.from("salary_history").select("*").order("valid_from", { ascending: false }),
  ]);
  const roles = new Map((ok(r) as { user_id: string; role: string }[]).map((x) => [x.user_id, x.role]));
  const sal = ok(s) as { user_id: string; amount: number; valid_from: string }[];
  const today = new Date().toISOString().slice(0, 10);
  return (ok(p) as Profile[]).map((x) => ({ ...x, role: (roles.get(x.id) ?? "closer") as "closer" | "gestor" | "admin", salary: sal.find((y) => y.user_id === x.id && y.valid_from <= today)?.amount ?? null }));
};
export type PersonRow = Awaited<ReturnType<typeof listProfiles>>[number];
export const updateProfile = async (id: string, patch: Partial<Profile>) => ok(await supabase.from("profiles").update(patch).eq("id", id));
export const updateMyProfile = (p: Record<string, unknown>) => rpc("update_my_profile", { p });
export const setRole = (user: string, role: string) => rpc("set_role", { p_user: user, p_role: role });
export const addSalary = async (user: string, validFrom: string, amount: number) =>
  ok(await supabase.from("salary_history").upsert({ user_id: user, valid_from: validFrom, amount }, { onConflict: "user_id,valid_from" }));
export const listSalaries = async (user: string) => ok(await supabase.from("salary_history").select("*").eq("user_id", user).order("valid_from", { ascending: false })) as { valid_from: string; amount: number }[];
export const getMySensitive = async (uid: string) => ok(await supabase.from("profile_sensitive").select("*").eq("user_id", uid).maybeSingle()) as Record<string, string | null> | null;
export const saveMySensitive = async (uid: string, v: Record<string, string | null>) =>
  ok(await supabase.from("profile_sensitive").upsert({ user_id: uid, ...Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === "" ? null : x])) }));
export const getMasked = async (uid: string) => (await rpc<Record<string, string | null>[]>("sensitive_masked", { p_user: uid }))[0] ?? null;

// ---------- empresa / nota ----------
export type Company = Record<string, unknown> & { legal_name: string | null; cnpj: string | null; address: string | null; email: string | null; nf_notes: string | null; addr: Record<string, string> };
export const getCompany = async () => ok(await supabase.from("company_info").select("*").eq("id", 1).single()) as Company;
export const saveCompany = async (v: Record<string, unknown>) =>
  ok(await supabase.from("company_info").update(Object.fromEntries(Object.entries(v).map(([k, x]) => [k, x === "" ? null : x]))).eq("id", 1));
export const generateInvoice = (month: string) => rpc<Invoice>("generate_invoice", { p_month: month });
export const getMyInvoice = async (uid: string, month: string) => ok(await supabase.from("invoices").select("*").eq("user_id", uid).eq("month", month).maybeSingle()) as Invoice | null;
export const listInvoices = async (month: string) => ok(await supabase.from("invoices").select("*").eq("month", month)) as Invoice[];
export const setInvoiceStatus = (user: string, month: string, status: string) => rpc("set_invoice_status", { p_user: user, p_month: month, p_status: status });
export async function attachInvoiceFile(uid: string, month: string, file: File) {
  const path = `${uid}/${month}-${file.name.replace(/[^\w.-]/g, "_")}`;
  ok(await supabase.storage.from("invoices").upload(path, file, { upsert: true }));
  await rpc("attach_invoice", { p_month: month, p_path: path });
}
export const invoiceUrl = async (path: string) => (await supabase.storage.from("invoices").createSignedUrl(path, 300)).data?.signedUrl ?? null;
export async function uploadAvatar(uid: string, file: File) {
  const path = `${uid}/avatar-${Date.now()}`;
  ok(await supabase.storage.from("avatars").upload(path, file, { upsert: true }));
  const url = supabase.storage.from("avatars").getPublicUrl(path).data.publicUrl;
  await updateMyProfile({ avatar_url: url });
  return url;
}

// ---------- avisos e log ----------
export const listNotices = async () => ok(await supabase.from("notifications").select("*").is("resolved_at", null).order("created_at", { ascending: false })) as Notice[];
export const resolveNotice = async (id: string) => ok(await supabase.from("notifications").update({ resolved_at: new Date().toISOString() }).eq("id", id));
export const listAudit = async (f: { from?: string; to?: string; actor?: string; action?: string; limit?: number }) => {
  let q = supabase.from("audit_log").select("*").order("at", { ascending: false }).limit(f.limit ?? 500);
  if (f.from) q = q.gte("at", f.from);
  if (f.to) q = q.lte("at", f.to + "T23:59:59");
  if (f.actor) q = q.ilike("actor_name", `%${f.actor}%`);
  if (f.action) q = q.ilike("action", `%${f.action}%`);
  return ok(await q) as AuditRow[];
};

// ---------- gestor: helpers adicionais ----------
export interface MetaOverride { id: string; user_id: string; effective_month: string; scale: number; reason: string | null; created_at: string }
export const listMetaOverrides = async () =>
  ok(await supabase.from("meta_overrides").select("*").order("effective_month", { ascending: false }).order("created_at", { ascending: false })) as MetaOverride[];

/** Cria produto + primeira versão (vigência no 1º dia do mês atual ou do seguinte). */
export async function createProduct(name: string, recurring: boolean, points: number, min: number, caixa: number, when: "now" | "next") {
  const row = ok(await supabase.from("products").insert({ name, recurring, active: true, sort: 99 }).select("id").single()) as { id: string };
  const now = new Date();
  const from = new Date(now.getFullYear(), now.getMonth() + (when === "next" ? 1 : 0), 1);
  const validFrom = `${from.getFullYear()}-${String(from.getMonth() + 1).padStart(2, "0")}-01`;
  ok(await supabase.from("product_versions").insert({ product_id: row.id, valid_from: validFrom, points, min_price: min, caixa_pct: caixa }));
  return row.id;
}
export const setProductActive = async (id: string, active: boolean) => ok(await supabase.from("products").update({ active }).eq("id", id));

export interface Holiday { day: string; name: string }
export const listHolidays = async () => ok(await supabase.from("holidays").select("*").order("day")) as Holiday[];
export const addHoliday = async (day: string, name: string) => ok(await supabase.from("holidays").upsert({ day, name }));
export const removeHoliday = async (day: string) => ok(await supabase.from("holidays").delete().eq("day", day));

export interface AccessRow { id: string; user_id: string; area: string; status: "pending" | "approved" | "denied"; requested_at: string; decided_at: string | null; note: string | null; profiles: { full_name: string | null; nickname: string | null; email: string } | null }
export const listAccessRows = async () => (await listAccessRequests()) as unknown as AccessRow[];

// ---------- closer (helpers adicionais) ----------
export const getProfileName = async (id: string) => {
  const r = ok(await supabase.from("profiles").select("full_name, nickname").eq("id", id).maybeSingle()) as { full_name: string | null; nickname: string | null } | null;
  return r?.full_name ?? r?.nickname ?? null;
};

// ---------- cadastro pendente ----------
export interface PendingState { user: string[]; company: string[] | null; doc_type: "pf" | "pj" }
export const getMyPending = () => rpc<PendingState>("my_pending");
export interface RequiredField { key: string; scope: "company" | "user"; grp: string; label: string; doc_type: "pf" | "pj" | null; required: boolean; since: string; sort: number }
export const listRequiredFields = async () => ok(await supabase.from("required_fields").select("*").order("sort")) as RequiredField[];
export type RequiredStat = RequiredField & { filled_pct: number };
export const requiredFieldStats = () => rpc<RequiredStat[]>("required_field_stats");
export const setRequiredField = (key: string, required: boolean) => rpc("set_required_field", { p_key: key, p_required: required });
export interface PendingPerson { user_id: string; full_name: string | null; email: string; missing: number; total: number }
export const pendingPeople = () => rpc<PendingPerson[]>("pending_people");
export const remindPending = (user: string) => rpc<number>("remind_pending", { p_user: user });

/** Consulta de CNPJ na Receita Federal (edge function cnpj-lookup). `unavailable` = serviço fora do ar (não bloqueia). */
export interface CnpjInfo { valid: boolean; found?: boolean; active?: boolean; status?: string; razao_social?: string; nome_fantasia?: string; cnae?: string; abertura?: string; simples?: boolean | null; unavailable?: boolean }
const cnpjCache = new Map<string, CnpjInfo>();
export async function lookupCnpj(cnpj: string): Promise<CnpjInfo> {
  const d = cnpj.replace(/\D/g, "");
  const hit = cnpjCache.get(d);
  if (hit) return hit;
  try {
    const { data, error } = await supabase.functions.invoke("cnpj-lookup", { body: { cnpj: d } });
    if (error) throw error;
    const r = data as CnpjInfo;
    if (!r.unavailable) cnpjCache.set(d, r);
    return r;
  } catch {
    return { valid: true, unavailable: true };
  }
}

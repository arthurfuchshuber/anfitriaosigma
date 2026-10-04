import { createClient } from "@supabase/supabase-js";
import { brokeredPreviewStorage } from "./previewAuthStorage";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/** false enquanto as variáveis do Supabase não forem configuradas (a tela de login avisa). */
export const supabaseConfigured = Boolean(url && key);

export const COMPANY_DOMAIN = "anfitriaosigma.com.br";

const isNewKey = (v: string) => v.startsWith("sb_publishable_") || v.startsWith("sb_secret_");

const makeFetch = (k: string): typeof fetch => (input, init) => {
  const headers = new Headers(typeof Request !== "undefined" && input instanceof Request ? input.headers : undefined);
  if (init?.headers) new Headers(init.headers).forEach((v, n) => headers.set(n, v));
  // chaves novas não são JWT: não enviar como Bearer
  if (isNewKey(k) && headers.get("Authorization") === `Bearer ${k}`) headers.delete("Authorization");
  headers.set("apikey", k);
  return fetch(input, { ...init, headers });
};

export const supabase = createClient(url ?? "https://placeholder.supabase.co", key ?? "placeholder", {
  global: key ? { fetch: makeFetch(key) } : undefined,
  auth: { storage: brokeredPreviewStorage(), persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
});

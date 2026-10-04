import { createClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined;

/** false enquanto as variáveis do Supabase não forem configuradas (a tela de login avisa). */
export const supabaseConfigured = Boolean(url && key);

export const COMPANY_DOMAIN = "anfitriaosigma.com.br";

export const supabase = createClient(url ?? "https://placeholder.supabase.co", key ?? "placeholder", {
  auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true, flowType: "pkce" },
});

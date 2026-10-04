import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Session } from "@supabase/supabase-js";
import { COMPANY_DOMAIN, supabase, supabaseConfigured } from "@/integrations/supabase/client";
import { logEvent } from "@/lib/intranet/api";
import type { AccessStatus, Profile, Role } from "@/lib/intranet/types";

interface AuthCtx {
  loading: boolean;
  session: Session | null;
  profile: Profile | null;
  role: Role;
  isManager: boolean;
  access: Record<string, AccessStatus>;
  domainError: string | null;
  signIn: () => Promise<void>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
}
const Ctx = createContext<AuthCtx | null>(null);

const oauthError = () => {
  if (typeof window === "undefined") return null;
  const p = new URLSearchParams(window.location.search.slice(1) + "&" + window.location.hash.slice(1));
  const d = p.get("error_description");
  return d ? decodeURIComponent(d.replace(/\+/g, " ")) : null;
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [role, setRole] = useState<Role>("closer");
  const [access, setAccess] = useState<Record<string, AccessStatus>>({});
  const [loading, setLoading] = useState(true);
  const [domainError, setDomainError] = useState<string | null>(() => {
    const e = oauthError();
    return e ? "Esta conta não pertence ao domínio da empresa. Entre com seu e-mail @" + COMPANY_DOMAIN + "." : null;
  });

  const load = useCallback(async (s: Session | null) => {
    if (!s) { setProfile(null); setAccess({}); return; }
    const email = (s.user.email ?? "").toLowerCase();
    if (!email.endsWith("@" + COMPANY_DOMAIN)) {
      setDomainError(`Esta conta (${email}) não pertence ao domínio da empresa. Entre com seu e-mail @${COMPANY_DOMAIN}.`);
      await supabase.auth.signOut();
      return;
    }
    const [p, r, a] = await Promise.all([
      supabase.from("profiles").select("*").eq("id", s.user.id).maybeSingle(),
      supabase.from("user_roles").select("role").eq("user_id", s.user.id).maybeSingle(),
      supabase.from("area_access").select("area,status").eq("user_id", s.user.id),
    ]);
    setProfile((p.data as Profile) ?? null);
    setRole(((r.data as { role: Role } | null)?.role ?? "closer") as Role);
    setAccess(Object.fromEntries(((a.data ?? []) as { area: string; status: AccessStatus }[]).map((x) => [x.area, x.status])));
  }, []);

  useEffect(() => {
    if (!supabaseConfigured) { setLoading(false); return; }
    let alive = true;
    supabase.auth.getSession().then(async ({ data }) => {
      if (!alive) return;
      setSession(data.session);
      await load(data.session);
      setLoading(false);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((evt, s) => {
      setSession(s);
      // fora do callback para não travar o cliente do Supabase
      setTimeout(() => { load(s).finally(() => setLoading(false)); if (evt === "SIGNED_IN" && s) logEvent("login", "Entrou na Intranet"); }, 0);
    });
    return () => { alive = false; sub.subscription.unsubscribe(); };
  }, [load]);

  const signIn = useCallback(async () => {
    setDomainError(null);
    await supabase.auth.signInWithOAuth({
      provider: "google",
      options: { redirectTo: `${window.location.origin}/intranet/areas`, queryParams: { hd: COMPANY_DOMAIN, prompt: "select_account" } },
    });
  }, []);

  const signOut = useCallback(async () => {
    await logEvent("logout", "Saiu da Intranet");
    await supabase.auth.signOut();
  }, []);

  const refresh = useCallback(async () => { const { data } = await supabase.auth.getSession(); await load(data.session); }, [load]);

  const value = useMemo<AuthCtx>(() => ({
    loading, session, profile, role, isManager: role === "gestor" || role === "admin", access, domainError, signIn, signOut, refresh,
  }), [loading, session, profile, role, access, domainError, signIn, signOut, refresh]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
};

export const useAuth = () => {
  const c = useContext(Ctx);
  if (!c) throw new Error("useAuth fora do AuthProvider");
  return c;
};

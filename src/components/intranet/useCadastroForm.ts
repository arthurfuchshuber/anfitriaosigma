import { useCallback, useEffect, useMemo, useState } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import {
  getCompany, getMyPending, getMySensitive, listRequiredFields, saveCompany, saveMySensitive, updateMyProfile, type CnpjInfo,
} from "@/lib/intranet/api";
import { loadCompany, loadUser, planSave, validateGroup, type DocType, type GroupDef, type Scope, type Values } from "@/lib/intranet/cadastro";
import type { CnpjState } from "./fields";
import type { FieldCtx } from "./CadastroFields";

export const PENDING_KEY = "ix-pending";

/** Estado do formulário de cadastro (colaborador ou empresa): carrega, edita, valida e grava.
 *  "O que falta" (missing) vem SEMPRE do banco (my_pending) — o front só mostra. */
export function useCadastroForm(scope: Scope, enabled = true) {
  const { profile, refresh } = useAuth();
  const qc = useQueryClient();
  const uid = profile?.id;

  const sens = useQuery({ queryKey: ["ix-sens", uid], queryFn: () => getMySensitive(uid!), enabled: enabled && !!uid && scope === "user", gcTime: 0 });
  const comp = useQuery({ queryKey: ["company"], queryFn: getCompany, enabled: enabled && scope === "company" });
  const pend = useQuery({ queryKey: [PENDING_KEY, uid], queryFn: getMyPending, enabled: !!uid, retry: false });
  const req = useQuery({ queryKey: ["ix-required-fields"], queryFn: listRequiredFields, enabled: !!uid, retry: false });

  const [values, setValues] = useState<Values>({});
  const [doc, setDocState] = useState<DocType>("pf");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [ready, setReady] = useState(false);
  const [cnpj, setCnpj] = useState<{ state: CnpjState; info: CnpjInfo | null }>({ state: "idle", info: null });

  useEffect(() => {
    if (ready || !profile) return;
    if (scope === "user" && sens.data !== undefined) {
      setValues(loadUser(profile, sens.data)); setDocState(sens.data?.doc_type === "pj" ? "pj" : "pf"); setReady(true);
    } else if (scope === "company" && comp.data) {
      setValues(loadCompany(comp.data)); setReady(true);
    }
  }, [ready, profile, scope, sens.data, comp.data]);

  const set = useCallback((patch: Values) => {
    setValues((v) => ({ ...v, ...patch }));
    setErrors((e) => { const n = { ...e }; for (const k of Object.keys(patch)) delete n[k]; return n; });
  }, []);
  const setDoc = useCallback((d: DocType) => { setDocState(d); setErrors({}); }, []);

  const rzKey = scope === "user" ? "u_company_name" : "c_legal_name";
  const tradeKey = scope === "user" ? "u_trade_name" : "c_trade_name";
  const onCnpj = useCallback((_key: string, state: CnpjState, info: CnpjInfo | null) => {
    setCnpj({ state, info });
    if (state === "active" && info?.razao_social) {
      setValues((v) => ({ ...v, [rzKey]: info.razao_social!, [tradeKey]: v[tradeKey] || info.nome_fantasia || "" }));
    }
  }, [rzKey, tradeKey]);

  const missing = useMemo(() => (scope === "user" ? pend.data?.user : pend.data?.company) ?? [], [pend.data, scope]);

  const ctx: FieldCtx = {
    values, set, doc, missing, errors, cnpj, onCnpj,
    locked: (k) => k === rzKey && cnpj.state === "active",
    lockName: true,
  };

  /** Valida e grava os itens informados. Lança Error com mensagem amigável quando algo bloqueia. */
  const save = useCallback(async (groups: GroupDef[], extraCompany: Record<string, unknown> = {}) => {
    const errs: Record<string, string> = {};
    for (const g of groups) Object.assign(errs, validateGroup(g, values, doc));
    const hasCnpj = groups.some((g) => g.fields.some((f) => f.kind === "cnpj" && (!f.docs || f.docs === doc)));
    const cnpjKey = scope === "user" ? "u_cnpj" : "c_cnpj";
    if (hasCnpj && values[cnpjKey]) {
      if (cnpj.state === "checking") throw new Error("Aguarde a consulta do CNPJ na Receita Federal.");
      if (cnpj.state === "inactive") errs[cnpjKey] = `Não é possível salvar: CNPJ ${String(cnpj.info?.status ?? "inativo").toLowerCase()} na Receita`;
      if (cnpj.state === "notfound") errs[cnpjKey] = "CNPJ não encontrado na Receita Federal";
    }
    if (Object.keys(errs).length) { setErrors(errs); throw new Error("Corrija os campos destacados."); }
    const status = cnpj.state === "active" ? "ATIVA" : cnpj.state === "unavailable" ? "unverified" : null;
    const merged = { profile: {} as Record<string, unknown>, sensitive: {} as Record<string, string | null>, company: { ...extraCompany } as Record<string, unknown> };
    const base = { address: { ...(profile?.address ?? {}) } as Record<string, string>, addr: { ...(comp.data?.addr ?? {}) } as Record<string, string>, eaddr: { ...(profile?.emergency_address ?? {}) } as Record<string, string> };
    for (const g of groups) {
      const p = planSave(g, values, doc, base, status);
      Object.assign(merged.profile, p.profile); Object.assign(merged.sensitive, p.sensitive); Object.assign(merged.company, p.company);
      if (p.profile.address) base.address = p.profile.address as Record<string, string>;
      if (p.profile.emergency_address) base.eaddr = p.profile.emergency_address as Record<string, string>;
      if (p.company.addr) base.addr = p.company.addr as Record<string, string>;
    }
    if (scope === "user") {
      if (Object.keys(merged.profile).length) await updateMyProfile(merged.profile);
      if (Object.keys(merged.sensitive).length) await saveMySensitive(profile!.id, merged.sensitive);
      await refresh();
      await qc.invalidateQueries({ queryKey: ["ix-sens"] });
    } else {
      if (Object.keys(merged.company).length) await saveCompany(merged.company);
      await qc.invalidateQueries({ queryKey: ["company"] });
    }
    return qc.fetchQuery({ queryKey: [PENDING_KEY, uid], queryFn: getMyPending, staleTime: 0 });
  }, [values, doc, cnpj, scope, profile, comp.data, refresh, qc, uid]);

  const error = (scope === "user" ? sens.error : comp.error) as Error | null;
  return { ready, values, set, doc, setDoc, ctx, errors, missing, pending: pend.data, required: req.data ?? [], save, error, loading: !ready && !error };
}

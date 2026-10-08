import { useEffect, useState } from "react";
import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { cm } from "@/lib/comercial/api";
import { mesCurto, mesLabel } from "@/lib/comercial/format";
import { Definir, DefinirLock, ErrorBox, Shell, StepTabs, TravadoStrip, STEPS, type MesOpt, type Step } from "../kit";
import { StepFoot } from "./ui";
import { GanhoStep, MetaStep, OperacaoStep, PesosStep, ProjecaoStep } from "./steps";
import { ETAPAS, type Etapa, type MonthsList, type Preview, type Projecao, type Rules, type RulesGet } from "./types";

const SLUG: Record<Step, Etapa> = { Meta: "meta", Pesos: "pesos", Ganho: "ganho", Operação: "operacao", Projeção: "projecao" };
const useDebounced = <T,>(v: T, ms = 400) => {
  const [d, setD] = useState(v);
  useEffect(() => { const t = setTimeout(() => setD(v), ms); return () => clearTimeout(t); }, [v, ms]);
  return d;
};

/** Container das 5 etapas de Parâmetros: rascunho local, prévia/validação/projeção via RPC e rodapé de etapa. */
export const Editor = ({ etapa, months, rg, list }: { etapa: Etapa; months: string[]; rg: RulesGet; list: MonthsList }) => {
  const nav = useNavigate(); const qc = useQueryClient(); const { role } = useAuth();
  const [rules, setRules] = useState<Rules>(rg.rules);
  const [dirty, setDirty] = useState(false);
  const [fail, setFail] = useState<string | null>(null);
  const ro = rg.locked;
  const set = (fn: (r: Rules) => void) => { setRules((r) => { const c = structuredClone(r); fn(c); return c; }); setDirty(true); setFail(null); };
  const dRules = useDebounced(rules);
  const key = JSON.stringify(dRules);
  const qs = `?meses=${months.join(",")}`;

  const prev = useQuery({ queryKey: ["cm", "preview", months[0], key], queryFn: () => cm<Preview>("cm_preview", { p_month: months[0], p_rules: dRules }), placeholderData: keepPreviousData });
  const val = useQuery({
    queryKey: ["cm", "validate", key], enabled: !ro, staleTime: Infinity,
    queryFn: async () => { try { await cm("cm_validate_rules", { r: dRules }); return null; } catch (e) { return (e as Error).message; } },
  });
  const proj = useQuery({ queryKey: ["cm", "proj", months.join(), key], enabled: etapa === "projecao", queryFn: () => cm<Projecao>("cm_projecao", { p_months: months, p_rules: dRules }), placeholderData: keepPreviousData });

  const msg = !ro && dRules === rules ? val.data ?? null : null;
  const stepErr = etapa === "operacao" ? !!msg && /prazo/i.test(msg) : etapa === "pesos" ? !!msg && /pesos|bruto/i.test(msg) : etapa === "meta" ? !!msg && /custo/i.test(msg) : false;
  const maxDias = Number(/máximo (\d+) dias/.exec(msg ?? "")?.[1] ?? rules.operacao.bonus - 1);

  const saveDraft = async (force = false) => {
    if (ro || (!dirty && !force)) return;
    await cm("cm_draft_save", { p_months: months, p_rules: rules });
    setDirty(false);
    qc.invalidateQueries({ queryKey: ["cm", "rules"] });
  };
  const go = async (e: Etapa, ms = months) => {
    try { await saveDraft(); nav(`/intranet/parametros/${e}?meses=${ms.join(",")}`); } catch (x) { setFail((x as Error).message); }
  };
  const idx = ETAPAS.indexOf(etapa);

  const publish = useMutation({
    mutationFn: async () => { await saveDraft(true); await cm("cm_publish", { p_months: months }); },
    onSuccess: () => { qc.invalidateQueries({ queryKey: ["cm"] }); nav("/intranet/meses"); },
    onError: (e) => setFail((e as Error).message),
  });
  const request = useMutation({
    mutationFn: () => cm("cm_request_unlock", { p_month: months[0] }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cm", "rules"] }),
    onError: (e) => setFail((e as Error).message),
  });
  const authorize = useMutation({
    mutationFn: () => cm("cm_decide_unlock", { p_month: months[0], p_approve: true }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["cm"] }),
    onError: (e) => setFail((e as Error).message),
  });

  const opts: MesOpt[] = list.rows.map((r) => ({
    month: r.month, label: mesLabel(r.month), locked: r.locked,
    tag: r.locked ? "travado" : r.status === "programado" ? "programado" : r.status === "sem_regras" ? "sem regras" : undefined,
  }));
  const step = STEPS[idx];
  const nextStep = STEPS[idx + 1];

  let footer;
  if (ro) {
    const admin = role === "admin";
    footer = (
      <StepFoot note={fail ?? `${mesCurto(months[0])} · Somente leitura`} noteRose={!!fail} next outline={!admin}
        nextLabel={admin ? "Autorizar alteração" : rg.pending_unlock || request.isSuccess ? "Pedido enviado ao admin" : "Pedir autorização ao admin"}
        nextDisabled={!admin && (rg.pending_unlock || request.isSuccess)} nextBusy={request.isPending || authorize.isPending}
        onNext={() => (admin ? authorize.mutate() : request.mutate())} />
    );
  } else if (etapa === "projecao") {
    footer = (
      <StepFoot note={fail ?? msg ?? "Rascunho · ainda não vale para os vendedores"} noteRose={!!(fail ?? msg)} back next onBack={() => go(ETAPAS[idx - 1])}
        nextLabel={`Salvar e Publicar para ${months.length} ${months.length === 1 ? "Mês" : "Meses"}`} nextDisabled={!!msg} nextBusy={publish.isPending} onNext={() => publish.mutate()} />
    );
  } else {
    footer = (
      <StepFoot note={fail ?? "Rascunho · ainda não vale para os vendedores"} noteRose={!!fail} back={idx > 0} next onBack={() => go(ETAPAS[idx - 1])}
        nextLabel={`Próximo · ${nextStep}`} nextDisabled={stepErr} onNext={() => go(ETAPAS[idx + 1])} />
    );
  }

  const p = { rules, set, ro };
  return (
    <Shell title="Parâmetros das Metas" back="/intranet/metas" footer={footer}>
      {ro
        ? <DefinirLock label={mesLabel(months[0])} />
        : <Definir opts={opts} value={months} onChange={async (ms) => { try { await saveDraft(); nav(`/intranet/parametros/${etapa}?meses=${ms.join(",")}`); } catch (x) { setFail((x as Error).message); } }} />}
      <StepTabs active={step} onGo={(s) => go(SLUG[s])} />
      {ro && <TravadoStrip desde={`${rg.locked_since.slice(8, 10)}/${rg.locked_since.slice(5, 7)}`} />}
      {prev.error && <ErrorBox e={prev.error} />}
      {etapa === "meta" && <MetaStep {...p} prev={prev.data} />}
      {etapa === "pesos" && <PesosStep {...p} prev={prev.data} rg={rg} onVariacoes={() => nav("/intranet/produtos")} />}
      {etapa === "ganho" && <GanhoStep {...p} />}
      {etapa === "operacao" && <OperacaoStep {...p} rg={rg} err={stepErr} max={maxDias} />}
      {etapa === "projecao" && <ProjecaoStep data={proj.data} />}
    </Shell>
  );
};
